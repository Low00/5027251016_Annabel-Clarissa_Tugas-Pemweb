import { TbSearch } from "react-icons/tb"
import styles from "./styles.module.css"

type Props = {
    value: string
    onChange: (value: string) => void
    placeholder?: string
}

export default function SearchField({
    value,
    onChange,
    placeholder = "Cari nama produk…",
}: Props) {
    return (
        <div className={styles.wrapper}>
            <TbSearch className={styles.icon} aria-hidden="true" />
            <input
                type="search"
                className={styles.input}
                value={value}
                placeholder={placeholder}
                aria-label="Cari nama produk"
                onChange={(event) => onChange(event.target.value)}
            />
        </div>
    )
}
