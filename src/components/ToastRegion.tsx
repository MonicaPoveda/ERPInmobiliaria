import { useApp } from "../state/AppContext"
import { Button } from "./ui"

export default function ToastRegion() {
  const { toasts, removeToast } = useApp()
  return (
    <div aria-live="polite" className="toast-region">
      {toasts.map((toast) => (
        <div className={`toast toast--${toast.tone}`} key={toast.id}>
          <span>{toast.message}</span>
          <Button
            aria-label="Cerrar mensaje"
            onClick={() => removeToast(toast.id)}
            variant="ghost"
          >
            ×
          </Button>
        </div>
      ))}
    </div>
  )
}
