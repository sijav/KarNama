import '@fontsource-variable/vazirmatn'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './app/App'
import { AppProviders } from './app/AppProviders'

const container = document.getElementById('root')
if (!container) throw new Error('index.html has no #root element to mount into')

// NO forced locale, and that is the point. It used to pass `locale={defaultLocale}`,
// which the provider merged OVER what the user had stored, so the sequence
// choose English, reload, get Persian was the actual behaviour: a preference
// that was written, read back, and then overwritten by the default on every
// mount. Passing nothing lets the stored choice win, which is what persisting
// it was for.
createRoot(container).render(
  <StrictMode>
    <AppProviders remoteAuth={import.meta.env.VITE_AUTH_MODE !== 'demo'}>
      <App />
    </AppProviders>
  </StrictMode>,
)
