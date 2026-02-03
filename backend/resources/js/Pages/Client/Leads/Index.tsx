import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import ClientLayout from '@/Layouts/ClientLayout';
import { PaginatedData, Lead } from '@/types';
import { MagnifyingGlassIcon, UserGroupIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

interface Props {
    leads: PaginatedData<Lead>;
    filters: {
        search?: string;
        status?: string;
        source?: string;
    };
    statusCounts: {
        new: number;
        contacted: number;
        qualified: number;
        converted: number;
        lost: number;
    };
}

export default function LeadsIndex({ leads, filters, statusCounts }: Props) {
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/leads', { ...filters, search }, { preserveState: true });
    };

    const handleFilter = (key: string, value: string) => {
        router.get('/leads', { ...filters, [key]: value || undefined }, { preserveState: true });
    };

    const statusTabs = [
        { key: '', label: 'Tutti', count: Object.values(statusCounts).reduce((a, b) => a + b, 0) },
        { key: 'new', label: 'Nuovi', count: statusCounts.new },
        { key: 'contacted', label: 'Contattati', count: statusCounts.contacted },
        { key: 'qualified', label: 'Qualificati', count: statusCounts.qualified },
        { key: 'converted', label: 'Convertiti', count: statusCounts.converted },
        { key: 'lost', label: 'Persi', count: statusCounts.lost },
    ];

    return (
        <ClientLayout title="Lead">
            <Head title="Gestione Lead" />

            {/* Status Tabs */}
            <div className="mb-6 border-b border-gray-200">
                <nav className="-mb-px flex space-x-8 overflow-x-auto">
                    {statusTabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => handleFilter('status', tab.key)}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                                (filters.status || '') === tab.key
                                    ? 'border-primary-500 text-primary-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            {tab.label}
                            <span
                                className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                                    (filters.status || '') === tab.key
                                        ? 'bg-primary-100 text-primary-600'
                                        : 'bg-gray-100 text-gray-900'
                                }`}
                            >
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </nav>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <form onSubmit={handleSearch} className="flex-1 max-w-md">
                    <div className="relative">
                        <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cerca per nome, email o telefono..."
                            className="input pl-10"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </form>

                <select
                    className="input w-auto"
                    value={filters.source || ''}
                    onChange={(e) => handleFilter('source', e.target.value)}
                >
                    <option value="">Tutte le fonti</option>
                    <option value="web">Web</option>
                    <option value="whatsapp">WhatsApp</option>
                </select>

                <a
                    href={`/leads/export?${new URLSearchParams(filters as Record<string, string>).toString()}`}
                    className="btn-secondary"
                >
                    <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                    Esporta CSV
                </a>
            </div>

            {/* Leads List */}
            {leads.data.length === 0 ? (
                <div className="card">
                    <div className="card-body text-center py-12">
                        <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Nessun lead</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            I lead appariranno qui quando i visitatori lasceranno i loro contatti.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="card">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Contatto
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Stato
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Fonte
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Data
                                    </th>
                                    <th className="relative px-6 py-3">
                                        <span className="sr-only">Azioni</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {leads.data.map((lead) => (
                                    <tr key={lead.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {lead.name || 'Nome non disponibile'}
                                                </p>
                                                <p className="text-sm text-gray-500">{lead.email}</p>
                                                {lead.phone && (
                                                    <p className="text-sm text-gray-500">{lead.phone}</p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <LeadStatusBadge status={lead.status} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`badge ${lead.source === 'whatsapp' ? 'badge-success' : 'badge-info'}`}>
                                                {lead.source === 'whatsapp' ? 'WhatsApp' : 'Web'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(lead.created_at).toLocaleDateString('it-IT')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <Link
                                                href={`/leads/${lead.id}`}
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
                    {leads.last_page > 1 && (
                        <div className="border-t border-gray-200 px-4 py-3 sm:px-6">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-gray-700">
                                    Mostrando <span className="font-medium">{leads.from}</span> -{' '}
                                    <span className="font-medium">{leads.to}</span> di{' '}
                                    <span className="font-medium">{leads.total}</span>
                                </p>
                                <nav className="flex gap-2">
                                    {leads.links.map((link, index) => (
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
            )}
        </ClientLayout>
    );
}

function LeadStatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        new: 'badge-info',
        contacted: 'badge-warning',
        qualified: 'badge-success',
        converted: 'bg-green-600 text-white',
        lost: 'badge-danger',
    };

    const labels: Record<string, string> = {
        new: 'Nuovo',
        contacted: 'Contattato',
        qualified: 'Qualificato',
        converted: 'Convertito',
        lost: 'Perso',
    };

    return <span className={`badge ${styles[status] || 'badge-gray'}`}>{labels[status] || status}</span>;
}
