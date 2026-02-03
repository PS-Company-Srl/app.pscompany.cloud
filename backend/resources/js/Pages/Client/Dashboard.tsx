import { Head, Link } from '@inertiajs/react';
import ClientLayout from '@/Layouts/ClientLayout';
import { Conversation, Lead } from '@/types';
import {
    ChatBubbleLeftRightIcon,
    UserGroupIcon,
    EnvelopeIcon,
    ChartBarIcon,
} from '@heroicons/react/24/outline';

interface Props {
    stats: {
        conversations_today: number;
        conversations_this_week: number;
        conversations_this_month: number;
        leads_new: number;
        leads_this_month: number;
        messages_used: number;
        messages_limit: number;
        messages_remaining: number;
    };
    recentConversations: Array<{
        id: number;
        session_id: string;
        channel: string;
        visitor_name: string | null;
        messages_count: number;
        last_message: string | null;
        last_message_at: string;
        created_at: string;
    }>;
    recentLeads: Lead[];
    tenant: {
        name: string;
        plan: string;
        status: string;
    };
}

export default function ClientDashboard({ stats, recentConversations, recentLeads, tenant }: Props) {
    const statCards = [
        {
            name: 'Conversazioni Oggi',
            value: stats.conversations_today,
            icon: ChatBubbleLeftRightIcon,
            color: 'bg-blue-500',
        },
        {
            name: 'Conversazioni Settimana',
            value: stats.conversations_this_week,
            icon: ChatBubbleLeftRightIcon,
            color: 'bg-indigo-500',
        },
        {
            name: 'Lead Nuovi',
            value: stats.leads_new,
            icon: UserGroupIcon,
            color: 'bg-green-500',
        },
        {
            name: 'Lead Mese',
            value: stats.leads_this_month,
            icon: EnvelopeIcon,
            color: 'bg-purple-500',
        },
    ];

    const usagePercentage = Math.round((stats.messages_used / stats.messages_limit) * 100);

    return (
        <ClientLayout title="Dashboard">
            <Head title="Dashboard" />

            {/* Usage Alert */}
            {usagePercentage > 80 && (
                <div className={`mb-6 rounded-lg p-4 ${usagePercentage > 90 ? 'bg-red-50 border border-red-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                    <p className={`text-sm font-medium ${usagePercentage > 90 ? 'text-red-800' : 'text-yellow-800'}`}>
                        {usagePercentage > 90
                            ? `Attenzione: hai utilizzato il ${usagePercentage}% dei messaggi mensili.`
                            : `Hai utilizzato il ${usagePercentage}% dei messaggi mensili.`}
                    </p>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {statCards.map((stat) => (
                    <div key={stat.name} className="card overflow-hidden">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className={`flex-shrink-0 rounded-md p-3 ${stat.color}`}>
                                    <stat.icon className="h-6 w-6 text-white" aria-hidden="true" />
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

            {/* Usage Card */}
            <div className="mt-6 card">
                <div className="card-body">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">Utilizzo Messaggi Mensili</h3>
                            <p className="mt-1 text-2xl font-semibold text-gray-900">
                                {stats.messages_used.toLocaleString()} / {stats.messages_limit.toLocaleString()}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-500">Rimanenti</p>
                            <p className="text-lg font-medium text-gray-900">{stats.messages_remaining.toLocaleString()}</p>
                        </div>
                    </div>
                    <div className="mt-4">
                        <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                                className={`h-3 rounded-full transition-all ${
                                    usagePercentage > 90
                                        ? 'bg-red-500'
                                        : usagePercentage > 70
                                        ? 'bg-yellow-500'
                                        : 'bg-green-500'
                                }`}
                                style={{ width: `${Math.min(100, usagePercentage)}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Data */}
            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Recent Conversations */}
                <div className="card">
                    <div className="card-header flex items-center justify-between">
                        <h3 className="text-base font-semibold text-gray-900">Ultime Conversazioni</h3>
                        <Link href="/conversations" className="text-sm font-medium text-primary-600 hover:text-primary-500">
                            Vedi tutte
                        </Link>
                    </div>
                    <div className="card-body p-0">
                        {recentConversations.length === 0 ? (
                            <div className="p-6 text-center text-gray-500">
                                <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-gray-400" />
                                <p className="mt-2">Nessuna conversazione ancora</p>
                            </div>
                        ) : (
                            <ul className="divide-y divide-gray-200">
                                {recentConversations.map((conversation) => (
                                    <li key={conversation.id}>
                                        <Link
                                            href={`/conversations/${conversation.id}`}
                                            className="block hover:bg-gray-50 px-6 py-4"
                                        >
                                            <div className="flex items-center justify-between">
                                                <p className="truncate text-sm font-medium text-gray-900">
                                                    {conversation.visitor_name || 'Visitatore anonimo'}
                                                </p>
                                                <span className={`badge ${conversation.channel === 'whatsapp' ? 'badge-success' : 'badge-info'}`}>
                                                    {conversation.channel}
                                                </span>
                                            </div>
                                            <p className="mt-1 truncate text-sm text-gray-500">
                                                {conversation.last_message || 'Nessun messaggio'}
                                            </p>
                                            <p className="mt-1 text-xs text-gray-400">
                                                {new Date(conversation.last_message_at || conversation.created_at).toLocaleString('it-IT')}
                                            </p>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* Recent Leads */}
                <div className="card">
                    <div className="card-header flex items-center justify-between">
                        <h3 className="text-base font-semibold text-gray-900">Lead Recenti</h3>
                        <Link href="/leads" className="text-sm font-medium text-primary-600 hover:text-primary-500">
                            Vedi tutti
                        </Link>
                    </div>
                    <div className="card-body p-0">
                        {recentLeads.length === 0 ? (
                            <div className="p-6 text-center text-gray-500">
                                <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
                                <p className="mt-2">Nessun lead ancora</p>
                            </div>
                        ) : (
                            <ul className="divide-y divide-gray-200">
                                {recentLeads.map((lead) => (
                                    <li key={lead.id}>
                                        <Link
                                            href={`/leads/${lead.id}`}
                                            className="block hover:bg-gray-50 px-6 py-4"
                                        >
                                            <div className="flex items-center justify-between">
                                                <p className="truncate text-sm font-medium text-gray-900">
                                                    {lead.name || lead.email || lead.phone || 'Lead anonimo'}
                                                </p>
                                                <LeadStatusBadge status={lead.status} />
                                            </div>
                                            <div className="mt-1 flex items-center gap-4 text-sm text-gray-500">
                                                {lead.email && <span>{lead.email}</span>}
                                                {lead.phone && <span>{lead.phone}</span>}
                                            </div>
                                            <p className="mt-1 text-xs text-gray-400">
                                                {new Date(lead.created_at).toLocaleString('it-IT')}
                                            </p>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
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
