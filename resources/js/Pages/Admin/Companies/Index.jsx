import { Head, Link, usePage } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';

export default function CompaniesIndex({ companies }) {
  const { flash } = usePage().props;
  const [filter, setFilter] = useState('');

  const filtered = useMemo(() => {
    if (!filter.trim()) return companies;
    const q = filter.trim().toLowerCase();
    return companies.filter(
      (c) =>
        c.name?.toLowerCase().includes(q) ||
        c.slug?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.website?.toLowerCase().includes(q)
    );
  }, [companies, filter]);

  return (
    <AdminLayout>
      <Head title="Aziende" />
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Aziende</h1>
        <Link
          href="/admin/companies/create"
          className="inline-flex items-center rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-700"
        >
          Nuova azienda
        </Link>
      </div>

      {flash?.success && (
        <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {flash.success}
        </div>
      )}

      <div className="mb-4">
        <input
          type="search"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Cerca per nome, slug, email o sito web..."
          className="block w-full max-w-sm rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        />
      </div>

      <div className="w-full overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80">
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                Nome
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                Slug
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                Documenti
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                Azioni
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                  {filter.trim()
                    ? 'Nessun risultato per questa ricerca.'
                    : 'Nessuna azienda. Creane una per iniziare.'}
                </td>
              </tr>
            ) : (
              filtered.map((company) => (
                <tr
                  key={company.id}
                  className="transition-colors hover:bg-slate-50/50"
                >
                  <td className="whitespace-nowrap px-6 py-4 font-medium text-slate-900">
                    {company.name}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                    {company.slug}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                      {company.documents_count} file
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    <span className="inline-flex gap-2">
                      <Link
                        href={`/admin/companies/${company.id}`}
                        className="text-sm font-medium text-primary-600 hover:text-primary-700"
                      >
                        Dettagli
                      </Link>
                      <Link
                        href={`/admin/companies/${company.id}/edit`}
                        className="text-sm font-medium text-slate-600 hover:text-slate-900"
                      >
                        Modifica
                      </Link>
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
