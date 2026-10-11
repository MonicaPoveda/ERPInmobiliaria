import { Button, Spinner } from "./ui"

export default function DashboardState({
  loading,

  error,

  onRetry,
}: {
  loading: boolean

  error: string

  onRetry: () => void
}) {
  if (loading) {
    return (
      <div className="state-panel">
        <Spinner />
        <p>Cargando indicadores...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="state-panel state-panel--error">
        <p>{error}</p>
        <Button onClick={onRetry}>Reintentar</Button>
      </div>
    )
  }

  return null
}
