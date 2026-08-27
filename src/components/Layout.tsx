import type { ComponentType, ReactNode } from 'react'
import type { PageId, User } from '../types'
import { OverviewIcon, ActivitiesIcon, GoalsIcon } from './NavIcons'

interface NavItem {
  id: PageId
  label: string
  Icon: ComponentType<{ size?: number }>
}

const NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: 'Översikt', Icon: OverviewIcon },
  { id: 'activities', label: 'Aktiviteter', Icon: ActivitiesIcon },
  { id: 'goals', label: 'Mål', Icon: GoalsIcon },
]

interface LayoutProps {
  activePage: PageId
  onNavigate: (page: PageId) => void
  user: User
  onLogout: () => void
  children: ReactNode
}

export function Layout({ activePage, onNavigate, user, onLogout, children }: LayoutProps) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">ClaudeTrainer</div>
        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activePage === item.id ? 'active' : ''}`}
              onClick={() => onNavigate(item.id)}
            >
              <span className="nav-icon">
                <item.Icon />
              </span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-user">
          <span className="sidebar-user-name">{user.name}</span>
          <button type="button" className="sidebar-logout" onClick={onLogout}>
            Logga ut
          </button>
        </div>
      </aside>

      <div className="app-content">
        <header className="mobile-header">
          <span className="mobile-header-brand">ClaudeTrainer</span>
          <button type="button" className="mobile-logout" onClick={onLogout}>
            Logga ut
          </button>
        </header>

        <main className="page">{children}</main>
      </div>

      <nav className="bottom-nav">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            className={`bottom-nav-item ${activePage === item.id ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}
          >
            <span className="nav-icon">
              <item.Icon />
            </span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
