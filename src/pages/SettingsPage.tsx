import { useState } from "react"
import { repository } from "../data/repository"
import { useApp } from "../state/AppContext"
import { Button, ConfirmDialog, Input, Select } from "../components/ui"

export default function SettingsPage() {
  const { user, notify } = useApp()
  const [name, setName] = useState(user?.name ?? "")
  const [site, setSite] = useState("Sede Central - Medellín")
  const [resetOpen, setResetOpen] = useState(false)
  return (
    <div className="module-page">
      <section className="module-hero">
        <div>
          <span>CONFIGURACIÓN INSTITUCIONAL</span>
          <h1>Perfil & Preferencias</h1>
          <p>Información personal, sede operativa y datos de demostración.</p>
        </div>
      </section>
      <section className="settings-card">
        <div className="form-grid">
          <Input
            label="Nombre visible"
            onChange={(event) => setName(event.target.value)}
            value={name}
          />
          <Input
            disabled
            label="Correo corporativo"
            value={user?.email ?? ""}
          />
          <Select
            label="Sede"
            onChange={(event) => setSite(event.target.value)}
            options={[
              "Sede Central - Medellín",
              "Bogotá Chicó",
              "Cali Granada",
            ]}
            value={site}
          />
        </div>
        <div className="modal-actions">
          <Button
            onClick={() =>
              notify("Preferencias guardadas para esta sesión.", "success")
            }
          >
            Guardar preferencias
          </Button>
          {user?.role === "administrator" && (
            <Button onClick={() => setResetOpen(true)} variant="danger">
              Restablecer datos demo
            </Button>
          )}
        </div>
      </section>
      {resetOpen && (
        <ConfirmDialog
          message="Se perderán los cambios locales y se restaurarán los registros iniciales."
          onCancel={() => setResetOpen(false)}
          onConfirm={() => {
            repository.reset()
            setResetOpen(false)
            notify("Datos demo restaurados.", "success")
          }}
          title="Restablecer demostración"
        />
      )}
    </div>
  )
}
