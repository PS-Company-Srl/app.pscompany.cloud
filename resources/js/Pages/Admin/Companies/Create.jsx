import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';

const inputClass =
  'mt-1.5 block w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 shadow-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20';
const labelClass = 'block text-sm font-medium text-slate-700';

export default function CompaniesCreate() {
  const { data, setData, post, processing, errors } = useForm({
    name: '',
    slug: '',
    email: '',
    website: '',
    phone: '',
    address: '',
    mail_from_address: '',
    mail_from_name: '',
    client_email: '',
    client_name: '',
  });

  const submit = (e) => {
    e.preventDefault();
    post('/admin/companies');
  };

  return (
    <AdminLayout>
      <Head title="Nuova azienda" />
      <div className="mb-8 flex items-center gap-4">
        <Link href="/admin/companies" className="text-slate-600 hover:text-slate-900">
          ← Aziende
        </Link>
        <h1 className="text-2xl font-semibold text-slate-900">Nuova azienda</h1>
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
            Slug (opzionale, generato da nome se vuoto)
          </label>
          <input
            id="slug"
            value={data.slug}
            onChange={(e) => setData('slug', e.target.value)}
            placeholder="es. mia-azienda"
            className={inputClass}
          />
          {errors.slug && <p className="mt-1.5 text-sm text-red-600">{errors.slug}</p>}
        </div>
        <div>
          <label htmlFor="email" className={labelClass}>
            Email azienda
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
        <div className="border-t border-slate-200 pt-6">
          <h2 className="mb-4 text-lg font-medium text-slate-900">Utente cliente</h2>
          <p className="mb-4 text-sm text-slate-600">
            Alla creazione dell&apos;azienda viene creato un utente di tipo cliente che potrà accedere alla dashboard.
          </p>
          <div className="space-y-4">
            <div>
              <label htmlFor="client_email" className={labelClass}>
                Email cliente *
              </label>
              <input
                id="client_email"
                type="email"
                value={data.client_email}
                onChange={(e) => setData('client_email', e.target.value)}
                className={inputClass}
                placeholder="es. cliente@azienda.it"
              />
              {errors.client_email && <p className="mt-1.5 text-sm text-red-600">{errors.client_email}</p>}
            </div>
            <div>
              <label htmlFor="client_name" className={labelClass}>
                Nome cliente
              </label>
              <input
                id="client_name"
                type="text"
                value={data.client_name}
                onChange={(e) => setData('client_name', e.target.value)}
                className={inputClass}
                placeholder="come nome azienda se vuoto"
              />
              {errors.client_name && <p className="mt-1.5 text-sm text-red-600">{errors.client_name}</p>}
            </div>
          </div>
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
        <div className="border-t border-slate-200 pt-6">
          <h2 className="mb-4 text-lg font-medium text-slate-900">Email di invio (opzionale)</h2>
          <p className="mb-4 text-sm text-slate-600">
            Indirizzo e nome mittente per le mail (es. recap conversazione). Se vuoti si usa il valore predefinito.
          </p>
          <div className="space-y-4">
            <div>
              <label htmlFor="mail_from_address" className={labelClass}>Email mittente</label>
              <input
                id="mail_from_address"
                type="email"
                value={data.mail_from_address}
                onChange={(e) => setData('mail_from_address', e.target.value)}
                className={inputClass}
                placeholder="es. noreply@azienda.it"
              />
            </div>
            <div>
              <label htmlFor="mail_from_name" className={labelClass}>Nome mittente</label>
              <input
                id="mail_from_name"
                type="text"
                value={data.mail_from_name}
                onChange={(e) => setData('mail_from_name', e.target.value)}
                className={inputClass}
                placeholder="es. Assistente Acme"
              />
            </div>
          </div>
        </div>
        <div className="flex gap-3 border-t border-slate-100 pt-6">
          <button
            type="submit"
            disabled={processing}
            className="rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-primary-700 disabled:opacity-50"
          >
            Crea azienda
          </button>
          <Link
            href="/admin/companies"
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
          >
            Annulla
          </Link>
        </div>
      </form>
    </AdminLayout>
  );
}
