import { useEffect, useId, useRef, type ReactNode } from "react"
import { TbX } from "react-icons/tb"
import styles from "./styles.module.css"

type Props = {
    title: string
    description?: string
    icon?: ReactNode
    centered?: boolean
    onClose: () => void
    children: ReactNode
}

// Pop-up built on the native <dialog>, which provides focus trapping and Esc.
// Render it only while it is open; it opens itself when it mounts.
export default function Modal({
    title,
    description,
    icon,
    centered = false,
    onClose,
    children,
}: Props) {
    const dialogRef = useRef<HTMLDialogElement>(null)
    const titleId = useId()

    useEffect(() => {
        const dialog = dialogRef.current
        if (!dialog) return
        if (!dialog.open) dialog.showModal()
        dialog.querySelector<HTMLElement>("[data-autofocus]")?.focus()
    }, [])

    return (
        <dialog
            ref={dialogRef}
            className={styles.dialog}
            aria-labelledby={titleId}
            onClose={onClose}
            onClick={(event) => {
                // A click on the backdrop targets the <dialog> itself.
                if (event.target === event.currentTarget) onClose()
            }}
        >
            <div className={styles.body}>
                <button
                    type="button"
                    className={styles.close}
                    aria-label="Tutup"
                    onClick={onClose}
                >
                    <TbX aria-hidden="true" className={styles.closeIcon} />
                </button>
                <header
                    className={centered ? styles.headerCentered : styles.header}
                >
                    {icon}
                    <h2 id={titleId} className={styles.title}>
                        {title}
                    </h2>
                    {description && (
                        <p className={styles.description}>{description}</p>
                    )}
                </header>
                {children}
            </div>
        </dialog>
    )
}
