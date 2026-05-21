import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import AsyncStorage from '@react-native-async-storage/async-storage'
import en from './en.json'
import ur from './ur.json'

const LANG_KEY = 'app:lang'

export const SUPPORTED_LANGS = ['en', 'ur'] as const
export type AppLang = (typeof SUPPORTED_LANGS)[number]

export async function setLanguage(lang: AppLang) {
  await AsyncStorage.setItem(LANG_KEY, lang)
  await i18n.changeLanguage(lang)
}

export async function loadStoredLanguage(): Promise<AppLang> {
  const stored = (await AsyncStorage.getItem(LANG_KEY)) as AppLang | null
  return stored && SUPPORTED_LANGS.includes(stored) ? stored : 'en'
}

export async function initI18n() {
  const lang = await loadStoredLanguage()
  await i18n.use(initReactI18next).init({
    resources: {
      en: { translation: en },
      ur: { translation: ur },
    },
    lng: lang,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    compatibilityJSON: 'v3',
  })
}

export default i18n
