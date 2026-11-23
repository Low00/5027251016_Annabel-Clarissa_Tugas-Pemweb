import { test } from "node:test"
import assert from "node:assert/strict"
import { mkdtemp, readFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { createApp } from "../src/app.js"
import { createStore } from "../src/store.js"

const seed = {
    nextId: 3,
    products: [
        { id: 1, name: "Pulpen", price: 5000 },
        { id: 2, name: "Buku Tulis", price: 12000 },
    ],
}

async function withServer(run, { store } = {}) {
    const usedStore = store ?? (await createStore({ seed }))
    const app = createApp({ store: usedStore, allowedOrigins: ["http://localhost:5173"] })
    const server = await new Promise((resolve) => {
        const instance = app.listen(0, () => resolve(instance))
    })
    const base = `http://127.0.0.1:${server.address().port}`
    try {
        await run(base)
    } finally {
        await new Promise((resolve) => server.close(resolve))
    }
}

const json = (body) => ({
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
})

test("GET /products mengembalikan daftar dan mendukung ?q=", async () => {
    await withServer(async (base) => {
        const all = await fetch(`${base}/products`)
        assert.equal(all.status, 200)
        assert.equal((await all.json()).length, 2)
        const filtered = await (await fetch(`${base}/products?q=BUKU`)).json()
        assert.deepEqual(filtered.map((p) => p.id), [2])
    })
})

test("GET /products/:id: ditemukan, tidak ada, dan id tidak valid", async () => {
    await withServer(async (base) => {
        const ok = await fetch(`${base}/products/2`)
        assert.equal(ok.status, 200)
        assert.equal((await ok.json()).name, "Buku Tulis")
        const missing = await fetch(`${base}/products/99`)
        assert.equal(missing.status, 404)
        assert.equal((await missing.json()).message, "Produk tidak ditemukan")
        assert.equal((await fetch(`${base}/products/abc`)).status, 400)
        assert.equal((await fetch(`${base}/products/0`)).status, 400)
    })
})

test("POST membuat produk dengan id baru dan menolak data tidak valid", async () => {
    await withServer(async (base) => {
        const created = await fetch(`${base}/products`, {
            method: "POST",
            ...json({ name: "  Spidol ", price: 8000 }),
        })
        assert.equal(created.status, 201)
        assert.deepEqual(await created.json(), { id: 3, name: "Spidol", price: 8000 })
        for (const bad of [
            {},
            { name: "", price: 1000 },
            { name: "A", price: 0 },
            { name: "A", price: -5 },
            { name: "A", price: 1.5 },
            { name: "A", price: "1000" },
        ]) {
            const response = await fetch(`${base}/products`, { method: "POST", ...json(bad) })
            assert.equal(response.status, 400, JSON.stringify(bad))
        }
        assert.equal((await (await fetch(`${base}/products`)).json()).length, 3)
    })
})

test("PUT mengubah produk, 404 jika tidak ada, 400 jika id atau body salah", async () => {
    await withServer(async (base) => {
        const updated = await fetch(`${base}/products`, {
            method: "PUT",
            ...json({ id: 2, name: "Buku", price: 15000 }),
        })
        assert.equal(updated.status, 200)
        assert.deepEqual(await updated.json(), { id: 2, name: "Buku", price: 15000 })
        const missing = await fetch(`${base}/products`, {
            method: "PUT",
            ...json({ id: 99, name: "X", price: 1 }),
        })
        assert.equal(missing.status, 404)
        const noId = await fetch(`${base}/products`, { method: "PUT", ...json({ name: "X", price: 1 }) })
        assert.equal(noId.status, 400)
        const badPrice = await fetch(`${base}/products`, {
            method: "PUT",
            ...json({ id: 1, name: "X", price: 0 }),
        })
        assert.equal(badPrice.status, 400)
    })
})

test("DELETE menghapus produk dan id tidak dipakai ulang", async () => {
    await withServer(async (base) => {
        const deleted = await fetch(`${base}/products/2`, { method: "DELETE" })
        assert.equal(deleted.status, 200)
        assert.equal((await deleted.json()).data.name, "Buku Tulis")
        assert.equal((await fetch(`${base}/products/2`, { method: "DELETE" })).status, 404)
        assert.equal((await fetch(`${base}/products/abc`, { method: "DELETE" })).status, 400)
        const created = await fetch(`${base}/products`, {
            method: "POST",
            ...json({ name: "Baru", price: 1000 }),
        })
        assert.equal((await created.json()).id, 3)
    })
})

test("CORS: origin frontend diizinkan, origin lain tidak, preflight dijawab", async () => {
    await withServer(async (base) => {
        const allowed = await fetch(`${base}/products`, {
            headers: { Origin: "http://localhost:5173" },
        })
        assert.equal(allowed.headers.get("access-control-allow-origin"), "http://localhost:5173")
        const other = await fetch(`${base}/products`, { headers: { Origin: "http://evil.example" } })
        assert.equal(other.headers.get("access-control-allow-origin"), null)
        const preflight = await fetch(`${base}/products`, {
            method: "OPTIONS",
            headers: {
                Origin: "http://localhost:5173",
                "Access-Control-Request-Method": "PUT",
            },
        })
        assert.equal(preflight.status, 204)
        assert.match(preflight.headers.get("access-control-allow-methods"), /PUT/)
    })
})

test("JSON rusak dan endpoint tidak dikenal menghasilkan pesan yang jelas", async () => {
    await withServer(async (base) => {
        const broken = await fetch(`${base}/products`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: "{rusak",
        })
        assert.equal(broken.status, 400)
        assert.equal((await broken.json()).message, "Body harus berupa JSON yang valid")
        assert.equal((await fetch(`${base}/tidak-ada`)).status, 404)
    })
})

test("data tersimpan ke berkas dan terbaca lagi setelah server dibuat ulang", async () => {
    const dir = await mkdtemp(join(tmpdir(), "produk-"))
    const filePath = join(dir, "products.json")

    const first = await createStore({ filePath, seed })
    await first.create({ name: "Stabilo", price: 7000 })
    await first.remove(1)

    const second = await createStore({ filePath, seed })
    assert.deepEqual(second.list().map((p) => p.name), ["Buku Tulis", "Stabilo"])
    assert.equal((await second.create({ name: "Lagi", price: 1 })).id, 4)

    const saved = JSON.parse(await readFile(filePath, "utf8"))
    assert.equal(saved.products.length, 3)
})
