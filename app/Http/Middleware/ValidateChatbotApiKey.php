<?php

namespace App\Http\Middleware;

use App\Models\Chatbot;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ValidateChatbotApiKey
{
    public function handle(Request $request, Closure $next): Response
    {
        $key = $request->header('X-API-Key') ?? $request->input('api_key');

        if (empty($key)) {
            return response()->json(['error' => 'API key mancante'], 401);
        }

        $chatbot = Chatbot::with('company')->where('api_key', $key)->first();

        if (! $chatbot) {
            return response()->json(['error' => 'API key non valida'], 401);
        }

        $request->attributes->set('chatbot', $chatbot);
        $request->attributes->set('company', $chatbot->company);

        return $next($request);
    }
}
