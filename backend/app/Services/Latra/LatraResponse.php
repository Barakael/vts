<?php

namespace App\Services\Latra;

class LatraResponse
{
    public function __construct(
        private readonly bool $successful,
        private readonly array $body,
        private readonly int $statusCode
    ) {
    }

    public function successful(): bool
    {
        return $this->successful;
    }

    public function statusCode(): int
    {
        return $this->statusCode;
    }

    public function status(): ?string
    {
        $status = $this->body['status'] ?? null;
        return is_scalar($status) ? (string) $status : null;
    }

    public function message(): ?string
    {
        $message = $this->body['message'] ?? $this->body['Message'] ?? null;
        return is_scalar($message) ? (string) $message : null;
    }

    public function body(): array
    {
        return $this->body;
    }
}
