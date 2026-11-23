import { Route, Routes } from "react-router"
import PageLayout from "../src/components/templates/PageLayout"
import DashboardPage from "./dashboard/page"
import NotFoundPage from "./not-found/page"
import RootPage from "./page"
import ProductsPage from "./products/page"
import ProductDetailPage from "./products/detail/page"

export default function AppRoutes() {
    return (
        <Routes>
            <Route element={<PageLayout />}>
                <Route index element={<RootPage />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="products" element={<ProductsPage />} />
                <Route path="products/:id" element={<ProductDetailPage />} />
                <Route path="*" element={<NotFoundPage />} />
            </Route>
        </Routes>
    )
}
