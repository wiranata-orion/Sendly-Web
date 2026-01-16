<?php
/**
 * Firebase Configuration
 * Project: sendly-2702c
 */

// Firebase Web SDK Config (untuk frontend JavaScript)
define('FIREBASE_API_KEY', ''); // Dapatkan dari Firebase Console
define('FIREBASE_AUTH_DOMAIN', '');
define('FIREBASE_PROJECT_ID', 's');
define('FIREBASE_STORAGE_BUCKET', '');
define('FIREBASE_MESSAGING_SENDER_ID', ''); // Dapatkan dari Firebase Console
define('FIREBASE_APP_ID', ''); // Dapatkan dari Firebase Console

// Firebase Admin SDK (untuk backend PHP)
define('FIREBASE_SERVICE_ACCOUNT', __DIR__ . '/firebase-service-account.json');

// Base URL aplikasi
define('BASE_URL', 'http://localhost/Website-Platform');

// Upload directory
define('UPLOAD_DIR', __DIR__ . '/../uploads/');
