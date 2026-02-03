import { Head, Link, router } from '@inertiajs/react';
import ClientLayout from '@/Layouts/ClientLayout';
import { KnowledgeBase } from '@/types';
import {
    PlusIcon,
    DocumentTextIcon,
    GlobeAltIcon,
    DocumentIcon,
    TrashIcon,
    ArrowPathIcon,
} from '@heroicons/react/24/outline';

interface Props {
    knowledgeBases: KnowledgeBase[];
}

export default function KnowledgeBaseIndex({ knowledgeBases }: Props) {
    const handleDelete = (id: number) => {
        if (confirm('Sei sicuro di voler eliminare questa knowledge base?')) {
            router.delete(`/knowledge-base/${id}`);
        }
    };

    const handleReprocess = (id: number) => {
        router.post(`/knowledge-base/${id}/reprocess`);
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'text':
                return <DocumentTextIcon className="h-8 w-8 text-blue-500" />;
            case 'url':
                return <GlobeAltIcon className="h-8 w-8 text-green-500" />;
            case 'file':
                return <DocumentIcon className="h-8 w-8 text-orange-500" />;
            default:
                return <DocumentIcon className="h-8 w-8 text-gray-500" />;
        }
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            pending: 'badge-warning',
            processing: 'badge-info',
            ready: 'badge-success',
            failed: 'badge-danger',
        };
        const labels: Record<string, string> = {
            pending: 'In attesa',
            processing: 'Elaborazione',
            ready: 'Pronta',
            failed: 'Errore',
        };
        return <span className={`badge ${styles[status] || 'badge-gray'}`}>{labels[status] || status}</span>;
    };

    return (
        <ClientLayout title="Knowledge Base">
            <Head title="Knowledge Base" />

            <div className="sm:flex sm:items-center sm:justify-between mb-6">
                <p className="text-sm text-gray-500">
                    Gestisci i documenti e le informazioni che il bot usa per rispondere
                </p>
                <Link href="/knowledge-base/create" className="btn-primary mt-4 sm:mt-0">
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Aggiungi Contenuto
                </Link>
            </div>

            {knowledgeBases.length === 0 ? (
                <div className="card">
                    <div className="card-body text-center py-12">
                        <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Nessuna knowledge base</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Inizia aggiungendo contenuti che il bot userà per rispondere.
                        </p>
                        <div className="mt-6">
                            <Link href="/knowledge-base/create" className="btn-primary">
                                <PlusIcon className="h-5 w-5 mr-2" />
                                Aggiungi Contenuto
                            </Link>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {knowledgeBases.map((kb) => (
                        <div key={kb.id} className="card hover:shadow-md transition-shadow">
                            <div className="card-body">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        {getTypeIcon(kb.type)}
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-900 line-clamp-1">
                                                {kb.title}
                                            </h3>
                                            <p className="text-xs text-gray-500 capitalize">{kb.type}</p>
                                        </div>
                                    </div>
                                    {getStatusBadge(kb.status)}
                                </div>

                                {kb.status === 'failed' && kb.error_message && (
                                    <div className="mt-3 text-xs text-red-600 bg-red-50 p-2 rounded">
                                        {kb.error_message}
                                    </div>
                                )}

                                <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                                    <span>{kb.chunks_count} chunks</span>
                                    <span>
                                        {kb.processed_at
                                            ? new Date(kb.processed_at).toLocaleDateString('it-IT')
                                            : 'Non elaborata'}
                                    </span>
                                </div>

                                <div className="mt-4 flex items-center justify-between">
                                    <Link
                                        href={`/knowledge-base/${kb.id}`}
                                        className="text-sm text-primary-600 hover:text-primary-500"
                                    >
                                        Visualizza
                                    </Link>
                                    <div className="flex gap-2">
                                        {kb.status !== 'processing' && (
                                            <button
                                                onClick={() => handleReprocess(kb.id)}
                                                className="p-1 text-gray-400 hover:text-gray-600"
                                                title="Rielabora"
                                            >
                                                <ArrowPathIcon className="h-5 w-5" />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(kb.id)}
                                            className="p-1 text-gray-400 hover:text-red-600"
                                            title="Elimina"
                                        >
                                            <TrashIcon className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </ClientLayout>
    );
}
