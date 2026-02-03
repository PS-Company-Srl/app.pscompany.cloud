<?php

namespace App\Http\Middleware;

use App\Models\Tenant;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateApiKey
{
    /**
     * Autentica richieste tramite API Key (header X-API-Key)
     */
    public function handle(Request $request, Closure $next): Response
    {
        $apiKey = $request->header('X-API-Key');

        if (empty($apiKey)) {
            return response()->json([
                'success' => false,
                'error' => 'API key required',
            ], 401);
        }

        $tenant = Tenant::where('api_key', $apiKey)
            ->where('status', '!=', 'suspended')
            ->first();

        if (!$tenant) {
            return response()->json([
                'success' => false,
                'error' => 'Invalid API key',
            ], 401);
        }

        // Verifica trial scaduto
        if ($tenant->isTrialExpired()) {
            return response()->json([
                'success' => false,
                'error' => 'Trial period expired',
            ], 403);
        }

        // Aggiungi tenant alla request
        $request->attributes->set('tenant', $tenant);
        
        // Imposta tenant nel container per i global scopes
        app()->instance('current_tenant', $tenant);

        return $next($request);
    }
}
