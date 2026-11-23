import type { ReactNode } from "react"

const tones = {
    success: "border-green-200 bg-green-50 text-green-800",
    error: "border-red-200 bg-red-50 text-red-700",
    info: "border-blue-200 bg-blue-50 text-blue-800",
}

type Props = {
    tone?: keyof typeof tones
    children: ReactNode
    action?: ReactNode
}

export default function Alert({ tone = "info", children, action }: Props) {
    return (
        <div
            role={tone === "error" ? "alert" : "status"}
            className={`flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4 text-sm ${tones[tone]}`}
        >
            <p>{children}</p>
            {action}
        </div>
    )
}
