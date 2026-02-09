import { Head, Link } from '@inertiajs/react';
import CustomerLayout from '../../Layouts/CustomerLayout';

export default function CustomerDashboard({ company }) {
  const chatbots = company?.chatbots || [];

  return (
    <CustomerLayout>
      <Head title="Dashboard" />
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
        <Link
          href="/dashboard/chatbots/create"
          className="rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-primary-700"
        >
          Nuovo chatbot
        </Link>
      </div>

      <p className="mb-6 text-slate-600">
        Benvenuto, <strong>{company?.name}</strong>. Qui puoi gestire i tuoi chatbot.
      </p>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-medium text-slate-900">I tuoi chatbot</h2>
        {chatbots.length === 0 ? (
          <p className="text-slate-500">Nessun chatbot. Creane uno per iniziare.</p>
        ) : (
          <ul className="space-y-3">
            {chatbots.map((bot) => (
              <li
                key={bot.id}
                className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3"
              >
                <span className="font-medium text-slate-900">{bot.name}</span>
                <Link
                  href={`/dashboard/chatbots/${bot.id}/edit`}
                  className="text-sm font-medium text-primary-600 hover:text-primary-700"
                >
                  Modifica
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </CustomerLayout>
  );
}
