# PSCompany Cloud — AI Chatbot SaaS Platform

Piattaforma SaaS per la creazione e gestione di chatbot AI personalizzati. Le aziende possono creare chatbot alimentati da OpenAI, addestrarli con contenuti del proprio sito web e documenti aziendali, e integrarli su qualsiasi sito tramite widget JavaScript.

## Stack tecnologico

| Layer | Tecnologia |
|-------|-----------|
| Backend | Laravel 12, PHP 8.2+ |
| Frontend | React 19, Inertia.js 2, Tailwind CSS 4 |
| Build | Vite 7 |
| Database | SQLite (dev) / MySQL / PostgreSQL |
| AI | OpenAI GPT-4o-mini |
| Queue | Laravel Queue (driver: database) |

## Funzionalità principali

- **Gestione aziende** — CRUD completo, profilo con dati di contatto e configurazione mail
- **Chatbot per azienda** — Ogni azienda può avere più chatbot con obiettivi diversi (assistente, acquisizione lead, personalizzato)
- **Addestramento automatico** — Crawler del sito web aziendale (fino a 50 pagine) + estrazione testo da documenti PDF/Word
- **Widget embeddable** — `widget.js` da includere su qualsiasi sito, autenticato tramite API key
- **CRM minimalista** — Estrazione automatica di email, telefono e nome dai messaggi chat
- **Recap email** — Invio riepilogo conversazione all'utente con ritardo configurabile
- **Ruoli** — Admin (accesso completo) e Customer (accesso alla propria azienda)

## Struttura del progetto

```
app/
  Http/
    Controllers/
      Admin/         # Pannello admin (aziende, utenti, chatbot, conversazioni)
      Customer/      # Pannello cliente (dashboard, chatbot, conversazioni)
      Api/           # Endpoint pubblici per il widget
    Middleware/      # Auth per ruoli, validazione API key
  Models/            # User, Company, Chatbot, Conversation, Message, CompanyDocument
  Services/
    ChatbotService.php   # Integrazione OpenAI, costruzione contesto
  Jobs/              # FetchCompanyWebsiteContent, ProcessCompanyDocument, SendConversationRecapEmail
  Mail/
    ConversationRecapMail.php

resources/js/
  Pages/Admin/       # Pagine React admin
  Pages/Customer/    # Pagine React cliente
  Layouts/           # Layout admin e customer

public/
  widget.js          # Widget embeddable per siti esterni
  widget-test.html   # Pagina di test integrazione widget

routes/
  web.php            # Rotte web (admin, customer, auth)
  api.php            # API pubblica per il widget
```

## Installazione

```bash
# Clona il repo e installa le dipendenze
composer install
npm install

# Configura l'ambiente
cp .env.example .env
php artisan key:generate

# Esegui le migration e i seeder
php artisan migrate --seed

# Build del frontend
npm run build
```

### Variabili d'ambiente principali

```env
APP_URL=http://localhost
DB_CONNECTION=sqlite          # oppure mysql/pgsql in produzione

OPENAI_API_KEY=sk-...         # Fallback globale per i chatbot

MAIL_MAILER=smtp
MAIL_HOST=...
MAIL_PORT=587
MAIL_USERNAME=...
MAIL_PASSWORD=...
```

## Sviluppo

```bash
# Avvia tutto in parallelo (server, queue, logs, vite)
composer dev

# Solo frontend
npm run dev
```

## Produzione

In produzione è necessario un worker per la coda (scraping siti, estrazione documenti, email):

```bash
# Cron ogni minuto
* * * * * cd /path/to/app && php artisan schedule:run >> /dev/null 2>&1

# Oppure worker persistente
php artisan queue:work --stop-when-empty
```

## API Widget

Il widget si integra su siti esterni tramite API key. Endpoint disponibili:

| Metodo | Endpoint | Descrizione |
|--------|----------|-------------|
| `POST` | `/api/chatbot/config` | Configurazione widget (colori, messaggio benvenuto) |
| `POST` | `/api/chatbot/message` | Invia messaggio e riceve risposta AI |

Header richiesto: `X-API-Key: {api_key}`

## Database

Tabelle principali: `users`, `roles`, `companies`, `company_documents`, `chatbots`, `conversations`, `messages`

Credenziali seed predefinite:
- **Admin:** `admin@example.com` / `password`
- **Customer:** `customer@example.com` / `password`

## Test

```bash
composer test
# oppure
php artisan test
```
