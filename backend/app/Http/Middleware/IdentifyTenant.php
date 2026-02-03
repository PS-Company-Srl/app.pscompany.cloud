<?php

namespace App\Http\Middleware;

use App\Models\Tenant;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class IdentifyTenant
{
    /**
     * Identifica il tenant dal subdomain della request.
     *
     * Esempio: acme.pscompany.cloud -> tenant con slug 'acme'
     */
    public function handle(Request $request, Closure $next): Response
    {
        $host = $request->getHost();
        $adminDomain = config('app.admin_domain', 'app.pscompany.cloud');

        // Se siamo sul dominio admin, non cercare tenant
        if ($host === $adminDomain || str_starts_with($host, 'app.')) {
            return $next($request);
        }

        // Estrai lo slug dal subdomain
        // Es: demo.pscompany.cloud -> demo
        // Es: demo.pscompany.cloud.test -> demo (per sviluppo locale)
        $slug = $this->extractSlug($host);

        if (!$slug) {
            abort(404, 'Tenant non trovato');
        }

        // Cerca il tenant
        $tenant = Tenant::where('slug', $slug)->first();

        if (!$tenant) {
            abort(404, 'Tenant non trovato');
        }

        // Verifica che il tenant sia attivo
        if (!in_array($tenant->status, ['active', 'trial'])) {
            abort(403, 'Account sospeso. Contatta il supporto.');
        }

        // Se il trial è scaduto
        if ($tenant->isTrialExpired()) {
            abort(403, 'Il periodo di prova è terminato. Contatta il supporto per attivare l\'abbonamento.');
        }

        // Registra il tenant nel container
        app()->instance('current_tenant', $tenant);

        // Aggiungi il tenant alla request per comodità
        $request->attributes->set('tenant', $tenant);

        return $next($request);
    }

    /**
     * Estrae lo slug dal nome host.
     */
    protected function extractSlug(string $host): ?string
    {
        // Rimuovi eventuali suffissi di sviluppo (.test, .local, etc.)
        $host = preg_replace('/\.(test|local|localhost)$/', '', $host);

        // Pattern: {slug}.pscompany.cloud
        if (preg_match('/^([a-z0-9-]+)\.pscompany\.cloud/', $host, $matches)) {
            $slug = $matches[1];

            // Escludi i subdomain riservati
            $reserved = ['app', 'api', 'cdn', 'n8n', 'www', 'mail', 'admin'];
            if (in_array($slug, $reserved)) {
                return null;
            }

            return $slug;
        }

        // Per sviluppo locale: {slug}.chatbot.test o {slug}.pscompany.test
        if (preg_match('/^([a-z0-9-]+)\.(chatbot|pscompany)/', $host, $matches)) {
            $slug = $matches[1];

            $reserved = ['app', 'api', 'cdn', 'n8n', 'www', 'mail', 'admin'];
            if (in_array($slug, $reserved)) {
                return null;
            }

            return $slug;
        }

        return null;
    }
}
