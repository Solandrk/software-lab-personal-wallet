export interface Budget {
  id: string
  month: string
  amount: number
  spent: number
  category?: string
  alertsEnabled: boolean
  createdAt: string
  updatedAt?: string
}
