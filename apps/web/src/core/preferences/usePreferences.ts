import { useContext } from 'react'
import { PreferencesContext, type PreferencesValue } from './PreferencesProvider'

/** The locale, the colour scheme, and the two functions that change them. */
export const usePreferences = (): PreferencesValue => useContext(PreferencesContext)
