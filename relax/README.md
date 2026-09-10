# Bubble Mix

Lives at https://turdgobbler.com/relax/ on the existing GitHub Pages site.

Tap small bubbles to pop them and large bubbles to split them into curved chains of 6–8 little bubbles. Sweep through a chain to burst it, snapping the liquid threads between bubbles. Ordinary bubbles can still be dragged, stretched, and merged. The compact tray has glossy bubble sliders for thickness and generation; its arrow tucks both away. The score, combo, speaker, and pause icons are the only other visible controls.

Rare sparkling golden bubbles split into longer, two-row chains of 12. Popping earns points, up to an 8× combo, and a 1,000-point celebration every ten pops. Golden splits pay 500 extra points; finishing a regular chain pays 300, or 1,500 for a golden chain. Each pop gets animated praise, with a larger “PERFECT!” or “GOLD RUSH!” celebration on completion. There are no lives, losing states, or score deductions. Best score is saved only in this browser under `bubble-mix.best.v1`.

Sound starts muted. The speaker button enables synthesized wet pops, a bass impact, and bright chime flourishes. Chain pops climb a pentatonic scale and resolve into a finishing chord. Rapid swipes retain short spacing between notes; voice limits and a compressor/limiter bound overlapping audio. The phone's volume controls output loudness. Vibration runs automatically when `navigator.vibrate` is supported, with a stronger pattern for large pops and chain finishes. Browser/API support does not guarantee vibration hardware. No microphone permission is needed.

The pause button and hidden-tab handling stop the simulation and audio. Reduced-motion preferences remove camera shake and large particle motion. Keyboard users can focus the canvas, select bubbles with arrow keys, and pop with Enter or Space.

## Development

Serve the repository root with any static HTTP server and open `/relax/`. No build, dependencies, backend, or external assets are needed. JavaScript uses native ES modules. All app code lives in this directory; the site homepage and existing tools keep their current behavior.

Run the deterministic checks from the repository root:

```
node --test relax/tests/*.test.mjs
```

The tests cover long simulation runs, generation limits, area-preserving merges, drag recovery, extreme inputs, resizing, tap classification, chain splitting and placement, fast swept hits, golden rarity, completion and bonuses, audio scheduling/cancellation, effect limits, reduced motion, and haptic patterns.

## Structure

- `js/physics.mjs`: bounded time steps, deformable membranes, collision links, merging, splitting, and population limits.
- `js/chains.mjs`: curved chain layouts, swept hit detection, and rising musical pitches.
- `js/render.mjs`: translucent film, iridescent rims, moving highlights, smooth merged outlines, golden bubbles, and liquid threads.
- `js/effects.mjs`, `js/feedback.mjs`, `js/rewards.mjs`: bounded visual celebrations, synthesized audio and vibration, points and praise.
- `js/theme.mjs`: material/palette/sound choices for future skins. Rainbow soap is the only current skin.
- `js/main.mjs`: UI, pointer and keyboard input, lifecycle, score storage, optional WebMCP integration.

On supporting browsers, `get_bubble_mix`, `configure_bubble_mix`, and `pop_bubbles` expose the same state/actions as the app. Invalid settings and stale IDs fail before mutation. Audio can only be enabled through the visible sound button.

Publish the directory with the repository's existing GitHub Pages deployment. `/relax` redirects to `/relax/`; all app imports and assets are relative. Revert the Bubble Mix commit to roll back this addition.
