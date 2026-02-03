<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class AuthController extends Controller
{
    /**
     * Mostra il form di login per utenti cliente.
     */
    public function showLoginForm(): Response
    {
        $tenant = app('current_tenant');

        return Inertia::render('Client/Auth/Login', [
            'tenant' => [
                'name' => $tenant->name,
                'slug' => $tenant->slug,
            ],
        ]);
    }

    /**
     * Gestisce il login utente cliente.
     */
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        $tenant = app('current_tenant');

        // Aggiungi il tenant_id alle credenziali per garantire
        // che l'utente appartenga al tenant corretto
        $credentials['tenant_id'] = $tenant->id;

        if (Auth::attempt($credentials, $request->boolean('remember'))) {
            $request->session()->regenerate();

            // Aggiorna last_login_at
            Auth::user()->updateLastLogin();

            return redirect()->intended(route('client.dashboard'));
        }

        return back()->withErrors([
            'email' => 'Le credenziali inserite non sono corrette.',
        ])->onlyInput('email');
    }

    /**
     * Logout utente cliente.
     */
    public function logout(Request $request)
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login');
    }
}
