import { Head, Link, router } from '@inertiajs/react';
import ClientLayout from '@/Layouts/ClientLayout';
import { KnowledgeBase, KbChunk } from '@/types';
import { ArrowLeftIcon, ArrowPathIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

interface Props {
    knowledgeBase: KnowledgeBase & { chunks: KbChunk[] };
}

export default function KnowledgeBaseShow({ knowledgeBase }: Props) {
    const handleDelete = () => {
        if (confirm('Sei sicuro di voler eliminare questa knowledge base?')) {
            router.delete(`/knowledge-base/${knowledgeBase.id}`);
        }
    };

    const handleReprocess = () => {
        router.post(`/knowledge-base/${knowledgeBase.id}/reprocess`);
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
        <ClientLayout title={knowledgeBase.title}>
            <Head title={`KB: ${knowledgeBase.title}`} />

            <div className="mb-6 flex items-center justify-between">
                <Link href="/knowledge-base" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700">
                    <ArrowLeftIcon className="h-4 w-4 mr-1" />
                    Torna alla lista
                </Link>
                <div className="flex gap-2">
                    {knowledgeBase.status !== 'processing' && (
                        <button onClick={handleReprocess} className="btn-secondary btn-sm">
                            <ArrowPathIcon className="h-4 w-4 mr-1" />
                            Rielabora
                        </button>
                    )}
                    {knowledgeBase.type === 'text' && (
                        <Link href={`/knowledge-base/${knowledgeBase.id}/edit`} className="btn-secondary btn-sm">
                            <PencilIcon className="h-4 w-4 mr-1" />
                            Modifica
                        </Link>
                    )}
                    <button onClick={handleDelete} className="btn-danger btn-sm">
                        <TrashIcon className="h-4 w-4 mr-1" />
                        Elimina
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Original Content */}
                    {knowledgeBase.original_content && (
                        <div className="card">
                            <div className="card-header">
                                <h3 className="text-lg font-medium text-gray-900">Contenuto Originale</h3>
                            </div>
                            <div className="card-body">
                                <pre className="whitespace-pre-wrap text-sm text-gray-700 max-h-[400px] overflow-y-auto">
                                    {knowledgeBase.original_content}
                                </pre>
                            </div>
                        </div>
                    )}

                    {/* Chunks */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="text-lg font-medium text-gray-900">
                                Chunks ({knowledgeBase.chunks?.length || 0})
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                                I chunks sono porzioni di testo usate per la ricerca semantica
                            </p>
                        </div>
                        <div className="card-body space-y-4 max-h-[600px] overflow-y-auto">
                            {knowledgeBase.chunks?.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">
                                    Nessun chunk disponibile
                                </p>
                            ) : (
                                knowledgeBase.chunks?.map((chunk, index) => (
                                    <div key={chunk.id} className="p-4 bg-gray-50 rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-medium text-gray-500">
                                                Chunk #{index + 1}
                                            </span>
                                            <span className="text-xs text-gray-400">
                                                ~{chunk.tokens_count} token
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                            {chunk.content}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Info Card */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="text-lg font-medium text-gray-900">Informazioni</h3>
                        </div>
                        <div className="card-body space-y-4">
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-500">Stato</span>
                                {getStatusBadge(knowledgeBase.status)}
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-500">Tipo</span>
                                <span className="text-sm font-medium text-gray-900 capitalize">
                                    {knowledgeBase.type}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-500">Chunks</span>
                                <span className="text-sm font-medium text-gray-900">
                                    {knowledgeBase.chunks_count}
                                </span>
                            </div>
                            {knowledgeBase.file_name && (
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-500">File</span>
                                    <span className="text-sm font-medium text-gray-900 truncate max-w-[150px]">
                                        {knowledgeBase.file_name}
                                    </span>
                                </div>
                            )}
                            {knowledgeBase.url && (
                                <div>
                                    <span className="text-sm text-gray-500">URL</span>
                                    <a
                                        href={knowledgeBase.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block text-sm text-primary-600 hover:text-primary-500 truncate mt-1"
                                    >
                                        {knowledgeBase.url}
                                    </a>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-500">Creato</span>
                                <span className="text-sm font-medium text-gray-900">
                                    {new Date(knowledgeBase.created_at).toLocaleDateString('it-IT')}
                                </span>
                            </div>
                            {knowledgeBase.processed_at && (
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-500">Elaborato</span>
                                    <span className="text-sm font-medium text-gray-900">
                                        {new Date(knowledgeBase.processed_at).toLocaleDateString('it-IT')}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Error Message */}
                    {knowledgeBase.status === 'failed' && knowledgeBase.error_message && (
                        <div className="card border-red-200">
                            <div className="card-header bg-red-50">
                                <h3 className="text-lg font-medium text-red-800">Errore</h3>
                            </div>
                            <div className="card-body">
                                <p className="text-sm text-red-600">{knowledgeBase.error_message}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </ClientLayout>
    );
}
