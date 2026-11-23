import { useEffect, useState } from "react"
import { TbArrowDown, TbArrowUp, TbChartBar, TbPackage } from "react-icons/tb"
import { productRepository } from "../../../data/product"
import type { Product } from "../../../types/product"
import { formatRupiah } from "../../../utils/formatRupiah"
import { summarizeProducts } from "../../../utils/productStats"
import ButtonLink from "../../atoms/ButtonLink"
import Alert from "../../molecules/Alert"
import StatCard from "../../molecules/StatCard"

export default function DashboardPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        let ignore = false
        productRepository
            .getProductList()
            .then((models) => {
                if (!ignore) setProducts(models.map((model) => model.toJSON()))
            })
            .catch((reason: unknown) => {
                if (ignore) return
                setError(
                    reason instanceof Error ? reason.message : "Gagal memuat produk.",
                )
            })
            .finally(() => {
                if (!ignore) setIsLoading(false)
            })
        return () => {
            ignore = true
        }
    }, [])

    const stats = summarizeProducts(products)
    const latest = [...products].sort((a, b) => b.id - a.id).slice(0, 3)

    return (
        <>
            <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                        Dashboard
                    </h1>
                    <p className="mt-2 text-slate-500">
                        Ringkasan produk yang tersimpan di database.
                    </p>
                </div>
                <ButtonLink to="/products">Kelola Produk</ButtonLink>
            </header>

            {error && <Alert tone="error">{error}</Alert>}

            {isLoading && !error && (
                <p className="text-sm text-slate-600">Memuat ringkasan…</p>
            )}

            {!isLoading && !error && (
                <>
                    <section
                        aria-label="Ringkasan produk"
                        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
                    >
                        <StatCard
                            icon={<TbPackage />}
                            label="Total produk"
                            value={String(stats.total)}
                        />
                        <StatCard
                            icon={<TbChartBar />}
                            label="Rata-rata harga"
                            value={formatRupiah(stats.averagePrice)}
                        />
                        <StatCard
                            icon={<TbArrowDown />}
                            label="Termurah"
                            value={stats.cheapest ? formatRupiah(stats.cheapest.price) : "-"}
                            hint={stats.cheapest?.name}
                        />
                        <StatCard
                            icon={<TbArrowUp />}
                            label="Termahal"
                            value={stats.priciest ? formatRupiah(stats.priciest.price) : "-"}
                            hint={stats.priciest?.name}
                        />
                    </section>

                    <section aria-label="Produk terbaru" className="mt-8">
                        <h2 className="mb-3 text-lg font-bold text-slate-900">
                            Produk terbaru
                        </h2>
                        {latest.length === 0 ? (
                            <p className="text-sm text-slate-600">
                                Belum ada produk. Tambahkan lewat halaman Daftar Produk.
                            </p>
                        ) : (
                            <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white shadow-sm">
                                {latest.map((product) => (
                                    <li
                                        key={product.id}
                                        className="flex flex-wrap items-center justify-between gap-2 px-5 py-4"
                                    >
                                        <div className="min-w-0">
                                            <p className="text-xs text-slate-500">
                                                ID: {product.id}
                                            </p>
                                            <p className="font-semibold wrap-break-word text-slate-900">
                                                {product.name}
                                            </p>
                                        </div>
                                        <p className="font-bold text-blue-600">
                                            {formatRupiah(product.price)}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                </>
            )}
        </>
    )
}
