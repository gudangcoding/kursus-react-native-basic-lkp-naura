# Expo Basic — Belajar UI, Form Wizard, dan Peta (Leaflet)

Proyek ini adalah latihan membangun antarmuka ala aplikasi sehari‑hari menggunakan Expo (React Native untuk Web). Materi mencakup form multi‑langkah, integrasi peta (Leaflet + OpenStreetMap), geocoding (Nominatim), perhitungan jarak (Haversine), serta dashboard kurir dengan rute waypoint (mirip Traveling Salesman Problem menggunakan OSRM Trip).

## Prasyarat

- Node.js LTS dan npm terpasang
- Git (opsional)
- Koneksi internet (untuk memuat CDN Leaflet, Nominatim, dan OSRM)

## Menjalankan Proyek

1. Install dependensi (jalankan sekali):
   ```bash
   npm install
   ```
2. Jalankan Expo untuk Web (disarankan port 8083):
   ```bash
   npx expo start --web --port 8083
   ```
3. Buka browser di `http://localhost:8083/`.
4. Navigasi dari tab “Fragment” untuk membuka halaman‑halaman yang disediakan.

## Struktur Proyek Singkat

- `app/(tabs)/fragment.tsx` — halaman berisi kartu navigasi ke contoh‑contoh
- `app/pages/layout-stack/gojek-order.tsx` — halaman order ala Gojek dengan peta full‑screen
- `app/pages/layout-stack/order-kirim.tsx` — form wizard 3 langkah untuk pengiriman barang
- `app/pages/layout-stack/dashboard-kurir.tsx` — dashboard kurir: daftar tugas + segment “Waypoint (TSP)”
- `app/pages/layout-stack/dashboard-tokopedia.tsx` — halaman contoh e‑commerce (opsional)

## Langkah Pembelajaran (Step‑by‑Step)

1. Setup proyek Expo untuk Web
   - Menjalankan `npx expo start --web` dan memahami struktur `app/`.
2. Membuat halaman dasar dan navigasi
   - Menambahkan kartu di `Fragment` untuk mengakses contoh halaman.
3. Gojek Order Page — layout dasar
   - Menempatkan form pickup/destination dan estimasi di bottom‑sheet tetap.
   - Peta Leaflet sebagai latar full‑screen.
4. Integrasi Peta & Geocoding
   - Memuat Leaflet via CDN, menambahkan marker draggable.
   - Geocoding alamat (Nominatim) untuk mengonversi alamat → koordinat.
5. Perhitungan Jarak dan Estimasi
   - Menggunakan Haversine untuk menghitung jarak km.
   - Menghitung estimasi biaya berdasar jarak.
6. Form Wizard Kirim Barang (3 Langkah)
   - Langkah 1: asal, tujuan, kategori item.
   - Langkah 2: bobot nyata dan dimensi (p x l x t) satu baris, volume dihitung otomatis.
   - Langkah 3: konfirmasi dan ringkasan biaya.
7. Dashboard Kurir — Daftar Tugas
   - Kartu berisi resi, alamat, tombol WhatsApp, dan tombol Maps untuk rute.
8. Dashboard Kurir — Waypoint (TSP)
   - Segment toggle “Daftar” vs “Waypoint”.
   - Menghitung rute gabungan waypoint menggunakan OSRM Trip (source=first, destination=last, roundtrip=false).
   - Fallback: jika OSRM gagal, menggambar polyline lurus berdasar urutan nearest‑neighbor (Haversine).
9. Review & Verifikasi
   - Buka `http://localhost:8083/` dan uji tiap halaman.
   - Periksa konsol browser; beberapa error jaringan OSRM/Nominatim bisa muncul namun UI tetap berfungsi berkat fallback.

## Fitur Utama per Halaman

- Gojek Order (`gojek-order.tsx`)
  - Form tetap di bottom sheet; peta background full‑screen.
  - Marker pickup/destination draggable dan sinkron dengan form.
  - Geocoding Nominatim dan estimasi jarak/biaya via Haversine.

- Wizard Kirim Barang (`order-kirim.tsx`)
  - Tiga langkah: asal/tujuan/kategori → bobot + dimensi (p,l,t) → konfirmasi.
  - Volume dihitung otomatis dari dimensi; biaya contoh dihitung dari bobot dan volume.

- Dashboard Kurir (`dashboard-kurir.tsx`)
  - Segment “Daftar”: list tugas, tombol WhatsApp dan modal peta rute per tugas.
  - Segment “Waypoint”: peta rute gabungan (mirip TSP) + urutan kunjungan.
  - Fallback polyline jika OSRM gagal, agar rute tetap terlihat.

## Catatan Teknis

- Leaflet hanya diaktifkan pada platform Web dan dimuat via CDN.
- Nominatim/OSRM adalah layanan publik; rate‑limit atau kegagalan jaringan bisa terjadi.
  - Implementasi memiliki fallback (garis lurus + nearest‑neighbor) untuk menjaga UI tetap berfungsi.
- Geolocation membutuhkan izin browser; ada fallback ke Jakarta bila ditolak.

## Screenshot

Semua gambar berada di folder `screenshoot/` dan disematkan di bawah ini:

### Gojek / Pengantaran

![Pesan Gojek](screenshoot/pesan%20gojek.png)

### Wizard Kirim Barang

![Kirim Barang 1](screenshoot/Kirim%20Barang%201.png)
![Kirim Barang 2](screenshoot/Kirim%20Barang%202.png)
![Kirim Barang 3](screenshoot/Kirim%20Barang%203.png)
![Kirim Barang 4](screenshoot/Kirim%20Barang%204.png)

### Dashboard Kurir

![Dashboard Kurir (Daftar)](screenshoot/dashboard%20kurir.png)
![Dashboard Kurir (Waypoint)](screenshoot/dashboard%20kurir%20waypoint.png)

### Lainnya

![Toko Online](screenshoot/toko%20online.png)
![Profil](screenshoot/profil.png)
![Walet](screenshoot/walet.png)

## Pengembangan Lanjutan (Ide)

- Gojek Order: reverse geocoding untuk menampilkan alamat dari marker.
- Wizard Kirim Barang: pilihan satuan (cm/inch, kg/lb) dan validasi batas nilai.
- Dashboard Kurir:
  - Menggambar rute “jalan” per leg (memanggil OSRM Route untuk tiap segmen sesuai urutan)
  - Opsi `roundtrip=true` untuk kembali ke titik awal
  - Menampilkan jarak total, estimasi waktu, dan biaya akumulatif
  - Simpan rute dan buka navigasi Google Maps dengan waypoint

Selamat belajar dan bereksperimen!