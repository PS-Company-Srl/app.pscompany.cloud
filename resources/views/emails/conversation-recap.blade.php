<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Recap conversazione</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.5; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 24px; }
        h1 { font-size: 1.25rem; margin-bottom: 16px; color: #111827; }
        h2 { font-size: 1rem; margin: 20px 0 8px; color: #374151; }
        .meta { background: #f3f4f6; padding: 12px 16px; border-radius: 8px; margin-bottom: 20px; font-size: 0.875rem; }
        .meta p { margin: 4px 0; }
        .message { margin: 12px 0; padding: 10px 14px; border-radius: 8px; font-size: 0.9rem; }
        .message.user { background: #eff6ff; border-left: 4px solid #3b82f6; }
        .message.assistant { background: #f0fdf4; border-left: 4px solid #22c55e; }
        .message .role { font-weight: 600; font-size: 0.75rem; text-transform: uppercase; margin-bottom: 4px; color: #6b7280; }
        .footer { margin-top: 24px; font-size: 0.75rem; color: #9ca3af; }
    </style>
</head>
<body>
    @php
        $chatbot = $conversation->chatbot;
        $company = $chatbot->company;
    @endphp

    <h1>Recap della tua conversazione</h1>
    <p>Ciao@if(!empty($conversation->first_name)) {{ $conversation->first_name }}@endif,</p>
    <p>Ecco il riepilogo della conversazione avuta con l'assistente di <strong>{{ $company->name }}</strong> ({{ $chatbot->name }}).</p>

    <h2>Dati inseriti</h2>
    <div class="meta">
        @if(!empty($conversation->first_name) || !empty($conversation->last_name))
            <p><strong>Nome:</strong> {{ trim(($conversation->first_name ?? '') . ' ' . ($conversation->last_name ?? '')) }}</p>
        @endif
        @if(!empty($conversation->email))
            <p><strong>Email:</strong> {{ $conversation->email }}</p>
        @endif
        @if(!empty($conversation->phone))
            <p><strong>Telefono:</strong> {{ $conversation->phone }}</p>
        @endif
        <p><strong>Data conversazione:</strong> {{ $conversation->started_at->locale('it')->isoFormat('dddd D MMMM YYYY, HH:mm') }}</p>
    </div>

    <h2>Conversazione</h2>
    @forelse($conversation->message_history ?? [] as $entry)
        <div class="message {{ $entry['role'] ?? 'user' }}">
            <div class="role">{{ ($entry['role'] ?? 'user') === 'user' ? 'Tu' : 'Assistente' }}</div>
            <div>{{ e($entry['content'] ?? '') }}</div>
        </div>
    @empty
        <p>Nessun messaggio nello storico.</p>
    @endforelse

    <div class="footer">
        Questa email è stata inviata automaticamente da {{ config('app.name') }}. Per domande contatta {{ $company->name }}.
    </div>
</body>
</html>
