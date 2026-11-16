import { useState } from "react"
import { TbPlus } from "react-icons/tb"
import type { Product, ProductValues } from "../../../types/product"
import { initialProducts } from "../../../data/product/initial-products.ts"
import {
    addProduct,
    filterProducts,
    removeProduct,
    updateProduct,
} from "../../../utils/productList.ts"
import Button from "../../atoms/Button"
import SearchField from "../../molecules/SearchField"
import DeleteProductDialog from "../../organisms/DeleteProductDialog"
import ProductFormDialog from "../../organisms/ProductFormDialog"
import ProductGrid from "../../organisms/ProductGrid"
import styles from "./styles.module.css"

type DialogState =
    | { type: "add" }
    | { type: "edit"; product: Product }
    | { type: "delete"; product: Product }
    | null

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>(initialProducts)
    const [query, setQuery] = useState("")
    const [notice, setNotice] = useState("")
    const [dialog, setDialog] = useState<DialogState>(null)

    const visibleProducts = filterProducts(products, query)

    function openDialog(next: DialogState) {
        setNotice("")
        setDialog(next)
    }

    function closeDialog() {
        setDialog(null)
    }

    function handleCreate(values: ProductValues) {
        setProducts((current) => addProduct(current, values))
        setNotice(`Produk "${values.name}" berhasil ditambahkan.`)
        closeDialog()
    }

    function handleUpdate(id: number, values: ProductValues) {
        setProducts((current) => updateProduct(current, id, values))
        setNotice(`Produk "${values.name}" berhasil diperbarui.`)
        closeDialog()
    }

    function handleDelete(product: Product) {
        setProducts((current) => removeProduct(current, product.id))
        setNotice(`Produk "${product.name}" berhasil dihapus.`)
        closeDialog()
    }

    return (
        <>
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>Manajemen Produk</h1>
                    <p className={styles.description}>
                        Kelola daftar produk dan harga dalam satu tempat.
                    </p>
                </div>
                <Button onClick={() => openDialog({ type: "add" })}>
                    <TbPlus aria-hidden="true" className="size-5" />
                    Tambah Produk
                </Button>
            </header>

            <div className={styles.toolbar}>
                <SearchField value={query} onChange={setQuery} />
                <p className={styles.count}>{products.length} produk</p>
            </div>

            {notice && (
                <p role="status" className={styles.success}>
                    {notice}
                </p>
            )}

            <section aria-label="Daftar produk">
                {products.length === 0 && (
                    <p className={styles.notice}>
                        Belum ada produk. Klik Tambah Produk untuk membuat
                        produk pertama.
                    </p>
                )}
                {products.length > 0 && visibleProducts.length === 0 && (
                    <p className={styles.notice}>
                        Tidak ada produk dengan nama "{query.trim()}".
                    </p>
                )}
                <ProductGrid
                    products={visibleProducts}
                    onEdit={(product) => openDialog({ type: "edit", product })}
                    onDelete={(product) =>
                        openDialog({ type: "delete", product })
                    }
                />
            </section>

            {products.length > 0 && (
                <p className={styles.footer}>
                    Menampilkan {visibleProducts.length} dari {products.length}{" "}
                    produk
                </p>
            )}

            {dialog?.type === "add" && (
                <ProductFormDialog
                    onSubmit={handleCreate}
                    onClose={closeDialog}
                />
            )}
            {dialog?.type === "edit" && (
                <ProductFormDialog
                    product={dialog.product}
                    onSubmit={(values) => handleUpdate(dialog.product.id, values)}
                    onClose={closeDialog}
                />
            )}
            {dialog?.type === "delete" && (
                <DeleteProductDialog
                    product={dialog.product}
                    onConfirm={() => handleDelete(dialog.product)}
                    onClose={closeDialog}
                />
            )}
        </>
    )
}
