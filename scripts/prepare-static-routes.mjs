import { copyFileSync, mkdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { validateSnapshot } from './static-release.mjs'

const root = fileURLToPath(new URL('../', import.meta.url))
validateSnapshot(path.join(root, 'public/gtrfactory'))
validateSnapshot(path.join(root, 'public/wirefactory'), '/wirefactory/')
validateSnapshot(path.join(root, 'dist/gtrfactory'))
validateSnapshot(path.join(root, 'dist/wirefactory'), '/wirefactory/')
const editor = path.join(root, 'dist/fretboard')
mkdirSync(editor, { recursive: true })
copyFileSync(path.join(root, 'dist/index.html'), path.join(editor, 'index.html'))
copyFileSync(path.join(root, 'CNAME'), path.join(root, 'dist/CNAME'))
console.log('Static entry points ready: /, /fretboard/, /gtrfactory/, /wirefactory/')
