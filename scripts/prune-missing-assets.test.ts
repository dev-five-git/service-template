import { describe, expect, test } from 'bun:test'

import { pruneManifest } from './prune-missing-assets'

const manifest = (value: unknown) => `export default ${JSON.stringify(value)}\n`
const existsOnly =
  (...alive: string[]) =>
  (url: string) =>
    alive.includes(url)

describe('prune missing RSC assets', () => {
  test('keeps existing JS and removes only missing JS', () => {
    const source = manifest({
      clientEntryDeps: { js: ['/a.js', '/ghost.js'], css: ['/a.css'] },
    })

    const result = pruneManifest(source, existsOnly('/a.js'))

    expect(result.removed).toBe(1)
    expect(result.uniqueRemoved).toEqual(['/ghost.js'])
    expect(JSON.parse(result.output.replace('export default ', ''))).toEqual({
      clientEntryDeps: { js: ['/a.js'], css: ['/a.css'] },
    })
  })

  test('does not modify CSS references', () => {
    const source = manifest({ deps: { js: [], css: ['/ghost.css'] } })

    const result = pruneManifest(source, () => false)

    expect(result.removed).toBe(0)
    expect(result.output).toContain('/ghost.css')
  })

  test('removes nested missing JS references', () => {
    const source = manifest({
      clientReferenceDeps: {
        abc: { js: ['/ghost.js'], css: [] },
        def: { js: ['/live.js'], css: [] },
      },
    })

    const result = pruneManifest(source, existsOnly('/live.js'))

    expect(result.removed).toBe(1)
    expect(result.output).toContain('/live.js')
    expect(result.output).not.toContain('/ghost.js')
  })

  test('counts duplicate missing references but reports one unique URL', () => {
    const source = manifest({
      a: { js: ['/ghost.js'] },
      b: { js: ['/ghost.js'] },
    })

    const result = pruneManifest(source, () => false)

    expect(result.total).toBe(2)
    expect(result.removed).toBe(2)
    expect(result.uniqueRemoved).toEqual(['/ghost.js'])
  })

  test('preserves existing references and export format', () => {
    const result = pruneManifest(
      manifest({ deps: { js: ['/live.js'], css: [] } }),
      () => true,
    )

    expect(result.removed).toBe(0)
    expect(result.output).toContain('/live.js')
    expect(result.output.startsWith('export default ')).toBe(true)
  })
})
