import { Head, Link, router } from '@inertiajs/react';
import ClientLayout from '@/Layouts/ClientLayout';
import { User } from '@/types';
import { PlusIcon, PencilIcon, TrashIcon, UsersIcon } from '@heroicons/react/24/outline';

interface Props {
    users: User[];
}

export default function UsersIndex({ users }: Props) {
    const handleDelete = (user: User) => {
        if (confirm(`Sei sicuro di voler eliminare l'utente "${user.name}"?`)) {
            router.delete(`/users/${user.id}`);
        }
    };

    const getRoleBadge = (role: string) => {
        const styles: Record<string, string> = {
            owner: 'bg-purple-100 text-purple-800',
            admin: 'badge-info',
            viewer: 'badge-gray',
        };
        const labels: Record<string, string> = {
            owner: 'Owner',
            admin: 'Admin',
            viewer: 'Viewer',
        };
        return <span className={`badge ${styles[role] || 'badge-gray'}`}>{labels[role] || role}</span>;
    };

    return (
        <ClientLayout title="Gestione Utenti">
            <Head title="Gestione Utenti" />

            <div className="sm:flex sm:items-center sm:justify-between mb-6">
                <p className="text-sm text-gray-500">
                    Gestisci gli utenti che hanno accesso al pannello
                </p>
                <Link href="/users/create" className="btn-primary mt-4 sm:mt-0">
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Nuovo Utente
                </Link>
            </div>

            <div className="card">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Utente
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Ruolo
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Ultimo Accesso
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Creato
                                </th>
                                <th className="relative px-6 py-3">
                                    <span className="sr-only">Azioni</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary-100">
                                                    <span className="text-sm font-medium text-primary-600">
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </span>
                                                </span>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                <div className="text-sm text-gray-500">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getRoleBadge(user.role)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {user.last_login_at
                                            ? new Date(user.last_login_at).toLocaleDateString('it-IT')
                                            : 'Mai'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(user.created_at).toLocaleDateString('it-IT')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        {user.role !== 'owner' && (
                                            <div className="flex justify-end gap-2">
                                                <Link
                                                    href={`/users/${user.id}/edit`}
                                                    className="text-primary-600 hover:text-primary-900"
                                                >
                                                    <PencilIcon className="h-5 w-5" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(user)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    <TrashIcon className="h-5 w-5" />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Role Permissions Info */}
            <div className="mt-8 card">
                <div className="card-header">
                    <h3 className="text-lg font-medium text-gray-900">Ruoli e Permessi</h3>
                </div>
                <div className="card-body">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="p-4 bg-purple-50 rounded-lg">
                            <h4 className="font-medium text-purple-800">Owner</h4>
                            <ul className="mt-2 text-sm text-purple-700 space-y-1">
                                <li>Accesso completo</li>
                                <li>Gestione utenti</li>
                                <li>Gestione KB e settings</li>
                                <li>Visualizza tutto</li>
                            </ul>
                        </div>
                        <div className="p-4 bg-blue-50 rounded-lg">
                            <h4 className="font-medium text-blue-800">Admin</h4>
                            <ul className="mt-2 text-sm text-blue-700 space-y-1">
                                <li>Gestione KB e settings</li>
                                <li>Visualizza conversazioni</li>
                                <li>Gestione lead</li>
                                <li>No gestione utenti</li>
                            </ul>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <h4 className="font-medium text-gray-800">Viewer</h4>
                            <ul className="mt-2 text-sm text-gray-700 space-y-1">
                                <li>Solo visualizzazione</li>
                                <li>Legge conversazioni</li>
                                <li>Legge lead</li>
                                <li>Nessuna modifica</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </ClientLayout>
    );
}
