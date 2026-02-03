<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Models\Conversation;
use App\Models\BotSetting;
use App\Services\ChatService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ChatController extends Controller
{
    public function __construct(
        private ChatService $chatService
    ) {}

    /**
     * Ricevi un messaggio dal widget e rispondi
     * 
     * POST /api/chat/message
     */
    public function message(Request $request): JsonResponse
    {
        $request->validate([
            'message' => 'required|string|max:2000',
            'session_id' => 'required|string|max:100',
            'conversation_id' => 'nullable|integer',
            'channel' => 'nullable|in:web,whatsapp',
            'visitor_info' => 'nullable|array',
        ]);

        // Recupera tenant da API key (impostato dal middleware)
        $tenant = $request->attributes->get('tenant');
        
        if (!$tenant) {
            return response()->json([
                'success' => false,
                'error' => 'Invalid API key',
            ], 401);
        }

        // Verifica limiti
        if ($tenant->hasReachedMessageLimit()) {
            return response()->json([
                'success' => false,
                'error' => 'Monthly message limit reached',
            ], 429);
        }

        try {
            $result = $this->chatService->processMessage(
                tenant: $tenant,
                message: $request->input('message'),
                sessionId: $request->input('session_id'),
                conversationId: $request->input('conversation_id'),
                channel: $request->input('channel', 'web'),
                visitorInfo: $request->input('visitor_info', []),
            );

            return response()->json([
                'success' => true,
                'response' => $result['response'],
                'conversation_id' => $result['conversation_id'],
            ]);

        } catch (\Exception $e) {
            report($e);
            
            return response()->json([
                'success' => false,
                'error' => 'An error occurred processing your message',
            ], 500);
        }
    }

    /**
     * Ottieni configurazione widget per un tenant
     * 
     * GET /api/chat/config
     */
    public function config(Request $request): JsonResponse
    {
        $tenant = $request->attributes->get('tenant');
        
        if (!$tenant) {
            return response()->json([
                'success' => false,
                'error' => 'Invalid API key',
            ], 401);
        }

        $botSettings = $tenant->botSettings;

        if (!$botSettings) {
            return response()->json([
                'success' => false,
                'error' => 'Bot not configured',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'config' => [
                'welcome_message' => $botSettings->welcome_message,
                'trigger_delay' => $botSettings->trigger_delay,
                'trigger_message' => $botSettings->trigger_message,
                'widget_position' => $botSettings->widget_position,
                'widget_colors' => $botSettings->widget_colors ?? $botSettings->getDefaultColors(),
                'company_name' => $tenant->company_name,
            ],
        ]);
    }

    /**
     * Storico conversazione (per riprendere una chat)
     * 
     * GET /api/chat/history/{session_id}
     */
    public function history(Request $request, string $sessionId): JsonResponse
    {
        $tenant = $request->attributes->get('tenant');
        
        if (!$tenant) {
            return response()->json([
                'success' => false,
                'error' => 'Invalid API key',
            ], 401);
        }

        $conversation = Conversation::forTenant($tenant->id)
            ->where('session_id', $sessionId)
            ->where('status', '!=', 'archived')
            ->latest()
            ->first();

        if (!$conversation) {
            return response()->json([
                'success' => true,
                'conversation_id' => null,
                'messages' => [],
            ]);
        }

        $messages = $conversation->messages()
            ->select('role', 'content', 'created_at')
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(fn($m) => [
                'role' => $m->role,
                'content' => $m->content,
                'timestamp' => $m->created_at->toIso8601String(),
            ]);

        return response()->json([
            'success' => true,
            'conversation_id' => $conversation->id,
            'messages' => $messages,
        ]);
    }
}
