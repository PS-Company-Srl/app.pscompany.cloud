<?php

namespace App\Traits;

use App\Models\Tenant;
use Illuminate\Database\Eloquent\Builder;

trait BelongsToTenant
{
    /**
     * Boot the trait
     */
    protected static function bootBelongsToTenant(): void
    {
        // Applica global scope solo se c'è un tenant nel contesto
        static::addGlobalScope('tenant', function (Builder $builder) {
            if ($tenantId = static::getCurrentTenantId()) {
                $builder->where($builder->getModel()->getTable() . '.tenant_id', $tenantId);
            }
        });

        // Auto-assegna tenant_id alla creazione
        static::creating(function ($model) {
            if (empty($model->tenant_id) && $tenantId = static::getCurrentTenantId()) {
                $model->tenant_id = $tenantId;
            }
        });
    }

    /**
     * Get current tenant ID from context
     */
    protected static function getCurrentTenantId(): ?int
    {
        // Prima controlla se c'è un tenant nel container
        if (app()->has('current_tenant')) {
            $tenant = app('current_tenant');
            return $tenant instanceof Tenant ? $tenant->id : $tenant;
        }

        // Poi controlla l'utente loggato
        $user = auth()->user();
        if ($user && isset($user->tenant_id)) {
            return $user->tenant_id;
        }

        return null;
    }

    /**
     * Scope per bypassare il global scope del tenant
     */
    public function scopeWithoutTenantScope(Builder $query): Builder
    {
        return $query->withoutGlobalScope('tenant');
    }

    /**
     * Scope per un tenant specifico
     */
    public function scopeForTenant(Builder $query, int|Tenant $tenant): Builder
    {
        $tenantId = $tenant instanceof Tenant ? $tenant->id : $tenant;
        
        return $query->withoutGlobalScope('tenant')
                     ->where('tenant_id', $tenantId);
    }
}
