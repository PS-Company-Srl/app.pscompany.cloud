<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ImpersonateController extends Controller
{
    /**
     * Inizia impersonazione di un utente cliente.
     */
    public function start(User $user)
    {
        // Salva l'admin ID in sessione per poter tornare
        session(['impersonating_from_admin' => Auth::guard('admin')->id()]);

        // Logout dall'admin
        Auth::guard('admin')->logout();

        // Login come utente
        Auth::login($user);

        // Redirect al pannello del tenant
        return redirect("https://{$user->tenant->slug}.pscompany.cloud");
    }

    /**
     * Termina impersonazione e torna all'admin.
     */
    public function stop(Request $request)
    {
        $adminId = session('impersonating_from_admin');

        if (!$adminId) {
            return redirect()->route('client.dashboard');
        }

        // Logout dall'utente impersonato
        Auth::logout();

        // Rimuovi dalla sessione
        session()->forget('impersonating_from_admin');

        // Non possiamo fare login automatico all'admin da qui
        // perché siamo su un subdomain diverso.
        // Redirect all'admin login
        return redirect(config('app.url') . '/login')
            ->with('info', 'Impersonazione terminata. Effettua nuovamente il login.');
    }
}
