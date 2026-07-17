(() => {
  'use strict';

  const Logic = window.DeckwrightV6Logic;
  const DEFAULT_NAME = 'YOUR DECK NAME';
  const STORAGE_KEY = 'turdgobbler-deckwright-mega-v3';
  const MAX_STOPS = 7;
  const MAX_FAVOURITES = 24;
  const MAX_HISTORY = 60;
  const MIN_BUBBLE_GAP_PX = 38;
  const ANCHOR_BUBBLE_GAP_PX = 58;
  const TUBE_INSET = 14;
  const ANCHOR_SWAP_ZONE = .04;
  const MANA_ORDER = ['W', 'U', 'B', 'R', 'G'];
  const MANA = {
    W: {name: 'White', colour: '#F4E7C4'},
    U: {name: 'Blue', colour: '#2684FF'},
    B: {name: 'Black', colour: '#6B4777'},
    R: {name: 'Red', colour: '#E34832'},
    G: {name: 'Green', colour: '#39A96B'}
  };
  const IDENTITIES = {
    W: 'MONOWHITE', U: 'MONOBLUE', B: 'MONOBLACK', R: 'MONORED', G: 'MONOGREEN',
    WU: 'AZORIUS', UB: 'DIMIR', BR: 'RAKDOS', RG: 'GRUUL', WG: 'SELESNYA',
    WB: 'ORZHOV', UR: 'IZZET', BG: 'GOLGARI', WR: 'BOROS', UG: 'SIMIC',
    WUG: 'BANT', WUB: 'ESPER', UBR: 'GRIXIS', BRG: 'JUND', WRG: 'NAYA',
    WBG: 'ABZAN', WUR: 'JESKAI', UBG: 'SULTAI', WBR: 'MARDU', URG: 'TEMUR'
  };
  const MTG_PRESETS = Object.entries(IDENTITIES)
    .filter(([codes]) => codes.length >= 1 && codes.length <= 3)
    .map(([codes, name]) => ({name, codes: Array.from(codes)}));
  const BUILT_INS = [
    {name: 'RAINBOW', colours: ['#F03444', '#FF8A24', '#FFE14A', '#43C96B', '#25BDE5', '#4669E8', '#A447D1']},
    {name: 'SUNSET', colours: ['#45256F', '#A52E72', '#E24B4B', '#F1872B', '#FFD56A']},
    {name: 'SUNRISE', colours: ['#253365', '#7757A5', '#E77D91', '#FFB45D', '#FFF0B0']},
    {name: 'SILVER', colours: ['#41464B', '#9DA4AA', '#F2F3F3', '#7B8288', '#202326']},
    {name: 'MIDNIGHT', colours: ['#080B18', '#14275E', '#315CB5', '#7A67C7']},
    {name: 'TOXIC', colours: ['#10190D', '#267026', '#63D42F', '#D7FF45']}
  ];

  const $ = (id) => document.getElementById(id);
  const els = {
    consoleSurface: $('consoleSurface'), viewModeToggle: $('viewModeToggle'),
    deckName: $('deckName'), inputState: $('inputState'), outputPreview: $('outputPreview'),
    copyButton: $('copyButton'), copyBurst: $('copyBurst'), copyStatus: $('copyStatus'),
    copyHintMessage: $('copyHintMessage'),
    prismaticEdit: $('prismaticEdit'),
    prismaticNameBackdrop: $('prismaticNameBackdrop'), prismaticDeckName: $('prismaticDeckName'),
    prismaticNameClose: $('prismaticNameClose'), prismaticNameDone: $('prismaticNameDone'),
    rawCount: $('rawCount'), gradientPips: $('gradientPips'), undoButton: $('undoButton'), redoButton: $('redoButton'),
    rotateGradient: $('rotateGradient'), flipGradient: $('flipGradient'), gradientBar: $('gradientBar'),
    tubeAddButton: $('tubeAddButton'), tubeHint: $('tubeHint'), stageWarning: $('stageWarning'),
    barStopMarkers: $('barStopMarkers'), quickPalettes: $('quickPalettes'),
    paletteTray: $('paletteTray'),
    manaComposer: $('manaComposer'), identityName: $('identityName'), manaOrder: $('manaOrder'),
    clearMana: $('clearMana'), builtInPalettes: $('builtInPalettes'), savedPalettes: $('savedPalettes'),
    favouriteCurrent: $('favouriteCurrent'),
    presetContext: $('presetContext'), selectionSummary: $('selectionSummary'), presetRail: $('presetRail'),
    deleteZone: $('deleteZone'), stopEditorBackdrop: $('stopEditorBackdrop'), stopEditor: $('stopEditor'),
    stopEditorTitle: $('stopEditorTitle'), stopEditorClose: $('stopEditorClose'),
    stopEditorWheel: $('stopEditorWheel'), stopEditorWheelCursor: $('stopEditorWheelCursor'),
    stopEditorPreview: $('stopEditorPreview'), stopEditorPreviewHex: $('stopEditorPreviewHex'),
    stopEditorHex: $('stopEditorHex'), stopEditorConfirm: $('stopEditorConfirm'),
    stopCards: $('stopCards'), addStopCard: $('addStopCard'),
    profileName: $('profileName'), saveProfile: $('saveProfile'), profileList: $('profileList'),
    exportProfiles: $('exportProfiles'), importProfiles: $('importProfiles'), profileFile: $('profileFile'),
    profileMessage: $('profileMessage'), systemStatus: $('systemStatus'),
    rawOutput: $('rawOutput'), copyRaw: $('copyRaw'), diagnosticReadout: $('diagnosticReadout')
  };

  let gradientStops = makeStops([MANA.U.colour, MANA.R.colour, MANA.G.colour]);
  let formatting = {bold: false, italic: false, underline: false, strike: false};
  let selectedStop = 0;
  let manaSelection = [];
  let paletteTrayOpen = false;
  let favourites = [];
  let profiles = [];
  let history = [];
  let future = [];
  let currentBuild = null;
  let feedbackTimer = null;
  let defaultNameUntouched = true;
  let secondStopMemory = {colour: MANA.R.colour, position: 1};
  let stopEditorOpen = false;
  let editorDraftColour = null;
  let viewMode = 'v6';
  let lastTrackWidth = 0;

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function makeStops(colours) {
    const source = colours.slice(0, MAX_STOPS).map((colour) => colour.toUpperCase());
    if (!source.length) source.push('#FFFFFF');
    return source.map((colour, index) => ({colour, position: source.length === 1 ? 0 : index / (source.length - 1)}));
  }

  function identityKey(codes) {
    return Array.from(new Set(codes)).sort((left, right) => MANA_ORDER.indexOf(left) - MANA_ORDER.indexOf(right)).join('');
  }

  function stopSignature(stops = gradientStops) {
    return Logic.normaliseGradientStops(stops)
      .map((stop) => `${stop.colour}@${stop.position.toFixed(3)}`)
      .join('|');
  }

  function gradientCss(stops = gradientStops) {
    const source = Logic.normaliseGradientStops(stops);
    if (source.length === 1) return `linear-gradient(90deg,${source[0].colour},${source[0].colour})`;
    return `linear-gradient(90deg,${source
      .map((stop) => `${stop.colour} ${(stop.position * 100).toFixed(1)}%`)
      .join(',')})`;
  }

  function saveableStops(stops = gradientStops) {
    const source = Array.isArray(stops) ? stops : [];
    return Logic.normaliseGradientStops(source).map((stop, index) => ({
      colour: stop.colour,
      position: stop.position,
      locked: Boolean(source.slice().sort((left, right) => Number(left.position) - Number(right.position))[index]?.locked)
    }));
  }

  function measuredTrackWidth() {
    const bounds = els.gradientBar.getBoundingClientRect();
    const measured = bounds.width - TUBE_INSET * 2;
    if (measured > 20) lastTrackWidth = measured;
    return lastTrackWidth || Math.max(240, Math.min(900, (window.innerWidth || 360) - 76));
  }

  function tubeCollisionGap(count = gradientStops.length) {
    if (count < 2) return 0;
    const trackWidth = measuredTrackWidth();
    return Math.min(MIN_BUBBLE_GAP_PX / trackWidth, 1 / (count - 1));
  }

  function tubeAnchorCollisionGap(count = gradientStops.length) {
    if (count < 2) return 0;
    const trackWidth = measuredTrackWidth();
    return Math.min(ANCHOR_BUBBLE_GAP_PX / trackWidth, 1);
  }

  function normalisePalette(stops) {
    const raw = (Array.isArray(stops) ? stops : [])
      .filter((stop) => stop && Logic.validHex(stop.colour) && Number.isFinite(Number(stop.position)))
      .map((stop) => ({colour: stop.colour.toUpperCase(), position: Number(stop.position), locked: Boolean(stop.locked)}))
      .sort((left, right) => left.position - right.position)
      .slice(0, MAX_STOPS);
    const source = Logic.normaliseGradientStops(raw);
    const separated = Logic.separateGradientStops(
      source,
      tubeCollisionGap(source.length),
      tubeAnchorCollisionGap(source.length)
    );
    return separated.map((stop, index) => ({...stop, locked: Boolean(raw[index]?.locked)}));
  }

  function paletteWithLocks(stops) {
    const incoming = normalisePalette(stops);
    const locked = gradientStops.filter((stop) => stop.locked);
    if (!locked.length) return incoming;
    const result = incoming.map((stop) => ({...stop, locked: false}));
    const used = new Set();
    locked.forEach((lockedStop) => {
      let target = result.reduce((best, stop, index) => {
        if (used.has(index)) return best;
        const distance = Math.abs(stop.position - lockedStop.position);
        return !best || distance < best.distance ? {index, distance} : best;
      }, null)?.index;
      if (target === undefined && result.length < MAX_STOPS) {
        result.push({...lockedStop});
        target = result.length - 1;
      }
      if (target !== undefined) {
        result[target] = {...result[target], colour: lockedStop.colour, position: lockedStop.position, locked: true};
        used.add(target);
      }
    });
    return normalisePalette(result);
  }

  function reorderUnlocked(transform) {
    const indices = gradientStops.map((stop, index) => stop.locked ? -1 : index).filter((index) => index >= 0);
    const colours = transform(indices.map((index) => gradientStops[index].colour));
    indices.forEach((index, order) => { gradientStops[index].colour = colours[order]; });
  }

  function haptic(duration = 6) {
    const pulse = Array.isArray(duration)
      ? duration.map((value, index) => index % 2 === 0 ? Math.min(48, value + 8) : value)
      : Math.min(42, Math.max(12, duration + 8));
    try { navigator.vibrate?.(pulse); } catch (_) {}
  }

  function closePrismaticNameEditor() {
    els.prismaticDeckName.blur();
    els.prismaticNameBackdrop.hidden = true;
    document.body.style.overflow = '';
  }

  function renderViewMode() {
    const prismatic = viewMode === 'prismatic';
    els.consoleSurface.classList.toggle('prismatic-mode', prismatic);
    els.viewModeToggle.setAttribute('aria-pressed', String(prismatic));
    els.viewModeToggle.setAttribute('aria-label', prismatic
      ? 'Switch to the full command deck'
      : 'Switch to compact LCD name and copy controls');
    if (!prismatic) closePrismaticNameEditor();
  }

  function openPrismaticNameEditor() {
    els.prismaticDeckName.value = els.deckName.value;
    els.prismaticNameBackdrop.hidden = false;
    document.body.style.overflow = 'hidden';
    els.prismaticDeckName.focus({preventScroll: true});
    if (defaultNameUntouched && els.prismaticDeckName.value === DEFAULT_NAME) els.prismaticDeckName.select();
    haptic(5);
  }

  function pulseSelectedMarker(index = selectedStop) {
    els.barStopMarkers.querySelectorAll('.bar-marker').forEach((marker) => marker.classList.toggle('selected', marker.dataset.stopIndex === String(index)));
    const marker = els.barStopMarkers.querySelector(`[data-stop-index="${index}"]`);
    if (!marker) return;
    marker.classList.remove('selection-pulse');
    void marker.offsetWidth;
    marker.classList.add('selection-pulse');
  }

  function hslToHex(hue, saturation, lightness) {
    const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
    const sector = ((hue % 360) + 360) % 360 / 60;
    const second = chroma * (1 - Math.abs(sector % 2 - 1));
    const [red, green, blue] = sector < 1 ? [chroma, second, 0]
      : sector < 2 ? [second, chroma, 0]
        : sector < 3 ? [0, chroma, second]
          : sector < 4 ? [0, second, chroma]
            : sector < 5 ? [second, 0, chroma]
              : [chroma, 0, second];
    const match = lightness - chroma / 2;
    return '#' + [red, green, blue].map((value) => Math.round((value + match) * 255).toString(16).padStart(2, '0')).join('').toUpperCase();
  }

  function hexToHsl(hex) {
    const [red, green, blue] = [1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16) / 255);
    const maximum = Math.max(red, green, blue);
    const minimum = Math.min(red, green, blue);
    const delta = maximum - minimum;
    const lightness = (maximum + minimum) / 2;
    const saturation = delta === 0 ? 0 : delta / (1 - Math.abs(2 * lightness - 1));
    let hue = 0;
    if (delta) {
      if (maximum === red) hue = 60 * (((green - blue) / delta) % 6);
      else if (maximum === green) hue = 60 * ((blue - red) / delta + 2);
      else hue = 60 * ((red - green) / delta + 4);
    }
    return {hue: (hue + 360) % 360, saturation, lightness};
  }

  function wheelColourAt(x, y) {
    const distance = Math.min(1, Math.hypot(x, y));
    const hue = (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
    if (distance <= .72) {
      const intensity = distance / .72;
      return hslToHex(hue, intensity, 1 - intensity * .5);
    }
    return hslToHex(hue, 1, Math.max(0, .5 * (1 - (distance - .72) / .28)));
  }

  function drawColourWheel() {
    const canvas = els.stopEditorWheel;
    const context = canvas.getContext('2d');
    const image = context.createImageData(canvas.width, canvas.height);
    const centre = canvas.width / 2;
    for (let y = 0; y < canvas.height; y += 1) {
      for (let x = 0; x < canvas.width; x += 1) {
        const normalX = (x - centre) / centre;
        const normalY = (y - centre) / centre;
        const distance = Math.hypot(normalX, normalY);
        const offset = (y * canvas.width + x) * 4;
        if (distance > 1) continue;
        const colour = wheelColourAt(normalX, normalY);
        image.data[offset] = parseInt(colour.slice(1, 3), 16);
        image.data[offset + 1] = parseInt(colour.slice(3, 5), 16);
        image.data[offset + 2] = parseInt(colour.slice(5, 7), 16);
        image.data[offset + 3] = 255;
      }
    }
    context.putImageData(image, 0, 0);
  }

  function positionWheelCursor(colour) {
    const {hue, saturation, lightness} = hexToHsl(colour);
    const distance = lightness < .5
      ? .72 + (1 - lightness / .5) * .28
      : Math.min(.72, Math.max(saturation, (1 - lightness) * 2) * .72);
    const radians = hue * Math.PI / 180;
    els.stopEditorWheelCursor.style.left = `${50 + Math.cos(radians) * distance * 50}%`;
    els.stopEditorWheelCursor.style.top = `${50 + Math.sin(radians) * distance * 50}%`;
    els.stopEditorWheelCursor.style.setProperty('--cursor-colour', colour);
  }

  function wheelPoint(event) {
    const bounds = els.stopEditorWheel.getBoundingClientRect();
    let x = (event.clientX - bounds.left) / bounds.width * 2 - 1;
    let y = (event.clientY - bounds.top) / bounds.height * 2 - 1;
    const distance = Math.hypot(x, y);
    if (distance > 1) { x /= distance; y /= distance; }
    return {x, y};
  }

  function renderStopEditor() {
    const stop = gradientStops[selectedStop];
    if (!stop) return;
    const colour = stopEditorOpen && editorDraftColour ? editorDraftColour : stop.colour;
    els.stopEditorTitle.textContent = String(selectedStop + 1);
    els.stopEditor.style.setProperty('--editor-colour', colour);
    els.stopEditorPreview.style.setProperty('--preview-colour', colour);
    els.stopEditorPreviewHex.textContent = colour;
    positionWheelCursor(colour);
    if (document.activeElement !== els.stopEditorHex) els.stopEditorHex.value = colour;
    els.stopEditorHex.classList.remove('error');
    els.stopEditorHex.removeAttribute('aria-invalid');
  }

  function setEditorDraft(colour, syncHex = true) {
    editorDraftColour = colour;
    els.stopEditor.style.setProperty('--editor-colour', colour);
    els.stopEditorPreview.style.setProperty('--preview-colour', colour);
    els.stopEditorPreviewHex.textContent = colour;
    positionWheelCursor(colour);
    if (syncHex) els.stopEditorHex.value = colour;
  }

  function openStopEditor(index) {
    selectedStop = Math.max(0, Math.min(index, gradientStops.length - 1));
    stopEditorOpen = true;
    editorDraftColour = gradientStops[selectedStop].colour;
    els.stopEditorHex.blur();
    document.body.classList.add('stop-editor-open');
    renderGradientBar();
    renderStopEditor();
    els.stopEditorBackdrop.hidden = false;
    requestAnimationFrame(() => els.stopEditor.focus({preventScroll: true}));
    pulseSelectedMarker(selectedStop);
    haptic(4);
  }

  function closeStopEditor() {
    stopEditorOpen = false;
    editorDraftColour = null;
    els.stopEditorHex.blur();
    document.body.classList.remove('stop-editor-open');
    els.stopEditorBackdrop.hidden = true;
    els.stopEditorHex.classList.remove('error');
    els.stopEditorHex.removeAttribute('aria-invalid');
  }

  function snapshot() {
    return clone({gradientStops, formatting, selectedStop, manaSelection, secondStopMemory});
  }

  function checkpoint(clearFuture = true) {
    history.push(snapshot());
    if (history.length > MAX_HISTORY) history.shift();
    if (clearFuture) future = [];
  }

  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        gradientStops, formatting, manaSelection, favourites, profiles, secondStopMemory, viewMode
      }));
    } catch (_) {}
  }

  function validSavedPalette(entry) {
    return entry && typeof entry.name === 'string' && Array.isArray(entry.stops) && entry.stops.length >= 1;
  }

  function validProfile(entry) {
    return entry && typeof entry.id === 'string' && typeof entry.name === 'string'
      && entry.state && Array.isArray(entry.state.gradientStops);
  }

  function restorePreferences() {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      if (Array.isArray(stored.gradientStops)) gradientStops = normalisePalette(stored.gradientStops);
      if (stored.viewMode === 'prismatic' || stored.viewMode === 'v6') viewMode = stored.viewMode;
      if (stored.formatting && typeof stored.formatting === 'object') {
        Object.keys(formatting).forEach((key) => { formatting[key] = Boolean(stored.formatting[key]); });
      }
      if (Array.isArray(stored.manaSelection)) manaSelection = Array.from(new Set(stored.manaSelection.filter((code) => MANA[code]))).slice(0, 5);
      if (stored.secondStopMemory && /^#[0-9a-f]{6}$/i.test(stored.secondStopMemory.colour)) {
        secondStopMemory = {colour: stored.secondStopMemory.colour.toUpperCase(), position: 1};
      }
      if (Array.isArray(stored.favourites)) {
        favourites = stored.favourites.filter(validSavedPalette).slice(0, MAX_FAVOURITES).map((entry, index) => ({
          name: `SLOT ${String(index + 1).padStart(2, '0')}`,
          stops: saveableStops(entry.stops)
        }));
      }
      if (Array.isArray(stored.profiles)) {
        profiles = stored.profiles.filter(validProfile).map((entry) => ({
          ...entry,
          name: entry.name.slice(0, 48),
          state: {...entry.state, gradientStops: saveableStops(entry.state.gradientStops)}
        }));
      }
    } catch (_) {}
    selectedStop = Math.min(selectedStop, gradientStops.length - 1);
  }

  function commitMutation(mutator, options = {}) {
    checkpoint();
    mutator();
    gradientStops = normalisePalette(gradientStops);
    selectedStop = Math.max(0, Math.min(selectedStop, gradientStops.length - 1));
    persist();
    renderAll();
    haptic(options.haptic || 5);
  }

  function undo() {
    const previous = history.pop();
    if (!previous) return;
    future.push(snapshot());
    gradientStops = normalisePalette(previous.gradientStops);
    formatting = {...formatting, ...previous.formatting};
    selectedStop = Math.min(previous.selectedStop, gradientStops.length - 1);
    manaSelection = previous.manaSelection || [];
    secondStopMemory = previous.secondStopMemory || secondStopMemory;
    persist();
    renderAll();
    haptic(8);
  }

  function redo() {
    const next = future.pop();
    if (!next) return;
    checkpoint(false);
    gradientStops = normalisePalette(next.gradientStops);
    formatting = {...formatting, ...next.formatting};
    selectedStop = Math.min(next.selectedStop, gradientStops.length - 1);
    manaSelection = next.manaSelection || [];
    secondStopMemory = next.secondStopMemory || secondStopMemory;
    persist();
    renderAll();
    haptic(8);
  }

  function renderPreview(segments) {
    els.outputPreview.replaceChildren();
    segments.forEach((segment) => {
      const span = document.createElement('span');
      span.textContent = segment.text;
      span.style.color = Logic.arenaColour(segment.colour);
      span.style.fontWeight = formatting.bold ? '800' : '400';
      span.style.fontStyle = formatting.italic ? 'italic' : 'normal';
      span.style.textDecoration = [
        formatting.underline && 'underline', formatting.strike && 'line-through'
      ].filter(Boolean).join(' ') || 'none';
      els.outputPreview.appendChild(span);
    });
  }

  function renderPips(segments) {
    els.gradientPips.replaceChildren();
    segments.forEach((segment) => {
      const pip = document.createElement('i');
      pip.style.setProperty('--pip', Logic.arenaColour(segment.colour));
      els.gradientPips.appendChild(pip);
    });
    els.gradientPips.setAttribute('aria-label', `${segments.length} gradient ${segments.length === 1 ? 'stage' : 'stages'}`);
  }

  function activeStopIndices() {
    const total = gradientStops.length;
    const available = Math.max(1, Math.min(total, currentBuild?.maxStops || 1));
    if (available >= total) return new Set(gradientStops.map((_, index) => index));
    if (available === 1) return new Set([0]);
    return new Set(Array.from({length: available}, (_, index) => Math.round(index * (total - 1) / (available - 1))));
  }

  function updateStageAvailability() {
    if (!currentBuild) return;
    const active = activeStopIndices();
    els.barStopMarkers.querySelectorAll('.bar-marker').forEach((marker) => {
      const index = Number(marker.dataset.stopIndex);
      const dormant = !active.has(index);
      marker.classList.toggle('stage-dormant', dormant);
      const baseLabel = marker.dataset.baseLabel || marker.getAttribute('aria-label') || `Colour ${index + 1}`;
      marker.dataset.baseLabel = baseLabel;
      marker.setAttribute('aria-label', dormant ? `${baseLabel} Currently dimmed because the name leaves no Arena code space for this stop.` : baseLabel);
    });
    const over = currentBuild.rawLength > Logic.LIMIT;
    const total = gradientStops.length;
    const available = Math.max(1, Math.min(total, currentBuild.maxStops || 1));
    els.stageWarning.textContent = over
      ? `OVER 64 · ${available} OF ${total} COLOURS FIT`
      : available < total
        ? `${total} COLOURS · ${available} FIT`
        : '';
    els.stageWarning.classList.toggle('visible', Boolean(els.stageWarning.textContent));
    els.stageWarning.classList.toggle('over', over);
  }

  function renderOutput() {
    const sampled = Logic.sampleGradientStops(gradientStops, 7);
    currentBuild = Logic.build(els.deckName.value, sampled, formatting, Logic.LIMIT);
    renderPreview(currentBuild.segments);
    renderPips(currentBuild.segments);
    const overBy = Math.max(0, currentBuild.rawLength - Logic.LIMIT);
    els.rawCount.textContent = overBy ? `${currentBuild.rawLength} / ${Logic.LIMIT} · +${overBy}` : `${currentBuild.rawLength} / ${Logic.LIMIT}`;
    els.rawCount.classList.toggle('over-limit', overBy > 0);
    const invalid = currentBuild.unsupported.length > 0;
    const trolling = !invalid && Logic.isMostlyWhite(gradientStops);
    els.inputState.textContent = invalid
      ? 'UNSUPPORTED CHARACTER'
      : trolling
        ? 'ARE YOU TROLLING RN?'
        : '';
    els.inputState.classList.toggle('error', invalid);
    els.inputState.classList.toggle('trolling', trolling);
    updateStageAvailability();
    renderDiagnostics();
  }

  function syncGradientSurface() {
    els.gradientBar.style.background = gradientCss();
    const glowRoot = document.documentElement.style;
    glowRoot.setProperty('--user-glow-a', gradientStops[0].colour);
    glowRoot.setProperty('--user-glow-mid', Logic.colourAtPosition(gradientStops, .5));
    glowRoot.setProperty('--user-glow-b', Logic.colourAtPosition(gradientStops, 1));
  }

  function tubePositionFromClientX(clientX) {
    const bounds = els.gradientBar.getBoundingClientRect();
    const width = Math.max(1, bounds.width - TUBE_INSET * 2);
    return Math.max(0, Math.min(1, (clientX - bounds.left - TUBE_INSET) / width));
  }

  function placeTubeStop(index, requested, originalPosition) {
    const moving = gradientStops[index];
    if (!moving || index <= 0) return;
    if (requested <= ANCHOR_SWAP_ZONE) {
      gradientStops[0].position = originalPosition;
      moving.position = 0;
    } else {
      moving.position = Logic.collisionPosition(
        gradientStops,
        index,
        requested,
        tubeCollisionGap(),
        tubeAnchorCollisionGap()
      );
    }
    gradientStops.sort((left, right) => left.position - right.position);
    selectedStop = gradientStops.indexOf(moving);
    manaSelection = [];
  }

  function setTubeDeleteTarget(clientX, clientY, marker, dragState) {
    const bounds = els.deleteZone.getBoundingClientRect();
    const inside = clientX >= bounds.left - 8 && clientX <= bounds.right + 8 && clientY >= bounds.top - 12 && clientY <= bounds.bottom + 12;
    const overDelete = inside && gradientStops.length > 1;
    if (overDelete !== dragState.overDelete) {
      dragState.overDelete = overDelete;
      els.deleteZone.classList.toggle('drag-over', overDelete);
      marker.classList.toggle('delete-ready', overDelete);
      if (overDelete) haptic([12, 18, 12]);
    }
  }

  function clearTubeDragFeedback() {
    document.body.classList.remove('tube-dragging');
    els.gradientBar.classList.remove('anchor-swap-ready');
    els.deleteZone.classList.remove('drag-active', 'drag-over', 'delete-blocked');
  }

  function deleteTubeStop(index) {
    if (gradientStops.length <= 1 || index < 0 || index >= gradientStops.length) return;
    const [removed] = gradientStops.splice(index, 1);
    secondStopMemory = {colour: removed.colour, position: 1};
    gradientStops = normalisePalette(gradientStops);
    selectedStop = Math.min(index, gradientStops.length - 1);
    manaSelection = [];
    closeStopEditor();
    persist();
    renderAll();
    haptic([18, 28, 20]);
  }

  function setDraggedStopPosition(index, clientX, clientY, marker, dragState) {
    const requested = tubePositionFromClientX(clientX);
    const position = Logic.collisionPosition(
      gradientStops,
      index,
      requested,
      tubeCollisionGap(),
      tubeAnchorCollisionGap()
    );
    gradientStops[index].position = position;
    dragState.requested = requested;
    dragState.resolved = position;
    marker.style.left = `${position * 100}%`;
    marker.style.top = `${clientY - els.gradientBar.getBoundingClientRect().top}px`;
    marker.setAttribute('aria-valuenow', String(Math.round(position * 100)));
    const order = gradientStops.reduce((total, stop, stopIndex) => total + (stopIndex !== index && stop.position < position ? 1 : 0), 0);
    if (order !== dragState.order) {
      dragState.order = order;
      haptic(4);
    }
    const swapReady = requested <= ANCHOR_SWAP_ZONE;
    if (swapReady !== dragState.swapReady) {
      dragState.swapReady = swapReady;
      els.gradientBar.classList.toggle('anchor-swap-ready', swapReady);
      if (swapReady) haptic([8, 11]);
    }
    setTubeDeleteTarget(clientX, clientY, marker, dragState);
    syncGradientSurface();
    renderOutput();
  }

  function renderGradientBar() {
    syncGradientSurface();
    els.barStopMarkers.replaceChildren();
    const tubeIsColourOneButton = gradientStops.length === 1;
    els.gradientBar.classList.toggle('single-colour-button', tubeIsColourOneButton);
    els.gradientBar.classList.toggle('multi-colour-track', !tubeIsColourOneButton);
    els.gradientBar.setAttribute('role', tubeIsColourOneButton ? 'button' : 'group');
    els.gradientBar.tabIndex = tubeIsColourOneButton ? 0 : -1;
    els.gradientBar.setAttribute('aria-label', tubeIsColourOneButton
      ? 'Colour 1. Touch anywhere on the tube to edit.'
      : 'Gradient track. Use the numbered cap or colour bubbles to edit colours.');
    els.tubeHint.textContent = tubeIsColourOneButton
      ? 'TOUCH TUBE TO EDIT COLOUR 1 · + ADDS A BUBBLE'
      : 'PRESS 1 OR A BUBBLE TO EDIT · + ADDS ANOTHER';
    gradientStops.forEach((stop, index) => {
      if (index === 0 && gradientStops.length < 2) return;
      const locked = Boolean(stop.locked);
      const movable = index > 0 && !locked;
      const marker = document.createElement('button');
      marker.type = 'button';
      marker.className = 'bar-marker';
      marker.dataset.stopIndex = String(index);
      marker.classList.toggle('first-bubble', index === 0);
      marker.classList.toggle('anchor', index === 0);
      marker.classList.toggle('locked', locked);
      marker.classList.toggle('selected', index === selectedStop);
      marker.style.left = `${stop.position * 100}%`;
      marker.style.setProperty('--stop-colour', stop.colour);
      const markerLabel = document.createElement('span');
      markerLabel.textContent = String(index + 1);
      marker.appendChild(markerLabel);
      if (index === gradientStops.length - 1) {
        const flowBrackets = document.createElement('i');
        const trackWidth = Math.max(1, els.gradientBar.getBoundingClientRect().width - TUBE_INSET * 2);
        const flowWidth = Math.max(0, (1 - stop.position) * trackWidth - 18);
        flowBrackets.className = 'marker-flow-brackets';
        flowBrackets.style.setProperty('--flow-width', `${flowWidth}px`);
        flowBrackets.setAttribute('aria-hidden', 'true');
        for (let bracket = 0; bracket < 3; bracket += 1) flowBrackets.appendChild(document.createElement('b'));
        marker.appendChild(flowBrackets);
      }
      marker.setAttribute('role', 'slider');
      marker.setAttribute('aria-label', movable
        ? `Gradient colour ${index + 1}. Drag to position or reorder. Colours keep a visible gap.`
        : locked
          ? `Gradient colour ${index + 1}, locked. Activate to edit.`
          : 'Gradient colour 1, fixed at the beginning. Activate to edit.');
      marker.dataset.baseLabel = marker.getAttribute('aria-label');
      marker.setAttribute('aria-valuemin', '0');
      marker.setAttribute('aria-valuemax', '100');
      marker.setAttribute('aria-valuenow', String(Math.round(stop.position * 100)));
      marker.setAttribute('aria-readonly', String(!movable));
      marker.title = movable
        ? 'Drag to position or reorder this colour'
        : locked ? 'Locked colour channel' : 'Colour 1 · fixed at the tube start';
      marker.addEventListener('click', (event) => {
        event.stopPropagation();
        if (marker.dataset.dragged === 'true' || marker.dataset.pointerTap === 'true') return;
        openStopEditor(index);
      });
      marker.addEventListener('pointerdown', (event) => {
        event.stopPropagation();
        selectedStop = index;
        if (!movable) return;
        event.preventDefault();
        const startX = event.clientX;
        const startY = event.clientY;
        let dragging = false;
        const dragState = {originalPosition: stop.position, requested: stop.position, resolved: stop.position, order: index, overDelete: false, swapReady: false};
        try { marker.setPointerCapture(event.pointerId); } catch (_) {}
        const move = (moveEvent) => {
          if (moveEvent.pointerId !== event.pointerId) return;
          if (!dragging && Math.hypot(moveEvent.clientX - startX, moveEvent.clientY - startY) < 4) return;
          if (!dragging) {
            checkpoint();
            dragging = true;
            marker.dataset.dragged = 'true';
            marker.classList.add('dragging');
            document.body.classList.add('tube-dragging');
            els.deleteZone.classList.add('drag-active');
          }
          setDraggedStopPosition(index, moveEvent.clientX, moveEvent.clientY, marker, dragState);
        };
        const finish = (finishEvent, cancelled = false) => {
          if (finishEvent.pointerId !== event.pointerId) return;
          marker.removeEventListener('pointermove', move);
          marker.removeEventListener('pointerup', finish);
          marker.removeEventListener('pointercancel', cancel);
          if (!dragging) {
            marker.dataset.pointerTap = 'true';
            openStopEditor(index);
            setTimeout(() => { delete marker.dataset.pointerTap; }, 0);
            return;
          }
          clearTubeDragFeedback();
          if (cancelled) {
            gradientStops[index].position = dragState.originalPosition;
            history.pop();
            renderAll();
            return;
          }
          if (dragState.overDelete) {
            deleteTubeStop(index);
            return;
          }
          placeTubeStop(index, dragState.requested, dragState.originalPosition);
          gradientStops = normalisePalette(gradientStops);
          persist();
          renderAll();
          haptic([7, 10]);
          setTimeout(() => { delete marker.dataset.dragged; }, 0);
        };
        const cancel = (cancelEvent) => finish(cancelEvent, true);
        marker.addEventListener('pointermove', move);
        marker.addEventListener('pointerup', finish);
        marker.addEventListener('pointercancel', cancel);
      });
      marker.addEventListener('keydown', (event) => {
        event.stopPropagation();
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End', 'Enter', ' '].includes(event.key)) return;
        event.preventDefault();
        if (['Enter', ' '].includes(event.key)) {
          openStopEditor(index);
          return;
        }
        if (!movable) return;
        const step = event.shiftKey ? .1 : .02;
        let position = gradientStops[index].position;
        if (event.key === 'ArrowLeft') position -= step;
        if (event.key === 'ArrowRight') position += step;
        if (event.key === 'Home') position = 0;
        if (event.key === 'End') position = 1;
        position = Math.max(0, Math.min(1, position));
        commitMutation(() => {
          placeTubeStop(index, position, gradientStops[index].position);
        }, {haptic: 7});
      });
      els.barStopMarkers.appendChild(marker);
    });
    updateStageAvailability();
  }

  function renderGradientEditor() {
    renderGradientBar();
    renderStopEditor();
    const canDelete = gradientStops.length > 1;
    els.deleteZone.classList.toggle('disabled', !canDelete);
    els.deleteZone.tabIndex = -1;
    els.deleteZone.setAttribute('aria-disabled', String(!canDelete));
    els.deleteZone.setAttribute('aria-label', canDelete ? 'Drag a gradient colour here to delete it' : 'One colour minimum');
    els.deleteZone.querySelector('span').textContent = canDelete ? 'DRAG A COLOUR HERE TO DELETE' : 'ONE COLOUR MINIMUM';
    els.undoButton.disabled = history.length === 0;
    els.redoButton.disabled = future.length === 0;
    els.rotateGradient.disabled = gradientStops.length < 2;
    els.flipGradient.disabled = gradientStops.length < 2;
    const atStopLimit = gradientStops.length >= MAX_STOPS;
    els.tubeAddButton.disabled = atStopLimit;
    els.tubeAddButton.hidden = atStopLimit;
    els.tubeAddButton.closest('.gradient-tube-row').classList.toggle('at-stop-limit', atStopLimit);
    els.tubeAddButton.setAttribute('aria-label', els.tubeAddButton.disabled
      ? 'Maximum of seven colour bubbles reached'
      : 'Add a draggable colour bubble');
  }

  function largestGapPosition() {
    const source = Logic.normaliseGradientStops(gradientStops);
    if (source[source.length - 1].position < 1) {
      source.push({...source[source.length - 1], position: 1});
    }
    let best = {size: -1, position: .5};
    for (let index = 1; index < source.length; index += 1) {
      const left = source[index - 1].position;
      const right = source[index].position;
      if (right - left > best.size) best = {size: right - left, position: (left + right) / 2};
    }
    return best.position;
  }

  function addStopAt(position) {
    if (gradientStops.length >= MAX_STOPS) return;
    const restoringSecondColour = gradientStops.length === 1;
    const point = restoringSecondColour ? 1 : Math.max(.01, Math.min(.99, position));
    commitMutation(() => {
      const colour = restoringSecondColour
        ? secondStopMemory.colour
        : Logic.colourAtPosition(gradientStops, point);
      gradientStops.push(restoringSecondColour ? {...secondStopMemory, position: point} : {colour, position: point});
      gradientStops.sort((left, right) => left.position - right.position);
      selectedStop = gradientStops.findIndex((stop) => Math.abs(stop.position - point) < .0001);
      manaSelection = [];
    });
    openStopEditor(selectedStop);
  }

  function addBubbleFromButton() {
    if (gradientStops.length >= MAX_STOPS) return;
    checkpoint();
    const firstExtra = gradientStops.length === 1;
    const point = firstExtra ? .82 : largestGapPosition();
    const colour = firstExtra ? secondStopMemory.colour : Logic.colourAtPosition(gradientStops, point);
    gradientStops = normalisePalette([...gradientStops, {colour, position: point}]);
    selectedStop = gradientStops.reduce((closest, stop, index) => {
      const distance = Math.abs(stop.position - point);
      return distance < closest.distance ? {index, distance} : closest;
    }, {index: gradientStops.length - 1, distance: Infinity}).index;
    manaSelection = [];
    persist();
    renderAll();
    haptic([12, 12, 18]);
    els.tubeAddButton.classList.remove('firing');
    void els.tubeAddButton.offsetWidth;
    els.tubeAddButton.classList.add('firing');
    const marker = els.barStopMarkers.querySelector(`[data-stop-index="${selectedStop}"]`);
    if (marker) {
      const markerBounds = marker.getBoundingClientRect();
      const buttonBounds = els.tubeAddButton.getBoundingClientRect();
      marker.style.setProperty('--launch-x', `${buttonBounds.left + buttonBounds.width / 2 - markerBounds.left - markerBounds.width / 2}px`);
      void marker.offsetWidth;
      marker.classList.add('bubble-launched');
    }
    setTimeout(() => {
      els.tubeAddButton.classList.remove('firing');
      if (marker) {
        marker.classList.remove('bubble-launched');
        marker.style.removeProperty('--launch-x');
      }
    }, 900);
  }

  function rotateGradient() {
    commitMutation(() => {
      reorderUnlocked(Logic.rotatePalette);
      if (manaSelection.length > 1) manaSelection = Logic.rotatePalette(manaSelection);
    });
  }

  function flipGradient() {
    commitMutation(() => {
      reorderUnlocked(Logic.flipPalette);
      if (manaSelection.length > 1) manaSelection = Logic.flipPalette(manaSelection);
    });
  }

  function normaliseHex(value) {
    const clean = String(value).trim().replace(/^#/, '');
    if (/^[0-9a-f]{3}$/i.test(clean)) return '#' + clean.split('').map((digit) => digit + digit).join('').toUpperCase();
    if (/^[0-9a-f]{6}$/i.test(clean)) return '#' + clean.toUpperCase();
    return null;
  }

  function renderManaComposer() {
    els.manaComposer.replaceChildren();
    MANA_ORDER.forEach((code) => {
      const button = document.createElement('button');
      const badge = document.createElement('i');
      const order = manaSelection.indexOf(code);
      button.type = 'button';
      button.className = 'mana-button';
      button.dataset.code = code;
      button.style.setProperty('--mana', MANA[code].colour);
      button.textContent = code;
      button.setAttribute('aria-label', `${MANA[code].name}${order >= 0 ? `, gradient position ${order + 1}` : ''}`);
      button.setAttribute('aria-pressed', String(order >= 0));
      button.disabled = false;
      if (order >= 0) { badge.textContent = String(order + 1); button.appendChild(badge); }
      button.addEventListener('click', () => {
        commitMutation(() => {
          const existing = manaSelection.indexOf(code);
          if (existing >= 0) manaSelection.splice(existing, 1);
          else if (manaSelection.length < 5) manaSelection.push(code);
          if (manaSelection.length) {
            const colours = manaSelection.map((manaCode) => MANA[manaCode].colour);
            gradientStops = paletteWithLocks(makeStops(colours));
            selectedStop = 0;
          }
        }, {name: 'MTG'});
      });
      els.manaComposer.appendChild(button);
    });
    const key = identityKey(manaSelection);
    const genericIdentity = manaSelection.length === 4
      ? 'FOUR COLOUR'
      : manaSelection.length === 5
        ? 'FIVE COLOUR'
        : null;
    els.identityName.textContent = genericIdentity || IDENTITIES[key] || (manaSelection.length ? 'CUSTOM IDENTITY' : 'CHOOSE COLOURS');
    els.manaOrder.textContent = manaSelection.length ? manaSelection.join(' → ') : '—';
    els.clearMana.disabled = manaSelection.length === 0;
  }

  function presetColours(preset) {
    return preset.codes.map((code) => MANA[code].colour);
  }

  function applyMtgPreset(preset) {
    const sameIdentity = manaSelection.length === preset.codes.length
      && identityKey(manaSelection) === identityKey(preset.codes);
    const nextCodes = sameIdentity ? Logic.rotatePalette(manaSelection) : preset.codes.slice();
    commitMutation(() => {
      gradientStops = paletteWithLocks(makeStops(nextCodes.map((code) => MANA[code].colour)));
      manaSelection = nextCodes;
      selectedStop = 0;
    });
  }

  function renderMtgPresets() {
    const requiredCodes = Array.from(new Set(manaSelection));
    els.presetRail.replaceChildren();
    if (!requiredCodes.length) {
      els.presetContext.textContent = 'PRESETS OFFLINE';
      els.selectionSummary.textContent = 'SELECT PIPS';
      return;
    }
    if (requiredCodes.length >= 4) {
      const preset = {
        name: requiredCodes.length === 4 ? 'FOUR COLOUR' : 'FIVE COLOUR',
        codes: requiredCodes.slice()
      };
      const button = document.createElement('button');
      const name = document.createElement('strong');
      const detail = document.createElement('span');
      button.type = 'button';
      button.className = 'preset-button selected generic-identity';
      button.style.setProperty('--preset', gradientCss(makeStops(presetColours(preset))));
      button.setAttribute('aria-label', `Rotate the ${preset.name.toLowerCase()} gradient order`);
      name.textContent = preset.name;
      detail.textContent = `${requiredCodes.join(' → ')} // ROTATE`;
      button.append(name, detail);
      button.addEventListener('click', () => applyMtgPreset(preset));
      els.presetContext.textContent = `${preset.name} // ORDER CONTROL`;
      els.selectionSummary.textContent = requiredCodes.join(' + ');
      els.presetRail.appendChild(button);
      return;
    }
    const matches = Logic.matchingPresets(MTG_PRESETS, requiredCodes);
    els.presetContext.textContent = `${matches.length} MATCHING ${matches.length === 1 ? 'PRESET' : 'PRESETS'}`;
    els.selectionSummary.textContent = requiredCodes.join(' + ');
    if (!matches.length) {
      const empty = document.createElement('div');
      empty.className = 'preset-empty';
      empty.textContent = 'NO MATCHES // TRY A NAME OR CLEAR A PIP';
      els.presetRail.appendChild(empty);
      return;
    }
    matches.forEach((preset) => {
      const button = document.createElement('button');
      const name = document.createElement('strong');
      const detail = document.createElement('span');
      const colours = presetColours(preset);
      const selected = manaSelection.length === preset.codes.length
        && identityKey(manaSelection) === identityKey(preset.codes);
      button.type = 'button';
      button.className = 'preset-button';
      button.classList.toggle('selected', selected);
      button.style.setProperty('--preset', gradientCss(makeStops(colours)));
      button.setAttribute('aria-label', `Apply ${preset.name} colours${selected ? ' in the next order' : ''}`);
      name.textContent = preset.name;
      detail.textContent = selected ? `${manaSelection.join(' → ')} // ROTATE` : preset.codes.join(' / ');
      button.append(name, detail);
      button.addEventListener('click', () => applyMtgPreset(preset));
      els.presetRail.appendChild(button);
    });
  }

  function applyPalette(stops, name) {
    commitMutation(() => {
      gradientStops = paletteWithLocks(stops);
      selectedStop = 0;
      manaSelection = [];
    }, {name});
  }

  function paletteButton(entry, className = '') {
    const button = document.createElement('button');
    const title = document.createElement('strong');
    const detail = document.createElement('span');
    button.type = 'button';
    button.className = `palette-button ${className}`.trim();
    button.style.setProperty('--palette', gradientCss(entry.stops));
    title.textContent = entry.name;
    detail.textContent = `${entry.stops.length} ${entry.stops.length === 1 ? 'COLOUR' : 'COLOURS'}`;
    button.append(title, detail);
    button.addEventListener('click', () => applyPalette(entry.stops, entry.name));
    return button;
  }

  function renderBuiltIns() {
    els.builtInPalettes.replaceChildren();
    BUILT_INS.forEach((palette) => els.builtInPalettes.appendChild(paletteButton({name: palette.name, stops: makeStops(palette.colours)})));
  }

  function renderQuickPalettes() {
    els.quickPalettes.replaceChildren();
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'palette-menu-button';
    button.innerHTML = '<span class="palette-menu-icon" aria-hidden="true"><i></i><i></i><i></i><i></i></span><span>PALETTES</span>';
    button.title = paletteTrayOpen ? 'Close palette library' : 'Open palette library';
    button.setAttribute('aria-label', button.title);
    button.setAttribute('aria-expanded', String(paletteTrayOpen));
    button.addEventListener('click', () => {
      paletteTrayOpen = !paletteTrayOpen;
      renderQuickPalettes();
      renderPaletteTray();
      haptic(4);
    });
    els.quickPalettes.appendChild(button);
    els.quickPalettes.classList.toggle('tray-open', paletteTrayOpen);
  }

  function renderPaletteTray() {
    els.paletteTray.hidden = !paletteTrayOpen;
  }

  function renderSavedPalettes() {
    els.savedPalettes.replaceChildren();
    const currentSignature = stopSignature();
    const favouriteIndex = favourites.findIndex((entry) => stopSignature(entry.stops) === currentSignature);
    const paletteSlotsFull = favourites.length >= MAX_FAVOURITES && favouriteIndex < 0;
    els.favouriteCurrent.setAttribute('aria-pressed', String(favouriteIndex >= 0));
    els.favouriteCurrent.disabled = paletteSlotsFull;
    els.favouriteCurrent.innerHTML = favouriteIndex >= 0
      ? '<b aria-hidden="true">&#9733;</b> SAVED'
      : paletteSlotsFull
        ? `<b aria-hidden="true">${MAX_FAVOURITES}/${MAX_FAVOURITES}</b> SLOTS FULL`
        : '<b aria-hidden="true">&#9734;</b> SAVE CURRENT';
    els.favouriteCurrent.title = paletteSlotsFull ? 'Remove a saved palette to free a slot' : '';

    if (favourites.length) {
      const group = document.createElement('section');
      const heading = document.createElement('h3');
      const strip = document.createElement('div');
      heading.textContent = `SAVED PALETTES // ${MAX_FAVOURITES} SLOTS`;
      strip.className = 'palette-strip compact';
      favourites.forEach((entry, index) => {
        const wrap = document.createElement('div');
        const remove = document.createElement('button');
        wrap.className = 'saved-palette';
        remove.type = 'button';
        remove.className = 'remove-saved';
        remove.textContent = '×';
        remove.setAttribute('aria-label', `Remove saved palette ${entry.name}`);
        remove.addEventListener('click', () => {
          favourites.splice(index, 1);
          persist(); renderSavedPalettes(); haptic(5);
        });
        wrap.append(paletteButton(entry), remove);
        strip.appendChild(wrap);
      });
      group.append(heading, strip);
      els.savedPalettes.appendChild(group);
    }
  }

  function toggleFavourite() {
    const signature = stopSignature();
    const index = favourites.findIndex((entry) => stopSignature(entry.stops) === signature);
    if (index >= 0) favourites.splice(index, 1);
    else if (favourites.length < MAX_FAVOURITES) {
      const occupied = new Set(favourites.map((entry) => Number((entry.name.match(/SLOT\s+(\d+)/) || [])[1])));
      const slot = Array.from({length: MAX_FAVOURITES}, (_, index) => index + 1)
        .find((candidate) => !occupied.has(candidate)) || favourites.length + 1;
      favourites.push({name: `SLOT ${String(slot).padStart(2, '0')}`, stops: saveableStops()});
    }
    persist(); renderSavedPalettes(); haptic(8);
  }

  function moveStopChannel(index, direction) {
    const target = index + direction;
    if (target < 0 || target >= gradientStops.length) return;
    if (gradientStops[index].locked || gradientStops[target].locked) return;
    commitMutation(() => {
      const colour = gradientStops[index].colour;
      gradientStops[index].colour = gradientStops[target].colour;
      gradientStops[target].colour = colour;
      selectedStop = target;
      manaSelection = [];
    });
  }

  function duplicateStopChannel(index) {
    if (gradientStops.length >= MAX_STOPS) return;
    const source = gradientStops[index];
    const next = gradientStops[index + 1]?.position ?? 1;
    const previous = gradientStops[index - 1]?.position ?? 0;
    const position = index === 0 ? Math.max(.01, (source.position + next) / 2) : Math.min(.99, (source.position + (next > source.position ? next : previous)) / 2);
    commitMutation(() => {
      gradientStops.push({colour: source.colour, position, locked: false});
      gradientStops = normalisePalette(gradientStops);
      selectedStop = gradientStops.reduce((best, stop, candidate) => Math.abs(stop.position - position) < Math.abs(gradientStops[best].position - position) ? candidate : best, 0);
      manaSelection = [];
    });
  }

  function renderStopCards() {
    els.stopCards.replaceChildren();
    const active = activeStopIndices();
    gradientStops.forEach((stop, index) => {
      const card = document.createElement('article');
      const swatch = document.createElement('button');
      const main = document.createElement('div');
      const head = document.createElement('header');
      const hex = document.createElement('input');
      const position = document.createElement('input');
      const inputs = document.createElement('div');
      const actions = document.createElement('div');
      const locked = Boolean(stop.locked);
      card.className = 'stop-card';
      card.classList.toggle('selected', index === selectedStop);
      card.classList.toggle('locked', locked);
      card.classList.toggle('stage-dormant', !active.has(index));
      card.style.setProperty('--card-colour', stop.colour);
      swatch.type = 'button';
      swatch.className = 'stop-card-swatch';
      swatch.innerHTML = `<b>${String(index + 1).padStart(2, '0')}</b>`;
      swatch.setAttribute('aria-label', `Open full colour editor for channel ${index + 1}`);
      swatch.addEventListener('click', () => openStopEditor(index));
      main.className = 'stop-card-main';
      head.className = 'stop-card-head';
      head.innerHTML = `<b>CHANNEL ${String(index + 1).padStart(2, '0')}</b><small>${index === 0 ? 'FIXED ORIGIN' : `${Math.round(stop.position * 100)}%`}</small>`;
      hex.type = 'text';
      hex.value = stop.colour;
      hex.maxLength = 7;
      hex.autocomplete = 'off';
      hex.autocapitalize = 'characters';
      hex.spellcheck = false;
      hex.setAttribute('aria-label', `Hex colour for channel ${index + 1}`);
      const applyHex = () => {
        const colour = normaliseHex(hex.value);
        if (!colour) {
          hex.setAttribute('aria-invalid', 'true');
          hex.select();
          haptic(18);
          return;
        }
        hex.removeAttribute('aria-invalid');
        if (colour === stop.colour) { hex.value = colour; return; }
        commitMutation(() => { gradientStops[index].colour = colour; selectedStop = index; manaSelection = []; });
      };
      hex.addEventListener('input', () => { hex.value = hex.value.toUpperCase(); hex.removeAttribute('aria-invalid'); });
      hex.addEventListener('change', applyHex);
      hex.addEventListener('keydown', (event) => { if (event.key === 'Enter') { event.preventDefault(); applyHex(); } });
      position.type = 'range';
      position.min = '0';
      position.max = '100';
      position.step = '1';
      position.value = String(Math.round(stop.position * 100));
      position.disabled = index === 0 || locked;
      position.setAttribute('aria-label', `Position of colour channel ${index + 1}`);
      position.addEventListener('change', () => commitMutation(() => placeTubeStop(index, Number(position.value) / 100, stop.position)));
      inputs.className = 'stop-card-inputs';
      inputs.append(hex, position);
      actions.className = 'stop-card-actions';
      const controls = [
        ['LOCK', () => commitMutation(() => { gradientStops[index].locked = !locked; selectedStop = index; }), index === 0, locked],
        ['LEFT', () => moveStopChannel(index, -1), index === 0 || locked || gradientStops[index - 1]?.locked, false],
        ['RIGHT', () => moveStopChannel(index, 1), index >= gradientStops.length - 1 || locked || gradientStops[index + 1]?.locked, false],
        ['DUP', () => duplicateStopChannel(index), gradientStops.length >= MAX_STOPS, false],
        ['DELETE', () => deleteTubeStop(index), index === 0 || gradientStops.length <= 1 || locked, false]
      ];
      controls.forEach(([label, action, disabled, pressed]) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = label;
        button.disabled = Boolean(disabled);
        if (label === 'LOCK') button.setAttribute('aria-pressed', String(pressed));
        if (label === 'DELETE') button.className = 'danger';
        button.addEventListener('click', action);
        actions.appendChild(button);
      });
      main.append(head, inputs);
      card.append(swatch, main, actions);
      els.stopCards.appendChild(card);
    });
    els.addStopCard.disabled = gradientStops.length >= MAX_STOPS;
  }

  function profileState() {
    return {
      deckName: els.deckName.value,
      gradientStops: saveableStops(),
      formatting: {...formatting},
      manaSelection: manaSelection.slice(),
      secondStopMemory: {...secondStopMemory},
      viewMode
    };
  }

  function profileId() {
    try { if (crypto.randomUUID) return crypto.randomUUID(); } catch (_) {}
    return `profile-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function setProfileMessage(message, error = false) {
    els.profileMessage.textContent = message;
    els.profileMessage.classList.toggle('error', error);
    const lamp = document.createElement('i');
    lamp.className = `lamp ${error ? '' : 'amber'}`;
    els.systemStatus.replaceChildren(lamp, document.createTextNode(` ${message}`));
  }

  function saveCurrentProfile(name = els.profileName.value.trim()) {
    const clean = (name || `PROFILE ${String(profiles.length + 1).padStart(3, '0')}`).slice(0, 48).toUpperCase();
    const existing = profiles.find((profile) => profile.name.toUpperCase() === clean);
    const timestamp = new Date().toISOString();
    if (existing) {
      existing.state = profileState();
      existing.updatedAt = timestamp;
      setProfileMessage(`UPDATED // ${clean}`);
    } else {
      profiles.unshift({id: profileId(), name: clean, createdAt: timestamp, updatedAt: timestamp, state: profileState()});
      setProfileMessage(`SAVED // ${clean}`);
    }
    els.profileName.value = '';
    persist();
    renderProfiles();
    haptic([9, 12]);
  }

  function loadProfile(profile) {
    checkpoint();
    const state = profile.state;
    gradientStops = normalisePalette(state.gradientStops);
    formatting = {...formatting, ...(state.formatting || {})};
    manaSelection = Array.isArray(state.manaSelection) ? state.manaSelection.filter((code) => MANA[code]).slice(0, 5) : [];
    secondStopMemory = state.secondStopMemory || secondStopMemory;
    viewMode = state.viewMode === 'prismatic' ? 'prismatic' : 'v6';
    els.deckName.value = typeof state.deckName === 'string' ? state.deckName : DEFAULT_NAME;
    els.prismaticDeckName.value = els.deckName.value;
    defaultNameUntouched = false;
    selectedStop = 0;
    renderViewMode();
    persist();
    renderAll();
    setProfileMessage(`LOADED // ${profile.name}`);
    haptic([11, 13]);
  }

  function duplicateProfile(profile) {
    const timestamp = new Date().toISOString();
    profiles.unshift({...clone(profile), id: profileId(), name: `${profile.name} COPY`.slice(0, 48), createdAt: timestamp, updatedAt: timestamp});
    persist(); renderProfiles(); setProfileMessage(`DUPLICATED // ${profile.name}`); haptic(7);
  }

  function renderProfiles() {
    els.profileList.replaceChildren();
    if (!profiles.length) {
      const empty = document.createElement('div');
      empty.className = 'profile-empty';
      empty.textContent = 'VAULT EMPTY // SAVE THE CURRENT MACHINE TO BEGIN';
      els.profileList.appendChild(empty);
      return;
    }
    profiles.forEach((profile, index) => {
      const card = document.createElement('article');
      const load = document.createElement('button');
      const controls = document.createElement('div');
      const title = document.createElement('strong');
      const detail = document.createElement('small');
      card.className = 'profile-card';
      load.type = 'button';
      load.className = 'load-profile';
      title.textContent = profile.name;
      detail.textContent = `${profile.state.gradientStops.length} COLOURS // ${new Date(profile.updatedAt || profile.createdAt).toLocaleDateString()}`;
      load.append(title, detail);
      load.addEventListener('click', () => loadProfile(profile));
      controls.className = 'profile-card-controls';
      [['UPD', () => { profile.state = profileState(); profile.updatedAt = new Date().toISOString(); persist(); renderProfiles(); setProfileMessage(`UPDATED // ${profile.name}`); }],
        ['DUP', () => duplicateProfile(profile)],
        ['REN', () => { const renamed = window.prompt('Profile designation', profile.name); if (renamed?.trim()) { profile.name = renamed.trim().slice(0, 48).toUpperCase(); profile.updatedAt = new Date().toISOString(); persist(); renderProfiles(); } }],
        ['DEL', () => { if (window.confirm(`Delete profile ${profile.name}?`)) { profiles.splice(index, 1); persist(); renderProfiles(); setProfileMessage(`DELETED // ${profile.name}`); } }]
      ].forEach(([label, action]) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = label;
        if (label === 'DEL') button.className = 'delete-profile';
        button.addEventListener('click', action);
        controls.appendChild(button);
      });
      card.append(load, controls);
      els.profileList.appendChild(card);
    });
  }

  function downloadProfiles() {
    const payload = JSON.stringify({type: 'turdgobbler-mega-profiles', version: 1, exportedAt: new Date().toISOString(), profiles}, null, 2);
    const url = URL.createObjectURL(new Blob([payload], {type: 'application/json'}));
    const link = document.createElement('a');
    link.href = url;
    link.download = `turdgobbler-mega-profiles-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setProfileMessage(`EXPORTED // ${profiles.length} PROFILES`);
  }

  async function importProfileFile(file) {
    try {
      const data = JSON.parse(await file.text());
      const incoming = Array.isArray(data?.profiles) ? data.profiles.filter(validProfile) : [];
      if (data?.type !== 'turdgobbler-mega-profiles' || !incoming.length) throw new Error('No Mega profiles found');
      const byId = new Map(profiles.map((profile) => [profile.id, profile]));
      incoming.forEach((profile) => byId.set(profile.id || profileId(), {...profile, state: {...profile.state, gradientStops: saveableStops(profile.state.gradientStops)}}));
      profiles = Array.from(byId.values());
      persist(); renderProfiles(); setProfileMessage(`IMPORTED // ${incoming.length} PROFILES`); haptic([12, 16]);
    } catch (_) {
      setProfileMessage('IMPORT REJECTED // INVALID BACKUP', true);
      haptic(24);
    } finally {
      els.profileFile.value = '';
    }
  }

  function renderDiagnostics() {
    if (!currentBuild || !els.rawOutput) return;
    els.rawOutput.value = currentBuild.raw;
    const active = activeStopIndices().size;
    const diagnostics = [
      ['VISIBLE CHARACTERS', Array.from(els.deckName.value).length],
      ['RAW CHARACTERS', `${currentBuild.rawLength} / ${Logic.LIMIT}`],
      ['HIDDEN TAG COST', Math.max(0, currentBuild.rawLength - Array.from(els.deckName.value).length)],
      ['COLOUR CHANNELS', gradientStops.length],
      ['ACTIVE STAGES', `${active} / ${gradientStops.length}`],
      ['LOCKED CHANNELS', gradientStops.filter((stop) => stop.locked).length],
      ['FORMAT TAGS', Object.values(formatting).filter(Boolean).length],
      ['STATUS', currentBuild.unsupported.length ? 'UNSUPPORTED' : currentBuild.rawLength > Logic.LIMIT ? 'OVER LIMIT' : 'ARENA READY']
    ];
    els.diagnosticReadout.replaceChildren();
    diagnostics.forEach(([label, value]) => {
      const term = document.createElement('dt');
      const detail = document.createElement('dd');
      term.textContent = label;
      detail.textContent = String(value);
      els.diagnosticReadout.append(term, detail);
    });
  }

  function renderFormatting() {
    document.querySelectorAll('.format-pad button').forEach((button) => {
      button.setAttribute('aria-pressed', String(formatting[button.dataset.format]));
    });
  }

  function renderAll() {
    renderOutput();
    renderGradientEditor();
    renderManaComposer();
    renderMtgPresets();
    renderQuickPalettes();
    renderPaletteTray();
    renderSavedPalettes();
    renderFormatting();
    renderStopCards();
    renderProfiles();
    renderDiagnostics();
    els.undoButton.disabled = history.length === 0;
    els.redoButton.disabled = future.length === 0;
  }

  function enableGlassRefraction() {
    const surface = document.querySelector('.console');
    const finePointer = typeof window.matchMedia === 'function' && window.matchMedia('(pointer: fine)').matches;
    const reducedMotion = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!surface || !finePointer || reducedMotion) return;
    let frame = 0;
    surface.addEventListener('pointermove', (event) => {
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const bounds = surface.getBoundingClientRect();
        const x = Math.max(0, Math.min(100, (event.clientX - bounds.left) / bounds.width * 100));
        const y = Math.max(0, Math.min(100, (event.clientY - bounds.top) / bounds.height * 100));
        surface.style.setProperty('--glass-x', `${x.toFixed(1)}%`);
        surface.style.setProperty('--glass-y', `${y.toFixed(1)}%`);
      });
    }, {passive: true});
    surface.addEventListener('pointerleave', () => {
      if (frame) cancelAnimationFrame(frame);
      surface.style.setProperty('--glass-x', '50%');
      surface.style.setProperty('--glass-y', '-15%');
    }, {passive: true});
  }

  function selectDefaultName() {
    if (!defaultNameUntouched || els.deckName.value !== DEFAULT_NAME) return;
    els.deckName.select();
  }

  function normalisePastedText(event) {
    const pasted = event.clipboardData?.getData('text');
    if (typeof pasted !== 'string') return;
    event.preventDefault();
    const clean = pasted.replace(/[\r\n\t]+/g, ' ');
    const target = event.currentTarget;
    target.setRangeText(clean, target.selectionStart, target.selectionEnd, 'end');
    if (target === els.prismaticDeckName) els.deckName.value = target.value;
    else els.prismaticDeckName.value = target.value;
    defaultNameUntouched = false;
    renderOutput();
  }

  async function writeClipboard(text) {
    try {
      if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(text); return true; }
    } catch (_) {}
    try {
      const fallback = document.createElement('textarea');
      fallback.value = text;
      fallback.setAttribute('readonly', '');
      fallback.style.cssText = 'position:fixed;left:-9999px;top:0';
      document.body.appendChild(fallback);
      fallback.select();
      const copied = document.execCommand('copy');
      fallback.remove();
      return copied;
    } catch (_) { return false; }
  }

  function playFeedback(message, error = false) {
    clearTimeout(feedbackTimer);
    els.copyBurst.classList.remove('show');
    els.copyButton.classList.remove('copy-confirmed');
    els.copyButton.classList.remove('feedback-active', 'feedback-error');
    els.copyBurst.classList.toggle('error', error);
    els.copyBurst.replaceChildren();
    const colours = error ? ['#FF5264'] : currentBuild.segments.map((segment) => Logic.arenaColour(segment.colour));
    Array.from(message).forEach((character, index, letters) => {
      const span = document.createElement('span');
      const colourIndex = colours.length < 2 ? 0 : Math.round(index * (colours.length - 1) / Math.max(1, letters.length - 1));
      span.textContent = character;
      span.style.color = colours[colourIndex] || '#FFFFFF';
      els.copyBurst.appendChild(span);
    });
    void els.copyBurst.offsetWidth;
    els.copyButton.classList.add('copy-confirmed');
    els.copyButton.classList.add('feedback-active');
    els.copyButton.classList.toggle('feedback-error', error);
    els.copyHintMessage.textContent = message;
    els.copyBurst.classList.add('show');
    els.copyStatus.textContent = message;
    setTimeout(() => els.copyButton.classList.remove('copy-confirmed'), 220);
    feedbackTimer = setTimeout(() => {
      els.copyBurst.classList.remove('show');
      els.copyButton.classList.remove('feedback-active', 'feedback-error');
      els.copyHintMessage.textContent = '';
    }, 1050);
  }

  async function copyResult() {
    if (!currentBuild.raw) return;
    if (currentBuild.unsupported.length) { playFeedback('UNSUPPORTED CHARACTER', true); haptic(24); return; }
    const copied = await writeClipboard(currentBuild.raw);
    if (!copied) { playFeedback('COPY BLOCKED', true); haptic(24); }
    else if (currentBuild.rawLength > Logic.LIMIT) { playFeedback('OVER 64 - COPIED', true); haptic([15, 30, 15]); }
    else { playFeedback('COPIED!'); haptic(12); }
  }

  drawColourWheel();
  restorePreferences();
  renderViewMode();
  renderBuiltIns();
  renderAll();
  enableGlassRefraction();

  els.undoButton.addEventListener('click', undo);
  els.redoButton.addEventListener('click', redo);
  els.rotateGradient.addEventListener('click', rotateGradient);
  els.flipGradient.addEventListener('click', flipGradient);
  els.tubeAddButton.addEventListener('click', addBubbleFromButton);
  els.addStopCard.addEventListener('click', addBubbleFromButton);
  els.gradientBar.addEventListener('click', (event) => {
    if (event.target.closest('.bar-marker')) return;
    if (gradientStops.length === 1) openStopEditor(0);
  });
  els.gradientBar.addEventListener('keydown', (event) => {
    if (!['Enter', ' '].includes(event.key)) return;
    if (gradientStops.length !== 1) return;
    event.preventDefault(); openStopEditor(0);
  });
  els.clearMana.addEventListener('click', () => commitMutation(() => { manaSelection = []; }));
  els.favouriteCurrent.addEventListener('click', toggleFavourite);
  els.saveProfile.addEventListener('click', () => saveCurrentProfile());
  els.profileName.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    saveCurrentProfile();
  });
  els.exportProfiles.addEventListener('click', downloadProfiles);
  els.importProfiles.addEventListener('click', () => els.profileFile.click());
  els.profileFile.addEventListener('change', () => {
    const [file] = els.profileFile.files || [];
    if (file) importProfileFile(file);
  });
  els.copyRaw.addEventListener('click', async () => {
    const copied = await writeClipboard(currentBuild?.raw || '');
    setProfileMessage(copied ? 'RAW CODE COPIED' : 'RAW COPY BLOCKED', !copied);
    haptic(copied ? 9 : 24);
  });
  els.stopEditorClose.addEventListener('click', closeStopEditor);
  els.stopEditorBackdrop.addEventListener('pointerdown', (event) => {
    if (event.target === els.stopEditorBackdrop) closeStopEditor();
  });
  els.stopEditorWheel.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    const original = editorDraftColour || gradientStops[selectedStop].colour;
    let draft = original;
    try { els.stopEditorWheel.setPointerCapture(event.pointerId); } catch (_) {}
    const update = (pointerEvent) => {
      if (pointerEvent.pointerId !== event.pointerId) return;
      const point = wheelPoint(pointerEvent);
      draft = wheelColourAt(point.x, point.y);
      setEditorDraft(draft);
    };
    const cleanup = () => {
      els.stopEditorWheel.removeEventListener('pointermove', update);
      els.stopEditorWheel.removeEventListener('pointerup', finish);
      els.stopEditorWheel.removeEventListener('pointercancel', cancel);
      try { if (els.stopEditorWheel.hasPointerCapture(event.pointerId)) els.stopEditorWheel.releasePointerCapture(event.pointerId); } catch (_) {}
    };
    const finish = (finishEvent) => {
      if (finishEvent.pointerId !== event.pointerId) return;
      cleanup();
      if (draft !== original) haptic(7);
    };
    const cancel = (cancelEvent) => {
      if (cancelEvent.pointerId !== event.pointerId) return;
      cleanup();
      setEditorDraft(original);
    };
    update(event);
    els.stopEditorWheel.addEventListener('pointermove', update, {passive: false});
    els.stopEditorWheel.addEventListener('pointerup', finish);
    els.stopEditorWheel.addEventListener('pointercancel', cancel);
  });
  const applyEditorHexDraft = () => {
    const colour = normaliseHex(els.stopEditorHex.value);
    if (!colour) {
      els.stopEditorHex.classList.add('error');
      els.stopEditorHex.setAttribute('aria-invalid', 'true');
      els.stopEditorHex.select();
      haptic(18);
      return false;
    }
    els.stopEditorHex.classList.remove('error');
    els.stopEditorHex.removeAttribute('aria-invalid');
    setEditorDraft(colour);
    return true;
  };
  const confirmEditorColour = () => {
    if (!applyEditorHexDraft()) return;
    const colour = editorDraftColour;
    const index = selectedStop;
    editorDraftColour = null;
    commitMutation(() => {
      gradientStops[index].colour = colour;
      selectedStop = index;
      manaSelection = [];
    }, {haptic: [9, 12]});
    closeStopEditor();
  };
  els.stopEditorHex.addEventListener('input', () => {
    els.stopEditorHex.value = els.stopEditorHex.value.toUpperCase();
    els.stopEditorHex.classList.remove('error');
    els.stopEditorHex.removeAttribute('aria-invalid');
    const colour = normaliseHex(els.stopEditorHex.value);
    if (colour) setEditorDraft(colour, false);
  });
  els.stopEditorHex.addEventListener('change', applyEditorHexDraft);
  els.stopEditorHex.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    confirmEditorColour();
  });
  els.stopEditorConfirm.addEventListener('click', confirmEditorColour);
  document.querySelectorAll('.format-pad button').forEach((button) => button.addEventListener('click', () => {
    commitMutation(() => { formatting[button.dataset.format] = !formatting[button.dataset.format]; });
  }));
  els.deckName.addEventListener('focus', () => requestAnimationFrame(selectDefaultName));
  els.deckName.addEventListener('pointerup', (event) => {
    if (!defaultNameUntouched || els.deckName.value !== DEFAULT_NAME) return;
    event.preventDefault(); selectDefaultName();
  });
  els.deckName.addEventListener('input', () => {
    defaultNameUntouched = false;
    els.prismaticDeckName.value = els.deckName.value;
    renderOutput();
  });
  els.deckName.addEventListener('paste', normalisePastedText);
  els.prismaticDeckName.addEventListener('input', () => {
    defaultNameUntouched = false;
    els.deckName.value = els.prismaticDeckName.value;
    renderOutput();
  });
  els.prismaticDeckName.addEventListener('paste', normalisePastedText);
  els.prismaticDeckName.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    closePrismaticNameEditor();
  });
  els.viewModeToggle.addEventListener('click', () => {
    viewMode = viewMode === 'v6' ? 'prismatic' : 'v6';
    renderViewMode();
    persist();
    haptic([7, 9]);
  });
  els.prismaticEdit.addEventListener('click', openPrismaticNameEditor);
  els.prismaticNameClose.addEventListener('click', closePrismaticNameEditor);
  els.prismaticNameDone.addEventListener('click', closePrismaticNameEditor);
  els.prismaticNameBackdrop.addEventListener('pointerdown', (event) => {
    if (event.target === els.prismaticNameBackdrop) closePrismaticNameEditor();
  });
  els.copyButton.addEventListener('click', copyResult);
  document.querySelector('.gradient-module').addEventListener('toggle', (event) => {
    if (event.currentTarget.open) requestAnimationFrame(renderGradientEditor);
  });
  window.addEventListener('resize', () => requestAnimationFrame(renderGradientBar), {passive: true});
  document.addEventListener('keydown', (event) => {
    const isTextField = event.target instanceof HTMLInputElement && ['text', 'search'].includes(event.target.type);
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') { event.preventDefault(); copyResult(); return; }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z' && !isTextField) { event.preventDefault(); event.shiftKey ? redo() : undo(); }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'y' && !isTextField) { event.preventDefault(); redo(); }
    if (event.key === 'Escape' && !els.prismaticNameBackdrop.hidden) { closePrismaticNameEditor(); return; }
    if (event.key === 'Escape' && stopEditorOpen) { closeStopEditor(); return; }
  });
})();
