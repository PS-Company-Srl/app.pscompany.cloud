<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\BotSetting;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class BotSettingController extends Controller
{
    public function edit(): Response
    {
        $tenant = app('current_tenant');
        $botSettings = $tenant->botSettings;

        // Se non esistono, creali con valori di default
        if (!$botSettings) {
            $botSettings = BotSetting::create([
                'tenant_id' => $tenant->id,
                'system_prompt' => "Sei l'assistente virtuale di {$tenant->name}.",
                'welcome_message' => "Ciao! Come posso aiutarti?",
                'fallback_message' => "Mi dispiace, non ho informazioni su questo argomento.",
                'fallback_action' => 'ask_contact',
            ]);
        }

        return Inertia::render('Client/Settings/Bot', [
            'settings' => $botSettings,
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'system_prompt' => ['required', 'string', 'max:5000'],
            'welcome_message' => ['required', 'string', 'max:500'],
            'fallback_message' => ['required', 'string', 'max:500'],
            'fallback_action' => ['required', Rule::in(['ask_contact', 'escalate', 'none'])],
            'lead_goal' => ['nullable', 'string', 'max:1000'],
            'trigger_delay' => ['required', 'integer', 'min:0', 'max:300'],
            'trigger_message' => ['nullable', 'string', 'max:500'],
            'openai_model' => ['required', Rule::in(['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'])],
            'temperature' => ['required', 'numeric', 'min:0', 'max:2'],
            'max_tokens' => ['required', 'integer', 'min:100', 'max:4000'],
        ]);

        $tenant = app('current_tenant');
        $tenant->botSettings->update($validated);

        return back()->with('success', 'Impostazioni bot salvate.');
    }
}
