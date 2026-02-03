<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ConversationController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Conversation::query()->withCount('messages');

        // Filtri
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('visitor_name', 'like', "%{$search}%")
                    ->orWhere('session_id', 'like', "%{$search}%");
            });
        }

        if ($request->filled('channel')) {
            $query->where('channel', $request->channel);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        // Ordinamento
        $sortBy = $request->get('sort', 'last_message_at');
        $sortDir = $request->get('dir', 'desc');
        $query->orderBy($sortBy, $sortDir);

        $conversations = $query->paginate(20)->withQueryString();

        return Inertia::render('Client/Conversations/Index', [
            'conversations' => $conversations,
            'filters' => $request->only(['search', 'channel', 'date_from', 'date_to', 'sort', 'dir']),
        ]);
    }

    public function show(Conversation $conversation): Response
    {
        $conversation->load(['messages' => function ($query) {
            $query->orderBy('created_at', 'asc');
        }]);

        // Marca come letta se non lo era
        if (!$conversation->is_read) {
            $conversation->update(['is_read' => true]);
        }

        return Inertia::render('Client/Conversations/Show', [
            'conversation' => $conversation,
        ]);
    }

    public function destroy(Conversation $conversation)
    {
        $conversation->delete();

        return redirect()->route('client.conversations.index')
            ->with('success', 'Conversazione eliminata.');
    }
}
