import { apiClient } from '../../services/api'
import type { BudgetInput, BudgetRecord } from '../../types'

const RESOURCE = '/budgets'

export const fetchBudgets = () => apiClient.get<BudgetRecord[]>(RESOURCE)

export const createBudget = (input: BudgetInput) => {
  const payload = {
    ...input,
    amount: Number(input.amount),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  return apiClient.post<BudgetRecord>(RESOURCE, payload)
}

export const updateBudget = (id: number, input: Partial<BudgetInput>) => {
  const payload = {
    ...input,
    amount: input.amount !== undefined ? Number(input.amount) : undefined,
    updatedAt: new Date().toISOString(),
  }

  return apiClient.patch<BudgetRecord>(`${RESOURCE}/${id}`, payload)
}

export const deleteBudget = (id: number) => apiClient.delete(`${RESOURCE}/${id}`)
