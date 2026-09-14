import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { artifactHashes, validateArtifacts, validateSnapshot } from './static-release.mjs'

function fixture(t, base = '/gtrfactory/') {
  const root = mkdtempSync(path.join(os.tmpdir(), 'fret-release-test-'))
  t.after(() => rmSync(root, { recursive: true }))
  mkdirSync(path.join(root, 'assets'))
  writeFileSync(path.join(root, 'index.html'), `<link href="${base}favicon.svg"><script src="${base}assets/app.js"></script>`)
  writeFileSync(path.join(root, 'assets/app.js'), 'console.log("snapshot")')
  writeFileSync(path.join(root, 'favicon.svg'), '<svg/>')
  return root
}
test('valid GTR subpath snapshot is accepted and manifest hashes are checked', t => {
  const root = fixture(t)
  const files = validateArtifacts(root)
  writeFileSync(path.join(root, 'release-manifest.json'), JSON.stringify({schemaVersion:1,base:'/gtrfactory/',sourceSha256:'a'.repeat(64),files}))
  assert.equal(validateSnapshot(root).base, '/gtrfactory/')
  writeFileSync(path.join(root, 'assets/app.js'), 'changed')
  assert.throws(() => validateSnapshot(root), /hash mismatch/)
})
test('WireFactory snapshot requires its own base and manifest', t => {
  const root = fixture(t, '/wirefactory/')
  const files = validateArtifacts(root, '/wirefactory/')
  writeFileSync(path.join(root, 'release-manifest.json'), JSON.stringify({schemaVersion:1,base:'/wirefactory/',sourceSha256:'b'.repeat(64),files}))
  assert.equal(validateSnapshot(root, '/wirefactory/').base, '/wirefactory/')
  assert.throws(() => validateArtifacts(root), /base path missing/)
  assert.throws(() => validateSnapshot(root), /Invalid snapshot release manifest/)
})
test('inline data URLs are permitted without weakening route checks', t => {
  const root = fixture(t, '/wirefactory/')
  writeFileSync(path.join(root, 'index.html'), '<link href="/wirefactory/favicon.svg"><link rel="icon" href="data:image/svg+xml,%3Csvg/%3E"><script src="/wirefactory/assets/app.js"></script>')
  assert.doesNotThrow(() => validateArtifacts(root, '/wirefactory/'))
})

test('source maps cannot enter the public snapshot', t => {
  const root = fixture(t)
  writeFileSync(path.join(root, 'assets/app.js.map'), '{}')
  assert.throws(() => validateArtifacts(root), /Unexpected public artifact/)
})
test('root asset references fail validation', t => {
  const root = fixture(t)
  writeFileSync(path.join(root, 'index.html'), '<script src="/assets/app.js"></script>')
  assert.throws(() => validateArtifacts(root), /Root asset reference/)
})
test('missing references fail validation', t => {
  const root = fixture(t)
  writeFileSync(path.join(root, 'index.html'), '<script src="/gtrfactory/assets/missing.js"></script>')
  assert.throws(() => validateArtifacts(root), /Missing referenced asset/)
})
test('WireFactory rejects root and other route references', t => {
  const root = fixture(t, '/wirefactory/')
  writeFileSync(path.join(root, 'index.html'), '<script src="/assets/app.js"></script>')
  assert.throws(() => validateArtifacts(root, '/wirefactory/'), /Root asset reference/)
  writeFileSync(path.join(root, 'index.html'), '<script src="/gtrfactory/assets/app.js"></script>')
  assert.throws(() => validateArtifacts(root, '/wirefactory/'), /base path missing/)
})
test('absolute local paths and source mapping hints fail validation', t => {
  const root = fixture(t)
  writeFileSync(path.join(root, 'assets/app.js'), 'const x="C:/Programming/private/file.ts"')
  assert.throws(() => validateArtifacts(root), /Source disclosure/)
  writeFileSync(path.join(root, 'assets/app.js'), '//# sourceMappingURL=app.js.map')
  assert.throws(() => validateArtifacts(root), /Source disclosure/)
})
test('hash inventory is stable and excludes its own manifest', t => {
  const root = fixture(t)
  const first = artifactHashes(root)
  writeFileSync(path.join(root, 'release-manifest.json'), '{}')
  assert.deepEqual(artifactHashes(root), first)
})
