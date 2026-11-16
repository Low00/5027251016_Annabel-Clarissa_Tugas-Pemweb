import { test, expect } from "@playwright/test"

test("halaman menampilkan 5 produk awal beserta jumlahnya", async ({ page }) => {
    await page.goto("/")
    await expect(page).toHaveURL(/\/products$/)
    await expect(page.locator("article")).toHaveCount(5)
    await expect(page.getByText("5 produk", { exact: true })).toBeVisible()
    await expect(page.getByText("Menampilkan 5 dari 5 produk")).toBeVisible()
})

test("pencarian memfilter produk dan menampilkan hasil kosong", async ({
    page,
}) => {
    await page.goto("/products")
    await page.getByLabel("Cari nama produk").fill("buku")
    await expect(page.locator("article")).toHaveCount(1)
    await expect(page.getByText("Menampilkan 1 dari 5 produk")).toBeVisible()
    await page.getByLabel("Cari nama produk").fill("zzz")
    await expect(page.locator("article")).toHaveCount(0)
    await expect(page.getByText(/Tidak ada produk dengan nama/)).toBeVisible()
})

test("tambah produk: validasi lalu berhasil", async ({ page }) => {
    await page.goto("/products")
    await page.getByRole("button", { name: "Tambah Produk" }).click()
    const dialog = page.getByRole("dialog", { name: "Tambah Produk" })
    await dialog.getByRole("button", { name: "Simpan Produk" }).click()
    await expect(dialog.getByText("Nama produk wajib diisi.")).toBeVisible()
    await dialog.getByLabel("Nama Produk").fill("Stabilo")
    await dialog.getByLabel("Harga (Rp)").fill("0")
    await dialog.getByRole("button", { name: "Simpan Produk" }).click()
    await expect(dialog.getByRole("alert")).toContainText("lebih dari 0")
    await dialog.getByLabel("Harga (Rp)").fill("7000")
    await dialog.getByRole("button", { name: "Simpan Produk" }).click()
    await expect(dialog).toBeHidden()
    await expect(page.locator("article")).toHaveCount(6)
    await expect(page.getByRole("heading", { name: "Stabilo" })).toBeVisible()
    await expect(page.getByRole("status")).toContainText("berhasil ditambahkan")
})

test("edit produk memperbarui kartu", async ({ page }) => {
    await page.goto("/products")
    await page.getByRole("button", { name: "Edit Buku Tulis" }).click()
    const dialog = page.getByRole("dialog", { name: "Edit Produk" })
    await expect(dialog.getByText("ID: 2")).toBeVisible()
    await expect(dialog.getByLabel("Nama Produk")).toHaveValue("Buku Tulis")
    await dialog.getByLabel("Harga (Rp)").fill("15000")
    await dialog.getByRole("button", { name: "Simpan Perubahan" }).click()
    await expect(dialog).toBeHidden()
    await expect(page.getByText("Rp15.000")).toBeVisible()
})

test("hapus produk meminta konfirmasi dan bisa dibatalkan", async ({ page }) => {
    await page.goto("/products")
    await page.getByRole("button", { name: "Hapus Spidol" }).click()
    const dialog = page.getByRole("dialog", { name: "Hapus Produk?" })
    await dialog.getByRole("button", { name: "Batal" }).click()
    await expect(page.locator("article")).toHaveCount(5)
    await page.getByRole("button", { name: "Hapus Spidol" }).click()
    await dialog.getByRole("button", { name: "Hapus Produk" }).click()
    await expect(dialog).toBeHidden()
    await expect(page.locator("article")).toHaveCount(4)
    await expect(page.getByRole("heading", { name: "Spidol" })).toHaveCount(0)
})

for (const width of [390, 1440]) {
    test(`tata letak tidak overflow pada ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 })
        await page.goto("/products")
        await expect(page.locator("article")).toHaveCount(5)
        expect(
            await page.evaluate(
                () => document.documentElement.scrollWidth <= innerWidth,
            ),
        ).toBe(true)
        await page.screenshot({
            path: `test-results/produk-${width}.png`,
            fullPage: true,
        })
    })
}
