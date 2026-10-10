import { lazy } from "react"
import { Navigate, createBrowserRouter, useLocation } from "react-router"
import AppShell from "../components/AppShell"
import { can } from "../core/permissions"
import type { ModuleId } from "../core/types"
import { useApp } from "../state/AppContext"
import { ForbiddenPage } from "../pages/ErrorPages"
import NotFoundPage from "../pages/ErrorPages"

const AuditPage = lazy(() => import("../pages/AuditPage"))
const DashboardPage = lazy(() => import("../pages/DashboardPage"))
const LoginPage = lazy(() => import("../pages/LoginPage"))
const ModulePage = lazy(() => import("../pages/ModulePage"))
const SettingsPage = lazy(() => import("../pages/SettingsPage"))
const UsersPage = lazy(() => import("../pages/UsersPage"))

function ProtectedLayout() {
  const { user } = useApp()
  const location = useLocation()
  if (!user)
    return <Navigate replace state={{ from: location.pathname }} to="/login" />
  return <AppShell />
}

function Guard({
  module,
  children,
}: {
  module: ModuleId
  children: React.ReactNode
}) {
  const { user } = useApp()
  return can(user, module) ? children : <ForbiddenPage />
}

function StartPage() {
  const { user } = useApp()
  if (!user) return <Navigate replace to="/login" />
  if (can(user, "dashboard")) return <Navigate replace to="/dashboard" />
  if (can(user, "portal")) return <Navigate replace to="/portal" />
  return <ForbiddenPage />
}

export const router = createBrowserRouter([
  { path: "/login", Component: LoginPage },
  { path: "/403", Component: ForbiddenPage },
  {
    path: "/",
    Component: ProtectedLayout,
    children: [
      { index: true, Component: StartPage },
      {
        path: "dashboard",
        element: (
          <Guard module="dashboard">
            <DashboardPage />
          </Guard>
        ),
      },
      {
        path: "inventory",
        element: (
          <Guard module="inventory">
            <ModulePage moduleId="inventory" />
          </Guard>
        ),
      },
      {
        path: "crm",
        element: (
          <Guard module="crm">
            <ModulePage moduleId="crm" />
          </Guard>
        ),
      },
      {
        path: "contracts",
        element: (
          <Guard module="contracts">
            <ModulePage moduleId="contracts" />
          </Guard>
        ),
      },
      {
        path: "people",
        element: (
          <Guard module="people">
            <ModulePage moduleId="people" />
          </Guard>
        ),
      },
      {
        path: "billing",
        element: (
          <Guard module="billing">
            <ModulePage moduleId="billing" />
          </Guard>
        ),
      },
      {
        path: "portal",
        element: (
          <Guard module="portal">
            <ModulePage moduleId="portal" />
          </Guard>
        ),
      },
      {
        path: "security",
        element: (
          <Guard module="security">
            <ModulePage moduleId="security" />
          </Guard>
        ),
      },
      {
        path: "users",
        element: (
          <Guard module="users">
            <UsersPage />
          </Guard>
        ),
      },
      {
        path: "audit",
        element: (
          <Guard module="audit">
            <AuditPage />
          </Guard>
        ),
      },
      {
        path: "settings",
        element: (
          <Guard module="settings">
            <SettingsPage />
          </Guard>
        ),
      },
    ],
  },
  { path: "*", Component: NotFoundPage },
])
