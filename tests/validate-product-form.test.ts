import { test } from "node:test"
import assert from "node:assert/strict"
import { validateProductForm } from "../src/utils/validateProductForm.ts"

test("input valid diubah menjadi nilai untuk API", () => {
    const result = validateProductForm({ name: "  Buku Tulis ", price: " 12000 " })
    assert.deepEqual(result, {
        ok: true,
        values: { name: "Buku Tulis", price: 12000 },
    })
})

test("nama kosong ditolak", () => {
    const result = validateProductForm({ name: "   ", price: "5000" })
    assert.equal(result.ok, false)
    if (!result.ok) {
        assert.ok(result.errors.name)
        assert.equal(result.errors.price, undefined)
    }
})

test("harga harus angka bulat lebih dari 0", () => {
    for (const price of ["", "0", "-5", "abc", "1.5", "1e3", "5000rb"]) {
        const result = validateProductForm({ name: "Pulpen", price })
        assert.equal(result.ok, false, `harga "${price}" seharusnya ditolak`)
        if (!result.ok) assert.ok(result.errors.price)
    }
})
