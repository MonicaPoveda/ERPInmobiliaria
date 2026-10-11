import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react"

interface KpiCardProps {
  title: string

  value: string | number

  icon: LucideIcon

  detail: string

  accent?: "gold" | "blue" | "green" | "red"

  change?: {
    value: string

    direction: "positive" | "negative"
  }
}

const accentClasses: Record<NonNullable<KpiCardProps["accent"]>, string> = {
  gold: "bg-amber-50 text-amber-700",

  blue: "bg-blue-50 text-blue-700",

  green: "bg-emerald-50 text-emerald-700",

  red: "bg-rose-50 text-rose-700",
}

export default function KpiCard({
  title,

  value,

  icon: Icon,

  detail,

  accent = "gold",

  change,
}: KpiCardProps) {
  const ChangeIcon =
    change?.direction === "negative" ? ArrowDownRight : ArrowUpRight

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <strong className="mt-2 block truncate text-2xl font-bold tracking-tight text-slate-900">
            {value}
          </strong>
        </div>
        <span
          aria-hidden="true"
          className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${accentClasses[accent]}`}
        >
          <Icon size={21} />
        </span>
      </div>
      <div className="mt-4 flex min-h-5 items-center justify-between gap-2 text-xs text-slate-500">
        <span>{detail}</span>
        {change && (
          <span
            className={`inline-flex shrink-0 items-center gap-0.5 font-semibold ${
              change.direction === "positive"
                ? "text-emerald-700"
                : "text-rose-700"
            }`}
          >
            <ChangeIcon aria-hidden="true" size={14} />
            {change.value}
          </span>
        )}
      </div>
    </article>
  )
}
