import { spawnSync } from 'node:child_process'
import { existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, renameSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { listFiles, manifestName, sha256, validateArtifacts, validateSnapshot } from './static-release.mjs'

const base = '/wirefactory/'
const root = realpathSync(fileURLToPath(new URL('../', import.meta.url)))
const source = realpathSync(path.resolve(process.argv[2] || path.join(root, '../wirefactory')))
const npmCli = process.env.npm_execpath
if (process.versions.node !== '24.15.0' || !npmCli) throw new Error('Run npm run refresh:wirefactory with Node 24.15.0 and npm 12.0.1')
const npmVersion = spawnSync(process.execPath, [npmCli, '--version'], { encoding: 'utf8' }).stdout.trim()
if (npmVersion !== '12.0.1') throw new Error('WireFactory release requires npm 12.0.1')
if (JSON.parse(readFileSync(path.join(source, 'package.json'), 'utf8')).name !== 'wirefactory') throw new Error('Not a WireFactory source checkout')
const publicDir = path.join(root, 'public')
const cache = path.join(root, '.cache')
for (const dir of [publicDir, cache]) {
  mkdirSync(dir, { recursive: true })
  if (lstatSync(dir).isSymbolicLink() || realpathSync(dir) !== dir) throw new Error('Release directory must remain inside checkout')
}
const target = path.join(publicDir, 'wirefactory')
if (existsSync(target)) {
  if (lstatSync(target).isSymbolicLink()) throw new Error('Snapshot must not be a symlink')
  validateSnapshot(target, base)
}
const configNames = ['index.html', 'package.json', 'package-lock.json', 'vite.config.ts', 'vitest.config.ts', 'playwright.config.ts', 'tsconfig.json', 'tsconfig.app.json', 'tsconfig.node.json', '.prettierrc.json']
const inputNames = configNames.filter(file => existsSync(path.join(source, file)))
for (const folder of ['src', 'public']) {
  if (existsSync(path.join(source, folder))) inputNames.push(...listFiles(path.join(source, folder)).map(file => folder + '/' + file))
}
const hashInputs = () => sha256(inputNames.sort().map(file => file + '\0' + sha256(readFileSync(path.join(source, file))).toString()).join('\n'))
const sourceSha256 = hashInputs()
const stage = mkdtempSync(path.join(cache, 'wirefactory-release-'))
const bundle = path.join(stage, 'bundle')
const build = spawnSync(process.execPath, [npmCli, 'run', 'build', '--', '--base', base, '--outDir', bundle], { cwd: source, stdio: 'inherit' })
if (build.status !== 0) throw new Error('WireFactory build failed; existing snapshot is unchanged')
if (hashInputs() !== sourceSha256) throw new Error('WireFactory source changed during build; snapshot not installed')
const files = validateArtifacts(bundle, base)
const revision = spawnSync('git', ['rev-parse', '--verify', 'HEAD'], { cwd: source, encoding: 'utf8' })
const status = spawnSync('git', ['status', '--porcelain'], { cwd: source, encoding: 'utf8' })
const manifest = { schemaVersion: 1, builtAt: new Date().toISOString(), sourceSha256, sourceInputCount: inputNames.length,
  sourceRevision: revision.status === 0 ? revision.stdout.trim() : 'unborn', sourceDirty: Boolean(status.stdout.trim()),
  node: process.version, npm: npmVersion, base, command: 'npm run build -- --base /wirefactory/ --outDir <staging>', files }
writeFileSync(path.join(bundle, manifestName), JSON.stringify(manifest, null, 2) + '\n')
validateSnapshot(bundle, base)
const backup = path.join(stage, 'previous-snapshot')
if (existsSync(target)) renameSync(target, backup)
try { renameSync(bundle, target) } catch (error) {
  if (existsSync(backup)) renameSync(backup, target)
  throw error
}
console.log('WireFactory snapshot installed; source SHA-256: ' + sourceSha256)
console.log('Any prior snapshot is retained in ' + path.relative(root, backup))