# Ultimate Version — name-canvas rebuild record

## Ultimate 7.8 refinement — published 2026-07-30

- Lifted Colour bubbles float independently during a drag, so edge movement
  does not shove the entire packed rail. Release-time correction moves only the
  neighbouring chain.
- The black tube is shorter and the Mega Tube shell reaches the workbench edge.
- Mana pictograms clear in just over half a second.
- Colour keeps Ice, Prismatic, Sunset Relic, and Toxic Foil. Special is restored
  on the left with Upside Down, Bubbles, Drift Away, and Matrix Glitch.
- Saved is four fixed slots, arranged two per side of the same upper arc, with
  Preview, Save Over, Rename, and Delete actions for filled slots.
- Desktop mana pictograms now have a forced `650ms` cleanup deadline; reduced
  motion hides them entirely, so no stalled animation can leave one stranded.
- Instructions has a prismatic animated button treatment.

## 2026-07-29: one live-name Mega Tube

The Ultimate development source was rebuilt around one editing surface.

### Fixed

- Removed the hidden normalization rule that forced the leftmost colour back to
  zero after every interaction.
- Bubble 1 and a single remaining colour bubble now retain their requested
  positions.
- Arena serialization still emits the required start-of-name colour while the
  visual bubble remains free.

### Rebuilt

- One Mega Tube with the live deck name as its permanent editing canvas.
- Exact character-aware mouse, pen, and touch drops.
- One shared visual rail for colours, positioned FX, and sprites.
- One inspector for colour, FX, sprite, and global-style layers.
- Contextual colour and effect overlays that appear only after a bubble drop or
  placed-layer selection.
- Full wheel, hex input, swatches, rotate, flip, and saved palettes.
- Three isolated preset systems: WUBRG, Colour Presets, and Stylized Presets.
- Layer-safe preset application: colour recipes do not reset effects; style
  recipes do not reset manually positioned FX or sprites.
- Ice Rainbow, Sunset, Bubbles, Drift Away, Matrix Glitch, and Upside Down
  compound recipes with live pre-commit preview.
- WUBRG identity search across one- through five-colour identities.
- Sprite submenu inside the Effects source panel.
- Selected-character highlighting and budget-trimmed colour ghosts.
- Undo and Redo for every material editing action.

### Streamlined after hands-on feedback

- Reduced the persistent editor height so the name, both layer lanes, history,
  and budget fit together more comfortably.
- Replaced oversized source bubbles with a compact five-item source dock.
- Moved tool panels into a stable contextual overlay with its own scrolling so
  opening a menu does not reflow the editor.
- Removed the empty inspector placeholder; the contextual editor appears only
  after a layer is selected and now has a direct close control.
- Removed source-then-character arming. Pointer creation is now one direct drag
  from either side bubble into the live name.
- Simplified effect instructions around the two real actions: choose for the
  dropped position or APPLY ALL.

### Two-reservoir layer dock

- Replaced the five creation buttons with two draggable reservoirs: Colour and
  FX.
- Dropping Colour locks its exact percentage across the tube; dropping FX locks
  the exact text position and opens only its matching submenu.
- Choosing a swatch, custom colour, effect, or sprite commits it to the locked
  position and closes the picker.
- The same pointer-drag flow now handles mouse, pen, and touch. Enter or Space
  places a focused reservoir at the current text position for keyboard access.
- WUBRG, Colour Presets, and Stylized Presets remain as a separate compact
  three-item shelf.
- Reauthored Bubbles, Drift Away, Matrix Glitch, and Upside Down with fewer
  high-impact tags. Every stylized preset now fits `Your Deck Name` at or below
  Arena's 64-character limit.

### Context-only chrome

- Kept one Colour bubble on the left and one FX bubble on the right of the Mega
  Tube; there is no persistent source dock.
- Clicking a placed colour, effect, sprite, or global style reopens its matching
  menu with the layer inspector attached.
- WUBRG, Colour Presets, and Stylized Presets are three tiny launchers below the
  tube and expand into the same compact overlay.
- Budget details, history, Clear FX, Start Over, and raw Arena code now live
  behind one `•••` More disclosure.

### Local v5.1 refinement — not published

- Paired the Colour and FX creation bubbles directly beneath the Mega Tube.
- Moved global styles, positioned FX, sprites, the live name, and colour stops
  into one black tube interior; removed the decorative lane labels and ticks.
- Fixed mobile contextual menus with an explicitly bounded bottom sheet and a
  dedicated momentum-scrolling panel.
- Clicking a placed layer now opens a compact nearby editor. The full source
  library opens only through More Colours or More FX.
- Dragging includes a magnified percentage or text-position readout.
- FX sharing one text position remain separate, individually clickable bubbles.
- Added four device-local recent Colour and FX choices.
- Long names scale down inside the tube instead of disappearing beyond it.

### Local v6 interface rebuild — not published

- Preserved the entire v5.1 local build as a verified offline snapshot before
  replacing the interface.
- Replaced separate colour and FX lanes with one horizontal layer rail beneath
  the live name.
- Anchored FX to measured rendered-glyph geometry and colours to continuous
  edge-to-edge tube coordinates.
- Added a shared collision resolver across colours, positioned FX, and sprites
  so items cannot all accumulate at the right edge.
- Restored drag-to-delete as a red target that appears only while an existing
  layer is moving and lights up on entry.
- Removed selected-range underlines and other decoration from the name.
- Reduced selected-layer controls to the essential value, character nudge,
  change, duplicate, and delete actions.
- Combined the two source bubbles and three preset launchers into one compact
  dock directly beneath the tube.

### Local v6.1 interaction correction — not published

- Colour placement is now continuous across the full tube and clamps to true
  0% and 100% edges instead of snapping back to letters.
- Collision-displaced bubbles draw quiet perspective guides to their real
  colour point or text anchor.
- Removed numbered FX stacks; each effect and sprite remains its own clickable,
  draggable, and deletable bubble.
- Removed the visible caret readout and caret wording from the product surface.
- Aligned the deck-name and Arena export controls as two labelled fields.
- Removed the decorative Ultimate badge and Live Mega Tube heading, then pulled
  the editor closer to the top of the page.

### Ultimate v6.2 control-model release — published 2026-07-30

- FX bubbles now store a continuous visual position anywhere across the tube
  while separately compiling at the nearest text insertion point. Existing
  anchor lines remain the explicit connection between those two facts.
- Replaced the blocking modal overlay with a bounded, touch-scrollable panel
  below the tube so the live preview never disappears behind a menu.
- Removed whole-name variants from the FX picker. All Caps and Small Caps are
  direct toggles beside the source bubbles; Bold, Italic, Underline, Strike,
  Superscript, Subscript, Size, Spacing, Rotate, and Offset are positioned FX.
- Removed the duplicate global chips and their inspector.
- Merged Colour Presets and combined colour-and-FX recipes into one Presets
  panel and moved its launcher away from the creation bubbles.
- Restored the Version 6 WUBRG rhythm: pip taps immediately change the gradient,
  order badges remain visible, and matching identities are quick rotate/apply
  choices with no extra Apply step or search form.
- Made Undo and Start Over persistent controls.
- Replaced the raw-code drawer in More with device-local complete saved presets
  that restore the name, colours, whole-name toggles, positioned FX, and
  sprites.

### Ultimate v6.3 mobile interaction repair

- Moved source-bubble and placed-layer pointer tracking to the document so
  mobile drags continue after the finger leaves the original button.
- Added a floating copy of an existing layer during movement; it follows the
  finger all the way into the red delete bar directly under the tube.
- Made the active dragged layer drive one symmetric collision pass, so FX can
  displace Colour and Colour can displace FX.
- Stopped opening the layer editor after a drop or drag. It is hidden by
  default and opens only when a placed bubble is tapped.
- Made combined presets deterministic: each replaces prior non-sprite FX while
  preserving sprites. Drift Away is unchanged; Matrix can no longer inherit a
  stray manual underline.
- Gated the short instructions behind the header Instructions button and moved
  More to the bottom of the editor.

### Ultimate v6.4 placement context and direct manipulation

- Made the incomplete Colour/FX drop state a viewport-level modal sheet with a
  clear “finish placing this layer” banner. No bubble is committed until its
  colour, effect, or sprite is chosen.
- Kept selected-layer replacement as a smaller inline refinement panel.
- Restored the Version 6 circular colour model, including its white centre and
  dark outer ring, and made it the primary mobile choice instead of the native
  colour swatch.
- Replaced numeric value fields and arrow-only position controls with large
  draggable ranges that update the live name.
- Moved the guide layer out of the gradient rail and retargeted every dotted
  callout to the bottom centre of its actual rendered character.

### Ultimate v6.5 progressive pickers and copy clarity

- Restored a light, coloured `COPIED!` confirmation that sails upward and
  disappears after a successful clipboard write. Added a redundant Copy control
  directly on the always-visible black Arena preview and made the main Arena
  export button brighter and more inviting.
- Replaced the inspector’s ambiguous close `×` with a calm checkmark labelled
  “Done editing.”
- Added Force Gradient beside the whole-name controls. With two or more chosen
  colours it samples the full mix into the maximum number of smooth colour
  stages supported by the deck-name length and remaining 64-character budget.
- Replaced the intimidating flat FX catalogue with five large circular families:
  Lettering, Scale, Motion, Spacing, and Finish. Choosing a family reveals only
  its two to four relevant effects.
- Promoted Sprite to a third draggable source bubble beside Colour and FX and
  moved all sixteen smileys into their own focused picker.
- Rebuilt Presets as a progressive three-collection picker: Colour, Special,
  and Saved. Saving remains under More; Saved makes loading a complete look
  quick.
- Paired Undo and Redo beside WUBRG and Presets. Moved destructive Start Over
  into More.

### Ultimate v6.6 focused global tools

- Changed the main Arena export action into a bright green `✓ FINISHED`
  control while preserving the smaller Copy control directly on the black
  display and the sailing `COPIED!` confirmation.
- Gave Force Gradient a full-spectrum surface and placed Start Over directly
  beside Undo and Redo.
- Promoted WUBRG and Presets to the same prominent viewport-level sheet used to
  finish a new layer drop. Later Colour, FX, and Sprite refinement remains
  compact.
- Removed user-facing tube-position percentages. Dragging and editing now use
  plain Left, Centre, and Right language while preserving exact internal
  positions.
- Added the full circular colour model to selected-colour refinement as a
  compact wheel. Both compact and full wheels now have a live thumb-preview
  tile and hex readout.
- Removed WUBRG Clear. Pips toggle independently and the selected identity
  button cycles its colour order. Four-colour identities display as
  `4 COLOUR (HISTORICAL NAME)`.
- Increased every FX demonstration to four times its former scale.
- Replaced the decorative Presets centre with a small root marker that becomes
  a red Back button inside a collection. Preset choices themselves occupy the
  orbit, with paging when necessary.
- Nested Save Current, Load, Rename, and confirmed Delete inside Saved Presets
  and removed the obsolete saved-preset list from More.

### Ultimate v6.7 unobstructed nested tools

- Replaced the combined FX category-and-card screen with one progressive
  circular menu. Motion, Text, Transform, and Visual open one family at a time;
  the centre becomes a red Back button and samples shrink to fit the orbit.
- Moved WUBRG and Presets out of the viewport-covering sheet. Both now open
  below the Mega Tube with a pinned, exact-black live-result shelf, so global
  choices never hide the final deck name.
- Removed WUBRG’s redundant Identity readout and promoted the matching,
  colour-cycling identity rail into its place.
- Changed Presets into an explicit trial flow. Each preset stages a live
  preview, Keep commits it, Cancel restores the current design, and clicking
  away keeps the visible result. Undo remains available after commit.
- Made sprites inherit meaningful active visual and transform FX, including
  size, rotation, offsets, spacing, highlight, and alpha. Same-position FX
  serialize before a sprite so Arena receives the intended order.

### Ultimate v6.8 supported-effects cleanup

- Removed Bold from the FX catalogue, compiler, preview, and restored legacy
  state because Arena no longer displays the `<b>` tag.
- Replaced the ambiguous two-letter Rotate demonstration with one upside-down
  `Aa` sample.
- Removed the placement sheet’s background blur and lightened its scrim so the
  final deck name remains visible while an effect is chosen.
- Reduced the Colour placement copy to one short instruction and removed the
  duplicate wheel and panel directions.

### Ultimate v6.9 even WUBRG and mobile tool shelf

- Changed WUBRG’s default positions from endpoint stops to true equal letter
  ranges. Three-, four-, and five-colour identities now divide the deck name
  evenly and rebalance when the typed name changes.
- On mobile, hid the redundant Copy button inside the black result and moved
  WUBRG and Presets into a compact vertical pair beside a shortened tube.
- Changed mobile WUBRG and Presets into a bounded bottom sheet sized to rise
  into view while leaving the final black deck-name result visible above it.
- Removed the remaining backdrop blur from panel headers and preset
  confirmation controls, and reduced the placement scrim so Colour and FX
  choices keep the final product visible.

### Ultimate v7.0 prismatic control hierarchy

- Swapped the two global control zones: WUBRG and Presets now sit in the dock
  below the Mega Tube, while All Caps, Small Caps, and Force Gradient occupy
  the compact whole-name rail beside the mobile result.
- Rebuilt the masthead as a cleaner prismatic brand lockup without adding
  decorative clutter to the Arena-black result.
- Unified buttons, menus, inspectors, colour choices, sprites, WUBRG pips, and
  nested wheels around one opaque prismatic-glass system with visible focus,
  hover, selected, pressed, and disabled states.
- Made preset palettes materially brighter. Every preset orbit button now
  exposes an unobscured colour strip, and the palette itself remains visible
  beneath a much lighter readability layer.
- Increased high-use mobile targets and retained the reduced-motion contract.

### Removed from the product surface

- Alternate/prismatic duplicate name view.
- Separate inline-event timeline and duplicate FX drawer.
- Separate palette drawer, quick-palette strip, and MTG station.
- Modal two-stage FX picker and colour-wheel modal.
- Candidate-probe Arena Lab and unsafe font/material probe UI.
- Retired timeline renderer and the accumulated compatibility branches tied to
  those surfaces.

The exact compiler, 64-character budget, opaque-black Arena Mirror, verified
effects, sprite mapping, local font, copy fallback, offline operation,
reduced-motion support, and fan-content notice remain.

## Release status

Ultimate `7.8` is the `/ultimate/` release in both website mirrors as of
2026-07-30. `/colour/` remains Version 6 and Version Lite remains shelved.
