<?php

namespace App\Traits;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;

trait DateScopes
{
    public function scopeWhereToday(Builder $query, $column = 'created_at')
    {
        return $query->whereDate($column, Carbon::today());
    }

    public function scopeWhereYesterday(Builder $query, $column = 'created_at')
    {
        return $query->whereDate($column, Carbon::yesterday());
    }

    public function scopeWhereThisMonth(Builder $query, $column = 'created_at')
    {
        return $query->whereMonth($column, Carbon::now()->month)
                     ->whereYear($column, Carbon::now()->year);
    }

    public function scopeWhereDateRange(Builder $query, $start, $end, $column = 'created_at')
    {
        return $query->whereBetween($column, [$start, $end]);
    }
}
