<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Lead;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $tenant = app('current_tenant');

        $stats = [
            'conversations_today' => Conversation::whereDate('created_at', today())->count(),
            'conversations_this_week' => Conversation::whereBetween('created_at', [
                now()->startOfWeek(),
                now()->endOfWeek(),
            ])->count(),
            'conversations_this_month' => Conversation::whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->count(),
            'leads_new' => Lead::where('status', 'new')->count(),
            'leads_this_month' => Lead::whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->count(),
            'messages_used' => $tenant->messages_used_this_month,
            'messages_limit' => $tenant->monthly_message_limit,
            'messages_remaining' => $tenant->getRemainingMessages(),
        ];

        // Ultime conversazioni
        $recentConversations = Conversation::with('messages')
            ->orderBy('last_message_at', 'desc')
            ->take(5)
            ->get()
            ->map(function ($conv) {
                return [
                    'id' => $conv->id,
                    'session_id' => $conv->session_id,
                    'channel' => $conv->channel,
                    'visitor_name' => $conv->visitor_name,
                    'messages_count' => $conv->messages->count(),
                    'last_message' => $conv->messages->last()?->content,
                    'last_message_at' => $conv->last_message_at,
                    'created_at' => $conv->created_at,
                ];
            });

        // Lead recenti
        $recentLeads = Lead::orderBy('created_at', 'desc')
            ->take(5)
            ->get(['id', 'name', 'email', 'phone', 'status', 'created_at']);

        return Inertia::render('Client/Dashboard', [
            'stats' => $stats,
            'recentConversations' => $recentConversations,
            'recentLeads' => $recentLeads,
            'tenant' => [
                'name' => $tenant->name,
                'plan' => $tenant->plan,
                'status' => $tenant->status,
            ],
        ]);
    }
}
