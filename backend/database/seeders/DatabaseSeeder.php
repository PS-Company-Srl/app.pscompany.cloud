<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ================================================
        // ADMIN PS COMPANY
        // ================================================
        $adminId = DB::table('admins')->insertGetId([
            'name' => 'Admin PS Company',
            'email' => 'admin@pscompany.cloud',
            'password' => Hash::make('password'), // CAMBIARE IN PRODUZIONE!
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // ================================================
        // TENANT DI ESEMPIO
        // ================================================
        $apiKey = 'pk_live_' . Str::random(32);
        
        $tenantId = DB::table('tenants')->insertGetId([
            'name' => 'Demo Company',
            'slug' => 'demo',
            'api_key' => $apiKey,
            'settings' => json_encode([
                'company_name' => 'Demo Company Srl',
                'company_email' => 'info@demo.it',
                'company_phone' => '+39 02 1234567',
                'timezone' => 'Europe/Rome',
                'language' => 'it',
            ]),
            'status' => 'active',
            'monthly_message_limit' => 5000,
            'plan' => 'business',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // ================================================
        // USER OWNER DEL TENANT
        // ================================================
        DB::table('users')->insert([
            'tenant_id' => $tenantId,
            'name' => 'Mario Rossi',
            'email' => 'mario@demo.it',
            'password' => Hash::make('password'),
            'role' => 'owner',
            'email_verified_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // ================================================
        // BOT SETTINGS
        // ================================================
        DB::table('bot_settings')->insert([
            'tenant_id' => $tenantId,
            'system_prompt' => $this->getDefaultSystemPrompt('Demo Company Srl'),
            'welcome_message' => 'Ciao! 👋 Sono l\'assistente virtuale di Demo Company. Come posso aiutarti oggi?',
            'fallback_message' => 'Mi dispiace, non ho informazioni specifiche su questo argomento. Vuoi lasciare i tuoi contatti per essere richiamato da un nostro consulente?',
            'fallback_action' => 'ask_contact',
            'lead_goal' => 'Quando l\'utente mostra interesse o non trovi la risposta nella knowledge base, invitalo gentilmente a lasciare i suoi contatti (email o telefono) per essere richiamato.',
            'trigger_delay' => 15,
            'trigger_message' => 'Ciao! Hai bisogno di aiuto? Sono qui per rispondere alle tue domande! 💬',
            'widget_position' => 'bottom-right',
            'widget_colors' => json_encode([
                'primary' => '#0066FF',
                'secondary' => '#FFFFFF',
                'text' => '#333333',
                'userBubble' => '#0066FF',
                'botBubble' => '#F0F0F0',
            ]),
            'openai_model' => 'gpt-4o-mini',
            'temperature' => 0.7,
            'max_tokens' => 500,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // ================================================
        // KNOWLEDGE BASE DI ESEMPIO
        // ================================================
        $kbId = DB::table('knowledge_bases')->insertGetId([
            'tenant_id' => $tenantId,
            'title' => 'FAQ Aziendali',
            'type' => 'text',
            'original_content' => $this->getSampleKnowledgeBase(),
            'status' => 'ready',
            'chunks_count' => 5,
            'processed_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Chunks di esempio
        $chunks = [
            'Demo Company Srl è un\'azienda italiana fondata nel 2010, specializzata in soluzioni digitali per le PMI. La sede principale è a Milano, in Via Roma 123.',
            'I nostri orari di apertura sono: Lunedì-Venerdì dalle 9:00 alle 18:00. Sabato e Domenica siamo chiusi. Per urgenze è disponibile il numero +39 02 1234567.',
            'Offriamo tre piani di abbonamento: Starter (€99/mese), Business (€199/mese) e Enterprise (€399/mese). Tutti i piani includono supporto tecnico e aggiornamenti.',
            'Per richiedere assistenza tecnica puoi: 1) Aprire un ticket dal portale clienti, 2) Chiamare il numero verde 800-123-456, 3) Scrivere a supporto@demo.it',
            'Accettiamo pagamenti con carta di credito, bonifico bancario e PayPal. Per i piani annuali è previsto uno sconto del 20%.',
        ];

        foreach ($chunks as $index => $content) {
            DB::table('kb_chunks')->insert([
                'knowledge_base_id' => $kbId,
                'content' => $content,
                'content_hash' => hash('sha256', $content),
                'metadata' => json_encode([
                    'source' => 'FAQ Aziendali',
                    'chunk_index' => $index,
                ]),
                'tokens_count' => str_word_count($content) * 1.3, // Stima approssimativa
                'created_at' => now(),
            ]);
        }

        // Output
        $this->command->info('');
        $this->command->info('========================================');
        $this->command->info('   DATABASE SEEDED SUCCESSFULLY! 🎉');
        $this->command->info('========================================');
        $this->command->info('');
        $this->command->info('ADMIN PS COMPANY:');
        $this->command->info('  Email: admin@pscompany.cloud');
        $this->command->info('  Password: password');
        $this->command->info('');
        $this->command->info('DEMO TENANT:');
        $this->command->info('  Pannello: demo.pscompany.cloud');
        $this->command->info('  User: mario@demo.it / password');
        $this->command->info('  API Key: ' . $apiKey);
        $this->command->info('');
        $this->command->warn('⚠️  Ricorda di cambiare le password in produzione!');
        $this->command->info('');
    }

    private function getDefaultSystemPrompt(string $companyName): string
    {
        return <<<PROMPT
Sei l'assistente virtuale di {$companyName}. 

RUOLO:
- Aiutare i visitatori rispondendo alle loro domande in modo chiaro e professionale
- Usare SEMPRE le informazioni dalla knowledge base quando disponibili
- Se non trovi la risposta, ammettilo onestamente

OBIETTIVO:
- Quando opportuno, invita l'utente a lasciare i contatti per essere richiamato
- Non essere insistente, ma cogli le opportunità giuste

STILE:
- Tono cordiale e professionale
- Usa il "tu" informale
- Risposte concise ma complete
- Rispondi nella lingua dell'utente (default: italiano)

LIMITI:
- Non inventare informazioni non presenti nella knowledge base
- Non fornire consigli legali, medici o finanziari specifici
PROMPT;
    }

    private function getSampleKnowledgeBase(): string
    {
        return <<<KB
# FAQ Demo Company Srl

## Chi siamo
Demo Company Srl è un'azienda italiana fondata nel 2010, specializzata in soluzioni digitali per le PMI. La sede principale è a Milano, in Via Roma 123.

## Orari
I nostri orari di apertura sono: Lunedì-Venerdì dalle 9:00 alle 18:00. Sabato e Domenica siamo chiusi. Per urgenze è disponibile il numero +39 02 1234567.

## Piani e Prezzi
Offriamo tre piani di abbonamento:
- Starter: €99/mese
- Business: €199/mese  
- Enterprise: €399/mese

Tutti i piani includono supporto tecnico e aggiornamenti.

## Assistenza
Per richiedere assistenza tecnica puoi:
1. Aprire un ticket dal portale clienti
2. Chiamare il numero verde 800-123-456
3. Scrivere a supporto@demo.it

## Pagamenti
Accettiamo pagamenti con carta di credito, bonifico bancario e PayPal. Per i piani annuali è previsto uno sconto del 20%.
KB;
    }
}
