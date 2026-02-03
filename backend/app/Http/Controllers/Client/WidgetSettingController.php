<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class WidgetSettingController extends Controller
{
    public function edit(): Response
    {
        $tenant = app('current_tenant');
        $botSettings = $tenant->botSettings;

        return Inertia::render('Client/Settings/Widget', [
            'settings' => $botSettings,
            'previewUrl' => "https://cdn.pscompany.cloud/widget.js?key={$tenant->api_key}",
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'widget_position' => ['required', Rule::in(['bottom-right', 'bottom-left'])],
            'widget_colors' => ['required', 'array'],
            'widget_colors.primary' => ['required', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'widget_colors.secondary' => ['required', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'widget_colors.text' => ['required', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'widget_colors.userBubble' => ['required', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'widget_colors.botBubble' => ['required', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
        ]);

        $tenant = app('current_tenant');
        $tenant->botSettings->update([
            'widget_position' => $validated['widget_position'],
            'widget_colors' => $validated['widget_colors'],
        ]);

        return back()->with('success', 'Impostazioni widget salvate.');
    }
}
