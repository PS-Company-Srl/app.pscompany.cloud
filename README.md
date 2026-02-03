# PS Company Chatbot Platform

Piattaforma multi-tenant per chatbot AI con integrazione web e WhatsApp.

## 🏗️ Architettura

```
┌─────────────────────────────────────────────────────────────────┐
│                    app.pscompany.cloud (Admin)                  │
│                 Gestione globale tutti i bot                    │
└─────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│  cliente1.    │     │  cliente2.    │     │  cliente3.    │
│  pscompany.   │     │  pscompany.   │     │  pscompany.   │
│  cloud        │     │  cloud        │     │  cloud        │
└───────────────┘     └───────────────┘     └───────────────┘
```

## 📁 Struttura Progetto

```
chatbot-project/
├── backend/              # Laravel 11 + Inertia/React
├── widget/               # React Widget embeddabile (standalone)
├── n8n-workflows/        # Workflow da importare su n8n VPS
└── docs/                 # Documentazione
```

## 🚀 Setup Locale (Herd + DBngin)

### Prerequisiti

- [Herd](https://herd.laravel.com/) installato
- [DBngin](https://dbngin.com/) installato
- Node.js 18+
- Composer

### 1. Database

1. Apri **DBngin**
2. Crea un nuovo server MySQL 8
3. Crea un database: `pscompany_chatbot`

### 2. Backend Laravel

```bash
cd backend

# Installa dipendenze
composer install

# Configura environment
cp .env.example .env
php artisan key:generate

# Modifica .env con i tuoi dati DBngin
# DB_HOST=127.0.0.1
# DB_PORT=3306 (o la porta di DBngin)
# DB_DATABASE=pscompany_chatbot
# DB_USERNAME=root
# DB_PASSWORD=

# Esegui migrations
php artisan migrate --seed

# Link con Herd
herd link chatbot

# Ora accessibile su http://chatbot.test
```

### 3. Widget (sviluppo)

```bash
cd widget

npm install
npm run dev

# Widget disponibile su http://localhost:3001
```

### 4. n8n Workflows

1. Accedi alla tua istanza n8n sulla VPS
2. Importa i file JSON da `/n8n-workflows/`
3. Configura le credenziali (OpenAI, Internal API)

## 🔧 Configurazione

### Environment Variables (.env)

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

# n8n (tua istanza VPS)
N8N_WEBHOOK_URL=https://n8n.pscompany.cloud
N8N_INTERNAL_KEY=your_secret_key

# Domini produzione
ADMIN_DOMAIN=app.pscompany.cloud
API_DOMAIN=api.pscompany.cloud
CDN_DOMAIN=cdn.pscompany.cloud
```

## 📊 Stack Tecnologico

| Componente | Tecnologia |
|------------|------------|
| Backend | Laravel 11 + Inertia.js |
| Frontend Admin | React 18 + TypeScript + Tailwind |
| Database | MySQL 8 (DBngin) |
| Cache | File/Redis (Herd) |
| AI Orchestration | n8n (VPS) |
| LLM | OpenAI GPT-4o |
| Widget | React standalone |

## 🌐 Domini (Produzione)

| Dominio | Uso |
|---------|-----|
| `app.pscompany.cloud` | Pannello Admin PS Company |
| `*.pscompany.cloud` | Pannelli Cliente (sottodomini) |
| `api.pscompany.cloud` | API pubblica |
| `cdn.pscompany.cloud` | Widget JS |
| `n8n.pscompany.cloud` | n8n (già esistente) |

## 📈 Roadmap

### MVP (v1.0)
- [x] Schema database multi-tenant
- [x] Widget React embeddabile
- [x] Workflow n8n chatbot
- [x] Integrazione WhatsApp
- [ ] Pannello Admin PS Company
- [ ] Pannello Cliente
- [ ] RAG con knowledge base
- [ ] Lead capture automatico

### v1.1
- [ ] Customizzazione estetica widget
- [ ] Web scraping per knowledge base
- [ ] Analytics avanzate

## 📝 License

Proprietario - PS Company
