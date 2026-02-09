import { Head, Link, router, useForm } from '@inertiajs/react';
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
    widget_primary_color: company.widget_primary_color ?? '#4f46e5',
    widget_position: company.widget_position ?? 'bottom-right',
    widget_icon: null,
    remove_icon: false,
  });

  const submit = (e) => {
    e.preventDefault();
    const hasFile = data.widget_icon instanceof File;
    const removeIcon = !!data.remove_icon;
    if (hasFile || removeIcon) {
      const formData = new FormData();
      formData.append('_method', 'PUT');
      formData.append('name', data.name);
      formData.append('slug', data.slug || '');
      formData.append('email', data.email || '');
      formData.append('website', data.website || '');
      formData.append('phone', data.phone || '');
      formData.append('address', data.address || '');
      formData.append('widget_primary_color', data.widget_primary_color || '');
      formData.append('widget_position', data.widget_position || '');
      formData.append('remove_icon', removeIcon ? '1' : '0');
      if (hasFile) formData.append('widget_icon', data.widget_icon);
      router.post(`/admin/companies/${company.id}`, formData, {
        forceFormData: true,
        preserveScroll: true,
      });
    } else {
      put(`/admin/companies/${company.id}`);
    }
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

        <div className="border-t border-slate-200 pt-6">
          <h2 className="mb-4 text-lg font-medium text-slate-900">Chatbot (widget)</h2>
          <div className="space-y-5">
            <div>
              <label htmlFor="widget_primary_color" className={labelClass}>
                Colore principale
              </label>
              <div className="mt-1.5 flex items-center gap-3">
                <input
                  id="widget_primary_color"
                  type="color"
                  value={data.widget_primary_color}
                  onChange={(e) => setData('widget_primary_color', e.target.value)}
                  className="h-10 w-14 cursor-pointer rounded border border-slate-300 p-0.5"
                />
                <input
                  type="text"
                  value={data.widget_primary_color}
                  onChange={(e) => setData('widget_primary_color', e.target.value)}
                  placeholder="#4f46e5"
                  className={inputClass + ' max-w-[140px] font-mono'}
                />
              </div>
              {errors.widget_primary_color && (
                <p className="mt-1.5 text-sm text-red-600">{errors.widget_primary_color}</p>
              )}
            </div>
            <div>
              <label className={labelClass}>Posizione widget</label>
              <div className="mt-1.5 flex gap-4">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="widget_position"
                    value="bottom-right"
                    checked={data.widget_position === 'bottom-right'}
                    onChange={() => setData('widget_position', 'bottom-right')}
                    className="text-primary-600"
                  />
                  <span className="text-sm text-slate-700">In basso a destra</span>
                </label>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="widget_position"
                    value="bottom-left"
                    checked={data.widget_position === 'bottom-left'}
                    onChange={() => setData('widget_position', 'bottom-left')}
                    className="text-primary-600"
                  />
                  <span className="text-sm text-slate-700">In basso a sinistra</span>
                </label>
              </div>
              {errors.widget_position && (
                <p className="mt-1.5 text-sm text-red-600">{errors.widget_position}</p>
              )}
            </div>
            <div>
              <label htmlFor="widget_icon" className={labelClass}>
                Icona pulsante chat
              </label>
              <p className="mt-0.5 text-xs text-slate-500">
                Immagine quadrata consigliata (es. 64×64 px). JPG, PNG, GIF o WebP, max 512 KB.
              </p>
              <div className="mt-1.5 flex flex-wrap items-center gap-4">
                {(company.widget_icon_url && !data.remove_icon) || (data.widget_icon instanceof File) ? (
                  <span className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                    {data.widget_icon instanceof File ? (
                      <img
                        src={URL.createObjectURL(data.widget_icon)}
                        alt="Anteprima"
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <img
                        src={company.widget_icon_url}
                        alt="Icona attuale"
                        className="h-full w-full object-contain"
                      />
                    )}
                  </span>
                ) : null}
                <div className="flex flex-col gap-2">
                  <input
                    id="widget_icon"
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      setData('widget_icon', file || null);
                      if (file) setData('remove_icon', false);
                    }}
                    className="block w-full max-w-xs text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-primary-100 file:px-3 file:py-1.5 file:text-primary-700"
                  />
                  {company.widget_icon_url && (
                    <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                      <input
                        type="checkbox"
                        checked={data.remove_icon}
                        onChange={(e) => setData('remove_icon', e.target.checked)}
                      />
                      Rimuovi icona (usa emoji predefinita)
                    </label>
                  )}
                </div>
              </div>
              {errors.widget_icon && (
                <p className="mt-1.5 text-sm text-red-600">{errors.widget_icon}</p>
              )}
            </div>
          </div>
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
