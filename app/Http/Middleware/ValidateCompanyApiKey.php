<?php

namespace App\Http\Middleware;

use App\Models\Company;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ValidateCompanyApiKey
{
    public function handle(Request $request, Closure $next): Response
    {
        $key = $request->header('X-API-Key') ?? $request->input('api_key');

        if (empty($key)) {
            return response()->json(['error' => 'API key mancante'], 401);
        }

        $company = Company::where('api_key', $key)->first();

        if (! $company) {
            return response()->json(['error' => 'API key non valida'], 401);
        }

        $request->attributes->set('company', $company);

        return $next($request);
    }
}
