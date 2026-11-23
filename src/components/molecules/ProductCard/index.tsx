import { Link } from "react-router"
import type { Product } from "../../../types/product"
import Button from "../../atoms/Button"
import { formatRupiah } from "../../../utils/formatRupiah"

type Props = {
    product: Product
    onEdit: (product: Product) => void
    onDelete: (product: Product) => void
}

export default function ProductCard({ product, onEdit, onDelete }: Props) {
    return (
        <article className="min-w-0 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
            <p className="text-xs font-semibold text-slate-500">ID: {product.id}</p>
            <h2 className="mt-2 text-xl font-bold wrap-break-word text-slate-900">
                <Link
                    to={`/products/${product.id}`}
                    className="hover:text-blue-700 hover:underline"
                >
                    {product.name}
                </Link>
            </h2>
            <p className="mt-1 text-2xl font-bold wrap-break-word text-blue-600">
                {formatRupiah(product.price)}
            </p>
            <Link
                to={`/products/${product.id}`}
                aria-label={`Lihat detail ${product.name}`}
                className="mt-2 mb-5 inline-block text-sm font-semibold text-slate-600 hover:text-blue-700 hover:underline"
            >
                Lihat detail →
            </Link>
            <div className="grid grid-cols-2 gap-3">
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
