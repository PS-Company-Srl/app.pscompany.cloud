<?php

namespace App\Mail;

use App\Models\Conversation;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ConversationRecapMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Conversation $conversation
    ) {
        $this->conversation->load('chatbot.company');
    }

    public function envelope(): Envelope
    {
        $companyName = $this->conversation->chatbot->company->name ?? config('app.name');
        $chatbotName = $this->conversation->chatbot->name;

        return new Envelope(
            subject: "Recap conversazione – {$companyName}",
            replyTo: [],
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.conversation-recap',
        );
    }
}
