<?php

namespace App\Jobs;

use App\Models\CompanyDocument;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Smalot\PdfParser\Parser as PdfParser;

class ProcessCompanyDocument implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 2;

    public function __construct(
        public CompanyDocument $document
    ) {}

    public function handle(): void
    {
        $path = Storage::disk('local')->path($this->document->file_path);

        if (! file_exists($path)) {
            Log::warning("ProcessCompanyDocument: file not found {$this->document->file_path}");
            return;
        }

        $ext = strtolower(pathinfo($this->document->file_path, PATHINFO_EXTENSION));
        $text = match ($ext) {
            'pdf' => $this->extractPdf($path),
            'docx' => $this->extractDocx($path),
            'doc' => $this->extractDocx($path),
            default => null,
        };

        $this->document->update(['extracted_text' => $text ?: '']);
    }

    private function extractPdf(string $path): ?string
    {
        try {
            $parser = new PdfParser();
            $pdf = $parser->parseFile($path);
            return $pdf->getText();
        } catch (\Throwable $e) {
            Log::warning('ProcessCompanyDocument PDF extraction failed', [
                'document_id' => $this->document->id,
                'error' => $e->getMessage(),
            ]);
            return null;
        }
    }

    private function extractDocx(string $path): ?string
    {
        try {
            $zip = new \ZipArchive();
            if ($zip->open($path) !== true) {
                return null;
            }
            $xml = $zip->getFromName('word/document.xml');
            $zip->close();
            if (! $xml) {
                return null;
            }
            $text = strip_tags(str_replace(['<w:p>', '</w:p>', '<w:t>', '</w:t>'], [' ', "\n", '', ''], $xml));
            return preg_replace('/\s+/', ' ', trim($text));
        } catch (\Throwable $e) {
            Log::warning('ProcessCompanyDocument DOCX extraction failed', [
                'document_id' => $this->document->id,
                'error' => $e->getMessage(),
            ]);
            return null;
        }
    }
}
