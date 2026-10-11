import { useMemo, useState } from "react"

import { NavLink, Outlet, useNavigate } from "react-router"

import { can, roleLabels } from "../core/permissions"

import type { ModuleId, Role } from "../core/types"

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

    label: "Inventario",

    module: "inventory",

    mark: "IN",
  },

  { to: "/suppliers", label: "Proveedores", module: "suppliers", mark: "PV" },

  { to: "/crm", label: "CRM & Agenda", module: "crm", mark: "CR" },

  {
    to: "/catalogo",

    label: "Catálogo de Inmuebles",

    module: "catalogo",

    mark: "CA",
  },

  {
    to: "/contracts",

    label: "Contratos & Cartera",

    module: "contracts",

    mark: "CT",
  },

  { to: "/people", label: "Talento Humano", module: "people", mark: "TH" },

  { to: "/billing", label: "Facturas & Pagos", module: "billing", mark: "FP" },

  {
    to: "/transactions",

    label: "Transacciones",

    module: "transactions",

    mark: "TR",
  },

  { to: "/expenses", label: "Egresos", module: "expenses", mark: "EG" },

  { to: "/movements", label: "Movimientos", module: "movements", mark: "MV" },

  { to: "/kardex", label: "Kardex", module: "kardex", mark: "KA" },

  {
    to: "/payroll",

    label: "Novedades y nómina",

    module: "payroll",

    mark: "NO",
  },

  { to: "/team", label: "Gestión de equipo", module: "team", mark: "EQ" },

  { to: "/security", label: "Seguridad", module: "security", mark: "SG" },

  { to: "/users", label: "Usuarios & Roles", module: "users", mark: "UR" },

  { to: "/audit", label: "Auditoría", module: "audit", mark: "AU" },

  { to: "/settings", label: "Configuración", module: "settings", mark: "CF" },
]

export default function AppShell() {
  const { user, logout, notify, sessionWarning, extendSession } = useApp()

  const navigate = useNavigate()

  const [mobileOpen, setMobileOpen] = useState(false)

  const [profileOpen, setProfileOpen] = useState(false)

  const [notificationsOpen, setNotificationsOpen] = useState(false)

  const [notificationsRead, setNotificationsRead] = useState(false)

  const [confirmLogout, setConfirmLogout] = useState(false)

  const visibleNavigation = useMemo(
    () =>
      navigation.filter(
        (item) =>
          can(user, item.module) &&
          !(user?.role === "superAdmin" && item.module === "dashboard"),
      ),

    [user],
  )

  if (!user) return null

  const notificationsByRole: Record<Role, string[]> = {
    superAdmin: [
      "Sistema operativo",

      "Revisión de seguridad pendiente",

      "Auditoría institucional al día",
    ],

    coordinadorProveedores: [
      "3 evaluaciones de proveedores pendientes",

      "Nueva orden de servicio",
    ],

    tesorero: [
      "8 facturas están en mora",

      "3 solicitudes de egreso pendientes",
    ],

    rrhh: [
      "2 contratos vencen este mes",

      "4 solicitudes de vacaciones pendientes",
    ],

    almacenista: [
      "2 productos con stock crítico",

      "Nueva orden de compra recibida",
    ],

    asesorComercial: [
      "3 visitas programadas para hoy",

      "5 prospectos sin seguimiento",
    ],

    directorComercial: [
      "Proyección comercial actualizada",

      "2 descuentos esperan autorización",
    ],
  }

  const notifications = notificationsByRole[user.role]

  const finishLogout = () => {
    logout()

    notify("Sesión cerrada correctamente.", "success")

    navigate("/login")
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileOpen ? "sidebar--open" : ""}`}>
        <div className="sidebar__brand">
          <img
            alt="Vesta ERP"
            className="h-12 w-auto object-contain"
            src="/assets/logo-vesta.jpg"
          />
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
              {item.label}
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
          <img
            alt="Vesta ERP"
            className="topbar__logo"
            src="/assets/logo-vesta.jpg"
          />
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
                <small>{roleLabels[user.role]}</small>
              </span>
              <span className="avatar">{user.avatar}</span>
            </Button>
            {profileOpen && (
              <div className="popover profile-menu">
                {can(user, "settings") && (
                  <Button
                    onClick={() => {
                      setProfileOpen(false)

                      navigate("/settings")
                    }}
                    variant="ghost"
                  >
                    Mi perfil
                  </Button>
                )}
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
