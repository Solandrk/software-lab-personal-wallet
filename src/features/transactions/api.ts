import { apiClient } from '../../services/api'
import type { Transaction, TransactionInput } from '../../types'

const RESOURCE = '/transactions'

export const fetchTransactions = () => apiClient.get<Transaction[]>(RESOURCE)

export const createTransaction = (input: TransactionInput) => {
  const payload = {
    ...input,
    amount: Number(input.amount),
    date: new Date(input.date).toISOString(),
    createdAt: new Date().toISOString(),
  }

  return apiClient.post<Transaction>(RESOURCE, payload)
}
