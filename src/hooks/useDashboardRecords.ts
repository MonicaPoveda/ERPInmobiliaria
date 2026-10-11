import { useCallback, useEffect, useState } from "react"

import type { EntityRecord, ModuleId } from "../core/types"

import { can } from "../core/permissions"

import { repository } from "../data/repository"

import { useApp } from "../state/AppContext"

function sanitizeDashboardRecord(module: ModuleId, record: EntityRecord) {
  if (module === "inventory") {
    const { value: _saleValue, ...safeRecord } = record

    return safeRecord
  }

  if (module === "people") {
    const {
      salary: _salary,

      payroll: _payroll,

      bankAccount: _bankAccount,

      ...safeRecord
    } = record

    return safeRecord
  }

  return record
}

export default function useDashboardRecords(modules: readonly ModuleId[]) {
  const { user } = useApp()

  const [data, setData] = useState<Partial<Record<ModuleId, EntityRecord[]>>>(
    {},
  )

  const [loading, setLoading] = useState(true)

  const [error, setError] = useState("")

  const load = useCallback(async () => {
    if (!user) {
      setData({})

      setLoading(false)

      return
    }

    setLoading(true)

    setError("")

    try {
      const allowedModules = modules.filter((module) => can(user, module))

      const records = await Promise.all(
        allowedModules.map(
          async (module) =>
            [
              module,

              (await repository.getAll(module)).map((record) =>
                sanitizeDashboardRecord(module, record),
              ),
            ] as const,
        ),
      )

      setData(Object.fromEntries(records))
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "No fue posible cargar los indicadores.",
      )
    } finally {
      setLoading(false)
    }
  }, [modules, user])

  useEffect(() => {
    void load()

    const update = () => void load()

    window.addEventListener(repository.eventName, update)

    return () => window.removeEventListener(repository.eventName, update)
  }, [load])

  return { data, loading, error, reload: () => void load() }
}
