<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserBelongsToTenant
{
    /**
     * Verifica che l'utente autenticato appartenga al tenant corrente.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = auth()->user();
        $tenant = app()->has('current_tenant') ? app('current_tenant') : null;

        // Se non c'è un tenant (es. siamo sul pannello admin), passa
        if (!$tenant) {
            return $next($request);
        }

        // Se non c'è un utente autenticato, il middleware auth si occuperà del redirect
        if (!$user) {
            return $next($request);
        }

        // Verifica che l'utente appartenga al tenant corrente
        if ($user->tenant_id !== $tenant->id) {
            auth()->logout();
            return redirect()->route('login')
                ->with('error', 'Non hai accesso a questo pannello.');
        }

        return $next($request);
    }
}
