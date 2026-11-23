import { readFile } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import { createApp } from "./app.js"
import { createStore } from "./store.js"

const PORT = Number(process.env.PORT) || 3000
const allowedOrigins = (process.env.CORS_ORIGIN || "http://127.0.0.1:5173,http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())

const dataDir = new URL("../data/", import.meta.url)
const seed = JSON.parse(
    await readFile(fileURLToPath(new URL("products.seed.json", dataDir)), "utf8"),
)
// products.json dibuat otomatis dari seed saat server pertama kali dijalankan.
const store = await createStore({
    filePath: fileURLToPath(new URL("products.json", dataDir)),
    seed,
})

createApp({ store, allowedOrigins }).listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`)
})
