<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserRole
{
    /**
     * Verifica che l'utente abbia uno dei ruoli richiesti.
     *
     * @param string ...$roles Ruoli accettati (es: 'owner', 'admin')
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = auth()->user();

        if (!$user) {
            abort(403, 'Accesso non autorizzato.');
        }

        if (!in_array($user->role, $roles)) {
            abort(403, 'Non hai i permessi per accedere a questa sezione.');
        }

        return $next($request);
    }
}
