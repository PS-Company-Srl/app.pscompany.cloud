import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import ClientLayout from '@/Layouts/ClientLayout';
import { BotSetting } from '@/types';

interface Props {
    settings: BotSetting;
}

export default function BotSettings({ settings }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        system_prompt: settings.system_prompt,
        welcome_message: settings.welcome_message,
        fallback_message: settings.fallback_message,
        fallback_action: settings.fallback_action,
        lead_goal: settings.lead_goal || '',
        trigger_delay: settings.trigger_delay,
        trigger_message: settings.trigger_message || '',
        openai_model: settings.openai_model,
        temperature: settings.temperature,
        max_tokens: settings.max_tokens,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put('/settings/bot');
    };

    return (
        <ClientLayout title="Impostazioni Bot">
            <Head title="Impostazioni Bot" />

            {/* Settings Nav */}
            <div className="mb-6 border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    <a
                        href="/settings/bot"
                        className="border-primary-500 text-primary-600 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
                    >
                        Bot
                    </a>
                    <a
                        href="/settings/widget"
                        className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
                    >
                        Widget
                    </a>
                </nav>
            </div>

            <form onSubmit={submit} className="space-y-6">
                {/* Prompt Settings */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="text-lg font-medium text-gray-900">Comportamento del Bot</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Configura come il bot si comporta e risponde ai visitatori
                        </p>
                    </div>
                    <div className="card-body space-y-6">
                        <div>
                            <label htmlFor="system_prompt" className="label">System Prompt *</label>
                            <textarea
                                id="system_prompt"
                                rows={8}
                                className={`input font-mono text-sm ${errors.system_prompt ? 'input-error' : ''}`}
                                value={data.system_prompt}
                                onChange={(e) => setData('system_prompt', e.target.value)}
                                required
                            />
                            <p className="mt-1 text-sm text-gray-500">
                                Le istruzioni di base per il comportamento del bot
                            </p>
                            {errors.system_prompt && <p className="mt-1 text-sm text-red-600">{errors.system_prompt}</p>}
                        </div>

                        <div>
                            <label htmlFor="lead_goal" className="label">Obiettivo Lead (opzionale)</label>
                            <textarea
                                id="lead_goal"
                                rows={3}
                                className={`input ${errors.lead_goal ? 'input-error' : ''}`}
                                placeholder="Es: Quando l'utente mostra interesse, invitalo a lasciare i contatti..."
                                value={data.lead_goal}
                                onChange={(e) => setData('lead_goal', e.target.value)}
                            />
                            <p className="mt-1 text-sm text-gray-500">
                                Istruzioni su quando e come chiedere i contatti
                            </p>
                            {errors.lead_goal && <p className="mt-1 text-sm text-red-600">{errors.lead_goal}</p>}
                        </div>
                    </div>
                </div>

                {/* Messages */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="text-lg font-medium text-gray-900">Messaggi</h3>
                    </div>
                    <div className="card-body space-y-6">
                        <div>
                            <label htmlFor="welcome_message" className="label">Messaggio di Benvenuto *</label>
                            <textarea
                                id="welcome_message"
                                rows={2}
                                className={`input ${errors.welcome_message ? 'input-error' : ''}`}
                                value={data.welcome_message}
                                onChange={(e) => setData('welcome_message', e.target.value)}
                                required
                            />
                            {errors.welcome_message && <p className="mt-1 text-sm text-red-600">{errors.welcome_message}</p>}
                        </div>

                        <div>
                            <label htmlFor="fallback_message" className="label">Messaggio Fallback *</label>
                            <textarea
                                id="fallback_message"
                                rows={2}
                                className={`input ${errors.fallback_message ? 'input-error' : ''}`}
                                value={data.fallback_message}
                                onChange={(e) => setData('fallback_message', e.target.value)}
                                required
                            />
                            <p className="mt-1 text-sm text-gray-500">
                                Mostrato quando il bot non trova informazioni nella knowledge base
                            </p>
                            {errors.fallback_message && <p className="mt-1 text-sm text-red-600">{errors.fallback_message}</p>}
                        </div>

                        <div>
                            <label htmlFor="fallback_action" className="label">Azione Fallback</label>
                            <select
                                id="fallback_action"
                                className={`input ${errors.fallback_action ? 'input-error' : ''}`}
                                value={data.fallback_action}
                                onChange={(e) => setData('fallback_action', e.target.value as BotSetting['fallback_action'])}
                            >
                                <option value="ask_contact">Chiedi i contatti</option>
                                <option value="escalate">Escalation (handoff)</option>
                                <option value="none">Nessuna azione</option>
                            </select>
                            {errors.fallback_action && <p className="mt-1 text-sm text-red-600">{errors.fallback_action}</p>}
                        </div>
                    </div>
                </div>

                {/* Auto-trigger */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="text-lg font-medium text-gray-900">Auto-Trigger</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Apri automaticamente il widget dopo un certo tempo
                        </p>
                    </div>
                    <div className="card-body space-y-6">
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div>
                                <label htmlFor="trigger_delay" className="label">Ritardo (secondi)</label>
                                <input
                                    type="number"
                                    id="trigger_delay"
                                    className={`input ${errors.trigger_delay ? 'input-error' : ''}`}
                                    value={data.trigger_delay}
                                    onChange={(e) => setData('trigger_delay', parseInt(e.target.value))}
                                    min={0}
                                    max={300}
                                />
                                <p className="mt-1 text-sm text-gray-500">0 = disabilitato</p>
                                {errors.trigger_delay && <p className="mt-1 text-sm text-red-600">{errors.trigger_delay}</p>}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="trigger_message" className="label">Messaggio Trigger (opzionale)</label>
                            <input
                                type="text"
                                id="trigger_message"
                                className={`input ${errors.trigger_message ? 'input-error' : ''}`}
                                placeholder="Es: Hai bisogno di aiuto?"
                                value={data.trigger_message}
                                onChange={(e) => setData('trigger_message', e.target.value)}
                            />
                            {errors.trigger_message && <p className="mt-1 text-sm text-red-600">{errors.trigger_message}</p>}
                        </div>
                    </div>
                </div>

                {/* AI Model Settings */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="text-lg font-medium text-gray-900">Modello AI</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Configura il modello OpenAI utilizzato
                        </p>
                    </div>
                    <div className="card-body space-y-6">
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                            <div>
                                <label htmlFor="openai_model" className="label">Modello</label>
                                <select
                                    id="openai_model"
                                    className={`input ${errors.openai_model ? 'input-error' : ''}`}
                                    value={data.openai_model}
                                    onChange={(e) => setData('openai_model', e.target.value)}
                                >
                                    <option value="gpt-4o-mini">GPT-4o Mini (veloce, economico)</option>
                                    <option value="gpt-4o">GPT-4o (migliore qualità)</option>
                                    <option value="gpt-4-turbo">GPT-4 Turbo</option>
                                </select>
                                {errors.openai_model && <p className="mt-1 text-sm text-red-600">{errors.openai_model}</p>}
                            </div>

                            <div>
                                <label htmlFor="temperature" className="label">
                                    Temperature ({data.temperature})
                                </label>
                                <input
                                    type="range"
                                    id="temperature"
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                    value={data.temperature}
                                    onChange={(e) => setData('temperature', parseFloat(e.target.value))}
                                    min={0}
                                    max={2}
                                    step={0.1}
                                />
                                <p className="mt-1 text-xs text-gray-500">0 = preciso, 2 = creativo</p>
                                {errors.temperature && <p className="mt-1 text-sm text-red-600">{errors.temperature}</p>}
                            </div>

                            <div>
                                <label htmlFor="max_tokens" className="label">Max Token Risposta</label>
                                <input
                                    type="number"
                                    id="max_tokens"
                                    className={`input ${errors.max_tokens ? 'input-error' : ''}`}
                                    value={data.max_tokens}
                                    onChange={(e) => setData('max_tokens', parseInt(e.target.value))}
                                    min={100}
                                    max={4000}
                                />
                                {errors.max_tokens && <p className="mt-1 text-sm text-red-600">{errors.max_tokens}</p>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Submit */}
                <div className="flex justify-end">
                    <button type="submit" disabled={processing} className="btn-primary">
                        {processing ? 'Salvataggio...' : 'Salva Impostazioni'}
                    </button>
                </div>
            </form>
        </ClientLayout>
    );
}
