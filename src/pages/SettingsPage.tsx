import { useState } from "react"

import { repository } from "../data/repository"

import { useApp } from "../state/AppContext"

import { Button, ConfirmDialog, Input, Select } from "../components/ui"

const COMPANY_SETTINGS_KEY = "arias-company-settings"

const defaultCompanySettings = {
  name: "Arias Empire",

  nit: "",

  address: "Sede Central - Medellín",

  logoUrl: "",

  sessionMinutes: 15,
}

function getCompanySettings() {
  const stored = localStorage.getItem(COMPANY_SETTINGS_KEY)

  return stored
    ? { ...defaultCompanySettings, ...JSON.parse(stored) }
    : defaultCompanySettings
}

export default function SettingsPage() {
  const { user, notify } = useApp()

  const [name, setName] = useState(user?.name ?? "")

  const [site, setSite] = useState("Sede Central - Medellín")

  const [nit, setNit] = useState(
    () => localStorage.getItem("arias-company-nit") ?? "901.456.789-2",
  )

  const [address, setAddress] = useState(
    () =>
      localStorage.getItem("arias-company-address") ??
      "Carrera 43A # 1-50, Medellín",
  )

  const [logo, setLogo] = useState(
    () => localStorage.getItem("arias-company-logo") ?? "Logo institucional",
  )

  const [resetOpen, setResetOpen] = useState(false)

  const [company, setCompany] = useState(getCompanySettings)

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
          <Input
            label="NIT de la empresa"
            onChange={(event) => setNit(event.target.value)}
            value={nit}
          />
          <Input
            label="Dirección institucional"
            onChange={(event) => setAddress(event.target.value)}
            value={address}
          />
          <Input
            accept="image/*"
            label="Cambiar logo (archivo simulado)"
            onChange={(event) => setLogo(event.target.files?.[0]?.name ?? logo)}
            type="file"
          />
          <Input disabled label="Archivo de logo seleccionado" value={logo} />
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
            onClick={() => {
              localStorage.setItem("arias-company-nit", nit)

              localStorage.setItem("arias-company-address", address)

              localStorage.setItem("arias-company-logo", logo)

              notify("Preferencias guardadas para esta sesión.", "success")
            }}
          >
            Guardar preferencias
          </Button>
          {user?.role === "superAdmin" && (
            <Button onClick={() => setResetOpen(true)} variant="danger">
              Restablecer datos demo
            </Button>
          )}
        </div>
      </section>
      {user?.role === "superAdmin" && (
        <section className="settings-card">
          <div>
            <span>IDENTIDAD Y PARÁMETROS GLOBALES</span>
            <h2>Configuración de la empresa</h2>
            <p>
              Estos valores se guardan localmente en esta demostración y no
              sustituyen una configuración conectada a servicios externos.
            </p>
          </div>
          <div className="form-grid">
            <Input
              label="Nombre de la empresa"
              onChange={(event) =>
                setCompany({ ...company, name: event.target.value })
              }
              value={company.name}
            />
            <Input
              label="NIT"
              onChange={(event) =>
                setCompany({ ...company, nit: event.target.value })
              }
              value={company.nit}
            />
            <Input
              label="Dirección"
              onChange={(event) =>
                setCompany({ ...company, address: event.target.value })
              }
              value={company.address}
            />
            <Input
              label="URL del logo"
              onChange={(event) =>
                setCompany({ ...company, logoUrl: event.target.value })
              }
              type="url"
              value={company.logoUrl}
            />
            <Input
              label="Cierre por inactividad (minutos)"
              min={1}
              onChange={(event) =>
                setCompany({
                  ...company,

                  sessionMinutes: Number(event.target.value),
                })
              }
              required
              type="number"
              value={company.sessionMinutes}
            />
          </div>
          <div className="modal-actions">
            <Button
              onClick={() => {
                if (
                  !Number.isFinite(company.sessionMinutes) ||
                  company.sessionMinutes < 1
                ) {
                  notify(
                    "El tiempo de inactividad debe ser de al menos un minuto.",

                    "error",
                  )

                  return
                }

                localStorage.setItem(
                  COMPANY_SETTINGS_KEY,

                  JSON.stringify(company),
                )

                notify("Configuración global guardada.", "success")
              }}
            >
              Guardar configuración global
            </Button>
          </div>
        </section>
      )}
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
