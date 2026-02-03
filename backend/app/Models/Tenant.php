<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Str;

class Tenant extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'slug',
        'domain',
        'api_key',
        'whatsapp_phone_id',
        'whatsapp_business_id',
        'whatsapp_access_token',
        'settings',
        'monthly_message_limit',
        'messages_used_this_month',
        'plan',
        'status',
        'trial_ends_at',
    ];

    protected function casts(): array
    {
        return [
            'settings' => 'array',
            'trial_ends_at' => 'datetime',
            'whatsapp_access_token' => 'encrypted',
        ];
    }

    // ================================================
    // BOOT
    // ================================================
    
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($tenant) {
            if (empty($tenant->api_key)) {
                $tenant->api_key = 'pk_live_' . Str::random(32);
            }
            if (empty($tenant->slug)) {
                $tenant->slug = Str::slug($tenant->name);
            }
        });
    }

    // ================================================
    // RELATIONSHIPS
    // ================================================

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function owner(): HasOne
    {
        return $this->hasOne(User::class)->where('role', 'owner');
    }

    public function botSettings(): HasOne
    {
        return $this->hasOne(BotSetting::class);
    }

    public function knowledgeBases(): HasMany
    {
        return $this->hasMany(KnowledgeBase::class);
    }

    public function conversations(): HasMany
    {
        return $this->hasMany(Conversation::class);
    }

    public function leads(): HasMany
    {
        return $this->hasMany(Lead::class);
    }

    public function apiUsage(): HasMany
    {
        return $this->hasMany(ApiUsage::class);
    }

    // ================================================
    // ACCESSORS
    // ================================================

    public function getCompanyNameAttribute(): string
    {
        return $this->settings['company_name'] ?? $this->name;
    }

    public function getPanelUrlAttribute(): string
    {
        return "https://{$this->slug}.pscompany.cloud";
    }

    public function getWidgetUrlAttribute(): string
    {
        return "https://cdn.pscompany.cloud/widget.js?key={$this->api_key}";
    }

    // ================================================
    // HELPERS
    // ================================================

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function isTrial(): bool
    {
        return $this->status === 'trial';
    }

    public function isTrialExpired(): bool
    {
        return $this->isTrial() && $this->trial_ends_at?->isPast();
    }

    public function hasReachedMessageLimit(): bool
    {
        return $this->messages_used_this_month >= $this->monthly_message_limit;
    }

    public function getRemainingMessages(): int
    {
        return max(0, $this->monthly_message_limit - $this->messages_used_this_month);
    }

    public function incrementMessageCount(int $count = 1): void
    {
        $this->increment('messages_used_this_month', $count);
    }

    public function resetMonthlyUsage(): void
    {
        $this->update(['messages_used_this_month' => 0]);
    }

    public function regenerateApiKey(): string
    {
        $this->api_key = 'pk_live_' . Str::random(32);
        $this->save();
        
        return $this->api_key;
    }
}
