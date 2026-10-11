import { Building2 } from "lucide-react"

interface BrandLogoProps {
  theme?: "dark" | "light"

  className?: string
}

export function BrandLogo({
  theme = "dark",

  className = "",
}: BrandLogoProps) {
  const isDark = theme === "dark"

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div
        className={`flex items-center justify-center rounded-xl border p-2 ${
          isDark
            ? "border-slate-700/50 bg-slate-800/50"
            : "border-amber-100 bg-amber-50"
        }`}
      >
        <Building2 className="h-7 w-7 text-amber-500" />
      </div>
      <div className="flex flex-col justify-center">
        <span
          className={`text-2xl font-extrabold leading-none tracking-tight ${
            isDark ? "text-white" : "text-slate-900"
          }`}
        >
          Vesta <span className="font-bold text-amber-500">ERP</span>
        </span>
        <span
          className={`mt-1 text-[0.7rem] font-bold uppercase tracking-[0.15em] ${
            isDark ? "text-slate-400" : "text-slate-500"
          }`}
        >
          Realty-Sync
        </span>
      </div>
    </div>
  )
}
