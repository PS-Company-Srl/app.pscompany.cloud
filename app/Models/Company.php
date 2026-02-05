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
        'phone',
        'address',
        'api_key',
    ];

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
     * Testo estratto dai documenti da usare come contesto per il chatbot (max caratteri per limitare token).
     */
    public function getKnowledgeContext(int $maxChars = 12000): string
    {
        $texts = $this->documents()
            ->whereNotNull('extracted_text')
            ->where('extracted_text', '!=', '')
            ->pluck('extracted_text');

        $combined = $texts->implode("\n\n---\n\n");
        return mb_substr($combined, 0, $maxChars);
    }

    public function documents(): HasMany
    {
        return $this->hasMany(CompanyDocument::class);
    }
}
