# Ultimate Version - Patch Record

These notes were collected before implementation and applied together on 2026-07-25.

## Ultimate route update - 2026-07-29

- Made the entire clickable Arena Mirror/copy stage fully opaque black across all themes, hover/pressed feedback, and the alternate prismatic layout.
- Kept palette glow and chrome outside the black comparison stage so Arena colour and rich-text effects are not visually tinted by the tool itself.
- Added source and browser-level regression coverage for the black-background contract.
- Published the full-featured edition separately as the Ultimate Version at `/ultimate/`; Version 6 remains the standard `/colour/` release.

## Implemented

1. SIZE is clamped consistently in the drawer, picker, compiler, and preview to the Arena-tested useful range of `5-29`. The control calls out `5`, `10`, `20`, and `29`.
2. Compiled FX sequence numbers use a fixed, centred, tabular-number container at desktop and laptop densities.
3. The generic FX source can be dragged into the Mega Tube before its effect is chosen. The drop position is retained while the picker is open.
4. One generic FX source remains visible in the default state. Click/tap inserts at the active caret; drag/drop places first and chooses second.
5. The temporary dropped bubble is dashed, labelled `FX`, excluded from raw code, the budget, and serializer numbering, and removed on cancellation.
6. Drop, choose, and adjust commit as one Undo action.
7. Every FX picker choice has an unnumbered miniature visual example, including per-letter rotation and the real review sprite artwork.
8. Picker card numbers such as `01` and `02` were removed.
9. Sprite/emote click, tap, keyboard, and drag/drop behavior is preserved. Compiler regression coverage now checks every sprite ID from `0` through `15`.
10. Focus mode begins at the dropped caret and expands to the chosen effect's affected range after selection.
11. A separate approximate `VISUAL WIDTH WATCH/RISK` indicator measures browser-rendered geometry without changing the exact `TOTAL/64` raw-code accounting.
12. Colour bubble 1 is movable again by pointer and keyboard. Dragging it past another colour reorders which colour owns the required start-of-name tag.

## Still awaiting Arena measurements

The maximum reliably visible deck-name geometry in Arena remains unknown. Do not turn the browser width indicator into an Arena hard limit until tests record the raw-code length, visible glyph count, SIZE, character spacing, sprites, and line breaks at the disappearance threshold.

The browser preview remains an approximation of Unity/TextMesh Pro geometry. Arena is authoritative.
