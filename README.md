# Sendly - Modern Chat Application

![Sendly Chat](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Firebase](https://img.shields.io/badge/Firebase-Realtime-orange.svg)
![PHP](https://img.shields.io/badge/PHP-8.0+-purple.svg)

Aplikasi chat modern dengan desain glassmorphism yang elegan. Mendukung chat personal dan grup dengan sistem kode unik untuk menambahkan kontak dan bergabung ke grup.

## ✨ Fitur Utama

### 🔐 Sistem Kode Unik
- **User Code**: Setiap pengguna memiliki kode unik 8 karakter
- **Group Code**: Setiap grup memiliki kode unik untuk join
- **Copy Code**: Fitur copy kode dengan satu klik

### 💬 Chat Features
- ✅ Real-time messaging menggunakan Firebase
- ✅ Chat personal (1-on-1)
- ✅ Chat grup dengan multiple members
- ✅ Upload dan kirim file
- ✅ Emoji picker
- ✅ Typing indicator
- ✅ Message status (sent, delivered, read)
- ✅ Date dividers
- ✅ Auto-resize textarea

### 👥 Manajemen Kontak & Grup
- ✅ Tambah kontak via kode unik
- ✅ Buat grup baru
- ✅ Join grup via kode unik
- ✅ Pencarian kontak dan grup
- ✅ List kontak dan grup terpisah

### 🎨 UI/UX Modern
- ✅ Dark theme dengan glassmorphism
- ✅ Gradient colors (Purple-Blue theme)
- ✅ Smooth animations
- ✅ Glow effects
- ✅ Responsive design
- ✅ Custom scrollbar
- ✅ Toast notifications

## 🚀 Setup dan Instalasi

### Prasyarat
- PHP 8.0 atau lebih tinggi
- XAMPP / LAMP / WAMP
- Firebase Account (gratis)
- Browser modern (Chrome, Firefox, Edge)

### Langkah 1: Clone Project
```bash
cd C:\xampp\htdocs
git clone <repository-url> Website-Platform
cd Website-Platform
```

### Langkah 2: Setup Firebase

#### 2.1 Buat Project Firebase
1. Kunjungi [Firebase Console](https://console.firebase.google.com/)
2. Klik "Add project" atau "Tambah project"
3. Masukkan nama project (contoh: "Sendly Chat")
4. Ikuti wizard setup hingga selesai

#### 2.2 Enable Realtime Database
1. Di sidebar, pilih **Build** > **Realtime Database**
2. Klik "Create Database"
3. Pilih lokasi server (contoh: asia-southeast1)
4. Pilih mode **"Start in test mode"** untuk development
5. Klik "Enable"

**⚠️ Penting:** Untuk production, ubah rules menjadi:
```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    },
    "groups": {
      "$groupId": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    },
    "chats": {
      "$chatId": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    }
  }
}
```

#### 2.3 Enable Storage
1. Di sidebar, pilih **Build** > **Storage**
2. Klik "Get Started"
3. Gunakan default rules untuk development
4. Klik "Done"

#### 2.4 Get Configuration Keys
1. Di Project Overview (⚙️ Settings > Project settings)
2. Scroll ke bawah ke "Your apps"
3. Pilih icon Web (</>) untuk membuat Web App
4. Masukkan nama app (contoh: "Sendly Web")
5. **Jangan** centang "Firebase Hosting" (tidak diperlukan)
6. Klik "Register app"
7. Copy semua nilai dari `firebaseConfig`

### Langkah 3: Konfigurasi Aplikasi

#### 3.1 Update Firebase Config (Client-side)
Edit file: `public/firebase-config.js`

```javascript
const firebaseConfig = {
    apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    authDomain: "your-project.firebaseapp.com",
    databaseURL: "https://your-project-default-rtdb.firebaseio.com",
    projectId: "your-project",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef123456"
};
```

#### 3.2 Update Firebase Config (Server-side)
Edit file: `config/firebase.php`

```php
<?php
define('FIREBASE_DATABASE_URL', 'https://your-project-default-rtdb.firebaseio.com');
define('FIREBASE_API_KEY', 'AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');
define('FIREBASE_PROJECT_ID', 'your-project');
define('FIREBASE_STORAGE_BUCKET', 'your-project.appspot.com');
// ... copy semua nilai dari Firebase Console
```

#### 3.3 Update Base URL
Edit file: `config/database.php`

```php
<?php
// Base URL aplikasi Anda
define('BASE_URL', 'http://localhost/Website-Platform/public');
```

### Langkah 4: Jalankan Aplikasi

#### 4.1 Start XAMPP
1. Buka XAMPP Control Panel
2. Start **Apache** (bukan MySQL, karena kita pakai Firebase)

#### 4.2 Akses Aplikasi
Buka browser dan kunjungi:
```
http://localhost/Website-Platform/public
```

## 📖 Cara Menggunakan

### 1️⃣ Mendapatkan Kode User Anda
- Saat pertama kali membuka aplikasi, Anda otomatis mendapat kode unik
- Kode ditampilkan di header sidebar (contoh: `A3F2D8B1`)
- Klik icon copy untuk menyalin kode

### 2️⃣ Menambah Kontak
1. Klik tombol **"Tambah Kontak"** di sidebar
2. Masukkan **kode unik** dari teman yang ingin ditambahkan
3. Klik "Tambah Kontak"
4. Kontak akan muncul di list Anda

### 3️⃣ Membuat Grup
1. Switch ke tab **"Grup"** di sidebar
2. Klik tombol **"Buat Grup"**
3. Tab "Buat Grup" akan aktif
4. Masukkan nama grup dan deskripsi (opsional)
5. Klik "Buat Grup"
6. **Kode grup** akan ditampilkan - bagikan ke member lain!

### 4️⃣ Bergabung ke Grup
1. Switch ke tab **"Grup"** di sidebar
2. Klik tombol **"Buat Grup"** (modal akan terbuka)
3. Klik tab **"Gabung Grup"**
4. Masukkan **kode grup** yang diberikan admin
5. Klik "Gabung Grup"
6. Grup akan muncul di list Anda

### 5️⃣ Mengirim Pesan
1. Pilih kontak atau grup dari list
2. Ketik pesan di input box
3. Tekan Enter atau klik tombol kirim (✈️)
4. Untuk file: klik icon 📎, pilih file, lalu kirim

## 🏗️ Struktur Project

```
Website-Platform/
├── assets/
│   ├── css/
│   │   └── style.css           # Modern dark theme styles
│   └── js/
│       └── app.js              # Main JavaScript logic
├── config/
│   ├── database.php            # Database & app config
│   └── firebase.php            # Firebase server config
├── controllers/
│   ├── ChatController.php      # Main chat controller
│   ├── ContactController.php   # Contact management
│   └── GroupController.php     # Group management
├── models/
│   ├── UserModel.php          # User operations + unique codes
│   ├── ContactModel.php       # Contact operations
│   ├── GroupModel.php         # Group operations + join
│   └── MessageModel.php       # Message operations
├── public/
│   ├── index.php              # Main entry point + routing
│   └── firebase-config.js     # Client-side Firebase config
├── views/
│   └── chat/
│       └── index.php          # Main chat interface
└── README.md                  # This file
```

## 🔧 API Endpoints

### Contacts
- `GET /api/contacts` - Get all contacts
- `POST /api/contacts/add-by-code` - Add contact by user code
- `GET /api/contacts/search?q=query` - Search contacts

### Groups
- `GET /api/groups` - Get all groups
- `POST /api/groups/add` - Create new group
- `POST /api/groups/join` - Join group by code

### Messages (via Firebase)
- Real-time messaging handled by Firebase Realtime Database
- File uploads handled by Firebase Storage

## 🎨 Kustomisasi Theme

Edit `assets/css/style.css` untuk mengubah warna theme:

```css
:root {
    --primary-color: #6366f1;      /* Main theme color */
    --primary-gradient: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%);
    --secondary-color: #10b981;    /* Success color */
    --bg-primary: #0f0f23;         /* Main background */
    --bg-secondary: #1a1a2e;       /* Secondary background */
    /* ... more variables */
}
```

## 🐛 Troubleshooting

### Error: "Firebase is not defined"
**Solusi**: Pastikan Firebase SDK sudah di-load sebelum `firebase-config.js`
```html
<!-- Order penting! -->
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-database-compat.js"></script>
<script src="/public/firebase-config.js"></script>
<script src="/assets/js/app.js"></script>
```

### Error: "Permission denied"
**Solusi**: Periksa Firebase Realtime Database Rules. Untuk development:
```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

### Kontak/Grup tidak muncul
**Solusi**: 
1. Buka Developer Tools (F12) > Console
2. Cek error message
3. Pastikan Firebase config sudah benar
4. Periksa network tab untuk melihat API calls

### CSS tidak muncul
**Solusi**:
1. Periksa path CSS: `/assets/css/style.css` atau `assets/css/style.css`
2. Pastikan BASE_URL sudah benar di `config/database.php`
3. Clear browser cache (Ctrl + Shift + R)

## 📱 Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Edge 90+
- ✅ Safari 14+
- ✅ Opera 76+

## 🔒 Security Notes

⚠️ **Aplikasi ini untuk development/demo**. Untuk production:

1. **Aktifkan Authentication**
   ```javascript
   // Tambahkan Firebase Auth
   firebase.auth().signInWithEmailAndPassword(email, password)
   ```

2. **Update Database Rules**
   - Batasi read/write berdasarkan auth.uid
   - Validasi data di server-side

3. **Enable HTTPS**
   - Gunakan SSL certificate
   - Force HTTPS di Apache/Nginx

4. **Rate Limiting**
   - Implementasi rate limit untuk API
   - Gunakan reCAPTCHA untuk form

## 🤝 Contributing

Contributions are welcome! Feel free to:
- 🐛 Report bugs
- 💡 Suggest features
- 🔧 Submit pull requests

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Developer

Created with ❤️ by Sendly Team

---

**Happy Chatting! 💬✨**

Jika ada pertanyaan atau masalah, silakan buka issue di repository ini.
