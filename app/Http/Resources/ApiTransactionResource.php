<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ApiTransactionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array|\Illuminate\Contracts\Support\Arrayable|\JsonSerializable
     */
    public function toArray($request)
    {
        $metadata = $this->metadata ?? [];
        $networkId = $metadata['network_id'] ?? ($this->provider_id ?? null);
        $networkName = $metadata['network'] ?? ($this->provider_name ?? 'N/A');

        return [
            'id' => $this->id,
            'ident' => $this->reference_id ?? $this->reference,
            'reference' => $this->reference_id ?? $this->reference,
            'network' => $networkId,
            'plan_network' => $networkName,
            'amount' => number_format((float) ($this->amount ?? 0), 2),
            'api_response' => $this->api_response ?? 'Transaction processed successfully',
            'description' => $this->description ?? 'N/A',
            'status' => strtolower((string) $this->status) === 'success' ? 'successful' : strtolower((string) $this->status),
            'Status' => strtolower((string) $this->status) === 'success' ? 'successful' : $this->status,
            'balance_before' => number_format((float) ($this->balance_before ?? 0), 2),
            'balance_after' => number_format((float) ($this->balance_after ?? 0), 2),
            'create_date' => $this->created_at ? $this->created_at->format('d/m/Y h:i A') : '',
            'date' => $this->created_at ? $this->created_at->format('d/m/Y h:i A') : '',
            'token' => $metadata['token'] ?? null,
            'pins' => $metadata['pins'] ?? null,
        ];
    }
}
