import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
} from 'recharts'
import type { Transaction } from '../../../types'
import { formatCurrency } from '../../../utils'
import { buildIncomeExpenseSeries } from '../utils'

type IncomeExpenseBarChartProps = {
  transactions: Transaction[]
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ payload: { income: number; expense: number } }>
  label?: string
}) => {
  if (!active || !payload?.length) return null

  const { income, expense } = payload[0].payload

  return (
    <div className="analytics-tooltip">
      <strong>{label}</strong>
      <span>Income: {formatCurrency(income)}</span>
      <span>Expense: {formatCurrency(expense)}</span>
    </div>
  )
}

const compactNumber = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
})

export const IncomeExpenseBarChart = ({ transactions }: IncomeExpenseBarChartProps) => {
  const data = buildIncomeExpenseSeries(transactions)

  if (!data.length) {
    return (
      <section className="analytics-card" aria-label="Income vs expense trend">
        <header className="analytics-card__header">
          <h3>Income vs Expense</h3>
        </header>
        <div className="analytics-card__empty">No data available for the selected date range.</div>
      </section>
    )
  }

  return (
    <section className="analytics-card" aria-label="Income vs expense trend">
      <header className="analytics-card__header">
        <div>
          <h3>Income vs Expense</h3>
          <p>Grouped by month</p>
        </div>
      </header>
      <div className="analytics-card__chart">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.35)" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} />
            <YAxis tickFormatter={(value) => compactNumber.format(value)} />
            <Tooltip content={<CustomTooltip />} />
            <Legend iconType="circle" />
            <Bar dataKey="income" fill="#22c55e" radius={[8, 8, 0, 0]} />
            <Bar dataKey="expense" fill="#ef4444" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
