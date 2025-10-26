import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { BudgetProvider } from './features/budget'
import { TransactionsProvider } from './features/transactions'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <TransactionsProvider>
        <BudgetProvider>
          <App />
        </BudgetProvider>
      </TransactionsProvider>
    </BrowserRouter>
  </StrictMode>,
)
