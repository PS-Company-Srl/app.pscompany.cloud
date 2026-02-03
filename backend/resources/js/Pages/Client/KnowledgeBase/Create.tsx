import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import ClientLayout from '@/Layouts/ClientLayout';
import { ArrowLeftIcon, DocumentTextIcon, GlobeAltIcon, DocumentIcon } from '@heroicons/react/24/outline';

export default function KnowledgeBaseCreate() {
    const [type, setType] = useState<'text' | 'file' | 'url'>('text');

    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        type: 'text',
        content: '',
        url: '',
        file: null as File | null,
    });

    const handleTypeChange = (newType: 'text' | 'file' | 'url') => {
        setType(newType);
        setData('type', newType);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/knowledge-base', {
            forceFormData: true,
        });
    };

    const typeOptions = [
        {
            value: 'text' as const,
            label: 'Testo',
            description: 'Inserisci manualmente testo o FAQ',
            icon: DocumentTextIcon,
            color: 'text-blue-500 bg-blue-100',
        },
        {
            value: 'file' as const,
            label: 'File',
            description: 'Carica PDF, Word o TXT',
            icon: DocumentIcon,
            color: 'text-orange-500 bg-orange-100',
        },
        {
            value: 'url' as const,
            label: 'URL',
            description: 'Importa da una pagina web',
            icon: GlobeAltIcon,
            color: 'text-green-500 bg-green-100',
        },
    ];

    return (
        <ClientLayout title="Aggiungi Contenuto">
            <Head title="Aggiungi Knowledge Base" />

            <div className="mb-6">
                <Link href="/knowledge-base" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700">
                    <ArrowLeftIcon className="h-4 w-4 mr-1" />
                    Torna alla lista
                </Link>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Type Selection */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="text-lg font-medium text-gray-900">Tipo di Contenuto</h3>
                    </div>
                    <div className="card-body">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            {typeOptions.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => handleTypeChange(option.value)}
                                    className={`relative flex flex-col items-center p-6 rounded-lg border-2 transition-colors ${
                                        type === option.value
                                            ? 'border-primary-500 bg-primary-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <div className={`p-3 rounded-full ${option.color}`}>
                                        <option.icon className="h-6 w-6" />
                                    </div>
                                    <h4 className="mt-3 font-medium text-gray-900">{option.label}</h4>
                                    <p className="mt-1 text-xs text-gray-500 text-center">{option.description}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Content Form */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="text-lg font-medium text-gray-900">Dettagli</h3>
                    </div>
                    <div className="card-body space-y-6">
                        <div>
                            <label htmlFor="title" className="label">Titolo *</label>
                            <input
                                type="text"
                                id="title"
                                className={`input ${errors.title ? 'input-error' : ''}`}
                                placeholder="Es: FAQ Prodotti, Guida Servizi, etc."
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                required
                            />
                            {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
                        </div>

                        {type === 'text' && (
                            <div>
                                <label htmlFor="content" className="label">Contenuto *</label>
                                <textarea
                                    id="content"
                                    rows={12}
                                    className={`input font-mono text-sm ${errors.content ? 'input-error' : ''}`}
                                    placeholder="Inserisci qui il testo, le FAQ, le informazioni sui prodotti/servizi..."
                                    value={data.content}
                                    onChange={(e) => setData('content', e.target.value)}
                                    required
                                />
                                <p className="mt-1 text-sm text-gray-500">
                                    Puoi usare il formato Markdown. Usa titoli (##) per separare le sezioni.
                                </p>
                                {errors.content && <p className="mt-1 text-sm text-red-600">{errors.content}</p>}
                            </div>
                        )}

                        {type === 'url' && (
                            <div>
                                <label htmlFor="url" className="label">URL della pagina *</label>
                                <input
                                    type="url"
                                    id="url"
                                    className={`input ${errors.url ? 'input-error' : ''}`}
                                    placeholder="https://www.esempio.it/pagina"
                                    value={data.url}
                                    onChange={(e) => setData('url', e.target.value)}
                                    required
                                />
                                <p className="mt-1 text-sm text-gray-500">
                                    Il contenuto testuale della pagina verrà estratto automaticamente.
                                </p>
                                {errors.url && <p className="mt-1 text-sm text-red-600">{errors.url}</p>}
                            </div>
                        )}

                        {type === 'file' && (
                            <div>
                                <label htmlFor="file" className="label">File *</label>
                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                                    <div className="space-y-1 text-center">
                                        <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
                                        <div className="flex text-sm text-gray-600">
                                            <label
                                                htmlFor="file"
                                                className="relative cursor-pointer rounded-md font-medium text-primary-600 hover:text-primary-500"
                                            >
                                                <span>Carica un file</span>
                                                <input
                                                    id="file"
                                                    name="file"
                                                    type="file"
                                                    className="sr-only"
                                                    accept=".pdf,.doc,.docx,.txt"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            setData('file', file);
                                                        }
                                                    }}
                                                />
                                            </label>
                                            <p className="pl-1">o trascinalo qui</p>
                                        </div>
                                        <p className="text-xs text-gray-500">PDF, DOC, DOCX, TXT fino a 10MB</p>
                                    </div>
                                </div>
                                {data.file && (
                                    <p className="mt-2 text-sm text-gray-600">
                                        File selezionato: <span className="font-medium">{data.file.name}</span>
                                    </p>
                                )}
                                {errors.file && <p className="mt-1 text-sm text-red-600">{errors.file}</p>}
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3">
                    <Link href="/knowledge-base" className="btn-secondary">
                        Annulla
                    </Link>
                    <button type="submit" disabled={processing} className="btn-primary">
                        {processing ? 'Salvataggio...' : 'Salva e Elabora'}
                    </button>
                </div>
            </form>
        </ClientLayout>
    );
}
