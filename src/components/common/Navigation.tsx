import { NavLink } from 'react-router-dom'

type NavItem = {
  to: string
  label: string
  end?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/analytics', label: 'Analytics' },
  { to: '/budget', label: 'Budget' },
]

export const Navigation = () => {
  return (
    <nav className="app-nav">
      {NAV_ITEMS.map(({ to, label, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            isActive ? 'nav-link nav-link--active' : 'nav-link'
          }
        >
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
