import type { EntityRecord, ModuleId, User } from "../core/types"

export const demoUsers: User[] = [
  {
    id: "usr-admin",
    name: "Fernando Arias",
    email: "admin@ariasempire.com",
    password: "Admin2025!",
    role: "administrator",
    active: true,
    avatar: "FA",
  },
  {
    id: "usr-commercial",
    name: "Valentina Ríos",
    email: "asesor@ariasempire.com",
    password: "Asesor2025!",
    role: "staff",
    staffProfile: "commercial",
    active: true,
    avatar: "VR",
  },
  {
    id: "usr-legal",
    name: "Catalina Morales",
    email: "juridico@ariasempire.com",
    password: "Legal2025!",
    role: "staff",
    staffProfile: "legal",
    active: true,
    avatar: "CM",
  },
  {
    id: "usr-hr",
    name: "Mateo Holguín",
    email: "talento@ariasempire.com",
    password: "Talento2025!",
    role: "staff",
    staffProfile: "hr",
    active: true,
    avatar: "MH",
  },
  {
    id: "usr-finance",
    name: "Sofía Echeverry",
    email: "financiero@ariasempire.com",
    password: "Finanzas2025!",
    role: "staff",
    staffProfile: "finance",
    active: true,
    avatar: "SE",
  },
  {
    id: "usr-client",
    name: "Carlos Arturo Mendoza",
    email: "cliente@ariasempire.com",
    password: "Cliente2025!",
    role: "client",
    active: true,
    avatar: "CM",
  },
  {
    id: "usr-inactive",
    name: "Usuario Inactivo",
    email: "inactivo@ariasempire.com",
    password: "Inactivo2025!",
    role: "staff",
    staffProfile: "commercial",
    active: false,
    avatar: "UI",
  },
]

const now = new Date().toISOString()
const clients = [
  "Carlos Arturo Mendoza",
  "Grupo Gómez & Cía",
  "Inversiones Mineras del Pacífico",
  "Transportes Andina Corp",
  "Desarrollos Hoteleros San Jerónimo",
]
const assets = [
  "Penthouse Skyview Rosales",
  "Complejo Logístico Sabaneta",
  "Toyota Prado TX-L",
  "Oficinas Prime Calle 72",
  "Flota Chevrolet Tahoe",
]
const people = [
  "Valentina Ríos",
  "Camilo Restrepo",
  "Andrés Pardo",
  "Catalina Morales",
  "Mateo Holguín",
  "Sofía Echeverry",
]

function records(
  count: number,
  factory: (index: number) => Record<string, string | number | boolean>,
): EntityRecord[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `rec-${index + 1}`,
    createdAt: now,
    updatedAt: now,
    ...factory(index),
  }))
}

export function createSeedData(): Record<string, EntityRecord[]> {
  return {
    inventory: records(36, (i) => ({
      code: `${
        i % 3 === 0 ? "VEH" : "INM"
      }-2024-${String(i + 1).padStart(2, "0")}`,
      name: assets[i % assets.length],
      type: i % 3 === 0 ? "Vehículo" : "Inmueble",
      status:
        i % 4 === 0
          ? "Arrendado"
          : i % 5 === 0
            ? "Mantenimiento"
            : "Disponible",
      value: 8900000 + i * 1250000,
      owner: clients[i % clients.length],
    })),
    crm: records(34, (i) => ({
      name: clients[i % clients.length],
      email:
        i === 0 ? "cliente@ariasempire.com" : `contacto${i + 1}@empresa.com`,
      phone: `300${String(5000000 + i * 317).slice(0, 7)}`,
      stage: ["Nuevo contacto", "Calificado", "Visita", "Cierre"][i % 4],
      advisor: people[i % 3],
      active: true,
    })),
    contracts: records(32, (i) => ({
      code: `CT-2024-${String(i + 1).padStart(3, "0")}`,
      client: clients[i % clients.length],
      asset: assets[i % assets.length],
      status: i % 4 === 0 ? "Firmado" : i % 3 === 0 ? "Borrador" : "Activo",
      value: 12500000 + i * 450000,
      dueDate: `2025-${String((i % 9) + 1).padStart(2, "0")}-15`,
    })),
    people: records(35, (i) => ({
      code: `EMP-${String(i + 1).padStart(3, "0")}`,
      name: `${people[i % people.length]} ${i > 5 ? i + 1 : ""}`.trim(),
      position: [
        "Asesor Comercial",
        "Analista Jurídico",
        "Analista Financiero",
        "Coordinador Operativo",
      ][i % 4],
      status: "Activo",
      salary: 3200000 + i * 90000,
      payroll: "Incluido",
    })),
    billing: records(38, (i) => ({
      code: `FE-2024-${1082 + i}`,
      client: clients[i % clients.length],
      concept: [
        "Canon de arrendamiento",
        "Comisión comercial",
        "Servicios fiduciarios",
      ][i % 3],
      status: i % 4 === 0 ? "Pagada" : i % 5 === 0 ? "En mora" : "Pendiente",
      value: 9800000 + i * 325000,
      dueDate: `2025-${String((i % 9) + 1).padStart(2, "0")}-20`,
    })),
    portal: records(30, (i) => ({
      code: `SOL-${String(i + 1).padStart(3, "0")}`,
      client: i < 8 ? "Carlos Arturo Mendoza" : clients[i % clients.length],
      type: ["Visita", "Prórroga", "Certificado", "Soporte"][i % 4],
      status: i % 3 === 0 ? "Resuelta" : "En proceso",
      detail: `Solicitud de ${["visita técnica", "prórroga contractual", "certificado tributario", "soporte de pago"][i % 4]}`,
    })),
    security: records(30, (i) => ({
      code: `SEC-${String(i + 1).padStart(3, "0")}`,
      event: [
        "Inicio de sesión",
        "Cambio de permiso",
        "Intento bloqueado",
        "Exportación",
      ][i % 4],
      severity: ["Informativa", "Media", "Alta"][i % 3],
      user: demoUsers[i % demoUsers.length].name,
      status: i % 3 === 0 ? "Revisado" : "Pendiente",
    })),
    users: demoUsers.map((user) => ({
      ...user,
      createdAt: now,
      updatedAt: now,
    })),
  }
}

export const dataModules: ModuleId[] = [
  "inventory",
  "crm",
  "contracts",
  "people",
  "billing",
  "portal",
  "security",
  "users",
]
