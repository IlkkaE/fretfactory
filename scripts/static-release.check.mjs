import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { artifactHashes, validateArtifacts, validateSnapshot } from './static-release.mjs'

function fixture(t) {
  const root = mkdtempSync(path.join(os.tmpdir(), 'fret-release-test-'))
  t.after(() => rmSync(root, { recursive: true }))
  mkdirSync(path.join(root, 'assets'))
  writeFileSync(path.join(root, 'index.html'), '<link href="/gtrfactory/favicon.svg"><script src="/gtrfactory/assets/app.js"></script>')
  writeFileSync(path.join(root, 'assets/app.js'), 'console.log("gtr")')
  writeFileSync(path.join(root, 'favicon.svg'), '<svg/>')
  return root
}
test('valid subpath snapshot is accepted and manifest hashes are checked', t => {
  const root = fixture(t)
  const files = validateArtifacts(root)
  writeFileSync(path.join(root, 'release-manifest.json'), JSON.stringify({schemaVersion:1,base:'/gtrfactory/',sourceSha256:'a'.repeat(64),files}))
  assert.equal(validateSnapshot(root).base, '/gtrfactory/')
  writeFileSync(path.join(root, 'assets/app.js'), 'changed')
  assert.throws(() => validateSnapshot(root), /hash mismatch/)
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
