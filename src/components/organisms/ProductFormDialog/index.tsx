import { useState, type FormEvent } from "react"
import type { Product, ProductValues } from "../../../types/product"
import {
    validateProductForm,
    type ProductFormErrors,
} from "../../../utils/validateProductForm"
import Button from "../../atoms/Button"
import TextField from "../../atoms/TextField"
import Modal from "../../molecules/Modal"
import styles from "./styles.module.css"

type Props = {
    // Without a product the dialog creates one; with a product it edits it.
    product?: Product
    onSubmit: (values: ProductValues) => void
    onClose: () => void
}

export default function ProductFormDialog({
    product,
    onSubmit,
    onClose,
}: Props) {
    const isEdit = product !== undefined
    const [name, setName] = useState(product?.name ?? "")
    const [price, setPrice] = useState(product ? String(product.price) : "")
    const [errors, setErrors] = useState<ProductFormErrors>({})

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        const result = validateProductForm({ name, price })
        if (!result.ok) {
            setErrors(result.errors)
            return
        }
        setErrors({})
        onSubmit(result.values)
    }

    return (
        <Modal
            title={isEdit ? "Edit Produk" : "Tambah Produk"}
            description={
                isEdit
                    ? "Perbarui informasi produk yang dipilih."
                    : "Masukkan informasi produk baru."
            }
            onClose={onClose}
        >
            <form onSubmit={handleSubmit} noValidate className={styles.form}>
                {isEdit && <p className={styles.id}>ID: {product.id}</p>}
                <TextField
                    label="Nama Produk"
                    name="name"
                    placeholder="Contoh: Pulpen"
                    autoComplete="off"
                    value={name}
                    error={errors.name}
                    onChange={(event) => setName(event.target.value)}
                    data-autofocus
                />
                <TextField
                    label="Harga (Rp)"
                    name="price"
                    placeholder="Contoh: 5000"
                    inputMode="numeric"
                    autoComplete="off"
                    value={price}
                    hint="Harga harus lebih dari 0."
                    error={errors.price}
                    onChange={(event) => setPrice(event.target.value)}
                />
                <div className={styles.actions}>
                    <Button variant="outline" onClick={onClose}>
                        Batal
                    </Button>
                    <Button type="submit">
                        {isEdit ? "Simpan Perubahan" : "Simpan Produk"}
                    </Button>
                </div>
            </form>
        </Modal>
    )
}
