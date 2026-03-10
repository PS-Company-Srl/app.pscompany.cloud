<?php

namespace App\Mail;

use App\Models\Conversation;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
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
        $company = $this->conversation->chatbot->company;
        $companyName = $company->name ?? config('app.name');

        $params = [
            'subject' => "Recap conversazione – {$companyName}",
        ];

        if (! empty($company->mail_from_address)) {
            $params['from'] = new Address(
                $company->mail_from_address,
                $company->mail_from_name ?? $companyName
            );
        }

        return new Envelope(...$params);
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.conversation-recap',
        );
    }
}
