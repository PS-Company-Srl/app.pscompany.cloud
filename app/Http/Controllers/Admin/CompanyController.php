<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Company;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CompanyController extends Controller
{
    public function index(): Response
    {
        $companies = Company::query()
            ->withCount('documents')
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/Companies/Index', [
            'companies' => $companies,
        ]);
    }

    public function create(): Response
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

        Company::create($validated);

        return redirect()->route('admin.companies.index')
            ->with('success', 'Azienda creata.');
    }

    public function show(Company $company): Response
    {
        $company->load('documents');

        return Inertia::render('Admin/Companies/Show', [
            'company' => $company,
            'appUrl' => rtrim(config('app.url'), '/'),
        ]);
    }

    public function edit(Company $company): Response
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

        $company->update($validated);

        return redirect()->route('admin.companies.index')
            ->with('success', 'Azienda aggiornata.');
    }

    public function destroy(Company $company): RedirectResponse
    {
        $company->delete();

        return redirect()->route('admin.companies.index')
            ->with('success', 'Azienda eliminata.');
    }
}
