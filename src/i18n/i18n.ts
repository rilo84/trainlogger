import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import sv from './locales/sv.json'
import en from './locales/en.json'

export type AppLanguage = 'sv' | 'en'

function readInitialLanguage(): AppLanguage {
  try {
    const raw = localStorage.getItem('claudetrainer.settings')
    if (!raw) return 'sv'
    const parsed = JSON.parse(raw) as { language?: string }
    return parsed.language === 'en' ? 'en' : 'sv'
  } catch {
    return 'sv'
  }
}

i18n.use(initReactI18next).init({
  resources: {
    sv: { translation: sv },
    en: { translation: en },
  },
  lng: readInitialLanguage(),
  fallbackLng: 'sv',
  interpolation: {
    escapeValue: false,
  },
})

export default i18n
