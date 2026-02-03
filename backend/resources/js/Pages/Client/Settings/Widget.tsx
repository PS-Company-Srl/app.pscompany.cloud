import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import ClientLayout from '@/Layouts/ClientLayout';
import { BotSetting, WidgetColors } from '@/types';

interface Props {
    settings: BotSetting;
    previewUrl: string;
}

export default function WidgetSettings({ settings, previewUrl }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        widget_position: settings.widget_position,
        widget_colors: settings.widget_colors || {
            primary: '#0066FF',
            secondary: '#FFFFFF',
            text: '#333333',
            userBubble: '#0066FF',
            botBubble: '#F0F0F0',
        },
    });

    const handleColorChange = (key: keyof WidgetColors, value: string) => {
        setData('widget_colors', {
            ...data.widget_colors,
            [key]: value,
        });
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put('/settings/widget');
    };

    const colorFields: Array<{ key: keyof WidgetColors; label: string }> = [
        { key: 'primary', label: 'Colore Primario' },
        { key: 'secondary', label: 'Colore Secondario' },
        { key: 'text', label: 'Colore Testo' },
        { key: 'userBubble', label: 'Bubble Utente' },
        { key: 'botBubble', label: 'Bubble Bot' },
    ];

    return (
        <ClientLayout title="Impostazioni Widget">
            <Head title="Impostazioni Widget" />

            {/* Settings Nav */}
            <div className="mb-6 border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    <a
                        href="/settings/bot"
                        className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
                    >
                        Bot
                    </a>
                    <a
                        href="/settings/widget"
                        className="border-primary-500 text-primary-600 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
                    >
                        Widget
                    </a>
                </nav>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Settings Form */}
                <div>
                    <form onSubmit={submit} className="space-y-6">
                        {/* Position */}
                        <div className="card">
                            <div className="card-header">
                                <h3 className="text-lg font-medium text-gray-900">Posizione</h3>
                            </div>
                            <div className="card-body">
                                <div className="flex gap-4">
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="position"
                                            value="bottom-right"
                                            checked={data.widget_position === 'bottom-right'}
                                            onChange={() => setData('widget_position', 'bottom-right')}
                                            className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">Basso Destra</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="position"
                                            value="bottom-left"
                                            checked={data.widget_position === 'bottom-left'}
                                            onChange={() => setData('widget_position', 'bottom-left')}
                                            className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">Basso Sinistra</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Colors */}
                        <div className="card">
                            <div className="card-header">
                                <h3 className="text-lg font-medium text-gray-900">Colori</h3>
                            </div>
                            <div className="card-body">
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    {colorFields.map(({ key, label }) => (
                                        <div key={key}>
                                            <label className="label">{label}</label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="color"
                                                    value={data.widget_colors[key]}
                                                    onChange={(e) => handleColorChange(key, e.target.value)}
                                                    className="h-10 w-14 rounded cursor-pointer border border-gray-300"
                                                />
                                                <input
                                                    type="text"
                                                    value={data.widget_colors[key]}
                                                    onChange={(e) => handleColorChange(key, e.target.value)}
                                                    className="input font-mono text-sm"
                                                    pattern="^#[0-9A-Fa-f]{6}$"
                                                />
                                            </div>
                                        </div>
                                    ))}
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
                </div>

                {/* Preview */}
                <div>
                    <div className="card sticky top-24">
                        <div className="card-header">
                            <h3 className="text-lg font-medium text-gray-900">Anteprima</h3>
                        </div>
                        <div className="card-body">
                            {/* Widget Preview Mock */}
                            <div className="relative bg-gray-100 rounded-lg p-4 min-h-[400px]">
                                {/* Chat Window Preview */}
                                <div
                                    className={`absolute ${
                                        data.widget_position === 'bottom-right' ? 'right-4' : 'left-4'
                                    } bottom-20 w-80 rounded-xl shadow-xl overflow-hidden`}
                                    style={{ backgroundColor: data.widget_colors.secondary }}
                                >
                                    {/* Header */}
                                    <div
                                        className="px-4 py-3"
                                        style={{ backgroundColor: data.widget_colors.primary }}
                                    >
                                        <h4 className="font-medium" style={{ color: data.widget_colors.secondary }}>
                                            Chat Support
                                        </h4>
                                    </div>

                                    {/* Messages */}
                                    <div className="p-4 space-y-3">
                                        {/* Bot message */}
                                        <div className="flex justify-start">
                                            <div
                                                className="max-w-[80%] rounded-lg px-3 py-2"
                                                style={{ backgroundColor: data.widget_colors.botBubble }}
                                            >
                                                <p className="text-sm" style={{ color: data.widget_colors.text }}>
                                                    {settings.welcome_message}
                                                </p>
                                            </div>
                                        </div>

                                        {/* User message */}
                                        <div className="flex justify-end">
                                            <div
                                                className="max-w-[80%] rounded-lg px-3 py-2"
                                                style={{ backgroundColor: data.widget_colors.userBubble }}
                                            >
                                                <p className="text-sm text-white">
                                                    Ciao, ho una domanda
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Input */}
                                    <div className="border-t px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                placeholder="Scrivi un messaggio..."
                                                className="flex-1 text-sm border-gray-300 rounded-full px-4 py-2"
                                                disabled
                                            />
                                            <button
                                                className="p-2 rounded-full"
                                                style={{ backgroundColor: data.widget_colors.primary }}
                                                disabled
                                            >
                                                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* FAB Button */}
                                <div
                                    className={`absolute ${
                                        data.widget_position === 'bottom-right' ? 'right-4' : 'left-4'
                                    } bottom-4`}
                                >
                                    <button
                                        className="w-14 h-14 rounded-full shadow-lg flex items-center justify-center"
                                        style={{ backgroundColor: data.widget_colors.primary }}
                                    >
                                        <svg
                                            className="w-6 h-6"
                                            fill="none"
                                            stroke="white"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                            />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            <p className="mt-4 text-sm text-gray-500 text-center">
                                Questa è un'anteprima. L'aspetto finale potrebbe variare leggermente.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </ClientLayout>
    );
}
