<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasCompany
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! auth()->user()->company_id) {
            return redirect()->route('home')->with('error', 'Il tuo account non è associato a un\'azienda.');
        }

        return $next($request);
    }
}
