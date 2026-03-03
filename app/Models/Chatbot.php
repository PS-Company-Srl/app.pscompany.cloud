<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class Chatbot extends Model
{
    protected $fillable = [
        'company_id',
        'name',
        'slug',
        'api_key',
        'openai_api_key',
        'goal_type',
        'custom_goal',
        'widget_primary_color',
        'widget_position',
        'widget_icon',
        'widget_welcome_message',
        'widget_auto_open_after_seconds',
    ];

    public const GOAL_ASSISTANT = 'assistant';
    public const GOAL_LEAD_CAPTURE = 'lead_capture';
    public const GOAL_CUSTOM = 'custom';

    public const GOAL_TYPES = [
        self::GOAL_ASSISTANT => 'Solo assistente',
        self::GOAL_LEAD_CAPTURE => 'Assistente + raccolta email e telefono',
        self::GOAL_CUSTOM => 'Obiettivo personalizzato (testo del cliente)',
    ];

    public const WIDGET_POSITIONS = ['bottom-right', 'bottom-left'];

    protected $appends = ['widget_icon_url'];

    protected $hidden = ['openai_api_key'];

    protected static function booted(): void
    {
        static::creating(function (Chatbot $chatbot): void {
            if (empty($chatbot->slug)) {
                $chatbot->slug = Str::slug($chatbot->name);
            }
            if (empty($chatbot->api_key)) {
                $chatbot->api_key = 'ck_' . Str::random(40);
            }
        });
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function conversations(): HasMany
    {
        return $this->hasMany(Conversation::class);
    }

    public function getWidgetIconUrlAttribute(): ?string
    {
        if (empty($this->widget_icon) || ! Storage::disk('public')->exists($this->widget_icon)) {
            return null;
        }
        return url(Storage::disk('public')->url($this->widget_icon));
    }
}
