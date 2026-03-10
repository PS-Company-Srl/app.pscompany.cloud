import { Head, Link } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';

function StatCard({ label, value, href, linkLabel }) {
  return (
    <Link
      href={href}
      className="group block overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-primary-200 hover:shadow-md"
    >
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">{value}</p>
      <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary-600 group-hover:underline">
        {linkLabel}
        <span aria-hidden>→</span>
      </span>
    </Link>
  );
}

export default function AdminDashboard({ stats }) {
  return (
    <AdminLayout>
      <Head title="Dashboard" />
      <h1 className="mb-8 text-2xl font-semibold text-slate-900">Dashboard</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Aziende"
          value={stats.companies_count}
          href="/admin/companies"
          linkLabel="Gestisci"
        />
        <StatCard
          label="Utenti"
          value={stats.users_count}
          href="/admin/users"
          linkLabel="Elenco"
        />
      </div>
    </AdminLayout>
  );
}
