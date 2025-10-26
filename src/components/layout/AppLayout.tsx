import { Outlet } from 'react-router-dom'
import { Navigation } from '../common/Navigation'

export const AppLayout = () => {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <span className="brand__accent">Wallet</span>
          <span>Manager</span>
        </div>
        <Navigation />
      </header>
      <main className="app-content">
        <Outlet />
      </main>
    </div>
  )
}
