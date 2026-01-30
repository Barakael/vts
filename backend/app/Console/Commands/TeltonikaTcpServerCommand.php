<?php

namespace App\Console\Commands;

use App\Services\Teltonika\TeltonikaTcpServer;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Throwable;

class TeltonikaTcpServerCommand extends Command
{
    /**
     * @var string
     */
    protected $signature = 'teltonika:listen {--host=} {--port=}';

    /**
     * @var string
     */
    protected $description = 'Start a TCP listener that ingests Teltonika FMB130 messages';

    public function __construct(private readonly TeltonikaTcpServer $server)
    {
        parent::__construct();
    }

    public function handle(): int
    {
        $host = $this->option('host') ?? config('services.teltonika.host', '0.0.0.0');
        $port = (int) ($this->option('port') ?? config('services.teltonika.port', 9000));

        $this->info(sprintf('Listening for Teltonika devices on %s:%d', $host, $port));

        try {
            $this->server->listen($host, $port);
        } catch (Throwable $exception) {
            Log::error('Teltonika listener failed', [
                'message' => $exception->getMessage(),
            ]);

            $this->error('Listener stopped unexpectedly: '.$exception->getMessage());
            return self::FAILURE;
        }

        return self::SUCCESS;
    }
}
