<?php

namespace App\Services;

use App\Models\Tenant;
use App\Models\Conversation;
use App\Models\ApiUsage;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ChatService
{
    public function __construct(
        private RagService $ragService
    ) {}

    /**
     * Processa un messaggio e genera una risposta
     */
    public function processMessage(
        Tenant $tenant,
        string $message,
        string $sessionId,
        ?int $conversationId = null,
        string $channel = 'web',
        array $visitorInfo = []
    ): array {
        // Recupera o crea conversazione
        $conversation = $this->getOrCreateConversation(
            $tenant,
            $sessionId,
            $conversationId,
            $channel,
            $visitorInfo
        );

        // Salva messaggio utente
        $conversation->addMessage('user', $message);

        // Cerca nella knowledge base (RAG)
        $relevantChunks = $this->ragService->search($tenant->id, $message, 5);
        $knowledgeContext = $this->buildKnowledgeContext($relevantChunks);

        // Prepara messaggi per OpenAI
        $botSettings = $tenant->botSettings;
        $systemPrompt = $botSettings->buildSystemPromptWithContext($knowledgeContext);
        
        $messages = [
            ['role' => 'system', 'content' => $systemPrompt],
            ...$conversation->getMessagesForContext(),
        ];

        // Chiama OpenAI
        $response = $this->callOpenAI($messages, $botSettings);

        // Salva risposta
        $assistantMessage = $response['content'];
        $tokensUsed = $response['tokens_used'] ?? 0;
        
        $conversation->addMessage(
            'assistant',
            $assistantMessage,
            $tokensUsed,
            $botSettings->openai_model
        );

        // Registra usage
        if ($tokensUsed > 0) {
            $inputTokens = $response['input_tokens'] ?? (int)($tokensUsed * 0.3);
            $outputTokens = $response['output_tokens'] ?? ($tokensUsed - $inputTokens);
            
            ApiUsage::recordUsage(
                $tenant->id,
                $inputTokens,
                $outputTokens,
                $botSettings->openai_model
            );
        }

        // Incrementa contatore tenant
        $tenant->incrementMessageCount();

        // Estrai eventuali lead info
        $this->extractLeadInfo($conversation, $message);

        return [
            'response' => $assistantMessage,
            'conversation_id' => $conversation->id,
        ];
    }

    /**
     * Recupera o crea una conversazione
     */
    private function getOrCreateConversation(
        Tenant $tenant,
        string $sessionId,
        ?int $conversationId,
        string $channel,
        array $visitorInfo
    ): Conversation {
        if ($conversationId) {
            $conversation = Conversation::forTenant($tenant->id)
                ->where('id', $conversationId)
                ->where('status', 'active')
                ->first();

            if ($conversation) {
                return $conversation;
            }
        }

        $conversation = Conversation::forTenant($tenant->id)
            ->where('session_id', $sessionId)
            ->where('status', 'active')
            ->first();

        if ($conversation) {
            if (!empty($visitorInfo)) {
                $conversation->update([
                    'visitor_info' => array_merge(
                        $conversation->visitor_info ?? [],
                        $visitorInfo
                    ),
                ]);
            }
            return $conversation;
        }

        return Conversation::create([
            'tenant_id' => $tenant->id,
            'channel' => $channel,
            'session_id' => $sessionId,
            'visitor_info' => $visitorInfo,
            'started_at' => now(),
        ]);
    }

    /**
     * Costruisce il contesto dalla knowledge base
     */
    private function buildKnowledgeContext($chunks): string
    {
        if ($chunks->isEmpty()) {
            return '';
        }

        $context = '';
        foreach ($chunks as $index => $chunk) {
            $context .= "[" . ($index + 1) . "] " . $chunk->content . "\n\n";
        }

        return trim($context);
    }

    /**
     * Chiama OpenAI API
     */
    private function callOpenAI(array $messages, $botSettings): array
    {
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . config('services.openai.api_key'),
            'Content-Type' => 'application/json',
        ])->post('https://api.openai.com/v1/chat/completions', [
            'model' => $botSettings->openai_model,
            'messages' => $messages,
            'temperature' => $botSettings->temperature,
            'max_tokens' => $botSettings->max_tokens,
        ]);

        if (!$response->successful()) {
            Log::error('OpenAI API error', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            throw new \Exception('OpenAI API error: ' . $response->status());
        }

        $data = $response->json();

        return [
            'content' => $data['choices'][0]['message']['content'] ?? '',
            'tokens_used' => $data['usage']['total_tokens'] ?? 0,
            'input_tokens' => $data['usage']['prompt_tokens'] ?? 0,
            'output_tokens' => $data['usage']['completion_tokens'] ?? 0,
        ];
    }

    /**
     * Estrae informazioni lead dal messaggio
     */
    private function extractLeadInfo(Conversation $conversation, string $message): void
    {
        preg_match('/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/', $message, $emailMatches);
        preg_match('/(?:\+39)?\s*(?:3[0-9]{2}|0[0-9]{1,3})[\s.-]?[0-9]{6,10}/', $message, $phoneMatches);

        $email = $emailMatches[0] ?? null;
        $phone = $phoneMatches[0] ?? null;

        if ($email || $phone) {
            $lead = $conversation->lead;
            
            if (!$lead) {
                $conversation->lead()->create([
                    'tenant_id' => $conversation->tenant_id,
                    'source' => $conversation->channel,
                    'email' => $email,
                    'phone' => $phone,
                ]);
                
                $conversation->markLeadCaptured();
            } else {
                $lead->update(array_filter([
                    'email' => $email,
                    'phone' => $phone,
                ]));
            }
        }
    }
}
