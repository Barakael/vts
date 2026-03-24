<?php

namespace App\Services\Latra;

use App\Models\LatraBufferItem;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

/**
 * Durable, per-device accumulation buffer backed by the `latra_buffer` table.
 *
 * Items are flushed in multiples of 3 (BGate requirement). A DB transaction
 * with row-level locking ensures concurrent queue workers never double-send
 * the same batch for the same device.
 */
class LatraBuffer
{
    /**
     * Persist a single sanitized item (or ghost item) for a device.
     *
     * @param  array<string, mixed> $item
     */
    public function push(int $deviceId, array $item, bool $isGhost = false): void
    {
        LatraBufferItem::create([
            'device_id'    => $deviceId,
            'payload_item' => $item,
            'is_ghost'     => $isGhost,
        ]);
    }

    /**
     * How many items are ready to flush (largest multiple of 3 available).
     */
    public function flushableCount(int $deviceId): int
    {
        $total = LatraBufferItem::where('device_id', $deviceId)->count();

        return (int) (floor($total / 3) * 3);
    }

    /**
     * Atomically extract up to the largest multiple-of-3 batch for a device.
     *
     * Returns an empty Collection when fewer than 3 items are buffered.
     * The returned rows are deleted from the buffer inside the transaction.
     *
     * @return Collection<int, LatraBufferItem>
     */
    public function extractBatch(int $deviceId): Collection
    {
        return DB::transaction(function () use ($deviceId): Collection {
            $n = $this->flushableCount($deviceId);

            if ($n === 0) {
                return collect();
            }

            // Lock the oldest N rows to prevent concurrent workers from
            // picking up the same items.
            $ids = LatraBufferItem::where('device_id', $deviceId)
                ->orderBy('id')
                ->lockForUpdate()
                ->limit($n)
                ->pluck('id');

            $rows = LatraBufferItem::whereIn('id', $ids)->get();
            LatraBufferItem::whereIn('id', $ids)->delete();

            return $rows;
        });
    }
}
