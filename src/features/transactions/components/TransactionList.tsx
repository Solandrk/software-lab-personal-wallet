import { useMemo } from 'react'
import type { Transaction } from '../../../types'
import { formatCurrency, formatDate } from '../../../utils'
import { useTransactions } from '../context/TransactionsContext'

const renderStatus = (
  isLoading: boolean,
  error: string | null,
  transactions: Transaction[],
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

  return null
}

export const TransactionList = () => {
  const { transactions, isLoading, error } = useTransactions()

  const totals = useMemo(() => {
    return transactions.reduce(
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
  }, [transactions])

  const status = renderStatus(isLoading, error, transactions)

  return (
    <section className="transaction-list" aria-labelledby="transactions-heading">
      <header className="transaction-list__header">
        <div>
          <h2 id="transactions-heading">Recent Transactions</h2>
          <p>
            {formatCurrency(totals.incomes - totals.expenses)} balance snapshot ·{' '}
            {transactions.length} records
          </p>
        </div>
      </header>

      {status && <div className="transaction-list__status">{status}</div>}

      {!status && (
        <ul className="transaction-list__items">
          {transactions.map((transaction) => (
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
