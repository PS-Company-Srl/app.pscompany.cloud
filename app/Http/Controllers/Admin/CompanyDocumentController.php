<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Jobs\ProcessCompanyDocument;
use App\Models\Company;
use App\Models\CompanyDocument;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CompanyDocumentController extends Controller
{
    private const ALLOWED_MIMES = [
        'application/pdf',
        'application/msword', // .doc
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    ];

    private const MAX_SIZE_MB = 10;

    public function store(Request $request, Company $company): RedirectResponse
    {
        $request->validate([
            'document' => [
                'required',
                'file',
                'mimes:pdf,doc,docx',
                'max:' . (self::MAX_SIZE_MB * 1024),
            ],
        ], [
            'document.mimes' => 'Il file deve essere PDF o Word (.doc, .docx).',
            'document.max' => 'Il file non deve superare ' . self::MAX_SIZE_MB . ' MB.',
        ]);

        $file = $request->file('document');
        $originalName = $file->getClientOriginalName();
        $path = $file->store(
            'company_documents/' . $company->id,
            'local',
            ['visibility' => 'private']
        );

        $doc = $company->documents()->create([
            'name' => $originalName,
            'file_path' => $path,
            'mime_type' => $file->getMimeType(),
            'file_size' => $file->getSize(),
        ]);

        ProcessCompanyDocument::dispatch($doc);

        return back()->with('success', 'Documento caricato. Il testo verrà estratto in background per il chatbot.');
    }

    public function destroy(Company $company, CompanyDocument $document): RedirectResponse
    {
        if ($document->company_id !== $company->id) {
            abort(404);
        }

        $document->delete();

        return back()->with('success', 'Documento eliminato.');
    }
}
