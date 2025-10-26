import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { createTransaction, fetchTransactions } from '../api'
import type { Transaction, TransactionInput } from '../../../types'

type TransactionsContextValue = {
  transactions: Transaction[]
  isLoading: boolean
  isSubmitting: boolean
  error: string | null
  addTransaction: (payload: TransactionInput) => Promise<void>
  refreshTransactions: () => Promise<void>
}

const TransactionsContext = createContext<TransactionsContextValue | null>(null)

const initialState: TransactionsContextValue = {
  transactions: [],
  isLoading: false,
  isSubmitting: false,
  error: null,
  addTransaction: async () => {},
  refreshTransactions: async () => {},
}

export const TransactionsProvider = ({ children }: { children: ReactNode }) => {
  const [transactions, setTransactions] = useState<Transaction[]>(
    initialState.transactions,
  )
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(initialState.error)

  const loadTransactions = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await fetchTransactions()
      const sorted = data.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      )
      setTransactions(sorted)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unable to load transactions'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadTransactions()
  }, [loadTransactions])

  const addTransaction = useCallback(async (payload: TransactionInput) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const created = await createTransaction(payload)
      setTransactions((prev) => [created, ...prev])
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unable to add transaction'
      setError(message)
      throw err
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  const value = useMemo<TransactionsContextValue>(
    () => ({
      transactions,
      isLoading,
      isSubmitting,
      error,
      addTransaction,
      refreshTransactions: loadTransactions,
    }),
    [transactions, isLoading, isSubmitting, error, addTransaction, loadTransactions],
  )

  return <TransactionsContext.Provider value={value}>{children}</TransactionsContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useTransactions = () => {
  const context = useContext(TransactionsContext)
  if (!context) {
    throw new Error('useTransactions must be used within TransactionsProvider')
  }

  return context
}
