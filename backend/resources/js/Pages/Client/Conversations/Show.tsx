import { Head, Link, router } from '@inertiajs/react';
import ClientLayout from '@/Layouts/ClientLayout';
import { Conversation, Message } from '@/types';
import { ArrowLeftIcon, TrashIcon, UserIcon, CpuChipIcon } from '@heroicons/react/24/outline';

interface Props {
    conversation: Conversation & { messages: Message[] };
}

export default function ConversationShow({ conversation }: Props) {
    const handleDelete = () => {
        if (confirm('Sei sicuro di voler eliminare questa conversazione?')) {
            router.delete(`/conversations/${conversation.id}`);
        }
    };

    return (
        <ClientLayout title="Conversazione">
            <Head title="Dettaglio Conversazione" />

            <div className="mb-6 flex items-center justify-between">
                <Link href="/conversations" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700">
                    <ArrowLeftIcon className="h-4 w-4 mr-1" />
                    Torna alla lista
                </Link>
                <button onClick={handleDelete} className="btn-danger btn-sm">
                    <TrashIcon className="h-4 w-4 mr-1" />
                    Elimina
                </button>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Chat Messages */}
                <div className="lg:col-span-2">
                    <div className="card">
                        <div className="card-header">
                            <h3 className="text-lg font-medium text-gray-900">Messaggi</h3>
                        </div>
                        <div className="card-body max-h-[600px] overflow-y-auto space-y-4">
                            {conversation.messages.map((message) => (
                                <MessageBubble key={message.id} message={message} />
                            ))}
                            {conversation.messages.length === 0 && (
                                <p className="text-center text-gray-500 py-8">Nessun messaggio</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    {/* Visitor Info */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="text-lg font-medium text-gray-900">Informazioni Visitatore</h3>
                        </div>
                        <div className="card-body space-y-4">
                            <InfoItem label="Nome" value={conversation.visitor_name || 'Non disponibile'} />
                            <InfoItem label="Email" value={conversation.visitor_email || 'Non disponibile'} />
                            <InfoItem label="Telefono" value={conversation.visitor_phone || 'Non disponibile'} />
                            <InfoItem label="Canale">
                                <span className={`badge ${conversation.channel === 'whatsapp' ? 'badge-success' : 'badge-info'}`}>
                                    {conversation.channel === 'whatsapp' ? 'WhatsApp' : 'Web'}
                                </span>
                            </InfoItem>
                        </div>
                    </div>

                    {/* Session Info */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="text-lg font-medium text-gray-900">Dettagli Sessione</h3>
                        </div>
                        <div className="card-body space-y-4">
                            <InfoItem label="ID Sessione">
                                <code className="text-xs bg-gray-100 px-2 py-1 rounded">{conversation.session_id}</code>
                            </InfoItem>
                            <InfoItem
                                label="Iniziata il"
                                value={new Date(conversation.created_at).toLocaleString('it-IT')}
                            />
                            <InfoItem
                                label="Ultimo messaggio"
                                value={
                                    conversation.last_message_at
                                        ? new Date(conversation.last_message_at).toLocaleString('it-IT')
                                        : '-'
                                }
                            />
                            <InfoItem label="Totale messaggi" value={conversation.messages.length.toString()} />
                        </div>
                    </div>

                    {/* Technical Info */}
                    {(conversation.visitor_ip || conversation.visitor_user_agent) && (
                        <div className="card">
                            <div className="card-header">
                                <h3 className="text-lg font-medium text-gray-900">Info Tecniche</h3>
                            </div>
                            <div className="card-body space-y-4">
                                {conversation.visitor_ip && (
                                    <InfoItem label="IP" value={conversation.visitor_ip} />
                                )}
                                {conversation.visitor_user_agent && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">User Agent</p>
                                        <p className="mt-1 text-xs text-gray-700 break-all">{conversation.visitor_user_agent}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </ClientLayout>
    );
}

function MessageBubble({ message }: { message: Message }) {
    const isUser = message.role === 'user';
    const isSystem = message.role === 'system';

    if (isSystem) {
        return (
            <div className="flex justify-center">
                <div className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
                    {message.content}
                </div>
            </div>
        );
    }

    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex items-start gap-2 max-w-[80%] ${isUser ? 'flex-row-reverse' : ''}`}>
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isUser ? 'bg-primary-100' : 'bg-gray-100'}`}>
                    {isUser ? (
                        <UserIcon className="h-4 w-4 text-primary-600" />
                    ) : (
                        <CpuChipIcon className="h-4 w-4 text-gray-600" />
                    )}
                </div>
                <div>
                    <div
                        className={`rounded-2xl px-4 py-2 ${
                            isUser
                                ? 'bg-primary-600 text-white'
                                : 'bg-gray-100 text-gray-900'
                        }`}
                    >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                    <p className={`mt-1 text-xs text-gray-400 ${isUser ? 'text-right' : ''}`}>
                        {new Date(message.created_at).toLocaleTimeString('it-IT', {
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                        {message.model_used && !isUser && (
                            <span className="ml-2">({message.model_used})</span>
                        )}
                    </p>
                </div>
            </div>
        </div>
    );
}

function InfoItem({ label, value, children }: { label: string; value?: string; children?: React.ReactNode }) {
    return (
        <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">{label}</span>
            {children || <span className="text-sm font-medium text-gray-900">{value}</span>}
        </div>
    );
}
