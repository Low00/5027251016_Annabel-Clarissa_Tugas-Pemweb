# Backend Manajemen Produk

API REST sederhana dengan Express 5. Data disimpan di `data/products.json` (dibuat otomatis dari `data/products.seed.json`).

```sh
npm install
npm start        # http://localhost:3000
npm test
```

| Method | URL | Keterangan |
| --- | --- | --- |
| GET | `/products` | Daftar produk, opsional `?q=` untuk mencari nama |
| GET | `/products/:id` | Satu produk; 404 jika tidak ada, 400 jika id tidak valid |
| POST | `/products` | Body `{ name, price }`; 201 jika berhasil |
| PUT | `/products` | Body `{ id, name, price }`; 404 jika id tidak ada |
| DELETE | `/products/:id` | Hapus produk; 404 jika tidak ada |

`name` harus string tidak kosong dan `price` bilangan bulat lebih dari 0, jika tidak API menjawab 400. Variabel opsional: `PORT` (default 3000) dan `CORS_ORIGIN` (daftar origin dipisah koma).
