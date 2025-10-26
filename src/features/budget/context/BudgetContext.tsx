import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { createBudget, deleteBudget, fetchBudgets, updateBudget } from '../api'
import type { BudgetInput, BudgetRecord } from '../../../types'

type BudgetContextValue = {
  budgets: BudgetRecord[]
  isLoading: boolean
  isMutating: boolean
  error: string | null
  addBudget: (input: BudgetInput) => Promise<void>
  editBudget: (id: number, input: Partial<BudgetInput>) => Promise<void>
  removeBudget: (id: number) => Promise<void>
  refreshBudgets: () => Promise<void>
}

const BudgetContext = createContext<BudgetContextValue | null>(null)

const defaultState: BudgetContextValue = {
  budgets: [],
  isLoading: false,
  isMutating: false,
  error: null,
  addBudget: async () => {},
  editBudget: async () => {},
  removeBudget: async () => {},
  refreshBudgets: async () => {},
}

export const BudgetProvider = ({ children }: { children: ReactNode }) => {
  const [budgets, setBudgets] = useState<BudgetRecord[]>(defaultState.budgets)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isMutating, setIsMutating] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(defaultState.error)

  const loadBudgets = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await fetchBudgets()
      const sorted = data.sort((a, b) => (a.month > b.month ? -1 : 1))
      setBudgets(sorted)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to load budgets'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadBudgets()
  }, [loadBudgets])

  const addBudget = useCallback(async (input: BudgetInput) => {
    setIsMutating(true)
    setError(null)

    try {
      const created = await createBudget(input)
      setBudgets((prev) => [created, ...prev])
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to create budget'
      setError(message)
      throw err
    } finally {
      setIsMutating(false)
    }
  }, [])

  const editBudget = useCallback(async (id: number, input: Partial<BudgetInput>) => {
    setIsMutating(true)
    setError(null)

    try {
      const updated = await updateBudget(id, input)
      setBudgets((prev) => prev.map((budget) => (budget.id === id ? updated : budget)))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to update budget'
      setError(message)
      throw err
    } finally {
      setIsMutating(false)
    }
  }, [])

  const removeBudget = useCallback(async (id: number) => {
    setIsMutating(true)
    setError(null)

    try {
      await deleteBudget(id)
      setBudgets((prev) => prev.filter((budget) => budget.id !== id))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to remove budget'
      setError(message)
      throw err
    } finally {
      setIsMutating(false)
    }
  }, [])

  const value = useMemo<BudgetContextValue>(
    () => ({
      budgets,
      isLoading,
      isMutating,
      error,
      addBudget,
      editBudget,
      removeBudget,
      refreshBudgets: loadBudgets,
    }),
    [budgets, isLoading, isMutating, error, addBudget, editBudget, removeBudget, loadBudgets],
  )

  return <BudgetContext.Provider value={value}>{children}</BudgetContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useBudgets = () => {
  const context = useContext(BudgetContext)

  if (!context) {
    throw new Error('useBudgets must be used within BudgetProvider')
  }

  return context
}
