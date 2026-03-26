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
    private const CHUNK_SIZE = 1200;
    private const CHUNK_OVERLAP = 180;

    public function reply(Chatbot $chatbot, string $userMessage, array $history = []): string
    {
        $company = $chatbot->company;
        $context = $this->buildRelevantContext($chatbot, $company, $userMessage, self::MAX_CONTEXT_CHARS);
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
                $base .= "OBIETTIVO: Oltre ad assistere, cerca di ottenere in modo naturale nome e cognome, email e numero di telefono dell'utente quando è pertinente (es. per inviare informazioni, richiamare). Non essere insistente; chiedi con cortesia quando il contesto lo permette.\n";
                $base .= "PROTOCOLLO DATI (OBBLIGATORIO): prima chiedi consenso esplicito alla raccolta recapiti. Solo se l'utente accetta, procedi STEP BY STEP con una domanda per volta, in questo ordine: (1) nome, (2) cognome, (3) telefono, (4) email. Dopo ogni risposta, ringrazia brevemente e passa allo step successivo. Alla fine fai un riepilogo dei dati raccolti e chiedi conferma finale.\n\n";
                break;
            case Chatbot::GOAL_CUSTOM:
                if (! empty(trim((string) $chatbot->custom_goal))) {
                    $base .= "OBIETTIVO PERSONALIZZATO (da rispettare):\n" . trim($chatbot->custom_goal) . "\n\n";
                }
                break;
            default:
                break;
        }

        if ($chatbot->bertoli_configuration_enabled) {
            $base .= $this->bertoliConfigurationPrompt();
        }

        $base .= "Il materiale sotto include: (1) il contenuto del sito web dell'azienda, (2) eventuali documenti caricati. Usali per rispondere in modo pertinente.\n\n";

        if ($context !== '') {
            $base .= "--- Materiale informativo (sito web + documenti) ---\n\n" . $context . "\n\n--- Fine materiale ---";
        } else {
            $base .= "Non hai ancora materiale informativo: rispondi in modo generico e invita a contattare l'azienda per dettagli.";
        }

        return $base;
    }

    /**
     * Costruisce un contesto mirato alla domanda utente per evitare di perdere
     * dati utili in caso di knowledge molto estesa (es. molte occasioni).
     */
    private function buildRelevantContext(Chatbot $chatbot, Company $company, string $userMessage, int $maxChars): string
    {
        $siteText = trim((string) ($company->website_extracted_text ?? ''));
        $docTexts = $company->documents()
            ->whereNotNull('extracted_text')
            ->where('extracted_text', '!=', '')
            ->pluck('extracted_text')
            ->implode("\n\n---\n\n");
        $docsText = trim((string) $docTexts);

        $sections = [];

        if ($chatbot->bertoli_configuration_enabled) {
            $occasionSection = $this->buildOccasionItemsSection($company, $userMessage);
            if ($occasionSection !== '') {
                $sections[] = $occasionSection;
            }
        }

        if ($siteText !== '') {
            $siteBudget = (int) ($maxChars * 0.7);
            $sections[] = "[Contenuto dal sito web dell'azienda]\n\n" . $this->extractTopRelevantChunks($siteText, $userMessage, $siteBudget);
        }

        if ($docsText !== '') {
            $used = mb_strlen(implode("\n\n", $sections));
            $remaining = max(0, $maxChars - $used);
            if ($remaining > 0) {
                $sections[] = "[Documenti forniti dall'azienda]\n\n" . mb_substr($docsText, 0, $remaining);
            }
        }

        return trim(implode("\n\n", $sections));
    }

    private function buildOccasionItemsSection(Company $company, string $userMessage): string
    {
        $queryKeywords = $this->extractKeywords($userMessage);
        $items = $company->occasionItems()
            ->limit(400)
            ->get(['showroom', 'title', 'price_from', 'price_to']);

        if ($items->isEmpty()) {
            return '';
        }

        $scored = [];
        foreach ($items as $item) {
            $haystack = mb_strtolower(trim(($item->title ?? '') . ' ' . ($item->showroom ?? '')));
            $score = 0;
            foreach ($queryKeywords as $keyword) {
                $score += mb_substr_count($haystack, $keyword) * 5;
            }
            if (str_contains($haystack, 'divano')) {
                $score += 3;
            }
            $scored[] = ['item' => $item, 'score' => $score];
        }

        usort($scored, fn (array $a, array $b) => $b['score'] <=> $a['score']);
        $top = array_slice($scored, 0, 40);
        if (empty($top)) {
            return '';
        }

        $lines = [];
        foreach ($top as $row) {
            $item = $row['item'];
            $showroom = trim((string) ($item->showroom ?? ''));
            $title = trim((string) ($item->title ?? ''));
            $priceFrom = trim((string) ($item->price_from ?? ''));
            $priceTo = trim((string) ($item->price_to ?? ''));
            if ($title === '') {
                continue;
            }
            $line = "- {$title}";
            if ($showroom !== '') {
                $line .= " | showroom: {$showroom}";
            }
            if ($priceFrom !== '' || $priceTo !== '') {
                $line .= " | prezzo: {$priceFrom}";
                if ($priceTo !== '') {
                    $line .= " -> {$priceTo}";
                }
            }
            $lines[] = $line;
        }

        if (empty($lines)) {
            return '';
        }

        return "[Occasioni Bertoli strutturate - prioritarie su pronta consegna]\n" . implode("\n", $lines);
    }

    private function extractTopRelevantChunks(string $text, string $query, int $maxChars): string
    {
        if ($text === '' || $maxChars <= 0) {
            return '';
        }

        $chunks = $this->splitIntoChunks($text, self::CHUNK_SIZE, self::CHUNK_OVERLAP);
        if (empty($chunks)) {
            return mb_substr($text, 0, $maxChars);
        }

        $keywords = $this->extractKeywords($query);
        $scored = [];
        foreach ($chunks as $idx => $chunk) {
            $scored[] = [
                'idx' => $idx,
                'chunk' => $chunk,
                'score' => $this->chunkScore($chunk, $keywords),
            ];
        }

        usort($scored, fn (array $a, array $b) => $b['score'] <=> $a['score']);

        $selected = [];
        $currentLen = 0;
        foreach ($scored as $row) {
            $piece = trim($row['chunk']);
            if ($piece === '') {
                continue;
            }
            $pieceLen = mb_strlen($piece) + 6;
            if ($currentLen + $pieceLen > $maxChars) {
                continue;
            }
            $selected[] = $piece;
            $currentLen += $pieceLen;
            if ($currentLen >= $maxChars) {
                break;
            }
        }

        if (empty($selected)) {
            return mb_substr($text, 0, $maxChars);
        }

        return implode("\n\n---\n\n", $selected);
    }

    private function splitIntoChunks(string $text, int $size, int $overlap): array
    {
        $text = trim(preg_replace('/\s+/', ' ', $text) ?? $text);
        if ($text === '') {
            return [];
        }

        $chunks = [];
        $len = mb_strlen($text);
        $step = max(1, $size - $overlap);
        for ($start = 0; $start < $len; $start += $step) {
            $chunks[] = mb_substr($text, $start, $size);
        }

        return $chunks;
    }

    private function extractKeywords(string $query): array
    {
        $clean = mb_strtolower($query);
        $clean = preg_replace('/[^\p{L}\p{N}\s]/u', ' ', $clean) ?? $clean;
        $parts = preg_split('/\s+/u', $clean, -1, PREG_SPLIT_NO_EMPTY) ?: [];
        $stopwords = [
            'che', 'del', 'della', 'delle', 'degli', 'dei', 'sono', 'alla', 'dallo', 'dalla', 'dalle',
            'con', 'per', 'una', 'uno', 'gli', 'nel', 'nella', 'nelle', 'sul', 'sulla', 'dove', 'come',
            'avete', 'avrei', 'vorrei', 'sto', 'cerca', 'cerco', 'avere',
        ];

        $keywords = [];
        foreach ($parts as $p) {
            if (mb_strlen($p) < 3 || in_array($p, $stopwords, true)) {
                continue;
            }
            $keywords[] = $p;
        }

        return array_values(array_unique($keywords));
    }

    private function chunkScore(string $chunk, array $keywords): int
    {
        $c = mb_strtolower($chunk);
        $score = 0;

        foreach ($keywords as $k) {
            $score += mb_substr_count($c, $k) * 4;
        }

        // Boost per pagine/prodotti utili al caso Bertoli
        if (str_contains($c, 'occasioni')) {
            $score += 20;
        }
        if (str_contains($c, 'pronta consegna') || str_contains($c, 'pronta-consegna')) {
            $score += 15;
        }
        if (str_contains($c, 'divano')) {
            $score += 12;
        }
        if (str_contains($c, 'showroom')) {
            $score += 8;
        }

        return $score;
    }

    private function bertoliConfigurationPrompt(): string
    {
        return <<<TXT
CONFIGURAZIONE BERTOLI (AGGIUNTIVA): Applica SEMPRE anche queste regole operative.

CONOSCENZA INTERNA (NON COMUNICARE COME SUGGERIMENTO ESTERNO):
- Cliente unico verso cui orientare l'utente: Bertoli Arredamenti.
- Puoi fare affidamento, solo per formulare risposte corrette e complete, anche su conoscenza relativa a marchi e collezioni presenti in assortimento Bertoli (Veneta Cucine, Stosa, Meson's, Lago, Riflessi, Cattelan, MSG, Novamobili, Manifattura Falomo, Arcom, Calia, Samoa, Ditre, ecc.), come da brief interno.
- Quella conoscenza NON va mai offerta come invito a consultare siti, cataloghi o canali di terzi.

VIETATO NELL'OUTPUT VERSO L'UTENTE:
- Non suggerire mai siti web, URL o pagine di terzi (neppure "per approfondire visita...").
- Non suggerire mai prodotti, modelli o acquisti presso marchi o negozi diversi da Bertoli Arredamenti.
- Non elencare link a fornitori esterni. L'unico dominio che puoi citare esplicitamente, se utile, e quello Bertoli (es. occasioni su bertoliarredamenti.it quando serve per le disponibilita in sede).
- Non dire "vai sul sito di [marchio]" ne "ordina da [marchio]".

CONSENTITO:
- Usare la conoscenza interna per rispondere in modo pertinente (tipologie, materiali, compatibilita, orientamenti) parlando sempre in nome Bertoli: disponibilita, consulenza, showroom, appuntamento.
- Se l'utente cita un marchio o un modello, rispondi in modo utile senza reindirizzarlo al sito del marchio; indica che Bertoli puo verificare disponibilita e varianti in showroom o in occasione.

CONTESTO E FONTI (solo per te, non da ripetere come elenco all'utente):
- Priorita: contenuto Bertoli (sito e occasioni bertoliarredamenti.it).
- Per arricchire le risposte quando il materiale Bertoli non basta, applica la conoscenza sui partner come sopra; ignora sezioni rivenditori/punti vendita/rete vendita. Per Cattelan escludi contenuti outlet.

REGOLE DI RISPOSTA:
1) Richieste prodotto specifico o pronta consegna:
   - Verifica prima disponibilita e occasioni Bertoli.
   - Se serve piu dettaglio, basati sulla conoscenza interna senza citare fonti esterne.
   - Obiettivo: accompagnare sempre verso presa appuntamento in showroom.
   - Richiedi SEMPRE dati cliente: nome, cognome, telefono, email (dopo consenso, step by step).

2) Richieste post-vendita/manutenzione:
   - Richiedi descrizione accurata della problematica.
   - Richiedi anche nominativo contratto e/o codice contratto.
   - Comunica che il reparto post-vendita fornira pronta risposta.
   - Specifica inoltro a: raffaele.mussini@bertoliarredamenti.it.
   - Richiedi SEMPRE dati cliente: nome, cognome, telefono, email (dopo consenso, step by step).

3) Domande su prodotti in sala mostra:
   - Rispondi in nome Bertoli (disponibilita, come approfondire in sede).
   - Descrivi le showroom e invita a lasciare i recapiti per il referente locale (Modena o Correggio).
   - Richiedi SEMPRE dati cliente: nome, cognome, telefono, email (dopo consenso, step by step).

STILE:
- Mantieni tono professionale, chiaro, orientato all'appuntamento.
- Se mancano dati sufficienti, fai domande brevi e mirate.
- Prima di raccogliere dati personali, chiedi consenso esplicito.
- Dopo il consenso, raccogli i dati in modo guidato step-by-step (una domanda per volta): nome, cognome, telefono, email.
- Evita di chiedere piu dati nella stessa domanda.


TXT;
    }
}
