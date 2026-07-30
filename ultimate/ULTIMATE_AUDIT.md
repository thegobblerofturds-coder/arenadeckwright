# Ultimate Version — product and code audit

Date: 2026-07-29

## Vision

One composition area should explain the complete product:

- Colours and effects are sources.
- The Mega Tube is the destination and the only position editor.
- WUBRG, colour recipes, and style recipes are the three preset systems.
- Category-specific presets can be layered because each replaces only its own
  state domain.
- Sprites stay adjacent to effects in a submenu.

## Root cause of the immovable “1” bubble

The pointer handler had already been changed to permit movement. The shared
`normaliseGradientStops` function then reset the sorted first stop to position
zero, and `separateGradientStops` repeated the same reset. Every drag therefore
appeared to work until normalization snapped bubble 1 back.

The anchor mutation was removed from normalization, separation, and collision
logic. The serializer independently guarantees a colour tag at text offset zero,
so compiler correctness does not require a fixed visual bubble.

## Kept

- Pure Arena compiler and literal serializer.
- Exact 64-character accounting and colour-stage fallback.
- Structured inline events and caret rebasing after text edits.
- Global effects, positioned effects, all 16 sprites, and the local preview
  assets.
- Arena-black copy stage, clipboard fallback, local persistence, undo,
  keyboard controls, and reduced-motion behavior.
- Advanced read-only raw Arena code.

## Removed

- Duplicate name/copy modes.
- Independent colour rail, inline timeline, and Mega Tube representations of
  the same state.
- Separate FX drawer, FX picker, palette tray, MTG station, and probe lab.
- Experimental and unsafe controls that did not belong in the main workflow.
- Dead renderers and special-case anchor branches.
- CSS accumulated for retired surfaces.

## Research translated into product decisions

- Adobe's gradient editor uses direct on-canvas stops, click-to-add, drag-to-
  reposition, drag-away removal, and preset saving. Ultimate keeps direct stop
  manipulation but exposes a persistent inspector and explicit delete action to
  reduce accidental loss.
  https://helpx.adobe.com/in/photoshop/desktop/adjust-color/color-effects-techniques/edit-a-gradient.html
- Photoshop layer effects are non-destructive, independently inspectable, and
  expandable beneath the affected layer. Ultimate represents global and
  positioned FX as inspectable layers instead of flattening them into a preset.
  https://helpx.adobe.com/ca/photoshop/desktop/create-manage-layers/apply-layer-effects/add-layer-styles.html
- Figma separates colour, text, and effect styles. Ultimate mirrors that domain
  separation: colour presets touch colours; style presets touch global effects.
  https://help.figma.com/hc/en-us/articles/360039238753-Styles-in-Figma-Design
- Apple's drag-and-drop guidance recommends continuous destination feedback,
  expected copy/move semantics, and Undo. Ultimate highlights the tube and drop
  position and records each completed edit in history.
  https://developer.apple.com/design/human-interface-guidelines/drag-and-drop
- WCAG 2.2 requires a simple pointer alternative to dragging. Every draggable
  source also works by click at the active caret, and every tube layer has
  keyboard movement and an inspector.
  https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html
- The WAI-ARIA slider pattern defines Arrow, Home, End, and optional Page
  movement plus value semantics. Colour and positioned FX bubbles implement
  those controls.
  https://www.w3.org/WAI/ARIA/apg/patterns/slider/

## State boundaries

- `colours`: ordered colour stops with stable IDs and free positions.
- `formatting` + `effects`: global style layer.
- `events`: positioned FX, breaks, and sprites with stable IDs, caret offsets,
  and serializer sequence.
- `wubrg`: temporary search/composer selection.

Only the compiler turns these domains into one raw Arena string.

## Verification contract

- Bubble 1 and a single colour remain movable after normalization.
- Arena output still starts with a colour tag.
- Source drag and click paths insert the same structured payload.
- WUBRG/colour recipes cannot remove effects or sprites.
- Style recipes cannot remove colours, positioned effects, or sprites.
- Every positioned bubble is a keyboard-operable slider.
- The copy surface remains fully opaque black.
- Public route mirrors remain unchanged until an explicit Ultimate release.
