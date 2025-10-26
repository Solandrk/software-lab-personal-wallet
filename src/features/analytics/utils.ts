import { format, isAfter, isBefore, parseISO } from 'date-fns'
import type { Transaction } from '../../types'

export type DateRange = {
  startDate?: string
  endDate?: string
}

export const filterByDateRange = (transactions: Transaction[], range: DateRange) => {
  if (!range.startDate && !range.endDate) {
    return transactions
  }

  const start = range.startDate ? parseISO(range.startDate) : null
  const end = range.endDate ? parseISO(range.endDate) : null

  return transactions.filter((transaction) => {
    const date = parseISO(transaction.date)

    if (start && isBefore(date, start)) {
      return false
    }

    if (end && isAfter(date, end)) {
      return false
    }

    return true
  })
}

export const groupExpensesByCategory = (transactions: Transaction[]) => {
  const expenses = transactions.filter((transaction) => transaction.type === 'expense')
  const totals = new Map<string, number>()

  expenses.forEach((transaction) => {
    const current = totals.get(transaction.category) ?? 0
    totals.set(transaction.category, current + transaction.amount)
  })

  const overall = Array.from(totals.values()).reduce((acc, value) => acc + value, 0)

  return Array.from(totals.entries())
    .map(([category, value]) => ({
      category,
      value,
      percentage: overall ? Math.round((value / overall) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.value - a.value)
}

export const buildIncomeExpenseSeries = (transactions: Transaction[]) => {
  const series = new Map<string, { income: number; expense: number; date: Date }>()

  transactions.forEach((transaction) => {
    const date = parseISO(transaction.date)
    const key = format(date, 'MMM yyyy')

    if (!series.has(key)) {
      series.set(key, { income: 0, expense: 0, date })
    }

    const bucket = series.get(key)!

    if (transaction.type === 'income') {
      bucket.income += transaction.amount
    } else {
      bucket.expense += transaction.amount
    }
  })

  return Array.from(series.entries())
    .map(([label, value]) => ({
      label,
      income: value.income,
      expense: value.expense,
      date: value.date,
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime())
}

export const calculateFinancialStats = (transactions: Transaction[]) => {
  if (!transactions.length) {
    return {
      totalTransactions: 0,
      totalIncome: 0,
      totalExpense: 0,
      balance: 0,
      averageTransaction: 0,
      topIncomeCategory: null as string | null,
      topExpenseCategory: null as string | null,
    }
  }

  const totals = transactions.reduce(
    (acc, transaction) => {
      if (transaction.type === 'income') {
        acc.totalIncome += transaction.amount
        acc.incomeCategories.set(
          transaction.category,
          (acc.incomeCategories.get(transaction.category) ?? 0) + transaction.amount,
        )
      } else {
        acc.totalExpense += transaction.amount
        acc.expenseCategories.set(
          transaction.category,
          (acc.expenseCategories.get(transaction.category) ?? 0) + transaction.amount,
        )
      }

      acc.totalTransactions += 1
      acc.totalAmount += transaction.amount

      return acc
    },
    {
      totalTransactions: 0,
      totalIncome: 0,
      totalExpense: 0,
      totalAmount: 0,
      incomeCategories: new Map<string, number>(),
      expenseCategories: new Map<string, number>(),
    },
  )

  const pickTopCategory = (entries: Map<string, number>) => {
    let topName: string | null = null
    let topValue = Number.NEGATIVE_INFINITY

    entries.forEach((value, name) => {
      if (value > topValue) {
        topValue = value
        topName = name
      }
    })

    return topName
  }

  return {
    totalTransactions: totals.totalTransactions,
    totalIncome: totals.totalIncome,
    totalExpense: totals.totalExpense,
    balance: totals.totalIncome - totals.totalExpense,
    averageTransaction: totals.totalAmount / totals.totalTransactions,
    topIncomeCategory: pickTopCategory(totals.incomeCategories),
    topExpenseCategory: pickTopCategory(totals.expenseCategories),
  }
}
