import { Suspense } from "react"
import { RouterProvider } from "react-router"
import ToastRegion from "../components/ToastRegion"
import { Spinner } from "../components/ui"
import { AppProvider } from "../state/AppContext"
import { router } from "./routes"

export default function App() {
  return (
    <AppProvider>
      <Suspense
        fallback={
          <div className="app-loading">
            <Spinner />
            <span>Cargando Vesta ERP...</span>
          </div>
        }
      >
        <RouterProvider router={router} />
      </Suspense>
      <ToastRegion />
    </AppProvider>
  )
}
