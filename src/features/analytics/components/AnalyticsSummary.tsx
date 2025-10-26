import { calculateFinancialStats } from '../utils'
import type { Transaction } from '../../../types'
import { formatCurrency } from '../../../utils'

type AnalyticsSummaryProps = {
  transactions: Transaction[]
}

export const AnalyticsSummary = ({ transactions }: AnalyticsSummaryProps) => {
  const stats = calculateFinancialStats(transactions)

  return (
    <section className="analytics-card" aria-label="Financial statistics">
      <header className="analytics-card__header">
        <h3>Financial Statistics</h3>
      </header>
      <div className="analytics-summary__grid">
        <div className="analytics-summary__item">
          <span className="analytics-summary__label">Total Transactions</span>
          <strong className="analytics-summary__value">{stats.totalTransactions}</strong>
        </div>
        <div className="analytics-summary__item">
          <span className="analytics-summary__label">Total Income</span>
          <strong className="analytics-summary__value">{formatCurrency(stats.totalIncome)}</strong>
        </div>
        <div className="analytics-summary__item">
          <span className="analytics-summary__label">Total Expense</span>
          <strong className="analytics-summary__value">{formatCurrency(stats.totalExpense)}</strong>
        </div>
        <div className="analytics-summary__item">
          <span className="analytics-summary__label">Balance</span>
          <strong
            className={`analytics-summary__value ${
              stats.balance >= 0
                ? 'analytics-summary__value--positive'
                : 'analytics-summary__value--negative'
            }`}
          >
            {formatCurrency(stats.balance)}
          </strong>
        </div>
        <div className="analytics-summary__item">
          <span className="analytics-summary__label">Average Transaction</span>
          <strong className="analytics-summary__value">{formatCurrency(stats.averageTransaction)}</strong>
        </div>
        <div className="analytics-summary__item">
          <span className="analytics-summary__label">Top Income Category</span>
          <strong className="analytics-summary__value">
            {stats.topIncomeCategory ?? '—'}
          </strong>
        </div>
        <div className="analytics-summary__item">
          <span className="analytics-summary__label">Top Expense Category</span>
          <strong className="analytics-summary__value">
            {stats.topExpenseCategory ?? '—'}
          </strong>
        </div>
      </div>
    </section>
  )
}
