<?php

namespace App\Services;

use App\Models\KbChunk;
use App\Models\KnowledgeBase;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class RagService
{
    /**
     * Cerca chunks rilevanti nella knowledge base
     */
    public function search(int $tenantId, string $query, int $limit = 5): Collection
    {
        // Recupera tutti i chunks del tenant
        $chunks = KbChunk::whereHas('knowledgeBase', function ($q) use ($tenantId) {
            $q->where('tenant_id', $tenantId)
              ->where('status', 'ready');
        })->get();

        if ($chunks->isEmpty()) {
            return collect();
        }

        // Se non ci sono embedding, usa ricerca keyword semplice
        $hasEmbeddings = $chunks->first()->embedding !== null;

        if ($hasEmbeddings) {
            return $this->semanticSearch($chunks, $query, $limit);
        }

        return $this->keywordSearch($chunks, $query, $limit);
    }

    /**
     * Ricerca semantica con embedding
     */
    private function semanticSearch(Collection $chunks, string $query, int $limit): Collection
    {
        // Genera embedding per la query
        $queryEmbedding = $this->getEmbedding($query);

        if (empty($queryEmbedding)) {
            return $this->keywordSearch($chunks, $query, $limit);
        }

        // Calcola similarità per ogni chunk
        $results = $chunks->map(function ($chunk) use ($queryEmbedding) {
            $similarity = $chunk->cosineSimilarity($queryEmbedding);
            $chunk->similarity_score = $similarity;
            return $chunk;
        })
        ->sortByDesc('similarity_score')
        ->take($limit)
        ->filter(fn($c) => $c->similarity_score > 0.3); // Soglia minima

        return $results->values();
    }

    /**
     * Ricerca keyword fallback (quando non ci sono embedding)
     */
    private function keywordSearch(Collection $chunks, string $query, int $limit): Collection
    {
        $queryWords = $this->tokenize($query);

        if (empty($queryWords)) {
            return collect();
        }

        return $chunks->map(function ($chunk) use ($queryWords) {
            $contentWords = $this->tokenize($chunk->content);
            $matches = count(array_intersect($queryWords, $contentWords));
            $chunk->similarity_score = $matches / max(count($queryWords), 1);
            return $chunk;
        })
        ->sortByDesc('similarity_score')
        ->take($limit)
        ->filter(fn($c) => $c->similarity_score > 0)
        ->values();
    }

    /**
     * Tokenizza testo in parole
     */
    private function tokenize(string $text): array
    {
        $text = mb_strtolower($text);
        $text = preg_replace('/[^\p{L}\p{N}\s]/u', ' ', $text);
        $words = preg_split('/\s+/', $text, -1, PREG_SPLIT_NO_EMPTY);
        
        // Rimuovi stop words italiane comuni
        $stopWords = ['il', 'lo', 'la', 'i', 'gli', 'le', 'un', 'uno', 'una', 
                      'di', 'a', 'da', 'in', 'con', 'su', 'per', 'tra', 'fra',
                      'e', 'o', 'ma', 'se', 'che', 'non', 'è', 'sono', 'come',
                      'the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'to'];
        
        return array_values(array_diff($words, $stopWords));
    }

    /**
     * Genera embedding tramite OpenAI
     */
    public function getEmbedding(string $text): array
    {
        $cacheKey = 'embedding_' . md5($text);
        
        return Cache::remember($cacheKey, 3600, function () use ($text) {
            try {
                $response = Http::withHeaders([
                    'Authorization' => 'Bearer ' . config('services.openai.api_key'),
                    'Content-Type' => 'application/json',
                ])->post('https://api.openai.com/v1/embeddings', [
                    'model' => 'text-embedding-3-small',
                    'input' => $text,
                ]);

                if ($response->successful()) {
                    return $response->json('data.0.embedding', []);
                }

                Log::warning('OpenAI Embedding API error', [
                    'status' => $response->status(),
                ]);

                return [];
            } catch (\Exception $e) {
                Log::error('Embedding generation failed', ['error' => $e->getMessage()]);
                return [];
            }
        });
    }

    /**
     * Processa un documento e genera chunks con embedding
     */
    public function processKnowledgeBase(KnowledgeBase $knowledgeBase): void
    {
        $knowledgeBase->markAsProcessing();

        try {
            $content = $this->extractContent($knowledgeBase);
            $chunks = $this->splitIntoChunks($content);

            // Elimina vecchi chunks
            $knowledgeBase->chunks()->delete();

            // Crea nuovi chunks
            foreach ($chunks as $index => $chunkContent) {
                $embedding = $this->getEmbedding($chunkContent);

                $knowledgeBase->chunks()->create([
                    'content' => $chunkContent,
                    'content_hash' => hash('sha256', $chunkContent),
                    'embedding' => !empty($embedding) ? $embedding : null,
                    'metadata' => [
                        'source' => $knowledgeBase->title,
                        'chunk_index' => $index,
                    ],
                    'tokens_count' => $this->estimateTokens($chunkContent),
                ]);
            }

            $knowledgeBase->markAsReady(count($chunks));

        } catch (\Exception $e) {
            Log::error('Knowledge base processing failed', [
                'kb_id' => $knowledgeBase->id,
                'error' => $e->getMessage(),
            ]);
            
            $knowledgeBase->markAsError($e->getMessage());
        }
    }

    /**
     * Estrae contenuto testuale
     */
    private function extractContent(KnowledgeBase $knowledgeBase): string
    {
        switch ($knowledgeBase->type) {
            case 'text':
                return $knowledgeBase->original_content ?? '';

            case 'file':
                // TODO: Implementare estrazione da PDF/Word
                return $knowledgeBase->original_content ?? '';

            case 'url':
                // TODO: Implementare scraping URL
                return $knowledgeBase->original_content ?? '';

            default:
                return $knowledgeBase->original_content ?? '';
        }
    }

    /**
     * Divide il contenuto in chunks
     */
    private function splitIntoChunks(string $content, int $maxTokens = 500): array
    {
        $paragraphs = preg_split('/\n\s*\n/', $content, -1, PREG_SPLIT_NO_EMPTY);
        $chunks = [];
        $currentChunk = '';

        foreach ($paragraphs as $paragraph) {
            $paragraph = trim($paragraph);
            if (empty($paragraph)) continue;

            $potentialChunk = $currentChunk 
                ? $currentChunk . "\n\n" . $paragraph 
                : $paragraph;

            if ($this->estimateTokens($potentialChunk) <= $maxTokens) {
                $currentChunk = $potentialChunk;
            } else {
                if (!empty($currentChunk)) {
                    $chunks[] = $currentChunk;
                }
                $currentChunk = $paragraph;
            }
        }

        if (!empty($currentChunk)) {
            $chunks[] = $currentChunk;
        }

        return $chunks;
    }

    /**
     * Stima numero di token
     */
    private function estimateTokens(string $text): int
    {
        // Approssimazione: ~1.3 token per parola in italiano
        return (int) (str_word_count($text) * 1.3);
    }
}
