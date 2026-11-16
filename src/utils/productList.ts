import type { Product, ProductValues } from "../types/product"

// Fungsi murni untuk mengubah daftar produk; state tetap dimiliki ProductsPage.

export function addProduct(
    products: Product[],
    values: ProductValues,
): Product[] {
    const id = Math.max(0, ...products.map((product) => product.id)) + 1
    return [...products, { id, ...values }]
}

export function updateProduct(
    products: Product[],
    id: number,
    values: ProductValues,
): Product[] {
    return products.map((product) =>
        product.id === id ? { id, ...values } : product,
    )
}

export function removeProduct(products: Product[], id: number): Product[] {
    return products.filter((product) => product.id !== id)
}

export function filterProducts(products: Product[], query: string): Product[] {
    const keyword = query.trim().toLowerCase()
    if (!keyword) return products
    return products.filter((product) =>
        product.name.toLowerCase().includes(keyword),
    )
}
