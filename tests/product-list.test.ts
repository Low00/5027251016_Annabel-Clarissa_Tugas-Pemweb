import { test } from "node:test"
import assert from "node:assert/strict"
import {
    addProduct,
    filterProducts,
    removeProduct,
    updateProduct,
} from "../src/utils/productList.ts"
import { initialProducts } from "../src/data/product/initial-products.ts"

test("data awal berisi 5 produk dengan id unik", () => {
    assert.equal(initialProducts.length, 5)
    assert.equal(new Set(initialProducts.map((p) => p.id)).size, 5)
})

test("tambah produk memakai id terbesar + 1 dan tidak mengubah daftar lama", () => {
    const result = addProduct(initialProducts, { name: "Penggaris Besi", price: 9000 })
    assert.equal(result.length, 6)
    assert.deepEqual(result[5], { id: 6, name: "Penggaris Besi", price: 9000 })
    assert.equal(initialProducts.length, 5)
})

test("id produk baru tidak memakai ulang id yang sudah dihapus", () => {
    const afterDelete = removeProduct(initialProducts, 2)
    assert.equal(addProduct(afterDelete, { name: "X", price: 1 })[4].id, 6)
    assert.equal(addProduct([], { name: "X", price: 1 })[0].id, 1)
})

test("edit hanya mengubah produk yang dipilih", () => {
    const result = updateProduct(initialProducts, 2, { name: "Buku", price: 15000 })
    assert.deepEqual(result[1], { id: 2, name: "Buku", price: 15000 })
    assert.deepEqual(result[0], initialProducts[0])
})

test("hapus membuang produk berdasarkan id", () => {
    const result = removeProduct(initialProducts, 3)
    assert.equal(result.length, 4)
    assert.ok(!result.some((p) => p.id === 3))
})

test("pencarian tidak peka huruf besar dan mengabaikan spasi tepi", () => {
    assert.deepEqual(
        filterProducts(initialProducts, "  BUKU ").map((p) => p.id),
        [2],
    )
    assert.equal(filterProducts(initialProducts, "").length, 5)
    assert.equal(filterProducts(initialProducts, "zzz").length, 0)
})
