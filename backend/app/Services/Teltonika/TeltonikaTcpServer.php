<?php

namespace App\Services\Teltonika;

use App\Models\Device;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use RuntimeException;
use Throwable;

class TeltonikaTcpServer
{
    private $server;

    private bool $running = false;

    public function __construct(private readonly TeltonikaDecoder $decoder)
    {
    }

    public function listen(string $host, int $port): void
    {
        $context = stream_context_create([
            'socket' => [
                'so_reuseaddr' => true,
            ],
        ]);

        $endpoint = sprintf('tcp://%s:%d', $host, $port);
        $server = @stream_socket_server($endpoint, $errno, $errstr, STREAM_SERVER_BIND | STREAM_SERVER_LISTEN, $context);

        if (! $server) {
            throw new RuntimeException(sprintf('Unable to bind Teltonika server on %s (%s)', $endpoint, $errstr ?: 'unknown error'));
        }

        $this->server = $server;
        $this->running = true;

        if (function_exists('pcntl_signal')) {
            pcntl_signal(SIGINT, fn () => $this->stop());
            pcntl_signal(SIGTERM, fn () => $this->stop());
        }

        Log::info('Teltonika TCP server is listening', ['endpoint' => $endpoint]);

        while ($this->running) {
            $connection = @stream_socket_accept($server, 1);
            if ($connection === false) {
                if (function_exists('pcntl_signal_dispatch')) {
                    pcntl_signal_dispatch();
                }
                continue;
            }

            try {
                $this->handleConnection($connection);
            } catch (Throwable $exception) {
                Log::error('Teltonika connection error', [
                    'message' => $exception->getMessage(),
                    'trace' => $exception->getTraceAsString(),
                ]);
            } finally {
                fclose($connection);
            }
        }

        fclose($server);
        $this->server = null;
        Log::info('Teltonika TCP server stopped');
    }

    public function stop(): void
    {
        $this->running = false;
    }

    private function handleConnection($connection): void
    {
        stream_set_timeout($connection, 30);

        $imeiLengthData = $this->readExact($connection, 2);
        if (! $imeiLengthData) {
            throw new RuntimeException('IMEI length was not received');
        }

        $imeiLength = unpack('n', $imeiLengthData)[1];
        $imei = trim($this->readExact($connection, $imeiLength) ?? '');

        if ($imei === '') {
            throw new RuntimeException('IMEI value is empty');
        }

        fwrite($connection, "\x01");

        $device = Device::firstOrCreate(
            ['imei' => $imei],
            ['model' => 'FMB130']
        );

        Log::info('Teltonika device connected', ['imei' => $imei]);

        while ($this->running) {
            $preamble = $this->readExact($connection, 4);
            if ($preamble === null) {
                break;
            }

            if ($preamble !== "\x00\x00\x00\x00") {
                continue;
            }

            $lengthData = $this->readExact($connection, 4);
            if (! $lengthData) {
                break;
            }

            $dataLength = unpack('N', $lengthData)[1];
            $payload = $this->readExact($connection, $dataLength);
            if (! $payload) {
                break;
            }

            // Consume CRC
            $crc = $this->readExact($connection, 4);
            if (! $crc) {
                break;
            }

            $records = $this->decoder->decode($payload);
            $stored = $this->persistRecords($device, $records);

            fwrite($connection, pack('C', $stored));
        }

        Log::info('Teltonika device disconnected', ['imei' => $imei]);
    }

    private function persistRecords(Device $device, array $records): int
    {
        $stored = 0;

        foreach ($records as $record) {
            DB::transaction(function () use ($device, $record, &$stored): void {
                $device->positions()->create([
                    'recorded_at' => $record->recordedAt,
                    'latitude' => $record->latitude,
                    'longitude' => $record->longitude,
                    'altitude' => $record->altitude,
                    'speed' => $record->speed,
                    'angle' => $record->angle,
                    'satellites' => $record->satellites,
                    'priority' => $record->priority,
                    'event_id' => (string) $record->eventId,
                    'io' => $record->io,
                    'raw_payload' => $record->rawHex,
                ]);

                $device->forceFill([
                    'last_seen_at' => now(),
                    'last_fix_at' => $record->recordedAt,
                    'last_latitude' => $record->latitude,
                    'last_longitude' => $record->longitude,
                    'last_speed' => $record->speed,
                    'last_angle' => $record->angle,
                    'last_satellites' => $record->satellites,
                    'last_payload' => $record->io,
                ])->save();

                $stored++;
            });
        }

        if ($stored > 0) {
            Log::info('Teltonika records persisted', [
                'imei' => $device->imei,
                'count' => $stored,
            ]);
        }

        return $stored;
    }

    private function readExact($connection, int $length): ?string
    {
        $buffer = '';
        while (strlen($buffer) < $length) {
            $chunk = fread($connection, $length - strlen($buffer));
            if ($chunk === '' || $chunk === false) {
                if (feof($connection)) {
                    return null;
                }

                $meta = stream_get_meta_data($connection);
                if ($meta['timed_out'] ?? false) {
                    return null;
                }

                usleep(10000);
                continue;
            }

            $buffer .= $chunk;
        }

        return $buffer;
    }
}
