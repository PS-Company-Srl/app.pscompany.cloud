<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Jobs\ProcessKnowledgeBase;
use App\Models\KnowledgeBase;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class KnowledgeBaseController extends Controller
{
    public function index(): Response
    {
        $knowledgeBases = KnowledgeBase::orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Client/KnowledgeBase/Index', [
            'knowledgeBases' => $knowledgeBases,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Client/KnowledgeBase/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'type' => ['required', Rule::in(['text', 'file', 'url'])],
            'content' => ['required_if:type,text', 'nullable', 'string'],
            'url' => ['required_if:type,url', 'nullable', 'url'],
            'file' => ['required_if:type,file', 'nullable', 'file', 'mimes:pdf,doc,docx,txt', 'max:10240'],
        ]);

        $tenant = app('current_tenant');

        $kb = new KnowledgeBase([
            'tenant_id' => $tenant->id,
            'title' => $validated['title'],
            'type' => $validated['type'],
            'status' => 'pending',
        ]);

        switch ($validated['type']) {
            case 'text':
                $kb->original_content = $validated['content'];
                break;

            case 'url':
                $kb->url = $validated['url'];
                break;

            case 'file':
                $file = $request->file('file');
                $path = $file->store("tenants/{$tenant->id}/knowledge-base", 'local');
                $kb->file_path = $path;
                $kb->file_name = $file->getClientOriginalName();
                break;
        }

        $kb->save();

        // Dispatch job per processing
        ProcessKnowledgeBase::dispatch($kb);

        return redirect()->route('client.knowledge-base.index')
            ->with('success', 'Knowledge base aggiunta. L\'elaborazione è in corso...');
    }

    public function show(KnowledgeBase $knowledgeBase): Response
    {
        $knowledgeBase->load('chunks');

        return Inertia::render('Client/KnowledgeBase/Show', [
            'knowledgeBase' => $knowledgeBase,
        ]);
    }

    public function edit(KnowledgeBase $knowledgeBase): Response
    {
        return Inertia::render('Client/KnowledgeBase/Edit', [
            'knowledgeBase' => $knowledgeBase,
        ]);
    }

    public function update(Request $request, KnowledgeBase $knowledgeBase)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'content' => ['required_if:type,text', 'nullable', 'string'],
        ]);

        $knowledgeBase->title = $validated['title'];

        if ($knowledgeBase->type === 'text' && isset($validated['content'])) {
            $knowledgeBase->original_content = $validated['content'];
            $knowledgeBase->status = 'pending';
            $knowledgeBase->save();

            // Reprocess
            ProcessKnowledgeBase::dispatch($knowledgeBase);

            return redirect()->route('client.knowledge-base.index')
                ->with('success', 'Knowledge base aggiornata. Rielaborazione in corso...');
        }

        $knowledgeBase->save();

        return redirect()->route('client.knowledge-base.index')
            ->with('success', 'Knowledge base aggiornata.');
    }

    public function destroy(KnowledgeBase $knowledgeBase)
    {
        // Elimina file se presente
        if ($knowledgeBase->file_path) {
            Storage::disk('local')->delete($knowledgeBase->file_path);
        }

        $knowledgeBase->delete();

        return redirect()->route('client.knowledge-base.index')
            ->with('success', 'Knowledge base eliminata.');
    }

    /**
     * Rielabora la knowledge base.
     */
    public function reprocess(KnowledgeBase $knowledgeBase)
    {
        $knowledgeBase->update(['status' => 'pending']);
        ProcessKnowledgeBase::dispatch($knowledgeBase);

        return back()->with('success', 'Rielaborazione avviata.');
    }
}
