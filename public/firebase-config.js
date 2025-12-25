/**
 * Firebase Configuration
 * Project: sendly-2702c
 * 
 * PENTING: Dapatkan apiKey, messagingSenderId, dan appId dari Firebase Console:
 * 1. Buka https://console.firebase.google.com/project/sendly-2702c/settings/general
 * 2. Scroll ke "Your apps" dan klik Web app (atau tambahkan baru)
 * 3. Copy nilai-nilai yang diperlukan
 */

const firebaseConfig = {
    apiKey: "AIzaSyD2x522ieJowJf1qn6OdQ4CBrC-D__reL8",
    authDomain: "sendly-2702c.firebaseapp.com",
    projectId: "sendly-2702c",
    storageBucket: "sendly-2702c.firebasestorage.app",
    messagingSenderId: "302988633506",
    appId: "1:302988633506:web:13fdf9ef42a17e74b67efb",
    measurementId: "G-EYER7C3J7E"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Firebase services
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Base URL untuk API calls - use var so it can be overwritten by PHP
var BASE_URL = 'http://localhost/Website-Platform';

console.log('🔥 Firebase initialized - Project:', firebaseConfig.projectId);
