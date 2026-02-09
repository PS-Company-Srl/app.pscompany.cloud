# Integrazione WhatsApp – linee guida

Obiettivo: permettere ai chatbot di rispondere anche su **WhatsApp** oltre che sul widget web.

## Opzioni principali

### 1. WhatsApp Business API (ufficiale Meta)

- **Requisiti**: account Meta Business, app su Meta for Developers, numero di telefono dedicato (o messaggistica cloud).
- **Flusso**: i messaggi in arrivo su WhatsApp vengono inviati da Meta ai tuoi webhook; il backend identifica il numero/azienda, recupera il chatbot (o un chatbot “WhatsApp” per quell’azienda), invia il messaggio al `ChatbotService` e risponde via API a Meta.
- **Nel nostro progetto**:
  - Aggiungere una tabella `whatsapp_channels` (o simile): `company_id`, `chatbot_id`, `phone_number_id` (Meta), `whatsapp_business_account_id`, token/credentials.
  - Endpoint webhook (es. `POST /api/webhooks/whatsapp`) che riceve gli eventi da Meta, valida la firma, estrae mittente e testo, risolve il chatbot (es. per numero o per company_id), chiama `ChatbotService->reply()`, invia la risposta con l’API WhatsApp Cloud.
  - Un chatbot può essere usato sia sul widget (api_key) sia su WhatsApp (collegando il canale a quel `chatbot_id`).

### 2. Gateway/servizi terzi (Twilio, MessageBird, 360dialog, ecc.)

- Forniscono un numero WhatsApp e inoltrano i messaggi al tuo backend via webhook HTTP.
- Stesso concetto: webhook → identifica azienda/chatbot → `ChatbotService->reply()` → risposta tramite l’API del gateway.

### 3. Approccio consigliato (fase 1)

1. **Un webhook unico** (es. `POST /api/webhooks/whatsapp`) che riceve i payload (Meta o gateway).
2. **Mappatura numero → company/chatbot**: tabella o config che associa un “numero WhatsApp” (o numero di telefono cliente) a un `company_id` e opzionalmente a un `chatbot_id`. Se un’azienda ha un solo chatbot WhatsApp, si può derivare da `company_id`.
3. **Stesso `ChatbotService`**: il messaggio utente e la history (se disponibile) vengono passati a `reply($chatbot, $userMessage, $history)`; la risposta viene inviata su WhatsApp tramite l’API scelta.
4. **Storia conversazione**: opzionale tabella `conversations` con `channel` (web | whatsapp), `external_id` (es. numero WhatsApp utente), `chatbot_id`, per tenere history e contesto come sul widget.

## Passi implementativi suggeriti

1. **Scegliere il canale**: WhatsApp Business API (Cloud) o un gateway (es. Twilio/360dialog).
2. **Aggiungere tabella canali** (es. `chatbot_whatsapp_channels`): `chatbot_id`, `phone_number_id`, `meta_phone_number_id`, token, ecc., per collegare un chatbot a un numero WhatsApp.
3. **Implementare il webhook** in `app/Http/Controllers/Api/WhatsAppWebhookController.php`: parsing payload, risoluzione chatbot, chiamata a `ChatbotService`, invio risposta.
4. **Dashboard cliente**: sezione “Canale WhatsApp” dove collegare un numero (o configurare l’integrazione) al chatbot scelto.

## Riferimenti

- [WhatsApp Cloud API](https://developers.facebook.com/docs/whatsapp/cloud-api)
- [Webhook setup](https://developers.facebook.com/docs/graph-api/webhooks)
- [Twilio WhatsApp](https://www.twilio.com/docs/whatsapp) (alternativa)
