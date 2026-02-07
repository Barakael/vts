<?php

namespace App\Services\Latra;

use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class LatraClient
{
    private readonly string $baseUrl;

    private readonly string $endpoint;

    private readonly string $username;

    private readonly string $password;

    private readonly int $timeout;

    private readonly int $maxRetries;

    private readonly int $retryDelay;

    public function __construct()
    {
        $this->baseUrl = (string) config('latra.base_url');
        $this->endpoint = (string) config('latra.endpoint');
        $this->username = (string) config('latra.username');
        $this->password = (string) config('latra.password');
        $this->timeout = (int) config('latra.timeout', 10);
        $this->maxRetries = (int) config('latra.max_retries', 3);
        $this->retryDelay = (int) config('latra.retry_delay', 500);

        if ($this->baseUrl === '') {
            throw new RuntimeException('LATRA base URL is not configured.');
        }

        if ($this->username === '' || $this->password === '') {
            throw new RuntimeException('LATRA credentials are not configured.');
        }
    }

    public function sendPayload(array $payload): LatraResponse
    {
        $response = $this->http()->post($this->endpoint, $payload);

        $body = $response->json();
        if (! is_array($body)) {
            $body = ['raw' => $response->body()];
        }

        $status = isset($body['status']) ? (string) $body['status'] : null;
        $successful = $response->successful() && $status === '1';

        return new LatraResponse($successful, $body, $response->status());
    }

    private function http(): PendingRequest
    {
        return Http::baseUrl($this->baseUrl)
            ->timeout($this->timeout)
            ->retry($this->maxRetries, $this->retryDelay)
            ->acceptJson()
            ->asJson()
            ->withBasicAuth($this->username, $this->password);
    }
}
