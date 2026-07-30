TURDGOBBLER'S DECK NAME COLOURIFIER - VERSION 7

STATUS
Version 7 is the current public release. It builds on Version 6.7.3 with structured Arena rich-text effects, an exact raw-character budget, and an Arena Mirror copy stage.

QUICK START
1. Keep every Version 7 file in one folder.
2. Open index.html in a modern browser. No server, installation, account, or internet connection is required.
3. Type a deck name using ordinary text input, choose colours and effects, then click or tap the finished name to copy the exact Arena code.
4. Paste the result into Magic: The Gathering Arena.

The starter text is mixed-case "Your Deck Name" so ALL CAPS and SMALL CAPS have an immediately visible comparison. START OVER resets the current name, palette, formatting, global FX, inline bubbles, open work panels, and active selection to this initial state while keeping saved palette slots; the normal Undo button can restore the pre-reset composition.

V7 COMPILER
- Arena's raw deck-name limit is 64 characters.
- The live budget is exact: TEXT + FX + COLOUR = TOTAL/64.
- Explicit FX are always preserved. The compiler reduces gradient stages first and never silently removes an effect.
- ALL CAPS transforms the compiled letters without emitting <allcaps>, so it costs zero raw characters and never changes the case stored in the input.
- SMALL CAPS emits <smallcaps>. It remains available as requested and is also retained in the unverified Lab probes until separately verified in Arena.
- Global tags use the shortest open-tag form; closing tags are omitted unless a Lab probe explicitly tests them.
- Inline events are ordered by text-input caret position. Reapplying a tag later preserves both tags so Arena can let the later value supersede the earlier value.

FX CONTROLS AND TIMELINE
- Size, cspace, rotate, voffset, and pos each have a linked slider plus an exact number field.
- SIZE is clamped to the Arena-tested useful range of 5-29, with visible landmarks at 5, 10, 20, and 29. Other slider endpoints are documented tool ranges, not claims about Arena's parser maxima.
- The MEGA TUBE is the single position editor for colours and FX. Its independent bubbles follow the exact left-to-right tag order emitted by the serializer.
- Global formatting/FX bubbles appear before the first colour. At the same text boundary, a colour bubble appears before from-caret events because that is the compiler's literal raw-code order.
- Every compiling colour and FX bubble receives one shared sequence number matching that literal raw-code order. Ghosted colours use an X because they are not present in the generated string.
- Colour and FX bubbles share the same compact rounded-square component and one order-preserving collision packer. The bubbles automatically shrink as the tube becomes denser at laptop widths.
- Colour stops now compile at their positioned text locations instead of being represented by a separate gradient-only rail.
- Solid colour bubbles are present in the generated string. When the 64-character budget forces colour-stage reduction, preserved requested colours remain visible as clearly ghosted non-compiling bubbles.
- The source strip always shows one generic FX bubble. Click it to insert at the active caret, or drag it into the MEGA TUBE to choose the exact location first. The visual FX picker opens automatically after a drop; choose and adjust an effect to compile it at that retained position.
- While the picker is open, the dropped placeholder is dashed and unnumbered. It is excluded from raw Arena code and the 64-character budget until an effect is chosen; cancelling removes it. Drop, choose, and adjust form one Undo action.
- Existing FX bubbles can be dragged left/right, moved with Arrow keys (Shift+Arrow moves five places), sent to Home/End, or removed with Delete/Backspace.
- Every colour bubble, including the first one, can be dragged or moved with the keyboard. Moving the leading colour past another colour reorders the gradient and assigns the new leading colour to the required start-of-name tag.
- Click/tap or right-click an inline FX bubble to open a two-step glass picker matching the colour editor: first choose an FX, then use its purpose-built adjustment screen. Applying a replacement keeps the bubble's caret position and serializer sequence.
- Every FX choice card includes an unnumbered live miniature example. Numeric effects receive linked range and exact-value controls; spacing/highlight/alpha receive value fields; sprites receive the artwork tray; SUP, SUB, and BR receive a direct confirmation screen. Existing bubbles can also open the full FX drawer from the picker for the redundant advanced route.
- Opening either a colour or FX bubble activates focus mode: other tube bubbles dim and the affected Arena Mirror characters glow until the editor closes.
- Clicking a global FX bubble opens the existing drawer at its corresponding global control. Colour bubbles retain their soft Version 6 drag/edit/delete behavior.
- Hovering or focusing an FX bubble projects a temporary guide onto the affected character in the finished-name field without adding anything to the copied output.
- The drawer retains full click/tap controls for mobile, keyboard, and assistive-technology use.

ARENA-VERIFIED / CORE
- Global controls: size, cspace, rotate, voffset, superscript, subscript, and pos.
- Inline controls: br, sprites 0 through 15, mspace, space, mark/highlight, and alpha.
- Align is verified but intentionally available only as an Arena Lab probe, not as a main composer control.
- Indent, margin, and width are not exposed in the main UI.
- Font-weight has no visible effect and sprite tint is ignored; neither has a control or runnable probe.
- Font and font-material tags are classified unsupported/unsafe. A valid local font-asset probe did not change the font, while <font=default> hid or truncated following content. No font or material choices, controls, or copyable probes are exposed.

SPRITES
- Click or tap a face to insert <sprite=n> at the last active text-input caret, or drag it into the MEGA TUBE on desktop.
- The 16 faces were extracted from the installed Arena EmojiOne TMP atlas and mapped by the atlas's own 0-15 row-major metadata; they are not inferred or fabricated.
- Sprite numbers remain in accessible labels, hover titles, and raw code, but are not drawn over the emoji artwork.
- These extracted assets are used as small functional previews in this free, unofficial fan utility. Their local source and mapping are documented in assets/sprites/README.txt.
- Click/tap remains available on desktop, mobile, keyboard, and assistive technology.
- Selected-range start/end styling is also deferred. Version 7 supports stable from-caret changes while retaining native mobile text selection instead of introducing a fragile contenteditable surface.

ARENA LAB
- Shows the exact generated Arena string in a read-only field.
- Separates Arena-verified/core reference probes from unverified TextMeshPro-like candidates.
- Unverified candidates cover smallcaps, allcaps, lowercase, indent, line-indent, line-height, margin, width, nobr, and closing/reset behavior.
- Arena Lab displays a non-copyable warning for unsafe <font> behavior. There is no font picker or font/material probe bank.
- Extracted bundle names and the user-tested failures are retained only in FONT_RESEARCH_NOTES.md for historical research context.

PREVIEW AND DATA
- The clickable Arena Mirror uses a fully opaque black background in every theme, hover/pressed state, and alternate name view. User-palette glow remains outside the stage so it cannot tint the final colour/effect comparison.
- The finished-name field uses the BELEREN2016-BOLD font data and EmojiOne sprite atlas extracted read-only from the user's installed Arena build for this private prototype.
- Inline size, cspace, rotate, voffset, pos, sup, sub, mspace, space, mark, alpha, breaks, and sprites now render from their exact ordered caret positions; later tags persist and supersede earlier values like Arena.
- Rotate is rendered per glyph across the full -180 to 180 degree range.
- A separate VISUAL WIDTH WATCH/RISK indicator compares the browser-rendered name with the available Arena Mirror width. It is deliberately approximate and never alters the exact raw-code TOTAL/64 budget; Arena display geometry still needs calibration from user tests.
- Browser text shaping and Unity TextMesh Pro can still differ in kerning, SDF edges, spacing units, clipping, and shader behavior. Validate calibration in Arena before claiming pixel identity.
- The embedded Arena font and sprite provenance was reviewed for the 2026-07-29 release. The site carries the Wizards fan-content notice, remains free, and should remove the assets if a rights holder requests it.
- Global settings and palettes use the Version 7 local-storage key. Version 7 can import Version 6 preferences on first use and does not overwrite the Version 6 key.
- Deck names and inline events are not persisted. Nothing is uploaded.
- Copy fallback, colour/style undo, reduced-motion handling, offline operation, and native accessible text entry are retained from Version 6.

RELEASE CHECKLIST
1. Confirm the header says V7 LAB and the footer says V7 // OFFLINE READY.
2. Type mixed-case text, toggle ALL CAPS, and confirm the input case does not change while the raw-code letters do.
3. Open FX DRAWER, enable several global effects, and confirm the budget updates while colour stages reduce before FX disappear.
4. Place the caret within the deck name; click a sprite, br, and two values of the same from-caret tag. Confirm the finished name changes from those positions and no generic FX badges appear.
5. On desktop, drag the generic FX source into several MEGA TUBE positions. Confirm the picker opens after each drop, cancellation removes the placeholder, applying retains its position, and one Undo reverses the complete drop/choose/adjust action.
6. Click and drag sprites 0-15 and drag W/U/B/R/G colours into the tube. Confirm sprite artwork remains visible, click/tap insertion still works, and compiled bubbles follow the same order as RAW ARENA CODE.
7. Drag colour bubble 1 past colour bubble 2, then move it back with the keyboard. Confirm the colours reorder, bubble numbering follows raw-code order, and Undo restores the previous gradient.
8. Open ARENA LAB and compare RAW ARENA CODE with the copied clipboard value.
9. Exercise verified probes and unverified candidates separately in Arena. Confirm no font or material probe is available.
10. Test at desktop and narrow mobile widths, with keyboard-only navigation and reduced motion enabled.

FILES
- index.html: Version 7 interface and semantic controls.
- app.js: structured UI state, native-input caret tracking, undo, persistence, preview, probes, and copy behavior.
- logic.js: pure Arena compiler, serialization, tag registry, event rebasing, and exact budget accounting.
- styles.css: Version 6 visual system plus integrated Version 7 FX and Lab panels.
- assets/sprites/0.png through 15.png: review-only crops from the locally installed Arena EmojiOne TMP atlas; see assets/sprites/README.txt.
- assets/fonts/Beleren2016-Bold.otf: review-only font data from the locally installed Arena font bundle; see assets/fonts/README.txt.
- FONT_RESEARCH_NOTES.md: non-interactive record of extracted font/material names and unsafe Arena results.
- ARENA_FIT_TESTS.md: paste-ready checklist for measuring raw, rendered-width, effect-value, line, and sprite limits in Arena.
- favicon and manifest files: local browser/install metadata.
