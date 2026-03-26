<?php

namespace App\Jobs;

use App\Models\Company;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class FetchCompanyWebsiteContent implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 2;
    public int $timeout = 300;

    private const MAX_PAGES = 200;
    private const MAX_CHARS_TOTAL = 500000;
    private const USER_AGENT = 'Mozilla/5.0 (compatible; CompanyChatbot/1.0)';

    public function __construct(
        public Company $company
    ) {}

    public function handle(): void
    {
        $url = $this->company->website;
        if (empty($url) || ! $this->isValidUrl($url)) {
            $this->company->update(['website_extracted_text' => null]);
            return;
        }

        $baseHost = parse_url($url, PHP_URL_HOST);
        $baseUrl = $this->normalizeUrl($url);
        $toVisit = $this->discoverUrlsViaSitemap($baseUrl, $baseHost);
        if ($this->hasBertoliConfigurationEnabled()) {
            $toVisit = $this->prependMandatoryKnowledgeUrls($toVisit, $baseHost, $baseUrl);
        }
        if (empty($toVisit)) {
            $toVisit = [$baseUrl];
        } elseif (! in_array($baseUrl, $toVisit, true)) {
            array_unshift($toVisit, $baseUrl);
        }
        $toVisit = $this->prioritizeStrategicUrls(array_values(array_unique($toVisit)));
        $toVisit = array_slice($toVisit, 0, self::MAX_PAGES);

        $visited = [];
        $allText = [];

        while (! empty($toVisit) && count($visited) < self::MAX_PAGES) {
            $current = array_shift($toVisit);
            if (isset($visited[$current])) {
                continue;
            }
            $visited[$current] = true;

            try {
                $response = Http::withHeaders(['User-Agent' => self::USER_AGENT])
                    ->timeout(15)
                    ->get($current);

                if (! $response->successful()) {
                    continue;
                }

                $body = $response->body();
                $contentType = strtolower($response->header('Content-Type', ''));
                if (str_contains($contentType, 'xml') && $this->isSitemapXml($body)) {
                    continue;
                }

                $text = $this->extractTextFromHtml($body);
                if ($text !== '') {
                    $allText[] = $text;
                }

                if (count($visited) < self::MAX_PAGES && ! str_contains($contentType, 'xml')) {
                    $links = $this->extractSameDomainLinks($body, $current, $baseHost);
                    foreach ($links as $link) {
                        $norm = $this->normalizeUrl($link);
                        if (! isset($visited[$norm]) && ! in_array($norm, $toVisit, true)) {
                            $toVisit[] = $norm;
                        }
                    }
                }
            } catch (\Throwable $e) {
                Log::warning('FetchCompanyWebsiteContent fetch failed', [
                    'company_id' => $this->company->id,
                    'url' => $current,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        $combined = implode("\n\n---\n\n", $allText);
        $combined = preg_replace('/\s+/', ' ', $combined);
        $combined = trim($combined);
        if (mb_strlen($combined) > self::MAX_CHARS_TOTAL) {
            $combined = mb_substr($combined, 0, self::MAX_CHARS_TOTAL);
        }

        $this->company->update(['website_extracted_text' => $combined ?: null]);
    }

    /**
     * Scopre URL da sitemap.xml e/o robots.txt (Sitemap:). Supporta sitemap index e urlset.
     */
    private function discoverUrlsViaSitemap(string $baseUrl, string $baseHost): array
    {
        $urls = [];
        $scheme = parse_url($baseUrl, PHP_URL_SCHEME) ?: 'https';
        $origin = $scheme . '://' . $baseHost;

        $sitemapCandidates = [
            $origin . '/sitemap.xml',
            $origin . '/sitemap_index.xml',
            $origin . '/sitemap-index.xml',
            $origin . '/sitemap_index.xml.gz',
            $origin . '/sitemap.xml.gz',
        ];

        $robotsUrl = $origin . '/robots.txt';
        try {
            $robots = Http::withHeaders(['User-Agent' => self::USER_AGENT])->timeout(10)->get($robotsUrl);
            if ($robots->successful() && preg_match_all('/^Sitemap:\s*(\S+)/mi', $robots->body(), $m)) {
                foreach ($m[1] as $sitemap) {
                    $sitemapCandidates[] = trim($sitemap);
                }
            }
        } catch (\Throwable $e) {
            // ignore
        }

        $fetched = [];
        foreach ($sitemapCandidates as $sitemapUrl) {
            if (isset($fetched[$sitemapUrl])) {
                continue;
            }
            $list = $this->fetchUrlsFromSitemap($sitemapUrl, $baseHost, $fetched);
            $urls = array_merge($urls, $list);
            $fetched[$sitemapUrl] = true;
        }

        return array_values(array_unique(array_slice($urls, 0, self::MAX_PAGES)));
    }

    private function fetchUrlsFromSitemap(string $sitemapUrl, string $baseHost, array &$fetched): array
    {
        $urls = [];
        try {
            $response = Http::withHeaders(['User-Agent' => self::USER_AGENT])->timeout(15)->get($sitemapUrl);
            if (! $response->successful()) {
                return [];
            }
            $body = $response->body();
            if (str_ends_with(strtolower($sitemapUrl), '.gz')) {
                $body = @gzdecode($body);
                if ($body === false) {
                    return [];
                }
            }
            $xml = @simplexml_load_string($body);
            if ($xml === false) {
                return [];
            }
            $xml->registerXPathNamespace('sm', 'http://www.sitemaps.org/schemas/sitemap/0.9');
            $xml->registerXPathNamespace('x', 'http://www.sitemaps.org/schemas/sitemap/0.9');

            $locList = $xml->xpath('//sm:url/sm:loc') ?: $xml->xpath('//url/loc') ?: $xml->xpath('//loc');
            if ($locList !== false && count($locList) > 0) {
                foreach ($locList as $loc) {
                    $href = (string) $loc;
                    $host = parse_url($href, PHP_URL_HOST);
                    if ($host === $baseHost) {
                        $urls[] = $this->normalizeUrl($href);
                    }
                }
                return $urls;
            }

            $sitemapList = $xml->xpath('//sm:sitemap/sm:loc') ?: $xml->xpath('//sitemap/loc');
            if ($sitemapList !== false && count($sitemapList) > 0) {
                foreach ($sitemapList as $loc) {
                    $childUrl = (string) $loc;
                    if (! isset($fetched[$childUrl])) {
                        $fetched[$childUrl] = true;
                        foreach ($this->fetchUrlsFromSitemap($childUrl, $baseHost, $fetched) as $u) {
                            $urls[] = $u;
                        }
                    }
                }
            }
        } catch (\Throwable $e) {
            Log::debug('FetchCompanyWebsiteContent sitemap failed', ['url' => $sitemapUrl, 'error' => $e->getMessage()]);
        }
        return $urls;
    }

    private function isSitemapXml(string $body): bool
    {
        return str_contains($body, '<sitemap') || str_contains($body, '<urlset') || str_contains($body, '<sitemapindex');
    }

    private function isValidUrl(string $url): bool
    {
        return (bool) filter_var($url, FILTER_VALIDATE_URL);
    }

    private function normalizeUrl(string $url): string
    {
        $parts = parse_url($url);
        $scheme = $parts['scheme'] ?? 'https';
        $host = $parts['host'] ?? '';
        $path = $parts['path'] ?? '/';
        $path = '/' . trim($path, '/');
        return $scheme . '://' . $host . $path;
    }

    private function extractTextFromHtml(string $html): string
    {
        $html = preg_replace('/<script\b[^>]*>.*?<\/script>/is', '', $html);
        $html = preg_replace('/<style\b[^>]*>.*?<\/style>/is', '', $html);
        $html = preg_replace('/<nav\b[^>]*>.*?<\/nav>/is', '', $html);
        $html = preg_replace('/<footer\b[^>]*>.*?<\/footer>/is', '', $html);
        $html = preg_replace('/<header\b[^>]*>.*?<\/header>/is', '', $html);
        $text = strip_tags($html);
        $text = html_entity_decode($text, ENT_QUOTES | ENT_HTML5, 'UTF-8');
        $text = preg_replace('/\s+/', ' ', $text);
        return trim($text);
    }

    private function extractSameDomainLinks(string $html, string $currentPage, string $baseHost): array
    {
        $links = [];
        if (preg_match_all('/<a\s[^>]*href\s*=\s*["\']([^"\']+)["\']/i', $html, $m)) {
            foreach ($m[1] as $href) {
                $href = trim($href);
                if ($href === '' || str_starts_with($href, '#') || str_starts_with($href, 'mailto:') || str_starts_with($href, 'tel:')) {
                    continue;
                }
                $absolute = $this->resolveUrl($currentPage, $href);
                $host = parse_url($absolute, PHP_URL_HOST);
                if ($host === $baseHost) {
                    $links[] = $absolute;
                }
            }
        }
        return array_slice(array_unique($links), 0, 30);
    }

    private function resolveUrl(string $base, string $href): string
    {
        if (preg_match('#^https?://#i', $href)) {
            return $href;
        }
        $baseParts = parse_url($base);
        $baseUrl = ($baseParts['scheme'] ?? 'https') . '://' . ($baseParts['host'] ?? '');
        if (str_starts_with($href, '/')) {
            return $baseUrl . $href;
        }
        $basePath = $baseParts['path'] ?? '/';
        $basePath = preg_replace('#/[^/]*$#', '/', $basePath);
        return $baseUrl . $basePath . $href;
    }

    /**
     * URL obbligatorie da includere sempre nella knowledge.
     */
    private function prependMandatoryKnowledgeUrls(array $urls, string $baseHost, string $baseUrl): array
    {
        $scheme = parse_url($baseUrl, PHP_URL_SCHEME) ?: 'https';
        $origin = $scheme . '://' . $baseHost;

        $mandatory = [
            $origin . '/occasioni/',
        ];

        $normalized = [];
        foreach ($mandatory as $m) {
            $normalized[] = $this->normalizeUrl($m);
        }

        $existing = array_map(fn (string $u): string => $this->normalizeUrl($u), $urls);
        $merged = array_values(array_unique(array_merge($normalized, $existing)));

        return $merged;
    }

    private function hasBertoliConfigurationEnabled(): bool
    {
        return $this->company->chatbots()
            ->where('bertoli_configuration_enabled', true)
            ->exists();
    }

    /**
     * Porta in alto le pagine chiave (es. occasioni) prima del crawl.
     */
    private function prioritizeStrategicUrls(array $urls): array
    {
        usort($urls, function (string $a, string $b): int {
            $scoreA = $this->urlPriorityScore($a);
            $scoreB = $this->urlPriorityScore($b);

            if ($scoreA === $scoreB) {
                return strcmp($a, $b);
            }

            return $scoreB <=> $scoreA;
        });

        return $urls;
    }

    private function urlPriorityScore(string $url): int
    {
        $u = mb_strtolower($url);
        $score = 0;

        if (str_contains($u, '/occasioni')) {
            $score += 100;
        }
        if (str_contains($u, 'pronta-consegna') || str_contains($u, 'pronta_consegna')) {
            $score += 80;
        }
        if (str_contains($u, '/divani') || str_contains($u, '/tavoli') || str_contains($u, '/cucina')) {
            $score += 40;
        }

        return $score;
    }
}
