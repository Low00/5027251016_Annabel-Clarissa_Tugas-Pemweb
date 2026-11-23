import ProductRemote from "./source/product-remote.ts"
import ProductRepository from "./repository/product-repository.ts"

// Satu repository dipakai bersama oleh semua halaman.
export const productRepository = ProductRepository(
    ProductRemote({ baseUrl: import.meta.env.VITE_API_BASE_URL ?? "" }),
)
