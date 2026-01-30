<?php

namespace App\Services\Teltonika;

use Carbon\CarbonImmutable;
use RuntimeException;

class TeltonikaDecoder
{
    /**
     * Decode the provided Teltonika AVL data block into domain records.
     *
     * @param string $dataBlock Raw bytes that start with codec id and end with record count.
     * @return TeltonikaRecord[]
     */
    public function decode(string $dataBlock): array
    {
        $length = strlen($dataBlock);
        if ($length < 12) {
            return [];
        }

        $cursor = 0;
        $codecId = ord($dataBlock[$cursor++]);
        $supportedCodecs = [0x08, 0x0C, 0x10, 0x12, 0x8E];
        if (! in_array($codecId, $supportedCodecs, true)) {
            throw new RuntimeException('Unsupported Teltonika codec: '.$codecId);
        }

        $recordsDeclared = ord($dataBlock[$cursor++]);
        $records = [];
        $ioFieldSizes = [1, 2, 4, 8];

        for ($i = 0; $i < $recordsDeclared; $i++) {
            if ($cursor >= $length) {
                break;
            }

            $recordStart = $cursor;
            $timestamp = $this->readTimestamp($dataBlock, $cursor);
            $cursor += 8;

            $priority = ord($dataBlock[$cursor++]);

            $longitude = $this->readSignedInt32($dataBlock, $cursor) / 10000000;
            $cursor += 4;

            $latitude = $this->readSignedInt32($dataBlock, $cursor) / 10000000;
            $cursor += 4;

            $altitude = $this->readSignedInt16($dataBlock, $cursor);
            $cursor += 2;

            $angle = $this->readUnsignedInt16($dataBlock, $cursor);
            $cursor += 2;

            $satellites = ord($dataBlock[$cursor++]);

            $speed = $this->readUnsignedInt16($dataBlock, $cursor);
            $cursor += 2;

            $eventId = ord($dataBlock[$cursor++]);
            $totalIo = ord($dataBlock[$cursor++]);

            $ioValues = [];
            foreach ($ioFieldSizes as $ioSize) {
                if ($cursor >= $length) {
                    break;
                }

                $items = ord($dataBlock[$cursor++]);
                for ($j = 0; $j < $items; $j++) {
                    $this->assertAvailable($dataBlock, $cursor, 1 + $ioSize);
                    $ioId = ord($dataBlock[$cursor++]);
                    $ioValues[$ioId] = $this->readIoValue($dataBlock, $cursor, $ioSize);
                    $cursor += $ioSize;
                }
            }

            if ($codecId === 0x8E) {
                if ($cursor >= $length) {
                    break;
                }

                $variableItems = ord($dataBlock[$cursor++]);
                for ($j = 0; $j < $variableItems; $j++) {
                    $this->assertAvailable($dataBlock, $cursor, 2);
                    $ioId = ord($dataBlock[$cursor++]);
                    $valueLength = ord($dataBlock[$cursor++]);
                    $this->assertAvailable($dataBlock, $cursor, $valueLength);
                    $valueSegment = substr($dataBlock, $cursor, $valueLength);
                    $cursor += $valueLength;

                    $ioValues[$ioId] = [
                        'length' => $valueLength,
                        'hex' => bin2hex($valueSegment),
                    ];
                }
            }

            $records[] = new TeltonikaRecord(
                recordedAt: $timestamp,
                latitude: $latitude,
                longitude: $longitude,
                altitude: $altitude,
                angle: $angle,
                speed: $speed,
                satellites: $satellites,
                priority: $priority,
                eventId: $eventId,
                io: [
                    'total' => $totalIo,
                    'values' => $ioValues,
                ],
                rawHex: bin2hex(substr($dataBlock, $recordStart, $cursor - $recordStart))
            );
        }

        return $records;
    }

    private function readTimestamp(string $data, int $offset): CarbonImmutable
    {
        $parts = unpack('N2', substr($data, $offset, 8));
        $milliseconds = ($parts[1] << 32) | $parts[2];

        return CarbonImmutable::createFromTimestampMs($milliseconds);
    }

    private function readSignedInt32(string $data, int $offset): int
    {
        $value = unpack('N', substr($data, $offset, 4))[1];
        if ($value & 0x80000000) {
            $value = -((~$value & 0xFFFFFFFF) + 1);
        }

        return $value;
    }

    private function readUnsignedInt16(string $data, int $offset): int
    {
        return unpack('n', substr($data, $offset, 2))[1];
    }

    private function readSignedInt16(string $data, int $offset): int
    {
        $value = unpack('n', substr($data, $offset, 2))[1];
        if ($value & 0x8000) {
            $value = -((~$value & 0xFFFF) + 1);
        }

        return $value;
    }

    private function readIoValue(string $data, int $offset, int $size): int|string
    {
        $segment = substr($data, $offset, $size);
        return match ($size) {
            1 => ord($segment),
            2 => unpack('n', $segment)[1],
            4 => unpack('N', $segment)[1],
            8 => $this->readUnsignedInt64($segment),
            default => bin2hex($segment),
        };
    }

    private function readUnsignedInt64(string $segment): int
    {
        $parts = unpack('N2', $segment);
        return ($parts[1] << 32) | $parts[2];
    }

    private function assertAvailable(string $data, int $cursor, int $length): void
    {
        if (strlen($data) < $cursor + $length) {
            throw new RuntimeException('Malformed Teltonika payload: unexpected end of record');
        }
    }
}
