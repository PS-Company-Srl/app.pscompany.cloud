<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BotSetting;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class TenantController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Tenant::query()
            ->withCount(['users', 'conversations', 'leads', 'knowledgeBases']);

        // Filtri
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('plan')) {
            $query->where('plan', $request->plan);
        }

        // Ordinamento
        $sortBy = $request->get('sort', 'created_at');
        $sortDir = $request->get('dir', 'desc');
        $query->orderBy($sortBy, $sortDir);

        $tenants = $query->paginate(15)->withQueryString();

        return Inertia::render('Admin/Tenants/Index', [
            'tenants' => $tenants,
            'filters' => $request->only(['search', 'status', 'plan', 'sort', 'dir']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Tenants/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:100', 'alpha_dash', 'unique:tenants'],
            'status' => ['required', Rule::in(['active', 'trial', 'suspended'])],
            'plan' => ['required', Rule::in(['starter', 'business', 'enterprise'])],
            'monthly_message_limit' => ['required', 'integer', 'min:100'],
            'trial_ends_at' => ['nullable', 'date'],
            // Owner info
            'owner_name' => ['required', 'string', 'max:255'],
            'owner_email' => ['required', 'email', 'unique:users,email'],
            'owner_password' => ['required', 'string', 'min:8'],
        ]);

        DB::transaction(function () use ($validated) {
            // Crea tenant
            $tenant = Tenant::create([
                'name' => $validated['name'],
                'slug' => $validated['slug'],
                'status' => $validated['status'],
                'plan' => $validated['plan'],
                'monthly_message_limit' => $validated['monthly_message_limit'],
                'trial_ends_at' => $validated['trial_ends_at'] ?? null,
                'settings' => [
                    'company_name' => $validated['name'],
                    'timezone' => 'Europe/Rome',
                    'language' => 'it',
                ],
            ]);

            // Crea owner
            User::create([
                'tenant_id' => $tenant->id,
                'name' => $validated['owner_name'],
                'email' => $validated['owner_email'],
                'password' => Hash::make($validated['owner_password']),
                'role' => 'owner',
                'email_verified_at' => now(),
            ]);

            // Crea bot settings di default
            BotSetting::create([
                'tenant_id' => $tenant->id,
                'system_prompt' => $this->getDefaultSystemPrompt($validated['name']),
                'welcome_message' => "Ciao! Sono l'assistente virtuale di {$validated['name']}. Come posso aiutarti?",
                'fallback_message' => 'Mi dispiace, non ho informazioni specifiche su questo argomento.',
                'fallback_action' => 'ask_contact',
            ]);
        });

        return redirect()->route('admin.tenants.index')
            ->with('success', 'Tenant creato con successo.');
    }

    public function show(Tenant $tenant): Response
    {
        $tenant->load(['owner', 'botSettings']);
        $tenant->loadCount(['users', 'conversations', 'leads', 'knowledgeBases']);

        // Statistiche del tenant
        $stats = [
            'conversations_total' => $tenant->conversations()->withoutGlobalScope('tenant')->count(),
            'conversations_this_month' => $tenant->conversations()
                ->withoutGlobalScope('tenant')
                ->whereMonth('created_at', now()->month)
                ->count(),
            'leads_total' => $tenant->leads()->withoutGlobalScope('tenant')->count(),
            'leads_this_month' => $tenant->leads()
                ->withoutGlobalScope('tenant')
                ->whereMonth('created_at', now()->month)
                ->count(),
        ];

        return Inertia::render('Admin/Tenants/Show', [
            'tenant' => $tenant,
            'stats' => $stats,
        ]);
    }

    public function edit(Tenant $tenant): Response
    {
        $tenant->load('owner');

        return Inertia::render('Admin/Tenants/Edit', [
            'tenant' => $tenant,
        ]);
    }

    public function update(Request $request, Tenant $tenant)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:100', 'alpha_dash', Rule::unique('tenants')->ignore($tenant->id)],
            'status' => ['required', Rule::in(['active', 'trial', 'suspended'])],
            'plan' => ['required', Rule::in(['starter', 'business', 'enterprise'])],
            'monthly_message_limit' => ['required', 'integer', 'min:100'],
            'trial_ends_at' => ['nullable', 'date'],
        ]);

        $tenant->update($validated);

        return redirect()->route('admin.tenants.show', $tenant)
            ->with('success', 'Tenant aggiornato con successo.');
    }

    public function destroy(Tenant $tenant)
    {
        // Soft delete
        $tenant->delete();

        return redirect()->route('admin.tenants.index')
            ->with('success', 'Tenant eliminato con successo.');
    }

    /**
     * Rigenera la API key del tenant.
     */
    public function regenerateApiKey(Tenant $tenant)
    {
        $newKey = $tenant->regenerateApiKey();

        return back()->with('success', 'API Key rigenerata: ' . $newKey);
    }

    protected function getDefaultSystemPrompt(string $companyName): string
    {
        return <<<PROMPT
Sei l'assistente virtuale di {$companyName}.

RUOLO:
- Aiutare i visitatori rispondendo alle loro domande in modo chiaro e professionale
- Usare SEMPRE le informazioni dalla knowledge base quando disponibili
- Se non trovi la risposta, ammettilo onestamente

STILE:
- Tono cordiale e professionale
- Usa il "tu" informale
- Risposte concise ma complete
- Rispondi nella lingua dell'utente (default: italiano)
PROMPT;
    }
}
