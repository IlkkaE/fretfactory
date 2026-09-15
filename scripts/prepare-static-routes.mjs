import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { validateSnapshot } from './static-release.mjs'
import { applySeoProfile, validateSeoSite } from './seo-metadata.mjs'

const root = fileURLToPath(new URL('../', import.meta.url))
validateSnapshot(path.join(root, 'public/gtrfactory'))
validateSnapshot(path.join(root, 'public/wirefactory'), '/wirefactory/')
validateSnapshot(path.join(root, 'dist/gtrfactory'))
validateSnapshot(path.join(root, 'dist/wirefactory'), '/wirefactory/')
const rootEntry = path.join(root, 'dist/index.html')
const rootHtml = readFileSync(rootEntry, 'utf8')
writeFileSync(rootEntry, applySeoProfile(rootHtml, 'root'))
const editor = path.join(root, 'dist/fretboard')
mkdirSync(editor, { recursive: true })
writeFileSync(path.join(editor, 'index.html'), applySeoProfile(rootHtml, 'fretboard'))
copyFileSync(path.join(root, 'CNAME'), path.join(root, 'dist/CNAME'))
validateSeoSite(path.join(root, 'dist'))
console.log('Static entry points ready: /, /fretboard/, /gtrfactory/, /wirefactory/')
