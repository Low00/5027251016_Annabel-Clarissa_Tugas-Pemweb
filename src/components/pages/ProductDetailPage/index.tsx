import { useEffect, useState } from "react"
import { TbArrowLeft, TbPackage } from "react-icons/tb"
import { useParams } from "react-router"
import { productRepository } from "../../../data/product"
import { ApiError } from "../../../data/product/source/product-remote.ts"
import type { Product } from "../../../types/product"
import { formatRupiah } from "../../../utils/formatRupiah"
import Button from "../../atoms/Button"
import ButtonLink from "../../atoms/ButtonLink"
import Alert from "../../molecules/Alert"
import StatusPanel from "../../molecules/StatusPanel"

// Hasil permintaan untuk satu id; `attempt` berubah saat pengguna menekan "Coba lagi".
type Result = { id: number; attempt: number } & (
    | { status: "found"; product: Product }
    | { status: "not-found" }
    | { status: "error"; message: string }
)

export default function ProductDetailPage() {
    const { id: idParam } = useParams()
    const id = Number(idParam)
    const hasValidId = Number.isSafeInteger(id) && id > 0

    const [result, setResult] = useState<Result | null>(null)
    const [attempt, setAttempt] = useState(0)

    useEffect(() => {
        if (!hasValidId) return
        let ignore = false
        productRepository
            .getProduct(id)
            .then((model) => {
                if (!ignore)
                    setResult({ id, attempt, status: "found", product: model.toJSON() })
            })
            .catch((reason: unknown) => {
                if (ignore) return
                if (reason instanceof ApiError && reason.status === 404) {
                    setResult({ id, attempt, status: "not-found" })
                    return
                }
                setResult({
                    id,
                    attempt,
                    status: "error",
                    message:
                        reason instanceof Error
                            ? reason.message
                            : "Gagal memuat detail produk.",
                })
            })
        return () => {
            ignore = true
        }
    }, [id, hasValidId, attempt])

    const backLink = (
        <ButtonLink to="/products" variant="outline">
            <TbArrowLeft aria-hidden="true" className="size-5" />
            Kembali ke daftar produk
        </ButtonLink>
    )

    const notFound = (
        <StatusPanel
            icon={<TbPackage />}
            title="Produk tidak ditemukan"
            description={
                hasValidId
                    ? `Produk dengan ID ${id} tidak ada. Mungkin sudah dihapus atau ID pada URL salah.`
                    : "ID pada URL harus berupa angka bulat positif."
            }
        >
            {backLink}
        </StatusPanel>
    )

    if (!hasValidId) return notFound

    const current = result?.id === id && result.attempt === attempt ? result : null

    if (!current) {
        return <p className="text-sm text-slate-600">Memuat detail produk…</p>
    }
    if (current.status === "not-found") return notFound
    if (current.status === "error") {
        return (
            <div className="space-y-4">
                <Alert
                    tone="error"
                    action={
                        <Button variant="secondary" onClick={() => setAttempt((n) => n + 1)}>
                            Coba lagi
                        </Button>
                    }
                >
                    {current.message}
                </Alert>
                <div>{backLink}</div>
            </div>
        )
    }

    const { product } = current
    return (
        <>
            <div className="mb-6">{backLink}</div>
            <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <p className="text-sm font-semibold text-slate-500">
                    Detail Produk · ID: {product.id}
                </p>
                <h1 className="mt-2 text-3xl font-bold tracking-tight wrap-break-word text-slate-900">
                    {product.name}
                </h1>
                <dl className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-lg bg-slate-50 p-4">
                        <dt className="text-sm text-slate-500">Harga</dt>
                        <dd className="mt-1 text-2xl font-bold text-blue-600">
                            {formatRupiah(product.price)}
                        </dd>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-4">
                        <dt className="text-sm text-slate-500">ID Produk</dt>
                        <dd className="mt-1 text-2xl font-bold text-slate-900">
                            {product.id}
                        </dd>
                    </div>
                </dl>
            </article>
        </>
    )
}
