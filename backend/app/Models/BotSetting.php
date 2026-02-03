<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BotSetting extends Model
{
    protected $fillable = [
        'tenant_id',
        'system_prompt',
        'welcome_message',
        'fallback_message',
        'fallback_action',
        'lead_goal',
        'trigger_delay',
        'trigger_message',
        'widget_position',
        'widget_colors',
        'openai_model',
        'temperature',
        'max_tokens',
    ];

    protected function casts(): array
    {
        return [
            'widget_colors' => 'array',
            'temperature' => 'float',
            'trigger_delay' => 'integer',
            'max_tokens' => 'integer',
        ];
    }

    // ================================================
    // RELATIONSHIPS
    // ================================================

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    // ================================================
    // ACCESSORS
    // ================================================

    public function getWidgetConfigAttribute(): array
    {
        return [
            'position' => $this->widget_position,
            'colors' => $this->widget_colors ?? $this->getDefaultColors(),
            'triggerDelay' => $this->trigger_delay,
            'triggerMessage' => $this->trigger_message,
            'welcomeMessage' => $this->welcome_message,
            'companyName' => $this->tenant->company_name,
        ];
    }

    // ================================================
    // HELPERS
    // ================================================

    public function getDefaultColors(): array
    {
        return [
            'primary' => '#0066FF',
            'secondary' => '#FFFFFF',
            'text' => '#333333',
            'userBubble' => '#0066FF',
            'botBubble' => '#F0F0F0',
        ];
    }

    public function buildSystemPromptWithContext(string $knowledgeContext = ''): string
    {
        $prompt = $this->system_prompt;

        if (!empty($knowledgeContext)) {
            $prompt .= "\n\n--- INFORMAZIONI DALLA KNOWLEDGE BASE ---\n";
            $prompt .= $knowledgeContext;
            $prompt .= "\n--- FINE KNOWLEDGE BASE ---";
        }

        if (!empty($this->fallback_message)) {
            $prompt .= "\n\nSe non trovi la risposta nella knowledge base, rispondi: \"{$this->fallback_message}\"";
        }

        if (!empty($this->lead_goal)) {
            $prompt .= "\n\nOBIETTIVO LEAD: {$this->lead_goal}";
        }

        return $prompt;
    }
}
