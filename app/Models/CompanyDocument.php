<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class CompanyDocument extends Model
{
    protected $fillable = [
        'company_id',
        'name',
        'file_path',
        'mime_type',
        'file_size',
        'extracted_text',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function getExtension(): string
    {
        return pathinfo($this->name, PATHINFO_EXTENSION);
    }

    public function isPdf(): bool
    {
        return strtolower($this->getExtension()) === 'pdf'
            || ($this->mime_type && str_contains($this->mime_type, 'pdf'));
    }

    public function isWord(): bool
    {
        $ext = strtolower($this->getExtension());
        return in_array($ext, ['doc', 'docx'], true)
            || ($this->mime_type && str_contains($this->mime_type, 'word'));
    }

    protected static function booted(): void
    {
        static::deleting(function (CompanyDocument $doc): void {
            if ($doc->file_path && Storage::disk('local')->exists($doc->file_path)) {
                Storage::disk('local')->delete($doc->file_path);
            }
        });
    }
}
