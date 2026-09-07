import '@fontsource-variable/vazirmatn'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './app/App'
import { AppProviders } from './app/AppProviders'
import { defaultLocale } from './i18n'

const container = document.getElementById('root')
if (!container) throw new Error('index.html has no #root element to mount into')

// The locale is fixed to the default here. Choosing it, and the language button
// that does the choosing, is its own card: it has to live somewhere the whole
// tree can reach and it has to persist, and neither belongs in the scaffold.
createRoot(container).render(
  <StrictMode>
    <AppProviders locale={defaultLocale}>
      <App />
    </AppProviders>
  </StrictMode>,
)
