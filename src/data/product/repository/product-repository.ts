import type { ProductRemoteSource } from "../source/product-remote.ts"
import ProductModel from "../model/product-model.ts"
import ProductListParam from "../param/product-list-param.ts"
import type { Product, ProductValues } from "../../../types/product"

// Mengubah payload remote menjadi model aplikasi yang sudah divalidasi.
export default function ProductRepository({
    getProductListRemote,
    getProductRemote,
    createProductRemote,
    updateProductRemote,
    deleteProductRemote,
}: ProductRemoteSource) {
    async function getProductList(
        param = new ProductListParam(),
    ): Promise<ProductModel[]> {
        const response = await getProductListRemote(param)
        // Kontrak endpoint: response berupa array produk.
        if (!Array.isArray(response)) {
            throw new TypeError(
                "Contoh ini mengharapkan response API berupa array produk.",
            )
        }

        const products = response.map((item) => ProductModel.fromResponse(item))
        const ids = products.map((product) => product.getId())
        if (new Set(ids).size !== ids.length) {
            throw new TypeError("ID produk dari API harus unik.")
        }

        return products
    }

    async function getProduct(id: number): Promise<ProductModel> {
        return ProductModel.fromResponse(await getProductRemote(id))
    }

    async function createProduct(values: ProductValues): Promise<ProductModel> {
        return ProductModel.fromResponse(await createProductRemote(values))
    }

    async function updateProduct(product: Product): Promise<ProductModel> {
        return ProductModel.fromResponse(await updateProductRemote(product))
    }

    async function deleteProduct(id: number): Promise<void> {
        await deleteProductRemote(id)
    }

    return { getProductList, getProduct, createProduct, updateProduct, deleteProduct }
}
