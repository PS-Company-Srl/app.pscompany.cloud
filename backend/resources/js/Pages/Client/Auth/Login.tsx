import { FormEventHandler } from 'react';
import { Head, useForm } from '@inertiajs/react';

interface Props {
    tenant: {
        name: string;
        slug: string;
    };
}

export default function ClientLogin({ tenant }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/login');
    };

    return (
        <>
            <Head title="Login" />

            <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <h1 className="text-center text-3xl font-bold tracking-tight text-primary-600">
                        {tenant.name}
                    </h1>
                    <h2 className="mt-2 text-center text-sm text-gray-600">
                        Accedi al pannello di controllo
                    </h2>
                </div>

                <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white py-8 px-4 shadow-lg rounded-xl sm:px-10">
                        <form className="space-y-6" onSubmit={submit}>
                            <div>
                                <label htmlFor="email" className="label">
                                    Email
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className={`input ${errors.email ? 'input-error' : ''}`}
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                />
                                {errors.email && (
                                    <p className="mt-2 text-sm text-red-600">{errors.email}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="password" className="label">
                                    Password
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    className={`input ${errors.password ? 'input-error' : ''}`}
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                />
                                {errors.password && (
                                    <p className="mt-2 text-sm text-red-600">{errors.password}</p>
                                )}
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <input
                                        id="remember"
                                        name="remember"
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
                                        checked={data.remember}
                                        onChange={(e) => setData('remember', e.target.checked)}
                                    />
                                    <label htmlFor="remember" className="ml-2 block text-sm text-gray-900">
                                        Ricordami
                                    </label>
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="btn-primary w-full"
                                >
                                    {processing ? 'Accesso in corso...' : 'Accedi'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}
