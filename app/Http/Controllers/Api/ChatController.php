<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Services\ChatbotService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ChatController extends Controller
{
    public function __construct(
        private ChatbotService $chatbotService
    ) {}

    /**
     * Configurazione widget (messaggio benvenuto, nome, colori, posizione, icona).
     */
    public function config(Request $request): JsonResponse
    {
        $chatbot = $request->attributes->get('chatbot');
        $company = $chatbot->company;
        $welcomeMessage = $chatbot->widget_welcome_message
            ?? "Ciao! Sono l'assistente di {$company->name}. Come posso aiutarti?";

        return response()->json([
            'company_name' => $chatbot->name,
            'welcome_message' => $welcomeMessage,
            'primary_color' => $chatbot->widget_primary_color ?? '#4f46e5',
            'position' => $chatbot->widget_position ?? 'bottom-right',
            'icon_url' => $chatbot->widget_icon_url,
            'auto_open_after_seconds' => (int) ($chatbot->widget_auto_open_after_seconds ?? 20),
        ]);
    }

    /**
     * Invia messaggio e ricevi risposta. Una conversazione = un record (session_id + message_history in JSON).
     * Email/telefono estratti dal testo vengono salvati sulla stessa conversazione.
     */
    public function message(Request $request): JsonResponse
    {
        $request->validate([
            'message' => 'required|string|max:2000',
            'session_id' => 'nullable|string|max:100',
            'history' => 'nullable|array',
            'history.*.role' => 'string|in:user,assistant',
            'history.*.content' => 'string',
        ]);

        $chatbot = $request->attributes->get('chatbot');
        $userMessage = $request->input('message');
        $sessionId = $request->input('session_id');
        $history = $request->input('history', []);

        if (empty($sessionId)) {
            $sessionId = 'sess_' . Str::random(40);
        }

        $conversation = Conversation::firstOrCreate(
            [
                'chatbot_id' => $chatbot->id,
                'session_id' => $sessionId,
            ],
            ['started_at' => now()]
        );

        $conversation->captureLeadFromText($userMessage);

        $reply = $this->chatbotService->reply($chatbot, $userMessage, $history);

        $conversation->appendMessages($userMessage, $reply);

        return response()->json([
            'reply' => $reply,
            'session_id' => $sessionId,
        ]);
    }
}
