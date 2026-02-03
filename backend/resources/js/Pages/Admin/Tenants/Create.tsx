import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function TenantCreate() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        slug: '',
        status: 'trial',
        plan: 'starter',
        monthly_message_limit: 1000,
        trial_ends_at: '',
        owner_name: '',
        owner_email: '',
        owner_password: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/admin/tenants');
    };

    // Auto-genera slug dal nome
    const handleNameChange = (value: string) => {
        setData((prev) => ({
            ...prev,
            name: value,
            slug: value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        }));
    };

    return (
        <AdminLayout title="Nuovo Tenant">
            <Head title="Crea Tenant" />

            <div className="mb-6">
                <Link href="/admin/tenants" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700">
                    <ArrowLeftIcon className="h-4 w-4 mr-1" />
                    Torna alla lista
                </Link>
            </div>

            <form onSubmit={submit} className="space-y-8">
                {/* Informazioni Tenant */}
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
                                    onChange={(e) => handleNameChange(e.target.value)}
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
                                    onChange={(e) => setData('status', e.target.value)}
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
                                    onChange={(e) => setData('plan', e.target.value)}
                                    required
                                >
                                    <option value="starter">Starter (1.000 msg/mese)</option>
                                    <option value="business">Business (5.000 msg/mese)</option>
                                    <option value="enterprise">Enterprise (20.000 msg/mese)</option>
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

                {/* Owner Info */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="text-lg font-medium text-gray-900">Utente Owner</h3>
                        <p className="mt-1 text-sm text-gray-500">Credenziali per l'accesso al pannello del cliente</p>
                    </div>
                    <div className="card-body space-y-6">
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div>
                                <label htmlFor="owner_name" className="label">Nome *</label>
                                <input
                                    type="text"
                                    id="owner_name"
                                    className={`input ${errors.owner_name ? 'input-error' : ''}`}
                                    value={data.owner_name}
                                    onChange={(e) => setData('owner_name', e.target.value)}
                                    required
                                />
                                {errors.owner_name && <p className="mt-1 text-sm text-red-600">{errors.owner_name}</p>}
                            </div>

                            <div>
                                <label htmlFor="owner_email" className="label">Email *</label>
                                <input
                                    type="email"
                                    id="owner_email"
                                    className={`input ${errors.owner_email ? 'input-error' : ''}`}
                                    value={data.owner_email}
                                    onChange={(e) => setData('owner_email', e.target.value)}
                                    required
                                />
                                {errors.owner_email && <p className="mt-1 text-sm text-red-600">{errors.owner_email}</p>}
                            </div>

                            <div className="sm:col-span-2">
                                <label htmlFor="owner_password" className="label">Password *</label>
                                <input
                                    type="password"
                                    id="owner_password"
                                    className={`input ${errors.owner_password ? 'input-error' : ''}`}
                                    value={data.owner_password}
                                    onChange={(e) => setData('owner_password', e.target.value)}
                                    minLength={8}
                                    required
                                />
                                <p className="mt-1 text-sm text-gray-500">Minimo 8 caratteri</p>
                                {errors.owner_password && <p className="mt-1 text-sm text-red-600">{errors.owner_password}</p>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3">
                    <Link href="/admin/tenants" className="btn-secondary">
                        Annulla
                    </Link>
                    <button type="submit" disabled={processing} className="btn-primary">
                        {processing ? 'Creazione...' : 'Crea Tenant'}
                    </button>
                </div>
            </form>
        </AdminLayout>
    );
}
