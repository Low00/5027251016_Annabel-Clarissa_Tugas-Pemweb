# Manajemen Produk (React + Express)

Aplikasi web manajemen produk untuk mata kuliah **Pemrograman Web**. Frontend dibangun dengan React, TypeScript, Vite, React Router, dan Tailwind CSS, lalu terhubung ke backend Express di folder `backend/` lewat REST API.

Pengembang: Annabel Clarissa (5027251016)

## Fitur

- **Dashboard** (`/dashboard`): ringkasan total produk, rata-rata harga, produk termurah dan termahal, serta tiga produk terbaru.
- **Daftar produk** (`/products`): kartu produk, jumlah produk, pencarian berdasarkan nama, serta tambah, edit, dan hapus lewat pop-up. Semua perubahan tersimpan di database melalui API.
- **Detail produk** (`/products/:id`): menampilkan produk sesuai `id` pada URL, dengan tautan kembali ke daftar. ID yang tidak ada atau tidak valid menampilkan pesan "Produk tidak ditemukan".
- **Halaman 404**: URL yang tidak terdaftar menampilkan pesan dan tautan ke Dashboard atau Daftar Produk.
- **Layout responsif**: sidebar berubah menjadi bilah navigasi di atas pada layar kecil.

## Teknologi

React 19 · TypeScript · Vite · React Router 7 · Tailwind CSS 4 · ESLint · Prettier · Playwright

## Rute

| URL | Halaman |
| --- | --- |
| `/` | Dialihkan ke `/dashboard` |
| `/dashboard` | Dashboard |
| `/products` | Daftar produk dan pengelolaan produk |
| `/products/:id` | Detail produk |
| `*` | Halaman 404 |

Semua rute berada di bawah satu layout (`PageLayout`: sidebar + `<Outlet />`).

## Menjalankan aplikasi

Prasyarat: **Node.js 22.12 atau lebih baru** dan npm.

### 1. Backend

Backend Express ada di folder `backend/` pada repository ini. Data disimpan di berkas JSON, jadi tidak perlu database.

```sh
cd backend
npm install
npm start                   # berjalan di http://localhost:3000
```

Saat pertama dijalankan, server membuat `backend/data/products.json` dari data awal `products.seed.json` (5 produk). Hapus `products.json` untuk mengembalikan data awal. Gunakan `npm run dev` agar server restart otomatis saat kode berubah, dan `npm test` untuk menjalankan tes backend.

Backend mengizinkan origin frontend (`http://127.0.0.1:5173` dan `http://localhost:5173`) melalui CORS. Pengaturan ini dapat diubah lewat variabel `CORS_ORIGIN`, dan port lewat `PORT`.

### 2. Frontend

Dari root repository ini, di terminal lain:

```sh
cp .env.example .env.local  # VITE_API_BASE_URL=http://localhost:3000
npm ci
npm run dev
```

Buka `http://127.0.0.1:5173`. Restart `npm run dev` setelah mengubah `.env.local`.

### Endpoint backend yang dipakai

| Aksi | Request |
| --- | --- |
| Daftar produk | `GET /products` |
| Detail produk | `GET /products/:id` (404 jika tidak ada) |
| Tambah | `POST /products` dengan body `{ name, price }` |
| Ubah | `PUT /products` dengan body `{ id, name, price }` |
| Hapus | `DELETE /products/:id` |

Harga harus bilangan bulat lebih dari 0 (divalidasi di frontend dan backend). `GET /products` juga mendukung `?q=` untuk mencari berdasarkan nama.

## Perintah npm

| Perintah | Fungsi |
| --- | --- |
| `npm run dev` | Development server Vite |
| `npm run typecheck` | Pemeriksaan tipe TypeScript |
| `npm run lint` | ESLint tanpa warning |
| `npm test` | Unit test (lapisan data, validasi, pencarian, ringkasan) |
| `npm run test:e2e` | Tes browser Playwright (API di-mock, backend tidak perlu aktif) |
| `npm run build` | Typecheck lalu build produksi ke `dist/` |
| `npm run format` | Merapikan kode dengan Prettier |

Tes browser memakai Google Chrome yang terpasang dan membutuhkan port 5173 yang belum dipakai.

## Struktur proyek

```text
backend/                     # Backend Express (src/, data/, test/)
app/                         # Entry, BrowserRouter, dan deklarasi route
  routes.tsx                 # Semua route dalam satu layout
  dashboard/ products/ not-found/   # Pembungkus tiap halaman
src/
  components/                # Atomic Design
    atoms/                   # Button, ButtonLink, TextField
    molecules/               # ProductCard, SearchField, Modal, NavItem, StatCard, Alert, StatusPanel
    organisms/               # Sidebar, ProductGrid, ProductFormDialog, DeleteProductDialog
    templates/               # PageLayout (sidebar + Outlet)
    pages/                   # DashboardPage, ProductsPage, ProductDetailPage, NotFoundPage
  data/product/              # source (HTTP) -> repository -> model (validasi response)
  utils/                     # formatRupiah, validasi form, pencarian, ringkasan dashboard
  styles/                    # Tema dan komponen Tailwind
tests/                       # Unit test (node:test) dan tes browser (Playwright)
```

Alur data: halaman memanggil `productRepository`, yang memakai `ProductRemote` untuk request HTTP dan `ProductModel` untuk memvalidasi response sebelum dipakai antarmuka.

## Catatan

- Styling memakai Tailwind CSS: utility class langsung pada `className` untuk komponen baru, dan `@apply` pada CSS Module untuk komponen bawaan template.
- Nilai `VITE_*` terlihat oleh pengguna browser, jadi jangan isi token atau secret.
