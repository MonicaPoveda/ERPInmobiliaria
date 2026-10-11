import { useNavigate } from "react-router"
import { Button } from "../components/ui"

function ErrorPage({
  code,
  title,
  text,
}: {
  code: string
  title: string
  text: string
}) {
  const navigate = useNavigate()
  return (
    <main className="error-page">
      <span>{code}</span>
      <h1>{title}</h1>
      <p>{text}</p>
      <div>
        <Button onClick={() => navigate(-1)} variant="secondary">
          Volver
        </Button>
        <Button onClick={() => navigate("/")}>Ir al inicio</Button>
      </div>
    </main>
  )
}
export function ForbiddenPage() {
  return (
    <ErrorPage
      code="403"
      text="Su rol no tiene permiso para acceder a este módulo."
      title="Acceso restringido"
    />
  )
}
export default function NotFoundPage() {
  return (
    <ErrorPage
      code="404"
      text="La dirección solicitada no existe en Vesta ERP."
      title="Página no encontrada"
    />
  )
}
