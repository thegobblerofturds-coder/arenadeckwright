# Ultimate Version — product and code audit

Date: 2026-07-29

## Vision

One composition area should explain the complete product:

- Colours and effects are sources.
- The always-visible live name inside the Mega Tube is the destination and the
  only position editor.
- WUBRG remains its own immediate engine. Colour recipes and combined
  colour-and-FX recipes share one visible Presets panel.
- Category-specific presets can be layered because each replaces only its own
  state domain.
- Sprites use their own direct source bubble and focused picker.

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
- Structured inline events and position rebasing after text edits.
- Global effects, positioned effects, all 16 sprites, and the local preview
  assets.
- Arena-black live name canvas, clipboard fallback, local persistence, undo,
  keyboard controls, and reduced-motion behavior.
- Internal raw Arena serialization used by the Copy action.

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
- The live name sits above one shared horizontal rail for colour stops,
  positioned FX, and sprites. Necessary whole-name transformations are direct
  toggles rather than a second layer species inside the tube.
- Two compact typed reservoirs replace the previous five source-orb controls.
- The final dock reduces direct creation to three typed reservoirs—Colour, FX,
  and Sprite—while keeping WUBRG and the nested Presets collections separate.
- A reservoir drop stores either an exact continuous colour point or an exact
  FX text position; the subsequent picker choice commits there.
- Source libraries no longer occupy permanent layout space. A bubble drop or
  preset launcher opens a bounded panel below the tube; a placed-layer click opens a
  compact editor with an explicit path to the full choices.
- Mouse, pen, and touch use the same drag gesture. FX resolve against actual
  glyph geometry; colours use the entire rail so both absolute edges are
  reachable.
- Full colour-wheel editing, palette rotation/flip, and saved palettes returned
  without restoring duplicate editing surfaces.
- Preset hover/focus previews are temporary and compile through the same exact
  Arena budget path as committed changes.
- Selected layers highlight the exact character range they affect.
- Budget-trimmed colour bubbles remain visible as ghosts instead of silently
  disappearing.
- Colour, FX, and Sprite creation bubbles are paired directly under the tube.
- Dragging shows a plain qualitative colour position or an exact FX text
  position; user-facing tube percentages are removed.
- Coincident FX remain independent clickable bubbles. Collision spacing fans
  them apart and perspective guides lead back to their shared anchor.
- Colour and FX tokens share one cross-type collision pass. Both have continuous
  visual positions; FX also retain a compiled glyph-based insertion offset
  shown by their guide line.
- Existing layers reveal a red drag-to-delete target; the target
  is hidden during normal editing.
- Layer selection is expressed on the layer token only. The rendered name no
  longer receives a purple affected-range underline.
- Recent Colour choices are stored locally and shown first. FX use a one-level-
  at-a-time Motion/Text/Transform/Visual menu instead of a second recent strip.
- Mobile sheets use a bounded flex scroller with momentum touch scrolling.
- Unfinished reservoir drops now use a modal completion sheet; quiet inline
  panels are reserved for refining an already placed layer.
- The V6 circular white-to-colour-to-black picker replaces the native mobile
  swatch as the primary colour control.
- Numeric FX values and visual tube positions use draggable ranges.
- Dotted layer guides use rendered glyph bounds as their endpoints rather than
  terminating on the decorative gradient rail.

## Stylized preset shelf

- Ice Rainbow and Sunset provide compact colour-led recipes.
- Bubbles uses one base size and two compact size changes.
- Drift Away uses one shrink and one rise point plus global spacing.
- Matrix Glitch combines matrix greens, all caps, spacing, one rotation change,
  and one vertical jump.
- Upside Down uses a whole-name 180-degree rotation with a void/ice palette.
- Recipe-generated inline events carry their own source marker. Applying a
  combined preset replaces all prior non-sprite FX so the named result is
  predictable, while preserving sprites as inline content.
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
  focused source bubbles still place at the current text position with Enter or Space,
  and every tube layer has keyboard movement and an inspector. A single-pointer
  creation alternative remains an explicit accessibility tradeoff to revisit.
  https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html
- The WAI-ARIA slider pattern defines Arrow, Home, End, and optional Page
  movement plus value semantics. Colour and positioned FX bubbles implement
  those controls.
  https://www.w3.org/WAI/ARIA/apg/patterns/slider/

## State boundaries

- `colours`: ordered colour stops with stable IDs and free positions.
- `formatting` + `effects`: compiler state for necessary whole-name
  transformations and combined-preset compatibility.
- `events`: positioned FX, breaks, and sprites with stable IDs, text offsets,
  and serializer sequence.
- `wubrg`: temporary search/composer selection.

Only the compiler turns these domains into one raw Arena string.

## Verification contract

- Bubble 1 and a single colour remain movable after normalization.
- Arena output still starts with a colour tag.
- Colour, FX, and Sprite source bubbles share one pointer-drag path across
  mouse, pen, and touch; keyboard placement commits through the same structured
  payload.
- WUBRG/colour recipes cannot remove effects or sprites.
- Stylized recipes replace manually positioned non-sprite FX predictably while
  preserving sprites.
- Every positioned bubble is a keyboard-operable slider.
- The always-visible live name surface remains fully opaque black.
- All positioned FX render on the tube rail; All Caps and Small Caps remain
  visible as direct whole-name toggles beside the source bubbles.
- Colour, positioned FX, and sprites resolve onto one horizontal
  rail using actual rendered glyph centres.
- Dragging any removable rail item exposes the delete target and participates
  in Undo.
- Selected effects do not decorate or underline the affected letters.
- Mobile context panels have a bounded, touch-scrollable content region.
- Public route mirrors remain unchanged until an explicit Ultimate release.
