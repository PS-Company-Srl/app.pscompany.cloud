<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(): Response
    {
        $tenant = app('current_tenant');

        $users = User::where('tenant_id', $tenant->id)
            ->orderBy('role')
            ->orderBy('name')
            ->get();

        return Inertia::render('Client/Users/Index', [
            'users' => $users,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Client/Users/Create');
    }

    public function store(Request $request)
    {
        $tenant = app('current_tenant');

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'email',
                Rule::unique('users')->where(function ($query) use ($tenant) {
                    return $query->where('tenant_id', $tenant->id);
                }),
            ],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'role' => ['required', Rule::in(['admin', 'viewer'])],
        ]);

        User::create([
            'tenant_id' => $tenant->id,
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'email_verified_at' => now(),
        ]);

        return redirect()->route('client.users.index')
            ->with('success', 'Utente creato con successo.');
    }

    public function show(User $user): Response
    {
        return Inertia::render('Client/Users/Show', [
            'user' => $user,
        ]);
    }

    public function edit(User $user): Response
    {
        return Inertia::render('Client/Users/Edit', [
            'user' => $user,
        ]);
    }

    public function update(Request $request, User $user)
    {
        $tenant = app('current_tenant');

        // Non permettere di modificare l'owner
        if ($user->role === 'owner') {
            return back()->with('error', 'Non puoi modificare il ruolo dell\'owner.');
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'email',
                Rule::unique('users')->where(function ($query) use ($tenant) {
                    return $query->where('tenant_id', $tenant->id);
                })->ignore($user->id),
            ],
            'password' => ['nullable', 'string', 'min:8', 'confirmed'],
            'role' => ['required', Rule::in(['admin', 'viewer'])],
        ]);

        $user->name = $validated['name'];
        $user->email = $validated['email'];
        $user->role = $validated['role'];

        if (!empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }

        $user->save();

        return redirect()->route('client.users.index')
            ->with('success', 'Utente aggiornato con successo.');
    }

    public function destroy(User $user)
    {
        // Non permettere di eliminare l'owner
        if ($user->role === 'owner') {
            return back()->with('error', 'Non puoi eliminare l\'owner.');
        }

        // Non permettere di eliminare se stessi
        if ($user->id === auth()->id()) {
            return back()->with('error', 'Non puoi eliminare il tuo account.');
        }

        $user->delete();

        return redirect()->route('client.users.index')
            ->with('success', 'Utente eliminato con successo.');
    }
}
