<?php

namespace App\Services;

use App\Models\Chatbot;
use App\Models\Company;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ChatbotService
{
    private const MODEL = 'gpt-4o-mini';
    private const MAX_CONTEXT_CHARS = 14000;

    public function reply(Chatbot $chatbot, string $userMessage, array $history = []): string
    {
        $company = $chatbot->company;
        $context = $company->getKnowledgeContext(self::MAX_CONTEXT_CHARS);
        $systemPrompt = $this->buildSystemPrompt($chatbot, $company, $context);

        $messages = [
            ['role' => 'system', 'content' => $systemPrompt],
        ];

        foreach (array_slice($history, -10) as $msg) {
            $role = $msg['role'] === 'user' ? 'user' : 'assistant';
            $messages[] = ['role' => $role, 'content' => $msg['content'] ?? ''];
        }

        $messages[] = ['role' => 'user', 'content' => $userMessage];

        $apiKey = $chatbot->openai_api_key ?? config('services.openai.api_key');
        if (empty($apiKey)) {
            Log::warning('OpenAI API key missing for chatbot', ['chatbot_id' => $chatbot->id]);
            return 'Mi dispiace, la chiave API OpenAI non è configurata per questo chatbot. Contatta l’amministratore.';
        }

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $apiKey,
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

    private function buildSystemPrompt(Chatbot $chatbot, Company $company, string $context): string
    {
        $base = "Sei l'assistente virtuale di {$company->name}. ";
        $base .= "Rispondi in modo utile e professionale, usando SOLO le informazioni qui sotto quando disponibili. ";
        $base .= "Se non trovi la risposta nel materiale, dillo con cortesia e invita a contattare l'azienda. ";
        $base .= "Rispondi in italiano, in modo conciso.\n\n";

        switch ($chatbot->goal_type) {
            case Chatbot::GOAL_LEAD_CAPTURE:
                $base .= "OBIETTIVO: Oltre ad assistere, cerca di ottenere in modo naturale email e numero di telefono dell'utente quando è pertinente (es. per inviare informazioni, richiamare). Non essere insistente; chiedi con cortesia quando il contesto lo permette.\n\n";
                break;
            case Chatbot::GOAL_CUSTOM:
                if (! empty(trim((string) $chatbot->custom_goal))) {
                    $base .= "OBIETTIVO PERSONALIZZATO (da rispettare):\n" . trim($chatbot->custom_goal) . "\n\n";
                }
                break;
            default:
                break;
        }

        $base .= "Il materiale sotto include: (1) il contenuto del sito web dell'azienda, (2) eventuali documenti caricati. Usali per rispondere in modo pertinente.\n\n";

        if ($context !== '') {
            $base .= "--- Materiale informativo (sito web + documenti) ---\n\n" . $context . "\n\n--- Fine materiale ---";
        } else {
            $base .= "Non hai ancora materiale informativo: rispondi in modo generico e invita a contattare l'azienda per dettagli.";
        }

        return $base;
    }
}
