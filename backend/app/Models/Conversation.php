<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use App\Traits\BelongsToTenant;

class Conversation extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'channel',
        'session_id',
        'visitor_info',
        'status',
        'lead_captured',
        'messages_count',
        'total_tokens',
        'started_at',
        'last_message_at',
    ];

    protected function casts(): array
    {
        return [
            'visitor_info' => 'array',
            'lead_captured' => 'boolean',
            'messages_count' => 'integer',
            'total_tokens' => 'integer',
            'started_at' => 'datetime',
            'last_message_at' => 'datetime',
        ];
    }

    // ================================================
    // RELATIONSHIPS
    // ================================================

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function messages(): HasMany
    {
        return $this->hasMany(Message::class)->orderBy('created_at', 'asc');
    }

    public function lead(): HasOne
    {
        return $this->hasOne(Lead::class);
    }

    // ================================================
    // SCOPES
    // ================================================

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeFromWeb($query)
    {
        return $query->where('channel', 'web');
    }

    public function scopeFromWhatsapp($query)
    {
        return $query->where('channel', 'whatsapp');
    }

    public function scopeRecent($query, int $days = 7)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }

    // ================================================
    // ACCESSORS
    // ================================================

    public function getVisitorNameAttribute(): ?string
    {
        return $this->visitor_info['whatsapp_name'] 
            ?? $this->visitor_info['name'] 
            ?? null;
    }

    public function getVisitorPhoneAttribute(): ?string
    {
        return $this->visitor_info['whatsapp_phone'] ?? null;
    }

    public function getVisitorLocationAttribute(): ?string
    {
        $city = $this->visitor_info['city'] ?? null;
        $country = $this->visitor_info['country'] ?? null;
        
        if ($city && $country) {
            return "{$city}, {$country}";
        }
        
        return $city ?? $country;
    }

    public function getChannelLabelAttribute(): string
    {
        return match($this->channel) {
            'web' => 'Web',
            'whatsapp' => 'WhatsApp',
            default => ucfirst($this->channel),
        };
    }

    // ================================================
    // HELPERS
    // ================================================

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function close(): void
    {
        $this->update(['status' => 'closed']);
    }

    public function archive(): void
    {
        $this->update(['status' => 'archived']);
    }

    public function markLeadCaptured(): void
    {
        $this->update(['lead_captured' => true]);
    }

    public function addMessage(string $role, string $content, ?int $tokens = null, ?string $model = null): Message
    {
        $message = $this->messages()->create([
            'role' => $role,
            'content' => $content,
            'tokens_used' => $tokens,
            'model_used' => $model,
        ]);

        $this->increment('messages_count');
        
        if ($tokens) {
            $this->increment('total_tokens', $tokens);
        }
        
        $this->update(['last_message_at' => now()]);

        return $message;
    }

    public function getRecentMessages(int $limit = 10): \Illuminate\Database\Eloquent\Collection
    {
        return $this->messages()
            ->latest('created_at')
            ->take($limit)
            ->get()
            ->reverse()
            ->values();
    }

    public function getMessagesForContext(): array
    {
        return $this->getRecentMessages()
            ->map(fn($m) => [
                'role' => $m->role,
                'content' => $m->content,
            ])
            ->toArray();
    }
}
