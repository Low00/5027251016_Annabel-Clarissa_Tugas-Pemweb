import type { ReactNode } from "react"

type Props = {
    icon: ReactNode
    label: string
    value: string
    hint?: string
}

export default function StatCard({ icon, label, value, hint }: Props) {
    return (
        <article className="min-w-0 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
                <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    {icon}
                </span>
                <h2 className="text-sm font-semibold text-slate-500">{label}</h2>
            </div>
            <p className="mt-4 text-2xl font-bold wrap-break-word text-slate-900">
                {value}
            </p>
            {hint && (
                <p className="mt-1 text-sm wrap-break-word text-slate-500">{hint}</p>
            )}
        </article>
    )
}
