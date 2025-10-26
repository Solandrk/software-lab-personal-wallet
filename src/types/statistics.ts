export interface FinancialSnapshot {
  totalIncome: number
  totalExpense: number
  balance: number
  incomeCount: number
  expenseCount: number
  averageTransaction: number
  highestIncome?: number
  highestExpense?: number
  savingsRate?: number
}
