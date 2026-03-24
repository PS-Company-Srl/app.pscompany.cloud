<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Conversation extends Model
{
    protected $fillable = [
        'chatbot_id',
        'session_id',
        'started_at',
        'email',
        'phone',
        'first_name',
        'last_name',
        'message_history',
        'recap_email_sent_at',
    ];

    protected function casts(): array
    {
        return [
            'started_at' => 'datetime',
            'message_history' => 'array',
            'recap_email_sent_at' => 'datetime',
        ];
    }

    public function chatbot(): BelongsTo
    {
        return $this->belongsTo(Chatbot::class);
    }

    public function messages(): HasMany
    {
        return $this->hasMany(Message::class)->orderBy('created_at');
    }

    /**
     * Aggiunge messaggi allo storico (un solo array per conversazione, senza record per messaggio).
     */
    public function appendMessages(string $userContent, string $assistantContent): void
    {
        $history = $this->message_history ?? [];
        $now = now()->toIso8601String();
        $history[] = ['role' => 'user', 'content' => $userContent, 'created_at' => $now];
        $history[] = ['role' => 'assistant', 'content' => $assistantContent, 'created_at' => $now];
        $this->message_history = $history;
        $this->save();
    }

    /**
     * Estrae email, telefono e nome/cognome dal testo e aggiorna la conversazione se trovati.
     */
    public function captureLeadFromText(string $text): void
    {
        $updated = false;

        if (empty($this->email)) {
            if (preg_match('/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/', $text, $m)) {
                $this->email = $m[0];
                $updated = true;
            }
        }

        if (empty($this->phone)) {
            if (preg_match('/(?:\+39[\s.]?)?(?:3\d{2}[\s.]?\d{6,7}|\d{3,4}[\s.]?\d{6,7})/', $text, $m)) {
                $this->phone = preg_replace('/[\s.]/', '', $m[0]);
                $updated = true;
            }
        }

        if (empty($this->first_name) || empty($this->last_name)) {
            $nameUpdated = $this->extractNameFromText($text);
            if ($nameUpdated) {
                $updated = true;
            }
        }

        if ($updated) {
            $this->save();
        }
    }

    /**
     * Estrae nome e cognome da frasi comuni (es. "Mi chiamo Mario Rossi", "Sono Mario Rossi").
     */
    private function extractNameFromText(string $text): bool
    {
        $text = trim($text);
        if (strlen($text) > 200) {
            $text = substr($text, 0, 200);
        }
        $updated = false;

        // "nome e cognome: Mario Rossi"
        if (preg_match('/\bnome\s+e\s+cognome\s*[:\-]?\s*([A-Za-zÀ-ÿ\'\-]+)\s+([A-Za-zÀ-ÿ\'\-]+)/ui', $text, $m)) {
            if (empty($this->first_name)) {
                $this->first_name = trim($m[1]);
                $updated = true;
            }
            if (empty($this->last_name)) {
                $this->last_name = trim($m[2]);
                $updated = true;
            }
        }

        // "mi chiamo Nome Cognome" / "sono Nome Cognome" / "il mio nome è Nome Cognome"
        if (preg_match('/\b(?:mi chiamo|sono|il mio nome è)\s+([A-Za-zÀ-ÿ\'\-]+)(?:\s+([A-Za-zÀ-ÿ\'\-]+))?/ui', $text, $m)) {
            $first = trim($m[1] ?? '');
            $second = trim($m[2] ?? '');
            if ($first !== '') {
                if (empty($this->first_name)) {
                    $this->first_name = $first;
                    $updated = true;
                }
                if ($second !== '' && empty($this->last_name)) {
                    $this->last_name = $second;
                    $updated = true;
                }
            }
        }

        // "nome: Mario"
        if (preg_match('/\bnome\s*[:\-]\s*([A-Za-zÀ-ÿ\'\-]+)/ui', $text, $m) && empty($this->first_name)) {
            $this->first_name = trim($m[1]);
            $updated = true;
        }

        // "cognome: Rossi"
        if (preg_match('/\bcognome\s*[:\-]\s*([A-Za-zÀ-ÿ\'\-]+)/ui', $text, $m) && empty($this->last_name)) {
            $this->last_name = trim($m[1]);
            $updated = true;
        }

        // "nome Mario" (senza separatore)
        if (preg_match('/\bnome\s+([A-Za-zÀ-ÿ\'\-]+)/ui', $text, $m) && empty($this->first_name)) {
            $candidate = mb_strtolower(trim($m[1]));
            if ($candidate !== 'e' && $candidate !== 'cognome') {
                $this->first_name = trim($m[1]);
                $updated = true;
            }
        }

        // "cognome Rossi" (senza separatore)
        if (preg_match('/\bcognome\s+([A-Za-zÀ-ÿ\'\-]+)/ui', $text, $m) && empty($this->last_name)) {
            $this->last_name = trim($m[1]);
            $updated = true;
        }

        // Messaggio di sole due parole (es. "Mario Rossi") interpretate come nome e cognome
        if (preg_match('/^([A-Za-zÀ-ÿ\'\-]+)\s+([A-Za-zÀ-ÿ\'\-]+)\s*$/u', $text, $m)) {
            if (empty($this->first_name)) {
                $this->first_name = trim($m[1]);
                $updated = true;
            }
            if (empty($this->last_name)) {
                $this->last_name = trim($m[2]);
                $updated = true;
            }
        }

        return $updated;
    }
}
