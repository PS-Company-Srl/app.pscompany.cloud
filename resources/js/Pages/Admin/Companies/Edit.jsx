import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';

const inputClass =
  'mt-1.5 block w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 shadow-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20';
const labelClass = 'block text-sm font-medium text-slate-700';

export default function CompaniesEdit({ company }) {
  const { data, setData, put, processing, errors } = useForm({
    name: company.name,
    slug: company.slug,
    email: company.email ?? '',
    website: company.website ?? '',
    phone: company.phone ?? '',
    address: company.address ?? '',
  });

  const submit = (e) => {
    e.preventDefault();
    put(`/admin/companies/${company.id}`);
  };

  return (
    <AdminLayout>
      <Head title={`Modifica ${company.name}`} />
      <div className="mb-8 flex items-center gap-4">
        <Link href="/admin/companies" className="text-slate-600 hover:text-slate-900">
          ← Aziende
        </Link>
        <h1 className="text-2xl font-semibold text-slate-900">Modifica {company.name}</h1>
      </div>

      <form
        onSubmit={submit}
        className="max-w-2xl space-y-5 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"
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
          <label htmlFor="slug" className={labelClass}>
            Slug
          </label>
          <input
            id="slug"
            value={data.slug}
            onChange={(e) => setData('slug', e.target.value)}
            className={inputClass}
          />
          {errors.slug && <p className="mt-1.5 text-sm text-red-600">{errors.slug}</p>}
        </div>
        <div>
          <label htmlFor="email" className={labelClass}>
            Email
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
          <label htmlFor="website" className={labelClass}>
            Sito web
          </label>
          <input
            id="website"
            type="url"
            value={data.website}
            onChange={(e) => setData('website', e.target.value)}
            placeholder="https://..."
            className={inputClass}
          />
          {errors.website && <p className="mt-1.5 text-sm text-red-600">{errors.website}</p>}
        </div>
        <div>
          <label htmlFor="phone" className={labelClass}>
            Telefono
          </label>
          <input
            id="phone"
            value={data.phone}
            onChange={(e) => setData('phone', e.target.value)}
            className={inputClass}
          />
          {errors.phone && <p className="mt-1.5 text-sm text-red-600">{errors.phone}</p>}
        </div>
        <div>
          <label htmlFor="address" className={labelClass}>
            Indirizzo
          </label>
          <textarea
            id="address"
            value={data.address}
            onChange={(e) => setData('address', e.target.value)}
            rows={2}
            className={inputClass}
          />
          {errors.address && <p className="mt-1.5 text-sm text-red-600">{errors.address}</p>}
        </div>

        <p className="text-sm text-slate-500">
          I chatbot (obiettivo, colori, icona) si gestiscono dalla dashboard del cliente.
        </p>

        <div className="flex gap-3 border-t border-slate-100 pt-6">
          <button
            type="submit"
            disabled={processing}
            className="rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-primary-700 disabled:opacity-50"
          >
            Salva
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
