import { test } from "node:test"
import assert from "node:assert/strict"
import ProductRemote, { ApiError } from "../src/data/product/source/product-remote.ts"
import ProductRepository from "../src/data/product/repository/product-repository.ts"
import ProductListParam from "../src/data/product/param/product-list-param.ts"
import ProductModel from "../src/data/product/model/product-model.ts"

const sample = { id: 1, name: " Pulpen ", price: 5000 }

// Stub untuk operasi yang tidak dipakai pada sebuah tes.
const unused = async (): Promise<unknown> => {
    throw new Error("Tidak dipakai pada tes ini.")
}
const noRemote = {
    getProductListRemote: unused,
    getProductRemote: unused,
    createProductRemote: unused,
    updateProductRemote: unused,
    deleteProductRemote: unused,
}

test("model membersihkan nama dan menolak data tidak valid", () => {
    assert.equal(ProductModel.fromResponse(sample).getName(), "Pulpen")
    for (const bad of [
        null,
        { id: 0, name: "A", price: 1 },
        { id: 1, name: " ", price: 1 },
        { id: 1, name: "A", price: 0 },
        { id: 1, name: "A", price: 1.5 },
        { id: "1", name: "A", price: 1 },
    ]) {
        assert.throws(() => ProductModel.fromResponse(bad), TypeError)
    }
})

test("parameter pencarian dikirim sebagai q", () => {
    assert.equal(new ProductListParam({ query: " pen " }).toQueryString(), "q=pen")
    assert.equal(new ProductListParam().toQueryString(), "")
})

test("repository memetakan daftar dan menolak response bukan array", async () => {
    const ok = ProductRepository({
        ...noRemote,
        getProductListRemote: async () => [sample],
    })
    assert.deepEqual((await ok.getProductList()).map((m) => m.toJSON()), [
        { id: 1, name: "Pulpen", price: 5000 },
    ])

    const notArray = ProductRepository({
        ...noRemote,
        getProductListRemote: async () => ({}),
    })
    await assert.rejects(notArray.getProductList(), TypeError)

    const duplicate = ProductRepository({
        ...noRemote,
        getProductListRemote: async () => [sample, sample],
    })
    await assert.rejects(duplicate.getProductList(), /unik/)
})

test("remote menolak baseUrl kosong dan protokol selain http(s)", async () => {
    await assert.rejects(ProductRemote().getProductListRemote(), /VITE_API_BASE_URL/)
    await assert.rejects(
        ProductRemote({ baseUrl: "file:///etc" }).getProductListRemote(),
        /http atau https/,
    )
})

test("GET daftar dan detail memakai URL yang benar", async () => {
    const urls: string[] = []
    const source = ProductRemote({
        baseUrl: "http://localhost:3000/",
        fetchImpl: async (url) => {
            urls.push(String(url))
            return Response.json([])
        },
    })
    await source.getProductListRemote(new ProductListParam({ query: "buku" }))
    await source.getProductRemote(7)
    assert.deepEqual(urls, [
        "http://localhost:3000/products?q=buku",
        "http://localhost:3000/products/7",
    ])
})

test("POST, PUT, dan DELETE memakai method, URL, dan body sesuai backend", async () => {
    const calls: { url: string; method?: string; body?: unknown }[] = []
    const source = ProductRemote({
        baseUrl: "http://localhost:3000",
        fetchImpl: async (url, options) => {
            calls.push({
                url: String(url),
                method: options?.method,
                body: options?.body ? JSON.parse(String(options.body)) : undefined,
            })
            return Response.json({ id: 7, name: "Buku", price: 15000 })
        },
    })
    const repository = ProductRepository(source)

    const created = await repository.createProduct({ name: "Buku", price: 15000 })
    assert.equal(created.getId(), 7)
    await repository.updateProduct({ id: 7, name: "Buku", price: 15000 })
    await repository.deleteProduct(7)
    assert.equal((await repository.getProduct(7)).getName(), "Buku")

    assert.deepEqual(calls, [
        { url: "http://localhost:3000/products", method: "POST", body: { name: "Buku", price: 15000 } },
        { url: "http://localhost:3000/products", method: "PUT", body: { id: 7, name: "Buku", price: 15000 } },
        { url: "http://localhost:3000/products/7", method: "DELETE", body: undefined },
        { url: "http://localhost:3000/products/7", method: "GET", body: undefined },
    ])
})

test("error backend menjadi ApiError berisi status dan pesan", async () => {
    const source = ProductRemote({
        baseUrl: "http://localhost:3000",
        fetchImpl: async () =>
            Response.json({ message: "Produk tidak ditemukan" }, { status: 404 }),
    })
    await assert.rejects(source.getProductRemote(99), (error: unknown) => {
        assert.ok(error instanceof ApiError)
        assert.equal(error.status, 404)
        assert.match(error.message, /HTTP 404\): Produk tidak ditemukan/)
        return true
    })
})

test("body error non-JSON tetap menghasilkan pesan dengan status", async () => {
    const source = ProductRemote({
        baseUrl: "http://localhost:3000",
        fetchImpl: async () => new Response("error", { status: 500 }),
    })
    await assert.rejects(source.getProductListRemote(), /HTTP 500/)
})

test("server mati menghasilkan pesan yang jelas", async () => {
    const source = ProductRemote({
        baseUrl: "http://localhost:3000",
        fetchImpl: async () => {
            throw new TypeError("fetch failed")
        },
    })
    await assert.rejects(source.getProductListRemote(), /server tidak dapat dihubungi/)
})
