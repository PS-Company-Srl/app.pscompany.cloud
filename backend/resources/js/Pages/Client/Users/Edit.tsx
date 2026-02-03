import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import ClientLayout from '@/Layouts/ClientLayout';
import { User } from '@/types';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

interface Props {
    user: User;
}

export default function UserEdit({ user }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: user.name,
        email: user.email,
        password: '',
        password_confirmation: '',
        role: user.role,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(`/users/${user.id}`);
    };

    return (
        <ClientLayout title={`Modifica: ${user.name}`}>
            <Head title={`Modifica Utente: ${user.name}`} />

            <div className="mb-6">
                <Link href="/users" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700">
                    <ArrowLeftIcon className="h-4 w-4 mr-1" />
                    Torna alla lista
                </Link>
            </div>

            <form onSubmit={submit} className="max-w-2xl">
                <div className="card">
                    <div className="card-header">
                        <h3 className="text-lg font-medium text-gray-900">Modifica Utente</h3>
                    </div>
                    <div className="card-body space-y-6">
                        <div>
                            <label htmlFor="name" className="label">Nome *</label>
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
                            <label htmlFor="email" className="label">Email *</label>
                            <input
                                type="email"
                                id="email"
                                className={`input ${errors.email ? 'input-error' : ''}`}
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                required
                            />
                            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                        </div>

                        <div>
                            <label htmlFor="password" className="label">Nuova Password (opzionale)</label>
                            <input
                                type="password"
                                id="password"
                                className={`input ${errors.password ? 'input-error' : ''}`}
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                minLength={8}
                            />
                            <p className="mt-1 text-sm text-gray-500">Lascia vuoto per mantenere la password attuale</p>
                            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                        </div>

                        {data.password && (
                            <div>
                                <label htmlFor="password_confirmation" className="label">Conferma Nuova Password</label>
                                <input
                                    type="password"
                                    id="password_confirmation"
                                    className={`input ${errors.password_confirmation ? 'input-error' : ''}`}
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    minLength={8}
                                />
                                {errors.password_confirmation && <p className="mt-1 text-sm text-red-600">{errors.password_confirmation}</p>}
                            </div>
                        )}

                        <div>
                            <label className="label">Ruolo *</label>
                            <div className="mt-2 space-y-3">
                                <label className="flex items-start p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                                    <input
                                        type="radio"
                                        name="role"
                                        value="admin"
                                        checked={data.role === 'admin'}
                                        onChange={() => setData('role', 'admin')}
                                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 mt-1"
                                    />
                                    <div className="ml-3">
                                        <span className="block text-sm font-medium text-gray-900">Admin</span>
                                        <span className="block text-sm text-gray-500">
                                            Può gestire knowledge base, settings, visualizzare conversazioni e lead
                                        </span>
                                    </div>
                                </label>
                                <label className="flex items-start p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                                    <input
                                        type="radio"
                                        name="role"
                                        value="viewer"
                                        checked={data.role === 'viewer'}
                                        onChange={() => setData('role', 'viewer')}
                                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 mt-1"
                                    />
                                    <div className="ml-3">
                                        <span className="block text-sm font-medium text-gray-900">Viewer</span>
                                        <span className="block text-sm text-gray-500">
                                            Può solo visualizzare conversazioni e lead (nessuna modifica)
                                        </span>
                                    </div>
                                </label>
                            </div>
                            {errors.role && <p className="mt-1 text-sm text-red-600">{errors.role}</p>}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-6 flex justify-end gap-3">
                    <Link href="/users" className="btn-secondary">
                        Annulla
                    </Link>
                    <button type="submit" disabled={processing} className="btn-primary">
                        {processing ? 'Salvataggio...' : 'Salva Modifiche'}
                    </button>
                </div>
            </form>
        </ClientLayout>
    );
}
