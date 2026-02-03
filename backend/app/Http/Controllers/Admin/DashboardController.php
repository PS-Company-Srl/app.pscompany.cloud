<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Lead;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        // Statistiche globali
        $stats = [
            'tenants_total' => Tenant::count(),
            'tenants_active' => Tenant::where('status', 'active')->count(),
            'tenants_trial' => Tenant::where('status', 'trial')->count(),
            'tenants_suspended' => Tenant::where('status', 'suspended')->count(),
            'conversations_today' => Conversation::withoutGlobalScope('tenant')
                ->whereDate('created_at', today())
                ->count(),
            'conversations_this_month' => Conversation::withoutGlobalScope('tenant')
                ->whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->count(),
            'leads_this_month' => Lead::withoutGlobalScope('tenant')
                ->whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->count(),
            'messages_total_this_month' => Tenant::sum('messages_used_this_month'),
        ];

        // Ultimi tenant creati
        $recentTenants = Tenant::orderBy('created_at', 'desc')
            ->take(5)
            ->get(['id', 'name', 'slug', 'status', 'plan', 'created_at']);

        // Tenant con più utilizzo questo mese
        $topTenants = Tenant::orderBy('messages_used_this_month', 'desc')
            ->take(5)
            ->get(['id', 'name', 'slug', 'messages_used_this_month', 'monthly_message_limit']);

        return Inertia::render('Admin/Dashboard', [
            'stats' => $stats,
            'recentTenants' => $recentTenants,
            'topTenants' => $topTenants,
        ]);
    }
}
