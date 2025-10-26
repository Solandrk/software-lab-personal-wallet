import { useMemo, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import type { BudgetInput } from '../../../types'
import { useBudgets } from '../context/BudgetContext'

const getCurrentMonth = () => new Date().toISOString().slice(0, 7)

type BudgetFormState = Omit<BudgetInput, 'amount'> & {
  amount: string
}

const initialState: BudgetFormState = {
  month: getCurrentMonth(),
  amount: '',
  alertsEnabled: true,
}

export const BudgetForm = () => {
  const { addBudget, editBudget, budgets, isMutating, error } = useBudgets()
  const [formState, setFormState] = useState<BudgetFormState>(initialState)
  const [status, setStatus] = useState<string>('')

  const existingMonths = useMemo(() => new Set(budgets.map((budget) => budget.month)), [budgets])

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = event.target
    setFormState((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
    setStatus('')
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatus('')

    const amountValue = Number(formState.amount)

    if (!formState.month) {
      setStatus('Select a month for the budget')
      return
    }

    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      setStatus('Enter a valid amount greater than zero')
      return
    }

    try {
      if (existingMonths.has(formState.month)) {
        const match = budgets.find((budget) => budget.month === formState.month)
        if (match) {
          await editBudget(match.id, {
            amount: amountValue,
            alertsEnabled: formState.alertsEnabled,
          })
          setStatus('Budget updated successfully')
        }
      } else {
        await addBudget({
          month: formState.month,
          amount: amountValue,
          alertsEnabled: formState.alertsEnabled,
        })
        setStatus('Budget created successfully')
      }

      setFormState((prev) => ({
        ...prev,
        amount: '',
      }))
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Unable to save budget right now')
    }
  }

  return (
    <form className="budget-form" onSubmit={handleSubmit} noValidate>
      <header>
        <h2>Define Monthly Budget</h2>
        <p>Keep spending in check by setting a target for each month.</p>
      </header>

      <div className="budget-form__grid">
        <label className="budget-form__field">
          <span>Month</span>
          <input
            type="month"
            name="month"
            value={formState.month}
            onChange={handleChange}
            required
          />
        </label>

        <label className="budget-form__field">
          <span>Amount</span>
          <input
            type="number"
            min="0"
            step="1000"
            name="amount"
            value={formState.amount}
            placeholder="0"
            onChange={handleChange}
            required
          />
        </label>
      </div>

      <label className="budget-form__toggle">
        <input
          type="checkbox"
          name="alertsEnabled"
          checked={formState.alertsEnabled}
          onChange={handleChange}
        />
        Enable alerts when spending nears or exceeds the budget
      </label>

      <div className="budget-form__status" role="status">
        {status || error}
      </div>

      <button type="submit" className="budget-form__submit" disabled={isMutating}>
        {existingMonths.has(formState.month) ? 'Update Budget' : 'Create Budget'}
      </button>
    </form>
  )
}
