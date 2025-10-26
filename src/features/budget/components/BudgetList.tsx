import { useMemo } from 'react'
import { format, parseISO } from 'date-fns'
import { formatCurrency } from '../../../utils'
import type { BudgetWithProgress, BudgetRecord } from '../../../types'
import { useBudgets } from '../context/BudgetContext'
import { useTransactions } from '../../transactions'

const computeProgress = (budget: BudgetRecord, expensesByMonth: Map<string, number>): BudgetWithProgress => {
  const spent = expensesByMonth.get(budget.month) ?? 0
  const progress = budget.amount > 0 ? Math.min((spent / budget.amount) * 100, 150) : 100

  let status: BudgetWithProgress['status'] = 'under'

  if (budget.amount <= 0 && spent > 0) {
    status = 'over'
  } else if (spent >= budget.amount) {
    status = 'over'
  } else if (spent >= budget.amount * 0.8) {
    status = 'warning'
  }

  return {
    ...budget,
    spent,
    progress: Number.isFinite(progress) ? progress : 0,
    status,
  }
}

const getProgressColor = (status: BudgetWithProgress['status']) => {
  if (status === 'over') return 'linear-gradient(90deg, #ef4444, #dc2626)'
  if (status === 'warning') return 'linear-gradient(90deg, #f59e0b, #f97316)'
  return 'linear-gradient(90deg, #2563eb, #1d4ed8)'
}

export const BudgetList = () => {
  const { budgets, isLoading, error, removeBudget, isMutating } = useBudgets()
  const { transactions } = useTransactions()

  const expensesByMonth = useMemo(() => {
    const map = new Map<string, number>()

    transactions
      .filter((transaction) => transaction.type === 'expense')
      .forEach((transaction) => {
        const date = parseISO(transaction.date)
        const key = format(date, 'yyyy-MM')
        map.set(key, (map.get(key) ?? 0) + transaction.amount)
      })

    return map
  }, [transactions])

  const budgetsWithProgress = useMemo(
    () => budgets.map((budget) => computeProgress(budget, expensesByMonth)),
    [budgets, expensesByMonth],
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
        const monthLabel = format(parseISO(`${budget.month}-01`), 'LLLL yyyy')
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
                  style={{ width: `${Math.min(budget.progress, 100)}%`, background: getProgressColor(budget.status) }}
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
