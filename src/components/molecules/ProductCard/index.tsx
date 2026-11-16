import type { Product } from "../../../types/product"
import Button from "../../atoms/Button"
import { formatRupiah } from "../../../utils/formatRupiah"
import styles from "./styles.module.css"

type Props = {
    product: Product
    onEdit: (product: Product) => void
    onDelete: (product: Product) => void
}

export default function ProductCard({ product, onEdit, onDelete }: Props) {
    return (
        <article className={styles.card}>
            <p className={styles.id}>ID: {product.id}</p>
            <h2 className={styles.name}>{product.name}</h2>
            <p className={styles.price}>{formatRupiah(product.price)}</p>
            <div className={styles.actions}>
                <Button
                    variant="outline"
                    aria-label={`Edit ${product.name}`}
                    onClick={() => onEdit(product)}
                >
                    Edit
                </Button>
                <Button
                    variant="outlineDanger"
                    aria-label={`Hapus ${product.name}`}
                    onClick={() => onDelete(product)}
                >
                    Hapus
                </Button>
            </div>
        </article>
    )
}
