import type { ReactNode } from "react"
import { NavLink } from "react-router"

type Props = {
    to: string
    icon: ReactNode
    children: ReactNode
}

// NavLink menandai menu aktif secara otomatis berdasarkan URL.
export default function NavItem({ to, icon, children }: Props) {
    return (
        <NavLink
            to={to}
            className={({ isActive }) =>
                `flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold transition-colors ${
                    isActive
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`
            }
        >
            <span aria-hidden="true" className="text-lg">
                {icon}
            </span>
            {children}
        </NavLink>
    )
}
