# Bubble Mix

Lives at https://turdgobbler.com/relax/ on the existing GitHub Pages site.

Tap small bubbles to pop them and large bubbles to split them into curved chains of 6–8 little bubbles. Sweep through a chain to burst it, snapping the liquid threads between bubbles. Ordinary bubbles can be gently dragged, stretched, and merged. Hard pulls, fast flicks, and dragging through the opposite side burst the bubble before its outline can fold through itself.

Drag through empty space to finger-paint a thick rainbow ribbon. The trail gathers into little pools and becomes real, poppable bubbles after about 0.7 seconds. Painting supports multiple pointers, leaves chain sweeping available, and stays within the existing bubble budget. Short taps do not create accidental paint. Trails and pending beads clear when the viewport changes.

A giant squish bubble appears after about 15 seconds. Its four visible membranes peel away one at a time, with a broad jelly dent, a new rainbow color, and a rising chime for each hit. Its last layer opens into an ordinary bubble chain. After 40 seconds and at least ten hits, the next available giant slot brings a seven-hit boss. The seven dots on the bubble show remaining hits. Giants feel heavier than ordinary bubbles, stay in the play area, and cannot merge. Hard dragging consumes one layer and releases the grab; it never skips all the remaining layers. Keyboard focus stays on the same giant between hits.

The boss rises from below the screen over 1.45 seconds, stretching and settling into place while rainbow arcs converge and a watery chime rises. It becomes tappable when its entrance finishes. The final hit makes it swell and tremble for 0.52 seconds, then pays a **10,000,000-point bonus** and triggers three expanding explosion waves. Nearby bubbles pop in order of distance; their fragments join the sequence, and 24 new pearls spread outward and burst to rising notes. A single “MEGA CASCADE!” headline stays readable over the spectacle. The explosion finishes in about 4.5 seconds, has bounded particles, bubbles, and scheduled pops, and pauses with the page, including during the final swell. Bosses are spaced at least 70 seconds apart and only one giant or boss appears at a time. Layer hits pay 250,000 bonus points; completing a four-layer giant pays 2,000,000 extra.

The only persistent overlay is a modest score centered at the top. The multiplier still affects rewards but is not displayed. There are no buttons or sliders. Thickness stays at the recommended 78%. Bubble flow starts at 40% and increases smoothly with total pops: about 57% after 30 pops and 80% after 100, approaching 100% during longer play. New bubbles form at all four edges, with their liquid necks facing the edge they came from, then drift inward and across the screen. Grabbing a bubble takes control of its entrance immediately. The simulation's population and area limits still apply.

Rare sparkling golden bubbles split into longer, two-row chains of 12. Popping earns at least 50,000 points, up to an 8× combo, and a 1,000,000-point celebration every ten pops. Golden splits pay 500,000 extra points; finishing a regular chain pays 300,000, or 1,500,000 for a golden chain. A typical full chain earns millions. Each pop gets animated praise, with a larger “PERFECT!” or “GOLD RUSH!” celebration on completion. There are no lives, losing states, or score deductions. Best score is saved only in this browser under `bubble-mix.best.v2`; legacy `v1` scores are scaled by 1,000 on import and retained.

Bubbles have stronger spherical shading, curved reflections, and light along the lower rim. The lighting texture is generated once and reused across the deforming membranes. Big pops send sparks toward the score; busy chains add hearts and stars. Expanding jelly shockwaves compress and rebound nearby bubbles as the wave reaches them. Glossy rainbow droplets splatter onto the glass, stick briefly, then slide slowly and dissolve over 3.8–5.8 seconds. There are at most ten physical waves and 64 glass droplets, with droplets kept below the score. Occasional “YOU’RE DOING GREAT!” messages appear during play, with 24–36 seconds between encouragements after the first one.

Sound unlocks with the first canvas tap or gameplay keypress, as required by browser autoplay rules. Wet pops, bass impacts, and chime flourishes accompany play. Painting has soft liquid stretch sounds and haptics. Chain pops climb a pentatonic scale and resolve into a finishing chord. A mechanical score ratchet uses crisp double tooth contacts and short metal resonances; it clicks quickly during big payouts, slows near the total, and finishes with one heavier clack. Its short sample is synthesized once and reused. A recorded anime “WOW!” reaction replaces the former robotic voice, now at a lower 0.42 gain with its natural pitch preserved. It plays on busy chains and giant finales, with a ten-second activity cooldown and no overlapping clips; provenance and processing are in [audio/README.md](audio/README.md). Other effects briefly soften underneath the voice. Rapid swipes retain short spacing between notes; voice limits and a compressor/limiter bound overlapping audio. Device volume controls output loudness. Vibration runs automatically when `navigator.vibrate` is supported, with longer, stronger patterns for ordinary pops, fragments, large pops, and chain finishes. Browser/API support does not guarantee vibration hardware. No microphone permission is needed.

Profanity and silly exclamations cycle through “FUCK YES!”, “HOLY SHIT!”, “PISS!”, and “TURDS!” in pop praise. Eligible pops have a 30% chance of choosing the next one, with at least five seconds between these cheers. “YOU’RE FUCKING CRUSHING IT!” and “FUCK YES. KEEP GOING!” also appear in the encouragement rotation. Special-bubble progress and cascade headlines retain their meaning.

Hidden-tab handling stops the simulation and all audio, including the score ratchet and in-progress or pending voice clips. Reduced-motion preferences remove camera shake, large particle motion, boss entrance travel, the final swell and tremble, physical shockwaves, and glass sliding. The boss instead fades in briefly and has a shorter final pause; glass droplets fade in place. Keyboard users can focus the canvas, select bubbles with arrow keys, and pop with Enter or Space.

## Development

Serve the repository root with any static HTTP server and open `/relax/`. No build, dependencies, backend, or runtime external assets are needed. JavaScript uses native ES modules; the bundled voice clip lives in `audio/wow-anime.wav` and is fetched from the same origin. All app code lives in this directory; the site homepage and existing tools keep their current behavior.

Run the deterministic checks from the repository root:

```
node --test relax/tests/*.test.mjs
```

The tests cover long simulation runs, progressive flow and population limits, area-preserving merges, rounded drag recovery, extreme-drag bursts, resizing, tap classification, chain splitting and placement, fast swept hits, golden rarity, million-scale rewards, audio and voice scheduling/cancellation, encouragement timing, effect limits, reduced motion, and haptic patterns. Additional checks cover multi-pointer painting and beading, four-hit giants, seven-hit bosses, layer identity and safe grabs, crowded and empty-board cascades, one-time rewards, boss entrance and delayed detonation, all four spawning directions, traveling jelly waves, glass lifecycle, ratchet pacing and waveform bounds, and complete cleanup.

## Structure

- `js/physics.mjs`: bounded time steps, deformable membranes, collision links, merging, splitting, giant entrances and layers, timed boss cascades, traveling shockwaves, edge spawning, and population limits.
- `js/paint.mjs`: bounded rainbow ribbons, liquid pooling, and conversion into poppable bubbles.
- `js/chains.mjs`: curved chain layouts, swept hit detection, and rising musical pitches.
- `js/play.mjs`: default thickness, progressive flow, activity-triggered cheers, and occasional encouragement.
- `js/render.mjs`: translucent film, cached sphere lighting, iridescent rims, moving highlights, smooth merged outlines, golden bubbles, and liquid threads.
- `js/effects.mjs`, `js/feedback.mjs`, `js/rewards.mjs`: bounded visual celebrations, synthesized audio and vibration, points and praise.
- `js/glass.mjs`: glossy glass droplets, viscous sliding, and fade-out.
- `js/ratchet.mjs`: synthesized mechanical tooth contacts and score ratchet pacing.
- `js/theme.mjs`: material/palette/sound choices for future skins. Rainbow soap is the only current skin.
- `js/main.mjs`: UI, pointer and keyboard input, lifecycle, score storage, optional WebMCP integration.

On supporting browsers, `get_bubble_mix` and `pop_bubbles` expose gameplay state and actions. `configure_bubble_mix` provides simulation settings and pause state for inspection; these controls are not shown on the page. Invalid settings and stale IDs fail before mutation. Actual taps or gameplay keypresses unlock sound.

Publish the directory with the repository's existing GitHub Pages deployment. `/relax` redirects to `/relax/`; all app imports and assets are relative. Revert the relevant commit and redeploy to roll back a change.
