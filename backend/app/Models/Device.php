<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Device extends Model
{
    use HasFactory;

    /**
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'imei',
        'model',
        'reg_no',
        'sim_no',
        'last_seen_at',
        'last_fix_at',
        'last_latitude',
        'last_longitude',
        'last_speed',
        'last_angle',
        'last_satellites',
        'last_payload',
        'updated_by',
    ];

    /**
     * @var array<string, string>
     */
    protected $casts = [
        'last_seen_at' => 'datetime',
        'last_fix_at' => 'datetime',
        'last_latitude' => 'float',
        'last_longitude' => 'float',
        'last_payload' => 'array',
    ];

    public function positions(): HasMany
    {
        return $this->hasMany(DevicePosition::class);
    }

    public function latestPosition(): HasOne
    {
        return $this->hasOne(DevicePosition::class)->latestOfMany('recorded_at');
    }

    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
