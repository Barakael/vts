<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LatraBufferItem extends Model
{
    public const UPDATED_AT = null;

    protected $table = 'latra_buffer';

    /**
     * @var array<int, string>
     */
    protected $fillable = [
        'device_id',
        'payload_item',
        'is_ghost',
    ];

    /**
     * @var array<string, string>
     */
    protected $casts = [
        'payload_item' => 'array',
        'is_ghost' => 'boolean',
    ];

    public function device(): BelongsTo
    {
        return $this->belongsTo(Device::class);
    }
}
