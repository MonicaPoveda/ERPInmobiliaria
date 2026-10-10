import type { EntityRecord, ModuleId, User } from "../core/types"

export const demoUsers: User[] = [
  {
    id: "usr-admin",
    name: "Fernando Arias",
    email: "admin@ariasempire.com",
    password: "Admin2025!",
    role: "superAdmin",
    active: true,
    avatar: "FA",
  },
  {
    id: "usr-commercial",
    name: "Valentina Ríos",
    email: "asesor@ariasempire.com",
    password: "Asesor2025!",
    role: "asesorComercial",
    active: true,
    avatar: "VR",
  },
  {
    id: "usr-provider",
    name: "Laura Restrepo",
    email: "proveedores@ariasempire.com",
    password: "Proveedores2025!",
    role: "coordinadorProveedores",
    active: true,
    avatar: "LR",
  },
  {
    id: "usr-hr",
    name: "Mateo Holguín",
    email: "talento@ariasempire.com",
    password: "Talento2025!",
    role: "rrhh",
    active: true,
    avatar: "MH",
  },
  {
    id: "usr-finance",
    name: "Sofía Echeverry",
    email: "financiero@ariasempire.com",
    password: "Finanzas2025!",
    role: "tesorero",
    active: true,
    avatar: "SE",
  },
  {
    id: "usr-warehouse",
    name: "Andrés Pardo",
    email: "almacen@ariasempire.com",
    password: "Almacen2025!",
    role: "almacenista",
    active: true,
    avatar: "AP",
  },
  {
    id: "usr-director",
    name: "Camilo Restrepo",
    email: "director@ariasempire.com",
    password: "Director2025!",
    role: "directorComercial",
    active: true,
    avatar: "CR",
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
      quantity: i % 7 === 0 ? 2 : 18 + i,
      minStock: 5,
      owner: clients[i % clients.length],
    })),
    crm: records(34, (i) => ({
      name: clients[i % clients.length],
      email:
        i === 0 ? "cliente@ariasempire.com" : `contacto${i + 1}@empresa.com`,
      phone: `300${String(5000000 + i * 317).slice(0, 7)}`,
      stage: ["Contacto", "Negociación", "Cierre"][i % 3],
      advisor: people[i % 3],
      active: true,
      notes: i % 2 === 0 ? "Interesado en visita al inmueble." : "",
      discountApproved: false,
      commission: 850000 + i * 45000,
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
      birthday: `199${i % 10}-${String(new Date().getMonth() + 1).padStart(2, "0")}-${String((i % 27) + 1).padStart(2, "0")}`,
      contractEnd: `2026-${String(new Date().getMonth() + 1).padStart(2, "0")}-${String((i % 27) + 1).padStart(2, "0")}`,
      bankAccount: `****${String(1342 + i * 61).slice(-4)}`,
      contractPdf: `Contrato-${String(i + 1).padStart(3, "0")}.pdf`,
    })),
    billing: records(38, (i) => ({
      code: `FE-2024-${1082 + i}`,
      client: clients[i % clients.length],
      concept: [
        "Canon de arrendamiento",
        "Comisión comercial",
        "Servicios fiduciarios",
      ][i % 3],
      deal: `Negocio cerrado NC-${String(240 + i).padStart(3, "0")}`,
      subtotal: 9800000 + i * 325000,
      iva: Math.round((9800000 + i * 325000) * 0.19),
      retentions: Math.round((9800000 + i * 325000) * 0.025),
      status: i % 4 === 0 ? "Pagada" : i % 5 === 0 ? "En mora" : "Pendiente",
      value: Math.round((9800000 + i * 325000) * 1.165),
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
    suppliers: records(12, (i) => ({
      name: [
        "Construcciones del Valle SAS",
        "Servicios Integrales Andinos",
        "Tecnología Segura Colombia",
        "Mantenimientos Prime",
      ][i % 4],
      rut: `900${String(123456 + i * 731).slice(0, 6)}-${i % 9}`,
      contact: `contacto${i + 1}@proveedor.com`,
      services: ["Mantenimiento locativo", "Seguridad", "Aseo"][i % 3],
      status: i % 4 === 0 ? "Evaluación pendiente" : "Activo",
      rating: 3 + (i % 3),
      lastService: "Mantenimiento preventivo de sede",
      serviceHistory:
        "Servicio recibido y verificado. Cumplimiento de tiempos: 100%.",
    })),
    transactions: records(14, (i) => ({
      code: `TRX-${String(2041 + i).padStart(4, "0")}`,
      client: clients[i % clients.length],
      type: i % 2 === 0 ? "Pago recibido" : "Nota crédito",
      amount: 1250000 + i * 235000,
      status: i % 3 === 0 ? "Conciliada" : "Pendiente",
      date: `2025-06-${String((i % 27) + 1).padStart(2, "0")}`,
    })),
    expenses: records(12, (i) => ({
      code: `SOL-G-${String(i + 1).padStart(3, "0")}`,
      requester: people[i % people.length],
      concept: ["Reparación", "Suministros", "Transporte"][i % 3],
      amount: 480000 + i * 195000,
      status: i % 4 === 0 ? "Aprobada" : "Pendiente",
    })),
    movements: records(14, (i) => ({
      code: `MOV-${String(i + 1).padStart(3, "0")}`,
      product: ["Pintura blanca", "Luminaria LED", "Cerradura digital"][i % 3],
      type: i % 2 === 0 ? "Entrada" : "Salida",
      quantity: 5 + i * 2,
      purchaseOrder: `OC-${String(451 + i).padStart(4, "0")}`,
      date: `2025-06-${String((i % 27) + 1).padStart(2, "0")}`,
    })),
    kardex: records(18, (i) => ({
      product: ["Pintura blanca", "Luminaria LED", "Cerradura digital"][i % 3],
      movement: i % 2 === 0 ? "Entrada" : "Salida",
      quantity: 10 + i,
      balance: 48 - i,
      date: `2025-06-${String((i % 27) + 1).padStart(2, "0")}`,
      reference: `MOV-${String(i + 1).padStart(3, "0")}`,
    })),
    payroll: records(8, (i) => ({
      employee: people[i % people.length],
      type: i % 2 === 0 ? "Vacaciones" : "Incapacidad",
      days: i % 2 === 0 ? 5 : 2,
      status: i % 3 === 0 ? "Aprobada" : "Pendiente",
    })),
    team: records(12, (i) => ({
      name: clients[i % clients.length],
      advisor: people[i % 3],
      stage: ["Contacto", "Negociación", "Cierre"][i % 3],
      amount: 65000000 + i * 4200000,
      discountApproved: "No",
    })),
    users: demoUsers.map(
      ({ modulePermissions: _modulePermissions, ...user }) => ({
        ...user,
        createdAt: now,
        updatedAt: now,
      }),
    ),
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
  "suppliers",
  "transactions",
  "expenses",
  "movements",
  "kardex",
  "payroll",
  "team",
]
