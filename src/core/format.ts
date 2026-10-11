export const formatCOP = (value: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",

    currency: "COP",

    maximumFractionDigits: 0,
  }).format(value)

export const formatCompactCOP = (value: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",

    currency: "COP",

    notation: "compact",

    maximumFractionDigits: 1,
  }).format(value)
