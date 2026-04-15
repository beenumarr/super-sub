<?php

namespace App\Http\Resources;

use App\Models\Transaction;
use Illuminate\Http\Resources\Json\JsonResource;

class TransactionDetailResource extends JsonResource
{
    public $withTransactionable = false;
    public $transaction;

    public function __construct(Transaction $transaction, $withTransactionable) {
        $this->withTransactionable = $withTransactionable;
        $this->transaction = $transaction;
    }
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array|\Illuminate\Contracts\Support\Arrayable|\JsonSerializable
     */
    public function toArray($request)
    {
        $metadata = $this->transaction->metadata ?? [];

        return [
            'id' => $this->transaction->id,
            'user_id' => $this->transaction->user_id,
            // 'user' => $this->transaction->user->only('id','name','phone'),
            'reference_id' => $this->transaction->reference_id,
            'amount' => number_format((int)$this->transaction->amount, 2),
            'api_response' => $this->transaction->api_response,
            'description' => $this->transaction->description,
            'status' => $this->transaction->status,
            'type' => $this->transaction->type,
            'provider_name' => $this->transaction->provider_name,
            'provider_reference' => $this->transaction->provider_reference,
            'token' => $metadata['token'] ?? '',
            'balance_before' => number_format((int)$this->transaction->balance_before, 2),
            'balance_after' => number_format((int)$this->transaction->balance_after, 2),
            'metadata' => $this->when($this->withTransactionable, fn () => $metadata),
            'date' => $this->transaction->created_at->format('d/m/Y h:m A'),
            'pins' => $this->when(isset($metadata['pins']), fn () => $metadata['pins']),
        ];
    }
}
