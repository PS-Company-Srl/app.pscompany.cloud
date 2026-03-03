<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Chatbot;
use App\Models\Company;
use App\Models\Conversation;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ConversationController extends Controller
{
    public function index(Company $company, Chatbot $chatbot): Response
    {
        if ($chatbot->company_id !== $company->id) {
            abort(404);
        }

        $conversations = $chatbot->conversations()
            ->orderByDesc('started_at')
            ->orderByDesc('updated_at')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Admin/Companies/Chatbots/Conversations/Index', [
            'company' => $company,
            'chatbot' => $chatbot,
            'conversations' => $conversations,
        ]);
    }

    public function show(Company $company, Chatbot $chatbot, Conversation $conversation): Response
    {
        if ($chatbot->company_id !== $company->id || $conversation->chatbot_id !== $chatbot->id) {
            abort(404);
        }

        $conversation->load('chatbot');

        return Inertia::render('Admin/Companies/Chatbots/Conversations/Show', [
            'company' => $company,
            'chatbot' => $chatbot,
            'conversation' => $conversation,
        ]);
    }
}
