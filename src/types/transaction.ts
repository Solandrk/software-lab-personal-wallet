export type TransactionKind = 'income' | 'expense'

export interface TransactionInput {
  category: string
  amount: number
  type: TransactionKind
  description?: string
  date: string
}

export interface Transaction {
  id: number
  category: string
  amount: number
  type: TransactionKind
  description?: string
  date: string
  createdAt: string
  updatedAt?: string
}

export interface TransactionFilters {
  query?: string
  type?: TransactionKind | 'all'
  category?: string
  startDate?: string
  endDate?: string
}
