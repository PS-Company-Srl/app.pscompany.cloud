<?php

namespace App\Jobs;

use App\Mail\ConversationRecapMail;
use App\Models\Conversation;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

class SendConversationRecapEmail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 2;

    public function __construct(
        public Conversation $conversation
    ) {}

    public function handle(): void
    {
        $conversation = $this->conversation->load('chatbot.company');
        $chatbot = $conversation->chatbot;

        if (! $chatbot->recap_email_enabled) {
            return;
        }

        if (empty($conversation->email)) {
            return;
        }

        $delayMinutes = (int) $chatbot->recap_email_delay_minutes ?: 30;
        $cutoff = now()->subMinutes($delayMinutes);

        if ($conversation->updated_at > $cutoff) {
            return;
        }

        if ($conversation->recap_email_sent_at !== null) {
            return;
        }

        Mail::to($conversation->email)->send(new ConversationRecapMail($conversation));

        $conversation->update(['recap_email_sent_at' => now()]);
    }
}
