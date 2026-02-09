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
        'message_history',
    ];

    protected function casts(): array
    {
        return [
            'started_at' => 'datetime',
            'message_history' => 'array',
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
     * Estrae email e/o telefono dal testo e aggiorna la conversazione se trovati.
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

        if ($updated) {
            $this->save();
        }
    }
}
