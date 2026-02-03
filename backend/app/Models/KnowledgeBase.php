<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Traits\BelongsToTenant;

class KnowledgeBase extends Model
{
    use SoftDeletes, BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'title',
        'type',
        'original_content',
        'file_path',
        'source_url',
        'file_size',
        'mime_type',
        'status',
        'chunks_count',
        'error_message',
        'processed_at',
    ];

    protected function casts(): array
    {
        return [
            'processed_at' => 'datetime',
            'file_size' => 'integer',
            'chunks_count' => 'integer',
        ];
    }

    // ================================================
    // RELATIONSHIPS
    // ================================================

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function chunks(): HasMany
    {
        return $this->hasMany(KbChunk::class);
    }

    // ================================================
    // SCOPES
    // ================================================

    public function scopeReady($query)
    {
        return $query->where('status', 'ready');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    // ================================================
    // HELPERS
    // ================================================

    public function isReady(): bool
    {
        return $this->status === 'ready';
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isProcessing(): bool
    {
        return $this->status === 'processing';
    }

    public function hasError(): bool
    {
        return $this->status === 'error';
    }

    public function markAsProcessing(): void
    {
        $this->update(['status' => 'processing']);
    }

    public function markAsReady(int $chunksCount): void
    {
        $this->update([
            'status' => 'ready',
            'chunks_count' => $chunksCount,
            'processed_at' => now(),
            'error_message' => null,
        ]);
    }

    public function markAsError(string $message): void
    {
        $this->update([
            'status' => 'error',
            'error_message' => $message,
        ]);
    }

    public function getTypeLabel(): string
    {
        return match($this->type) {
            'file' => 'File caricato',
            'text' => 'Testo manuale',
            'url' => 'Pagina web',
            'website_scan' => 'Scansione sito',
            default => $this->type,
        };
    }

    public function getStatusLabel(): string
    {
        return match($this->status) {
            'pending' => 'In attesa',
            'processing' => 'Elaborazione...',
            'ready' => 'Pronto',
            'error' => 'Errore',
            default => $this->status,
        };
    }
}
