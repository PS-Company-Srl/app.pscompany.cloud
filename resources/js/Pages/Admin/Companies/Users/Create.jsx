import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '../../../../Layouts/AdminLayout';

const inputClass =
  'mt-1.5 block w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 shadow-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20';
const labelClass = 'block text-sm font-medium text-slate-700';

export default function CompanyUserCreate({ company }) {
  const { data, setData, post, processing, errors } = useForm({
    name: '',
    email: '',
  });

  const submit = (e) => {
    e.preventDefault();
    post(`/admin/companies/${company.id}/users`);
  };

  return (
    <AdminLayout>
      <Head title={`Aggiungi utente – ${company.name}`} />
      <div className="mb-8 flex items-center gap-4">
        <Link href="/admin/companies" className="text-slate-600 hover:text-slate-900">
          ← Aziende
        </Link>
        <Link
          href={`/admin/companies/${company.id}`}
          className="text-slate-600 hover:text-slate-900"
        >
          {company.name}
        </Link>
        <h1 className="text-2xl font-semibold text-slate-900">Aggiungi utente cliente</h1>
      </div>

      <p className="mb-6 text-sm text-slate-600">
        Verrà creato un utente con ruolo <strong>Cliente</strong> associato a questa azienda.
        La password è generata automaticamente; comunica all’utente l’email e il link per il recupero password.
      </p>

      <form
        onSubmit={submit}
        className="max-w-xl space-y-5 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"
      >
        <div>
          <label htmlFor="name" className={labelClass}>
            Nome *
          </label>
          <input
            id="name"
            value={data.name}
            onChange={(e) => setData('name', e.target.value)}
            className={inputClass}
            placeholder="Mario Rossi"
          />
          {errors.name && <p className="mt-1.5 text-sm text-red-600">{errors.name}</p>}
        </div>
        <div>
          <label htmlFor="email" className={labelClass}>
            Email *
          </label>
          <input
            id="email"
            type="email"
            value={data.email}
            onChange={(e) => setData('email', e.target.value)}
            className={inputClass}
            placeholder="cliente@azienda.it"
          />
          {errors.email && <p className="mt-1.5 text-sm text-red-600">{errors.email}</p>}
        </div>
        <div className="flex gap-3 border-t border-slate-100 pt-6">
          <button
            type="submit"
            disabled={processing}
            className="rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-primary-700 disabled:opacity-50"
          >
            Aggiungi utente
          </button>
          <Link
            href={`/admin/companies/${company.id}`}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
          >
            Annulla
          </Link>
        </div>
      </form>
    </AdminLayout>
  );
}
