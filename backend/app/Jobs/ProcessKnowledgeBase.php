<?php

namespace App\Jobs;

use App\Models\KbChunk;
use App\Models\KnowledgeBase;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Smalot\PdfParser\Parser as PdfParser;

class ProcessKnowledgeBase implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 60;

    public function __construct(
        public KnowledgeBase $knowledgeBase
    ) {}

    public function handle(): void
    {
        try {
            $this->knowledgeBase->update(['status' => 'processing']);

            // Estrai il testo in base al tipo
            $text = $this->extractText();

            if (empty($text)) {
                throw new \Exception('Nessun testo estratto dal documento.');
            }

            // Splitta in chunks
            $chunks = $this->splitIntoChunks($text);

            // Elimina i chunks esistenti
            $this->knowledgeBase->chunks()->delete();

            // Crea nuovi chunks
            foreach ($chunks as $index => $chunkContent) {
                KbChunk::create([
                    'knowledge_base_id' => $this->knowledgeBase->id,
                    'content' => $chunkContent,
                    'content_hash' => hash('sha256', $chunkContent),
                    'tokens_count' => $this->estimateTokens($chunkContent),
                    'metadata' => [
                        'source' => $this->knowledgeBase->title,
                        'chunk_index' => $index,
                    ],
                ]);
            }

            $this->knowledgeBase->update([
                'status' => 'ready',
                'chunks_count' => count($chunks),
                'processed_at' => now(),
                'error_message' => null,
            ]);

            Log::info("KnowledgeBase {$this->knowledgeBase->id} processed successfully with " . count($chunks) . " chunks");

        } catch (\Exception $e) {
            Log::error("Error processing KnowledgeBase {$this->knowledgeBase->id}: " . $e->getMessage());

            $this->knowledgeBase->update([
                'status' => 'failed',
                'error_message' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    protected function extractText(): string
    {
        return match ($this->knowledgeBase->type) {
            'text' => $this->knowledgeBase->original_content ?? '',
            'file' => $this->extractFromFile(),
            'url' => $this->extractFromUrl(),
            default => '',
        };
    }

    protected function extractFromFile(): string
    {
        $path = $this->knowledgeBase->file_path;
        $fullPath = Storage::disk('local')->path($path);

        if (!file_exists($fullPath)) {
            throw new \Exception('File non trovato.');
        }

        $extension = strtolower(pathinfo($path, PATHINFO_EXTENSION));

        return match ($extension) {
            'txt' => file_get_contents($fullPath),
            'pdf' => $this->extractFromPdf($fullPath),
            'doc', 'docx' => $this->extractFromWord($fullPath),
            default => throw new \Exception("Formato file non supportato: {$extension}"),
        };
    }

    protected function extractFromPdf(string $path): string
    {
        // Usa smalot/pdfparser se disponibile
        if (class_exists(PdfParser::class)) {
            $parser = new PdfParser();
            $pdf = $parser->parseFile($path);
            return $pdf->getText();
        }

        // Fallback: usa pdftotext se disponibile
        $output = [];
        $returnCode = 0;
        exec("pdftotext -layout '{$path}' -", $output, $returnCode);

        if ($returnCode !== 0) {
            throw new \Exception('Impossibile estrarre testo dal PDF. Installare poppler-utils o smalot/pdfparser.');
        }

        return implode("\n", $output);
    }

    protected function extractFromWord(string $path): string
    {
        // Per docx, possiamo usare un semplice parsing XML
        $extension = strtolower(pathinfo($path, PATHINFO_EXTENSION));

        if ($extension === 'docx') {
            $zip = new \ZipArchive();
            if ($zip->open($path) === true) {
                $content = $zip->getFromName('word/document.xml');
                $zip->close();

                if ($content) {
                    // Rimuovi i tag XML e mantieni solo il testo
                    $text = strip_tags(str_replace('<', ' <', $content));
                    return preg_replace('/\s+/', ' ', $text);
                }
            }
        }

        throw new \Exception('Impossibile estrarre testo dal file Word.');
    }

    protected function extractFromUrl(): string
    {
        $url = $this->knowledgeBase->url;

        $response = Http::timeout(30)->get($url);

        if (!$response->successful()) {
            throw new \Exception("Impossibile scaricare la pagina: HTTP {$response->status()}");
        }

        $html = $response->body();

        // Rimuovi script, style e altri elementi non testuali
        $html = preg_replace('/<script[^>]*>.*?<\/script>/is', '', $html);
        $html = preg_replace('/<style[^>]*>.*?<\/style>/is', '', $html);
        $html = preg_replace('/<nav[^>]*>.*?<\/nav>/is', '', $html);
        $html = preg_replace('/<footer[^>]*>.*?<\/footer>/is', '', $html);
        $html = preg_replace('/<header[^>]*>.*?<\/header>/is', '', $html);

        // Converti in testo
        $text = strip_tags($html);
        $text = html_entity_decode($text, ENT_QUOTES | ENT_HTML5, 'UTF-8');
        $text = preg_replace('/\s+/', ' ', $text);

        return trim($text);
    }

    protected function splitIntoChunks(string $text, int $maxTokens = 500): array
    {
        $chunks = [];
        $paragraphs = preg_split('/\n\s*\n/', $text);

        $currentChunk = '';
        $currentTokens = 0;

        foreach ($paragraphs as $paragraph) {
            $paragraph = trim($paragraph);
            if (empty($paragraph)) {
                continue;
            }

            $paragraphTokens = $this->estimateTokens($paragraph);

            // Se il paragrafo da solo supera il limite, spezzalo
            if ($paragraphTokens > $maxTokens) {
                if (!empty($currentChunk)) {
                    $chunks[] = trim($currentChunk);
                    $currentChunk = '';
                    $currentTokens = 0;
                }

                // Splitta per frasi
                $sentences = preg_split('/(?<=[.!?])\s+/', $paragraph);
                foreach ($sentences as $sentence) {
                    $sentenceTokens = $this->estimateTokens($sentence);
                    if ($currentTokens + $sentenceTokens > $maxTokens && !empty($currentChunk)) {
                        $chunks[] = trim($currentChunk);
                        $currentChunk = '';
                        $currentTokens = 0;
                    }
                    $currentChunk .= ' ' . $sentence;
                    $currentTokens += $sentenceTokens;
                }
            } elseif ($currentTokens + $paragraphTokens > $maxTokens) {
                // Salva chunk corrente e inizia nuovo
                $chunks[] = trim($currentChunk);
                $currentChunk = $paragraph;
                $currentTokens = $paragraphTokens;
            } else {
                // Aggiungi al chunk corrente
                $currentChunk .= "\n\n" . $paragraph;
                $currentTokens += $paragraphTokens;
            }
        }

        // Aggiungi ultimo chunk
        if (!empty(trim($currentChunk))) {
            $chunks[] = trim($currentChunk);
        }

        return $chunks;
    }

    protected function estimateTokens(string $text): int
    {
        // Stima approssimativa: ~4 caratteri per token per l'inglese
        // Per l'italiano, usiamo ~3.5 caratteri per token
        return (int) ceil(mb_strlen($text) / 3.5);
    }
}
