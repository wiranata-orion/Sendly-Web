<?php
/**
 * Firebase Configuration
 * Project: sendly-2702c
 */

// Firebase Web SDK Config (untuk frontend JavaScript)
define('FIREBASE_API_KEY', 'AIzaSyD2x522ieJowJf1qn6OdQ4CBrC-D__reL8'); // Dapatkan dari Firebase Console
define('FIREBASE_AUTH_DOMAIN', 'sendly-2702c.firebaseapp.com');
define('FIREBASE_PROJECT_ID', 'sendly-2702c');
define('FIREBASE_STORAGE_BUCKET', 'sendly-2702c.firebasestorage.app');
define('FIREBASE_MESSAGING_SENDER_ID', '302988633506'); // Dapatkan dari Firebase Console
define('FIREBASE_APP_ID', '1:302988633506:web:13fdf9ef42a17e74b67efb'); // Dapatkan dari Firebase Console

// Firebase Admin SDK (untuk backend PHP)
define('FIREBASE_SERVICE_ACCOUNT', __DIR__ . '/firebase-service-account.json');

// Base URL aplikasi
define('BASE_URL', 'http://localhost/Website-Platform');

// Upload directory
define('UPLOAD_DIR', __DIR__ . '/../uploads/');
