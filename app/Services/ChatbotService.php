<?php

namespace App\Services;

use App\Models\Company;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ChatbotService
{
    private const MODEL = 'gpt-4o-mini';
    private const MAX_CONTEXT_CHARS = 12000;

    public function reply(Company $company, string $userMessage, array $history = []): string
    {
        $context = $company->getKnowledgeContext(self::MAX_CONTEXT_CHARS);
        $systemPrompt = $this->buildSystemPrompt($company, $context);

        $messages = [
            ['role' => 'system', 'content' => $systemPrompt],
        ];

        foreach (array_slice($history, -10) as $msg) {
            $role = $msg['role'] === 'user' ? 'user' : 'assistant';
            $messages[] = ['role' => $role, 'content' => $msg['content'] ?? ''];
        }

        $messages[] = ['role' => 'user', 'content' => $userMessage];

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . config('services.openai.api_key'),
            'Content-Type' => 'application/json',
        ])->timeout(30)->post('https://api.openai.com/v1/chat/completions', [
            'model' => self::MODEL,
            'messages' => $messages,
            'max_tokens' => 500,
            'temperature' => 0.5,
        ]);

        if (! $response->successful()) {
            Log::error('OpenAI Chat API error', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            return 'Mi dispiace, al momento non posso rispondere. Riprova tra poco.';
        }

        $content = $response->json('choices.0.message.content');
        return is_string($content) ? trim($content) : 'Risposta non disponibile.';
    }

    private function buildSystemPrompt(Company $company, string $context): string
    {
        $base = "Sei l'assistente virtuale di {$company->name}. ";
        $base .= "Rispondi in modo utile e professionale, usando SOLO le informazioni qui sotto quando disponibili. ";
        $base .= "Se non trovi la risposta nel materiale, dillo con cortesia e invita a contattare l'azienda. ";
        $base .= "Rispondi in italiano, in modo conciso.\n\n";

        if ($context !== '') {
            $base .= "--- Materiale informativo sull'azienda ---\n\n" . $context . "\n\n--- Fine materiale ---";
        } else {
            $base .= "Non hai ancora materiale informativo: rispondi in modo generico e invita a contattare l'azienda per dettagli.";
        }

        return $base;
    }
}
