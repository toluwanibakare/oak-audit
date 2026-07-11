<?php

return [
    'paths' => ['api/*', 'storage/*'],
    'allowed_methods' => ['*'],
    'allowed_origins' => [
        'http://localhost:8000',
        'http://localhost:8080',
        'http://localhost:5173',
        'http://localhost:4173',
        'http://localhost:3000',
        'https://oak-audit.vercel.app',
        'https://oakaudix.app',
    ],
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];
