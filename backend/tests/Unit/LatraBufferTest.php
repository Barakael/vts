<?php

namespace Tests\Unit;

use App\Models\Device;
use App\Models\LatraBufferItem;
use App\Services\Latra\LatraBuffer;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LatraBufferTest extends TestCase
{
    use RefreshDatabase;

    private LatraBuffer $buffer;

    protected function setUp(): void
    {
        parent::setUp();
        $this->buffer = new LatraBuffer();
    }

    // ── push ──────────────────────────────────────────────────────────────────

    public function test_push_stores_item_in_database(): void
    {
        $device = Device::factory()->create();

        $this->buffer->push($device->id, ['latitude' => -6.8, 'longitude' => 39.2]);

        $this->assertDatabaseCount('latra_buffer', 1);
        $this->assertDatabaseHas('latra_buffer', ['device_id' => $device->id, 'is_ghost' => false]);
    }

    public function test_push_ghost_flag_is_stored(): void
    {
        $device = Device::factory()->create();

        $this->buffer->push($device->id, ['latitude' => -6.8, 'longitude' => 39.2], isGhost: true);

        $this->assertDatabaseHas('latra_buffer', ['device_id' => $device->id, 'is_ghost' => true]);
    }

    // ── flushableCount ────────────────────────────────────────────────────────

    public function test_fewer_than_3_items_gives_flushable_count_of_0(): void
    {
        $device = Device::factory()->create();

        $this->seedItems($device->id, 2);

        $this->assertSame(0, $this->buffer->flushableCount($device->id));
    }

    public function test_exactly_3_items_gives_flushable_count_of_3(): void
    {
        $device = Device::factory()->create();

        $this->seedItems($device->id, 3);

        $this->assertSame(3, $this->buffer->flushableCount($device->id));
    }

    public function test_7_items_gives_flushable_count_of_6(): void
    {
        $device = Device::factory()->create();

        $this->seedItems($device->id, 7);

        $this->assertSame(6, $this->buffer->flushableCount($device->id));
    }

    public function test_flushable_count_is_scoped_per_device(): void
    {
        $d1 = Device::factory()->create();
        $d2 = Device::factory()->create();

        $this->seedItems($d1->id, 3);
        $this->seedItems($d2->id, 1);

        $this->assertSame(3, $this->buffer->flushableCount($d1->id));
        $this->assertSame(0, $this->buffer->flushableCount($d2->id));
    }

    // ── extractBatch ──────────────────────────────────────────────────────────

    public function test_extract_returns_empty_when_fewer_than_3_items(): void
    {
        $device = Device::factory()->create();

        $this->seedItems($device->id, 2);

        $batch = $this->buffer->extractBatch($device->id);

        $this->assertTrue($batch->isEmpty());
        $this->assertDatabaseCount('latra_buffer', 2); // items untouched
    }

    public function test_extract_returns_3_items_and_removes_them(): void
    {
        $device = Device::factory()->create();

        $this->seedItems($device->id, 3);

        $batch = $this->buffer->extractBatch($device->id);

        $this->assertCount(3, $batch);
        $this->assertDatabaseCount('latra_buffer', 0);
    }

    public function test_extract_returns_6_oldest_items_from_7(): void
    {
        $device = Device::factory()->create();

        $this->seedItems($device->id, 7);

        $batch = $this->buffer->extractBatch($device->id);

        $this->assertCount(6, $batch);
        $this->assertDatabaseCount('latra_buffer', 1); // one remains
    }

    public function test_extract_is_scoped_to_device(): void
    {
        $d1 = Device::factory()->create();
        $d2 = Device::factory()->create();

        $this->seedItems($d1->id, 3);
        $this->seedItems($d2->id, 3);

        $batch = $this->buffer->extractBatch($d1->id);

        $this->assertCount(3, $batch);
        $this->assertDatabaseCount('latra_buffer', 3); // d2 rows remain
    }

    public function test_extracted_items_contain_payload(): void
    {
        $device = Device::factory()->create();

        $this->buffer->push($device->id, ['latitude' => -6.8, 'mgs_id' => 42]);
        $this->buffer->push($device->id, ['latitude' => -6.9, 'mgs_id' => 43]);
        $this->buffer->push($device->id, ['latitude' => -7.0, 'mgs_id' => 44]);

        $batch = $this->buffer->extractBatch($device->id);

        $mgsIds = $batch->map(fn ($row) => $row->payload_item['mgs_id'])->sort()->values()->all();
        $this->assertSame([42, 43, 44], $mgsIds);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private function seedItems(int $deviceId, int $count): void
    {
        for ($i = 0; $i < $count; $i++) {
            LatraBufferItem::create([
                'device_id'    => $deviceId,
                'payload_item' => ['seq' => $i],
                'is_ghost'     => false,
            ]);
        }
    }
}
