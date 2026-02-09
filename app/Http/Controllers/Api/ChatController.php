<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ChatbotService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ChatController extends Controller
{
    public function __construct(
        private ChatbotService $chatbot
    ) {}

    /**
     * Configurazione widget (messaggio benvenuto, nome azienda).
     */
    public function config(Request $request): JsonResponse
    {
        $company = $request->attributes->get('company');

        return response()->json([
            'company_name' => $company->name,
            'welcome_message' => "Ciao! Sono l'assistente di {$company->name}. Come posso aiutarti?",
            'primary_color' => $company->widget_primary_color ?? '#4f46e5',
            'position' => $company->widget_position ?? 'bottom-right',
            'icon_url' => $company->widget_icon_url,
        ]);
    }

    /**
     * Invia messaggio e ricevi risposta dal chatbot.
     */
    public function message(Request $request): JsonResponse
    {
        $request->validate([
            'message' => 'required|string|max:2000',
            'history' => 'nullable|array',
            'history.*.role' => 'string|in:user,assistant',
            'history.*.content' => 'string',
        ]);

        $company = $request->attributes->get('company');
        $userMessage = $request->input('message');
        $history = $request->input('history', []);

        $reply = $this->chatbot->reply($company, $userMessage, $history);

        return response()->json([
            'reply' => $reply,
        ]);
    }
}
