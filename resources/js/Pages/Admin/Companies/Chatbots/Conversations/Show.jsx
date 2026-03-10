import { Head, Link } from '@inertiajs/react';
import AdminLayout from '../../../../../Layouts/AdminLayout';

function formatDate(value) {
  if (!value) return '–';
  const d = new Date(value);
  return d.toLocaleDateString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export default function AdminConversationsShow({ company, chatbot, conversation }) {
  const history = conversation.message_history || [];

  return (
    <AdminLayout>
      <Head title={`Conversazione – ${chatbot.name}`} />
      <div className="mb-6 flex items-center gap-4">
        <Link href="/admin/companies" className="text-slate-600 hover:text-slate-900">
          ← Aziende
        </Link>
        <Link
          href={`/admin/companies/${company.id}`}
          className="text-slate-600 hover:text-slate-900"
        >
          {company.name}
        </Link>
        <Link
          href={`/admin/companies/${company.id}/chatbots`}
          className="text-slate-600 hover:text-slate-900"
        >
          Chatbot
        </Link>
        <Link
          href={`/admin/companies/${company.id}/chatbots/${chatbot.id}/conversations`}
          className="text-slate-600 hover:text-slate-900"
        >
          Conversazioni
        </Link>
        <h1 className="text-2xl font-semibold text-slate-900">Conversazione</h1>
      </div>

      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4">
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 text-sm">
          <div>
            <dt className="font-medium text-slate-500">Iniziata</dt>
            <dd className="text-slate-900">{formatDate(conversation.started_at)}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-500">Session ID</dt>
            <dd className="font-mono text-slate-700 truncate" title={conversation.session_id}>
              {conversation.session_id || '–'}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-slate-500">Nome</dt>
            <dd className="text-slate-900">{conversation.first_name || '–'}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-500">Cognome</dt>
            <dd className="text-slate-900">{conversation.last_name || '–'}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-500">Email</dt>
            <dd className="text-slate-900">{conversation.email || '–'}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-500">Telefono</dt>
            <dd className="text-slate-900">{conversation.phone || '–'}</dd>
          </div>
        </dl>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-2">
          <h2 className="text-sm font-medium text-slate-700">Messaggi ({history.length})</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {history.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              Nessun messaggio in questa conversazione.
            </div>
          ) : (
            history.map((msg, i) => (
              <div
                key={i}
                className={`px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-slate-50/80'
                    : 'bg-white'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`inline-flex rounded px-2 py-0.5 text-xs font-medium ${
                      msg.role === 'user'
                        ? 'bg-primary-100 text-primary-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {msg.role === 'user' ? 'Utente' : 'Assistente'}
                  </span>
                  {msg.created_at && (
                    <span className="text-xs text-slate-400">
                      {formatDate(msg.created_at)}
                    </span>
                  )}
                </div>
                <div className="text-sm text-slate-900 whitespace-pre-wrap break-words">
                  {msg.content || '–'}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-4">
        <Link
          href={`/admin/companies/${company.id}/chatbots/${chatbot.id}/conversations`}
          className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          ← Torna all’elenco conversazioni
        </Link>
      </div>
    </AdminLayout>
  );
}
