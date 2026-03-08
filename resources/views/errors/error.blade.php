<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Error {{ $status }}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            background: #1f2937;
            color: #f3f4f6;
            font-family: 'Segoe UI', sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
        }
        .error-box {
            text-align: center;
            max-width: 500px;
        }
        h1 {
            font-size: 5rem;
            color: #f87171;
            margin-bottom: 1rem;
        }
        p {
            font-size: 1.25rem;
            margin-bottom: 1.5rem;
        }
        a {
            color: #60a5fa;
            text-decoration: none;
            font-weight: bold;
        }
        a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="error-box">
        <h1>{{ $status }}</h1>
        <p>
            @switch($status)
                @case(404)
                    Page not found.
                    @break
                @case(403)
                    Access denied.
                    @break
                @case(419)
                    Page expired. Refresh and try again.
                    @break
                @case(500)
                    Server error. Something went wrong.
                    @break
                @default
                    {{ $message ?: 'An unexpected error occurred.' }}
            @endswitch
        </p>
        <a href="{{ url('/') }}">← Back to Homepage</a>
    </div>
</body>
</html>
