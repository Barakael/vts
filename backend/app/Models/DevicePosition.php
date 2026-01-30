<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DevicePosition extends Model
{
    use HasFactory;

    /**
     * @var array<int, string>
     */
    protected $fillable = [
        'device_id',
        'recorded_at',
        'latitude',
        'longitude',
        'altitude',
        'speed',
        'angle',
        'satellites',
        'priority',
        'event_id',
        'io',
        'raw_payload',
    ];

    /**
     * @var array<string, string>
     */
    protected $casts = [
        'recorded_at' => 'datetime',
        'latitude' => 'float',
        'longitude' => 'float',
        'io' => 'array',
    ];

    public function device(): BelongsTo
    {
        return $this->belongsTo(Device::class);
    }
}
