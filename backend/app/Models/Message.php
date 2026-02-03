<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Message extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'conversation_id',
        'role',
        'content',
        'tokens_used',
        'model_used',
        'kb_chunks_used',
        'confidence_score',
    ];

    protected function casts(): array
    {
        return [
            'kb_chunks_used' => 'array',
            'tokens_used' => 'integer',
            'confidence_score' => 'float',
            'created_at' => 'datetime',
        ];
    }

    // ================================================
    // RELATIONSHIPS
    // ================================================

    public function conversation(): BelongsTo
    {
        return $this->belongsTo(Conversation::class);
    }

    // ================================================
    // SCOPES
    // ================================================

    public function scopeFromUser($query)
    {
        return $query->where('role', 'user');
    }

    public function scopeFromAssistant($query)
    {
        return $query->where('role', 'assistant');
    }

    // ================================================
    // HELPERS
    // ================================================

    public function isFromUser(): bool
    {
        return $this->role === 'user';
    }

    public function isFromAssistant(): bool
    {
        return $this->role === 'assistant';
    }

    public function isSystem(): bool
    {
        return $this->role === 'system';
    }

    public function getRoleLabelAttribute(): string
    {
        return match($this->role) {
            'user' => 'Utente',
            'assistant' => 'Bot',
            'system' => 'Sistema',
            default => ucfirst($this->role),
        };
    }
}
