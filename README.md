# Expo Basic — Belajar UI, Form Wizard, dan Peta (Leaflet)

Proyek ini adalah latihan membangun antarmuka ala aplikasi sehari‑hari menggunakan Expo (React Native untuk Web). Materi mencakup form multi‑langkah, integrasi peta (Leaflet + OpenStreetMap), geocoding (Nominatim), perhitungan jarak (Haversine), routing jalan (OSRM), real‑time tracking perangkat, animasi follow route, serta dashboard kurir dengan rute waypoint (mirip Traveling Salesman Problem menggunakan OSRM Trip).

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

## Perubahan Terbaru (Maps & Autocomplete di Device)

- Memperbaiki bottom‑sheet di halaman Gojek: tombol “Buka Sheet” kini benar‑benar membuka penuh (translateY = 0).
- Peta kini tampil di perangkat asli (Android/iOS) menggunakan fallback Leaflet di dalam WebView (`react-native-webview`).
- Autocomplete, geocoding (Nominatim), reverse geocoding, dan routing OSRM tidak lagi dibatasi ke Web — seluruh fitur tersebut aktif juga di device.
- Dashboard Kurir (segment Waypoint) memiliki fallback TSP: urutan nearest‑neighbor dan penggambaran polyline per segmen via OSRM Route bila OSRM Trip tidak menyediakan geometry.
- Dependensi baru: `react-native-webview` (dipasang via `npx expo install react-native-webview`).
 - Warna polyline kini merah dan pin/marker hijau di halaman Gojek serta Waypoint Kurir (konsisten di Web dan device).
 - Autocomplete untuk Lokasi Jemput (pickup) ditambahkan di halaman Gojek; saran muncul dengan debounce dan batas minimal 5 huruf.

### Menjalankan di Perangkat (Expo Go)
- Jalankan `npx expo start` untuk menampilkan QR code.
- Scan QR di Expo Go (Android) atau Camera (iOS) — pastikan perangkat dan komputer berada di jaringan yang sama.
- Semua fitur peta, autocomplete, dan routing akan berfungsi di device melalui WebView.

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
   - Reverse geocoding: saat marker dipindah/posisi berubah, alamat otomatis diperbarui dari koordinat.
   - Geocoding alamat (Nominatim) untuk mengonversi alamat → koordinat dan autocomplete destinasi (minimal 5 huruf agar hemat request).
   - Routing jalan: polyline mengikuti jalan menggunakan OSRM Route; tersedia tombol fokus rute.
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
   - Fallback rute jalan per segmen: bila geometry Trip tidak tersedia, setiap leg antar titik dihitung via OSRM Route dan digabung, sehingga polyline tetap mengikuti jalan.
   - Fallback terakhir: bila panggilan OSRM untuk suatu segmen gagal, segmen itu ditarik lurus sementara segmen lain tetap mengikuti jalan.
9. Review & Verifikasi
   - Buka `http://localhost:8083/` dan uji tiap halaman.
   - Periksa konsol browser; beberapa error jaringan OSRM/Nominatim bisa muncul namun UI tetap berfungsi berkat fallback.

## Fitur Utama per Halaman

- Gojek Order (`gojek-order.tsx`)
  - Form tetap di bottom sheet; peta background full‑screen.
  - Marker pickup/destination draggable dan sinkron dengan form.
  - Reverse geocoding: alamat ditampilkan kembali dari koordinat saat marker dipindah atau posisi perangkat diperbarui.
  - Autocomplete destinasi Nominatim (minimal 5 huruf untuk menampilkan saran).
  - Routing jalan via OSRM Route: polyline mengikuti jalan; tersedia tombol fokus rute.
  - Estimasi jarak/biaya via Haversine untuk perhitungan cepat.
  - Tracking realtime: tombol “Tracking: ON/OFF” memantau posisi perangkat dan kamera mengikuti.
  - Follow Route: tombol “Follow Route: ON/OFF” menggerakkan marker kecil sepanjang polyline dan kamera mengikuti; otomatis menonaktifkan Tracking saat aktif (dan sebaliknya) agar tidak bentrok.

- Wizard Kirim Barang (`order-kirim.tsx`)
  - Tiga langkah: asal/tujuan/kategori → bobot + dimensi (p,l,t) → konfirmasi.
  - Volume dihitung otomatis dari dimensi; biaya contoh dihitung dari bobot dan volume.

- Dashboard Kurir (`dashboard-kurir.tsx`)
  - Segment “Daftar”: list tugas, tombol WhatsApp dan modal peta rute per tugas.
  - Segment “Waypoint”: peta rute gabungan (mirip TSP) + urutan kunjungan.
  - Polyline mengikuti jalan: prioritas geometry OSRM Trip; bila tidak ada, dibangun dari OSRM Route per segmen secara berurutan.
  - Fallback: segmen yang gagal panggilan OSRM sementara ditarik lurus, segmen lain tetap mengikuti jalan.
  - Tracking realtime: tombol “Tracking: ON/OFF” memantau posisi perangkat, menampilkan marker biru, dan kamera mengikuti.
  - Follow Route: tombol “Follow Route: ON/OFF” menggerakkan marker kecil di sepanjang polyline dan kamera mengikuti; aktifnya Follow Route mematikan Tracking otomatis.

## Catatan Teknis
- Leaflet aktif di Web (CDN) dan di perangkat asli melalui fallback WebView (`react-native-webview`). Dengan ini, peta tampil konsisten tanpa `react-native-maps`.
- Nominatim/OSRM adalah layanan publik; rate‑limit atau kegagalan jaringan bisa terjadi.
  - Implementasi memiliki fallback berlapis: (1) rute per segmen via OSRM Route bila geometry Trip tidak tersedia, (2) garis lurus per segmen bila panggilan OSRM gagal.
  - Autocomplete destinasi dibatasi minimal 5 huruf untuk mengurangi beban request; reverse geocoding diberi throttle agar hemat.
- Geolocation membutuhkan izin browser; ada fallback ke Jakarta bila ditolak.
  - Saat Tracking aktif, Follow Route dimatikan otomatis (dan sebaliknya) agar kamera tidak “berebut”.

### Dependensi Tambahan untuk Device
- `react-native-webview` dipakai untuk merender Leaflet di perangkat asli.
  - Pasang dengan: `npx expo install react-native-webview`
  - Tidak memerlukan konfigurasi native manual di Expo Managed Workflow.

### Catatan Perilaku di Device
- Autocomplete dan geocoding (Nominatim) serta routing OSRM dipanggil langsung dari device — pastikan koneksi internet tersedia.
- Bila OSRM/Nominatim tidak dapat diakses, UI tetap menampilkan fallback (polyline lurus per segmen, atau menunda saran autocomplete).
- Tidak menggunakan `react-native-maps`; seluruh peta berasal dari Leaflet HTML di WebView agar setup tetap sederhana.

## Troubleshooting: Peta/Autocomplete Tidak Tampil di Device
- Pastikan sudah memasang `react-native-webview`: `npx expo install react-native-webview`.
- Jalankan `npx expo start` dan scan QR dengan Expo Go; jangan hanya mode Web bila ingin uji di device.
- Periksa koneksi internet dan akses ke layanan publik:
  - Nominatim (geocoding): `https://nominatim.openstreetmap.org`
  - OSRM (routing): endpoint publik/mandiri yang dikonfigurasi di kode.
- Cek izin lokasi di device; bila ditolak, aplikasi memakai fallback posisi Jakarta agar peta tetap inisialisasi.
- Bila polyline tidak mengikuti jalan, kemungkinan panggilan OSRM gagal atau mencapai rate‑limit; aplikasi akan menampilkan garis lurus sementara.

### Khusus Autocomplete Nominatim di Device
- Ketik minimal 5 huruf agar saran muncul (mis. "sudirman", "depok", "bandung").
- Autocomplete di device memakai `fetch` langsung dari perangkat. Sesuai kebijakan Nominatim, kami menambahkan header berikut agar permintaan tidak ditolak:
  ```ts
  fetch(url, {
    headers: {
      Accept: 'application/json',
      Referer: 'https://expo-basic.local',
      'Accept-Language': 'id',
    },
  })
  ```
- Pastikan jaringan tidak memblokir akses ke `nominatim.openstreetmap.org` (VPN/Private DNS bisa mempengaruhi).
- Debounce aktif ±350ms untuk menghemat request; ketikan sangat cepat mungkin menunggu sebentar sebelum saran muncul.
- Bila saran tidak tampil:
  - Coba alamat lain yang lebih spesifik (contoh: "Jl. Jend. Sudirman, Jakarta").
  - Periksa log Expo (DevTools) dan cari error `fetch`/network.
  - Uji dengan membuka `https://nominatim.openstreetmap.org` di browser perangkat.

### Checklist Koneksi & Konfigurasi Device
- Komputer dan perangkat berada di jaringan Wi‑Fi yang sama; jika perlu jalankan `npx expo start --host lan`.
- Tidak ada VPN/Private DNS yang memblokir domain OpenStreetMap/OSRM/Nominatim.
- Untuk endpoint OSRM kustom, gunakan `https`. Jika memakai `http` pada Android 9+, Anda membutuhkan konfigurasi `cleartext` (tidak tersedia default di Expo Managed) — rekomendasi: pakai `https` agar aman.
- Jika peta tidak render di device: pastikan komponen yang menampilkan peta adalah WebView (bukan div web) dan `react-native-webview` terpasang.

### Warna Peta & Marker (Verifikasi Visual)
- Polyline rute berwarna merah (`#ef4444`).
- Pin/marker pickup, tujuan, dan tiap stop waypoint berwarna hijau.
- Berlaku sama di Web dan di device (Leaflet di WebView).

## Cara Uji Cepat

- Buka `http://localhost:8083/` dari browser.
- Gojek Order:
  - Geser marker untuk melihat alamat otomatis (reverse geocoding) dan jarak Haversine.
  - Ketik destinasi ≥ 5 huruf untuk melihat saran autocomplete; pilih satu untuk menggambar rute jalan OSRM.
  - Coba “Follow Route: ON” untuk animasi mengikuti rute; “Tracking: ON” untuk mengikuti posisi perangkat (aktif salah satu saja).
- Dashboard Kurir → Waypoint:
  - Tekan “Hitung Ulang” untuk membentuk rute; periksa apakah polyline mengikuti jalan.
  - Matikan/nyalakan “Follow Route” dan “Tracking” untuk mencoba perilaku kamera/marker.
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
![Kurir Paket](screenshoot/kurir-paket.png)

### Lainnya

![Toko Online](screenshoot/toko%20online.png)
![Profil](screenshoot/profil.png)
![Walet](screenshoot/walet.png)

## Pengembangan Lanjutan (Ide)

- Wizard Kirim Barang: pilihan satuan (cm/inch, kg/lb) dan validasi batas nilai.
- Dashboard Kurir:
  - Opsi `roundtrip=true` untuk kembali ke titik awal
  - Menampilkan jarak total, estimasi waktu OSRM, dan biaya akumulatif
  - Warna polyline per segmen (mis. hijau/kuning/merah berdasarkan estimasi durasi)
  - Simpan rute dan buka navigasi Google Maps dengan waypoint
- Gojek Order:
  - Pengaturan kecepatan animasi Follow Route dan zoom konstan
  - Menampilkan estimasi waktu/jarak OSRM di panel estimasi

Selamat belajar dan bereksperimen!