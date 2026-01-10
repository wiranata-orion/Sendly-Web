<?php
/**
 * Redirect Page - untuk bypass InfinityFree 403
 */
session_start();

// Cek apakah user sudah login
if (!isset($_SESSION['user_id'])) {
    header('Location: ./');
    exit;
}

$baseUrl = '';
$protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
$host = $_SERVER['HTTP_HOST'] ?? 'localhost';

if (strpos($host, 'localhost') !== false) {
    $baseUrl = $protocol . '://' . $host . '/Website-Platform';
} else {
    $baseUrl = $protocol . '://' . $host;
}
?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta http-equiv="refresh" content="1;url=<?= $baseUrl ?>/">
    <title>Redirecting...</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .loader {
            text-align: center;
        }
        .spinner {
            width: 50px;
            height: 50px;
            border: 4px solid rgba(255,255,255,0.3);
            border-top: 4px solid white;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div class="loader">
        <div class="spinner"></div>
        <p>Login berhasil! Mengalihkan...</p>
        <noscript>
            <p><a href="<?= $baseUrl ?>/">Klik di sini jika tidak dialihkan otomatis</a></p>
        </noscript>
    </div>
</body>
</html>
