import { Outlet } from "react-router"
import Sidebar from "../../organisms/Sidebar"

// Layout bersama: sidebar tetap, halaman anak tampil di <Outlet />.
export default function PageLayout() {
    return (
        <div className="flex min-h-screen flex-col md:flex-row">
            <Sidebar />
            <main className="mx-auto w-full max-w-5xl min-w-0 flex-1 px-5 py-8 sm:px-8 md:py-10">
                <Outlet />
            </main>
        </div>
    )
}
