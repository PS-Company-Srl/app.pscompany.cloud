<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Chatbot;
use App\Models\Conversation;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ConversationController extends Controller
{
    public function index(Chatbot $chatbot): Response
    {
        $user = auth()->user();
        if ($chatbot->company_id !== $user->company_id) {
            abort(404);
        }

        $conversations = $chatbot->conversations()
            ->orderByDesc('started_at')
            ->orderByDesc('updated_at')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Customer/Conversations/Index', [
            'chatbot' => $chatbot,
            'conversations' => $conversations,
        ]);
    }

    public function show(Chatbot $chatbot, Conversation $conversation): Response
    {
        $user = auth()->user();
        if ($chatbot->company_id !== $user->company_id || $conversation->chatbot_id !== $chatbot->id) {
            abort(404);
        }

        $conversation->load('chatbot');

        return Inertia::render('Customer/Conversations/Show', [
            'chatbot' => $chatbot,
            'conversation' => $conversation,
        ]);
    }
}
