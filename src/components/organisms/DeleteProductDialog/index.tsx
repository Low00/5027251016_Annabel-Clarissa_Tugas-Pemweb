import { TbTrash } from "react-icons/tb"
import type { Product } from "../../../types/product"
import { formatRupiah } from "../../../utils/formatRupiah"
import Button from "../../atoms/Button"
import Modal from "../../molecules/Modal"
import styles from "./styles.module.css"

type Props = {
    product: Product
    onConfirm: () => void
    onClose: () => void
}

export default function DeleteProductDialog({
    product,
    onConfirm,
    onClose,
}: Props) {
    return (
        <Modal
            title="Hapus Produk?"
            description="Produk yang dihapus tidak dapat dikembalikan."
            icon={
                <span className={styles.icon}>
                    <TbTrash aria-hidden="true" className={styles.iconSvg} />
                </span>
            }
            centered
            onClose={onClose}
        >
            <div className={styles.summary}>
                <p className={styles.id}>ID: {product.id}</p>
                <p className={styles.name}>{product.name}</p>
                <p className={styles.price}>{formatRupiah(product.price)}</p>
            </div>
            <div className={styles.actions}>
                <Button variant="outline" onClick={onClose} data-autofocus>
                    Batal
                </Button>
                <Button variant="danger" onClick={onConfirm}>
                    Hapus Produk
                </Button>
            </div>
        </Modal>
    )
}
