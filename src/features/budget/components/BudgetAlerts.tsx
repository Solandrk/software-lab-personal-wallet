import { useMemo } from 'react'
import { formatCurrency } from '../../../utils'
import { useBudgets } from '../context/BudgetContext'
import { useTransactions } from '../../transactions'
import { buildBudgetsWithProgress, formatBudgetMonth } from '../utils'

export const BudgetAlerts = () => {
  const { budgets } = useBudgets()
  const { transactions } = useTransactions()

  const alerts = useMemo(() => {
    return buildBudgetsWithProgress(budgets, transactions)
      .filter((budget) => budget.status !== 'under')
      .sort((a, b) => (a.status === b.status ? b.progress - a.progress : a.status === 'over' ? -1 : 1))
  }, [budgets, transactions])

  if (!alerts.length) {
    return null
  }

  return (
    <section className="budget-alerts" aria-label="Budget alerts">
      <header className="budget-alerts__header">
        <h2>Budget Alerts</h2>
        <p>Keep an eye on the months that are close to hitting their limit.</p>
      </header>
      <ul className="budget-alerts__list">
        {alerts.map((budget) => {
          const remaining = budget.amount - budget.spent
          const isOver = budget.status === 'over'
          return (
            <li key={budget.id} className={`budget-alerts__item budget-alerts__item--${budget.status}`}>
              <div>
                <strong>{formatBudgetMonth(budget.month)}</strong>
                <span>{budget.alertsEnabled ? 'Alerts enabled' : 'Alerts muted'}</span>
              </div>
              <div className="budget-alerts__meta">
                <span>{formatCurrency(budget.spent)} spent</span>
                <span>{formatCurrency(Math.abs(remaining))} {isOver ? 'over' : 'left'}</span>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
