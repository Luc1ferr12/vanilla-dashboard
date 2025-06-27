# Dashboard Keuangan - Sistem Login

## Fitur Login yang Telah Ditambahkan

Aplikasi dashboard keuangan sekarang memiliki sistem autentikasi yang lengkap dengan fitur-fitur berikut:

### 🔐 Halaman Login (`login.html`)
- **Login dengan Google**: Pengguna dapat masuk menggunakan akun Google mereka
- **Login dengan Email/Password**: Pengguna dapat membuat akun baru atau masuk dengan email dan password
- **Desain Responsif**: Tampilan yang modern dan responsif untuk desktop dan mobile
- **Validasi Input**: Pesan error yang informatif untuk berbagai jenis kesalahan

### 👤 Fitur Autentikasi
- **Auto Redirect**: Pengguna yang sudah login akan otomatis diarahkan ke dashboard
- **Proteksi Halaman**: Halaman dashboard hanya bisa diakses setelah login
- **User Profile**: Menampilkan foto profil Google atau inisial nama pengguna
- **Tombol Logout**: Tombol logout yang mudah diakses di header

### 📱 PWA Ready
- **Progressive Web App**: Aplikasi dapat diinstall di perangkat mobile
- **Offline Support**: Service worker untuk caching
- **App-like Experience**: Tampilan dan navigasi seperti aplikasi native

## Cara Menggunakan

### 1. Akses Halaman Login
Buka `login.html` di browser Anda. Jika pengguna belum login, mereka akan otomatis diarahkan ke halaman ini.

### 2. Login dengan Google
1. Klik tombol "Masuk dengan Google"
2. Pilih akun Google yang ingin digunakan
3. Izinkan akses jika diminta
4. Pengguna akan otomatis diarahkan ke dashboard

### 3. Login dengan Email/Password
1. Masukkan email dan password
2. Klik "Masuk dengan Email"
3. Untuk pengguna baru, klik "Daftar di sini" terlebih dahulu

### 4. Navigasi Dashboard
Setelah login berhasil:
- Pengguna akan diarahkan ke halaman dashboard utama
- Foto profil atau inisial nama akan ditampilkan di header
- Tombol logout tersedia di header
- Semua halaman (detailed, debts, budget_tools, settings) terlindungi

### 5. Logout
- Klik tombol logout di header
- Pengguna akan keluar dan diarahkan kembali ke halaman login

## Struktur File

```
├── login.html          # Halaman login utama
├── login.css           # Styling untuk halaman login
├── login.js            # Script autentikasi
├── index.html          # Dashboard utama (sudah ditambahkan autentikasi)
├── detailed.html       # Halaman detailed (sudah ditambahkan autentikasi)
├── config.js           # Konfigurasi Firebase
├── manifest.json       # PWA manifest
└── service-worker.js   # Service worker untuk PWA
```

## Konfigurasi Firebase

Pastikan file `config.js` sudah dikonfigurasi dengan benar:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

## Keamanan

- **Firebase Authentication**: Menggunakan layanan autentikasi Firebase yang aman
- **User Isolation**: Data pengguna terisolasi berdasarkan UID
- **Secure Redirects**: Redirect otomatis yang aman
- **Session Management**: Manajemen sesi yang proper

## Fitur Tambahan

### User Profile di Firestore
Setiap pengguna yang login akan memiliki profil di koleksi `users` dengan data:
- UID pengguna
- Email
- Display name
- Photo URL (jika menggunakan Google)
- Timestamp pembuatan akun
- Timestamp login terakhir

### Responsive Design
- Halaman login responsif untuk semua ukuran layar
- Tombol dan input yang mudah digunakan di mobile
- Animasi dan transisi yang smooth

## Troubleshooting

### Popup Diblokir
Jika popup Google login diblokir:
1. Izinkan popup untuk domain aplikasi
2. Atau gunakan login email/password sebagai alternatif

### Error Login
- Pastikan koneksi internet stabil
- Periksa format email yang benar
- Password minimal 6 karakter untuk registrasi

### Redirect Loop
Jika terjadi redirect loop:
1. Clear cache browser
2. Logout dan login ulang
3. Periksa konfigurasi Firebase

## Pengembangan Selanjutnya

- [ ] Tambahkan fitur "Lupa Password"
- [ ] Implementasi Two-Factor Authentication
- [ ] Role-based access control
- [ ] User preferences dan settings
- [ ] Activity log untuk tracking login

---

**Catatan**: Sistem login ini menggunakan Firebase Authentication yang aman dan terpercaya. Pastikan untuk mengaktifkan Google Sign-In di Firebase Console jika ingin menggunakan fitur login dengan Google. 