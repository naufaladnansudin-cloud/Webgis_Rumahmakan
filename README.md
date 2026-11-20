# WebGIS Rumah Makan Tataaran — GitHub Pages

Versi statis dari proyek WebGIS Rumah Makan Tataaran untuk dipublikasikan melalui GitHub Pages.

## Fitur yang tersedia
- Peta interaktif Leaflet.js dengan basemap OpenStreetMap.
- Titik lokasi rumah makan berdasarkan data yang diekspor dari database proyek.
- Pencarian nama rumah makan.
- Detail lokasi, kategori, alamat, jam operasional, foto (jika tersedia), dan ulasan contoh yang ada pada dump database.
- Tombol petunjuk arah menggunakan OpenStreetMap.
- Permintaan izin lokasi browser untuk menampilkan posisi pengguna.
- Kontrol untuk menyembunyikan/menampilkan marker.

## Batasan GitHub Pages
GitHub Pages hanya menyajikan file statis. Versi ini **tidak menjalankan PHP atau MySQL**. Karena itu:
- Login dan dashboard admin PHP tidak disertakan.
- Tambah, ubah, dan hapus data melalui admin tidak tersedia.
- Formulir pengiriman ulasan tidak tersedia.
- Data lokasi dan ulasan berasal dari ekspor database dan tidak berubah otomatis.
- Perubahan data harus dilakukan pada `data.js`, lalu unggah ulang ke GitHub.

Untuk mengaktifkan kembali login admin, CRUD, dan penyimpanan ulasan lintas pengguna, proyek membutuhkan backend PHP dan database MySQL pada hosting lain.

## Publikasi di GitHub Pages
1. Buat repository GitHub baru dengan visibilitas Public.
2. Ekstrak ZIP ini di komputer.
3. Unggah **isi folder** (bukan folder ZIP) ke root repository. Pastikan `index.html` berada di root.
4. Buka **Settings → Pages**.
5. Pada **Build and deployment**, pilih **Deploy from a branch**.
6. Pilih branch `main` dan folder `/ (root)`, lalu klik **Save**.
7. Tunggu proses deployment selesai. GitHub akan menampilkan URL Pages pada bagian Pages.

## Memperbarui data rumah makan
Edit array `window.RESTAURANTS` di file `data.js`. Setiap objek rumah makan memiliki `id`, `nama`, `alamat`, `kategori`, `deskripsi`, `jam_buka`, `jam_tutup`, `latitude`, `longitude`, `foto`, dan `reviews`.

Foto harus ditempatkan di `assets/uploads/` dan nama filenya disesuaikan pada properti `foto`.

## Catatan
- Browser memerlukan HTTPS atau localhost untuk geolocation; GitHub Pages menyediakan HTTPS.
- Peta membutuhkan koneksi internet untuk memuat tile OpenStreetMap dan library Leaflet.
- Pertahankan atribusi OpenStreetMap pada peta dan patuhi kebijakan penggunaan tile.
- Verifikasi kembali koordinat, alamat, foto, dan informasi operasional sebelum dipakai sebagai informasi publik.
