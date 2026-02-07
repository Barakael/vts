<?php

return [
    'enabled' => (bool) env('LATRA_ENABLED', false),
    'base_url' => env('LATRA_BASE_URL'),
    'endpoint' => env('LATRA_ENDPOINT', '/data-integration/integration/gps'),
    'username' => env('LATRA_USERNAME'),
    'password' => env('LATRA_PASSWORD'),
    'timeout' => (int) env('LATRA_TIMEOUT', 10),
    'max_retries' => (int) env('LATRA_MAX_RETRIES', 3),
    'retry_delay' => (int) env('LATRA_RETRY_DELAY', 500),

    'activity_map' => [
        'default' => 1,
        2 => 2,
        3 => 3,
        8 => 8,
        10 => 10,
        16 => 16,
    ],

    'io_keys' => [
        'hdop' => env('LATRA_IO_HDOP_ID') !== null ? (int) env('LATRA_IO_HDOP_ID') : null,
        'rssi' => env('LATRA_IO_RSSI_ID') !== null ? (int) env('LATRA_IO_RSSI_ID') : null,
        'mcc' => env('LATRA_IO_MCC_ID') !== null ? (int) env('LATRA_IO_MCC_ID') : null,
        'lac' => env('LATRA_IO_LAC_ID') !== null ? (int) env('LATRA_IO_LAC_ID') : null,
        'cell_id' => env('LATRA_IO_CELL_ID') !== null ? (int) env('LATRA_IO_CELL_ID') : null,
    ],
];
