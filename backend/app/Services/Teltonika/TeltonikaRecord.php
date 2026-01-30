<?php

namespace App\Services\Teltonika;

use Carbon\CarbonImmutable;

class TeltonikaRecord
{
    public function __construct(
        public readonly CarbonImmutable $recordedAt,
        public readonly float $latitude,
        public readonly float $longitude,
        public readonly int $altitude,
        public readonly int $angle,
        public readonly int $speed,
        public readonly int $satellites,
        public readonly int $priority,
        public readonly int $eventId,
        public readonly array $io,
        public readonly string $rawHex
    ) {
    }
}
