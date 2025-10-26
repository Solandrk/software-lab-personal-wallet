import { BudgetForm, BudgetList } from '../features/budget'

export const BudgetPage = () => {
  return (
    <section className="page" aria-labelledby="budget-heading">
      <header className="page-header">
        <h1 id="budget-heading" className="page-header__title">
          Budget Planner
        </h1>
        <p className="page-header__subtitle">
          Set monthly goals and track progress against your planned spending.
        </p>
      </header>

      <BudgetForm />

      <BudgetList />
    </section>
  )
}
