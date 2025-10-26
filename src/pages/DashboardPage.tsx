import { TransactionForm, TransactionList } from '../features/transactions'

export const DashboardPage = () => {
  return (
    <section className="page" aria-labelledby="dashboard-heading">
      <header className="page-header">
        <h1 id="dashboard-heading" className="page-header__title">
          Wallet Overview
        </h1>
        <p className="page-header__subtitle">
          Track daily inflows and outflows to stay aligned with your budget.
        </p>
      </header>

      <TransactionForm />

      <TransactionList />
    </section>
  )
}
