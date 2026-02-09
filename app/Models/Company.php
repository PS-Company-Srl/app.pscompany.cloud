<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
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
    ];

    protected static function booted(): void
    {
        static::creating(function (Company $company): void {
            if (empty($company->slug)) {
                $company->slug = Str::slug($company->name);
            }
        });
    }

    public function chatbots(): HasMany
    {
        return $this->hasMany(Chatbot::class);
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
}
