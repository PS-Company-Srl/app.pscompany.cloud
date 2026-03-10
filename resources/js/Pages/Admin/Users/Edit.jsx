import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';

const inputClass =
  'mt-1.5 block w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 shadow-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20';
const labelClass = 'block text-sm font-medium text-slate-700';

export default function AdminUsersEdit({ user, roles, companies }) {
  const { data, setData, put, processing, errors } = useForm({
    name: user.name ?? '',
    email: user.email ?? '',
    role_id: user.role?.id ?? '',
    company_id: user.company_id ?? '',
    password: '',
    password_confirmation: '',
  });

  const submit = (e) => {
    e.preventDefault();
    put(`/admin/users/${user.id}`);
  };

  return (
    <AdminLayout>
      <Head title={`Modifica utente – ${user.name}`} />
      <div className="mb-8 flex items-center gap-4">
        <Link href="/admin/users" className="text-slate-600 hover:text-slate-900">
          ← Utenti
        </Link>
        <h1 className="text-2xl font-semibold text-slate-900">Modifica utente</h1>
      </div>

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
          />
          {errors.email && <p className="mt-1.5 text-sm text-red-600">{errors.email}</p>}
        </div>
        <div>
          <label htmlFor="role_id" className={labelClass}>
            Ruolo *
          </label>
          <select
            id="role_id"
            value={data.role_id}
            onChange={(e) => setData('role_id', e.target.value)}
            className={inputClass}
          >
            <option value="">— Seleziona —</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name === 'admin' ? 'Admin' : 'Cliente'}
              </option>
            ))}
          </select>
          {errors.role_id && <p className="mt-1.5 text-sm text-red-600">{errors.role_id}</p>}
        </div>
        <div>
          <label htmlFor="company_id" className={labelClass}>
            Azienda
          </label>
          <select
            id="company_id"
            value={data.company_id || ''}
            onChange={(e) => setData('company_id', e.target.value || null)}
            className={inputClass}
          >
            <option value="">— Nessuna —</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-slate-500">
            Per i clienti, l’azienda consente l’accesso alla dashboard cliente.
          </p>
          {errors.company_id && <p className="mt-1.5 text-sm text-red-600">{errors.company_id}</p>}
        </div>
        <div className="border-t border-slate-200 pt-6">
          <label htmlFor="password" className={labelClass}>
            Nuova password
          </label>
          <p className="mb-2 text-xs text-slate-500">
            Lascia vuoto per non modificare la password.
          </p>
          <input
            id="password"
            type="password"
            value={data.password}
            onChange={(e) => setData('password', e.target.value)}
            className={inputClass}
            placeholder="••••••••"
            autoComplete="new-password"
          />
          {errors.password && <p className="mt-1.5 text-sm text-red-600">{errors.password}</p>}
          <input
            type="password"
            value={data.password_confirmation}
            onChange={(e) => setData('password_confirmation', e.target.value)}
            className={`${inputClass} mt-2`}
            placeholder="Conferma password"
            autoComplete="new-password"
          />
          {errors.password_confirmation && (
            <p className="mt-1.5 text-sm text-red-600">{errors.password_confirmation}</p>
          )}
        </div>
        <div className="flex gap-3 border-t border-slate-100 pt-6">
          <button
            type="submit"
            disabled={processing}
            className="rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-primary-700 disabled:opacity-50"
          >
            Salva
          </button>
          <Link
            href="/admin/users"
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
          >
            Annulla
          </Link>
        </div>
      </form>
    </AdminLayout>
  );
}
