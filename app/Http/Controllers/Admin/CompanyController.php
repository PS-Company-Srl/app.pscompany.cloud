<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Jobs\FetchCompanyWebsiteContent;
use App\Models\Company;
use App\Models\Conversation;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class CompanyController extends Controller
{
    public function index(): InertiaResponse
    {
        $companies = Company::query()
            ->withCount('documents')
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/Companies/Index', [
            'companies' => $companies,
        ]);
    }

    public function create(): InertiaResponse
    {
        return Inertia::render('Admin/Companies/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:100|unique:companies,slug',
            'email' => 'nullable|email',
            'website' => 'nullable|string|max:500|url',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string',
            'mail_from_address' => 'nullable|email',
            'mail_from_name' => 'nullable|string|max:255',
            'client_email' => 'required|email|unique:users,email',
            'client_name' => 'nullable|string|max:255',
        ]);

        $company = Company::create([
            'name' => $validated['name'],
            'slug' => $validated['slug'] ?? null,
            'email' => $validated['email'] ?? null,
            'website' => $validated['website'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'address' => $validated['address'] ?? null,
            'mail_from_address' => $validated['mail_from_address'] ?? null,
            'mail_from_name' => $validated['mail_from_name'] ?? null,
        ]);

        $company->chatbots()->create([
            'name' => $company->name,
            'slug' => 'default',
            'goal_type' => 'assistant',
        ]);

        $customerRole = Role::where('name', Role::NAME_CUSTOMER)->first();
        if ($customerRole) {
            User::create([
                'name' => $validated['client_name'] ?? $company->name,
                'email' => $validated['client_email'],
                'password' => Hash::make(Str::random(32)),
                'role_id' => $customerRole->id,
                'company_id' => $company->id,
            ]);
        }

        return redirect()->route('admin.companies.index')
            ->with('success', 'Azienda e utente cliente creati.');
    }

    public function show(Company $company): InertiaResponse
    {
        $company->load(['documents', 'chatbots', 'users' => fn ($q) => $q->whereHas('role', fn ($r) => $r->where('name', Role::NAME_CUSTOMER))]);

        return Inertia::render('Admin/Companies/Show', [
            'company' => $company,
            'appUrl' => rtrim(config('app.url'), '/'),
            'hasWebsiteContent' => ! empty($company->website_extracted_text),
            'syncWebsiteUrl' => route('admin.companies.sync-website', $company),
        ]);
    }

    public function createUser(Company $company): InertiaResponse
    {
        return Inertia::render('Admin/Companies/Users/Create', [
            'company' => $company,
        ]);
    }

    public function storeUser(Request $request, Company $company): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
        ]);

        $customerRole = Role::where('name', Role::NAME_CUSTOMER)->first();
        if (! $customerRole) {
            return redirect()->route('admin.companies.show', $company)
                ->with('error', 'Ruolo cliente non trovato.');
        }

        User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make(Str::random(32)),
            'role_id' => $customerRole->id,
            'company_id' => $company->id,
        ]);

        return redirect()->route('admin.companies.show', $company)
            ->with('success', 'Utente cliente aggiunto. Comunica le credenziali (email + link recupero password).');
    }

    public function destroyUser(Company $company, User $user): RedirectResponse
    {
        if ($user->company_id !== $company->id) {
            abort(404);
        }
        if (! $user->isCustomer()) {
            return redirect()->route('admin.companies.show', $company)
                ->with('error', 'Solo gli utenti cliente possono essere rimossi dall’azienda.');
        }

        $user->update(['company_id' => null]);

        return redirect()->route('admin.companies.show', $company)
            ->with('success', 'Utente rimosso dall’azienda.');
    }

    public function edit(Company $company): InertiaResponse
    {
        return Inertia::render('Admin/Companies/Edit', [
            'company' => $company,
        ]);
    }

    public function recapEmails(Company $company): InertiaResponse
    {
        $conversations = Conversation::query()
            ->whereHas('chatbot', fn ($q) => $q->where('company_id', $company->id))
            ->whereNotNull('recap_email_sent_at')
            ->with('chatbot:id,name,company_id')
            ->orderByDesc('recap_email_sent_at')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Admin/Companies/RecapEmails/Index', [
            'company' => $company,
            'conversations' => $conversations,
        ]);
    }

    public function update(Request $request, Company $company): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:100|unique:companies,slug,' . $company->id,
            'email' => 'nullable|email',
            'website' => 'nullable|string|max:500|url',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string',
            'mail_from_address' => 'nullable|email',
            'mail_from_name' => 'nullable|string|max:255',
        ]);

        $websiteChanged = ($validated['website'] ?? null) !== $company->website;
        $company->update($validated);

        if ($websiteChanged && ! empty($company->website)) {
            FetchCompanyWebsiteContent::dispatch($company);
        }

        return redirect()->route('admin.companies.index')
            ->with('success', 'Azienda aggiornata.');
    }

    public function syncWebsite(Request $request, Company $company): RedirectResponse|InertiaResponse
    {
        if (empty($company->website)) {
            $message = 'Inserisci prima l’URL del sito web dell’azienda.';
            if ($request->header('X-Inertia')) {
                return Inertia::render('Admin/Companies/Show', [
                    'company' => $company->load(['documents', 'chatbots']),
                    'appUrl' => rtrim(config('app.url'), '/'),
                    'hasWebsiteContent' => ! empty($company->website_extracted_text),
                    'syncWebsiteUrl' => route('admin.companies.sync-website', $company),
                    'flash' => ['error' => $message],
                ]);
            }
            return redirect()->route('admin.companies.show', $company)->with('error', $message);
        }
        FetchCompanyWebsiteContent::dispatch($company);
        $message = 'Aggiornamento contenuto dal sito avviato. Il testo verrà estratto in background.';
        if ($request->header('X-Inertia')) {
            return Inertia::render('Admin/Companies/Show', [
                'company' => $company->load(['documents', 'chatbots']),
                'appUrl' => rtrim(config('app.url'), '/'),
                'hasWebsiteContent' => ! empty($company->website_extracted_text),
                'syncWebsiteUrl' => route('admin.companies.sync-website', $company),
                'flash' => ['success' => $message],
            ]);
        }
        return redirect()->route('admin.companies.show', $company)->with('success', $message);
    }

    public function destroy(Company $company): RedirectResponse
    {
        $company->delete();

        return redirect()->route('admin.companies.index')
            ->with('success', 'Azienda eliminata.');
    }

}
