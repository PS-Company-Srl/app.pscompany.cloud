<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Lead;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class LeadController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Lead::query();

        // Filtri
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('source')) {
            $query->where('source', $request->source);
        }

        // Ordinamento
        $sortBy = $request->get('sort', 'created_at');
        $sortDir = $request->get('dir', 'desc');
        $query->orderBy($sortBy, $sortDir);

        $leads = $query->paginate(20)->withQueryString();

        // Conteggi per status
        $statusCounts = [
            'new' => Lead::where('status', 'new')->count(),
            'contacted' => Lead::where('status', 'contacted')->count(),
            'qualified' => Lead::where('status', 'qualified')->count(),
            'converted' => Lead::where('status', 'converted')->count(),
            'lost' => Lead::where('status', 'lost')->count(),
        ];

        return Inertia::render('Client/Leads/Index', [
            'leads' => $leads,
            'filters' => $request->only(['search', 'status', 'source', 'sort', 'dir']),
            'statusCounts' => $statusCounts,
        ]);
    }

    public function show(Lead $lead): Response
    {
        // Carica la conversazione se esiste
        $lead->load('conversation.messages');

        return Inertia::render('Client/Leads/Show', [
            'lead' => $lead,
        ]);
    }

    public function update(Request $request, Lead $lead)
    {
        $validated = $request->validate([
            'status' => ['sometimes', Rule::in(['new', 'contacted', 'qualified', 'converted', 'lost'])],
            'notes' => ['nullable', 'string', 'max:5000'],
        ]);

        $lead->update($validated);

        return back()->with('success', 'Lead aggiornato.');
    }

    public function destroy(Lead $lead)
    {
        $lead->delete();

        return redirect()->route('client.leads.index')
            ->with('success', 'Lead eliminato.');
    }

    /**
     * Export leads in CSV.
     */
    public function export(Request $request)
    {
        $query = Lead::query();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $leads = $query->orderBy('created_at', 'desc')->get();

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="leads-' . date('Y-m-d') . '.csv"',
        ];

        $callback = function () use ($leads) {
            $file = fopen('php://output', 'w');

            // Header
            fputcsv($file, ['Nome', 'Email', 'Telefono', 'Stato', 'Fonte', 'Note', 'Creato il']);

            // Righe
            foreach ($leads as $lead) {
                fputcsv($file, [
                    $lead->name,
                    $lead->email,
                    $lead->phone,
                    $lead->status,
                    $lead->source,
                    $lead->notes,
                    $lead->created_at->format('d/m/Y H:i'),
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
