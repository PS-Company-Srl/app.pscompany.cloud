import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import ClientLayout from '@/Layouts/ClientLayout';
import { Lead, Conversation, Message } from '@/types';
import { ArrowLeftIcon, EnvelopeIcon, PhoneIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

interface Props {
    lead: Lead & { conversation?: Conversation & { messages: Message[] } };
}

export default function LeadShow({ lead }: Props) {
    const { data, setData, put, processing } = useForm({
        status: lead.status,
        notes: lead.notes || '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(`/leads/${lead.id}`);
    };

    const statusOptions = [
        { value: 'new', label: 'Nuovo', color: 'bg-blue-100 text-blue-800' },
        { value: 'contacted', label: 'Contattato', color: 'bg-yellow-100 text-yellow-800' },
        { value: 'qualified', label: 'Qualificato', color: 'bg-green-100 text-green-800' },
        { value: 'converted', label: 'Convertito', color: 'bg-green-600 text-white' },
        { value: 'lost', label: 'Perso', color: 'bg-red-100 text-red-800' },
    ];

    return (
        <ClientLayout title="Dettaglio Lead">
            <Head title={`Lead: ${lead.name || lead.email || 'Anonimo'}`} />

            <div className="mb-6">
                <Link href="/leads" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700">
                    <ArrowLeftIcon className="h-4 w-4 mr-1" />
                    Torna alla lista
                </Link>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Contact Info */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="text-lg font-medium text-gray-900">Informazioni Contatto</h3>
                        </div>
                        <div className="card-body">
                            <div className="flex items-start gap-6">
                                <div className="flex-shrink-0">
                                    <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary-100">
                                        <span className="text-xl font-medium text-primary-600">
                                            {(lead.name || lead.email || '?').charAt(0).toUpperCase()}
                                        </span>
                                    </span>
                                </div>
                                <div className="flex-1 space-y-3">
                                    <div>
                                        <h2 className="text-xl font-semibold text-gray-900">
                                            {lead.name || 'Nome non disponibile'}
                                        </h2>
                                    </div>
                                    {lead.email && (
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <EnvelopeIcon className="h-5 w-5" />
                                            <a href={`mailto:${lead.email}`} className="hover:text-primary-600">
                                                {lead.email}
                                            </a>
                                        </div>
                                    )}
                                    {lead.phone && (
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <PhoneIcon className="h-5 w-5" />
                                            <a href={`tel:${lead.phone}`} className="hover:text-primary-600">
                                                {lead.phone}
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Related Conversation */}
                    {lead.conversation && (
                        <div className="card">
                            <div className="card-header flex items-center justify-between">
                                <h3 className="text-lg font-medium text-gray-900">Conversazione Collegata</h3>
                                <Link
                                    href={`/conversations/${lead.conversation.id}`}
                                    className="text-sm text-primary-600 hover:text-primary-500"
                                >
                                    Vedi completa
                                </Link>
                            </div>
                            <div className="card-body max-h-[300px] overflow-y-auto space-y-3">
                                {lead.conversation.messages.slice(-5).map((message) => (
                                    <div
                                        key={message.id}
                                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                                                message.role === 'user'
                                                    ? 'bg-primary-600 text-white'
                                                    : 'bg-gray-100 text-gray-900'
                                            }`}
                                        >
                                            {message.content}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Status & Notes Form */}
                    <form onSubmit={submit}>
                        <div className="card">
                            <div className="card-header">
                                <h3 className="text-lg font-medium text-gray-900">Gestione Lead</h3>
                            </div>
                            <div className="card-body space-y-4">
                                <div>
                                    <label className="label">Stato</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {statusOptions.map((option) => (
                                            <button
                                                key={option.value}
                                                type="button"
                                                onClick={() => setData('status', option.value as Lead['status'])}
                                                className={`px-3 py-2 text-sm font-medium rounded-lg border-2 transition-colors ${
                                                    data.status === option.value
                                                        ? `${option.color} border-current`
                                                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                                }`}
                                            >
                                                {option.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="notes" className="label">Note</label>
                                    <textarea
                                        id="notes"
                                        rows={4}
                                        className="input"
                                        placeholder="Aggiungi note sul lead..."
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="btn-primary w-full"
                                >
                                    {processing ? 'Salvataggio...' : 'Salva Modifiche'}
                                </button>
                            </div>
                        </div>
                    </form>

                    {/* Meta Info */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="text-lg font-medium text-gray-900">Dettagli</h3>
                        </div>
                        <div className="card-body space-y-3">
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-500">Fonte</span>
                                <span className={`badge ${lead.source === 'whatsapp' ? 'badge-success' : 'badge-info'}`}>
                                    {lead.source === 'whatsapp' ? 'WhatsApp' : 'Web'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-500">Creato il</span>
                                <span className="text-sm font-medium text-gray-900">
                                    {new Date(lead.created_at).toLocaleDateString('it-IT', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                    })}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-500">Ora</span>
                                <span className="text-sm font-medium text-gray-900">
                                    {new Date(lead.created_at).toLocaleTimeString('it-IT', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ClientLayout>
    );
}
