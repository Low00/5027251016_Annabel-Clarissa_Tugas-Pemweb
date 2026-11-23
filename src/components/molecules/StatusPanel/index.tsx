import type { ReactNode } from "react"

type Props = {
    icon: ReactNode
    title: string
    description: string
    children?: ReactNode
}

// Panel pesan di tengah halaman, dipakai untuk 404 dan produk tidak ditemukan.
export default function StatusPanel({ icon, title, description, children }: Props) {
    return (
        <section className="mx-auto flex max-w-lg flex-col items-center rounded-xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
            <span aria-hidden="true" className="mb-4 text-5xl text-slate-400">
                {icon}
            </span>
            <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
            {children && (
                <div className="mt-6 flex flex-wrap justify-center gap-3">{children}</div>
            )}
        </section>
    )
}
