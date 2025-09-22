import React from 'react'

declare global { interface Window { adsbygoogle?: any[] } }

export default function AdsenseBlock() {
  const pubId = import.meta.env.VITE_GADS_PUBLISHER_ID as string | undefined
  const slot = import.meta.env.VITE_GADS_SLOT_ID as string | undefined

  React.useEffect(() => {
    if (!pubId) return
    const existing = document.querySelector('script[data-adsbygoogle]')
    if (existing) return
    const s = document.createElement('script')
    s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(pubId)}`
    s.async = true
    s.crossOrigin = 'anonymous'
    s.setAttribute('data-adsbygoogle', 'true')
    document.head.appendChild(s)
  }, [pubId])

  React.useEffect(() => {
    if (!pubId) return
    try { (window.adsbygoogle = window.adsbygoogle || []).push({}) } catch {}
  })

  if (!pubId) return null
  return (
    <ins className="adsbygoogle block"
      data-ad-client={pubId}
      data-ad-slot={slot ?? undefined}
      data-ad-format="auto"
      data-full-width-responsive="true"
      aria-label="advertisement"
    />
  )
}
