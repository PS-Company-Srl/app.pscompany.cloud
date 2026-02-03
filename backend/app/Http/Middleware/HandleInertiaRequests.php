<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Defines the props that are shared by default.
     */
    public function share(Request $request): array
    {
        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $request->user(),
                'admin' => $request->user('admin'),
            ],
            'tenant' => fn () => $this->getTenantData(),
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'info' => fn () => $request->session()->get('info'),
            ],
            'impersonating' => fn () => $request->session()->has('impersonating_from_admin'),
        ]);
    }

    /**
     * Get tenant data for sharing with frontend.
     */
    protected function getTenantData(): ?array
    {
        if (!app()->has('current_tenant')) {
            return null;
        }

        $tenant = app('current_tenant');

        return [
            'name' => $tenant->name,
            'slug' => $tenant->slug,
            'plan' => $tenant->plan,
            'status' => $tenant->status,
        ];
    }
}
