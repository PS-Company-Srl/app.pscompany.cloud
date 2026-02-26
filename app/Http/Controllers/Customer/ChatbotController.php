<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Chatbot;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ChatbotController extends Controller
{
    private function companyId(): int
    {
        return (int) auth()->user()->company_id;
    }

    private function findChatbot(int $id): ?Chatbot
    {
        return Chatbot::where('company_id', $this->companyId())->findOrFail($id);
    }

    public function index(): Response
    {
        $chatbots = Chatbot::where('company_id', $this->companyId())
            ->orderBy('name')
            ->get();

        return Inertia::render('Customer/Chatbots/Index', [
            'chatbots' => $chatbots,
            'appUrl' => rtrim(config('app.url'), '/'),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Customer/Chatbots/Create', [
            'goalTypes' => Chatbot::GOAL_TYPES,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:100',
            'goal_type' => 'required|string|in:assistant,lead_capture,custom',
            'custom_goal' => 'nullable|string|max:2000',
            'widget_primary_color' => 'nullable|string|max:20|regex:/^#[0-9A-Fa-f]{6}$/',
            'widget_position' => 'nullable|string|in:bottom-right,bottom-left',
            'widget_welcome_message' => 'nullable|string|max:2000',
            'widget_auto_open_after_seconds' => 'nullable|integer|min:0|max:300',
        ]);

        $validated['company_id'] = $this->companyId();
        if (empty($validated['custom_goal']) || $validated['goal_type'] !== 'custom') {
            $validated['custom_goal'] = null;
        }
        if (empty($validated['slug'])) {
            $validated['slug'] = \Illuminate\Support\Str::slug($validated['name']);
        }

        Chatbot::create($validated);

        return redirect()->route('customer.chatbots.index')
            ->with('success', 'Chatbot creato.');
    }

    public function edit(int $id): Response|RedirectResponse
    {
        $chatbot = $this->findChatbot($id);

        return Inertia::render('Customer/Chatbots/Edit', [
            'chatbot' => $chatbot,
            'goalTypes' => Chatbot::GOAL_TYPES,
            'appUrl' => rtrim(config('app.url'), '/'),
        ]);
    }

    public function update(Request $request, int $id): RedirectResponse
    {
        $chatbot = $this->findChatbot($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:100',
            'goal_type' => 'required|string|in:assistant,lead_capture,custom',
            'custom_goal' => 'nullable|string|max:2000',
            'widget_primary_color' => 'nullable|string|max:20|regex:/^#[0-9A-Fa-f]{6}$/',
            'widget_position' => 'nullable|string|in:bottom-right,bottom-left',
            'widget_welcome_message' => 'nullable|string|max:2000',
            'widget_auto_open_after_seconds' => 'nullable|integer|min:0|max:300',
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

        return redirect()->route('customer.chatbots.index')
            ->with('success', 'Chatbot aggiornato.');
    }

    public function destroy(int $id): RedirectResponse
    {
        $chatbot = $this->findChatbot($id);
        if ($chatbot->widget_icon) {
            Storage::disk('public')->delete($chatbot->widget_icon);
        }
        $chatbot->delete();

        return redirect()->route('customer.chatbots.index')
            ->with('success', 'Chatbot eliminato.');
    }
}
