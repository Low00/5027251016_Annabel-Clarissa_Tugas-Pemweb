import ProductListParam from "../param/product-list-param.ts"
import type { Product, ProductValues } from "../../../types/product"

// Error dari backend; status dipakai untuk membedakan "tidak ditemukan" dari error lain.
export class ApiError extends Error {
    readonly status: number

    constructor(message: string, status: number) {
        super(message)
        this.name = "ApiError"
        this.status = status
    }
}

export type ProductRemoteSource = {
    getProductListRemote: (param?: ProductListParam) => Promise<unknown>
    getProductRemote: (id: number) => Promise<unknown>
    createProductRemote: (values: ProductValues) => Promise<unknown>
    updateProductRemote: (product: Product) => Promise<unknown>
    deleteProductRemote: (id: number) => Promise<unknown>
}

type ProductRemoteOptions = {
    baseUrl?: string
    fetchImpl?: typeof fetch
}

// Membaca field `message` yang dikirim backend pada response error.
async function readErrorDetail(response: Response): Promise<string> {
    try {
        const body: unknown = await response.json()
        if (
            typeof body === "object" &&
            body !== null &&
            "message" in body &&
            typeof body.message === "string"
        ) {
            return body.message
        }
    } catch {
        // Body kosong atau bukan JSON; status HTTP sudah cukup.
    }
    return ""
}

// Mengirim request HTTP dan mengembalikan payload JSON yang belum divalidasi.
export default function ProductRemote({
    baseUrl = "",
    fetchImpl = fetch,
}: ProductRemoteOptions = {}): ProductRemoteSource {
    function buildUrl(path: string, search = ""): URL {
        if (!baseUrl.trim()) {
            throw new Error(
                "Isi VITE_API_BASE_URL di .env.local terlebih dahulu.",
            )
        }

        const url = new URL(`${baseUrl.replace(/\/+$/, "")}${path}`)
        if (!["http:", "https:"].includes(url.protocol)) {
            throw new Error("URL API harus menggunakan http atau https.")
        }
        url.search = search
        return url
    }

    async function send(
        url: URL,
        action: string,
        init: { method: string; body?: unknown },
    ): Promise<unknown> {
        const headers: Record<string, string> = { Accept: "application/json" }
        if (init.body !== undefined) headers["Content-Type"] = "application/json"

        let response: Response
        try {
            response = await fetchImpl(url, {
                method: init.method,
                headers,
                body:
                    init.body === undefined ? undefined : JSON.stringify(init.body),
            })
        } catch {
            throw new Error(
                `${action}: server tidak dapat dihubungi. Pastikan backend berjalan.`,
            )
        }

        if (!response.ok) {
            const detail = await readErrorDetail(response)
            throw new ApiError(
                detail
                    ? `${action} (HTTP ${response.status}): ${detail}`
                    : `${action} (HTTP ${response.status}).`,
                response.status,
            )
        }

        return response.json()
    }

    async function getProductListRemote(
        param = new ProductListParam(),
    ): Promise<unknown> {
        const url = buildUrl("/products", param.toQueryString())
        return send(url, "Gagal memuat produk", { method: "GET" })
    }

    async function getProductRemote(id: number): Promise<unknown> {
        const url = buildUrl(`/products/${encodeURIComponent(String(id))}`)
        return send(url, "Gagal memuat detail produk", { method: "GET" })
    }

    async function createProductRemote(values: ProductValues): Promise<unknown> {
        const url = buildUrl("/products")
        return send(url, "Gagal menambah produk", {
            method: "POST",
            body: values,
        })
    }

    // Backend membaca id dari body request, bukan dari URL.
    async function updateProductRemote(product: Product): Promise<unknown> {
        const url = buildUrl("/products")
        return send(url, "Gagal menyimpan perubahan", {
            method: "PUT",
            body: product,
        })
    }

    async function deleteProductRemote(id: number): Promise<unknown> {
        const url = buildUrl(`/products/${encodeURIComponent(String(id))}`)
        return send(url, "Gagal menghapus produk", { method: "DELETE" })
    }

    return {
        getProductListRemote,
        getProductRemote,
        createProductRemote,
        updateProductRemote,
        deleteProductRemote,
    }
}
