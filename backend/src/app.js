import express from "express"

const isValidId = (id) => Number.isSafeInteger(id) && id > 0

const isValidBody = ({ name, price }) =>
    typeof name === "string" &&
    name.trim() !== "" &&
    Number.isSafeInteger(price) &&
    price > 0

const BODY_MESSAGE = "name (string) dan price (angka bulat > 0) wajib diisi"

// Mengizinkan frontend (Vite) memanggil API dari browser.
function cors(allowedOrigins) {
    return (req, res, next) => {
        const origin = req.headers.origin
        if (origin && allowedOrigins.includes(origin)) {
            res.setHeader("Access-Control-Allow-Origin", origin)
            res.setHeader("Vary", "Origin")
            res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS")
            res.setHeader("Access-Control-Allow-Headers", "Content-Type")
        }
        if (req.method === "OPTIONS") return res.sendStatus(204)
        next()
    }
}

export function createApp({ store, allowedOrigins = [] }) {
    const app = express()
    app.use(cors(allowedOrigins))
    app.use(express.json())

    // GET /products?q=kata  -> daftar produk (opsional difilter berdasarkan nama)
    app.get("/products", (req, res) => {
        const query = typeof req.query.q === "string" ? req.query.q : ""
        res.status(200).json(store.list(query))
    })

    // GET /products/:id  -> satu produk, 404 jika tidak ada
    app.get("/products/:id", (req, res) => {
        const id = Number(req.params.id)
        if (!isValidId(id)) {
            return res.status(400).json({ message: "id harus berupa angka bulat positif" })
        }
        const product = store.get(id)
        if (!product) return res.status(404).json({ message: "Produk tidak ditemukan" })
        res.status(200).json(product)
    })

    // POST /products  -> tambah produk
    app.post("/products", async (req, res) => {
        const body = req.body ?? {}
        if (!isValidBody(body)) return res.status(400).json({ message: BODY_MESSAGE })
        const created = await store.create({ name: body.name.trim(), price: body.price })
        res.status(201).json(created)
    })

    // PUT /products  -> ubah produk; id dikirim di body
    app.put("/products", async (req, res) => {
        const body = req.body ?? {}
        if (!isValidId(body.id)) {
            return res.status(400).json({ message: "id (angka bulat positif) wajib diisi di body" })
        }
        if (!isValidBody(body)) return res.status(400).json({ message: BODY_MESSAGE })
        const updated = await store.update({
            id: body.id,
            name: body.name.trim(),
            price: body.price,
        })
        if (!updated) return res.status(404).json({ message: "Produk tidak ditemukan" })
        res.status(200).json(updated)
    })

    // DELETE /products/:id  -> hapus produk
    app.delete("/products/:id", async (req, res) => {
        const id = Number(req.params.id)
        if (!isValidId(id)) {
            return res.status(400).json({ message: "id harus berupa angka bulat positif" })
        }
        const deleted = await store.remove(id)
        if (!deleted) return res.status(404).json({ message: "Produk tidak ditemukan" })
        res.status(200).json({ message: "Produk berhasil dihapus", data: deleted })
    })

    app.use((_req, res) => {
        res.status(404).json({ message: "Endpoint tidak ditemukan" })
    })

    // eslint-disable-next-line no-unused-vars
    app.use((error, _req, res, _next) => {
        if (error.type === "entity.parse.failed") {
            return res.status(400).json({ message: "Body harus berupa JSON yang valid" })
        }
        console.error(error)
        res.status(500).json({ message: "Terjadi kesalahan pada server" })
    })

    return app
}
