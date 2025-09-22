import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { useAppState } from './store.state'
import { parseHash, stateToHash } from './utils/share'

const root = document.getElementById('root')
if (!root) throw new Error('Missing #root')

// Hydrate from URL hash once before render
try {
	const s = useAppState.getState()
	const parsed = parseHash(window.location.hash)
	if (parsed) {
		useAppState.setState({ ...s, ...parsed })
	}
} catch {/* ignore */}

// Keep hash in sync with state changes
useAppState.subscribe((s) => {
	const next = stateToHash(s)
	if (window.location.hash !== next) {
		try { window.history.replaceState(null, '', next) } catch { /* ignore */ }
	}
})

createRoot(root).render(<App />)
