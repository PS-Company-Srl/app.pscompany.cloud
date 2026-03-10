import { Head, Link } from '@inertiajs/react';
import AdminLayout from '../../../../Layouts/AdminLayout';

function formatDate(value) {
  if (!value) return '–';
  const d = new Date(value);
  return d.toLocaleDateString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function AdminCompaniesRecapEmailsIndex({ company, conversations }) {
  return (
    <AdminLayout>
      <Head title={`Mail recap inviate – ${company.name}`} />
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
        <h1 className="text-2xl font-semibold text-slate-900">
          Mail recap inviate
        </h1>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {conversations.data.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            Nessuna mail di recap inviata ancora per questa azienda.
          </div>
        ) : (
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">
                  Data invio
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">
                  Destinatario
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">
                  Chatbot
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">
                  Iniziata
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-500">
                  Azioni
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {conversations.data.map((conv) => (
                <tr key={conv.id} className="hover:bg-slate-50/50">
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-900">
                    {formatDate(conv.recap_email_sent_at)}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {conv.email || '–'}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {conv.chatbot?.name ?? '–'}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                    {formatDate(conv.started_at)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-sm">
                    <Link
                      href={`/admin/companies/${company.id}/chatbots/${conv.chatbot?.id}/conversations/${conv.id}`}
                      className="text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Vedi conversazione
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {conversations.links?.length > 1 && (
          <div className="border-t border-slate-200 px-4 py-3 flex flex-wrap gap-2 justify-center">
            {conversations.links.map((link, i) =>
              link.url ? (
                <Link
                  key={i}
                  href={link.url}
                  className={`rounded-lg px-3 py-1.5 text-sm ${
                    link.active ? 'bg-primary-100 text-primary-800 font-medium' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                  dangerouslySetInnerHTML={{ __html: link.label }}
                />
              ) : (
                <span
                  key={i}
                  className="rounded-lg px-3 py-1.5 text-sm text-slate-400 cursor-default"
                  dangerouslySetInnerHTML={{ __html: link.label }}
                />
              )
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
