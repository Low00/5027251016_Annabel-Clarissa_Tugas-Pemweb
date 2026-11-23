import { Link, type LinkProps } from "react-router"
import buttonStyles from "../Button/styles.module.css"
import { variants, type ButtonVariant } from "../Button/variants"

type ButtonLinkProps = LinkProps & { variant?: ButtonVariant }

// Link React Router dengan tampilan tombol, untuk navigasi tanpa memuat ulang halaman.
export default function ButtonLink({
    variant = "primary",
    className = "",
    children,
    ...props
}: ButtonLinkProps) {
    return (
        <Link
            className={`${buttonStyles.button} ${variants[variant]} ${className}`}
            {...props}
        >
            {children}
        </Link>
    )
}
