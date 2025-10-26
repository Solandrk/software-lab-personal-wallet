import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts'
import type { Transaction } from '../../../types'
import { formatCurrency } from '../../../utils'
import { groupExpensesByCategory } from '../utils'

const COLORS = ['#2563eb', '#7c3aed', '#f97316', '#0ea5e9', '#facc15', '#14b8a6', '#ef4444']

type ExpenseCategoryPieChartProps = {
  transactions: Transaction[]
}

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ payload: { category: string; value: number; percentage: number } }>
}) => {
  if (!active || !payload?.length) return null

  const { category, value, percentage } = payload[0].payload

  return (
    <div className="analytics-tooltip">
      <strong>{category}</strong>
      <span>{formatCurrency(value)}</span>
      <span>{percentage}% of expenses</span>
    </div>
  )
}

export const ExpenseCategoryPieChart = ({ transactions }: ExpenseCategoryPieChartProps) => {
  const data = groupExpensesByCategory(transactions)
  const totalExpense = data.reduce((acc, item) => acc + item.value, 0)

  if (!data.length) {
    return (
      <section className="analytics-card" aria-label="Expense by category">
        <header className="analytics-card__header">
          <h3>Spending by Category</h3>
        </header>
        <div className="analytics-card__empty">No expense data available for the selected range.</div>
      </section>
    )
  }

  return (
    <section className="analytics-card" aria-label="Expense by category">
      <header className="analytics-card__header">
        <div>
          <h3>Spending by Category</h3>
          <p>Total expense {formatCurrency(totalExpense)}</p>
        </div>
      </header>
      <div className="analytics-card__chart">
        <ResponsiveContainer width="100%" height={320}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={140}
              paddingAngle={3}
              dataKey="value"
              nameKey="category"
            >
              {data.map((entry, index) => (
                <Cell key={entry.category} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <ul className="analytics-card__legend">
          {data.map((item, index) => (
            <li key={item.category}>
              <span
                className="analytics-card__legend-color"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="analytics-card__legend-label">{item.category}</span>
              <span className="analytics-card__legend-value">
                {item.percentage}%
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
