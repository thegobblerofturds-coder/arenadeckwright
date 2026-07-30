# Arena fit-test checklist

Use the current Arena build. Paste each string as a deck name, save, leave the deck editor, reopen it, and record:

- `FULL`, `CLIPPED`, `MISSING AFTER TAG`, or `REJECTED`
- the last visible character
- whether the result survives reopening
- anything different between the deck list and deck editor

Do not combine tests until the single-effect passes are complete. Arena is authoritative; the browser preview is only a comparison.

## 1. Confirm the raw boundary

These deliberately contain no colour tag:

| Test | Raw characters | Paste-ready name |
|---|---:|---|
| 64 wide glyphs | 64 | `WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW` |
| 65 wide glyphs | 65 | `WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW` |
| 64 narrow glyphs | 64 | `iiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii` |
| 65 narrow glyphs | 65 | `iiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii` |

If 64 `i` characters remain visible but 64 `W` characters do not, the second limit is rendered width rather than raw character count.

## 2. Test the Colourifier's exact-64 case

Both strings cost exactly 64 raw characters: six for `<#FFF>` and 58 visible letters.

| Test | Paste-ready name |
|---|---|
| Exact-64 wide | `<#FFF>WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW` |
| Exact-64 narrow | `<#FFF>iiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii` |

Also reconfirm the known exact-64 reference:

`<sup><i><#426><cspace=5><rotate=15>A<#E4D>nti-<voffset=5>Negativ`

## 3. Find the visual-width threshold

For each row, start with 16 `W` characters. Increase to 24, 32, 40, 48, 56, and finally the largest count allowed by the 64-character raw budget. When one fails, test halfway between the last pass and first failure.

| Prefix | What this isolates |
|---|---|
| `<#FFF>` | normal coloured text |
| `<size=5><#FFF>` | smallest useful size |
| `<size=10><#FFF>` | reference size |
| `<size=20><#FFF>` | large text |
| `<size=29><#FFF>` | largest supported size |
| `<cspace=5><#FFF>` | mild character spacing |
| `<cspace=20><#FFF>` | large character spacing |
| `<cspace=50><#FFF>` | current tool maximum |

Repeat the failing `W` count with `i`. This tells us whether failure follows glyph width, glyph count, or raw length.

## 4. Find individual value limits

Keep the visible text short so the 64-character ceiling cannot contaminate the result.

### Size

Test:

- `<size=5>SIZE TEST`
- `<size=10>SIZE TEST`
- `<size=20>SIZE TEST`
- `<size=29>SIZE TEST`

Record legibility, clipping above/below, and whether all letters remain visible.

### Character spacing

Replace `n` in `<cspace=n>SPACING` with:

`-20`, `-10`, `0`, `5`, `10`, `20`, `30`, `40`, `50`

Record overlap at negative values and the first positive value that clips or hides the ending.

### Per-letter rotation

Replace `n` in `<rotate=n>ROTATION` with:

`-180`, `-135`, `-90`, `-45`, `0`, `30`, `45`, `90`, `135`, `180`

Confirm that each letter rotates independently. Note the first angle where letters clip, disappear, or stop changing.

Then test later-tag superseding:

`<rotate=30>ABC<rotate=90>DEF<rotate=180>GHI`

### Vertical offset

Replace `n` in `<voffset=n>OFFSET` with:

`-50`, `-30`, `-20`, `-10`, `-5`, `0`, `5`, `10`, `20`, `30`, `50`

Record the first value where text clips or disappears above or below the field.

### Horizontal position

Replace `n` in `<pos=n>POSITION` with:

`0`, `40`, `80`, `100`, `150`, `200`, `250`, `300`, `400`, `500`

Record where the first letter begins and the first value where any part disappears.

### Monospace and inserted space

Test:

- `<mspace=0.5em>MONOSPACE`
- `<mspace=1em>MONOSPACE`
- `<mspace=2em>MONOSPACE`
- `<mspace=5em>MONOSPACE`
- `A<space=0.5em>B`
- `A<space=1em>B`
- `A<space=2em>B`
- `A<space=5em>B`

Record whether decimals and `em` units survive saving.

## 5. Test vertical and inline content

| Feature | Paste-ready name |
|---|---|
| Three lines | `FIRST LINE<br>SECOND LINE<br>THIRD LINE` |
| Sup then sub | `<sup>SUPER<sub>SUBNORMAL` |
| Highlight then alpha | `<mark=#FFFF0080>MARK<alpha=#80>FADE` |
| Reapplied size | `<size=29>BIG<size=5>SMALL<size=10>NORMAL` |
| Reapplied position | `<pos=0>A<pos=100>B<pos=200>C<pos=300>D` |

For `<br>`, record whether all lines appear in the deck editor, deck list, and after reopening.

## 6. Test sprite geometry without retesting artwork

For every sprite ID `0-15`, paste:

`A<sprite=n>B`

Record whether `A`, the sprite, and `B` all remain visible. Then test density:

`<sprite=0><sprite=1><sprite=2><sprite=3><sprite=4><sprite=5><sprite=6>`

If that fits, continue with `7-15` until the raw ceiling or visible geometry fails.

## 7. Final combination stress tests

Only after the individual limits are known:

1. Use the largest passing SIZE with the largest passing CSPACE.
2. Add the largest passing positive and negative VOFFSET at different caret positions.
3. Add one `<br>` and two sprites.
4. Fill remaining raw characters with text until `TOTAL/64` reaches exactly 64.
5. Save, leave, reopen, and compare the exact visible result with the Arena Mirror.

## Results to send back

The most useful report is one line per test:

`PREFIX/VALUE | RAW LENGTH | VISIBLE GLYPHS | FULL/CLIPPED/MISSING/REJECTED | LAST VISIBLE CHARACTER | SURVIVES REOPEN: YES/NO`

Example:

`<cspace=20> | 53 | 40 W | CLIPPED | character 31 | YES`

