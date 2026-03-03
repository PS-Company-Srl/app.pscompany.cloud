<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Jobs\FetchCompanyWebsiteContent;
use App\Models\Company;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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
        ]);

        $company = Company::create($validated);
        $company->chatbots()->create([
            'name' => $company->name,
            'slug' => 'default',
            'goal_type' => 'assistant',
        ]);

        return redirect()->route('admin.companies.index')
            ->with('success', 'Azienda creata.');
    }

    public function show(Company $company): InertiaResponse
    {
        $company->load(['documents', 'chatbots']);

        return Inertia::render('Admin/Companies/Show', [
            'company' => $company,
            'appUrl' => rtrim(config('app.url'), '/'),
            'hasWebsiteContent' => ! empty($company->website_extracted_text),
            'syncWebsiteUrl' => route('admin.companies.sync-website', $company),
        ]);
    }

    public function edit(Company $company): InertiaResponse
    {
        return Inertia::render('Admin/Companies/Edit', [
            'company' => $company,
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
        ]);

        $websiteChanged = ($validated['website'] ?? null) !== $company->website;
        $company->update($validated);

        if ($websiteChanged && ! empty($company->website)) {
            $this->dispatchScraper($company);
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
        [$message, $isError] = $this->runScraperAndGetMessage($company);
        $company->refresh();
        if ($request->header('X-Inertia')) {
            return Inertia::render('Admin/Companies/Show', [
                'company' => $company->load(['documents', 'chatbots']),
                'appUrl' => rtrim(config('app.url'), '/'),
                'hasWebsiteContent' => ! empty($company->website_extracted_text),
                'syncWebsiteUrl' => route('admin.companies.sync-website', $company),
                'flash' => [$isError ? 'error' : 'success' => $message],
            ]);
        }
        return redirect()->route('admin.companies.show', $company)->with($isError ? 'error' : 'success', $message);
    }

    public function destroy(Company $company): RedirectResponse
    {
        $company->delete();

        return redirect()->route('admin.companies.index')
            ->with('success', 'Azienda eliminata.');
    }

    /**
     * Esegue lo scraper in modo sincrono così funziona anche senza queue worker (es. hosting condiviso).
     */
    private function dispatchScraper(Company $company): void
    {
        FetchCompanyWebsiteContent::dispatchSync($company);
    }

    /**
     * Esegue lo scraper e restituisce [messaggio, true se errore].
     */
    private function runScraperAndGetMessage(Company $company): array
    {
        try {
            $this->dispatchScraper($company);
            return ['Contenuto dal sito estratto. Puoi usare il chatbot con i dati aggiornati.', false];
        } catch (\Throwable $e) {
            return [
                'Errore durante l\'estrazione dal sito: ' . $e->getMessage() . '. Verifica che il server possa fare richieste HTTP in uscita.',
                true,
            ];
        }
    }
}
