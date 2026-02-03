<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Traits\BelongsToTenant;

class ApiUsage extends Model
{
    use BelongsToTenant;

    protected $table = 'api_usage';

    protected $fillable = [
        'tenant_id',
        'date',
        'messages_count',
        'tokens_input',
        'tokens_output',
        'estimated_cost_cents',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'messages_count' => 'integer',
            'tokens_input' => 'integer',
            'tokens_output' => 'integer',
            'estimated_cost_cents' => 'integer',
        ];
    }

    // ================================================
    // RELATIONSHIPS
    // ================================================

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    // ================================================
    // ACCESSORS
    // ================================================

    public function getTotalTokensAttribute(): int
    {
        return $this->tokens_input + $this->tokens_output;
    }

    public function getEstimatedCostAttribute(): float
    {
        return $this->estimated_cost_cents / 100;
    }

    // ================================================
    // STATIC HELPERS
    // ================================================

    public static function recordUsage(
        int $tenantId, 
        int $inputTokens, 
        int $outputTokens, 
        ?string $model = 'gpt-4o-mini'
    ): self {
        $today = now()->toDateString();
        
        $usage = self::firstOrCreate(
            ['tenant_id' => $tenantId, 'date' => $today],
            ['messages_count' => 0, 'tokens_input' => 0, 'tokens_output' => 0, 'estimated_cost_cents' => 0]
        );

        // Calcola costo stimato (prezzi approssimativi per GPT-4o-mini)
        $costPerInputToken = 0.00000015; // $0.15 per 1M tokens
        $costPerOutputToken = 0.0000006; // $0.60 per 1M tokens
        
        if (str_contains($model, 'gpt-4o') && !str_contains($model, 'mini')) {
            $costPerInputToken = 0.0000025; // $2.50 per 1M tokens
            $costPerOutputToken = 0.00001; // $10 per 1M tokens
        }

        $additionalCost = ($inputTokens * $costPerInputToken) + ($outputTokens * $costPerOutputToken);
        $additionalCostCents = (int) round($additionalCost * 100);

        $usage->increment('messages_count');
        $usage->increment('tokens_input', $inputTokens);
        $usage->increment('tokens_output', $outputTokens);
        $usage->increment('estimated_cost_cents', $additionalCostCents);

        return $usage;
    }

    public static function getMonthlyStats(int $tenantId, ?int $year = null, ?int $month = null): array
    {
        $year = $year ?? now()->year;
        $month = $month ?? now()->month;

        $stats = self::where('tenant_id', $tenantId)
            ->whereYear('date', $year)
            ->whereMonth('date', $month)
            ->selectRaw('
                SUM(messages_count) as total_messages,
                SUM(tokens_input) as total_tokens_input,
                SUM(tokens_output) as total_tokens_output,
                SUM(estimated_cost_cents) as total_cost_cents
            ')
            ->first();

        return [
            'messages' => $stats->total_messages ?? 0,
            'tokens_input' => $stats->total_tokens_input ?? 0,
            'tokens_output' => $stats->total_tokens_output ?? 0,
            'total_tokens' => ($stats->total_tokens_input ?? 0) + ($stats->total_tokens_output ?? 0),
            'estimated_cost' => ($stats->total_cost_cents ?? 0) / 100,
        ];
    }
}
