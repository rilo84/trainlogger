import { useEffect, useRef, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import type { Activity, AppSettings, Goal, NewGoal } from '../types'
import { goalConflicts } from '../utils'
import { Logo } from '../components/Logo'
import { AddActivityForm } from '../components/AddActivityForm'
import { AddGoalForm } from '../components/AddGoalForm'
import { GoalDescription } from '../components/GoalDescription'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { LANGUAGE_OPTIONS, THEME_OPTIONS } from './SettingsPage'

export interface OnboardingResult {
  name: string
  activities: Activity[]
  goals: Goal[]
}

interface OnboardingPageProps {
  settings: AppSettings
  onUpdateSettings: (settings: AppSettings) => void
  onComplete: (result: OnboardingResult) => void
  onSkip: () => void
}

const STEPS = ['profile', 'activities', 'goals', 'summary'] as const
type StepIndex = 0 | 1 | 2 | 3

function noop() {}

// First-run wizard. Name, activities and goals are kept as a local draft and only
// handed to App on the final "save"; theme and language apply immediately so the
// user sees their choice while picking it.
export function OnboardingPage({ settings, onUpdateSettings, onComplete, onSkip }: OnboardingPageProps) {
  const { t } = useTranslation()
  const [step, setStep] = useState<StepIndex>(0)
  const [name, setName] = useState(settings.name)
  const [activities, setActivities] = useState<Activity[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [confirmSkip, setConfirmSkip] = useState(false)
  const headingRef = useRef<HTMLHeadingElement>(null)

  const nameById = new Map(activities.map((a) => [a.id, a.name]))
  const isLast = step === STEPS.length - 1
  const hasDraft = name.trim() !== '' || activities.length > 0 || goals.length > 0

  // Each step starts at the top with focus on its heading, so screen readers announce it.
  const isFirstRender = useRef(true)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    window.scrollTo({ top: 0 })
    headingRef.current?.focus()
  }, [step])

  function goTo(next: number) {
    setStep(Math.max(0, Math.min(STEPS.length - 1, next)) as StepIndex)
  }

  function handleNext(e?: FormEvent) {
    e?.preventDefault()
    if (isLast) {
      onComplete({ name: name.trim(), activities, goals })
    } else {
      goTo(step + 1)
    }
  }

  function handleAddActivity(activityName: string) {
    setActivities((prev) => [...prev, { id: crypto.randomUUID(), name: activityName, logs: [] }])
  }

  function handleRemoveActivity(activityId: string) {
    setActivities((prev) => prev.filter((a) => a.id !== activityId))
    setGoals((prev) => prev.filter((g) => g.activityId !== activityId))
  }

  function handleAddGoal(goal: NewGoal) {
    setGoals((prev) => {
      const sameTarget = prev.filter((g) => g.activityId === goal.activityId && g.period === goal.period)
      if (goalConflicts(sameTarget, goal)) return prev
      return [...prev, { id: crypto.randomUUID(), ...goal }]
    })
  }

  function handleRemoveGoal(goalId: string) {
    setGoals((prev) => prev.filter((g) => g.id !== goalId))
  }

  return (
    <div className="onboarding">
      <div className="onboarding-card">
        <div className="onboarding-top">
          <span className="onboarding-brand">
            <Logo size={22} />
            <span>Treni</span>
          </span>
          {!isLast && (
            <button
              type="button"
              className="onboarding-skip"
              onClick={() => (hasDraft ? setConfirmSkip(true) : onSkip())}
            >
              {t('onboarding.skip')}
            </button>
          )}
        </div>

        <ol className="onboarding-steps" aria-label={t('onboarding.stepOf', { current: step + 1, total: STEPS.length })}>
          {STEPS.map((id, index) => (
            <li key={id}>
              <button
                type="button"
                className={`onboarding-step ${index === step ? 'active' : ''} ${index < step ? 'done' : ''}`}
                aria-current={index === step ? 'step' : undefined}
                disabled={index > step}
                onClick={() => goTo(index)}
              >
                <span className="onboarding-step-dot">{index < step ? '✓' : index + 1}</span>
                <span className="onboarding-step-label">{t(`onboarding.steps.${id}`)}</span>
              </button>
            </li>
          ))}
        </ol>

        <div className="onboarding-body">
          <p className="onboarding-counter">{t('onboarding.stepOf', { current: step + 1, total: STEPS.length })}</p>
          <h1 className="onboarding-title" ref={headingRef} tabIndex={-1}>
            {t(`onboarding.${STEPS[step]}Title`)}
          </h1>
          <p className="onboarding-intro">{t(`onboarding.${STEPS[step]}Intro`)}</p>

          {step === 0 && (
            <form className="onboarding-sections" onSubmit={handleNext}>
              <div className="onboarding-section">
                <label className="onboarding-label" htmlFor="onboarding-name">
                  {t('onboarding.nameLabel')}
                </label>
                <input
                  id="onboarding-name"
                  className="settings-name-input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('settingsPage.namePlaceholder')}
                  autoComplete="given-name"
                />
              </div>

              <div className="onboarding-section">
                <span className="onboarding-label">{t('onboarding.themeLabel')}</span>
                <div className="activity-picker" role="group" aria-label={t('onboarding.themeLabel')}>
                  {THEME_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={`activity-picker-chip ${settings.theme === option.value ? 'active' : ''}`}
                      onClick={() => onUpdateSettings({ ...settings, theme: option.value })}
                    >
                      {t(option.labelKey)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="onboarding-section">
                <span className="onboarding-label">{t('onboarding.languageLabel')}</span>
                <div className="activity-picker" role="group" aria-label={t('onboarding.languageLabel')}>
                  {LANGUAGE_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={`activity-picker-chip ${settings.language === option.value ? 'active' : ''}`}
                      onClick={() => onUpdateSettings({ ...settings, language: option.value })}
                    >
                      {t(option.labelKey)}
                    </button>
                  ))}
                </div>
              </div>
            </form>
          )}

          {step === 1 && (
            <div className="onboarding-sections">
              <AddActivityForm activities={activities} onAdd={handleAddActivity} />
              {activities.length === 0 ? (
                <div className="empty-state onboarding-empty">
                  <p>{t('onboarding.activitiesEmpty')}</p>
                </div>
              ) : (
                <div className="list">
                  {activities.map((activity) => (
                    <div className="list-row" key={activity.id}>
                      <span className="list-row-title">{activity.name}</span>
                      <button
                        type="button"
                        className="btn-icon"
                        aria-label={t('activities.deleteAria', { name: activity.name })}
                        onClick={() => handleRemoveActivity(activity.id)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="onboarding-sections">
              <AddGoalForm
                activities={activities}
                goals={goals}
                stepMinutes={settings.hourStepMinutes}
                onAdd={handleAddGoal}
                onUpdate={noop}
                onCancelEdit={noop}
              />
              {goals.length === 0 ? (
                <div className="empty-state onboarding-empty">
                  <p>{t('onboarding.goalsEmpty')}</p>
                </div>
              ) : (
                <div className="list">
                  {goals.map((goal) => (
                    <div className="list-row" key={goal.id}>
                      <div className="list-row-main">
                        <GoalDescription goal={goal} nameById={nameById} />
                      </div>
                      <button
                        type="button"
                        className="btn-icon"
                        aria-label={t('goals.deleteAria')}
                        onClick={() => handleRemoveGoal(goal.id)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="onboarding-sections">
              <SummarySection title={t('onboarding.steps.profile')} onEdit={() => goTo(0)}>
                <dl className="onboarding-summary-list">
                  <dt>{t('settingsPage.nameTitle')}</dt>
                  <dd>{name.trim() || <span className="onboarding-muted">{t('onboarding.notSet')}</span>}</dd>
                  <dt>{t('onboarding.themeLabel')}</dt>
                  <dd>{t(THEME_OPTIONS.find((o) => o.value === settings.theme)!.labelKey)}</dd>
                  <dt>{t('onboarding.languageLabel')}</dt>
                  <dd>{t(LANGUAGE_OPTIONS.find((o) => o.value === settings.language)!.labelKey)}</dd>
                </dl>
              </SummarySection>

              <SummarySection
                title={`${t('onboarding.steps.activities')} (${activities.length})`}
                onEdit={() => goTo(1)}
              >
                {activities.length === 0 ? (
                  <p className="onboarding-muted">{t('onboarding.noneAdded')}</p>
                ) : (
                  <div className="onboarding-chips">
                    {activities.map((a) => (
                      <span key={a.id} className="onboarding-chip">
                        {a.name}
                      </span>
                    ))}
                  </div>
                )}
              </SummarySection>

              <SummarySection title={`${t('onboarding.steps.goals')} (${goals.length})`} onEdit={() => goTo(2)}>
                {goals.length === 0 ? (
                  <p className="onboarding-muted">{t('onboarding.noneAdded')}</p>
                ) : (
                  <div className="onboarding-summary-goals">
                    {goals.map((goal) => (
                      <div key={goal.id}>
                        <GoalDescription goal={goal} nameById={nameById} />
                      </div>
                    ))}
                  </div>
                )}
              </SummarySection>
            </div>
          )}
        </div>

        <div className="onboarding-footer">
          {step > 0 ? (
            <button type="button" className="btn btn-ghost" onClick={() => goTo(step - 1)}>
              ← {t('onboarding.back')}
            </button>
          ) : (
            <span />
          )}
          <button type="button" className="btn btn-primary" onClick={() => handleNext()}>
            {isLast ? t('onboarding.finish') : `${t('onboarding.next')} →`}
          </button>
        </div>
      </div>

      {confirmSkip && (
        <ConfirmDialog
          title={t('onboarding.skipTitle')}
          message={t('onboarding.skipWarning')}
          confirmLabel={t('onboarding.skip')}
          onConfirm={onSkip}
          onCancel={() => setConfirmSkip(false)}
        />
      )}
    </div>
  )
}

interface SummarySectionProps {
  title: string
  onEdit: () => void
  children: ReactNode
}

function SummarySection({ title, onEdit, children }: SummarySectionProps) {
  const { t } = useTranslation()
  return (
    <section className="onboarding-summary">
      <div className="onboarding-summary-header">
        <h2>{title}</h2>
        <button type="button" className="onboarding-edit" onClick={onEdit}>
          {t('onboarding.edit')}
        </button>
      </div>
      {children}
    </section>
  )
}
