<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Models\Conversation;
use App\Models\Lead;
use App\Models\KbChunk;
use App\Models\ApiUsage;
use App\Services\RagService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

/**
 * Controller per le API interne chiamate da n8n
 * Autenticato via X-Internal-Key header
 */
class InternalApiController extends Controller
{
    public function __construct(
        private RagService $ragService
    ) {}

    /**
     * Valida un tenant tramite API key
     * 
     * POST /api/internal/tenant/validate
     */
    public function validateTenant(Request $request): JsonResponse
    {
        $request->validate([
            'api_key' => 'required|string',
        ]);

        $tenant = Tenant::where('api_key', $request->input('api_key'))
            ->where('status', '!=', 'suspended')
            ->first();

        if (!$tenant) {
            return response()->json([
                'success' => false,
                'error' => 'Invalid API key or tenant suspended',
            ]);
        }

        return response()->json([
            'success' => true,
            'tenant' => [
                'id' => $tenant->id,
                'name' => $tenant->name,
                'slug' => $tenant->slug,
                'api_key' => $tenant->api_key,
                'status' => $tenant->status,
                'messages_remaining' => $tenant->getRemainingMessages(),
            ],
            'bot_settings' => $tenant->botSettings ? [
                'system_prompt' => $tenant->botSettings->system_prompt,
                'welcome_message' => $tenant->botSettings->welcome_message,
                'fallback_message' => $tenant->botSettings->fallback_message,
                'fallback_action' => $tenant->botSettings->fallback_action,
                'lead_goal' => $tenant->botSettings->lead_goal,
                'openai_model' => $tenant->botSettings->openai_model,
                'temperature' => $tenant->botSettings->temperature,
                'max_tokens' => $tenant->botSettings->max_tokens,
            ] : null,
        ]);
    }

    /**
     * Trova tenant da WhatsApp Phone ID
     * 
     * POST /api/internal/whatsapp/tenant-by-phone
     */
    public function tenantByWhatsappPhone(Request $request): JsonResponse
    {
        $request->validate([
            'phone_number_id' => 'required|string',
        ]);

        $tenant = Tenant::where('whatsapp_phone_id', $request->input('phone_number_id'))
            ->where('status', '!=', 'suspended')
            ->first();

        if (!$tenant) {
            return response()->json([
                'success' => false,
                'error' => 'Tenant not found for this WhatsApp number',
            ]);
        }

        return response()->json([
            'success' => true,
            'tenant' => [
                'id' => $tenant->id,
                'name' => $tenant->name,
                'api_key' => $tenant->api_key,
                'whatsapp_access_token' => $tenant->whatsapp_access_token,
            ],
        ]);
    }

    /**
     * Carica o crea contesto conversazione
     * 
     * POST /api/internal/conversation/context
     */
    public function conversationContext(Request $request): JsonResponse
    {
        $request->validate([
            'tenant_id' => 'required|integer',
            'session_id' => 'required|string',
            'channel' => 'required|in:web,whatsapp',
            'visitor_info' => 'nullable|string', // JSON string
        ]);

        $tenantId = $request->input('tenant_id');
        $sessionId = $request->input('session_id');
        $channel = $request->input('channel');
        $visitorInfo = json_decode($request->input('visitor_info', '{}'), true);

        // Cerca conversazione esistente o creane una nuova
        $conversation = Conversation::withoutTenantScope()
            ->where('tenant_id', $tenantId)
            ->where('session_id', $sessionId)
            ->where('status', 'active')
            ->first();

        if (!$conversation) {
            $conversation = Conversation::create([
                'tenant_id' => $tenantId,
                'channel' => $channel,
                'session_id' => $sessionId,
                'visitor_info' => $visitorInfo,
                'started_at' => now(),
            ]);
        } else {
            // Aggiorna visitor_info se necessario
            if (!empty($visitorInfo)) {
                $conversation->update([
                    'visitor_info' => array_merge($conversation->visitor_info ?? [], $visitorInfo),
                ]);
            }
        }

        // Recupera messaggi recenti per contesto
        $messages = $conversation->getMessagesForContext();

        return response()->json([
            'success' => true,
            'conversation_id' => $conversation->id,
            'messages' => $messages,
            'messages_count' => $conversation->messages_count,
        ]);
    }

    /**
     * Ricerca RAG nella knowledge base
     * 
     * POST /api/internal/rag/search
     */
    public function ragSearch(Request $request): JsonResponse
    {
        $request->validate([
            'tenant_id' => 'required|integer',
            'query' => 'required|string',
            'limit' => 'nullable|integer|min:1|max:10',
        ]);

        $tenantId = $request->input('tenant_id');
        $query = $request->input('query');
        $limit = $request->input('limit', 5);

        try {
            $chunks = $this->ragService->search($tenantId, $query, $limit);

            return response()->json([
                'success' => true,
                'chunks' => $chunks->map(fn($c) => [
                    'id' => $c->id,
                    'content' => $c->content,
                    'source' => $c->getSourceName(),
                    'score' => $c->similarity_score ?? null,
                ]),
            ]);
        } catch (\Exception $e) {
            report($e);
            
            return response()->json([
                'success' => true,
                'chunks' => [],
                'warning' => 'RAG search failed, continuing without context',
            ]);
        }
    }

    /**
     * Salva messaggi (user + assistant)
     * 
     * POST /api/internal/message/save
     */
    public function saveMessage(Request $request): JsonResponse
    {
        $request->validate([
            'conversation_id' => 'required|integer',
            'user_message' => 'required|string',
            'assistant_message' => 'required|string',
            'tokens_used' => 'nullable|integer',
            'model_used' => 'nullable|string',
            'rag_chunk_ids' => 'nullable|string', // JSON array
        ]);

        $conversation = Conversation::withoutTenantScope()
            ->findOrFail($request->input('conversation_id'));

        $ragChunkIds = json_decode($request->input('rag_chunk_ids', '[]'), true);
        $tokensUsed = $request->input('tokens_used', 0);
        $modelUsed = $request->input('model_used');

        // Salva messaggio utente
        $conversation->addMessage('user', $request->input('user_message'));

        // Salva risposta assistant
        $conversation->addMessage(
            'assistant',
            $request->input('assistant_message'),
            $tokensUsed,
            $modelUsed
        );

        // Aggiorna kb_chunks_used sull'ultimo messaggio
        if (!empty($ragChunkIds)) {
            $conversation->messages()->latest('created_at')->first()->update([
                'kb_chunks_used' => $ragChunkIds,
            ]);
        }

        // Incrementa contatore messaggi tenant
        $conversation->tenant->incrementMessageCount();

        // Registra usage API
        if ($tokensUsed > 0) {
            // Stima split input/output (approssimativo)
            $inputTokens = (int) ($tokensUsed * 0.3);
            $outputTokens = $tokensUsed - $inputTokens;
            
            ApiUsage::recordUsage(
                $conversation->tenant_id,
                $inputTokens,
                $outputTokens,
                $modelUsed
            );
        }

        return response()->json([
            'success' => true,
            'conversation_id' => $conversation->id,
            'messages_count' => $conversation->fresh()->messages_count,
        ]);
    }

    /**
     * Crea un lead
     * 
     * POST /api/internal/lead/create
     */
    public function createLead(Request $request): JsonResponse
    {
        $request->validate([
            'tenant_id' => 'required|integer',
            'conversation_id' => 'nullable|integer',
            'email' => 'nullable|email',
            'phone' => 'nullable|string',
            'name' => 'nullable|string',
            'source' => 'required|in:web,whatsapp',
        ]);

        // Verifica che ci sia almeno un contatto
        if (empty($request->input('email')) && empty($request->input('phone'))) {
            return response()->json([
                'success' => false,
                'error' => 'Email or phone required',
            ]);
        }

        // Verifica se lead esiste già per questo tenant
        $existingLead = Lead::withoutTenantScope()
            ->where('tenant_id', $request->input('tenant_id'))
            ->where(function ($q) use ($request) {
                if ($request->input('email')) {
                    $q->where('email', $request->input('email'));
                }
                if ($request->input('phone')) {
                    $q->orWhere('phone', $request->input('phone'));
                }
            })
            ->first();

        if ($existingLead) {
            // Aggiorna conversazione se fornita
            if ($request->input('conversation_id')) {
                $existingLead->update([
                    'conversation_id' => $request->input('conversation_id'),
                ]);
            }

            return response()->json([
                'success' => true,
                'lead_id' => $existingLead->id,
                'is_new' => false,
            ]);
        }

        // Crea nuovo lead
        $lead = Lead::create([
            'tenant_id' => $request->input('tenant_id'),
            'conversation_id' => $request->input('conversation_id'),
            'email' => $request->input('email'),
            'phone' => $request->input('phone'),
            'name' => $request->input('name'),
            'source' => $request->input('source'),
            'status' => 'new',
        ]);

        // Marca conversazione come lead captured
        if ($request->input('conversation_id')) {
            Conversation::withoutTenantScope()
                ->where('id', $request->input('conversation_id'))
                ->update(['lead_captured' => true]);
        }

        return response()->json([
            'success' => true,
            'lead_id' => $lead->id,
            'is_new' => true,
        ]);
    }
}
