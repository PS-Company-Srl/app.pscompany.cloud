import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Tenant, User } from '@/types';
import { ArrowLeftIcon, PencilIcon, TrashIcon, KeyIcon, UserIcon } from '@heroicons/react/24/outline';

interface Props {
    tenant: Tenant & {
        owner: User | null;
        users_count: number;
        conversations_count: number;
        leads_count: number;
        knowledge_bases_count: number;
    };
    stats: {
        conversations_total: number;
        conversations_this_month: number;
        leads_total: number;
        leads_this_month: number;
    };
}

export default function TenantShow({ tenant, stats }: Props) {
    const handleRegenerateApiKey = () => {
        if (confirm('Sei sicuro di voler rigenerare la API Key? Il widget smetterà di funzionare fino all\'aggiornamento.')) {
            router.post(`/admin/tenants/${tenant.id}/regenerate-api-key`);
        }
    };

    const handleDelete = () => {
        if (confirm(`Sei sicuro di voler eliminare il tenant "${tenant.name}"? Questa azione non può essere annullata.`)) {
            router.delete(`/admin/tenants/${tenant.id}`);
        }
    };

    const handleImpersonate = () => {
        if (tenant.owner) {
            router.post(`/admin/impersonate/${tenant.owner.id}`);
        }
    };

    return (
        <AdminLayout title={tenant.name}>
            <Head title={`Tenant: ${tenant.name}`} />

            <div className="mb-6 flex items-center justify-between">
                <Link href="/admin/tenants" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700">
                    <ArrowLeftIcon className="h-4 w-4 mr-1" />
                    Torna alla lista
                </Link>
                <div className="flex gap-3">
                    {tenant.owner && (
                        <button onClick={handleImpersonate} className="btn-secondary btn-sm">
                            <UserIcon className="h-4 w-4 mr-1" />
                            Impersona Owner
                        </button>
                    )}
                    <Link href={`/admin/tenants/${tenant.id}/edit`} className="btn-secondary btn-sm">
                        <PencilIcon className="h-4 w-4 mr-1" />
                        Modifica
                    </Link>
                    <button onClick={handleDelete} className="btn-danger btn-sm">
                        <TrashIcon className="h-4 w-4 mr-1" />
                        Elimina
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Details Card */}
                    <div className="card">
                        <div className="card-header flex items-center justify-between">
                            <h3 className="text-lg font-medium text-gray-900">Dettagli Tenant</h3>
                            <StatusBadge status={tenant.status} />
                        </div>
                        <div className="card-body">
                            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Nome</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{tenant.name}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Slug</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{tenant.slug}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">URL Pannello</dt>
                                    <dd className="mt-1 text-sm text-primary-600">
                                        <a href={`https://${tenant.slug}.pscompany.cloud`} target="_blank" rel="noopener noreferrer">
                                            {tenant.slug}.pscompany.cloud
                                        </a>
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Piano</dt>
                                    <dd className="mt-1 text-sm text-gray-900 capitalize">{tenant.plan}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Creato il</dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {new Date(tenant.created_at).toLocaleDateString('it-IT', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric',
                                        })}
                                    </dd>
                                </div>
                                {tenant.trial_ends_at && (
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Fine Trial</dt>
                                        <dd className="mt-1 text-sm text-gray-900">
                                            {new Date(tenant.trial_ends_at).toLocaleDateString('it-IT')}
                                        </dd>
                                    </div>
                                )}
                            </dl>
                        </div>
                    </div>

                    {/* API Key Card */}
                    <div className="card">
                        <div className="card-header flex items-center justify-between">
                            <h3 className="text-lg font-medium text-gray-900">API Key</h3>
                            <button onClick={handleRegenerateApiKey} className="btn-secondary btn-sm">
                                <KeyIcon className="h-4 w-4 mr-1" />
                                Rigenera
                            </button>
                        </div>
                        <div className="card-body">
                            <code className="block p-3 bg-gray-100 rounded-lg text-sm font-mono break-all">
                                {tenant.api_key}
                            </code>
                        </div>
                    </div>

                    {/* Owner Card */}
                    {tenant.owner && (
                        <div className="card">
                            <div className="card-header">
                                <h3 className="text-lg font-medium text-gray-900">Owner</h3>
                            </div>
                            <div className="card-body">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary-100">
                                            <span className="text-sm font-medium text-primary-600">
                                                {tenant.owner.name.charAt(0).toUpperCase()}
                                            </span>
                                        </span>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-900">{tenant.owner.name}</p>
                                        <p className="text-sm text-gray-500">{tenant.owner.email}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar Stats */}
                <div className="space-y-6">
                    {/* Usage Card */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="text-lg font-medium text-gray-900">Utilizzo Mese</h3>
                        </div>
                        <div className="card-body">
                            <div className="mb-2 flex justify-between text-sm">
                                <span className="text-gray-500">Messaggi</span>
                                <span className="font-medium">
                                    {tenant.messages_used_this_month.toLocaleString()} / {tenant.monthly_message_limit.toLocaleString()}
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                                <div
                                    className={`h-3 rounded-full ${
                                        (tenant.messages_used_this_month / tenant.monthly_message_limit) > 0.9
                                            ? 'bg-red-500'
                                            : (tenant.messages_used_this_month / tenant.monthly_message_limit) > 0.7
                                            ? 'bg-yellow-500'
                                            : 'bg-green-500'
                                    }`}
                                    style={{
                                        width: `${Math.min(100, (tenant.messages_used_this_month / tenant.monthly_message_limit) * 100)}%`,
                                    }}
                                />
                            </div>
                            <p className="mt-2 text-sm text-gray-500">
                                {Math.round((tenant.messages_used_this_month / tenant.monthly_message_limit) * 100)}% utilizzato
                            </p>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="text-lg font-medium text-gray-900">Statistiche</h3>
                        </div>
                        <div className="card-body space-y-4">
                            <StatItem label="Utenti" value={tenant.users_count} />
                            <StatItem label="Knowledge Base" value={tenant.knowledge_bases_count} />
                            <StatItem label="Conversazioni Totali" value={stats.conversations_total} />
                            <StatItem label="Conversazioni Mese" value={stats.conversations_this_month} />
                            <StatItem label="Lead Totali" value={stats.leads_total} />
                            <StatItem label="Lead Mese" value={stats.leads_this_month} />
                        </div>
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

function StatItem({ label, value }: { label: string; value: number }) {
    return (
        <div className="flex justify-between">
            <span className="text-sm text-gray-500">{label}</span>
            <span className="text-sm font-medium text-gray-900">{value}</span>
        </div>
    );
}
