import { useEffect, useState } from "react"
import { TbPlus } from "react-icons/tb"
import { productRepository } from "../../../data/product"
import type { Product, ProductValues } from "../../../types/product"
import { filterProducts } from "../../../utils/productList"
import Button from "../../atoms/Button"
import Alert from "../../molecules/Alert"
import SearchField from "../../molecules/SearchField"
import DeleteProductDialog from "../../organisms/DeleteProductDialog"
import ProductFormDialog from "../../organisms/ProductFormDialog"
import ProductGrid from "../../organisms/ProductGrid"

type DialogState =
    | { type: "add" }
    | { type: "edit"; product: Product }
    | { type: "delete"; product: Product }
    | null

function errorMessage(error: unknown, fallback: string) {
    return error instanceof Error ? error.message : fallback
}

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [loadError, setLoadError] = useState("")
    const [query, setQuery] = useState("")
    const [notice, setNotice] = useState("")
    const [dialog, setDialog] = useState<DialogState>(null)
    const [isSaving, setIsSaving] = useState(false)
    const [saveError, setSaveError] = useState("")

    const visibleProducts = filterProducts(products, query)

    // Muat daftar produk dari backend saat halaman dibuka.
    useEffect(() => {
        let ignore = false
        productRepository
            .getProductList()
            .then((models) => {
                if (!ignore) setProducts(models.map((model) => model.toJSON()))
            })
            .catch((error: unknown) => {
                if (!ignore)
                    setLoadError(errorMessage(error, "Gagal memuat produk."))
            })
            .finally(() => {
                if (!ignore) setIsLoading(false)
            })
        return () => {
            ignore = true
        }
    }, [])

    async function handleReload() {
        setIsLoading(true)
        setLoadError("")
        try {
            const models = await productRepository.getProductList()
            setProducts(models.map((model) => model.toJSON()))
        } catch (error) {
            setLoadError(errorMessage(error, "Gagal memuat produk."))
        } finally {
            setIsLoading(false)
        }
    }

    function openDialog(next: DialogState) {
        setSaveError("")
        setNotice("")
        setDialog(next)
    }

    function closeDialog() {
        setDialog(null)
    }

    async function handleCreate(values: ProductValues) {
        setIsSaving(true)
        setSaveError("")
        try {
            const created = (await productRepository.createProduct(values)).toJSON()
            setProducts((current) => [...current, created])
            setNotice(`Produk "${created.name}" berhasil ditambahkan.`)
            closeDialog()
        } catch (error) {
            setSaveError(errorMessage(error, "Gagal menambah produk."))
        } finally {
            setIsSaving(false)
        }
    }

    async function handleUpdate(id: number, values: ProductValues) {
        setIsSaving(true)
        setSaveError("")
        try {
            const updated = (
                await productRepository.updateProduct({ id, ...values })
            ).toJSON()
            setProducts((current) =>
                current.map((product) => (product.id === id ? updated : product)),
            )
            setNotice(`Produk "${updated.name}" berhasil diperbarui.`)
            closeDialog()
        } catch (error) {
            setSaveError(errorMessage(error, "Gagal menyimpan perubahan."))
        } finally {
            setIsSaving(false)
        }
    }

    async function handleDelete(product: Product) {
        setIsSaving(true)
        setSaveError("")
        try {
            await productRepository.deleteProduct(product.id)
            setProducts((current) => current.filter((item) => item.id !== product.id))
            setNotice(`Produk "${product.name}" berhasil dihapus.`)
            closeDialog()
        } catch (error) {
            setSaveError(errorMessage(error, "Gagal menghapus produk."))
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <>
            <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                        Manajemen Produk
                    </h1>
                    <p className="mt-2 text-slate-500">
                        Kelola daftar produk dan harga dalam satu tempat.
                    </p>
                </div>
                <Button onClick={() => openDialog({ type: "add" })}>
                    <TbPlus aria-hidden="true" className="size-5" />
                    Tambah Produk
                </Button>
            </header>

            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <SearchField value={query} onChange={setQuery} />
                <p className="text-sm text-slate-600">{products.length} produk</p>
            </div>

            <div className="space-y-4 empty:hidden">
                {notice && <Alert tone="success">{notice}</Alert>}
                {loadError && (
                    <Alert
                        tone="error"
                        action={
                            <Button
                                variant="secondary"
                                onClick={handleReload}
                                disabled={isLoading}
                            >
                                Coba lagi
                            </Button>
                        }
                    >
                        {loadError}
                    </Alert>
                )}
            </div>

            <section aria-label="Daftar produk" aria-busy={isLoading} className="mt-6">
                {isLoading && (
                    <p className="text-sm text-slate-600">Memuat produk…</p>
                )}
                {!isLoading && !loadError && products.length === 0 && (
                    <p className="text-sm leading-6 text-slate-600">
                        Belum ada produk. Klik Tambah Produk untuk membuat produk
                        pertama.
                    </p>
                )}
                {!isLoading && products.length > 0 && visibleProducts.length === 0 && (
                    <p className="text-sm text-slate-600">
                        Tidak ada produk dengan nama "{query.trim()}".
                    </p>
                )}
                <ProductGrid
                    products={visibleProducts}
                    onEdit={(product) => openDialog({ type: "edit", product })}
                    onDelete={(product) => openDialog({ type: "delete", product })}
                />
            </section>

            {!isLoading && products.length > 0 && (
                <p className="mt-6 text-sm text-slate-600">
                    Menampilkan {visibleProducts.length} dari {products.length} produk
                </p>
            )}

            {dialog?.type === "add" && (
                <ProductFormDialog
                    isSaving={isSaving}
                    error={saveError}
                    onSubmit={handleCreate}
                    onClose={closeDialog}
                />
            )}
            {dialog?.type === "edit" && (
                <ProductFormDialog
                    product={dialog.product}
                    isSaving={isSaving}
                    error={saveError}
                    onSubmit={(values) => handleUpdate(dialog.product.id, values)}
                    onClose={closeDialog}
                />
            )}
            {dialog?.type === "delete" && (
                <DeleteProductDialog
                    product={dialog.product}
                    isSaving={isSaving}
                    error={saveError}
                    onConfirm={() => handleDelete(dialog.product)}
                    onClose={closeDialog}
                />
            )}
        </>
    )
}
