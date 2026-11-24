# 🏆 Speed Coding Scratch - Live Timer & Leaderboard

Aplikasi web modern, ringan, dan real-time untuk perlombaan **Speed Coding Scratch** (Tingkat SD & SMP).

Dirancang khusus dengan konsep:
1. **Layar TV / Proyektor (Photo 1)**: Kotak Timer Besar "SISA WAKTU", Logo Sponsor/Mitra, Live Leaderboard (Ranking 1-N berdasarkan waktu tercepat), dan efek suara kompetisi.
2. **Denah Meja Interaktif (Photo 2)**: 30 titik meja perlombaan sesuai denah ruangan fisik. Operator/juri cukup klik titik meja untuk memilih nama peserta dan mencatat waktu selesai otomatis berdasarkan lama waktu yang telah berjalan (*elapsed time*).

---

## 🚀 Fitur Utama

- ⚡ **Zero-Latency Real-Time Sync**: Sinkronisasi instan (0 ms) antara Panel Operator dan Layar TV melalui `BroadcastChannel` dan `LocalStorage`. Tidak membutuhkan koneksi internet saat hari perlombaan!
- 🐱 **Desain Khas Scratch**: Nuansa balok kode Scratch cerah (Oranye `#FFAB19`, Biru `#4C97FF`, Hijau `#0FBD8C`), font digital `Orbitron` yang jelas terbaca dari jarak jauh di proyektor/TV.
- ⏱️ **Pencatatan Waktu Otomatis**: Waktu selesai peserta dihitung presisi berdasarkan waktu yang telah berjalan sejak tombol "Mulai" ditekan (contoh: `07:42`).
- 🪑 **Interactive Floorplan**: 30 titik meja interaktif yang langsung ditempatkan di atas denah ruangan asli. Warna berubah menjadi **Hijau** saat peserta selesai, atau **Merah** saat sedang bertanding.
- ⚡ **Mode Quick-Tap Finish**: Opsi 1-klik instan untuk mencatat waktu saat peserta mengangkat tangan selesai tanpa perlu membuka modal berulang kali.
- 📊 **Integrasi Google Spreadsheet**: Mendukung import data peserta dari Spreadsheet (CSV / Web App) dan ekspor hasil akhir lomba (Juara 1, 2, 3, waktu elapsed, dsb.).
- 🔊 **Sound Effects (SFX)**: Web Audio API tanpa file eksternal (Start fanfare, victory chime, dan countdown beeps saat sisa waktu 3 detik).

---

## 📁 Struktur File

- `index.html` : Layar TV Utama / Proyektor (Sesuai Sketsa Foto 1).
- `operator.html` : Panel Denah Meja Interaktif (Sesuai Foto 2).
- `style.css` : Desain tampilan Scratch championship, dark mode TV high-contrast, dan responsif.
- `store.js` : Engine state management terpusat dan sinkronisasi real-time.
- `app.js` : Logika layar TV (Timer countdown, progress bar, live ranking table).
- `operator.js` : Logika interaksi denah meja (pilih peserta, catat waktu, manual override).
- `audio.js` : Web Audio API synthesizer.
- `assets/floorplan.png` : Gambar denah ruangan meja peserta.
- `google_apps_script.js` : Kode siap pakai untuk Google Apps Script (opsional untuk Google Sheets API).

---

## 🌐 Cara Deploy ke GitHub Pages atau Netlify

Aplikasi ini dibuat murni menggunakan **HTML5, CSS3, dan Vanilla JavaScript Modern** (tanpa build step, tanpa npm install).

### Cara Deploy ke GitHub Pages:
1. Buat repository baru di GitHub (misal: `speed-coding-timer`).
2. Upload semua file dalam folder ini ke repository tersebut.
3. Buka menu **Settings** > **Pages** di repository GitHub Anda.
4. Pada bagian **Branch**, pilih `main` (atau `master`) dan folder `/ (root)`. Klik **Save**.
5. Website Anda akan aktif dalam 1-2 menit di URL: `https://username.github.io/speed-coding-timer/`.

### Cara Deploy ke Netlify:
1. Buka [netlify.com](https://www.netlify.com/) dan login.
2. Tarik dan lepas (Drag & Drop) folder ini ke menu **Deploy manually**.
3. Website langsung aktif seketika dalam hitungan detik!

---

## 📋 Panduan Format Google Spreadsheet

Untuk mengimpor data peserta dari Google Spreadsheet:
1. Buat Spreadsheet baru di Google Sheets dengan kolom:
   - Kolom A: `Nama Peserta`
   - Kolom B: `Kategori` (isi `SD` atau `SMP`)
   - Kolom C: `Asal Sekolah`
2. Klik menu **File** > **Share** > **Publish to web** (Publikasikan ke web).
3. Pilih format **Comma-separated values (.csv)** dan klik **Publish**.
4. Salin tautan yang diberikan.
5. Di aplikasi web ini, buka **Pengaturan (⚙)** > Tempel link CSV di kolom Google Spreadsheet > Klik **📥 Tarik Data dari Spreadsheet**.
