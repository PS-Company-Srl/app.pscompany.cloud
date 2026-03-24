import { Head, Link, usePage, router } from '@inertiajs/react';
import AdminLayout from '../../../../Layouts/AdminLayout';

const GOAL_LABELS = {
  assistant: 'Solo assistente',
  lead_capture: 'Assistente + email/telefono',
  custom: 'Obiettivo personalizzato',
};

export default function AdminCompaniesChatbotsIndex({ company, chatbots, appUrl }) {
  const { flash } = usePage().props;
  const baseUrl = appUrl || (typeof window !== 'undefined' ? window.location.origin : '');

  const deleteChatbot = (bot) => {
    if (confirm(`Eliminare il chatbot "${bot.name}"?`)) {
      router.delete(`/admin/companies/${company.id}/chatbots/${bot.id}`);
    }
  };

  return (
    <AdminLayout>
      <Head title={`Chatbot – ${company.name}`} />
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/companies" className="text-slate-600 hover:text-slate-900">
            ← Aziende
          </Link>
          <Link
            href={`/admin/companies/${company.id}`}
            className="text-slate-600 hover:text-slate-900"
          >
            {company.name}
          </Link>
          <h1 className="text-2xl font-semibold text-slate-900">Chatbot</h1>
        </div>
        <Link
          href={`/admin/companies/${company.id}/chatbots/create`}
          className="rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-primary-700"
        >
          Nuovo chatbot
        </Link>
      </div>

      {flash?.success && (
        <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {flash.success}
        </div>
      )}

      <div className="space-y-4">
        {chatbots.length === 0 ? (
          <p className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
            Nessun chatbot. Creane uno per questa azienda.
          </p>
        ) : (
          chatbots.map((bot) => {
            const embedSnippet = baseUrl
              ? `<script src="${baseUrl}/widget.js" data-api-key="${bot.api_key}" data-api-url="${baseUrl}"></script>`
              : '';
            return (
              <div
                key={bot.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-medium text-slate-900">{bot.name}</h2>
                    <p className="text-sm text-slate-500">
                      {GOAL_LABELS[bot.goal_type] || bot.goal_type}
                    </p>
                    {bot.bertoli_configuration_enabled && (
                      <p className="mt-1 text-xs font-medium text-primary-700">
                        Configurazione Bertoli attiva
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/admin/companies/${company.id}/chatbots/${bot.id}/conversations`}
                      className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Conversazioni
                    </Link>
                    <Link
                      href={`/admin/companies/${company.id}/chatbots/${bot.id}/edit`}
                      className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Modifica
                    </Link>
                    <button
                      type="button"
                      onClick={() => deleteChatbot(bot)}
                      className="rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                    >
                      Elimina
                    </button>
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">
                    Codice da incorporare nel sito
                  </label>
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
            );
          })
        )}
      </div>
    </AdminLayout>
  );
}
