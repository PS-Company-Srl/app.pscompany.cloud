<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Traits\BelongsToTenant;

class Lead extends Model
{
    use SoftDeletes, BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'conversation_id',
        'name',
        'email',
        'phone',
        'company',
        'source',
        'notes',
        'interest',
        'status',
    ];

    // ================================================
    // RELATIONSHIPS
    // ================================================

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function conversation(): BelongsTo
    {
        return $this->belongsTo(Conversation::class);
    }

    // ================================================
    // SCOPES
    // ================================================

    public function scopeNew($query)
    {
        return $query->where('status', 'new');
    }

    public function scopeContacted($query)
    {
        return $query->where('status', 'contacted');
    }

    public function scopeQualified($query)
    {
        return $query->where('status', 'qualified');
    }

    public function scopeFromWeb($query)
    {
        return $query->where('source', 'web');
    }

    public function scopeFromWhatsapp($query)
    {
        return $query->where('source', 'whatsapp');
    }

    // ================================================
    // ACCESSORS
    // ================================================

    public function getDisplayNameAttribute(): string
    {
        return $this->name ?? $this->email ?? $this->phone ?? 'Lead #' . $this->id;
    }

    public function getStatusLabelAttribute(): string
    {
        return match($this->status) {
            'new' => 'Nuovo',
            'contacted' => 'Contattato',
            'qualified' => 'Qualificato',
            'converted' => 'Convertito',
            'lost' => 'Perso',
            default => ucfirst($this->status),
        };
    }

    public function getStatusColorAttribute(): string
    {
        return match($this->status) {
            'new' => 'blue',
            'contacted' => 'yellow',
            'qualified' => 'purple',
            'converted' => 'green',
            'lost' => 'red',
            default => 'gray',
        };
    }

    public function getSourceLabelAttribute(): string
    {
        return match($this->source) {
            'web' => 'Sito Web',
            'whatsapp' => 'WhatsApp',
            default => ucfirst($this->source),
        };
    }

    // ================================================
    // HELPERS
    // ================================================

    public function markAsContacted(): void
    {
        $this->update(['status' => 'contacted']);
    }

    public function markAsQualified(): void
    {
        $this->update(['status' => 'qualified']);
    }

    public function markAsConverted(): void
    {
        $this->update(['status' => 'converted']);
    }

    public function markAsLost(): void
    {
        $this->update(['status' => 'lost']);
    }

    public function hasEmail(): bool
    {
        return !empty($this->email);
    }

    public function hasPhone(): bool
    {
        return !empty($this->phone);
    }

    public function hasContactInfo(): bool
    {
        return $this->hasEmail() || $this->hasPhone();
    }
}
