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
    public int $timeout = 120;

    private const MAX_PAGES = 25;
    private const MAX_CHARS_TOTAL = 100000;
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
        $visited = [];
        $toVisit = [$this->normalizeUrl($url)];
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

                $html = $response->body();
                $text = $this->extractTextFromHtml($html);
                if ($text !== '') {
                    $allText[] = $text;
                }

                if (count($visited) < self::MAX_PAGES) {
                    $links = $this->extractSameDomainLinks($html, $current, $baseHost);
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
}
