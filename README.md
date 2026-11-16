# React Template — Pemrograman Web

Template environment praktikum Pemrograman Web menggunakan **React, TypeScript, Vite, React Router, dan Tailwind CSS**. Mahasiswa menggunakan template ini sebagai fondasi repository tugas masing-masing, lalu mengembangkan fitur sesuai instruksi perkuliahan.

## Membuat repository tugas

1. Buka [react-template](https://github.com/anasmcfudy/react-template).
2. Pilih **Use this template → Create a new repository**.
3. Isi nama repository tugas pada akun GitHub sendiri.
4. Clone repository yang baru dibuat ke komputer.

```sh
git clone https://github.com/USERNAME/NAMA-REPOSITORY.git
cd NAMA-REPOSITORY
npm ci
npm run dev
```

Ganti `USERNAME` dan `NAMA-REPOSITORY` dengan akun serta nama repository tugas sendiri. Perubahan dan pengumpulan tugas dilakukan di repository tersebut.

Untuk sekadar mencoba template dosen:

```sh
git clone https://github.com/anasmcfudy/react-template.git
cd react-template
npm ci
npm run dev
```

Gunakan Node.js **22.12 atau lebih baru** dan npm. Buka alamat yang ditampilkan Vite, biasanya `http://127.0.0.1:5173`.

## Yang sudah tersedia

- Konfigurasi React dan TypeScript dengan pemeriksaan tipe `strict`.
- Vite sebagai development server dan build tool.
- React Router dengan nested route serta layout yang menggunakan `Outlet`.
- Tailwind CSS v4 melalui PostCSS, CSS Modules, dan token tema.
- Contoh setiap tingkat Atomic Design: `Button`, `ProductCard`, `ProductGrid`, `PageLayout`, dan `ProductsPage`.
- Contoh komunikasi API GET dengan pemisahan model, parameter, source, dan repository.
- ESLint, Prettier, unit test, dan konfigurasi tes browser Playwright.

Saat dibuka, halaman menampilkan 5 produk awal (sesuai mockup) yang disimpan di state React. Perubahan (tambah, edit, hapus) tidak disimpan permanen dan kembali ke data awal saat halaman di-refresh.

Template ini menyediakan environment serta contoh dasar. Fitur tugas seperti CRUD lengkap, pencarian, detail produk, halaman tambahan, dan 404 dikembangkan mahasiswa sesuai instruksi dosen.

## Struktur proyek

```text
app/
  entry.tsx             # Entry browser dan BrowserRouter
  globals.css           # Import Tailwind dan CSS global
  routes.tsx            # Deklarasi route
  page.tsx              # Pembungkus halaman root
  products/page.tsx      # Pembungkus halaman produk
src/
  components/
    atoms/              # Button
    molecules/          # ProductCard
    organisms/          # ProductGrid
    templates/          # PageLayout dan Outlet
    pages/              # State serta koordinasi halaman
  data/product/
    model/
    param/
    source/
    repository/
  styles/
  types/
  utils/
tests/
```

Alur props: `ProductsPage → ProductGrid → ProductCard → Button`. Callback berjalan kembali menuju pemilik state.

Folder `app` tetap menggunakan Vite. Nama `page.tsx` tidak otomatis membentuk route; daftarkan setiap URL di `app/routes.tsx`. Route `/` saat ini mengarahkan ke `/products`, begitu juga URL yang belum dikenali. Ubah fallback tersebut saat tugas meminta halaman 404. Hosting produksi perlu mendukung fallback SPA ke `index.html`.

## Fitur

- Daftar produk dalam kartu (ID, nama, harga Rupiah), jumlah produk, dan pencarian berdasarkan nama.
- Pop-up Tambah, Edit, dan Hapus (dengan konfirmasi). Validasi: nama wajib diisi, harga bilangan bulat lebih dari 0.
- Komponen disusun dengan Atomic Design: `Button`, `TextField` (atoms); `ProductCard`, `SearchField`, `Modal` (molecules); `ProductGrid`, `ProductFormDialog`, `DeleteProductDialog` (organisms); `ProductsPage` memegang state.
- Logika daftar produk berupa fungsi murni di `src/utils/productList.ts` dan diuji di `tests/product-list.test.ts`.
- Integrasi dengan backend ExpressJS bukan bagian dari tugas ini.

## Perintah yang tersedia

| Perintah | Kegunaan |
| --- | --- |
| `npm run dev` | Menjalankan aplikasi untuk pengembangan |
| `npm run typecheck` | Memeriksa tipe TypeScript |
| `npm run lint` | Memeriksa aturan kode |
| `npm test` | Menjalankan unit test |
| `npm run build` | Memeriksa tipe dan membuat build produksi |
| `npm run preview` | Melihat hasil build secara lokal |
| `npm run test:e2e` | Menjalankan tes browser |
| `npm run format` | Memformat berkas dengan Prettier |

Tes browser menggunakan Google Chrome yang terpasang dan memerlukan port 5173 yang belum dipakai. Aplikasi tidak memerlukan backend.

## Mengembangkan tugas

Gunakan komponen yang tersedia sebagai contoh, lalu tambahkan fitur sesuai kebutuhan tugas. Pertahankan pemisahan tanggung jawab komponen, gunakan props/callback dengan jelas, dan tempatkan state bersama di atas halaman yang memakainya.

Mahasiswa harus dapat menjelaskan kode yang dikumpulkan, termasuk bagian yang dibuat dengan bantuan AI. Sesuaikan README pada repository tugas dengan fitur dan cara menjalankan aplikasi masing-masing.
