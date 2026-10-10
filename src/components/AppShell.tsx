import { useMemo, useState } from "react"
import { NavLink, Outlet, useNavigate } from "react-router"
import { can, profileLabels, roleLabels } from "../core/permissions"
import type { ModuleId } from "../core/types"
import { useApp } from "../state/AppContext"
import { Button, ConfirmDialog, Modal } from "./ui"

const navigation: Array<{
  to: string
  label: string
  module: ModuleId
  mark: string
}> = [
  {
    to: "/dashboard",
    label: "Métricas Globales",
    module: "dashboard",
    mark: "MG",
  },
  {
    to: "/inventory",
    label: "Inventarios Activos",
    module: "inventory",
    mark: "IN",
  },
  { to: "/crm", label: "CRM & Agenda", module: "crm", mark: "CR" },
  {
    to: "/contracts",
    label: "Contratos & Cartera",
    module: "contracts",
    mark: "CT",
  },
  { to: "/people", label: "Talento Humano", module: "people", mark: "TH" },
  { to: "/billing", label: "Facturas & Pagos", module: "billing", mark: "FP" },
  { to: "/portal", label: "Portal Cliente", module: "portal", mark: "PC" },
  { to: "/security", label: "Seguridad", module: "security", mark: "SG" },
  { to: "/users", label: "Usuarios & Roles", module: "users", mark: "UR" },
  { to: "/audit", label: "Auditoría", module: "audit", mark: "AU" },
  { to: "/settings", label: "Configuración", module: "settings", mark: "CF" },
]

const clientLabels: Partial<Record<ModuleId, string>> = {
  inventory: "Catálogo Inmuebles",
  contracts: "Mis Contratos",
  billing: "Estados de Cuenta",
  portal: "Mis Solicitudes",
  settings: "Mi Perfil",
}

export default function AppShell() {
  const { user, logout, notify, sessionWarning, extendSession } = useApp()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [notificationsRead, setNotificationsRead] = useState(false)
  const [confirmLogout, setConfirmLogout] = useState(false)
  const visibleNavigation = useMemo(
    () => navigation.filter((item) => can(user, item.module)),
    [user],
  )
  if (!user) return null

  const notifications =
    user.role === "client"
      ? [
          "Factura FE-2024-1087 pendiente",
          "Contrato CT-2024-001 disponible",
          "Solicitud SOL-002 actualizada",
        ]
      : user.staffProfile === "commercial"
        ? [
            "3 visitas programadas para hoy",
            "5 prospectos sin seguimiento",
            "2 activos nuevos disponibles",
          ]
        : [
            "4 contratos vencen este mes",
            "8 facturas están en mora",
            "Auditoría institucional al día",
          ]

  const finishLogout = () => {
    logout()
    notify("Sesión cerrada correctamente.", "success")
    navigate("/login")
  }

  const labelFor = (item: typeof navigation[number]) => {
    if (user.role !== "client") return item.label
    return clientLabels[item.module] ?? item.label
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileOpen ? "sidebar--open" : ""}`}>
        <div className="sidebar__brand">
          <span className="brand-dot" />
          ARIAS ERP CORE
          <Button
            aria-label="Cerrar menú"
            className="mobile-only"
            onClick={() => setMobileOpen(false)}
            variant="ghost"
          >
            ×
          </Button>
        </div>
        <div className="sidebar__section">NAVEGACIÓN PRINCIPAL</div>
        <nav aria-label="Navegación principal">
          {visibleNavigation.map((item) => (
            <NavLink
              className={({ isActive }) =>
                `nav-item ${isActive ? "nav-item--active" : ""}`
              }
              key={item.to}
              onClick={() => setMobileOpen(false)}
              to={item.to}
            >
              <span className="nav-mark">{item.mark}</span>
              {labelFor(item)}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar__footer">
          <span className="brand-dot" />
          <div>
            <strong>Base Central v4.8</strong>
            <small>Licencia Institucional</small>
          </div>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <Button
            aria-label="Abrir menú"
            className="mobile-only"
            onClick={() => setMobileOpen(true)}
            variant="ghost"
          >
            Menú
          </Button>
          <div className="wordmark">
            ARIAS
            <br />
            EMPIRE
          </div>
          <div className="topbar__spacer" />
          <div className="online-status">
            <span />
            En línea · Sede Central
          </div>
          <div className="header-menu-wrap">
            <Button
              aria-label="Notificaciones"
              className="icon-button"
              onClick={() => setNotificationsOpen((value) => !value)}
              variant="ghost"
            >
              N
              {!notificationsRead && (
                <span className="notification-count">
                  {notifications.length}
                </span>
              )}
            </Button>
            {notificationsOpen && (
              <div className="popover notifications">
                <strong>Notificaciones</strong>
                {notifications.map((item) => (
                  <Button
                    className="notification-item"
                    key={item}
                    onClick={() => {
                      notify(item, "info")
                      setNotificationsOpen(false)
                      setNotificationsRead(true)
                    }}
                    variant="ghost"
                  >
                    {item}
                  </Button>
                ))}
                <Button
                  onClick={() => {
                    setNotificationsOpen(false)
                    setNotificationsRead(true)
                    notify("Notificaciones marcadas como leídas.", "success")
                  }}
                  variant="secondary"
                >
                  Marcar como leídas
                </Button>
              </div>
            )}
          </div>
          <div className="header-menu-wrap">
            <Button
              className="profile-trigger"
              onClick={() => setProfileOpen((value) => !value)}
              variant="ghost"
            >
              <span>
                <strong>{user.name}</strong>
                <small>
                  {user.staffProfile
                    ? profileLabels[user.staffProfile]
                    : roleLabels[user.role]}
                </small>
              </span>
              <span className={`role-pill role-pill--${user.role}`}>
                {roleLabels[user.role]}
              </span>
              <span className="avatar">{user.avatar}</span>
            </Button>
            {profileOpen && (
              <div className="popover profile-menu">
                <Button
                  onClick={() => {
                    setProfileOpen(false)
                    navigate("/settings")
                  }}
                  variant="ghost"
                >
                  Mi perfil
                </Button>
                <Button
                  onClick={() => {
                    setProfileOpen(false)
                    setConfirmLogout(true)
                  }}
                  variant="ghost"
                >
                  Cerrar sesión
                </Button>
              </div>
            )}
          </div>
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>
      {confirmLogout && (
        <ConfirmDialog
          message="¿Desea cerrar la sesión actual?"
          onCancel={() => setConfirmLogout(false)}
          onConfirm={finishLogout}
          title="Cerrar sesión"
        />
      )}
      {sessionWarning && (
        <Modal
          footer={<Button onClick={extendSession}>Continuar sesión</Button>}
          onClose={extendSession}
          title="La sesión está por expirar"
        >
          <p>
            Por seguridad, la sesión se cerrará pronto debido a inactividad.
          </p>
        </Modal>
      )}
    </div>
  )
}
