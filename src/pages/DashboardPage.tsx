import { useApp } from "../state/AppContext"

import AdminDashboard from "./AdminDashboard"

import AsesorDashboard from "./AsesorDashboard"

import DirectorDashboard from "./DirectorDashboard"

import InventarioDashboard from "./InventarioDashboard"

import ProveedoresDashboard from "./ProveedoresDashboard"

import RrhhDashboard from "./RrhhDashboard"

import TesoreroDashboard from "./TesoreroDashboard"

export default function DashboardPage() {
  const { user } = useApp()

  if (!user) return null

  switch (user.role) {
    case "superAdmin":
      return <AdminDashboard />

    case "coordinadorProveedores":
      return <ProveedoresDashboard />

    case "tesorero":
      return <TesoreroDashboard />

    case "rrhh":
      return <RrhhDashboard />

    case "almacenista":
      return <InventarioDashboard />

    case "asesorComercial":
      return <AsesorDashboard />

    case "directorComercial":
      return <DirectorDashboard />
  }
}
