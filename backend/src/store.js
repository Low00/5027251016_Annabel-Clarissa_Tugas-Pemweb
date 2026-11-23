import { mkdir, readFile, rename, writeFile } from "node:fs/promises"
import { dirname } from "node:path"

// Penyimpanan produk. Dengan `filePath`, data ditulis ke berkas JSON agar tetap
// ada setelah server dimatikan. Tanpa `filePath`, data hanya di memori (untuk tes).
export async function createStore({ filePath = null, seed = { nextId: 1, products: [] } } = {}) {
    const state = await load(filePath, seed)
    let writeQueue = Promise.resolve()

    // Penulisan diantrekan agar berkas tidak rusak saat ada beberapa request sekaligus.
    function persist() {
        if (!filePath) return Promise.resolve()
        const snapshot = JSON.stringify(state, null, 4)
        writeQueue = writeQueue.then(async () => {
            const tempPath = `${filePath}.tmp`
            await writeFile(tempPath, snapshot)
            await rename(tempPath, filePath)
        })
        return writeQueue
    }

    await persist()

    return {
        list(query = "") {
            const keyword = query.trim().toLowerCase()
            if (!keyword) return [...state.products]
            return state.products.filter((product) =>
                product.name.toLowerCase().includes(keyword),
            )
        },

        get(id) {
            return state.products.find((product) => product.id === id) ?? null
        },

        async create({ name, price }) {
            const product = { id: state.nextId, name, price }
            state.nextId += 1
            state.products.push(product)
            await persist()
            return product
        },

        async update({ id, name, price }) {
            const index = state.products.findIndex((product) => product.id === id)
            if (index === -1) return null
            state.products[index] = { id, name, price }
            await persist()
            return state.products[index]
        },

        async remove(id) {
            const index = state.products.findIndex((product) => product.id === id)
            if (index === -1) return null
            const [deleted] = state.products.splice(index, 1)
            await persist()
            return deleted
        },
    }
}

async function load(filePath, seed) {
    if (!filePath) return structuredClone(seed)

    await mkdir(dirname(filePath), { recursive: true })
    let raw
    try {
        raw = await readFile(filePath, "utf8")
    } catch (error) {
        if (error.code === "ENOENT") return structuredClone(seed)
        throw error
    }

    const data = JSON.parse(raw)
    if (!Array.isArray(data.products) || !Number.isInteger(data.nextId)) {
        throw new Error(`Format berkas data tidak valid: ${filePath}`)
    }
    return data
}
