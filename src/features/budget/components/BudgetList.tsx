import { useMemo } from 'react'
import { formatCurrency } from '../../../utils'
import { useBudgets } from '../context/BudgetContext'
import { useTransactions } from '../../transactions'
import { buildBudgetsWithProgress, formatBudgetMonth, getBudgetProgressColor } from '../utils'

export const BudgetList = () => {
  const { budgets, isLoading, error, removeBudget, isMutating } = useBudgets()
  const { transactions } = useTransactions()

  const budgetsWithProgress = useMemo(
    () => buildBudgetsWithProgress(budgets, transactions),
    [budgets, transactions],
  )

  if (isLoading) {
    return <div className="budget-card">Loading budgets…</div>
  }

  if (error) {
    return <div className="budget-card">{error}</div>
  }

  if (!budgetsWithProgress.length) {
    return <div className="budget-card">No budgets defined yet. Add your first monthly limit.</div>
  }

  return (
    <div className="budget-grid">
      {budgetsWithProgress.map((budget) => {
        const remaining = budget.amount - budget.spent
        const monthLabel = formatBudgetMonth(budget.month)
        const alertClass =
          budget.status === 'over'
            ? 'budget-card__alert budget-card__alert--danger'
            : 'budget-card__alert budget-card__alert--warning'

        return (
          <article key={budget.id} className="budget-card">
            <header className="budget-card__header">
              <div>
                <span className="budget-card__month">{monthLabel}</span>
                <div className="budget-card__meta">
                  Budgeted {formatCurrency(budget.amount)} · {budget.alertsEnabled ? 'Alerts on' : 'Alerts off'}
                </div>
              </div>
              <button
                type="button"
                className="budget-card__button"
                onClick={() => {
                  void removeBudget(budget.id)
                }}
                disabled={isMutating}
              >
                Remove
              </button>
            </header>

            <div className="budget-card__progress">
              <div className="budget-card__progress-bar">
                <span
                  className="budget-card__progress-fill"
                  style={{
                    width: `${Math.min(budget.progress, 100)}%`,
                    background: getBudgetProgressColor(budget.status),
                  }}
                />
              </div>
              <div className="budget-card__stats">
                <span>Spent {formatCurrency(budget.spent)}</span>
                <span>
                  {remaining >= 0 ? `${formatCurrency(remaining)} left` : `${formatCurrency(Math.abs(remaining))} over`}
                </span>
              </div>
            </div>

            {budget.alertsEnabled && budget.status !== 'under' && (
              <div className={alertClass}>
                {budget.status === 'over' ? 'Budget exceeded' : 'Approaching budget limit'}
              </div>
            )}
          </article>
        )
      })}
    </div>
  )
}
