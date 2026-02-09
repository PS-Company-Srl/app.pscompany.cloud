<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Chatbot;
use App\Models\Company;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ChatbotController extends Controller
{
    public function index(Company $company): Response
    {
        $company->load('chatbots');

        return Inertia::render('Admin/Companies/Chatbots/Index', [
            'company' => $company,
            'chatbots' => $company->chatbots,
            'appUrl' => rtrim(config('app.url'), '/'),
        ]);
    }

    public function create(Company $company): Response
    {
        return Inertia::render('Admin/Companies/Chatbots/Create', [
            'company' => $company,
            'goalTypes' => Chatbot::GOAL_TYPES,
        ]);
    }

    public function store(Request $request, Company $company): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:100',
            'goal_type' => 'required|string|in:assistant,lead_capture,custom',
            'custom_goal' => 'nullable|string|max:2000',
            'widget_primary_color' => 'nullable|string|max:20|regex:/^#[0-9A-Fa-f]{6}$/',
            'widget_position' => 'nullable|string|in:bottom-right,bottom-left',
        ]);

        $validated['company_id'] = $company->id;
        if (empty($validated['custom_goal']) || $validated['goal_type'] !== 'custom') {
            $validated['custom_goal'] = null;
        }
        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $company->chatbots()->create($validated);

        return redirect()->route('admin.companies.chatbots.index', $company)
            ->with('success', 'Chatbot creato.');
    }

    public function edit(Company $company, Chatbot $chatbot): Response|RedirectResponse
    {
        if ($chatbot->company_id !== $company->id) {
            abort(404);
        }

        return Inertia::render('Admin/Companies/Chatbots/Edit', [
            'company' => $company,
            'chatbot' => $chatbot,
            'goalTypes' => Chatbot::GOAL_TYPES,
            'appUrl' => rtrim(config('app.url'), '/'),
        ]);
    }

    public function update(Request $request, Company $company, Chatbot $chatbot): RedirectResponse
    {
        if ($chatbot->company_id !== $company->id) {
            abort(404);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:100',
            'goal_type' => 'required|string|in:assistant,lead_capture,custom',
            'custom_goal' => 'nullable|string|max:2000',
            'widget_primary_color' => 'nullable|string|max:20|regex:/^#[0-9A-Fa-f]{6}$/',
            'widget_position' => 'nullable|string|in:bottom-right,bottom-left',
            'remove_icon' => 'nullable|boolean',
        ]);

        if ($request->boolean('remove_icon') && $chatbot->widget_icon) {
            Storage::disk('public')->delete($chatbot->widget_icon);
            $validated['widget_icon'] = null;
        }

        if ($request->hasFile('widget_icon')) {
            $request->validate(['widget_icon' => 'image|mimes:jpeg,png,gif,webp|max:512']);
            if ($chatbot->widget_icon) {
                Storage::disk('public')->delete($chatbot->widget_icon);
            }
            $validated['widget_icon'] = $request->file('widget_icon')->store('company-widget-icons', 'public');
        }

        if (empty($validated['custom_goal']) || $validated['goal_type'] !== 'custom') {
            $validated['custom_goal'] = null;
        }

        $chatbot->update($validated);

        return redirect()->route('admin.companies.chatbots.index', $company)
            ->with('success', 'Chatbot aggiornato.');
    }

    public function destroy(Company $company, Chatbot $chatbot): RedirectResponse
    {
        if ($chatbot->company_id !== $company->id) {
            abort(404);
        }
        if ($chatbot->widget_icon) {
            Storage::disk('public')->delete($chatbot->widget_icon);
        }
        $chatbot->delete();

        return redirect()->route('admin.companies.chatbots.index', $company)
            ->with('success', 'Chatbot eliminato.');
    }
}
