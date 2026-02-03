<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateInternalApi
{
    /**
     * Autentica richieste interne da n8n tramite X-Internal-Key header
     */
    public function handle(Request $request, Closure $next): Response
    {
        $internalKey = $request->header('X-Internal-Key');
        $expectedKey = config('services.n8n.internal_key');

        if (empty($expectedKey)) {
            // Se non configurata, log warning ma lascia passare in dev
            if (app()->environment('local', 'development')) {
                return $next($request);
            }

            return response()->json([
                'success' => false,
                'error' => 'Internal API not configured',
            ], 500);
        }

        if ($internalKey !== $expectedKey) {
            return response()->json([
                'success' => false,
                'error' => 'Invalid internal key',
            ], 401);
        }

        return $next($request);
    }
}
