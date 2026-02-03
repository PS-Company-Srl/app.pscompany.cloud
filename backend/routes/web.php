<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AdminAuthController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\TenantController;
use App\Http\Controllers\Admin\ImpersonateController;
use App\Http\Controllers\Client\DashboardController as ClientDashboardController;
use App\Http\Controllers\Client\ConversationController;
use App\Http\Controllers\Client\LeadController;
use App\Http\Controllers\Client\KnowledgeBaseController;
use App\Http\Controllers\Client\BotSettingController;
use App\Http\Controllers\Client\WidgetSettingController;
use App\Http\Controllers\Client\UserController;
use App\Http\Controllers\Client\EmbedController;
use App\Http\Middleware\IdentifyTenant;
use App\Http\Middleware\EnsureUserBelongsToTenant;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Il routing è basato sul dominio:
| - app.pscompany.cloud (o chatbot.test) → Pannello Admin PS Company
| - {slug}.pscompany.cloud (o {slug}.chatbot.test) → Pannello Cliente
|
*/

// ================================================
// ADMIN ROUTES (app.pscompany.cloud)
// ================================================
Route::domain(config('app.admin_domain', 'app.pscompany.cloud'))->group(function () {
    // Guest routes
    Route::middleware('guest:admin')->group(function () {
        Route::get('/login', [AdminAuthController::class, 'showLoginForm'])->name('admin.login');
        Route::post('/login', [AdminAuthController::class, 'login']);
    });

    // Authenticated routes
    Route::middleware('auth:admin')->prefix('admin')->group(function () {
        Route::post('/logout', [AdminAuthController::class, 'logout'])->name('admin.logout');

        // Dashboard
        Route::get('/', [AdminDashboardController::class, 'index'])->name('admin.dashboard');

        // Tenants
        Route::resource('tenants', TenantController::class)->names([
            'index' => 'admin.tenants.index',
            'create' => 'admin.tenants.create',
            'store' => 'admin.tenants.store',
            'show' => 'admin.tenants.show',
            'edit' => 'admin.tenants.edit',
            'update' => 'admin.tenants.update',
            'destroy' => 'admin.tenants.destroy',
        ]);
        Route::post('tenants/{tenant}/regenerate-api-key', [TenantController::class, 'regenerateApiKey'])
            ->name('admin.tenants.regenerate-api-key');

        // Impersonate
        Route::post('/impersonate/{user}', [ImpersonateController::class, 'start'])
            ->name('admin.impersonate.start');
    });

    // Redirect root admin to dashboard or login
    Route::get('/', function () {
        return auth()->guard('admin')->check()
            ? redirect()->route('admin.dashboard')
            : redirect()->route('admin.login');
    });
});


// ================================================
// CLIENT ROUTES ({slug}.pscompany.cloud)
// ================================================
Route::middleware([IdentifyTenant::class])->group(function () {
    // Guest routes
    Route::middleware('guest')->group(function () {
        Route::get('/login', [AuthController::class, 'showLoginForm'])->name('login');
        Route::post('/login', [AuthController::class, 'login']);
    });

    // Authenticated routes
    Route::middleware(['auth', EnsureUserBelongsToTenant::class])->group(function () {
        Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

        // Stop impersonation
        Route::post('/stop-impersonation', [ImpersonateController::class, 'stop'])
            ->name('client.impersonate.stop');

        // Dashboard
        Route::get('/', [ClientDashboardController::class, 'index'])->name('client.dashboard');

        // Conversations (tutti possono vedere)
        Route::resource('conversations', ConversationController::class)
            ->only(['index', 'show', 'destroy'])
            ->names([
                'index' => 'client.conversations.index',
                'show' => 'client.conversations.show',
                'destroy' => 'client.conversations.destroy',
            ]);

        // Leads (tutti possono vedere)
        Route::resource('leads', LeadController::class)
            ->only(['index', 'show', 'update', 'destroy'])
            ->names([
                'index' => 'client.leads.index',
                'show' => 'client.leads.show',
                'update' => 'client.leads.update',
                'destroy' => 'client.leads.destroy',
            ]);
        Route::get('/leads/export', [LeadController::class, 'export'])
            ->name('client.leads.export');

        // Knowledge Base (solo admin+)
        Route::middleware('can:manage-kb')->group(function () {
            Route::resource('knowledge-base', KnowledgeBaseController::class)
                ->parameters(['knowledge-base' => 'knowledgeBase'])
                ->names([
                    'index' => 'client.knowledge-base.index',
                    'create' => 'client.knowledge-base.create',
                    'store' => 'client.knowledge-base.store',
                    'show' => 'client.knowledge-base.show',
                    'edit' => 'client.knowledge-base.edit',
                    'update' => 'client.knowledge-base.update',
                    'destroy' => 'client.knowledge-base.destroy',
                ]);
            Route::post('/knowledge-base/{knowledgeBase}/reprocess', [KnowledgeBaseController::class, 'reprocess'])
                ->name('client.knowledge-base.reprocess');
        });

        // Settings (solo admin+)
        Route::middleware('can:manage-settings')->prefix('settings')->group(function () {
            // Bot Settings
            Route::get('/bot', [BotSettingController::class, 'edit'])->name('client.settings.bot');
            Route::put('/bot', [BotSettingController::class, 'update'])->name('client.settings.bot.update');

            // Widget Settings
            Route::get('/widget', [WidgetSettingController::class, 'edit'])->name('client.settings.widget');
            Route::put('/widget', [WidgetSettingController::class, 'update'])->name('client.settings.widget.update');
        });

        // Users (solo owner)
        Route::middleware('can:manage-users')->group(function () {
            Route::resource('users', UserController::class)
                ->names([
                    'index' => 'client.users.index',
                    'create' => 'client.users.create',
                    'store' => 'client.users.store',
                    'show' => 'client.users.show',
                    'edit' => 'client.users.edit',
                    'update' => 'client.users.update',
                    'destroy' => 'client.users.destroy',
                ]);
        });

        // Embed code
        Route::get('/embed', [EmbedController::class, 'index'])->name('client.embed');
    });
});
