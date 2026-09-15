import { readFileSync } from 'node:fs'
import path from 'node:path'

export const SITE_ORIGIN = 'https://www.fretfactory.fi'

export const SEO_PROFILES = Object.freeze({
  root: Object.freeze({
    route: '/',
    title: 'FretFactory | Guitar Design Tools',
    description: "Design fretboards, guitar bodies, and pickup wiring with FretFactory's connected guitar design tools.",
    image: '/img/luthier-workshop-hero-v1.webp',
  }),
  fretboard: Object.freeze({
    route: '/fretboard/',
    title: 'FretFactory Fretboard Designer | Guitar Fretboard Design',
    description: 'Design guitar fretboards with scale lengths, string layouts, and export-ready geometry in FretFactory.',
    image: '/img/fretfactory-workshop-background-v1.webp',
  }),
})

export const SITEMAP_ROUTES = Object.freeze(['/', '/fretboard/', '/gtrfactory/', '/wirefactory/'])
const marker = /<meta\s+name="seo-metadata-profile"\s+content="[^"]+"\s*\/?>[\s\S]*?<meta\s+name="seo-metadata-end"\s+content="true"\s*\/?>/i

function requireProfile(name) {
  const profile = SEO_PROFILES[name]
  if (!profile) throw new Error(`Unknown SEO profile: ${name}`)
  return profile
}

function metadata(profile) {
  const canonical = SITE_ORIGIN + profile.route
  const image = SITE_ORIGIN + profile.image
  return `<meta name="seo-metadata-profile" content="${profile.route}" />
    <title>${profile.title}</title>
    <meta name="description" content="${profile.description}" />
    <link rel="canonical" href="${canonical}" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${profile.title}" />
    <meta property="og:description" content="${profile.description}" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:image" content="${image}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${profile.title}" />
    <meta name="twitter:description" content="${profile.description}" />
    <meta name="twitter:image" content="${image}" />
    <meta name="seo-metadata-end" content="true" />`
}

export function applySeoProfile(html, profileName) {
  const matches = html.match(marker)
  if (!matches || matches.length !== 1) throw new Error('Expected exactly one SEO metadata profile block')
  return html.replace(marker, metadata(requireProfile(profileName)))
}

function requireText(text, expected, file) {
  if (!text.includes(expected)) throw new Error(`Missing SEO value in ${file}: ${expected}`)
}

export function validateSeoDocument(html, profileName, file = 'index.html') {
  const profile = requireProfile(profileName)
  const canonical = SITE_ORIGIN + profile.route
  const image = SITE_ORIGIN + profile.image
  requireText(html, `<title>${profile.title}</title>`, file)
  requireText(html, `<meta name="description" content="${profile.description}"`, file)
  requireText(html, `<link rel="canonical" href="${canonical}"`, file)
  requireText(html, `<meta property="og:title" content="${profile.title}"`, file)
  requireText(html, `<meta property="og:description" content="${profile.description}"`, file)
  requireText(html, `<meta property="og:url" content="${canonical}"`, file)
  requireText(html, `<meta property="og:image" content="${image}"`, file)
  requireText(html, '<meta name="twitter:card" content="summary_large_image"', file)
  requireText(html, `<meta name="twitter:title" content="${profile.title}"`, file)
  requireText(html, `<meta name="twitter:description" content="${profile.description}"`, file)
  requireText(html, `<meta name="twitter:image" content="${image}"`, file)
}

export function validateSeoSite(root) {
  validateSeoDocument(readFileSync(path.join(root, 'index.html'), 'utf8'), 'root', 'index.html')
  validateSeoDocument(readFileSync(path.join(root, 'fretboard', 'index.html'), 'utf8'), 'fretboard', 'fretboard/index.html')
  const robots = readFileSync(path.join(root, 'robots.txt'), 'utf8')
  requireText(robots, 'User-agent: *', 'robots.txt')
  requireText(robots, 'Allow: /', 'robots.txt')
  requireText(robots, `Sitemap: ${SITE_ORIGIN}/sitemap.xml`, 'robots.txt')
  const sitemap = readFileSync(path.join(root, 'sitemap.xml'), 'utf8')
  const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1])
  const expected = SITEMAP_ROUTES.map(route => SITE_ORIGIN + route)
  if (JSON.stringify(locations) !== JSON.stringify(expected)) throw new Error('Unexpected sitemap route inventory')
  if (locations.some(location => location.includes('404'))) throw new Error('Sitemap must not index the 404 fallback')
}
