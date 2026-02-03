# Guida Integrazione Widget - PS Company Chat

## Installazione Rapida

Aggiungi questo codice prima di `</body>`:

```html
<script>
  window.pscompanyChatConfig = {
    apiKey: 'pk_live_xxxxxxxxxxxxx',
    welcomeMessage: 'Ciao! 👋 Come posso aiutarti?',
    triggerDelay: 15,
    companyName: 'Nome Azienda',
  };
</script>
<script src="https://cdn.pscompany.cloud/widget/pscompany-chat.js" async></script>
```

## Opzioni di Configurazione

| Parametro | Tipo | Default | Descrizione |
|-----------|------|---------|-------------|
| `apiKey` | string | **obbligatorio** | API key del tenant |
| `position` | string | `'bottom-right'` | `'bottom-right'` o `'bottom-left'` |
| `welcomeMessage` | string | `'Ciao! 👋'` | Messaggio iniziale |
| `triggerDelay` | number | `0` | Secondi prima apertura automatica |
| `triggerMessage` | string | - | Messaggio trigger automatico |
| `companyName` | string | `'Assistente'` | Nome nell'header |
| `companyLogo` | string | - | URL logo |
| `colors` | object | - | Personalizzazione colori |

### Colori Personalizzati

```javascript
colors: {
  primary: '#0066FF',
  secondary: '#FFFFFF',
  text: '#333333',
  userBubble: '#0066FF',
  botBubble: '#F0F0F0',
}
```

## WordPress

Aggiungi al `functions.php`:

```php
function pscompany_chat() { ?>
  <script>
    window.pscompanyChatConfig = {
      apiKey: 'TUA_API_KEY',
      welcomeMessage: 'Ciao! Come posso aiutarti?',
    };
  </script>
  <script src="https://cdn.pscompany.cloud/widget/pscompany-chat.js" async></script>
<?php }
add_action('wp_footer', 'pscompany_chat');
```

## Shopify

1. Vai in **Online Store > Themes > Edit code**
2. Apri `theme.liquid`
3. Incolla il codice prima di `</body>`
