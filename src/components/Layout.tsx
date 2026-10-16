import type { ComponentType, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import type { PageId } from '../types'
import { OverviewIcon, ActivitiesIcon, GoalsIcon, DownloadIcon, SettingsIcon } from './NavIcons'
import { Logo } from './Logo'
import { useInstallPrompt } from '../hooks/useInstallPrompt'

interface NavItem {
  id: PageId
  labelKey: string
  Icon: ComponentType<{ size?: number }>
}

const NAV_ITEMS: NavItem[] = [
  { id: 'overview', labelKey: 'nav.overview', Icon: OverviewIcon },
  { id: 'activities', labelKey: 'nav.activities', Icon: ActivitiesIcon },
  { id: 'goals', labelKey: 'nav.goals', Icon: GoalsIcon },
]

interface LayoutProps {
  activePage: PageId
  onNavigate: (page: PageId) => void
  userName: string
  onToggleSettings: () => void
  children: ReactNode
}

export function Layout({ activePage, onNavigate, userName, onToggleSettings, children }: LayoutProps) {
  const { t } = useTranslation()
  const { canInstall, promptInstall } = useInstallPrompt()

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <Logo />
          <span>Treni</span>
        </div>
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
              <span>{t(item.labelKey)}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          {userName && <span className="sidebar-footer-name">{userName}</span>}
          <div className="sidebar-footer-actions">
            {canInstall && (
              <button
                type="button"
                className="btn-icon"
                onClick={promptInstall}
                aria-label={t('common.install')}
                title={t('common.install')}
              >
                <DownloadIcon size={18} />
              </button>
            )}
            <button
              type="button"
              className={`btn-icon ${activePage === 'settings' ? 'active' : ''}`}
              onClick={onToggleSettings}
              aria-pressed={activePage === 'settings'}
              aria-label={t('common.settings')}
              title={t('common.settings')}
            >
              <SettingsIcon size={18} />
            </button>
          </div>
        </div>
      </aside>

      <div className="app-content">
        <header className="mobile-header">
          <span className="mobile-header-brand">
            <Logo size={22} />
            <span>Treni</span>
          </span>
          <div className="mobile-header-actions">
            {canInstall && (
              <button
                type="button"
                className="btn-icon"
                onClick={promptInstall}
                aria-label={t('common.install')}
                title={t('common.install')}
              >
                <DownloadIcon size={20} />
              </button>
            )}
            <button
              type="button"
              className={`btn-icon ${activePage === 'settings' ? 'active' : ''}`}
              onClick={onToggleSettings}
              aria-pressed={activePage === 'settings'}
              aria-label={t('common.settings')}
              title={t('common.settings')}
            >
              <SettingsIcon size={20} />
            </button>
          </div>
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
            <span className="nav-label">{t(item.labelKey)}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
