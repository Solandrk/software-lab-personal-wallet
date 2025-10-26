import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import type { TransactionKind, TransactionInput } from '../../../types'
import { useTransactions } from '../context/TransactionsContext'

type TransactionFormState = Omit<TransactionInput, 'amount'> & {
  amount: string
}

const CATEGORY_OPTIONS = [
  'General',
  'Salary',
  'Food',
  'Housing',
  'Transportation',
  'Utilities',
  'Healthcare',
  'Entertainment',
  'Education',
  'Investment',
  'Savings',
]

const defaultState: TransactionFormState = {
  category: CATEGORY_OPTIONS[0],
  amount: '',
  type: 'expense',
  description: '',
  date: new Date().toISOString().slice(0, 10),
}

export const TransactionForm = () => {
  const { addTransaction, isSubmitting } = useTransactions()
  const [formState, setFormState] = useState<TransactionFormState>(defaultState)
  const [formError, setFormError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState<boolean>(false)

  const typeOptions = useMemo<TransactionKind[]>(() => ['income', 'expense'], [])

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target
    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }))
    setFormError(null)
  }

  const resetForm = () => {
    setFormState((prev) => ({
      ...defaultState,
      category: prev.category,
      date: defaultState.date,
    }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSuccess(false)

    const parsedAmount = Number(formState.amount)
    if (!formState.category) {
      setFormError('Category is required')
      return
    }
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setFormError('Enter a valid amount greater than zero')
      return
    }

    try {
      await addTransaction({
        category: formState.category,
        amount: parsedAmount,
        type: formState.type,
        description: formState.description?.trim() || undefined,
        date: formState.date,
      })
      resetForm()
      setIsSuccess(true)
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : 'Unable to add transaction right now',
      )
    }
  }

  return (
    <form className="transaction-form" onSubmit={handleSubmit} noValidate>
      <div className="transaction-form__header">
        <h2>Add Transaction</h2>
        <p>Log new incomes or expenses to keep your balance up to date.</p>
      </div>

      <div className="transaction-form__grid">
        <label className="transaction-form__field">
          <span>Category</span>
          <select
            name="category"
            value={formState.category}
            onChange={handleInputChange}
            required
          >
            {CATEGORY_OPTIONS.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>

        <label className="transaction-form__field">
          <span>Amount</span>
          <input
            type="number"
            min="0"
            step="1000"
            name="amount"
            placeholder="0"
            value={formState.amount}
            onChange={handleInputChange}
            required
            inputMode="decimal"
          />
        </label>

        <label className="transaction-form__field">
          <span>Type</span>
          <select
            name="type"
            value={formState.type}
            onChange={handleInputChange}
            required
          >
            {typeOptions.map((type) => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </label>

        <label className="transaction-form__field">
          <span>Date</span>
          <input
            type="date"
            name="date"
            value={formState.date}
            onChange={handleInputChange}
            required
          />
        </label>
      </div>

      <label className="transaction-form__field">
        <span>Description</span>
        <textarea
          name="description"
          placeholder="Add some notes (optional)"
          value={formState.description}
          onChange={handleInputChange}
          rows={3}
        />
      </label>

      <div className="transaction-form__footer">
        <div className="transaction-form__status" role="status">
          {formError && <span className="transaction-form__error">{formError}</span>}
          {!formError && isSuccess && (
            <span className="transaction-form__success">Transaction added successfully</span>
          )}
        </div>
        <button type="submit" className="transaction-form__submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Add Transaction'}
        </button>
      </div>
    </form>
  )
}
