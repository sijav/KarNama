import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { semantic } from '../../theme/tokens'
import { SHAPES } from './LogoMark'

// The asset node 576:7665 exported on 2026-11-03, kept beside the component as
// the source the drawing is checked against.
const ASSET = readFileSync(new URL('./576-7665.svg', import.meta.url), 'utf8')
const asset = [...ASSET.matchAll(/<path id="[^"]+" d="([^"]+)" fill="(#[0-9A-Fa-f]{6})"\/>/g)].map(([, d, fill]) => ({ d, fill }))

describe('the brand mark, node 576:7665', () => {
  it('draws the asset its file exports: three shapes, in its order and geometry', () => {
    expect(asset).toHaveLength(3)
    expect(SHAPES.map((shape) => shape.d)).toEqual(asset.map((shape) => shape.d))
  })

  it('binds each shape to the token whose colour the asset holds', () => {
    // The asset's baked hex is the file's variable at the time of export, so
    // each token must still hold that colour in the light scheme.
    expect(SHAPES.map((shape) => semantic[shape.fill].toLowerCase())).toEqual(asset.map((shape) => shape.fill?.toLowerCase()))
  })
})
