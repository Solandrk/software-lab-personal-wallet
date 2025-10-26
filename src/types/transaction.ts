export type TransactionKind = 'income' | 'expense'

export interface Transaction {
  id: string
  category: string
  amount: number
  type: TransactionKind
  description?: string
  date: string
  createdAt: string
  updatedAt?: string
}
