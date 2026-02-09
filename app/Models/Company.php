<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class Company extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'email',
        'website',
        'website_extracted_text',
        'phone',
        'address',
        'api_key',
        'widget_primary_color',
        'widget_position',
        'widget_icon',
    ];

    /** Valori ammessi per widget_position */
    public const WIDGET_POSITIONS = ['bottom-right', 'bottom-left'];

    protected $appends = ['widget_icon_url'];

    protected static function booted(): void
    {
        static::creating(function (Company $company): void {
            if (empty($company->slug)) {
                $company->slug = Str::slug($company->name);
            }
            if (empty($company->api_key)) {
                $company->api_key = 'ck_' . Str::random(40);
            }
        });
    }

    /**
     * Contesto per il chatbot: prima il sito web (analizzato), poi i documenti caricati dall'admin.
     * Limite totale caratteri per restare nei token del modello.
     */
    public function getKnowledgeContext(int $maxCharsTotal = 14000): string
    {
        $parts = [];
        $siteText = $this->website_extracted_text ?? '';
        if ($siteText !== '') {
            $maxSite = (int) ($maxCharsTotal * 0.6);
            $parts[] = "[Contenuto dal sito web dell'azienda]\n\n" . mb_substr($siteText, 0, $maxSite);
        }

        $docTexts = $this->documents()
            ->whereNotNull('extracted_text')
            ->where('extracted_text', '!=', '')
            ->pluck('extracted_text');

        if ($docTexts->isNotEmpty()) {
            $docsCombined = $docTexts->implode("\n\n---\n\n");
            $remaining = $maxCharsTotal - mb_strlen(implode("\n\n", $parts));
            $parts[] = "[Documenti forniti dall'azienda]\n\n" . mb_substr($docsCombined, 0, max(0, $remaining));
        }

        return implode("\n\n", $parts);
    }

    public function documents(): HasMany
    {
        return $this->hasMany(CompanyDocument::class);
    }

    /** URL assoluto dell'icona widget (null se non impostata). */
    public function getWidgetIconUrlAttribute(): ?string
    {
        if (empty($this->widget_icon) || ! Storage::disk('public')->exists($this->widget_icon)) {
            return null;
        }
        return url(Storage::disk('public')->url($this->widget_icon));
    }
}
