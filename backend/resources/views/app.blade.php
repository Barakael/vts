<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title>{{ config('app.name', 'Vehicle Tracking System') }}</title>

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

    <!-- Load built frontend assets -->
    <script type="module" crossorigin src="/frontend/dist/assets/index-{{ Vite::asset('resources/js/app.js') }}"></script>
    <link rel="stylesheet" href="/frontend/dist/assets/index-{{ Vite::asset('resources/css/app.css') }}">
</head>
<body class="antialiased">
    <div id="root"></div>

    <!-- CSRF Token for Laravel Sanctum -->
    <script>
        window.Laravel = {
            csrfToken: "{{ csrf_token() }}"
        };
    </script>
</body>
</html>