import type { ProductValues } from "../types/product"

export type ProductFormInput = { name: string; price: string }
export type ProductFormErrors = { name?: string; price?: string }
export type ProductFormResult =
    | { ok: true; values: ProductValues }
    | { ok: false; errors: ProductFormErrors }

// Checks raw form text and converts it into values the API accepts.
export function validateProductForm(input: ProductFormInput): ProductFormResult {
    const errors: ProductFormErrors = {}
    const name = input.name.trim()
    const priceText = input.price.trim()

    if (!name) errors.name = "Nama produk wajib diisi."

    const price = Number(priceText)
    if (!/^\d+$/.test(priceText) || !Number.isSafeInteger(price) || price <= 0) {
        errors.price = "Harga harus berupa angka bulat lebih dari 0."
    }

    if (errors.name || errors.price) return { ok: false, errors }
    return { ok: true, values: { name, price } }
}
