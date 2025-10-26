export interface BudgetRecord {
  id: number
  month: string
  amount: number
  category?: string
  alertsEnabled: boolean
  createdAt: string
  updatedAt?: string
}

export interface BudgetInput {
  month: string
  amount: number
  category?: string
  alertsEnabled: boolean
}

export interface BudgetWithProgress extends BudgetRecord {
  spent: number
  progress: number
  status: 'under' | 'warning' | 'over'
}
