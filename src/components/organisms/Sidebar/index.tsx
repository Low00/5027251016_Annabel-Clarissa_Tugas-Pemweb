import { TbLayoutDashboard, TbPackage } from "react-icons/tb"
import NavItem from "../../molecules/NavItem"

export default function Sidebar() {
    return (
        <aside className="border-b border-slate-200 bg-white md:sticky md:top-0 md:h-screen md:w-64 md:shrink-0 md:border-r md:border-b-0">
            <div className="flex items-center gap-3 px-5 py-4 md:py-6">
                <span
                    aria-hidden="true"
                    className="inline-flex size-10 items-center justify-center rounded-lg bg-blue-600 text-xl text-white"
                >
                    <TbPackage />
                </span>
                <p className="text-lg font-bold text-slate-900">Manajemen Produk</p>
            </div>
            <nav
                aria-label="Navigasi utama"
                className="flex gap-1 px-3 pb-3 md:flex-col md:pb-0"
            >
                <NavItem to="/dashboard" icon={<TbLayoutDashboard />}>
                    Dashboard
                </NavItem>
                <NavItem to="/products" icon={<TbPackage />}>
                    Daftar Produk
                </NavItem>
            </nav>
        </aside>
    )
}
