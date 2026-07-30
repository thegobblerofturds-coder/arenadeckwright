# Ultimate Version — product and code audit

Date: 2026-07-29

## Vision

One composition area should explain the complete product:

- Colours and effects are sources.
- The always-visible live name inside the Mega Tube is the destination and the
  only position editor.
- WUBRG, colour recipes, and stylized recipes are the three preset systems.
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
- Arena-black live name canvas, clipboard fallback, local persistence, undo,
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

## Rebuilt after the first one-tube release

- The separate preview/control relationship was collapsed: the rendered deck
  name is now the character-aware drop surface.
- FX bubbles sit directly above the name and colour bubbles directly below it.
- Two compact typed reservoirs replace the previous five source-orb controls.
- The final dock reduces direct creation to two typed reservoirs—Colour and
  FX—while keeping the three preset systems separate.
- A reservoir drop stores the exact caret first; the subsequent picker choice
  commits to that stored position.
- Source libraries no longer occupy permanent layout space. A bubble drop,
  placed-layer click, or preset launcher opens one contextual overlay.
- Mouse, pen, and touch use the same drag gesture, resolved against actual glyph
  geometry instead of an approximate full-width rail.
- Full colour-wheel editing, palette rotation/flip, and saved palettes returned
  without restoring duplicate editing surfaces.
- Preset hover/focus previews are temporary and compile through the same exact
  Arena budget path as committed changes.
- Selected layers highlight the exact character range they affect.
- Budget-trimmed colour bubbles remain visible as ghosts instead of silently
  disappearing.

## Stylized preset shelf

- Ice Rainbow and Sunset provide compact colour-led recipes.
- Bubbles uses one base size and two compact size changes.
- Drift Away uses one shrink and one rise point plus global spacing.
- Matrix Glitch combines matrix greens, all caps, spacing, one rotation change,
  and one vertical jump.
- Upside Down uses a whole-name 180-degree rotation with a void/ice palette.
- Recipe-generated inline events carry their own source marker. Applying another
  stylized preset removes only the previous recipe events and preserves effects
  and sprites the user placed manually.
- All six recipes compile the default `Your Deck Name` within the 64-character
  Arena limit.

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
- WCAG 2.2 recommends a simple pointer alternative to dragging. The product
  intentionally removed pointer click-then-place after usability feedback;
  focused source bubbles still place at the active caret with Enter or Space,
  and every tube layer has keyboard movement and an inspector. A single-pointer
  creation alternative remains an explicit accessibility tradeoff to revisit.
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
- Colour and FX source bubbles share one pointer-drag path across mouse, pen,
  and touch; keyboard placement commits through the same structured payload.
- WUBRG/colour recipes cannot remove effects or sprites.
- Stylized recipes cannot remove manually positioned effects or sprites.
- Every positioned bubble is a keyboard-operable slider.
- The always-visible live name surface remains fully opaque black.
- Public route mirrors remain unchanged until an explicit Ultimate release.
