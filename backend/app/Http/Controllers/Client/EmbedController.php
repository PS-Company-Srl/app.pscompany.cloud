<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class EmbedController extends Controller
{
    public function index(): Response
    {
        $tenant = app('current_tenant');
        $botSettings = $tenant->botSettings;

        // Genera il codice embed
        $apiKey = $tenant->api_key;
        $cdnDomain = config('app.cdn_domain', 'cdn.pscompany.cloud');

        $embedCode = <<<HTML
<!-- PS Company Chatbot Widget -->
<script>
  window.pscompanyChatConfig = {
    apiKey: "{$apiKey}"
  };
</script>
<script src="https://{$cdnDomain}/widget.js" async></script>
HTML;

        // Codice alternativo con più opzioni
        $embedCodeAdvanced = <<<HTML
<!-- PS Company Chatbot Widget (Configurazione Avanzata) -->
<script>
  window.pscompanyChatConfig = {
    apiKey: "{$apiKey}",
    // Opzioni di personalizzazione (opzionali)
    position: "{$botSettings->widget_position}",
    autoTrigger: {
      enabled: true,
      delay: {$botSettings->trigger_delay}
    },
    // Callback eventi (opzionali)
    onOpen: function() { console.log('Chat aperta'); },
    onClose: function() { console.log('Chat chiusa'); },
    onMessage: function(msg) { console.log('Nuovo messaggio:', msg); }
  };
</script>
<script src="https://{$cdnDomain}/widget.js" async></script>
HTML;

        return Inertia::render('Client/Embed/Index', [
            'apiKey' => $apiKey,
            'embedCode' => $embedCode,
            'embedCodeAdvanced' => $embedCodeAdvanced,
            'cdnDomain' => $cdnDomain,
            'botSettings' => [
                'trigger_delay' => $botSettings->trigger_delay,
                'widget_position' => $botSettings->widget_position,
            ],
        ]);
    }
}
