import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import LandingPage from './components/LandingPage'
import { useAppState } from './store.state'
import { parseHash, stateToHash } from './utils/share'

const root = document.getElementById('root')
if (!root) throw new Error('Missing #root')

const EDITOR_PATH = '/fretboard'
const REDIRECT_KEY = 'fretfactory.spa-redirect'

const normalizePath = (path: string) => path.replace(/\/+$/, '') || '/'

try {
  const storedRedirect = window.sessionStorage.getItem(REDIRECT_KEY)
  if (storedRedirect) {
    window.sessionStorage.removeItem(REDIRECT_KEY)
    if (storedRedirect.startsWith(EDITOR_PATH)) window.history.replaceState(null, '', storedRedirect)
  }
} catch { /* browser storage is optional */ }

let activePath = normalizePath(window.location.pathname)
if (activePath === '/' && window.location.hash.startsWith('#state=')) {
  window.history.replaceState(null, '', `${EDITOR_PATH}${window.location.hash}`)
  activePath = EDITOR_PATH
}
if (activePath !== '/' && activePath !== EDITOR_PATH) {
  window.history.replaceState(null, '', '/')
  activePath = '/'
}

const syncHash = () => {
	const next = stateToHash(useAppState.getState())
	if (window.location.hash !== next) {
		try { window.history.replaceState(null, '', next) } catch { /* ignore */ }
	}
}

if (activePath === EDITOR_PATH) {
  // Hydrate from a share URL only when the fretboard designer is active.
  try {
    const parsed = parseHash(window.location.hash)
    if (parsed) {
      useAppState.setState(parsed)
      syncHash()
    }
  } catch {/* ignore */}
  useAppState.subscribe(syncHash)
}

createRoot(root).render(activePath === EDITOR_PATH ? <App /> : <LandingPage />)
