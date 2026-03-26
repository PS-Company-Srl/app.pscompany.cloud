<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CompanyOccasionItem extends Model
{
    protected $fillable = [
        'company_id',
        'showroom',
        'title',
        'price_from',
        'price_to',
        'sort_order',
        'source_url',
        'raw_block',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }
}
