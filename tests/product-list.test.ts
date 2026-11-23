import { test } from "node:test"
import assert from "node:assert/strict"
import { filterProducts } from "../src/utils/productList.ts"
import { summarizeProducts } from "../src/utils/productStats.ts"

const products = [
    { id: 1, name: "Pulpen", price: 5000 },
    { id: 2, name: "Buku Tulis", price: 12000 },
    { id: 3, name: "Spidol", price: 8000 },
]

test("pencarian tidak peka huruf besar dan mengabaikan spasi tepi", () => {
    assert.deepEqual(filterProducts(products, "  BUKU ").map((p) => p.id), [2])
    assert.equal(filterProducts(products, "").length, 3)
    assert.equal(filterProducts(products, "zzz").length, 0)
})

test("ringkasan dashboard menghitung total, termurah, termahal, dan rata-rata", () => {
    const stats = summarizeProducts(products)
    assert.equal(stats.total, 3)
    assert.equal(stats.cheapest?.name, "Pulpen")
    assert.equal(stats.priciest?.name, "Buku Tulis")
    assert.equal(stats.averagePrice, 8333)
})

test("ringkasan untuk daftar kosong tidak error", () => {
    assert.deepEqual(summarizeProducts([]), {
        total: 0,
        cheapest: null,
        priciest: null,
        averagePrice: 0,
    })
})
