import { spawnSync } from 'node:child_process'
import { existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, renameSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { listFiles, manifestName, sha256, validateArtifacts, validateSnapshot } from './static-release.mjs'

const root = realpathSync(fileURLToPath(new URL('../', import.meta.url)))
const source = realpathSync(path.resolve(process.argv[2] || path.join(root, '../GTRfactory')))
const npmCli = process.env.npm_execpath
if (process.versions.node !== '24.15.0' || !npmCli) throw new Error('Run npm run refresh:gtrfactory with Node 24.15.0 and npm 12.0.1')
const npmVersion = spawnSync(process.execPath, [npmCli, '--version'], { encoding: 'utf8' }).stdout.trim()
if (npmVersion !== '12.0.1') throw new Error('GTR release requires npm 12.0.1')
if (JSON.parse(readFileSync(path.join(source, 'package.json'), 'utf8')).name !== 'gtrfactory') throw new Error('Not a GTRfactory source checkout')
const publicDir = path.join(root, 'public')
const cache = path.join(root, '.cache')
for (const dir of [publicDir, cache]) {
  mkdirSync(dir, { recursive: true })
  if (lstatSync(dir).isSymbolicLink() || realpathSync(dir) !== dir) throw new Error('Release directory must remain inside checkout')
}
const target = path.join(publicDir, 'gtrfactory')
if (existsSync(target)) {
  if (lstatSync(target).isSymbolicLink()) throw new Error('Snapshot must not be a symlink')
  validateSnapshot(target)
}
const inputNames = ['index.html', 'package.json', 'package-lock.json', 'vite.config.ts', 'tsconfig.json', 'tsconfig.app.json', 'tsconfig.node.json']
for (const folder of ['src', 'public']) inputNames.push(...listFiles(path.join(source, folder)).map(file => folder + '/' + file))
const hashInputs = () => sha256(inputNames.sort().map(file => file + '\0' + sha256(readFileSync(path.join(source, file)))).join('\n'))
const sourceSha256 = hashInputs()
const stage = mkdtempSync(path.join(cache, 'gtrfactory-release-'))
const bundle = path.join(stage, 'bundle')
const build = spawnSync(process.execPath, [npmCli, 'run', 'build', '--', '--base', '/gtrfactory/', '--outDir', bundle], { cwd: source, stdio: 'inherit' })
if (build.status !== 0) throw new Error('GTR build failed; existing snapshot is unchanged')
if (hashInputs() !== sourceSha256) throw new Error('GTR source changed during build; snapshot not installed')
const files = validateArtifacts(bundle)
const revision = spawnSync('git', ['rev-parse', '--verify', 'HEAD'], { cwd: source, encoding: 'utf8' })
const status = spawnSync('git', ['status', '--porcelain'], { cwd: source, encoding: 'utf8' })
const manifest = { schemaVersion: 1, builtAt: new Date().toISOString(), sourceSha256, sourceInputCount: inputNames.length,
  sourceRevision: revision.status === 0 ? revision.stdout.trim() : 'unborn', sourceDirty: Boolean(status.stdout.trim()),
  node: process.version, npm: npmVersion, base: '/gtrfactory/', command: 'npm run build -- --base /gtrfactory/ --outDir <staging>', files }
writeFileSync(path.join(bundle, manifestName), JSON.stringify(manifest, null, 2) + '\n')
validateSnapshot(bundle)
const backup = path.join(stage, 'previous-snapshot')
if (existsSync(target)) renameSync(target, backup)
try { renameSync(bundle, target) } catch (error) {
  if (existsSync(backup)) renameSync(backup, target)
  throw error
}
console.log('GTR snapshot installed; source SHA-256: ' + sourceSha256)
console.log('Any prior snapshot is retained in ' + path.relative(root, backup))
