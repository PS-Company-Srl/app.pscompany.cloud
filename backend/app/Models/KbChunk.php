<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class KbChunk extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'knowledge_base_id',
        'content',
        'content_hash',
        'embedding',
        'metadata',
        'tokens_count',
    ];

    protected function casts(): array
    {
        return [
            'embedding' => 'array',
            'metadata' => 'array',
            'tokens_count' => 'integer',
            'created_at' => 'datetime',
        ];
    }

    // ================================================
    // RELATIONSHIPS
    // ================================================

    public function knowledgeBase(): BelongsTo
    {
        return $this->belongsTo(KnowledgeBase::class);
    }

    // ================================================
    // HELPERS
    // ================================================

    public function getSourceName(): string
    {
        return $this->metadata['source'] ?? $this->knowledgeBase->title ?? 'Unknown';
    }

    /**
     * Calcola la similarità coseno con un altro embedding
     */
    public function cosineSimilarity(array $otherEmbedding): float
    {
        if (empty($this->embedding) || empty($otherEmbedding)) {
            return 0.0;
        }

        $dotProduct = 0.0;
        $normA = 0.0;
        $normB = 0.0;

        foreach ($this->embedding as $i => $val) {
            $dotProduct += $val * ($otherEmbedding[$i] ?? 0);
            $normA += $val * $val;
            $normB += ($otherEmbedding[$i] ?? 0) * ($otherEmbedding[$i] ?? 0);
        }

        $normA = sqrt($normA);
        $normB = sqrt($normB);

        if ($normA == 0 || $normB == 0) {
            return 0.0;
        }

        return $dotProduct / ($normA * $normB);
    }
}
