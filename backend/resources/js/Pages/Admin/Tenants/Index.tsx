import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { PaginatedData, Tenant } from '@/types';
import { MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline';

interface Props {
    tenants: PaginatedData<Tenant & {
        users_count: number;
        conversations_count: number;
        leads_count: number;
    }>;
    filters: {
        search?: string;
        status?: string;
        plan?: string;
    };
}

export default function TenantsIndex({ tenants, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/admin/tenants', { search }, { preserveState: true });
    };

    const handleFilter = (key: string, value: string) => {
        router.get('/admin/tenants', { ...filters, [key]: value || undefined }, { preserveState: true });
    };

    return (
        <AdminLayout title="Tenant">
            <Head title="Gestione Tenant" />

            <div className="sm:flex sm:items-center sm:justify-between">
                <div>
                    <p className="mt-1 text-sm text-gray-500">
                        Gestisci tutti i tenant della piattaforma
                    </p>
                </div>
                <div className="mt-4 sm:mt-0">
                    <Link href="/admin/tenants/create" className="btn-primary">
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Nuovo Tenant
                    </Link>
                </div>
            </div>

            {/* Filters */}
            <div className="mt-6 flex flex-col sm:flex-row gap-4">
                <form onSubmit={handleSearch} className="flex-1 max-w-md">
                    <div className="relative">
                        <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cerca per nome o slug..."
                            className="input pl-10"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </form>

                <select
                    className="input w-auto"
                    value={filters.status || ''}
                    onChange={(e) => handleFilter('status', e.target.value)}
                >
                    <option value="">Tutti gli stati</option>
                    <option value="active">Attivi</option>
                    <option value="trial">In Trial</option>
                    <option value="suspended">Sospesi</option>
                </select>

                <select
                    className="input w-auto"
                    value={filters.plan || ''}
                    onChange={(e) => handleFilter('plan', e.target.value)}
                >
                    <option value="">Tutti i piani</option>
                    <option value="starter">Starter</option>
                    <option value="business">Business</option>
                    <option value="enterprise">Enterprise</option>
                </select>
            </div>

            {/* Table */}
            <div className="mt-6 card">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Tenant
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Stato
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Piano
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Utilizzo
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Statistiche
                                </th>
                                <th className="relative px-6 py-3">
                                    <span className="sr-only">Azioni</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {tenants.data.map((tenant) => (
                                <tr key={tenant.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <Link
                                                href={`/admin/tenants/${tenant.id}`}
                                                className="font-medium text-gray-900 hover:text-primary-600"
                                            >
                                                {tenant.name}
                                            </Link>
                                            <p className="text-sm text-gray-500">{tenant.slug}.pscompany.cloud</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <StatusBadge status={tenant.status} />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="capitalize text-sm text-gray-900">{tenant.plan}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="w-24 bg-gray-200 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full ${
                                                        (tenant.messages_used_this_month / tenant.monthly_message_limit) > 0.9
                                                            ? 'bg-red-500'
                                                            : 'bg-primary-600'
                                                    }`}
                                                    style={{
                                                        width: `${Math.min(100, (tenant.messages_used_this_month / tenant.monthly_message_limit) * 100)}%`,
                                                    }}
                                                />
                                            </div>
                                            <span className="ml-2 text-xs text-gray-500">
                                                {Math.round((tenant.messages_used_this_month / tenant.monthly_message_limit) * 100)}%
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div className="flex gap-4">
                                            <span>{tenant.users_count} utenti</span>
                                            <span>{tenant.conversations_count} conv.</span>
                                            <span>{tenant.leads_count} lead</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Link
                                            href={`/admin/tenants/${tenant.id}`}
                                            className="text-primary-600 hover:text-primary-900"
                                        >
                                            Dettagli
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {tenants.last_page > 1 && (
                    <div className="border-t border-gray-200 px-4 py-3 sm:px-6">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-700">
                                Mostrando <span className="font-medium">{tenants.from}</span> -{' '}
                                <span className="font-medium">{tenants.to}</span> di{' '}
                                <span className="font-medium">{tenants.total}</span> risultati
                            </p>
                            <nav className="flex gap-2">
                                {tenants.links.map((link, index) => (
                                    <Link
                                        key={index}
                                        href={link.url || '#'}
                                        className={`px-3 py-2 text-sm rounded-md ${
                                            link.active
                                                ? 'bg-primary-600 text-white'
                                                : link.url
                                                ? 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        preserveState
                                    />
                                ))}
                            </nav>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        active: 'badge-success',
        trial: 'badge-warning',
        suspended: 'badge-danger',
    };

    const labels: Record<string, string> = {
        active: 'Attivo',
        trial: 'Trial',
        suspended: 'Sospeso',
    };

    return <span className={styles[status] || 'badge-gray'}>{labels[status] || status}</span>;
}
