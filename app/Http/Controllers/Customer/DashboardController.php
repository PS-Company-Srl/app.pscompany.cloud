<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use Carbon\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $user = auth()->user();
        $company = $user->company;
        $company->load('chatbots');

        $chatbotIds = $company->chatbots->pluck('id');

        $totalConversations = Conversation::whereIn('chatbot_id', $chatbotIds)->count();
        $conversationsThisMonth = Conversation::whereIn('chatbot_id', $chatbotIds)
            ->where('started_at', '>=', Carbon::now()->startOfMonth())
            ->count();
        $conversationsLast7Days = Conversation::whereIn('chatbot_id', $chatbotIds)
            ->where('started_at', '>=', Carbon::now()->subDays(7))
            ->count();

        $stats = [
            'total_conversations' => $totalConversations,
            'conversations_this_month' => $conversationsThisMonth,
            'conversations_last_7_days' => $conversationsLast7Days,
            'chatbots_count' => $company->chatbots->count(),
        ];

        return Inertia::render('Customer/Dashboard', [
            'company' => $company,
            'stats' => $stats,
        ]);
    }
}
