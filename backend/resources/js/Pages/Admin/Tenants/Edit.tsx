import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Tenant } from '@/types';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

interface Props {
    tenant: Tenant;
}

export default function TenantEdit({ tenant }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: tenant.name,
        slug: tenant.slug,
        status: tenant.status,
        plan: tenant.plan,
        monthly_message_limit: tenant.monthly_message_limit,
        trial_ends_at: tenant.trial_ends_at ? tenant.trial_ends_at.split('T')[0] : '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(`/admin/tenants/${tenant.id}`);
    };

    return (
        <AdminLayout title={`Modifica: ${tenant.name}`}>
            <Head title={`Modifica Tenant: ${tenant.name}`} />

            <div className="mb-6">
                <Link href={`/admin/tenants/${tenant.id}`} className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700">
                    <ArrowLeftIcon className="h-4 w-4 mr-1" />
                    Torna ai dettagli
                </Link>
            </div>

            <form onSubmit={submit} className="space-y-8">
                <div className="card">
                    <div className="card-header">
                        <h3 className="text-lg font-medium text-gray-900">Informazioni Tenant</h3>
                    </div>
                    <div className="card-body space-y-6">
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div>
                                <label htmlFor="name" className="label">Nome Azienda *</label>
                                <input
                                    type="text"
                                    id="name"
                                    className={`input ${errors.name ? 'input-error' : ''}`}
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                />
                                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                            </div>

                            <div>
                                <label htmlFor="slug" className="label">Slug (subdomain) *</label>
                                <div className="flex rounded-md shadow-sm">
                                    <input
                                        type="text"
                                        id="slug"
                                        className={`input rounded-r-none ${errors.slug ? 'input-error' : ''}`}
                                        value={data.slug}
                                        onChange={(e) => setData('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                                        required
                                    />
                                    <span className="inline-flex items-center rounded-r-md border border-l-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-500">
                                        .pscompany.cloud
                                    </span>
                                </div>
                                {errors.slug && <p className="mt-1 text-sm text-red-600">{errors.slug}</p>}
                            </div>

                            <div>
                                <label htmlFor="status" className="label">Stato *</label>
                                <select
                                    id="status"
                                    className={`input ${errors.status ? 'input-error' : ''}`}
                                    value={data.status}
                                    onChange={(e) => setData('status', e.target.value as 'active' | 'trial' | 'suspended')}
                                    required
                                >
                                    <option value="trial">Trial</option>
                                    <option value="active">Attivo</option>
                                    <option value="suspended">Sospeso</option>
                                </select>
                                {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status}</p>}
                            </div>

                            <div>
                                <label htmlFor="plan" className="label">Piano *</label>
                                <select
                                    id="plan"
                                    className={`input ${errors.plan ? 'input-error' : ''}`}
                                    value={data.plan}
                                    onChange={(e) => setData('plan', e.target.value as 'starter' | 'business' | 'enterprise')}
                                    required
                                >
                                    <option value="starter">Starter</option>
                                    <option value="business">Business</option>
                                    <option value="enterprise">Enterprise</option>
                                </select>
                                {errors.plan && <p className="mt-1 text-sm text-red-600">{errors.plan}</p>}
                            </div>

                            <div>
                                <label htmlFor="monthly_message_limit" className="label">Limite Messaggi Mensili *</label>
                                <input
                                    type="number"
                                    id="monthly_message_limit"
                                    className={`input ${errors.monthly_message_limit ? 'input-error' : ''}`}
                                    value={data.monthly_message_limit}
                                    onChange={(e) => setData('monthly_message_limit', parseInt(e.target.value))}
                                    min={100}
                                    required
                                />
                                {errors.monthly_message_limit && <p className="mt-1 text-sm text-red-600">{errors.monthly_message_limit}</p>}
                            </div>

                            <div>
                                <label htmlFor="trial_ends_at" className="label">Fine Trial</label>
                                <input
                                    type="date"
                                    id="trial_ends_at"
                                    className={`input ${errors.trial_ends_at ? 'input-error' : ''}`}
                                    value={data.trial_ends_at}
                                    onChange={(e) => setData('trial_ends_at', e.target.value)}
                                />
                                {errors.trial_ends_at && <p className="mt-1 text-sm text-red-600">{errors.trial_ends_at}</p>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3">
                    <Link href={`/admin/tenants/${tenant.id}`} className="btn-secondary">
                        Annulla
                    </Link>
                    <button type="submit" disabled={processing} className="btn-primary">
                        {processing ? 'Salvataggio...' : 'Salva Modifiche'}
                    </button>
                </div>
            </form>
        </AdminLayout>
    );
}
