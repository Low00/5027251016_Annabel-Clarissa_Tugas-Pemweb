import { test, expect, type Page } from "@playwright/test"

type Item = { id: number; name: string; price: number }

// Backend palsu yang menyimpan data di memori dan meniru API Express.
async function mockApi(page: Page, initial: Item[]) {
    const items = [...initial]
    let nextId = Math.max(0, ...items.map((item) => item.id)) + 1

    await page.route(/127\.0\.0\.1:3001\/api\/products/, async (route) => {
        const request = route.request()
        const method = request.method()
        const idMatch = new URL(request.url()).pathname.match(/\/products\/(\d+)$/)
        const notFound = () =>
            route.fulfill({ status: 404, json: { message: "Produk tidak ditemukan" } })

        if (method === "GET" && idMatch) {
            const found = items.find((item) => item.id === Number(idMatch[1]))
            return found ? route.fulfill({ json: found }) : notFound()
        }
        if (method === "GET") return route.fulfill({ json: items })
        if (method === "POST") {
            const created = { id: nextId++, ...request.postDataJSON() }
            items.push(created)
            return route.fulfill({ status: 201, json: created })
        }
        if (method === "PUT") {
            const body = request.postDataJSON()
            const index = items.findIndex((item) => item.id === body.id)
            if (index === -1) return notFound()
            items[index] = body
            return route.fulfill({ json: body })
        }
        if (method === "DELETE" && idMatch) {
            const index = items.findIndex((item) => item.id === Number(idMatch[1]))
            if (index === -1) return notFound()
            const [deleted] = items.splice(index, 1)
            return route.fulfill({
                json: { message: "Produk berhasil dihapus", data: deleted },
            })
        }
        return route.fulfill({ status: 405, body: "" })
    })
}

const seed: Item[] = [
    { id: 1, name: "Pulpen", price: 5000 },
    { id: 2, name: "Buku Tulis", price: 12000 },
    { id: 3, name: "Spidol", price: 8000 },
]

test.describe("navigasi dan dashboard", () => {
    test("URL root diarahkan ke dashboard dan menampilkan ringkasan", async ({ page }) => {
        await mockApi(page, seed)
        await page.goto("/")
        await expect(page).toHaveURL(/\/dashboard$/)
        await expect(page.getByRole("heading", { name: "Dashboard", level: 1 })).toBeVisible()
        const summary = page.getByRole("region", { name: "Ringkasan produk" })
        await expect(summary).toContainText("3")
        await expect(summary).toContainText("Rp8.333")
        await expect(summary).toContainText("Rp5.000")
        await expect(summary).toContainText("Rp12.000")
    })

    test("sidebar berpindah halaman tanpa memuat ulang dan menandai menu aktif", async ({ page }) => {
        await mockApi(page, seed)
        await page.goto("/dashboard")
        const nav = page.getByRole("navigation", { name: "Navigasi utama" })
        await expect(nav.getByRole("link", { name: "Dashboard" })).toHaveAttribute("aria-current", "page")
        await nav.getByRole("link", { name: "Daftar Produk" }).click()
        await expect(page).toHaveURL(/\/products$/)
        await expect(nav.getByRole("link", { name: "Daftar Produk" })).toHaveAttribute("aria-current", "page")
        await expect(page.locator("article")).toHaveCount(3)
    })

    test("URL tidak terdaftar menampilkan halaman 404 dengan tautan kembali", async ({ page }) => {
        await mockApi(page, seed)
        await page.goto("/halaman-tidak-ada")
        await expect(page.getByRole("heading", { name: "Halaman tidak ditemukan" })).toBeVisible()
        await page.getByRole("link", { name: "Ke Daftar Produk" }).click()
        await expect(page).toHaveURL(/\/products$/)
        await page.goto("/produk/xyz")
        await page.getByRole("link", { name: "Ke Dashboard" }).click()
        await expect(page).toHaveURL(/\/dashboard$/)
    })
})

test.describe("detail produk", () => {
    test("klik produk membuka detail sesuai id lalu bisa kembali", async ({ page }) => {
        await mockApi(page, seed)
        await page.goto("/products")
        await page.getByRole("link", { name: "Buku Tulis", exact: true }).click()
        await expect(page).toHaveURL(/\/products\/2$/)
        await expect(page.getByRole("heading", { name: "Buku Tulis", level: 1 })).toBeVisible()
        await expect(page.getByText("Rp12.000")).toBeVisible()
        await page.getByRole("link", { name: "Kembali ke daftar produk" }).click()
        await expect(page).toHaveURL(/\/products$/)
    })

    test("id yang tidak ada menampilkan pesan produk tidak ditemukan", async ({ page }) => {
        await mockApi(page, seed)
        await page.goto("/products/999")
        await expect(page.getByRole("heading", { name: "Produk tidak ditemukan" })).toBeVisible()
        await expect(page.getByRole("link", { name: "Kembali ke daftar produk" })).toBeVisible()
    })

    test("id bukan angka menampilkan pesan yang sama tanpa request", async ({ page }) => {
        await mockApi(page, seed)
        await page.goto("/products/abc")
        await expect(page.getByRole("heading", { name: "Produk tidak ditemukan" })).toBeVisible()
        await expect(page.getByText("angka bulat positif")).toBeVisible()
    })
})

test.describe("pengelolaan produk lewat API", () => {
    test("daftar, jumlah, dan pencarian", async ({ page }) => {
        await mockApi(page, seed)
        await page.goto("/products")
        await expect(page.locator("article")).toHaveCount(3)
        await expect(page.getByText("3 produk", { exact: true })).toBeVisible()
        await page.getByLabel("Cari nama produk").fill("buku")
        await expect(page.locator("article")).toHaveCount(1)
        await expect(page.getByText("Menampilkan 1 dari 3 produk")).toBeVisible()
        await page.getByLabel("Cari nama produk").fill("zzz")
        await expect(page.getByText(/Tidak ada produk dengan nama/)).toBeVisible()
    })

    test("tambah produk: validasi lalu berhasil", async ({ page }) => {
        await mockApi(page, seed)
        await page.goto("/products")
        await page.getByRole("button", { name: "Tambah Produk" }).click()
        const dialog = page.getByRole("dialog", { name: "Tambah Produk" })
        await dialog.getByRole("button", { name: "Simpan Produk" }).click()
        await expect(dialog.getByText("Nama produk wajib diisi.")).toBeVisible()
        await dialog.getByLabel("Nama Produk").fill("Penggaris")
        await dialog.getByLabel("Harga (Rp)").fill("0")
        await dialog.getByRole("button", { name: "Simpan Produk" }).click()
        await expect(dialog.getByRole("alert")).toContainText("lebih dari 0")
        await dialog.getByLabel("Harga (Rp)").fill("6000")
        await dialog.getByRole("button", { name: "Simpan Produk" }).click()
        await expect(dialog).toBeHidden()
        await expect(page.locator("article")).toHaveCount(4)
        await expect(page.getByRole("status")).toContainText("berhasil ditambahkan")
    })

    test("edit produk memperbarui kartu dan data tersimpan di API", async ({ page }) => {
        await mockApi(page, seed)
        await page.goto("/products")
        await page.getByRole("button", { name: "Edit Buku Tulis" }).click()
        const dialog = page.getByRole("dialog", { name: "Edit Produk" })
        await expect(dialog.getByLabel("Nama Produk")).toHaveValue("Buku Tulis")
        await dialog.getByLabel("Harga (Rp)").fill("15000")
        await dialog.getByRole("button", { name: "Simpan Perubahan" }).click()
        await expect(dialog).toBeHidden()
        await expect(page.getByText("Rp15.000")).toBeVisible()
        await page.reload()
        await expect(page.getByText("Rp15.000")).toBeVisible()
    })

    test("hapus produk meminta konfirmasi dan bisa dibatalkan", async ({ page }) => {
        await mockApi(page, seed)
        await page.goto("/products")
        await page.getByRole("button", { name: "Hapus Spidol" }).click()
        const dialog = page.getByRole("dialog", { name: "Hapus Produk?" })
        await dialog.getByRole("button", { name: "Batal" }).click()
        await expect(page.locator("article")).toHaveCount(3)
        await page.getByRole("button", { name: "Hapus Spidol" }).click()
        await dialog.getByRole("button", { name: "Hapus Produk" }).click()
        await expect(dialog).toBeHidden()
        await expect(page.locator("article")).toHaveCount(2)
        await page.reload()
        await expect(page.locator("article")).toHaveCount(2)
    })

    test("error API saat memuat ditampilkan dengan tombol coba lagi", async ({ page }) => {
        await page.route(/127\.0\.0\.1:3001\/api\/products/, (route) =>
            route.fulfill({ status: 500, body: "error" }),
        )
        await page.goto("/products")
        await expect(page.getByRole("alert")).toContainText("HTTP 500")
        await expect(page.getByRole("button", { name: "Coba lagi" })).toBeVisible()
    })
})

for (const width of [390, 1440]) {
    for (const path of ["/dashboard", "/products", "/products/2", "/tidak-ada"]) {
        test(`tata letak ${path} tidak overflow pada ${width}px`, async ({ page }) => {
            await page.setViewportSize({ width, height: 900 })
            await mockApi(page, seed)
            await page.goto(path)
            await expect(page.getByRole("navigation", { name: "Navigasi utama" })).toBeVisible()
            await page.waitForLoadState("networkidle")
            expect(
                await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
            ).toBe(true)
            await page.screenshot({
                path: `test-results/${path.replaceAll("/", "_") || "root"}-${width}.png`,
                fullPage: true,
            })
        })
    }
}
