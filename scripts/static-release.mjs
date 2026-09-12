import { createHash } from 'node:crypto'
import { lstatSync, readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'

export const manifestName = 'release-manifest.json'
export const sha256 = bytes => createHash('sha256').update(bytes).digest('hex')

export function listFiles(root, relative = '') {
  const entries = []
  for (const name of readdirSync(path.join(root, relative)).sort()) {
    const file = path.posix.join(relative, name)
    const stat = lstatSync(path.join(root, file))
    if (stat.isSymbolicLink()) throw new Error('Symlink not permitted: ' + file)
    if (stat.isDirectory()) entries.push(...listFiles(root, file))
    else if (stat.isFile()) entries.push(file)
    else throw new Error('Non-file artifact: ' + file)
  }
  return entries.sort()
}

export function artifactHashes(root) {
  return Object.fromEntries(listFiles(root).filter(file => file !== manifestName)
    .map(file => [file, sha256(readFileSync(path.join(root, file)))]))
}

export function validateArtifacts(root) {
  const files = listFiles(root).filter(file => file !== manifestName)
  if (!files.includes('index.html')) throw new Error('Missing GTR index.html')
  for (const file of files) {
    if (!/^[a-zA-Z0-9_./-]+$/.test(file) || !/\.(html|js|css|svg|png|webp|jpg|woff2?|txt)$/i.test(file)) {
      throw new Error('Unexpected public artifact: ' + file)
    }
    if (/\.(html|js|css|svg)$/.test(file)) {
      const text = readFileSync(path.join(root, file), 'utf8')
      if (/sourceMappingURL|[A-Za-z]:[\\/](?:Users|Programming)[\\/]/.test(text)) throw new Error('Source disclosure: ' + file)
      if (/["']\/(?:assets\/|favicon\.)/.test(text)) throw new Error('Root asset reference: ' + file)
    }
  }
  const html = readFileSync(path.join(root, 'index.html'), 'utf8')
  const refs = [...html.matchAll(/(?:src|href)=["']([^"']+)["']/g)].map(match => match[1])
  if (!refs.some(ref => ref.startsWith('/gtrfactory/assets/') && ref.endsWith('.js'))) throw new Error('GTR base path missing')
  for (const ref of refs) {
    if (!ref.startsWith('/gtrfactory/')) throw new Error('Unexpected GTR HTML URL: ' + ref)
    if (!files.includes(ref.slice('/gtrfactory/'.length))) throw new Error('Missing referenced asset: ' + ref)
  }
  return artifactHashes(root)
}

export function validateSnapshot(root) {
  const manifest = JSON.parse(readFileSync(path.join(root, manifestName), 'utf8'))
  if (manifest.schemaVersion !== 1 || manifest.base !== '/gtrfactory/' || !/^[a-f0-9]{64}$/.test(manifest.sourceSha256)) {
    throw new Error('Invalid GTR release manifest')
  }
  const actual = validateArtifacts(root)
  if (JSON.stringify(actual) !== JSON.stringify(manifest.files)) throw new Error('GTR snapshot hash mismatch')
  return manifest
}
