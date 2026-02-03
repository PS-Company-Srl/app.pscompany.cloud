<?php

namespace App\Providers;

use App\Models\User;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The model to policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        //
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        // Gestione Knowledge Base: owner e admin
        Gate::define('manage-kb', function (User $user) {
            return $user->canManageKnowledgeBase();
        });

        // Gestione Settings: owner e admin
        Gate::define('manage-settings', function (User $user) {
            return $user->canManageSettings();
        });

        // Gestione Utenti: solo owner
        Gate::define('manage-users', function (User $user) {
            return $user->canManageUsers();
        });

        // Visualizzazione conversazioni: tutti
        Gate::define('view-conversations', function (User $user) {
            return $user->canViewConversations();
        });
    }
}
