import type { Product } from "../types/product"

// Memfilter produk berdasarkan nama (tidak peka huruf besar, spasi tepi diabaikan).
export function filterProducts(products: Product[], query: string): Product[] {
    const keyword = query.trim().toLowerCase()
    if (!keyword) return products
    return products.filter((product) =>
        product.name.toLowerCase().includes(keyword),
    )
}
