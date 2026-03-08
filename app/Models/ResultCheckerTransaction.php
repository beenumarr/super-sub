<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ResultCheckerTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'exam_type_id',
        'exam_type',
        'quantity',
        'pins'
    ];



    public function transaction()
    {
        return $this->morphOne(Transaction::class, 'transactionable');
    }



    public function examType()
    {
        return $this->belongsTo(ExamType::class, 'exam_type_id');
    }

    public function getDescriptionAttribute()
    {
        // $plan = $this->plan?->package_name ?? "Not Available";

        // return "{$plan} ({$this->transaction->amount}) {$this->network->name} Cable Subscription to {$this->smart_card_number} ({$this->name})";
    }
}
