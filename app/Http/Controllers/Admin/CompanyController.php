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
