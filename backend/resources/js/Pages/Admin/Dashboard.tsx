import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Tenant } from '@/types';

interface Props {
    stats: {
        tenants_total: number;
        tenants_active: number;
        tenants_trial: number;
        tenants_suspended: number;
        conversations_today: number;
        conversations_this_month: number;
        leads_this_month: number;
        messages_total_this_month: number;
    };
    recentTenants: Tenant[];
    topTenants: Tenant[];
}

export default function AdminDashboard({ stats, recentTenants, topTenants }: Props) {
    const statCards = [
        { name: 'Tenant Totali', value: stats.tenants_total, color: 'bg-blue-500' },
        { name: 'Tenant Attivi', value: stats.tenants_active, color: 'bg-green-500' },
        { name: 'In Trial', value: stats.tenants_trial, color: 'bg-yellow-500' },
        { name: 'Sospesi', value: stats.tenants_suspended, color: 'bg-red-500' },
    ];

    const activityCards = [
        { name: 'Conversazioni Oggi', value: stats.conversations_today },
        { name: 'Conversazioni Mese', value: stats.conversations_this_month },
        { name: 'Lead Mese', value: stats.leads_this_month },
        { name: 'Messaggi Totali Mese', value: stats.messages_total_this_month.toLocaleString() },
    ];

    return (
        <AdminLayout title="Dashboard">
            <Head title="Dashboard Admin" />

            {/* Stats */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {statCards.map((stat) => (
                    <div key={stat.name} className="card">
                        <div className="card-body">
                            <div className="flex items-center">
                                <div className={`flex-shrink-0 rounded-md p-3 ${stat.color}`}>
                                    <div className="h-6 w-6 text-white" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="truncate text-sm font-medium text-gray-500">{stat.name}</dt>
                                        <dd className="text-2xl font-semibold text-gray-900">{stat.value}</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Activity Stats */}
            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {activityCards.map((stat) => (
                    <div key={stat.name} className="card">
                        <div className="card-body">
                            <dt className="truncate text-sm font-medium text-gray-500">{stat.name}</dt>
                            <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{stat.value}</dd>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tables */}
            <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
                {/* Recent Tenants */}
                <div className="card">
                    <div className="card-header flex items-center justify-between">
                        <h3 className="text-base font-semibold text-gray-900">Ultimi Tenant Creati</h3>
                        <Link href="/admin/tenants" className="text-sm font-medium text-primary-600 hover:text-primary-500">
                            Vedi tutti
                        </Link>
                    </div>
                    <div className="card-body p-0">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stato</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Piano</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {recentTenants.map((tenant) => (
                                    <tr key={tenant.id}>
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <Link href={`/admin/tenants/${tenant.id}`} className="font-medium text-gray-900 hover:text-primary-600">
                                                {tenant.name}
                                            </Link>
                                            <p className="text-sm text-gray-500">{tenant.slug}.pscompany.cloud</p>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <StatusBadge status={tenant.status} />
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 capitalize">
                                            {tenant.plan}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Top Usage */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="text-base font-semibold text-gray-900">Top Utilizzo Questo Mese</h3>
                    </div>
                    <div className="card-body p-0">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tenant</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Utilizzo</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {topTenants.map((tenant) => (
                                    <tr key={tenant.id}>
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <Link href={`/admin/tenants/${tenant.id}`} className="font-medium text-gray-900 hover:text-primary-600">
                                                {tenant.name}
                                            </Link>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="w-full max-w-[150px] bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-primary-600 h-2 rounded-full"
                                                        style={{
                                                            width: `${Math.min(100, (tenant.messages_used_this_month / tenant.monthly_message_limit) * 100)}%`,
                                                        }}
                                                    />
                                                </div>
                                                <span className="ml-3 text-sm text-gray-500">
                                                    {tenant.messages_used_this_month.toLocaleString()} / {tenant.monthly_message_limit.toLocaleString()}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
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
