import { format } from 'date-fns'
import type { Transaction } from '../../../types'

const escapeForCsv = (value: string | number | undefined) => {
  const stringValue = value === undefined ? '' : String(value)
  const escaped = stringValue.replace(/"/g, '""')
  return `"${escaped}"`
}

export const buildTransactionsCsv = (transactions: Transaction[]) => {
  const headers = ['Date', 'Type', 'Category', 'Amount', 'Description']

  const rows = transactions.map((transaction) => [
    format(new Date(transaction.date), 'yyyy-MM-dd'),
    transaction.type,
    transaction.category,
    transaction.amount,
    transaction.description ?? '',
  ])

  return [headers, ...rows]
    .map((row) => row.map(escapeForCsv).join(','))
    .join('\n')
}

export const downloadTransactionsCsv = (
  transactions: Transaction[],
  filename = 'wallet-transactions.csv',
) => {
  if (typeof window === 'undefined') return
  if (!transactions.length) return

  const csvContent = buildTransactionsCsv(transactions)
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const anchor = document.createElement('a')
  anchor.href = url
  anchor.setAttribute('download', filename)
  anchor.style.display = 'none'
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(url)
}
