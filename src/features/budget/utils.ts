import { format, parseISO } from 'date-fns'
import type { BudgetRecord, BudgetWithProgress, Transaction } from '../../types'

const parseMonthKey = (value: string) => format(parseISO(`${value}-01`), 'LLLL yyyy')

const determineStatus = (budget: BudgetRecord, spent: number): BudgetWithProgress['status'] => {
  if (budget.amount <= 0 && spent > 0) {
    return 'over'
  }

  if (spent >= budget.amount) {
    return 'over'
  }

  if (spent >= budget.amount * 0.8) {
    return 'warning'
  }

  return 'under'
}

export const buildBudgetsWithProgress = (
  budgets: BudgetRecord[],
  transactions: Transaction[],
): BudgetWithProgress[] => {
  const expensesByMonth = transactions
    .filter((transaction) => transaction.type === 'expense')
    .reduce((map, transaction) => {
      const monthKey = format(parseISO(transaction.date), 'yyyy-MM')
      map.set(monthKey, (map.get(monthKey) ?? 0) + transaction.amount)
      return map
    }, new Map<string, number>())

  return budgets.map((budget) => {
    const spent = expensesByMonth.get(budget.month) ?? 0
    const rawProgress = budget.amount > 0 ? (spent / budget.amount) * 100 : 100
    const progress = Number.isFinite(rawProgress) ? Math.min(rawProgress, 150) : 0

    return {
      ...budget,
      spent,
      progress,
      status: determineStatus(budget, spent),
    }
  })
}

export const getBudgetProgressColor = (status: BudgetWithProgress['status']) => {
  if (status === 'over') return 'linear-gradient(90deg, #ef4444, #dc2626)'
  if (status === 'warning') return 'linear-gradient(90deg, #f59e0b, #f97316)'
  return 'linear-gradient(90deg, #2563eb, #1d4ed8)'
}

export const formatBudgetMonth = (value: string) => parseMonthKey(value)
