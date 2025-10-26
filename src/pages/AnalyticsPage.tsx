import { useMemo, useState } from 'react'
import type { ChangeEvent } from 'react'
import {
  AnalyticsSummary,
  ExpenseCategoryPieChart,
  IncomeExpenseBarChart,
} from '../features/analytics'
import { useTransactions } from '../features/transactions'
import { filterByDateRange, type DateRange } from '../features/analytics/utils'

export const AnalyticsPage = () => {
  const { transactions, isLoading } = useTransactions()
  const [dateRange, setDateRange] = useState<DateRange>({})

  const filteredTransactions = useMemo(
    () => filterByDateRange(transactions, dateRange),
    [transactions, dateRange],
  )

  const handleDateChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setDateRange((prev) => ({
      ...prev,
      [name]: value ? value : undefined,
    }))
  }

  const clearRange = () => {
    setDateRange({})
  }

  const hasActiveRange = Boolean(dateRange.startDate || dateRange.endDate)

  return (
    <section className="page" aria-labelledby="analytics-heading">
      <header className="page-header">
        <h1 id="analytics-heading" className="page-header__title">
          Analytics
        </h1>
        <p className="page-header__subtitle">
          Dive into spending patterns and income trends with visual insights.
        </p>
      </header>

      <div className="analytics-controls">
        <label className="analytics-controls__field">
          <span>From</span>
          <input
            type="date"
            name="startDate"
            value={dateRange.startDate ?? ''}
            onChange={handleDateChange}
          />
        </label>

        <label className="analytics-controls__field">
          <span>To</span>
          <input
            type="date"
            name="endDate"
            value={dateRange.endDate ?? ''}
            onChange={handleDateChange}
          />
        </label>

        {hasActiveRange && (
          <button type="button" className="analytics-controls__clear" onClick={clearRange}>
            Clear range
          </button>
        )}

        {isLoading && <span className="wallet-summary__status">Updating…</span>}
      </div>

      <AnalyticsSummary transactions={filteredTransactions} />

      <ExpenseCategoryPieChart transactions={filteredTransactions} />

      <IncomeExpenseBarChart transactions={filteredTransactions} />
    </section>
  )
}
