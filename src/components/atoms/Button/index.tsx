import type { ButtonHTMLAttributes } from "react"
import { variants, type ButtonVariant } from "./variants"
import styles from "./styles.module.css"

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant
}

export default function Button({
    variant = "primary",
    className = "",
    type = "button",
    children,
    ...props
}: ButtonProps) {
    return (
        <button
            type={type}
            className={`${styles.button} ${variants[variant]} ${className}`}
            {...props}
        >
            {children}
        </button>
    )
}
