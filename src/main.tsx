import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { useAppState } from './store.state'
import { parseHash, stateToHash } from './utils/share'

const root = document.getElementById('root')
if (!root) throw new Error('Missing #root')

const syncHash = () => {
	const next = stateToHash(useAppState.getState())
	if (window.location.hash !== next) {
		try { window.history.replaceState(null, '', next) } catch { /* ignore */ }
	}
}

// Hydrate from URL hash once before render
try {
	const parsed = parseHash(window.location.hash)
	if (parsed) {
		useAppState.setState(parsed)
		syncHash()
	}
} catch {/* ignore */}

// Keep hash in sync with state changes
useAppState.subscribe(syncHash)

createRoot(root).render(<App />)
