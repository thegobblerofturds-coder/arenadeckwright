# Bubble Mix

Lives at https://turdgobbler.com/relax/ on the existing GitHub Pages site.

Tap bubbles to pop them; drag to stretch their membranes. Bubbles stick and flow together into larger bubbles. The tray controls thickness and automatic generation. Popping earns points, up to an 8× combo, and a 1,000-point pop party every ten pops. There are no lives, losing states, or score deductions. Best score is saved only in this browser under `bubble-mix.best.v1`.

Sound starts muted. The speaker button enables synthesized wet pops, a bass impact, and bright chime flourishes. The phone's volume still controls output loudness. Vibration uses `navigator.vibrate` when supported; duration patterns become stronger for large pops and parties. Browser/API support does not guarantee vibration hardware. No microphone permission is needed.

The pause button and hidden-tab handling stop the simulation and audio. Reduced-motion preferences remove camera shake and large particle motion. Keyboard users can focus the canvas, select bubbles with arrow keys, and pop with Enter or Space.

## Development

Serve the repository root with any static HTTP server and open `/relax/`. No build, dependencies, backend, or external assets are needed. JavaScript uses native ES modules. All app code lives in this directory; the site homepage and existing tools keep their current behavior.

Run the deterministic checks from the repository root:

```
node --test relax/tests/*.test.mjs
```

The tests cover long simulation runs, generation limits, area-preserving merges, drag recovery, extreme inputs, resizing, tap classification, score/combo/bonus behavior, effect limits, reduced motion, and haptic patterns.

## Structure

- `js/physics.mjs`: bounded time steps, deformable membranes, collision links, merging, and population limits.
- `js/render.mjs`: translucent film, iridescent rims, moving highlights, and smooth merged outlines.
- `js/effects.mjs`, `js/feedback.mjs`, `js/rewards.mjs`: bounded visual celebrations, synthesized audio and vibration, points and praise.
- `js/theme.mjs`: material/palette/sound choices for future skins. Rainbow soap is the only current skin.
- `js/main.mjs`: UI, pointer and keyboard input, lifecycle, score storage, optional WebMCP integration.

On supporting browsers, `get_bubble_mix`, `configure_bubble_mix`, and `pop_bubbles` expose the same state/actions as the app. Invalid settings and stale IDs fail before mutation. Audio can only be enabled through the visible sound button.

Publish the directory with the repository's existing GitHub Pages deployment. `/relax` redirects to `/relax/`; all app imports and assets are relative. Revert the Bubble Mix commit to roll back this addition.
