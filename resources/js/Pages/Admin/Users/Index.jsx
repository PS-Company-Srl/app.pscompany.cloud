import { Head, Link, usePage, router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';

export default function AdminUsersIndex({ users }) {
  const { auth, flash } = usePage().props;
  const currentUserId = auth?.user?.id;

  const deleteUser = (user) => {
    if (user.id === currentUserId) {
      alert('Non puoi eliminare il tuo account.');
      return;
    }
    if (confirm(`Eliminare l\'utente "${user.name}"? L\'operazione non si può annullare.`)) {
      router.delete(`/admin/users/${user.id}`);
    }
  };

  return (
    <AdminLayout>
      <Head title="Utenti" />
      <div className="mb-6 flex items-center gap-4">
        <Link href="/admin/dashboard" className="text-slate-600 hover:text-slate-900">
          ← Dashboard
        </Link>
        <h1 className="text-2xl font-semibold text-slate-900">Utenti</h1>
      </div>

      {(flash?.success || flash?.error) && (
        <div
          className={`mb-6 rounded-xl border px-4 py-3 text-sm ${
            flash.error
              ? 'border-red-200 bg-red-50 text-red-800'
              : 'border-emerald-200 bg-emerald-50 text-emerald-800'
          }`}
        >
          {flash.error || flash.success}
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {users.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            Nessun utente presente.
          </div>
        ) : (
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">
                  Nome
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">
                  Ruolo
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">
                  Azienda
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-500">
                  Azioni
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50">
                  <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-slate-900">
                    {user.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {user.email}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        user.role?.name === 'admin'
                          ? 'bg-primary-100 text-primary-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {user.role?.name === 'admin' ? 'Admin' : 'Cliente'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {user.company?.name ?? '–'}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-sm">
                    <Link
                      href={`/admin/users/${user.id}/edit`}
                      className="font-medium text-primary-600 hover:text-primary-700 mr-3"
                    >
                      Modifica
                    </Link>
                    <button
                      type="button"
                      onClick={() => deleteUser(user)}
                      disabled={user.id === currentUserId}
                      className="font-medium text-red-600 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Elimina
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
}
