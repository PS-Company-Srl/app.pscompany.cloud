import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';

export default function CompaniesShow({ company, appUrl, hasWebsiteContent, syncWebsiteUrl }) {
  const { flash, csrf_token } = usePage().props;
  const apiUrl = appUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  const embedSnippet = apiUrl
    ? `<script src="${apiUrl}/widget.js" data-api-key="${company.api_key || ''}" data-api-url="${apiUrl}"></script>`
    : '';
  const documentForm = useForm({
    document: null,
  });

  const submitDocument = (e) => {
    e.preventDefault();
    documentForm.post(`/admin/companies/${company.id}/documents`, {
      forceFormData: true,
      onSuccess: () => documentForm.reset('document'),
    });
  };

  const deleteDocument = (documentId) => {
    if (confirm('Eliminare questo documento?')) {
      router.delete(`/admin/companies/${company.id}/documents/${documentId}`);
    }
  };

  const formatSize = (bytes) => {
    if (!bytes) return '-';
    if (bytes < 1024) return bytes + ' B';
    return (bytes / 1024).toFixed(1) + ' KB';
  };

  return (
    <AdminLayout>
      <Head title={company.name} />
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/companies" className="text-slate-600 hover:text-slate-900">
            ← Aziende
          </Link>
          <h1 className="text-2xl font-semibold text-slate-900">{company.name}</h1>
        </div>
        <Link
          href={`/admin/companies/${company.id}/edit`}
          className="rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-primary-700"
        >
          Modifica
        </Link>
      </div>

      {company.api_key && (
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-medium text-slate-900">Chatbot per il sito</h2>
          <p className="mb-4 text-sm text-slate-600">
            Inserisci il codice qui sotto nel sito web del cliente per attivare il chatbot basato sui documenti caricati.
          </p>
          <div className="mb-4">
            <label className="mb-1 block text-xs font-medium text-slate-500">API Key (per riferimento)</label>
            <code className="block break-all rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-800">
              {company.api_key}
            </code>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Codice da incorporare</label>
            <pre className="overflow-x-auto rounded-lg bg-slate-900 px-4 py-3 text-sm text-slate-100">
              {embedSnippet}
            </pre>
            <button
              type="button"
              onClick={() => navigator.clipboard?.writeText(embedSnippet)}
              className="mt-2 rounded-lg bg-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-300"
            >
              Copia codice
            </button>
          </div>
        </div>
      )}

      {company.website && (
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-medium text-slate-900">Contenuto dal sito web</h2>
          <p className="mb-4 text-sm text-slate-600">
            Il chatbot usa il contenuto del sito dell’azienda (analizzato in automatico) e i documenti caricati sotto.
          </p>
          {hasWebsiteContent && (
            <p className="mb-4 text-sm text-emerald-700">Contenuto dal sito incluso nel chatbot.</p>
          )}
          <form
            action={syncWebsiteUrl || `/admin/companies/${company.id}/sync-website`}
            method="post"
            className="inline"
          >
            <input type="hidden" name="_token" value={csrf_token} />
            <button
              type="submit"
              className="cursor-pointer rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
            >
              {hasWebsiteContent ? 'Rianalizza sito' : 'Analizza sito e aggiorna contenuto'}
            </button>
          </form>
        </div>
      )}

      {(company.email || company.website || company.phone || company.address) && (
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-medium text-slate-900">Dati azienda</h2>
          <dl className="grid gap-3 sm:grid-cols-2">
            {company.email && (
              <>
                <dt className="text-sm text-slate-500">Email</dt>
                <dd className="text-slate-900">{company.email}</dd>
              </>
            )}
            {company.website && (
              <>
                <dt className="text-sm text-slate-500">Sito web</dt>
                <dd>
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:underline"
                  >
                    {company.website}
                  </a>
                </dd>
              </>
            )}
            {company.phone && (
              <>
                <dt className="text-sm text-slate-500">Telefono</dt>
                <dd className="text-slate-900">{company.phone}</dd>
              </>
            )}
            {company.address && (
              <>
                <dt className="text-sm text-slate-500">Indirizzo</dt>
                <dd className="whitespace-pre-line text-slate-900">{company.address}</dd>
              </>
            )}
          </dl>
        </div>
      )}

      {(flash?.success || flash?.error) && (
        <div
          className={
            flash.error
              ? 'mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800'
              : 'mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800'
          }
        >
          {flash.error || flash.success}
        </div>
      )}

      <div className="space-y-8">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-medium text-slate-900">
            Knowledge base – Carica documento (PDF o Word)
          </h2>
          <form onSubmit={submitDocument} className="flex flex-wrap items-end gap-4">
            <div className="min-w-0 flex-1">
              <input
                type="file"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={(e) => documentForm.setData('document', e.target.files[0] ?? null)}
                className="block w-full text-sm text-slate-500 file:mr-4 file:rounded-xl file:border-0 file:bg-primary-50 file:px-4 file:py-2.5 file:text-sm file:font-medium file:text-primary-700"
              />
              {documentForm.errors.document && (
                <p className="mt-1.5 text-sm text-red-600">{documentForm.errors.document}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={documentForm.processing || !documentForm.data.document}
              className="rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-primary-700 disabled:opacity-50"
            >
              Carica
            </button>
          </form>
          <p className="mt-2 text-sm text-slate-500">
            Formati: PDF, .doc, .docx. Max 10 MB.
          </p>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-medium text-slate-900">Documenti caricati</h2>
          {company.documents?.length === 0 ? (
            <p className="text-slate-500">Nessun documento caricato.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {company.documents?.map((doc) => (
                <li
                  key={doc.id}
                  className="flex items-center justify-between py-3 first:pt-0"
                >
                  <div>
                    <span className="font-medium text-slate-900">{doc.name}</span>
                    <span className="ml-2 text-sm text-slate-500">
                      {formatSize(doc.file_size)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteDocument(doc.id)}
                    className="text-sm font-medium text-red-600 hover:text-red-700"
                  >
                    Elimina
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </AdminLayout>
  );
}
