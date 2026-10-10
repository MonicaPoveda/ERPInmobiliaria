import {
  useEffect,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react"

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "gold"
}) {
  return (
    <button
      className={`ui-button ui-button--${variant} ${className}`}
      {...props}
    />
  )
}

export function Input({
  label,
  error,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error?: string
}) {
  return (
    <label className="ui-field">
      <span>{label}</span>
      <input aria-invalid={Boolean(error)} {...props} />
      {error && <small>{error}</small>}
    </label>
  )
}

export function Select({
  label,
  options,
  error,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & {
  label: string
  options: string[]
  error?: string
}) {
  return (
    <label className="ui-field">
      <span>{label}</span>
      <select aria-invalid={Boolean(error)} {...props}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {error && <small>{error}</small>}
    </label>
  )
}

export function Textarea({
  label,
  error,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string
  error?: string
}) {
  return (
    <label className="ui-field">
      <span>{label}</span>
      <textarea aria-invalid={Boolean(error)} {...props} />
      {error && <small>{error}</small>}
    </label>
  )
}

export function Modal({
  title,
  children,
  onClose,
  footer,
}: {
  title: string
  children: ReactNode
  onClose: () => void
  footer?: ReactNode
}) {
  useEffect(() => {
    const handler = (event: KeyboardEvent) =>
      event.key === "Escape" && onClose()
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [onClose])
  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <section aria-modal="true" className="modal" role="dialog">
        <header>
          <h2>{title}</h2>
          <Button aria-label="Cerrar" onClick={onClose} variant="ghost">
            ×
          </Button>
        </header>
        <div className="modal__body">{children}</div>
        {footer && <footer>{footer}</footer>}
      </section>
    </div>
  )
}

export function ConfirmDialog({
  title,
  message,
  onCancel,
  onConfirm,
  busy,
}: {
  title: string
  message: string
  onCancel: () => void
  onConfirm: () => void
  busy?: boolean
}) {
  return (
    <Modal
      title={title}
      onClose={onCancel}
      footer={
        <>
          <Button onClick={onCancel} variant="secondary">
            Cancelar
          </Button>
          <Button disabled={busy} onClick={onConfirm} variant="danger">
            {busy ? "Procesando..." : "Confirmar"}
          </Button>
        </>
      }
    >
      <p>{message}</p>
    </Modal>
  )
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode
  tone?: "neutral" | "success" | "warning" | "danger" | "admin" | "staff" | "client"
}) {
  return <span className={`badge badge--${tone}`}>{children}</span>
}

export function Spinner() {
  return <span aria-label="Cargando" className="spinner" role="status" />
}
