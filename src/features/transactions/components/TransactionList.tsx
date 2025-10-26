import { useMemo, useState } from 'react'
import type { ChangeEvent } from 'react'
import type { Transaction, TransactionFilters } from '../../../types'
import { formatCurrency, formatDate } from '../../../utils'
import { useTransactions } from '../context/TransactionsContext'
import { TRANSACTION_CATEGORIES, TRANSACTION_TYPES } from '../constants'
import { downloadTransactionsCsv } from '../utils/export'

type TransactionFilterState = {
  query: string
  type: NonNullable<TransactionFilters['type']>
  category: string
  startDate: string
  endDate: string
}

const DEFAULT_FILTERS: TransactionFilterState = {
  query: '',
  type: 'all',
  category: 'all',
  startDate: '',
  endDate: '',
}

const hasActiveFilters = (filters: TransactionFilterState) =>
  Boolean(
    filters.query.trim() ||
      filters.type !== 'all' ||
      filters.category !== 'all' ||
      filters.startDate ||
      filters.endDate,
  )

const matchesFilters = (transaction: Transaction, filters: TransactionFilterState) => {
  const query = filters.query.trim().toLowerCase()
  const transactionDate = new Date(transaction.date)

  if (filters.type !== 'all' && transaction.type !== filters.type) {
    return false
  }

  if (filters.category !== 'all' && filters.category && transaction.category !== filters.category) {
    return false
  }

  if (filters.startDate) {
    const start = new Date(filters.startDate)
    if (!Number.isNaN(start.getTime()) && transactionDate < start) {
      return false
    }
  }

  if (filters.endDate) {
    const end = new Date(filters.endDate)
    if (!Number.isNaN(end.getTime()) && transactionDate > end) {
      return false
    }
  }

  if (query) {
    const haystack = `${transaction.category} ${transaction.description ?? ''}`.toLowerCase()
    if (!haystack.includes(query)) {
      return false
    }
  }

  return true
}

const renderStatus = (
  isLoading: boolean,
  error: string | null,
  transactions: Transaction[],
  filteredTransactions: Transaction[],
  hasFilters: boolean,
) => {
  if (isLoading) {
    return <div className="transaction-list__placeholder">Loading transactions…</div>
  }

  if (error) {
    return <div className="transaction-list__placeholder transaction-list__placeholder--error">{error}</div>
  }

  if (!transactions.length) {
    return (
      <div className="transaction-list__placeholder">
        <strong>No transactions yet.</strong>
        <span>Add your first income or expense to get started.</span>
      </div>
    )
  }

  if (!filteredTransactions.length) {
    return (
      <div className="transaction-list__placeholder">
        <strong>
          {hasFilters
            ? 'No transactions match your filters.'
            : 'No transactions available for this view.'}
        </strong>
        <span>Adjust or clear filters to see more records.</span>
      </div>
    )
  }

  return null
}

export const TransactionList = () => {
  const { transactions, isLoading, error } = useTransactions()
  const [filters, setFilters] = useState<TransactionFilterState>(DEFAULT_FILTERS)

  const filteredTransactions = useMemo(
    () => transactions.filter((transaction) => matchesFilters(transaction, filters)),
    [transactions, filters],
  )

  const activeFilters = hasActiveFilters(filters)

  const handleExport = () => {
    if (!filteredTransactions.length) return
    downloadTransactionsCsv(filteredTransactions)
  }

  const totals = useMemo(() => {
    return filteredTransactions.reduce(
      (acc, transaction) => {
        if (transaction.type === 'income') {
          acc.incomes += transaction.amount
        } else {
          acc.expenses += transaction.amount
        }
        return acc
      },
      { incomes: 0, expenses: 0 },
    )
  }, [filteredTransactions])

  const status = renderStatus(
    isLoading,
    error,
    transactions,
    filteredTransactions,
    activeFilters,
  )

  const handleFilterChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS)
  }

  return (
    <section className="transaction-list" aria-labelledby="transactions-heading">
      <header className="transaction-list__header">
        <div>
          <h2 id="transactions-heading">Transactions</h2>
          <p>
            {formatCurrency(totals.incomes - totals.expenses)} balance · {filteredTransactions.length}
            {filteredTransactions.length !== transactions.length && ` of ${transactions.length}`} records
          </p>
        </div>
        <div className="transaction-list__actions">
          <button
            type="button"
            className="transaction-list__export"
            onClick={handleExport}
            disabled={!filteredTransactions.length}
          >
            Export CSV
          </button>
          {activeFilters && (
            <button
              type="button"
              className="transaction-list__reset"
              onClick={handleResetFilters}
            >
              Clear filters
            </button>
          )}
        </div>
      </header>

      <div className="transaction-list__filters" role="group" aria-label="Transaction filters">
        <label className="transaction-list__filter">
          <span>Search</span>
          <input
            type="search"
            name="query"
            placeholder="Category or note"
            value={filters.query}
            onChange={handleFilterChange}
          />
        </label>

        <label className="transaction-list__filter">
          <span>Type</span>
          <select name="type" value={filters.type} onChange={handleFilterChange}>
            <option value="all">All</option>
            {TRANSACTION_TYPES.map((type) => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </label>

        <label className="transaction-list__filter">
          <span>Category</span>
          <select
            name="category"
            value={filters.category}
            onChange={handleFilterChange}
          >
            <option value="all">All</option>
            {TRANSACTION_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>

        <label className="transaction-list__filter">
          <span>From</span>
          <input
            type="date"
            name="startDate"
            value={filters.startDate}
            onChange={handleFilterChange}
          />
        </label>

        <label className="transaction-list__filter">
          <span>To</span>
          <input
            type="date"
            name="endDate"
            value={filters.endDate}
            onChange={handleFilterChange}
          />
        </label>
      </div>

      {status && <div className="transaction-list__status">{status}</div>}

      {!status && (
        <ul className="transaction-list__items">
          {filteredTransactions.map((transaction) => (
            <li key={transaction.id} className="transaction-list__item">
              <div className="transaction-list__item-main">
                <span className="transaction-list__category">{transaction.category}</span>
                {transaction.description && (
                  <span className="transaction-list__description">
                    {transaction.description}
                  </span>
                )}
              </div>
              <div className="transaction-list__meta">
                <span
                  className={
                    transaction.type === 'income'
                      ? 'transaction-list__amount transaction-list__amount--income'
                      : 'transaction-list__amount transaction-list__amount--expense'
                  }
                >
                  {transaction.type === 'income' ? '+' : '-'}
                  {formatCurrency(transaction.amount)}
                </span>
                <span className="transaction-list__date">{formatDate(transaction.date)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
