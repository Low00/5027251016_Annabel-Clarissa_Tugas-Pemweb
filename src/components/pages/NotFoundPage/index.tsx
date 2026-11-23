import { TbMoodSad } from "react-icons/tb"
import ButtonLink from "../../atoms/ButtonLink"
import StatusPanel from "../../molecules/StatusPanel"

export default function NotFoundPage() {
    return (
        <StatusPanel
            icon={<TbMoodSad />}
            title="Halaman tidak ditemukan"
            description="Alamat yang kamu buka tidak terdaftar di aplikasi ini. Periksa kembali URL-nya atau kembali ke halaman yang tersedia."
        >
            <ButtonLink to="/dashboard">Ke Dashboard</ButtonLink>
            <ButtonLink to="/products" variant="outline">
                Ke Daftar Produk
            </ButtonLink>
        </StatusPanel>
    )
}
