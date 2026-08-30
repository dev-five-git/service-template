/**
 * Strips references to js files that don't actually exist from vinext's RSC
 * asset manifest.
 *
 * Plugins like devup-ui that split CSS into a dedicated chunk still get a
 * `.js` URL listed in the manifest even though that chunk emits no JS. The
 * browser requests it as a `modulepreload` and gets a 404 every time.
 *
 * cloudflare/vinext#3064
 */
import { existsSync } from 'node:fs'
import path from 'node:path'

const PREFIX = /^\s*export default\s*/
const SUFFIX = /;?\s*$/

export interface PruneResult {
  total: number
  removed: number
  uniqueRemoved: string[]
}

function pruneNode(
  node: unknown,
  exists: (url: string) => boolean,
  result: { total: number; removed: number; missing: Set<string> },
): void {
  if (Array.isArray(node)) {
    for (const item of node) pruneNode(item, exists, result)
    return
  }
  if (node === null || typeof node !== 'object') return

  const record = node as Record<string, unknown>
  for (const [key, value] of Object.entries(record)) {
    if (key === 'js' && Array.isArray(value)) {
      const urls = value as string[]
      result.total += urls.length
      record[key] = urls.filter((url) => {
        if (exists(url)) return true
        result.removed++
        result.missing.add(url)
        return false
      })
      continue
    }
    pruneNode(value, exists, result)
  }
}

export function pruneManifest(
  source: string,
  exists: (url: string) => boolean,
): { output: string } & PruneResult {
  const json = source.replace(PREFIX, '').replace(SUFFIX, '')
  const parsed: unknown = JSON.parse(json)

  const result = { total: 0, removed: 0, missing: new Set<string>() }
  pruneNode(parsed, exists, result)

  return {
    output: `export default ${JSON.stringify(parsed, null, 2)}\n`,
    total: result.total,
    removed: result.removed,
    uniqueRemoved: [...result.missing],
  }
}

export async function pruneManifestFile(
  manifestFile: string,
  clientDir: string,
): Promise<PruneResult | null> {
  if (!existsSync(manifestFile)) return null

  const source = await Bun.file(manifestFile).text()
  const pruned = pruneManifest(source, (url) =>
    existsSync(path.join(clientDir, url)),
  )

  if (pruned.removed > 0) await Bun.write(manifestFile, pruned.output)
  return pruned
}

const MANIFESTS = [
  ['server/__vite_rsc_assets_manifest.js', 'client'],
  ['server/ssr/__vite_rsc_assets_manifest.js', 'client'],
  ['standalone/dist/server/__vite_rsc_assets_manifest.js', 'client'],
  ['standalone/dist/server/ssr/__vite_rsc_assets_manifest.js', 'client'],
] as const

if (import.meta.main) {
  const [distDir] = process.argv.slice(2)
  if (!distDir) {
    console.error('usage: bun run scripts/prune-missing-assets.ts <dist>')
    process.exit(1)
  }

  let touched = 0
  for (const [rel, clientRel] of MANIFESTS) {
    const result = await pruneManifestFile(
      path.join(distDir, rel),
      path.join(distDir, clientRel),
    )
    if (!result) continue
    touched++
    if (result.removed > 0)
      console.info(
        `[prune] ${rel}: ${result.removed} of ${result.total} js refs removed (${result.uniqueRemoved.length} unique)`,
      )
  }
  if (touched === 0)
    console.info('[prune] no RSC manifest found (not a vinext build)')
}
