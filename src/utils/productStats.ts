import type { Product } from "../types/product"

export type ProductStats = {
    total: number
    cheapest: Product | null
    priciest: Product | null
    averagePrice: number
}

// Ringkasan untuk halaman dashboard.
export function summarizeProducts(products: Product[]): ProductStats {
    if (products.length === 0) {
        return { total: 0, cheapest: null, priciest: null, averagePrice: 0 }
    }

    let cheapest = products[0]
    let priciest = products[0]
    let sum = 0
    for (const product of products) {
        if (product.price < cheapest.price) cheapest = product
        if (product.price > priciest.price) priciest = product
        sum += product.price
    }

    return {
        total: products.length,
        cheapest,
        priciest,
        averagePrice: Math.round(sum / products.length),
    }
}
