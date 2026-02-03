# PS Company Chatbot Platform

## Panoramica Progetto

Piattaforma SaaS multi-tenant per chatbot AI, venduta come servizio (setup + canone annuale) ai clienti di PS Company. Ogni cliente ha il proprio bot con knowledge base personalizzata, integrabile su sito web e WhatsApp.

## Stack Tecnologico

| Componente | Tecnologia |
|------------|------------|
| Backend | Laravel 11 |
| Frontend | Inertia.js + React 18 + TypeScript |
| Styling | Tailwind CSS |
| Database | MySQL 8 (DBngin in locale) |
| Server locale | Herd |
| LLM | OpenAI GPT-4o / GPT-4o-mini |
| Orchestrazione AI | n8n (su VPS esistente) |
| Widget | React standalone (embeddabile) |

## Architettura Multi-Tenant

```
┌─────────────────────────────────────────────────────────────────┐
│              app.pscompany.cloud (ADMIN PS COMPANY)             │
│         Gestione globale di tutti i tenant/bot venduti          │
└─────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│    cliente1.  │     │    cliente2.  │     │    cliente3.  │
│   pscompany.  │     │   pscompany.  │     │   pscompany.  │
│     cloud     │     │     cloud     │     │     cloud     │
│               │     │               │     │               │
│ Pannello del  │     │ Pannello del  │     │ Pannello del  │
│ cliente con   │     │ cliente con   │     │ cliente con   │
│ multi-utenza  │     │ multi-utenza  │     │ multi-utenza  │
└───────────────┘     └───────────────┘     └───────────────┘
```

## Domini

| Dominio | Uso |
|---------|-----|
| `app.pscompany.cloud` | Pannello Admin PS Company |
| `{slug}.pscompany.cloud` | Pannello Cliente (es: `acme.pscompany.cloud`) |
| `api.pscompany.cloud` | API pubblica (widget, webhook) |
| `cdn.pscompany.cloud` | Widget JS |
| `n8n.pscompany.cloud` | n8n (già esistente su VPS) |

## Struttura Database

### Tabelle Principali

- **admins** - Utenti staff PS Company (super admin)
- **tenants** - Clienti/aziende che acquistano il servizio
- **users** - Utenti del pannello cliente (owner, admin, viewer)
- **bot_settings** - Configurazione bot per tenant (prompt, colori widget, etc.)
- **knowledge_bases** - Documenti KB (file, testo, URL)
- **kb_chunks** - Chunks con embedding per RAG
- **conversations** - Conversazioni (web/whatsapp)
- **messages** - Messaggi delle conversazioni
- **leads** - Lead catturati dal bot
- **api_usage** - Tracking utilizzo API per billing

### Relazioni Chiave

```
Tenant 1:N Users (con ruoli: owner, admin, viewer)
Tenant 1:1 BotSettings
Tenant 1:N KnowledgeBases 1:N KbChunks
Tenant 1:N Conversations 1:N Messages
Tenant 1:N Leads
```

## Autenticazione

### Due Guard Separati

1. **Guard `admin`** - Per staff PS Company
   - Login su `app.pscompany.cloud/login`
   - Model: `App\Models\Admin`
   - Accesso a tutti i tenant

2. **Guard `web` (default)** - Per utenti clienti
   - Login su `{slug}.pscompany.cloud/login`
   - Model: `App\Models\User`
   - Scoped al proprio tenant

### Ruoli Utenti Cliente

- **owner** - Proprietario, accesso completo, gestisce utenti
- **admin** - Può modificare KB, settings, vede conversazioni
- **viewer** - Solo visualizzazione conversazioni e lead

## Funzionalità MVP (v1.0)

### Pannello Admin PS Company

- [ ] Dashboard con overview tutti i tenant
- [ ] CRUD Tenants (crea, modifica, sospendi)
- [ ] Visualizza conversazioni di qualsiasi tenant
- [ ] Impersona utente cliente
- [ ] Statistiche globali utilizzo

### Pannello Cliente

- [ ] Dashboard con statistiche proprie
- [ ] Gestione Knowledge Base (upload PDF/Word, testo manuale)
- [ ] Configurazione Bot (prompt, messaggi, comportamento)
- [ ] Personalizzazione Widget (colori, posizione, trigger)
- [ ] Lista Conversazioni con storico messaggi
- [ ] Lista Lead con stati (new, contacted, qualified, converted)
- [ ] Gestione Utenti (solo owner)
- [ ] Codice embed widget

### Widget Chat

- [x] Floating button con apertura chat
- [x] Auto-trigger dopo X secondi
- [x] Messaggio di benvenuto personalizzato
- [x] Storico conversazione persistente (session)
- [ ] Personalizzazione colori (v1.1)

### Integrazioni

- [x] API per widget web
- [x] Workflow n8n per elaborazione messaggi
- [ ] Webhook WhatsApp Business API
- [ ] Estrazione automatica lead (email/telefono)

## API Endpoints

### API Pubblica (widget) - Autenticazione: `X-API-Key`

```
POST /api/chat/message     - Invia messaggio, ricevi risposta
GET  /api/chat/config      - Configurazione widget
GET  /api/chat/history/:id - Storico conversazione
```

### API Interna (n8n) - Autenticazione: `X-Internal-Key`

```
POST /api/internal/tenant/validate
POST /api/internal/conversation/context
POST /api/internal/rag/search
POST /api/internal/message/save
POST /api/internal/lead/create
POST /api/internal/whatsapp/tenant-by-phone
```

## Struttura Directory Laravel

```
app/
├── Http/
│   ├── Controllers/
│   │   ├── Admin/           # Controller pannello admin
│   │   ├── Client/          # Controller pannello cliente
│   │   └── Api/             # Controller API
│   ├── Middleware/
│   │   ├── AuthenticateApiKey.php
│   │   ├── AuthenticateInternalApi.php
│   │   ├── IdentifyTenant.php
│   │   └── EnsureUserBelongsToTenant.php
│   └── Requests/
├── Models/
│   ├── Admin.php
│   ├── Tenant.php
│   ├── User.php
│   ├── BotSetting.php
│   ├── KnowledgeBase.php
│   ├── KbChunk.php
│   ├── Conversation.php
│   ├── Message.php
│   ├── Lead.php
│   └── ApiUsage.php
├── Services/
│   ├── ChatService.php
│   ├── RagService.php
│   └── KnowledgeBaseProcessor.php
└── Traits/
    └── BelongsToTenant.php

resources/js/
├── Pages/
│   ├── Admin/               # Pagine pannello admin
│   │   ├── Dashboard.tsx
│   │   ├── Tenants/
│   │   └── ...
│   ├── Client/              # Pagine pannello cliente
│   │   ├── Dashboard.tsx
│   │   ├── KnowledgeBase/
│   │   ├── Conversations/
│   │   ├── Leads/
│   │   ├── Settings/
│   │   └── Users/
│   └── Auth/
│       ├── AdminLogin.tsx
│       └── Login.tsx
├── Components/
│   ├── Admin/
│   └── Client/
└── Layouts/
    ├── AdminLayout.tsx
    └── ClientLayout.tsx
```

## Environment Variables

```env
# App
APP_URL=http://chatbot.test

# Database (DBngin)
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=pscompany_chatbot
DB_USERNAME=root
DB_PASSWORD=

# OpenAI
OPENAI_API_KEY=sk-...

# n8n
N8N_WEBHOOK_URL=https://n8n.pscompany.cloud
N8N_INTERNAL_KEY=chiave_segreta_lunga

# Domini
ADMIN_DOMAIN=app.pscompany.cloud
```

## Comandi Utili

```bash
# Sviluppo locale
herd link chatbot              # Crea chatbot.test
php artisan migrate:fresh --seed
php artisan serve              # Se non usi Herd

# Queue (per processing KB)
php artisan queue:work

# Cache
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

## Note Implementative

### Multi-Tenancy

Il trait `BelongsToTenant` applica automaticamente uno scope globale che filtra i dati per `tenant_id`. Il tenant corrente viene identificato da:

1. Subdomain della request (`acme.pscompany.cloud` → tenant con slug `acme`)
2. User autenticato (`auth()->user()->tenant_id`)

### RAG (Retrieval Augmented Generation)

1. Upload documento → estrazione testo
2. Split in chunks (~500 token)
3. Generazione embedding con OpenAI `text-embedding-3-small`
4. Salvataggio in `kb_chunks` con embedding JSON
5. Ricerca: embedding query → cosine similarity → top 5 chunks
6. Chunks aggiunti al prompt come contesto

### Widget

Il widget è un bundle React standalone (`pscompany-chat.js`) che:
- Si inizializza con `window.pscompanyChatConfig`
- Comunica con API via `X-API-Key`
- Mantiene sessione in localStorage
- È isolato con CSS prefissato `.pscompany-*`

## Roadmap

### v1.0 (MVP)
- Setup completo Laravel + Inertia
- Pannello Admin base
- Pannello Cliente completo
- Widget funzionante
- Integrazione WhatsApp base

### v1.1
- Customizzazione colori widget dal pannello
- Web scraping automatico per KB
- Analytics avanzate
- Export lead CSV

### v2.0
- Integrazione calendari (Calendly, Cal.com)
- Handoff a operatore umano
- Multi-lingua automatica
- A/B testing messaggi
