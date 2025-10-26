import { useMemo } from 'react'
import { formatCurrency, formatDate } from '../../../utils'
import { useTransactions } from '../context/TransactionsContext'

const prepareSummary = (transactionsLength: number) => {
  const message = transactionsLength === 0 ? 'No transactions yet' : `${transactionsLength} recorded`
  return message
}

export const WalletSummary = () => {
  const { transactions, isLoading } = useTransactions()

  const summary = useMemo(() => {
    return transactions.reduce(
      (acc, transaction) => {
        if (transaction.type === 'income') {
          acc.totalIncome += transaction.amount
          acc.incomeCount += 1
        } else {
          acc.totalExpense += transaction.amount
          acc.expenseCount += 1
        }
        return acc
      },
      {
        totalIncome: 0,
        totalExpense: 0,
        incomeCount: 0,
        expenseCount: 0,
      },
    )
  }, [transactions])

  const balance = summary.totalIncome - summary.totalExpense
  const lastTransaction = transactions[0]
  const lastActivity = lastTransaction ? formatDate(lastTransaction.date) : '—'
  const transactionsMessage = prepareSummary(transactions.length)

  return (
    <section className="wallet-summary" aria-live="polite">
      <header className="wallet-summary__header">
        <div>
          <h2>Wallet Balance</h2>
          <p>Up-to-date snapshot of your income and spending.</p>
        </div>
        {isLoading && <span className="wallet-summary__status">Refreshing…</span>}
      </header>

      <div className="wallet-summary__cards">
        <article className="wallet-summary__card wallet-summary__card--balance">
          <h3>Current Balance</h3>
          <p className="wallet-summary__value">{formatCurrency(balance)}</p>
          <span className="wallet-summary__meta">{transactionsMessage}</span>
        </article>

        <article className="wallet-summary__card wallet-summary__card--income">
          <h3>Total Income</h3>
          <p className="wallet-summary__value">{formatCurrency(summary.totalIncome)}</p>
          <span className="wallet-summary__meta">
            {summary.incomeCount} {summary.incomeCount === 1 ? 'entry' : 'entries'}
          </span>
        </article>

        <article className="wallet-summary__card wallet-summary__card--expense">
          <h3>Total Expense</h3>
          <p className="wallet-summary__value">{formatCurrency(summary.totalExpense)}</p>
          <span className="wallet-summary__meta">
            {summary.expenseCount} {summary.expenseCount === 1 ? 'entry' : 'entries'}
          </span>
        </article>
      </div>

      <footer className="wallet-summary__footer">
        <span className="wallet-summary__footer-label">Last activity</span>
        <span>{lastActivity}</span>
      </footer>
    </section>
  )
}
