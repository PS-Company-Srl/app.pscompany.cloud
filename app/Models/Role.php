<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Role extends Model
{
    protected $fillable = ['name'];

    public const NAME_ADMIN = 'admin';
    public const NAME_CUSTOMER = 'customer';

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }
}
