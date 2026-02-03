import { Head } from '@inertiajs/react';
import { useState } from 'react';
import ClientLayout from '@/Layouts/ClientLayout';
import { ClipboardDocumentIcon, CheckIcon, CodeBracketIcon } from '@heroicons/react/24/outline';

interface Props {
    apiKey: string;
    embedCode: string;
    embedCodeAdvanced: string;
    cdnDomain: string;
    botSettings: {
        trigger_delay: number;
        widget_position: string;
    };
}

export default function EmbedIndex({ apiKey, embedCode, embedCodeAdvanced, cdnDomain, botSettings }: Props) {
    const [copied, setCopied] = useState<string | null>(null);
    const [showAdvanced, setShowAdvanced] = useState(false);

    const copyToClipboard = (text: string, key: string) => {
        navigator.clipboard.writeText(text);
        setCopied(key);
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <ClientLayout title="Codice Embed">
            <Head title="Codice Embed" />

            <div className="max-w-4xl">
                {/* Intro */}
                <div className="mb-8">
                    <p className="text-gray-500">
                        Copia e incolla questo codice nel tuo sito web per attivare il chatbot.
                        Il codice va inserito prima della chiusura del tag <code className="bg-gray-100 px-1 rounded">&lt;/body&gt;</code>.
                    </p>
                </div>

                {/* Basic Embed Code */}
                <div className="card mb-6">
                    <div className="card-header flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <CodeBracketIcon className="h-6 w-6 text-primary-600" />
                            <h3 className="text-lg font-medium text-gray-900">Codice Base</h3>
                        </div>
                        <button
                            onClick={() => copyToClipboard(embedCode, 'basic')}
                            className="btn-secondary btn-sm"
                        >
                            {copied === 'basic' ? (
                                <>
                                    <CheckIcon className="h-4 w-4 mr-1 text-green-600" />
                                    Copiato!
                                </>
                            ) : (
                                <>
                                    <ClipboardDocumentIcon className="h-4 w-4 mr-1" />
                                    Copia
                                </>
                            )}
                        </button>
                    </div>
                    <div className="card-body">
                        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                            <code>{embedCode}</code>
                        </pre>
                    </div>
                </div>

                {/* Advanced Toggle */}
                <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="text-sm text-primary-600 hover:text-primary-500 mb-6"
                >
                    {showAdvanced ? 'Nascondi configurazione avanzata' : 'Mostra configurazione avanzata'}
                </button>

                {/* Advanced Embed Code */}
                {showAdvanced && (
                    <div className="card mb-6">
                        <div className="card-header flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <CodeBracketIcon className="h-6 w-6 text-purple-600" />
                                <h3 className="text-lg font-medium text-gray-900">Codice Avanzato</h3>
                            </div>
                            <button
                                onClick={() => copyToClipboard(embedCodeAdvanced, 'advanced')}
                                className="btn-secondary btn-sm"
                            >
                                {copied === 'advanced' ? (
                                    <>
                                        <CheckIcon className="h-4 w-4 mr-1 text-green-600" />
                                        Copiato!
                                    </>
                                ) : (
                                    <>
                                        <ClipboardDocumentIcon className="h-4 w-4 mr-1" />
                                        Copia
                                    </>
                                )}
                            </button>
                        </div>
                        <div className="card-body">
                            <p className="text-sm text-gray-500 mb-4">
                                Questo codice include opzioni di personalizzazione e callback per eventi.
                            </p>
                            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                                <code>{embedCodeAdvanced}</code>
                            </pre>
                        </div>
                    </div>
                )}

                {/* API Key */}
                <div className="card mb-6">
                    <div className="card-header">
                        <h3 className="text-lg font-medium text-gray-900">API Key</h3>
                    </div>
                    <div className="card-body">
                        <div className="flex items-center gap-4">
                            <code className="flex-1 bg-gray-100 px-4 py-2 rounded-lg text-sm font-mono">
                                {apiKey}
                            </code>
                            <button
                                onClick={() => copyToClipboard(apiKey, 'apikey')}
                                className="btn-secondary btn-sm"
                            >
                                {copied === 'apikey' ? (
                                    <CheckIcon className="h-4 w-4 text-green-600" />
                                ) : (
                                    <ClipboardDocumentIcon className="h-4 w-4" />
                                )}
                            </button>
                        </div>
                        <p className="mt-2 text-sm text-gray-500">
                            La tua API key. Non condividerla pubblicamente.
                        </p>
                    </div>
                </div>

                {/* Instructions */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="text-lg font-medium text-gray-900">Istruzioni</h3>
                    </div>
                    <div className="card-body prose prose-sm max-w-none">
                        <h4>Come installare il widget</h4>
                        <ol>
                            <li>Copia il codice embed qui sopra</li>
                            <li>Incollalo nel tuo sito web, prima del tag <code>&lt;/body&gt;</code></li>
                            <li>Salva e ricarica la pagina</li>
                            <li>Il widget apparirà in basso a {botSettings.widget_position === 'bottom-right' ? 'destra' : 'sinistra'}</li>
                        </ol>

                        <h4>Piattaforme comuni</h4>
                        <ul>
                            <li>
                                <strong>WordPress:</strong> Aggiungi il codice nel footer.php del tuo tema
                                o usa un plugin come "Insert Headers and Footers"
                            </li>
                            <li>
                                <strong>Shopify:</strong> Vai su Online Store &gt; Themes &gt; Edit code &gt;
                                theme.liquid e incolla prima di <code>&lt;/body&gt;</code>
                            </li>
                            <li>
                                <strong>Wix:</strong> Vai su Impostazioni &gt; Avanzate &gt; Codice personalizzato
                                e aggiungi nel Body
                            </li>
                            <li>
                                <strong>Squarespace:</strong> Vai su Settings &gt; Advanced &gt; Code Injection &gt;
                                Footer
                            </li>
                        </ul>

                        <h4>Auto-trigger</h4>
                        <p>
                            {botSettings.trigger_delay > 0
                                ? `Il widget si aprirà automaticamente dopo ${botSettings.trigger_delay} secondi. Puoi modificare questo comportamento nelle impostazioni del bot.`
                                : 'L\'auto-trigger è disabilitato. Puoi abilitarlo nelle impostazioni del bot.'}
                        </p>

                        <h4>Supporto</h4>
                        <p>
                            Se hai problemi con l'installazione, contatta il supporto PS Company.
                        </p>
                    </div>
                </div>
            </div>
        </ClientLayout>
    );
}
