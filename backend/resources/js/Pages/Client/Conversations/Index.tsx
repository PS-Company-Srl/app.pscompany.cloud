import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import ClientLayout from '@/Layouts/ClientLayout';
import { PaginatedData, Conversation } from '@/types';
import { MagnifyingGlassIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

interface Props {
    conversations: PaginatedData<Conversation & { messages_count: number }>;
    filters: {
        search?: string;
        channel?: string;
        date_from?: string;
        date_to?: string;
    };
}

export default function ConversationsIndex({ conversations, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/conversations', { ...filters, search }, { preserveState: true });
    };

    const handleFilter = (key: string, value: string) => {
        router.get('/conversations', { ...filters, [key]: value || undefined }, { preserveState: true });
    };

    return (
        <ClientLayout title="Conversazioni">
            <Head title="Conversazioni" />

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <form onSubmit={handleSearch} className="flex-1 max-w-md">
                    <div className="relative">
                        <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cerca per nome o sessione..."
                            className="input pl-10"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </form>

                <select
                    className="input w-auto"
                    value={filters.channel || ''}
                    onChange={(e) => handleFilter('channel', e.target.value)}
                >
                    <option value="">Tutti i canali</option>
                    <option value="web">Web</option>
                    <option value="whatsapp">WhatsApp</option>
                </select>

                <input
                    type="date"
                    className="input w-auto"
                    value={filters.date_from || ''}
                    onChange={(e) => handleFilter('date_from', e.target.value)}
                    placeholder="Da"
                />

                <input
                    type="date"
                    className="input w-auto"
                    value={filters.date_to || ''}
                    onChange={(e) => handleFilter('date_to', e.target.value)}
                    placeholder="A"
                />
            </div>

            {/* Conversations List */}
            {conversations.data.length === 0 ? (
                <div className="card">
                    <div className="card-body text-center py-12">
                        <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Nessuna conversazione</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Le conversazioni appariranno qui quando i visitatori inizieranno a chattare.
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
                                        Visitatore
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Canale
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Messaggi
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Ultimo Messaggio
                                    </th>
                                    <th className="relative px-6 py-3">
                                        <span className="sr-only">Azioni</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {conversations.data.map((conversation) => (
                                    <tr key={conversation.id} className={`hover:bg-gray-50 ${!conversation.is_read ? 'bg-blue-50' : ''}`}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {conversation.visitor_name || 'Visitatore anonimo'}
                                                </p>
                                                {conversation.visitor_email && (
                                                    <p className="text-sm text-gray-500">{conversation.visitor_email}</p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`badge ${conversation.channel === 'whatsapp' ? 'badge-success' : 'badge-info'}`}>
                                                {conversation.channel === 'whatsapp' ? 'WhatsApp' : 'Web'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {conversation.messages_count}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {conversation.last_message_at
                                                ? new Date(conversation.last_message_at).toLocaleString('it-IT')
                                                : '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <Link
                                                href={`/conversations/${conversation.id}`}
                                                className="text-primary-600 hover:text-primary-900"
                                            >
                                                Visualizza
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {conversations.last_page > 1 && (
                        <div className="border-t border-gray-200 px-4 py-3 sm:px-6">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-gray-700">
                                    Mostrando <span className="font-medium">{conversations.from}</span> -{' '}
                                    <span className="font-medium">{conversations.to}</span> di{' '}
                                    <span className="font-medium">{conversations.total}</span>
                                </p>
                                <nav className="flex gap-2">
                                    {conversations.links.map((link, index) => (
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
