# Ultimate Version — local rebuild record

## 2026-07-29: one Mega Tube

The Ultimate development source was rebuilt around one editing surface.

### Fixed

- Removed the hidden normalization rule that forced the leftmost colour back to
  zero after every interaction.
- Bubble 1 and a single remaining colour bubble now retain their requested
  positions.
- Arena serialization still emits the required start-of-name colour while the
  visual bubble remains free.

### Rebuilt

- One Mega Tube with separate visual lanes for colours and positioned FX.
- One inspector for colour, FX, sprite, and global-style layers.
- Colour and effect source trays with drag-to-place and click-at-caret behavior.
- Three isolated preset systems: WUBRG, Colour Presets, and Style Presets.
- Layer-safe preset application: colour recipes do not reset effects; style
  recipes do not reset colours, positioned FX, or sprites.
- WUBRG identity search across one- through five-colour identities.
- Sprite submenu inside the Effects source panel.
- Undo and Redo for every material editing action.

### Removed from the product surface

- Alternate/prismatic duplicate name view.
- Separate inline-event timeline and duplicate FX drawer.
- Separate palette drawer, quick-palette strip, and MTG station.
- Modal two-stage FX picker and colour-wheel modal.
- Candidate-probe Arena Lab and unsafe font/material probe UI.
- Retired timeline renderer and the accumulated compatibility branches tied to
  those surfaces.

The exact compiler, 64-character budget, opaque-black Arena Mirror, verified
effects, sprite mapping, local font, copy fallback, raw-code view, offline
operation, reduced-motion support, and fan-content notice remain.

## Release status

This is a local Ultimate development build. It has not replaced the currently
published `/ultimate/` route. `/colour/` remains Version 6 and Version Lite
remains shelved.
