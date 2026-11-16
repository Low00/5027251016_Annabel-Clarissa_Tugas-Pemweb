import { useId, type InputHTMLAttributes } from "react"
import styles from "./styles.module.css"

type Props = InputHTMLAttributes<HTMLInputElement> & {
    label: string
    hint?: string
    error?: string
}

export default function TextField({ label, hint, error, ...props }: Props) {
    const id = useId()
    const helpId = `${id}-help`
    const helpText = error || hint

    return (
        <div className={styles.field}>
            <label htmlFor={id} className={styles.label}>
                {label}
            </label>
            <input
                id={id}
                className={styles.input}
                aria-invalid={error ? true : undefined}
                aria-describedby={helpText ? helpId : undefined}
                {...props}
            />
            {helpText && (
                <p
                    id={helpId}
                    role={error ? "alert" : undefined}
                    className={error ? styles.error : styles.hint}
                >
                    {helpText}
                </p>
            )}
        </div>
    )
}
