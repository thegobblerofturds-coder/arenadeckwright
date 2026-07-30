(() => {
  'use strict';

  const Logic = window.DeckwrightV7Logic;
  const DEFAULT_NAME = 'Your Deck Name';
  const STORAGE_KEY = 'turdgobbler-deckwright-v7';
  const LEGACY_STORAGE_KEY = 'turdgobbler-deckwright-v6';
  const MAX_STOPS = 7;
  const MAX_FAVOURITES = 10;
  // Arena currently ignores <b>. Change only this flag to true if support returns.
  const ARENA_BOLD_SUPPORTED = false;
  const DEFAULT_VIEW_MODE = 'v7';
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
    .filter(([codes]) => codes.length === 2 || codes.length === 3)
    .map(([codes, name]) => ({name, codes: Array.from(codes)}));
  const BUILT_INS = [
    {name: 'RAINBOW', colours: ['#F03444', '#FF8A24', '#FFE14A', '#43C96B', '#25BDE5', '#4669E8', '#A447D1']},
    {name: 'SUNSET', colours: ['#45256F', '#A52E72', '#E24B4B', '#F1872B', '#FFD56A']},
    {name: 'SUNRISE', colours: ['#253365', '#7757A5', '#E77D91', '#FFB45D', '#FFF0B0']},
    {name: 'SILVER', colours: ['#41464B', '#9DA4AA', '#F2F3F3', '#7B8288', '#202326']},
    {name: 'MIDNIGHT', colours: ['#080B18', '#14275E', '#315CB5', '#7A67C7']},
    {name: 'TOXIC', colours: ['#10190D', '#267026', '#63D42F', '#D7FF45']}
  ];
  const VERIFIED_PROBES = [
    {name: 'SIZE', code: '<size=10>'},
    {name: 'CSPACE', code: '<cspace=5>'},
    {name: 'ROTATE', code: '<rotate=15>'},
    {name: 'VOFFSET', code: '<voffset=5>'},
    {name: 'SUP', code: '<sup>'},
    {name: 'SUB', code: '<sub>'},
    {name: 'POS', code: '<pos=40>'},
    {name: 'BREAK', code: '<br>'},
    {name: 'SPRITE', code: '<sprite=15>'},
    {name: 'MSPACE', code: '<mspace=1em>'},
    {name: 'SPACE', code: '<space=1em>'},
    {name: 'HIGHLIGHT / MARK', code: '<mark=#FFFF0080>'},
    {name: 'ALPHA', code: '<alpha=#80>'},
    {name: 'ALIGN // LAB ONLY', code: '<align=center>'}
  ];
  const CANDIDATE_PROBES = [
    {name: 'SMALL CAPS', code: '<smallcaps>'},
    {name: 'ALLCAPS TAG', code: '<allcaps>'},
    {name: 'LOWERCASE', code: '<lowercase>'},
    {name: 'INDENT', code: '<indent=10%>'},
    {name: 'LINE INDENT', code: '<line-indent=10%>'},
    {name: 'LINE HEIGHT', code: '<line-height=120%>'},
    {name: 'MARGIN', code: '<margin=5>'},
    {name: 'WIDTH', code: '<width=80%>'},
    {name: 'NOBR', code: '<nobr>'},
    {name: 'CLOSING / RESET', code: '<size=10>A</size><color=#FFF>B</color>', complete: true}
  ];
  const $ = (id) => document.getElementById(id);
  const els = {
    consoleSurface: $('consoleSurface'), viewModeToggle: $('viewModeToggle'),
    deckName: $('deckName'), startOver: $('startOver'), inputState: $('inputState'), outputPreview: $('outputPreview'),
    copyButton: $('copyButton'), copyBurst: $('copyBurst'), copyStatus: $('copyStatus'),
    copyHintMessage: $('copyHintMessage'),
    prismaticEdit: $('prismaticEdit'),
    prismaticNameBackdrop: $('prismaticNameBackdrop'), prismaticDeckName: $('prismaticDeckName'),
    prismaticNameClose: $('prismaticNameClose'), prismaticNameDone: $('prismaticNameDone'),
    rawCount: $('rawCount'), gradientPips: $('gradientPips'), undoButton: $('undoButton'),
    budgetText: $('budgetText'), budgetFx: $('budgetFx'), budgetColour: $('budgetColour'),
    budgetTotal: $('budgetTotal'), budgetStages: $('budgetStages'), inlineEvents: $('inlineEvents'),
    rotateGradient: $('rotateGradient'), flipGradient: $('flipGradient'), gradientBar: $('gradientBar'),
    tubeAddButton: $('tubeAddButton'), tubeHint: $('tubeHint'), stageWarning: $('stageWarning'),
    visualWarning: $('visualWarning'),
    barStopMarkers: $('barStopMarkers'), megaFxLayer: $('megaFxLayer'), quickPalettes: $('quickPalettes'),
    paletteTray: $('paletteTray'),
    manaComposer: $('manaComposer'), identityName: $('identityName'), manaOrder: $('manaOrder'),
    clearMana: $('clearMana'), builtInPalettes: $('builtInPalettes'), savedPalettes: $('savedPalettes'),
    favouriteCurrent: $('favouriteCurrent'),
    presetContext: $('presetContext'), selectionSummary: $('selectionSummary'), presetRail: $('presetRail'),
    deleteZone: $('deleteZone'), stopEditorBackdrop: $('stopEditorBackdrop'), stopEditor: $('stopEditor'),
    stopEditorTitle: $('stopEditorTitle'), stopEditorClose: $('stopEditorClose'),
    stopEditorWheel: $('stopEditorWheel'), stopEditorWheelCursor: $('stopEditorWheelCursor'),
    stopEditorPreview: $('stopEditorPreview'),
    stopEditorHex: $('stopEditorHex'), stopEditorConfirm: $('stopEditorConfirm'),
    fxDrawer: $('fxDrawer'), insertBreak: $('insertBreak'), spriteTray: $('spriteTray'),
    fxBubbleEditor: $('fxBubbleEditor'), fxBubbleEditorTitle: $('fxBubbleEditorTitle'),
    fxBubbleEditorMeta: $('fxBubbleEditorMeta'), fxBubbleChoices: $('fxBubbleChoices'),
    fxBubbleDelete: $('fxBubbleDelete'), fxBubbleEditorDone: $('fxBubbleEditorDone'),
    fxPickerBackdrop: $('fxPickerBackdrop'), fxPicker: $('fxPicker'), fxPickerKicker: $('fxPickerKicker'),
    fxPickerTitle: $('fxPickerTitle'), fxPickerBack: $('fxPickerBack'), fxPickerClose: $('fxPickerClose'),
    fxPickerChoices: $('fxPickerChoices'), fxPickerGrid: $('fxPickerGrid'), fxPickerAdjust: $('fxPickerAdjust'),
    fxPickerSelected: $('fxPickerSelected'), fxPickerAdjustment: $('fxPickerAdjustment'),
    fxPickerDrawer: $('fxPickerDrawer'), fxPickerApply: $('fxPickerApply'),
    arenaLab: $('arenaLab'), rawCode: $('rawCode'), copyRawCode: $('copyRawCode'),
    verifiedProbeList: $('verifiedProbeList'), candidateProbeList: $('candidateProbeList'),
    probeOutput: $('probeOutput'), copyProbe: $('copyProbe')
  };

  let gradientStops = makeStops([MANA.U.colour, MANA.R.colour, MANA.G.colour]);
  let formatting = {bold: false, italic: false, underline: false, strike: false};
  let effects = Logic.normaliseEffects({});
  let inlineEvents = [];
  let selectedStop = 0;
  let manaSelection = [];
  let paletteTrayOpen = false;
  let favourites = [];
  let savedPaletteScrollLeft = 0;
  let history = [];
  let currentBuild = null;
  let feedbackTimer = null;
  let defaultNameUntouched = true;
  let secondStopMemory = {colour: MANA.R.colour, position: 1};
  let stopEditorOpen = false;
  let editorDraftColour = null;
  let viewMode = DEFAULT_VIEW_MODE;
  let previousName = DEFAULT_NAME;
  let activeTextInput = null;
  let composerSelection = {start: DEFAULT_NAME.length, end: DEFAULT_NAME.length};
  let nextInlineEventId = 1;
  let selectedMegaEventId = null;
  let selectedMegaGlobalKey = null;
  let fxPickerOpen = false;
  let fxPickerMode = 'edit';
  let fxPickerSelectedKey = '';
  let fxPickerDraftValue = '';
  let pendingFxBubble = null;
  let nextPendingFxId = 1;

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
    return Logic.normaliseGradientStops(stops).map((stop) => ({
      colour: stop.colour,
      position: stop.position
    }));
  }

  function tubeCollisionGap(count = gradientStops.length) {
    if (count < 2) return 0;
    const bounds = els.gradientBar.getBoundingClientRect();
    const trackWidth = Math.max(1, bounds.width - TUBE_INSET * 2);
    return Math.min(MIN_BUBBLE_GAP_PX / trackWidth, 1 / (count - 1));
  }

  function tubeAnchorCollisionGap(count = gradientStops.length) {
    if (count < 2) return 0;
    const bounds = els.gradientBar.getBoundingClientRect();
    const trackWidth = Math.max(1, bounds.width - TUBE_INSET * 2);
    return Math.min(ANCHOR_BUBBLE_GAP_PX / trackWidth, 1);
  }

  function normalisePalette(stops) {
    const source = Logic.normaliseGradientStops(stops).slice(0, MAX_STOPS);
    return Logic.separateGradientStops(
      source,
      tubeCollisionGap(source.length),
      tubeAnchorCollisionGap(source.length)
    );
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
      ? 'Switch to the Version 7 name and copy controls'
      : 'Switch to the alternate name and copy controls');
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
    positionWheelCursor(colour);
    if (document.activeElement !== els.stopEditorHex) els.stopEditorHex.value = colour;
    els.stopEditorHex.classList.remove('error');
    els.stopEditorHex.removeAttribute('aria-invalid');
  }

  function setEditorDraft(colour, syncHex = true) {
    editorDraftColour = colour;
    els.stopEditor.style.setProperty('--editor-colour', colour);
    els.stopEditorPreview.style.setProperty('--preview-colour', colour);
    positionWheelCursor(colour);
    if (syncHex) els.stopEditorHex.value = colour;
  }

  function openStopEditor(index) {
    closeFxPicker();
    closeMegaBubbleEditor();
    selectedStop = Math.max(0, Math.min(index, gradientStops.length - 1));
    stopEditorOpen = true;
    editorDraftColour = gradientStops[selectedStop].colour;
    els.stopEditorHex.blur();
    els.stopEditorBackdrop.classList.remove('hex-entry-active');
    document.body.classList.add('stop-editor-open');
    renderGradientBar();
    renderStopEditor();
    els.stopEditorBackdrop.hidden = false;
    focusColourBubble(selectedStop);
    requestAnimationFrame(() => els.stopEditor.focus({preventScroll: true}));
    pulseSelectedMarker(selectedStop);
    haptic(4);
  }

  function closeStopEditor() {
    stopEditorOpen = false;
    editorDraftColour = null;
    els.stopEditorHex.blur();
    els.stopEditorBackdrop.classList.remove('hex-entry-active');
    document.body.classList.remove('stop-editor-open');
    els.stopEditorBackdrop.hidden = true;
    els.stopEditorHex.classList.remove('error');
    els.stopEditorHex.removeAttribute('aria-invalid');
    clearBubbleFocus();
  }

  function snapshot() {
    return clone({
      gradientStops, formatting, effects, inlineEvents, selectedStop, manaSelection, secondStopMemory,
      deckName: els.deckName.value, defaultNameUntouched, previousName
    });
  }

  function checkpoint() {
    history.push(snapshot());
    if (history.length > 30) history.shift();
  }

  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        gradientStops, formatting, effects, manaSelection, favourites, secondStopMemory
      }));
    } catch (_) {}
  }

  function validSavedPalette(entry) {
    return entry && typeof entry.name === 'string' && Array.isArray(entry.stops) && entry.stops.length >= 1;
  }

  function restorePreferences() {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY) || '{}');
      if (Array.isArray(stored.gradientStops)) gradientStops = normalisePalette(stored.gradientStops);
      viewMode = DEFAULT_VIEW_MODE;
      if (stored.formatting && typeof stored.formatting === 'object') {
        Object.keys(formatting).forEach((key) => { formatting[key] = Boolean(stored.formatting[key]); });
      }
      if (stored.effects && typeof stored.effects === 'object') effects = Logic.normaliseEffects(stored.effects);
      if (Array.isArray(stored.manaSelection)) manaSelection = Array.from(new Set(stored.manaSelection.filter((code) => MANA[code]))).slice(0, 5);
      if (stored.secondStopMemory && /^#[0-9a-f]{6}$/i.test(stored.secondStopMemory.colour)) {
        secondStopMemory = {colour: stored.secondStopMemory.colour.toUpperCase(), position: 1};
      }
      if (Array.isArray(stored.favourites)) {
        favourites = stored.favourites.filter(validSavedPalette).slice(0, MAX_FAVOURITES).map((entry, index) => {
          const slot = savedSlotNumber(entry, index);
          return {
            slot,
            name: entry.name.trim().slice(0, 28) || `SLOT ${String(slot).padStart(2, '0')}`,
            stops: saveableStops(entry.stops)
          };
        });
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
    gradientStops = normalisePalette(previous.gradientStops);
    formatting = {...formatting, ...previous.formatting};
    effects = Logic.normaliseEffects(previous.effects || effects);
    inlineEvents = Array.isArray(previous.inlineEvents) ? previous.inlineEvents : inlineEvents;
    selectedStop = Math.min(previous.selectedStop, gradientStops.length - 1);
    manaSelection = previous.manaSelection || [];
    secondStopMemory = previous.secondStopMemory || secondStopMemory;
    if (typeof previous.deckName === 'string') {
      els.deckName.value = previous.deckName;
      els.prismaticDeckName.value = previous.deckName;
      previousName = typeof previous.previousName === 'string' ? previous.previousName : previous.deckName;
      defaultNameUntouched = Boolean(previous.defaultNameUntouched);
      composerSelection = {start: previous.deckName.length, end: previous.deckName.length};
    }
    persist();
    renderAll();
    haptic(8);
  }

  function startOver() {
    checkpoint();
    closeStopEditor();
    closeFxPicker();
    closeMegaBubbleEditor();
    gradientStops = makeStops([MANA.U.colour, MANA.R.colour, MANA.G.colour]);
    formatting = {bold: false, italic: false, underline: false, strike: false};
    effects = Logic.normaliseEffects({});
    inlineEvents = [];
    selectedStop = 0;
    manaSelection = [];
    paletteTrayOpen = false;
    els.fxDrawer.open = false;
    els.arenaLab.open = false;
    secondStopMemory = {colour: MANA.R.colour, position: 1};
    els.deckName.value = DEFAULT_NAME;
    els.prismaticDeckName.value = DEFAULT_NAME;
    previousName = DEFAULT_NAME;
    defaultNameUntouched = true;
    activeTextInput = els.deckName;
    composerSelection = {start: DEFAULT_NAME.length, end: DEFAULT_NAME.length};
    viewMode = DEFAULT_VIEW_MODE;
    renderViewMode();
    persist();
    renderAll();
    playFeedback('STARTED OVER');
    haptic([9, 14, 9]);
  }

  function previewColourAt(build, offset) {
    const active = build.segments.reduce((match, segment) => segment.start <= offset ? segment : match, build.segments[0]);
    return Logic.arenaColour(active?.colour || '#FFFFFF');
  }

  function previewNumber(value, fallback = 0) {
    const parsed = Number.parseFloat(String(value ?? '').replace(/(?:px|em|%)$/i, ''));
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function previewLength(value, options = {}) {
    const match = String(value ?? '').trim().match(/^(-?\d+(?:\.\d+)?)(px|em|%)?$/i);
    if (!match) return null;
    const amount = Math.max(options.minimum ?? -80, Math.min(options.maximum ?? 180, Number(match[1])));
    return `${Logic.shortestNumber(amount, 0)}${(match[2] || options.defaultUnit || 'px').toLowerCase()}`;
  }

  function previewHexColour(value) {
    const clean = String(value || '').trim().replace(/^#/, '');
    if (!/^[0-9a-f]{6}(?:[0-9a-f]{2})?$/i.test(clean)) return null;
    const red = Number.parseInt(clean.slice(0, 2), 16);
    const green = Number.parseInt(clean.slice(2, 4), 16);
    const blue = Number.parseInt(clean.slice(4, 6), 16);
    const alpha = clean.length === 8 ? Number.parseInt(clean.slice(6), 16) / 255 : 1;
    return `rgba(${red},${green},${blue},${alpha.toFixed(3)})`;
  }

  function initialPreviewFxState() {
    return {
      size: effects.size.enabled ? previewNumber(effects.size.value, 10) : null,
      cspace: effects.cspace.enabled ? previewNumber(effects.cspace.value) : null,
      rotate: effects.rotate.enabled ? previewNumber(effects.rotate.value) : null,
      voffset: effects.voffset.enabled ? previewNumber(effects.voffset.value) : null,
      sup: Boolean(effects.sup), sub: Boolean(effects.sub), mspace: null, mark: null, alpha: 1,
      pendingPos: effects.pos.enabled ? previewNumber(effects.pos.value) : null
    };
  }

  function applyInlinePreviewTag(state, code) {
    const match = String(code || '').match(/^<([a-z-]+)(?:=([^>]+))?>$/i);
    if (!match) return null;
    const name = match[1].toLowerCase();
    const value = String(match[2] || '').replace(/^['"]|['"]$/g, '');
    if (['size', 'cspace', 'rotate', 'voffset'].includes(name)) state[name] = previewNumber(value);
    else if (name === 'pos') state.pendingPos = previewNumber(value);
    else if (name === 'sup') { state.sup = true; state.sub = false; }
    else if (name === 'sub') { state.sub = true; state.sup = false; }
    else if (name === 'mspace') state.mspace = previewLength(value, {minimum: 0, maximum: 12, defaultUnit: 'em'});
    else if (name === 'mark') state.mark = previewHexColour(value);
    else if (name === 'alpha' && /^#[0-9a-f]{2}$/i.test(value)) state.alpha = Number.parseInt(value.slice(1), 16) / 255;
    else if (name === 'space') return previewLength(value, {minimum: -20, maximum: 180, defaultUnit: 'px'});
    return null;
  }

  function stylePreviewGlyph(element, state) {
    if (state.size !== null) element.style.fontSize = `${Math.max(5, Math.min(29, state.size))}px`;
    if (state.cspace !== null) element.style.marginRight = `${Math.max(-20, Math.min(50, state.cspace))}px`;
    if (state.mspace) { element.style.width = state.mspace; element.style.textAlign = 'center'; }
    if (state.mark) { element.style.backgroundColor = state.mark; element.style.boxDecorationBreak = 'clone'; }
    element.style.opacity = String(Math.max(0, Math.min(1, state.alpha)));
    if (state.pendingPos !== null) {
      element.style.marginLeft = `${Math.max(0, Math.min(500, state.pendingPos))}px`;
      state.pendingPos = null;
    }
    const transforms = [];
    if (state.voffset !== null) transforms.push(`translateY(${-Math.max(-50, Math.min(50, state.voffset))}px)`);
    if (state.sup) transforms.push('translateY(-.42em)', 'scale(.72)');
    if (state.sub) transforms.push('translateY(.28em)', 'scale(.72)');
    if (state.rotate !== null) transforms.push(`rotate(${Math.max(-180, Math.min(180, state.rotate))}deg)`);
    element.style.transform = transforms.join(' ') || 'none';
  }

  function renderPreview(build) {
    els.outputPreview.replaceChildren();
    const wrapper = document.createElement('span');
    wrapper.className = 'fx-preview-content';
    wrapper.style.fontVariant = effects.smallCaps ? 'small-caps' : 'normal';
    wrapper.style.fontWeight = formatting.bold ? '800' : '400';
    wrapper.style.fontStyle = formatting.italic ? 'italic' : 'normal';
    wrapper.style.textDecoration = [
      formatting.underline && 'underline', formatting.strike && 'line-through'
    ].filter(Boolean).join(' ') || 'none';
    const activeFx = initialPreviewFxState();
    const eventMap = new Map();
    build.inlineEvents.forEach((event) => {
      if (!eventMap.has(event.offset)) eventMap.set(event.offset, []);
      eventMap.get(event.offset).push(event);
    });
    for (let offset = 0; offset <= build.text.length; offset += 1) {
      (eventMap.get(offset) || []).forEach((event) => {
        if (event.type === 'br') {
          const lineBreak = document.createElement('span');
          lineBreak.className = 'preview-line-break';
          lineBreak.setAttribute('aria-hidden', 'true');
          wrapper.appendChild(lineBreak);
          return;
        }
        if (event.type === 'sprite') {
          const sprite = document.createElement('span');
          sprite.className = 'sprite-placeholder preview-sprite';
          sprite.dataset.spriteId = String(event.value);
          sprite.dataset.textOffset = String(offset);
          sprite.style.color = previewColourAt(build, offset);
          sprite.setAttribute('aria-label', `Arena sprite ${event.value}`);
          const hook = document.createElement('i');
          sprite.appendChild(hook);
          stylePreviewGlyph(sprite, activeFx);
          wrapper.appendChild(sprite);
          return;
        }
        if (event.type === 'tag') {
          const spacing = applyInlinePreviewTag(activeFx, event.code);
          if (spacing) {
            const spacer = document.createElement('span');
            spacer.className = 'preview-space';
            if (spacing.startsWith('-')) {
              spacer.style.width = '0';
              spacer.style.marginRight = spacing;
            } else spacer.style.width = spacing;
            spacer.setAttribute('aria-hidden', 'true');
            wrapper.appendChild(spacer);
          }
        }
      });
      if (offset < build.text.length) {
        const character = document.createElement('span');
        character.className = 'preview-glyph';
        character.dataset.textOffset = String(offset);
        character.textContent = build.text[offset];
        character.style.color = previewColourAt(build, offset);
        stylePreviewGlyph(character, activeFx);
        wrapper.appendChild(character);
      }
    }
    if (!wrapper.childNodes.length) {
      const span = document.createElement('span');
      span.textContent = 'EMPTY';
      wrapper.appendChild(span);
    }
    els.outputPreview.appendChild(wrapper);
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

  function updateVisualWidthRisk(build) {
    const wrapper = els.outputPreview.querySelector('.fx-preview-content');
    if (!wrapper || !build?.text) {
      els.visualWarning.textContent = '';
      els.visualWarning.className = 'visual-warning';
      return;
    }
    const available = Math.max(1, els.outputPreview.getBoundingClientRect().width);
    let currentLine = 0;
    let widestLine = 0;
    [...wrapper.children].forEach((node) => {
      if (node.classList.contains('preview-line-break')) {
        widestLine = Math.max(widestLine, currentLine);
        currentLine = 0;
        return;
      }
      const bounds = node.getBoundingClientRect();
      const style = getComputedStyle(node);
      currentLine += bounds.width
        + (Number.parseFloat(style.marginLeft) || 0)
        + (Number.parseFloat(style.marginRight) || 0);
    });
    widestLine = Math.max(widestLine, currentLine);
    const ratio = widestLine / available;
    const glyphs = build.text.length + build.inlineEvents.filter((event) => event.type === 'sprite').length;
    const risk = ratio >= 1;
    const watch = !risk && ratio >= .82;
    els.visualWarning.textContent = risk
      ? `VISUAL WIDTH RISK · ${Math.round(ratio * 100)}% OF MIRROR · APPROX`
      : watch
        ? `VISUAL WIDTH WATCH · ${Math.round(ratio * 100)}% OF MIRROR · APPROX`
        : '';
    els.visualWarning.className = `visual-warning${risk ? ' visible risk' : watch ? ' visible watch' : ''}`;
    els.visualWarning.title = `${glyphs} visible glyphs. Browser geometry only; Arena's tested display maximum is still being measured. This does not change the exact 64-character code budget.`;
  }

  function renderOutput() {
    const sampled = Logic.sampleGradientStops(gradientStops, 7);
    currentBuild = Logic.compileArena({
      text: els.deckName.value,
      palette: sampled,
      positionedColours: gradientStops,
      formatting,
      effects,
      inlineEvents,
      limit: Logic.LIMIT
    });
    renderPreview(currentBuild);
    renderPips(currentBuild.segments);
    const overBy = Math.max(0, currentBuild.rawLength - Logic.LIMIT);
    els.rawCount.textContent = overBy ? `${currentBuild.rawLength} / ${Logic.LIMIT} · +${overBy}` : `${currentBuild.rawLength} / ${Logic.LIMIT}`;
    els.rawCount.classList.toggle('over-limit', overBy > 0);
    els.budgetText.textContent = String(currentBuild.breakdown.text);
    els.budgetFx.textContent = String(currentBuild.breakdown.fx);
    els.budgetColour.textContent = String(currentBuild.breakdown.colour);
    els.budgetTotal.textContent = `${currentBuild.breakdown.total}/${Logic.LIMIT}`;
    els.budgetStages.textContent = `${currentBuild.colourStages}/${currentBuild.requestedColourStages} COLOUR ${currentBuild.requestedColourStages === 1 ? 'STAGE' : 'STAGES'} FIT`;
    els.budgetTotal.closest('.budget-total').classList.toggle('over-limit', overBy > 0);
    els.rawCode.value = currentBuild.raw;
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
    requestAnimationFrame(() => {
      updateVisualWidthRisk(currentBuild);
      layoutMegaTubeTokens(els.deckName.value.length);
    });
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
    if (!moving) return;
    if (index > 0 && requested <= ANCHOR_SWAP_ZONE) {
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
    const swapReady = index > 0 && requested <= ANCHOR_SWAP_ZONE;
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
    const tubeIsColourOneButton = false;
    els.gradientBar.classList.toggle('single-colour-button', tubeIsColourOneButton);
    els.gradientBar.classList.toggle('multi-colour-track', !tubeIsColourOneButton);
    els.gradientBar.setAttribute('role', tubeIsColourOneButton ? 'button' : 'group');
    els.gradientBar.tabIndex = tubeIsColourOneButton ? 0 : -1;
    els.gradientBar.setAttribute('aria-label', tubeIsColourOneButton
      ? 'Colour 1. Touch anywhere on the tube to edit.'
      : 'Gradient track. Use the numbered cap or colour bubbles to edit colours.');
    els.tubeHint.textContent = 'SOLID BUBBLES COMPILE · GHOST COLOURS DO NOT FIT · DRAG FX OR COLOUR SOURCES INTO THE TUBE';
    gradientStops.forEach((stop, index) => {
      const movable = true;
      const marker = document.createElement('button');
      marker.type = 'button';
      marker.className = 'bar-marker mega-colour-token';
      marker.dataset.stopIndex = String(index);
      marker.dataset.rawOffset = String(currentBuild?.text.length > 1 ? Math.round(stop.position * (currentBuild.text.length - 1)) : 0);
      marker.dataset.rawOrder = '0';
      marker.classList.remove('first-bubble', 'anchor');
      marker.classList.toggle('selected', index === selectedStop);
      const rawOffset = currentBuild?.text.length > 1 ? Math.round(stop.position * (currentBuild.text.length - 1)) : 0;
      marker.style.left = `${currentBuild?.text.length ? rawOffset / currentBuild.text.length * 100 : 0}%`;
      marker.style.setProperty('--stop-colour', stop.colour);
      const markerLabel = document.createElement('span');
      markerLabel.className = 'tube-sequence';
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
      marker.setAttribute('aria-label', `Gradient colour ${index + 1}. Drag to position or reorder. Colours keep a visible gap.`);
      marker.dataset.baseLabel = marker.getAttribute('aria-label');
      marker.setAttribute('aria-valuemin', '0');
      marker.setAttribute('aria-valuemax', '100');
      marker.setAttribute('aria-valuenow', String(Math.round(stop.position * 100)));
      marker.setAttribute('aria-readonly', 'false');
      marker.title = 'Drag to position or reorder this colour';
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
            marker.style.setProperty('--serial-shift', '0px');
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
        if (event.key === 'ArrowRight' && index === 0 && gradientStops.length > 1) {
          const targetIndex = Math.min(gradientStops.length - 1, event.shiftKey ? 5 : 1);
          position = gradientStops[targetIndex].position + tubeAnchorCollisionGap();
        } else if (event.key === 'ArrowRight') {
          position += step;
        }
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
      const entries = Logic.rotatePalette(gradientStops.map((stop) => stop.colour));
      gradientStops = gradientStops.map((stop, index) => ({...stop, colour: entries[index]}));
      selectedStop = selectedStop === 0 ? gradientStops.length - 1 : selectedStop - 1;
      if (manaSelection.length > 1) manaSelection = Logic.rotatePalette(manaSelection);
    });
  }

  function flipGradient() {
    commitMutation(() => {
      const entries = Logic.flipPalette(gradientStops.map((stop) => stop.colour));
      gradientStops = gradientStops.map((stop, index) => ({...stop, colour: entries[index]}));
      selectedStop = gradientStops.length - 1 - selectedStop;
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
            gradientStops = normalisePalette(makeStops(colours));
            selectedStop = 0;
          }
        }, {name: 'MTG'});
      });
      enableColourDragSource(button, MANA[code].colour);
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
      gradientStops = normalisePalette(makeStops(nextCodes.map((code) => MANA[code].colour)));
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
      gradientStops = normalisePalette(stops);
      selectedStop = 0;
      manaSelection = [];
    }, {name});
    animatePaletteBubbles();
  }

  function animatePaletteBubbles() {
    const markers = Array.from(els.barStopMarkers.querySelectorAll('.bar-marker'));
    markers.forEach((marker, index) => {
      marker.style.setProperty('--palette-delay', `${index * 55}ms`);
      marker.style.setProperty('--launch-x', `${52 + index * 5}px`);
      marker.classList.add('palette-arrival');
    });
    setTimeout(() => markers.forEach((marker) => {
      marker.classList.remove('palette-arrival');
      marker.style.removeProperty('--palette-delay');
      marker.style.removeProperty('--launch-x');
    }), 1250);
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

  function savedSlotNumber(entry, index) {
    const storedSlot = Number(entry && entry.slot);
    if (Number.isInteger(storedSlot) && storedSlot >= 1 && storedSlot <= MAX_FAVOURITES) return storedSlot;
    const legacySlot = Number(((entry && entry.name || '').match(/SLOT\s+(\d+)/i) || [])[1]);
    return Number.isInteger(legacySlot) && legacySlot >= 1 && legacySlot <= MAX_FAVOURITES ? legacySlot : index + 1;
  }

  function pulseSavedSlot(slot) {
    requestAnimationFrame(() => {
      const wrap = els.savedPalettes.querySelector(`[data-saved-slot="${slot}"]`);
      if (!wrap) return;
      wrap.classList.add('slot-spark');
      setTimeout(() => wrap.classList.remove('slot-spark'), 720);
    });
  }

  function renameFavourite(index, wrap, rename) {
    const entry = favourites[index];
    if (!entry) return;
    const slot = savedSlotNumber(entry, index);
    const existing = wrap.querySelector('.rename-saved-input');
    if (existing) {
      entry.slot = slot;
      entry.name = existing.value.trim().replace(/\s+/g, ' ').slice(0, 28)
        || `SLOT ${String(slot).padStart(2, '0')}`;
      persist();
      renderSavedPalettes();
      pulseSavedSlot(slot);
      haptic([8, 6, 10]);
      return;
    }

    const input = document.createElement('input');
    input.className = 'rename-saved-input';
    input.type = 'text';
    input.value = entry.name;
    input.maxLength = 28;
    input.autocomplete = 'off';
    input.spellcheck = false;
    input.setAttribute('aria-label', `Name saved palette slot ${slot}`);
    wrap.classList.add('renaming');
    rename.classList.add('confirming');
    rename.textContent = '✓';
    rename.setAttribute('aria-label', `Confirm name for saved palette slot ${slot}`);
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        rename.click();
      } else if (event.key === 'Escape') {
        event.preventDefault();
        renderSavedPalettes();
        haptic(3);
      }
    });
    wrap.appendChild(input);
    requestAnimationFrame(() => {
      input.focus({preventScroll: true});
      input.select();
    });
    haptic(5);
  }

  function renderSavedPalettes() {
    const previousStrip = els.savedPalettes.querySelector('.palette-strip.compact');
    const previousScrollLeft = previousStrip ? previousStrip.scrollLeft : savedPaletteScrollLeft;
    savedPaletteScrollLeft = previousScrollLeft;
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
        const rename = document.createElement('button');
        const remove = document.createElement('button');
        const slot = savedSlotNumber(entry, index);
        wrap.className = 'saved-palette';
        wrap.dataset.savedSlot = String(slot);
        rename.type = 'button';
        rename.className = 'rename-saved';
        rename.textContent = '✎';
        rename.setAttribute('aria-label', `Rename saved palette ${entry.name}, slot ${slot}`);
        rename.addEventListener('click', () => renameFavourite(index, wrap, rename));
        remove.type = 'button';
        remove.className = 'remove-saved';
        remove.textContent = '\u00D7';
        remove.setAttribute('aria-label', `Remove saved palette ${entry.name}`);
        remove.addEventListener('click', () => {
          favourites.splice(index, 1);
          persist(); renderSavedPalettes(); haptic(5);
        });
        wrap.append(paletteButton(entry), rename, remove);
        strip.appendChild(wrap);
      });
      group.append(heading, strip);
      els.savedPalettes.appendChild(group);
      const restoreScrollPosition = () => {
        if (!strip.isConnected) return;
        const maximumScroll = Math.max(0, strip.scrollWidth - strip.clientWidth);
        strip.scrollLeft = Math.min(savedPaletteScrollLeft, maximumScroll);
      };
      strip.addEventListener('scroll', () => {
        savedPaletteScrollLeft = strip.scrollLeft;
      }, {passive: true});
      restoreScrollPosition();
      requestAnimationFrame(restoreScrollPosition);
    } else {
      savedPaletteScrollLeft = 0;
    }
  }

  function toggleFavourite() {
    const signature = stopSignature();
    const index = favourites.findIndex((entry) => stopSignature(entry.stops) === signature);
    let addedSlot = null;
    if (index >= 0) favourites.splice(index, 1);
    else if (favourites.length < MAX_FAVOURITES) {
      const occupied = new Set(favourites.map((entry, entryIndex) => savedSlotNumber(entry, entryIndex)));
      const slot = Array.from({length: MAX_FAVOURITES}, (_, index) => index + 1)
        .find((candidate) => !occupied.has(candidate)) || favourites.length + 1;
      favourites.push({slot, name: `SLOT ${String(slot).padStart(2, '0')}`, stops: saveableStops()});
      addedSlot = slot;
    }
    persist(); renderSavedPalettes();
    if (addedSlot) pulseSavedSlot(addedSlot);
    haptic(8);
  }

  function renderFormatting() {
    if (!ARENA_BOLD_SUPPORTED) formatting.bold = false;
    document.querySelectorAll('.format-pad button[data-format]').forEach((button) => {
      button.setAttribute('aria-pressed', String(formatting[button.dataset.format]));
    });
    document.querySelectorAll('.format-pad button[data-effect]').forEach((button) => {
      button.setAttribute('aria-pressed', String(Boolean(effects[button.dataset.effect])));
    });
  }

  function normaliseFxControlValue(name, value) {
    const slider = document.querySelector(`[data-fx-slider="${name}"]`);
    const parsed = Number(value);
    const fallback = Logic.NUMERIC_EFFECT_DEFAULTS[name];
    if (!slider || !Number.isFinite(parsed)) return Logic.shortestNumber(fallback, fallback);
    const minimum = Number(slider.min);
    const maximum = Number(slider.max);
    const step = Number(slider.step) || 1;
    const clamped = Math.max(minimum, Math.min(maximum, parsed));
    const snapped = minimum + Math.round((clamped - minimum) / step) * step;
    return Logic.shortestNumber(snapped, fallback);
  }

  function syncFxValueControls(name, value) {
    const safe = normaliseFxControlValue(name, value);
    const numberInput = document.querySelector(`[data-fx-value="${name}"]`);
    const slider = document.querySelector(`[data-fx-slider="${name}"]`);
    if (numberInput) numberInput.value = safe;
    if (slider) {
      slider.value = safe;
      const minimum = Number(slider.min);
      const maximum = Number(slider.max);
      const progress = maximum === minimum ? 0 : (Number(safe) - minimum) / (maximum - minimum) * 100;
      slider.style.setProperty('--fx-progress', `${Math.max(0, Math.min(100, progress)).toFixed(2)}%`);
    }
    const caretButton = document.querySelector(`[data-caret-current="${name}"]`);
    if (caretButton) caretButton.textContent = `${name.toUpperCase()} ${safe}`;
    const timelineButton = document.querySelector(`[data-timeline-current="${name}"]`);
    if (timelineButton) timelineButton.textContent = `${name.toUpperCase()} ${safe}`;
    return safe;
  }

  function renderFxControls() {
    document.querySelectorAll('[data-fx-toggle]').forEach((button) => {
      button.setAttribute('aria-pressed', String(Boolean(effects[button.dataset.fxToggle])));
    });
    document.querySelectorAll('[data-fx-enabled]').forEach((checkbox) => {
      const name = checkbox.dataset.fxEnabled;
      checkbox.checked = Boolean(effects[name]?.enabled);
      syncFxValueControls(name, effects[name]?.value ?? Logic.NUMERIC_EFFECT_DEFAULTS[name]);
      checkbox.closest('.fx-number-card')?.classList.toggle('enabled', checkbox.checked);
    });
  }

  function retiredTimelineRenderer() {
    els.inlineEvents.replaceChildren();
    els.inlineEvents.hidden = false;
    const nameLength = els.deckName.value.length;
    const events = Logic.normaliseInlineEvents(inlineEvents, nameLength);
    const header = document.createElement('header');
    const title = document.createElement('span');
    const eyebrow = document.createElement('small');
    eyebrow.textContent = `TEXT POSITION // 0 TO ${nameLength}`;
    const heading = document.createElement('b');
    heading.textContent = 'INLINE FX TIMELINE';
    title.append(eyebrow, heading);
    const instruction = document.createElement('small');
    instruction.textContent = 'DRAG MARKERS · ARROWS NUDGE · DELETE REMOVES';
    header.append(title, instruction);

    const track = document.createElement('div');
    track.className = 'inline-timeline-track';
    track.setAttribute('role', 'group');
    track.setAttribute('aria-label', `Inline effect positions from 0 to ${nameLength}`);
    const rail = document.createElement('i');
    rail.className = 'inline-timeline-rail';
    rail.setAttribute('aria-hidden', 'true');
    track.appendChild(rail);

    const positionCounts = new Map();
    let maximumLane = 0;
    events.forEach((inlineEvent) => {
      const lane = positionCounts.get(inlineEvent.offset) || 0;
      positionCounts.set(inlineEvent.offset, lane + 1);
      maximumLane = Math.max(maximumLane, lane);
      const node = document.createElement('span');
      node.className = 'inline-event-node';
      node.dataset.eventId = inlineEvent.id || '';
      node.style.left = `${nameLength ? inlineEvent.offset / nameLength * 100 : 0}%`;
      node.style.top = `${10 + lane * 38}px`;
      node.style.setProperty('--event-lane', String(lane));

      const marker = document.createElement('button');
      marker.type = 'button';
      marker.className = `inline-event-marker event-${inlineEvent.type}`;
      marker.dataset.eventId = inlineEvent.id || '';
      marker.dataset.eventOffset = String(inlineEvent.offset);
      const label = inlineEvent.type === 'sprite'
        ? `SPRITE ${inlineEvent.value}`
        : inlineEvent.type === 'br'
          ? 'BR'
          : String(inlineEvent.code || '').replace(/^</, '').replace(/>$/, '').toUpperCase();
      if (inlineEvent.type === 'sprite') {
        const hook = document.createElement('i');
        hook.style.backgroundImage = `var(--arena-sprite-${inlineEvent.value},none)`;
        marker.appendChild(hook);
      } else marker.textContent = label;
      marker.setAttribute('aria-label', `${label} at text position ${inlineEvent.offset}. Drag or use arrow keys to move.`);
      marker.title = `${label} @ ${inlineEvent.offset}`;

      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'inline-event-remove';
      remove.textContent = '\u00D7';
      remove.setAttribute('aria-label', `Remove ${label} at text position ${inlineEvent.offset}`);
      remove.addEventListener('click', () => commitMutation(() => {
        inlineEvents = inlineEvents.filter((candidate) => candidate.id !== inlineEvent.id);
      }));

      const moveTo = (offset) => {
        const target = Math.max(0, Math.min(nameLength, offset));
        if (target === inlineEvent.offset) return;
        commitMutation(() => {
          inlineEvents = inlineEvents.map((candidate) => candidate.id === inlineEvent.id ? {...candidate, offset: target} : candidate);
        }, {haptic: 7});
      };
      marker.addEventListener('keydown', (keyEvent) => {
        let target = inlineEvent.offset;
        if (keyEvent.key === 'ArrowLeft') target -= keyEvent.shiftKey ? 5 : 1;
        else if (keyEvent.key === 'ArrowRight') target += keyEvent.shiftKey ? 5 : 1;
        else if (keyEvent.key === 'Home') target = 0;
        else if (keyEvent.key === 'End') target = nameLength;
        else if (keyEvent.key === 'Delete' || keyEvent.key === 'Backspace') {
          keyEvent.preventDefault();
          remove.click();
          return;
        } else return;
        keyEvent.preventDefault();
        moveTo(target);
      });
      marker.addEventListener('pointerdown', (pointerEvent) => {
        if (pointerEvent.button !== 0) return;
        pointerEvent.preventDefault();
        const originalOffset = inlineEvent.offset;
        let draftOffset = originalOffset;
        let moved = false;
        try { marker.setPointerCapture(pointerEvent.pointerId); } catch (_) {}
        const offsetFromPointer = (clientX) => {
          const bounds = track.getBoundingClientRect();
          if (!bounds.width) return originalOffset;
          return Math.max(0, Math.min(nameLength, Math.round((clientX - bounds.left) / bounds.width * nameLength)));
        };
        const update = (moveEvent) => {
          if (moveEvent.pointerId !== pointerEvent.pointerId) return;
          draftOffset = offsetFromPointer(moveEvent.clientX);
          moved = moved || draftOffset !== originalOffset;
          if (moved) node.style.setProperty('--serial-shift', '0px');
          node.style.left = `${nameLength ? draftOffset / nameLength * 100 : 0}%`;
          marker.dataset.eventOffset = String(draftOffset);
          marker.title = `${label} @ ${draftOffset}`;
          marker.setAttribute('aria-label', `${label} at text position ${draftOffset}. Release to place.`);
          marker.classList.toggle('dragging', moved);
        };
        const cleanup = () => {
          marker.removeEventListener('pointermove', update);
          marker.removeEventListener('pointerup', finish);
          marker.removeEventListener('pointercancel', cancel);
          try { if (marker.hasPointerCapture(pointerEvent.pointerId)) marker.releasePointerCapture(pointerEvent.pointerId); } catch (_) {}
        };
        const finish = (finishEvent) => {
          if (finishEvent.pointerId !== pointerEvent.pointerId) return;
          cleanup();
          if (moved) moveTo(draftOffset);
          else marker.classList.remove('dragging');
        };
        const cancel = (cancelEvent) => {
          if (cancelEvent.pointerId !== pointerEvent.pointerId) return;
          cleanup();
          node.style.left = `${nameLength ? originalOffset / nameLength * 100 : 0}%`;
          marker.classList.remove('dragging');
        };
        marker.addEventListener('pointermove', update);
        marker.addEventListener('pointerup', finish);
        marker.addEventListener('pointercancel', cancel);
      });
      node.append(marker, remove);
      track.appendChild(node);
    });
    track.style.setProperty('--timeline-lanes', String(maximumLane + 1));
    track.style.minHeight = `${54 + maximumLane * 38}px`;
    if (!events.length) {
      const empty = document.createElement('span');
      empty.className = 'inline-timeline-empty';
      empty.textContent = 'DROP FX HERE — OR CLICK / TAP AN FX TO INSERT AT THE CARET';
      track.appendChild(empty);
    }
    const scale = document.createElement('div');
    scale.className = 'inline-timeline-scale';
    const start = document.createElement('span');
    start.textContent = '0 // START';
    const end = document.createElement('span');
    end.textContent = `${nameLength} // END`;
    scale.append(start, end);
    const sourceStrip = document.createElement('div');
    sourceStrip.className = 'inline-timeline-sources';
    sourceStrip.setAttribute('role', 'group');
    sourceStrip.setAttribute('aria-label', 'Inline effects to insert at the caret or drag onto the timeline');
    const sourceLabel = document.createElement('b');
    sourceLabel.textContent = 'DRAG IN';
    sourceStrip.appendChild(sourceLabel);
    const sourceDefinitions = [
      ...['size', 'cspace', 'rotate', 'voffset', 'pos'].map((name) => ({
        label: `${name.toUpperCase()} ${Logic.shortestNumber(effects[name]?.value, Logic.NUMERIC_EFFECT_DEFAULTS[name])}`,
        current: name,
        payload: () => ({type: 'tag', code: `<${name}=${Logic.shortestNumber(effects[name]?.value, Logic.NUMERIC_EFFECT_DEFAULTS[name])}>`})
      })),
      {label: 'SUP', payload: {type: 'tag', code: '<sup>'}},
      {label: 'SUB', payload: {type: 'tag', code: '<sub>'}},
      {label: 'BR', payload: {type: 'br'}},
      ...['mspace', 'space', 'mark', 'alpha'].map((name) => ({
        label: name.toUpperCase(),
        payload: () => {
          const input = document.querySelector(`[data-caret-value="${name}"]`);
          const code = verifiedCaretTag(name, input?.value);
          return code ? {type: 'tag', code} : null;
        }
      }))
    ];
    sourceDefinitions.forEach((definition) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = definition.label;
      button.dataset.timelineSource = '';
      if (definition.current) button.dataset.timelineCurrent = definition.current;
      button.title = `${definition.label}: click to insert at the active caret, or drag onto the timeline`;
      const payload = () => typeof definition.payload === 'function' ? definition.payload() : definition.payload;
      button.addEventListener('click', () => {
        const event = payload();
        if (event) insertComposerEvent(event);
        else playFeedback('INVALID FX VALUE', true);
      });
      enableFxDragSource(button, payload);
      sourceStrip.appendChild(button);
    });
    track.addEventListener('dragover', (dragEvent) => {
      if (!Array.from(dragEvent.dataTransfer?.types || []).includes('application/x-arena-fx')) return;
      dragEvent.preventDefault();
      track.classList.add('drop-target');
    });
    track.addEventListener('dragleave', () => track.classList.remove('drop-target'));
    track.addEventListener('drop', (dropEvent) => {
      track.classList.remove('drop-target');
      const encoded = dropEvent.dataTransfer?.getData('application/x-arena-fx');
      if (!encoded) return;
      dropEvent.preventDefault();
      try {
        const payload = JSON.parse(encoded);
        const bounds = track.getBoundingClientRect();
        const offset = bounds.width ? Math.max(0, Math.min(nameLength, Math.round((dropEvent.clientX - bounds.left) / bounds.width * nameLength))) : 0;
        insertComposerEventAt(payload, offset, null);
      } catch (_) {}
    });
    els.inlineEvents.append(header, track, scale, sourceStrip);
  }

  function clearMirrorGuide() {
    els.outputPreview.querySelectorAll('.mega-guide-target').forEach((glyph) => glyph.classList.remove('mega-guide-target'));
  }

  function showMirrorGuide(offset) {
    clearMirrorGuide();
    const length = els.deckName.value.length;
    if (!length) return;
    const target = Math.max(0, Math.min(length - 1, Number(offset) || 0));
    els.outputPreview.querySelector(`[data-text-offset="${target}"]`)?.classList.add('mega-guide-target');
  }

  function megaEventLabel(event) {
    if (event.type === 'sprite') return `SPRITE ${event.value}`;
    if (event.type === 'br') return 'BR';
    return String(event.code || '').replace(/^</, '').replace(/>$/, '').toUpperCase();
  }

  function megaEventKey(event) {
    if (!event) return '';
    if (event.type === 'sprite' || event.type === 'br') return event.type;
    return String(event.code || '').match(/^<([a-z-]+)/i)?.[1]?.toLowerCase() || '';
  }

  function clearBubbleFocus() {
    els.gradientBar.classList.remove('bubble-focus-mode', 'fx-focus-mode', 'colour-focus-mode');
    els.outputPreview.classList.remove('bubble-focus-mode');
    els.outputPreview.querySelectorAll('.bubble-focus-affected').forEach((node) => node.classList.remove('bubble-focus-affected'));
  }

  function focusMirrorRange(start, end) {
    const length = els.deckName.value.length;
    const from = Math.max(0, Math.min(length, Number(start) || 0));
    const to = Math.max(from + 1, Math.min(length + 1, Number(end) || length));
    els.outputPreview.classList.add('bubble-focus-mode');
    els.outputPreview.querySelectorAll('[data-text-offset]').forEach((node) => {
      const offset = Number(node.dataset.textOffset);
      node.classList.toggle('bubble-focus-affected', offset >= from && offset < to);
    });
  }

  function focusInlineBubble(eventId) {
    clearBubbleFocus();
    const events = Logic.normaliseInlineEvents(inlineEvents, els.deckName.value.length);
    const selected = events.find((event) => event.id === eventId);
    if (!selected) return;
    const key = megaEventKey(selected);
    const next = events.find((event) => event.offset > selected.offset && megaEventKey(event) === key);
    const end = key === 'sprite' || key === 'br'
      ? selected.offset + 1
      : next?.offset ?? els.deckName.value.length;
    els.gradientBar.classList.add('bubble-focus-mode', 'fx-focus-mode');
    focusMirrorRange(selected.offset, end);
  }

  function focusFxPickerTarget(key = '') {
    clearBubbleFocus();
    const selected = selectedMegaEventId
      ? Logic.normaliseInlineEvents(inlineEvents, els.deckName.value.length).find((event) => event.id === selectedMegaEventId)
      : null;
    const offset = selected?.offset ?? pendingFxBubble?.offset;
    if (!Number.isFinite(Number(offset))) return;
    const events = Logic.normaliseInlineEvents(inlineEvents, els.deckName.value.length);
    const next = key
      ? events.find((event) => event.id !== selectedMegaEventId && event.offset > offset && megaEventKey(event) === key)
      : null;
    const end = !key || key === 'sprite' || key === 'br'
      ? Number(offset) + 1
      : next?.offset ?? els.deckName.value.length;
    els.gradientBar.classList.add('bubble-focus-mode', 'fx-focus-mode');
    focusMirrorRange(Number(offset), end);
  }

  function focusColourBubble(index) {
    clearBubbleFocus();
    const stop = gradientStops[index];
    if (!stop) return;
    const length = els.deckName.value.length;
    const active = [...activeStopIndices()].sort((left, right) => left - right);
    const start = length > 1 ? Math.round(stop.position * (length - 1)) : 0;
    const activePosition = active.indexOf(index);
    const nextIndex = activePosition >= 0 ? active[activePosition + 1] : null;
    const end = nextIndex === null || nextIndex === undefined
      ? (activePosition >= 0 ? length : start + 1)
      : Math.round(gradientStops[nextIndex].position * (length - 1));
    els.gradientBar.classList.add('bubble-focus-mode', 'colour-focus-mode');
    focusMirrorRange(start, Math.max(start + 1, end));
  }

  function fxChoiceDefinitions() {
    const currentTag = (name) => ({
      type: 'tag',
      code: `<${name}=${Logic.shortestNumber(effects[name]?.value, Logic.NUMERIC_EFFECT_DEFAULTS[name])}>`
    });
    const valueTag = (name) => {
      const input = document.querySelector(`[data-caret-value="${name}"]`);
      const code = verifiedCaretTag(name, input?.value);
      return code ? {type: 'tag', code} : null;
    };
    return [
      ...['size', 'cspace', 'rotate', 'voffset', 'pos'].map((name) => ({
        key: name,
        label: `${name.toUpperCase()} ${Logic.shortestNumber(effects[name]?.value, Logic.NUMERIC_EFFECT_DEFAULTS[name])}`,
        payload: () => currentTag(name)
      })),
      {key: 'sup', label: 'SUP', payload: () => ({type: 'tag', code: '<sup>'})},
      {key: 'sub', label: 'SUB', payload: () => ({type: 'tag', code: '<sub>'})},
      {key: 'br', label: 'BR', payload: () => ({type: 'br'})},
      ...['mspace', 'space', 'mark', 'alpha'].map((name) => ({
        key: name,
        label: name.toUpperCase(),
        payload: () => valueTag(name)
      })),
      {key: 'sprite', label: 'SPRITE FACE', spritePicker: true}
    ];
  }

  const FX_PICKER_META = {
    size: {label: 'SIZE', hint: 'GLYPH SCALE', code: '<size=n>', min: 5, max: 29, step: 1},
    cspace: {label: 'CHAR SPACE', hint: 'SPACE BETWEEN LETTERS', code: '<cspace=n>', min: -20, max: 50, step: .5},
    rotate: {label: 'ROTATE', hint: 'PER-LETTER ROTATION', code: '<rotate=n>', min: -180, max: 180, step: 1},
    voffset: {label: 'VERT OFFSET', hint: 'MOVE LETTERS UP / DOWN', code: '<voffset=n>', min: -50, max: 50, step: .5},
    pos: {label: 'POSITION', hint: 'HORIZONTAL START', code: '<pos=n>', min: 0, max: 500, step: 1},
    sup: {label: 'SUPERSCRIPT', hint: 'RAISE + SHRINK', code: '<sup>'},
    sub: {label: 'SUBSCRIPT', hint: 'LOWER + SHRINK', code: '<sub>'},
    br: {label: 'LINE BREAK', hint: 'BREAK AT THIS CARET', code: '<br>'},
    mspace: {label: 'MONO SPACE', hint: 'FIXED CHARACTER WIDTH', code: '<mspace=v>', input: '1em'},
    space: {label: 'SPACE', hint: 'INSERT SPACING', code: '<space=v>', input: '1em'},
    mark: {label: 'HIGHLIGHT', hint: 'MARK COLOUR', code: '<mark=#RRGGBBAA>', input: '#FFFF0080'},
    alpha: {label: 'ALPHA', hint: 'TEXT OPACITY', code: '<alpha=#AA>', input: '#80'},
    sprite: {label: 'SPRITE', hint: 'ARENA FACE 0–15', code: '<sprite=n>', input: 0}
  };

  function fxPickerCurrentEvent() {
    return inlineEvents.find((event) => event.id === selectedMegaEventId) || null;
  }

  function fxPickerValueFor(key) {
    const current = fxPickerCurrentEvent();
    if (current && megaEventKey(current) === key) {
      if (key === 'sprite') return Number(current.value) || 0;
      const match = String(current.code || '').match(/^<[a-z-]+=([^>]+)>$/i);
      if (match) return match[1];
    }
    if (Object.prototype.hasOwnProperty.call(Logic.NUMERIC_EFFECT_DEFAULTS, key)) {
      return effects[key]?.value ?? Logic.NUMERIC_EFFECT_DEFAULTS[key];
    }
    const drawerInput = document.querySelector(`[data-caret-value="${key}"]`);
    return drawerInput?.value || FX_PICKER_META[key]?.input || '';
  }

  function renderFxPickerPreview(container, key, value) {
    const preview = document.createElement('div');
    preview.className = 'fx-adjust-preview';
    if (key === 'sprite') {
      const face = document.createElement('i');
      face.style.backgroundImage = `var(--arena-sprite-${Number(value) || 0},none)`;
      preview.appendChild(face);
    } else {
      const sample = document.createElement('span');
      sample.textContent = key === 'br' ? 'A ↵ B' : 'Arena';
      const number = Number.parseFloat(value) || 0;
      if (key === 'size') sample.style.fontSize = `${12 + Math.max(0, Math.min(24, number - 5)) * 1.5}px`;
      if (key === 'cspace') sample.style.letterSpacing = `${Math.max(-4, Math.min(14, number * .28))}px`;
      if (key === 'rotate') sample.style.transform = `rotate(${Math.max(-180, Math.min(180, number))}deg)`;
      if (key === 'voffset') sample.style.transform = `translateY(${-Math.max(-20, Math.min(20, number * .45))}px)`;
      if (key === 'pos') sample.style.transform = `translateX(${Math.max(0, Math.min(60, number * .12))}px)`;
      if (key === 'sup') sample.style.transform = 'translateY(-9px) scale(.72)';
      if (key === 'sub') sample.style.transform = 'translateY(8px) scale(.72)';
      if (key === 'mark') sample.style.background = previewHexColour(value) || '#FFFF0080';
      if (key === 'alpha' && /^#[0-9a-f]{2}$/i.test(String(value))) sample.style.opacity = String(Number.parseInt(String(value).slice(1), 16) / 255);
      preview.appendChild(sample);
    }
    container.appendChild(preview);
    return preview;
  }

  function renderFxPickerCardExample(container, key) {
    const example = document.createElement('span');
    example.className = `fx-picker-card-example example-${key}`;
    example.setAttribute('aria-hidden', 'true');
    const letter = (character, className = '') => {
      const span = document.createElement('span');
      span.className = className;
      span.textContent = character;
      return span;
    };
    if (key === 'size') example.append(letter('A', 'small'), letter('A', 'large'));
    else if (key === 'cspace') {
      const sample = letter('AAA');
      sample.style.letterSpacing = '5px';
      example.appendChild(sample);
    } else if (key === 'rotate') example.append(letter('A', 'tilt-left'), letter('A', 'tilt-right'));
    else if (key === 'voffset') example.append(letter('A', 'low'), letter('A', 'high'));
    else if (key === 'pos') example.append(letter('A', 'positioned'));
    else if (key === 'sup') example.append(letter('A'), letter('A', 'sup'));
    else if (key === 'sub') example.append(letter('A'), letter('A', 'sub'));
    else if (key === 'br') example.append(letter('A'), letter('B'));
    else if (key === 'mspace') example.append(letter('A', 'cell'), letter('A', 'cell'), letter('A', 'cell'));
    else if (key === 'space') example.append(letter('A'), letter('A', 'spaced'));
    else if (key === 'mark') example.append(letter('Aa', 'marked'));
    else if (key === 'alpha') example.append(letter('Aa', 'faded'));
    else if (key === 'sprite') {
      const sprite = document.createElement('i');
      sprite.style.backgroundImage = 'var(--arena-sprite-15,none)';
      example.appendChild(sprite);
    }
    container.appendChild(example);
  }

  function renderFxPickerChoices() {
    fxPickerSelectedKey = '';
    els.fxPickerBack.hidden = true;
    els.fxPickerTitle.textContent = 'CHOOSE FX';
    els.fxPickerChoices.hidden = false;
    els.fxPickerAdjust.hidden = true;
    els.fxPickerGrid.replaceChildren();
    Object.entries(FX_PICKER_META).forEach(([key, meta]) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.fxPickerChoice = key;
      const label = document.createElement('b');
      label.textContent = meta.label;
      const hint = document.createElement('small');
      hint.textContent = meta.hint;
      const code = document.createElement('code');
      code.textContent = meta.code;
      renderFxPickerCardExample(button, key);
      button.append(label, hint, code);
      button.addEventListener('click', () => selectFxPickerEffect(key));
      els.fxPickerGrid.appendChild(button);
    });
  }

  function selectFxPickerEffect(key) {
    const meta = FX_PICKER_META[key];
    if (!meta) return;
    fxPickerSelectedKey = key;
    fxPickerDraftValue = fxPickerValueFor(key);
    els.fxPickerBack.hidden = false;
    els.fxPickerDrawer.hidden = fxPickerMode !== 'edit';
    els.fxPickerTitle.textContent = meta.label;
    els.fxPickerChoices.hidden = true;
    els.fxPickerAdjust.hidden = false;
    els.fxPickerSelected.replaceChildren();
    const label = document.createElement('b');
    label.textContent = meta.label;
    const code = document.createElement('code');
    code.textContent = meta.code;
    els.fxPickerSelected.append(label, code);
    els.fxPickerAdjustment.replaceChildren();
    focusFxPickerTarget(key);
    let preview = renderFxPickerPreview(els.fxPickerAdjustment, key, fxPickerDraftValue);
    if (Number.isFinite(meta.min)) {
      const controls = document.createElement('div');
      controls.className = 'fx-adjust-controls';
      const range = document.createElement('input');
      range.type = 'range'; range.min = String(meta.min); range.max = String(meta.max); range.step = String(meta.step); range.value = String(fxPickerDraftValue);
      range.setAttribute('aria-label', `${meta.label} adjustment`);
      const exact = document.createElement('input');
      exact.type = 'number'; exact.min = String(meta.min); exact.max = String(meta.max); exact.step = String(meta.step); exact.value = String(fxPickerDraftValue);
      exact.setAttribute('aria-label', `${meta.label} exact value`);
      const endpoints = document.createElement('div');
      endpoints.className = 'fx-adjust-endpoints';
      endpoints.innerHTML = `<span>${meta.min}</span><small>ARENA VALUE</small><span>${meta.max}</span>`;
      const sync = (source, target) => {
        fxPickerDraftValue = source.value;
        target.value = source.value;
        preview.remove();
        preview = renderFxPickerPreview(els.fxPickerAdjustment, key, fxPickerDraftValue);
      };
      range.addEventListener('input', () => sync(range, exact));
      exact.addEventListener('input', () => sync(exact, range));
      controls.append(range, exact, endpoints);
      els.fxPickerAdjustment.appendChild(controls);
    } else if (key === 'sprite') {
      const sprites = document.createElement('div');
      sprites.className = 'fx-picker-sprites';
      Array.from({length: 16}, (_, sprite) => sprite).forEach((sprite) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'sprite-placeholder';
        button.dataset.spriteId = String(sprite);
        button.setAttribute('aria-label', `Choose Arena sprite ${sprite}`);
        button.setAttribute('aria-pressed', String(Number(fxPickerDraftValue) === sprite));
        const face = document.createElement('i');
        button.appendChild(face);
        button.addEventListener('click', () => {
          fxPickerDraftValue = sprite;
          sprites.querySelectorAll('button').forEach((candidate) => candidate.setAttribute('aria-pressed', String(candidate === button)));
          preview.style.setProperty('--picker-sprite', `var(--arena-sprite-${sprite},none)`);
          preview.querySelector('i').style.backgroundImage = `var(--arena-sprite-${sprite},none)`;
        });
        sprites.appendChild(button);
      });
      els.fxPickerAdjustment.appendChild(sprites);
    } else if (['mspace', 'space', 'mark', 'alpha'].includes(key)) {
      const field = document.createElement('label');
      field.className = 'fx-adjust-value';
      const caption = document.createElement('span');
      caption.textContent = meta.hint;
      const input = document.createElement('input');
      input.type = 'text'; input.value = String(fxPickerDraftValue); input.autocomplete = 'off'; input.spellcheck = false;
      input.setAttribute('aria-label', `${meta.label} value`);
      input.addEventListener('input', () => {
        fxPickerDraftValue = input.value;
        if (key === 'mark' || key === 'alpha') {
          preview.remove();
          preview = renderFxPickerPreview(els.fxPickerAdjustment, key, fxPickerDraftValue);
        }
      });
      field.append(caption, input);
      els.fxPickerAdjustment.appendChild(field);
    } else {
      const ready = document.createElement('p');
      ready.className = 'fx-adjust-ready';
      ready.textContent = `${meta.code} needs no numeric adjustment. Apply it at this bubble's caret position.`;
      els.fxPickerAdjustment.appendChild(ready);
    }
    requestAnimationFrame(() => els.fxPickerAdjust.querySelector('input,button')?.focus({preventScroll: true}));
  }

  function fxPickerPayload() {
    const key = fxPickerSelectedKey;
    const meta = FX_PICKER_META[key];
    if (!meta) return null;
    if (Number.isFinite(meta.min)) {
      const rawValue = String(fxPickerDraftValue).trim();
      const parsed = Number(rawValue);
      if (!rawValue || !Number.isFinite(parsed)) return null;
      const value = Math.max(meta.min, Math.min(meta.max, parsed));
      return {type: 'tag', code: `<${key}=${Logic.shortestNumber(value, Logic.NUMERIC_EFFECT_DEFAULTS[key])}>`};
    }
    if (key === 'sprite') return {type: 'sprite', value: Math.max(0, Math.min(15, Math.round(Number(fxPickerDraftValue) || 0)))};
    if (key === 'br') return {type: 'br'};
    if (key === 'sup' || key === 'sub') return {type: 'tag', code: `<${key}>`};
    const code = verifiedCaretTag(key, fxPickerDraftValue);
    return code ? {type: 'tag', code} : null;
  }

  function openFxPicker(eventId = null, requestedOffset = null) {
    closeStopEditor();
    selectedMegaEventId = eventId && inlineEvents.some((event) => event.id === eventId) ? eventId : null;
    selectedMegaGlobalKey = null;
    fxPickerMode = selectedMegaEventId ? 'edit' : 'insert';
    pendingFxBubble = selectedMegaEventId ? null : {
      id: `pending-fx-${nextPendingFxId++}`,
      offset: Math.max(0, Math.min(
        els.deckName.value.length,
        Math.round(
          requestedOffset !== null && requestedOffset !== undefined && Number.isFinite(Number(requestedOffset))
            ? Number(requestedOffset)
            : composerSelection.start
        )
      ))
    };
    fxPickerOpen = true;
    fxPickerSelectedKey = '';
    document.body.classList.add('fx-picker-open');
    els.fxPickerKicker.textContent = fxPickerMode === 'edit'
      ? 'EDIT FX BUBBLE'
      : `CHOOSE FX @ CARET ${pendingFxBubble.offset}`;
    renderFxPickerChoices();
    els.fxPickerBackdrop.hidden = false;
    renderInlineEvents();
    if (selectedMegaEventId) focusInlineBubble(selectedMegaEventId);
    else focusFxPickerTarget();
    requestAnimationFrame(() => els.fxPicker.focus({preventScroll: true}));
    haptic(4);
  }

  function closeFxPicker(options = {}) {
    const hadPendingBubble = Boolean(pendingFxBubble);
    fxPickerOpen = false;
    fxPickerSelectedKey = '';
    fxPickerDraftValue = '';
    pendingFxBubble = null;
    document.body.classList.remove('fx-picker-open');
    els.fxPickerBackdrop.hidden = true;
    clearMirrorGuide();
    clearBubbleFocus();
    if (selectedMegaEventId && !options.keepSelection) closeMegaBubbleEditor();
    if (hadPendingBubble && !options.skipRender) renderInlineEvents();
  }

  function openFxDrawerFromPicker() {
    if (!selectedMegaEventId) return;
    closeFxPicker({keepSelection: true});
    els.fxDrawer.open = true;
    renderInlineEvents();
    focusInlineBubble(selectedMegaEventId);
    requestAnimationFrame(() => {
      els.fxBubbleEditor.scrollIntoView({block: 'nearest'});
      els.fxBubbleEditor.focus({preventScroll: true});
    });
  }

  function applyFxPicker() {
    const payload = fxPickerPayload();
    if (!payload) {
      els.fxPickerAdjustment.classList.add('error');
      playFeedback('INVALID FX VALUE', true);
      haptic(24);
      return;
    }
    els.fxPickerAdjustment.classList.remove('error');
    if (fxPickerMode === 'edit') replaceSelectedMegaEvent(payload);
    else {
      const offset = pendingFxBubble?.offset ?? composerSelection.start;
      pendingFxBubble = null;
      insertComposerEventAt(payload, offset, null);
    }
    closeFxPicker({skipRender: true});
  }

  function replaceSelectedMegaEvent(payload) {
    const selected = inlineEvents.find((event) => event.id === selectedMegaEventId);
    if (!selected || !payload) return false;
    commitMutation(() => {
      inlineEvents = inlineEvents.map((event) => event.id === selected.id
        ? {id: selected.id, offset: selected.offset, sequence: selected.sequence, ...payload}
        : event);
    }, {haptic: 8});
    return true;
  }

  function closeMegaBubbleEditor() {
    selectedMegaEventId = null;
    selectedMegaGlobalKey = null;
    els.fxBubbleEditor.hidden = true;
    els.fxBubbleChoices.replaceChildren();
    els.megaFxLayer.querySelectorAll('.is-selected').forEach((token) => token.classList.remove('is-selected'));
    clearBubbleFocus();
  }

  function renderFxBubbleEditor(events) {
    const selected = events.find((event) => event.id === selectedMegaEventId);
    if (!selected) {
      selectedMegaEventId = null;
      els.fxBubbleEditor.hidden = true;
      els.fxBubbleChoices.replaceChildren();
      return;
    }
    const label = megaEventLabel(selected);
    const currentKey = megaEventKey(selected);
    els.fxBubbleEditor.hidden = false;
    els.fxBubbleEditorTitle.textContent = `EDIT FX BUBBLE · ${label}`;
    els.fxBubbleEditorMeta.textContent = `Position ${selected.offset}. Choose a verified replacement; the bubble keeps its place and raw-code order.`;
    els.fxBubbleChoices.replaceChildren();
    fxChoiceDefinitions().forEach((definition) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = definition.label;
      button.dataset.fxBubbleChoice = definition.key;
      button.setAttribute('aria-pressed', String(definition.key === currentKey));
      button.addEventListener('click', () => {
        if (definition.spritePicker) {
          els.fxBubbleEditorMeta.textContent = 'Choose one of the Arena faces in the sprite tray. It will replace this bubble without moving it.';
          els.spriteTray.scrollIntoView({block: 'nearest'});
          els.spriteTray.querySelector('button')?.focus({preventScroll: true});
          return;
        }
        const payload = definition.payload?.();
        if (!payload) {
          playFeedback('INVALID FX VALUE', true);
          return;
        }
        replaceSelectedMegaEvent(payload);
      });
      els.fxBubbleChoices.appendChild(button);
    });
  }

  function openMegaBubbleEditor(eventId) {
    openFxPicker(eventId);
  }

  function openGlobalFxDrawer(effectKey) {
    selectedMegaEventId = null;
    selectedMegaGlobalKey = effectKey;
    els.fxDrawer.open = true;
    renderInlineEvents();
    requestAnimationFrame(() => {
      const target = document.querySelector(`[data-fx-card="${effectKey}"]`)
        || document.querySelector(`[data-fx-toggle="${effectKey}"]`)
        || document.querySelector(`[data-format="${effectKey}"]`)
        || document.querySelector(`[data-effect="${effectKey}"]`)
        || els.fxDrawer;
      target.scrollIntoView({block: 'nearest'});
      target.focus?.({preventScroll: true});
    });
    haptic(4);
  }

  function layoutMegaTubeTokens(nameLength) {
    const tokens = [...els.barStopMarkers.querySelectorAll('.bar-marker'), ...els.megaFxLayer.querySelectorAll('.mega-code-token')];
    const trackWidth = els.megaFxLayer.getBoundingClientRect().width
      || Math.max(1, els.gradientBar.getBoundingClientRect().width - 40);
    const packed = Logic.packTubeBubbles(tokens.map((token, sourceIndex) => ({
      token,
      sourceIndex,
      offset: Number(token.dataset.rawOffset) || 0,
      order: Number(token.dataset.rawOrder) || 0
    })), trackWidth, nameLength, {maximumSize: 34, minimumSize: 18, breathingRoom: 5, edge: 2});
    let sequence = 0;
    packed.entries.forEach((entry, index) => {
      const token = entry.token;
      const dormant = token.classList.contains('stage-dormant');
      const unassigned = token.dataset.unassignedFx === 'true';
      const sprite = token.querySelector('.mega-event-marker.event-sprite');
      const number = token.querySelector('.tube-sequence');
      token.style.left = `${entry.left}px`;
      token.style.setProperty('--serial-shift', '0px');
      token.style.setProperty('--mega-bubble-size', `${packed.bubbleSize}px`);
      token.style.zIndex = String(20 + index);
      if (!dormant && !unassigned) sequence += 1;
      token.dataset.tubeNumber = dormant || unassigned ? '' : String(sequence);
      if (number) number.textContent = dormant ? '×' : unassigned ? '' : String(sequence);
      if (sprite) {
        const baseAria = sprite.dataset.baseAria || sprite.getAttribute('aria-label') || 'Arena sprite';
        sprite.dataset.baseAria = baseAria;
        sprite.setAttribute('aria-label', `${baseAria} Raw-code bubble ${sequence}.`);
      }
      if (token.dataset.eventId === selectedMegaEventId) {
        token.classList.add('is-selected');
        els.fxBubbleEditorTitle.textContent = `EDIT BUBBLE ${sequence} · ${megaEventLabel(inlineEvents.find((event) => event.id === selectedMegaEventId))}`;
      }
    });
  }

  function renderInlineEvents() {
    els.inlineEvents.replaceChildren();
    els.megaFxLayer.replaceChildren();
    const nameLength = els.deckName.value.length;
    const events = Logic.normaliseInlineEvents(inlineEvents, nameLength);

    (currentBuild?.effectTags || []).forEach((effectTag, index) => {
      const token = document.createElement('button');
      token.type = 'button';
      token.className = 'mega-code-token mega-global-token';
      token.dataset.rawOffset = '0';
      token.dataset.rawOrder = String(-100 + index);
      token.dataset.globalKey = effectTag.key;
      token.classList.toggle('is-selected', effectTag.key === selectedMegaGlobalKey);
      const number = document.createElement('span');
      number.className = 'tube-sequence';
      number.textContent = String(index + 1);
      token.appendChild(number);
      token.title = `${effectTag.code} is emitted globally before the first colour tag`;
      token.setAttribute('aria-label', `${effectTag.code}, global Arena effect at the start of the code`);
      token.addEventListener('click', () => openGlobalFxDrawer(effectTag.key));
      token.addEventListener('contextmenu', (contextEvent) => {
        contextEvent.preventDefault();
        openGlobalFxDrawer(effectTag.key);
      });
      token.addEventListener('pointerenter', () => showMirrorGuide(0));
      token.addEventListener('pointerleave', clearMirrorGuide);
      token.addEventListener('focus', () => showMirrorGuide(0));
      token.addEventListener('blur', clearMirrorGuide);
      els.megaFxLayer.appendChild(token);
    });

    events.forEach((inlineEvent) => {
      const node = document.createElement('span');
      node.className = 'mega-code-token mega-event-node';
      node.dataset.eventId = inlineEvent.id || '';
      node.dataset.rawOffset = String(inlineEvent.offset);
      node.dataset.rawOrder = String(100 + (Number(inlineEvent.sequence) || 0));
      node.style.left = `${nameLength ? inlineEvent.offset / nameLength * 100 : 0}%`;
      const marker = document.createElement('button');
      marker.type = 'button';
      marker.className = `mega-event-marker event-${inlineEvent.type}`;
      marker.dataset.eventId = inlineEvent.id || '';
      marker.dataset.eventOffset = String(inlineEvent.offset);
      const label = megaEventLabel(inlineEvent);
      if (inlineEvent.type === 'sprite') {
        const hook = document.createElement('i');
        hook.style.backgroundImage = `var(--arena-sprite-${inlineEvent.value},none)`;
        marker.appendChild(hook);
      } else {
        const number = document.createElement('span');
        number.className = 'tube-sequence';
        marker.appendChild(number);
      }
      marker.setAttribute('aria-label', `${label} at text position ${inlineEvent.offset}. Click to edit; drag or use arrow keys to move.`);
      marker.title = `${inlineEvent.code} @ ${inlineEvent.offset}`;
      marker.classList.toggle('is-selected', inlineEvent.id === selectedMegaEventId);
      const removeEvent = () => {
        if (selectedMegaEventId === inlineEvent.id) selectedMegaEventId = null;
        commitMutation(() => {
          inlineEvents = inlineEvents.filter((candidate) => candidate.id !== inlineEvent.id);
        });
      };
      const moveTo = (offset) => {
        const target = Math.max(0, Math.min(nameLength, offset));
        if (target === inlineEvent.offset) return;
        commitMutation(() => {
          inlineEvents = inlineEvents.map((candidate) => candidate.id === inlineEvent.id ? {...candidate, offset: target} : candidate);
        }, {haptic: 7});
      };
      marker.addEventListener('pointerenter', () => showMirrorGuide(inlineEvent.offset));
      marker.addEventListener('pointerleave', clearMirrorGuide);
      marker.addEventListener('focus', () => showMirrorGuide(inlineEvent.offset));
      marker.addEventListener('blur', clearMirrorGuide);
      marker.addEventListener('keydown', (keyEvent) => {
        let target = inlineEvent.offset;
        if (keyEvent.key === 'ArrowLeft') target -= keyEvent.shiftKey ? 5 : 1;
        else if (keyEvent.key === 'ArrowRight') target += keyEvent.shiftKey ? 5 : 1;
        else if (keyEvent.key === 'Home') target = 0;
        else if (keyEvent.key === 'End') target = nameLength;
        else if (keyEvent.key === 'Delete' || keyEvent.key === 'Backspace') {
          keyEvent.preventDefault(); removeEvent(); return;
        } else if (keyEvent.key === 'Enter' || keyEvent.key === ' ') {
          keyEvent.preventDefault(); openMegaBubbleEditor(inlineEvent.id); return;
        } else return;
        keyEvent.preventDefault(); moveTo(target);
      });
      marker.addEventListener('pointerdown', (pointerEvent) => {
        if (pointerEvent.button !== 0) return;
        pointerEvent.preventDefault();
        const originalOffset = inlineEvent.offset;
        let draftOffset = originalOffset;
        let moved = false;
        try { marker.setPointerCapture(pointerEvent.pointerId); } catch (_) {}
        const offsetFromPointer = (clientX) => {
          const bounds = els.gradientBar.getBoundingClientRect();
          return bounds.width ? Math.max(0, Math.min(nameLength, Math.round((clientX - bounds.left) / bounds.width * nameLength))) : originalOffset;
        };
        const update = (moveEvent) => {
          if (moveEvent.pointerId !== pointerEvent.pointerId) return;
          draftOffset = offsetFromPointer(moveEvent.clientX);
          moved = moved || draftOffset !== originalOffset;
          node.style.left = `${nameLength ? draftOffset / nameLength * 100 : 0}%`;
          marker.classList.toggle('dragging', moved);
          showMirrorGuide(draftOffset);
        };
        const cleanup = () => {
          marker.removeEventListener('pointermove', update);
          marker.removeEventListener('pointerup', finish);
          marker.removeEventListener('pointercancel', cancel);
          try { if (marker.hasPointerCapture(pointerEvent.pointerId)) marker.releasePointerCapture(pointerEvent.pointerId); } catch (_) {}
          clearMirrorGuide();
        };
        const finish = (finishEvent) => {
          if (finishEvent.pointerId !== pointerEvent.pointerId) return;
          cleanup();
          if (moved) moveTo(draftOffset);
          else {
            marker.classList.remove('dragging');
            openMegaBubbleEditor(inlineEvent.id);
          }
        };
        const cancel = (cancelEvent) => {
          if (cancelEvent.pointerId !== pointerEvent.pointerId) return;
          cleanup(); node.style.left = `${nameLength ? originalOffset / nameLength * 100 : 0}%`;
          marker.classList.remove('dragging');
        };
        marker.addEventListener('pointermove', update);
        marker.addEventListener('pointerup', finish);
        marker.addEventListener('pointercancel', cancel);
      });
      marker.addEventListener('contextmenu', (contextEvent) => {
        contextEvent.preventDefault();
        openMegaBubbleEditor(inlineEvent.id);
      });
      node.appendChild(marker);
      els.megaFxLayer.appendChild(node);
    });

    if (pendingFxBubble) {
      const node = document.createElement('span');
      node.className = 'mega-code-token mega-event-node pending-fx-token is-selected';
      node.dataset.pendingFxId = pendingFxBubble.id;
      node.dataset.unassignedFx = 'true';
      node.dataset.rawOffset = String(pendingFxBubble.offset);
      node.dataset.rawOrder = '999999';
      node.style.left = `${nameLength ? pendingFxBubble.offset / nameLength * 100 : 0}%`;
      const marker = document.createElement('button');
      marker.type = 'button';
      marker.className = 'mega-event-marker event-unassigned is-selected';
      marker.tabIndex = -1;
      marker.setAttribute('aria-label', `Unassigned FX placeholder at text position ${pendingFxBubble.offset}. Not included in Arena code.`);
      marker.title = 'CHOOSE FX · not yet included in raw code or budget';
      const label = document.createElement('span');
      label.className = 'pending-fx-label';
      label.textContent = 'FX';
      marker.appendChild(label);
      node.appendChild(marker);
      els.megaFxLayer.appendChild(node);
    }

    renderFxBubbleEditor(events);

    const sourceStrip = document.createElement('div');
    sourceStrip.className = 'inline-timeline-sources mega-source-strip';
    sourceStrip.setAttribute('role', 'group');
    sourceStrip.setAttribute('aria-label', 'Add an effect bubble at the active caret');
    const sourceLabel = document.createElement('b');
    sourceLabel.textContent = 'ADD FX';
    sourceStrip.appendChild(sourceLabel);
    const genericFx = document.createElement('button');
    genericFx.type = 'button';
    genericFx.className = 'generic-fx-source';
    genericFx.dataset.timelineSource = '';
    genericFx.innerHTML = '<i>FX</i><span>CHOOSE EFFECT</span>';
    genericFx.setAttribute('aria-label', 'Choose an effect at the active caret, or drag this generic FX bubble into the Mega Tube and choose after dropping');
    genericFx.addEventListener('click', () => {
      if (genericFx.dataset.dragged === 'true') return;
      openFxPicker();
    });
    enableUnassignedFxDragSource(genericFx);
    sourceStrip.appendChild(genericFx);
    const scale = document.createElement('div');
    scale.className = 'mega-tube-scale';
    scale.innerHTML = `<span>0 // START</span><b>FX PICKER ADDS AT CARET · BUBBLES DRAG PRECISELY</b><span>${nameLength} // END</span>`;
    els.inlineEvents.append(sourceStrip, scale);

    if (!els.gradientBar.dataset.fxDropReady) {
      els.gradientBar.dataset.fxDropReady = 'true';
      els.gradientBar.addEventListener('dragover', (dragEvent) => {
        const types = Array.from(dragEvent.dataTransfer?.types || []);
        if (
          !types.includes('application/x-arena-fx')
          && !types.includes('application/x-arena-colour')
          && !types.includes('application/x-arena-unassigned-fx')
        ) return;
        dragEvent.preventDefault(); els.gradientBar.classList.add('drop-target');
      });
      els.gradientBar.addEventListener('dragleave', () => els.gradientBar.classList.remove('drop-target'));
      els.gradientBar.addEventListener('drop', (dropEvent) => {
        els.gradientBar.classList.remove('drop-target');
        const encoded = dropEvent.dataTransfer?.getData('application/x-arena-fx');
        const colour = dropEvent.dataTransfer?.getData('application/x-arena-colour');
        const unassignedFx = dropEvent.dataTransfer?.getData('application/x-arena-unassigned-fx');
        if (!encoded && !colour && !unassignedFx) return;
        dropEvent.preventDefault();
        try {
          const length = els.deckName.value.length;
          const position = tubePositionFromClientX(dropEvent.clientX);
          if (colour) insertGradientColourAt(colour, position);
          else if (unassignedFx) openFxPicker(null, Math.round(position * length));
          else insertComposerEventAt(JSON.parse(encoded), Math.round(position * length), null);
        } catch (_) {}
      });
    }
    layoutMegaTubeTokens(nameLength);
    if ((fxPickerOpen || els.fxDrawer.open) && selectedMegaEventId) focusInlineBubble(selectedMegaEventId);
    else if (fxPickerOpen && pendingFxBubble) focusFxPickerTarget(fxPickerSelectedKey);
    requestAnimationFrame(() => layoutMegaTubeTokens(nameLength));
  }

  function rememberComposerSelection(input) {
    if (!(input instanceof HTMLInputElement)) return;
    activeTextInput = input;
    composerSelection = {
      start: Number.isInteger(input.selectionStart) ? input.selectionStart : input.value.length,
      end: Number.isInteger(input.selectionEnd) ? input.selectionEnd : input.value.length
    };
  }

  function insertComposerEventAt(event, requestedOffset, focusInput = null) {
    const offset = Math.max(0, Math.min(els.deckName.value.length, Math.round(Number(requestedOffset) || 0)));
    const id = `inline-${nextInlineEventId++}`;
    commitMutation(() => {
      defaultNameUntouched = false;
      inlineEvents = Logic.insertInlineEvent(inlineEvents, {...event, id}, offset);
    }, {haptic: 9});
    if (focusInput instanceof HTMLInputElement) requestAnimationFrame(() => {
      focusInput.focus({preventScroll: true});
      focusInput.setSelectionRange(offset, offset);
      rememberComposerSelection(focusInput);
    });
  }

  function insertComposerEvent(event) {
    const input = activeTextInput || els.deckName;
    const offset = Math.max(0, Math.min(els.deckName.value.length, composerSelection.start));
    insertComposerEventAt(event, offset, input);
  }

  function insertOrReplaceComposerEvent(event) {
    if (replaceSelectedMegaEvent(event)) return;
    insertComposerEvent(event);
  }

  function enableFxDragSource(element, payloadProvider) {
    element.draggable = true;
    element.classList.add('fx-drag-source');
    element.addEventListener('dragstart', (dragEvent) => {
      const payload = typeof payloadProvider === 'function' ? payloadProvider() : payloadProvider;
      if (!payload || !dragEvent.dataTransfer) {
        dragEvent.preventDefault();
        return;
      }
      dragEvent.dataTransfer.effectAllowed = 'copy';
      dragEvent.dataTransfer.setData('application/x-arena-fx', JSON.stringify(payload));
      dragEvent.dataTransfer.setData('text/plain', payload.type === 'tag' ? payload.code : payload.type === 'sprite' ? `<sprite=${payload.value}>` : '<br>');
      element.classList.add('dragging');
    });
    element.addEventListener('dragend', () => element.classList.remove('dragging'));
  }

  function enableUnassignedFxDragSource(element) {
    element.draggable = true;
    element.classList.add('fx-drag-source', 'unassigned-fx-drag-source');
    element.addEventListener('dragstart', (dragEvent) => {
      if (!dragEvent.dataTransfer) { dragEvent.preventDefault(); return; }
      dragEvent.dataTransfer.effectAllowed = 'copy';
      dragEvent.dataTransfer.setData('application/x-arena-unassigned-fx', 'choose-after-drop');
      dragEvent.dataTransfer.setData('text/plain', 'FX');
      element.dataset.dragged = 'true';
      element.classList.add('dragging');
    });
    element.addEventListener('dragend', () => {
      element.classList.remove('dragging');
      setTimeout(() => { delete element.dataset.dragged; }, 0);
    });
  }

  function enableColourDragSource(element, colourProvider) {
    element.draggable = true;
    element.classList.add('colour-drag-source');
    element.addEventListener('dragstart', (dragEvent) => {
      const colour = normaliseHex(typeof colourProvider === 'function' ? colourProvider() : colourProvider);
      if (!colour || !dragEvent.dataTransfer) { dragEvent.preventDefault(); return; }
      dragEvent.dataTransfer.effectAllowed = 'copy';
      dragEvent.dataTransfer.setData('application/x-arena-colour', colour);
      dragEvent.dataTransfer.setData('text/plain', colour);
      element.classList.add('dragging');
    });
    element.addEventListener('dragend', () => element.classList.remove('dragging'));
  }

  function insertGradientColourAt(colour, requestedPosition) {
    const clean = normaliseHex(colour);
    if (!clean) return;
    const position = Math.max(0, Math.min(1, Number(requestedPosition) || 0));
    if (position > ANCHOR_SWAP_ZONE && gradientStops.length >= MAX_STOPS) {
      playFeedback('SEVEN COLOURS MAX', true); haptic(18); return;
    }
    commitMutation(() => {
      if (position <= ANCHOR_SWAP_ZONE) {
        gradientStops[0] = {...gradientStops[0], colour: clean};
        selectedStop = 0;
      } else {
        gradientStops = normalisePalette([...gradientStops, {colour: clean, position}]);
        selectedStop = gradientStops.reduce((best, stop, index) => Math.abs(stop.position - position) < best.distance ? {index, distance: Math.abs(stop.position - position)} : best, {index: 0, distance: Infinity}).index;
      }
      manaSelection = [];
    }, {haptic: 9});
  }

  function verifiedCaretTag(name, value) {
    const clean = String(value || '').trim();
    if (name === 'mspace' || name === 'space') {
      return /^-?\d+(?:\.\d+)?(?:px|em|%)?$/i.test(clean) ? `<${name}=${clean}>` : '';
    }
    if (name === 'mark') return /^#[0-9a-f]{6}(?:[0-9a-f]{2})?$/i.test(clean) ? `<mark=${clean.toUpperCase()}>` : '';
    if (name === 'alpha') return /^#[0-9a-f]{2}$/i.test(clean) ? `<alpha=${clean.toUpperCase()}>` : '';
    return '';
  }

  function renderSpriteTray() {
    els.spriteTray.replaceChildren();
    Array.from({length: 16}, (_, sprite) => sprite).forEach((sprite) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'sprite-placeholder sprite-tile';
      button.dataset.spriteId = String(sprite);
      button.setAttribute('aria-label', `Insert Arena sprite ${sprite} at the active caret`);
      button.title = `Arena sprite ${sprite}`;
      const hook = document.createElement('i');
      button.appendChild(hook);
      button.addEventListener('click', () => insertOrReplaceComposerEvent({type: 'sprite', value: sprite}));
      enableFxDragSource(button, {type: 'sprite', value: sprite});
      els.spriteTray.appendChild(button);
    });
  }

  function renderProbeButtons(target, probes) {
    target.replaceChildren();
    probes.forEach((probe) => {
      const button = document.createElement('button');
      button.type = 'button';
      const label = document.createElement('b');
      label.textContent = probe.name;
      const code = document.createElement('code');
      code.textContent = probe.code;
      button.append(label, code);
      button.addEventListener('click', () => {
        els.probeOutput.value = probe.complete ? probe.code : `${probe.code}Arena`;
        els.probeOutput.focus({preventScroll: true});
        els.probeOutput.select();
      });
      target.appendChild(button);
    });
  }

  function handleTextInput(source, mirror) {
    const nextName = source.value;
    inlineEvents = Logic.rebaseInlineEvents(inlineEvents, previousName, nextName);
    previousName = nextName;
    mirror.value = nextName;
    defaultNameUntouched = false;
    rememberComposerSelection(source);
    renderOutput();
    renderInlineEvents();
  }

  function configureOptionalFormats() {
    const boldButton = document.querySelector('[data-format="bold"]');
    if (!boldButton) return;
    boldButton.hidden = !ARENA_BOLD_SUPPORTED;
    boldButton.closest('.copy-format-pad').dataset.boldSupported = String(ARENA_BOLD_SUPPORTED);
    boldButton.closest('.copy-style-row').dataset.boldSupported = String(ARENA_BOLD_SUPPORTED);
    if (!ARENA_BOLD_SUPPORTED) formatting.bold = false;
  }

  function renderAll() {
    if (!ARENA_BOLD_SUPPORTED) formatting.bold = false;
    renderOutput();
    renderGradientEditor();
    renderManaComposer();
    renderMtgPresets();
    renderQuickPalettes();
    renderPaletteTray();
    renderSavedPalettes();
    renderFormatting();
    renderFxControls();
    renderInlineEvents();
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
    handleTextInput(target, target === els.prismaticDeckName ? els.deckName : els.prismaticDeckName);
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
  configureOptionalFormats();
  renderViewMode();
  renderBuiltIns();
  renderSpriteTray();
  renderProbeButtons(els.verifiedProbeList, VERIFIED_PROBES);
  renderProbeButtons(els.candidateProbeList, CANDIDATE_PROBES);
  renderAll();
  enableGlassRefraction();
  let megaTubeResizeFrame = null;
  const relayoutMegaTube = () => {
    cancelAnimationFrame(megaTubeResizeFrame);
    megaTubeResizeFrame = requestAnimationFrame(() => {
      layoutMegaTubeTokens(els.deckName.value.length);
      updateVisualWidthRisk(currentBuild);
    });
  };
  if (typeof ResizeObserver === 'function') new ResizeObserver(relayoutMegaTube).observe(els.gradientBar);
  else window.addEventListener('resize', relayoutMegaTube, {passive: true});

  els.undoButton.addEventListener('click', undo);
  els.startOver.addEventListener('click', startOver);
  els.rotateGradient.addEventListener('click', rotateGradient);
  els.flipGradient.addEventListener('click', flipGradient);
  els.tubeAddButton.addEventListener('click', addBubbleFromButton);
  els.gradientBar.addEventListener('click', (event) => {
    if (event.target.closest('.bar-marker,.mega-event-node,.mega-global-token')) return;
    if (gradientStops.length === 1) openStopEditor(0);
  });
  els.gradientBar.addEventListener('keydown', (event) => {
    if (!['Enter', ' '].includes(event.key)) return;
    if (gradientStops.length !== 1) return;
    event.preventDefault(); openStopEditor(0);
  });
  els.clearMana.addEventListener('click', () => commitMutation(() => { manaSelection = []; }));
  els.favouriteCurrent.addEventListener('click', toggleFavourite);
  els.stopEditorClose.addEventListener('click', closeStopEditor);
  els.stopEditorBackdrop.addEventListener('pointerdown', (event) => {
    if (event.target === els.stopEditorBackdrop) closeStopEditor();
  });
  els.stopEditorWheel.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    els.stopEditorHex.blur();
    els.stopEditorBackdrop.classList.remove('hex-entry-active');
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
  els.stopEditorHex.addEventListener('focus', () => {
    els.stopEditorBackdrop.classList.add('hex-entry-active');
  });
  els.stopEditorHex.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    confirmEditorColour();
  });
  els.stopEditorConfirm.addEventListener('click', confirmEditorColour);
  document.querySelectorAll('.format-pad button[data-format]').forEach((button) => button.addEventListener('click', () => {
    commitMutation(() => { formatting[button.dataset.format] = !formatting[button.dataset.format]; });
  }));
  document.querySelectorAll('.format-pad button[data-effect]').forEach((button) => button.addEventListener('click', () => {
    const key = button.dataset.effect;
    commitMutation(() => { effects = Logic.normaliseEffects({...effects, [key]: !effects[key]}); });
  }));
  document.querySelectorAll('[data-fx-toggle]').forEach((button) => button.addEventListener('click', () => {
    const key = button.dataset.fxToggle;
    commitMutation(() => {
      const next = !effects[key];
      effects = Logic.normaliseEffects({...effects, [key]: next, [key === 'sup' ? 'sub' : 'sup']: next ? false : effects[key === 'sup' ? 'sub' : 'sup']});
    });
  }));
  document.querySelectorAll('[data-fx-enabled]').forEach((checkbox) => checkbox.addEventListener('change', () => {
    const name = checkbox.dataset.fxEnabled;
    const enabled = checkbox.checked;
    commitMutation(() => {
      effects = Logic.normaliseEffects({...effects, [name]: {...effects[name], enabled}});
    });
  }));
  document.querySelectorAll('[data-fx-value],[data-fx-slider]').forEach((input) => {
    const name = input.dataset.fxValue || input.dataset.fxSlider;
    const rememberPreviousValue = () => {
      const previous = effects[name]?.value ?? Logic.NUMERIC_EFFECT_DEFAULTS[name];
      document.querySelectorAll(`[data-fx-value="${name}"],[data-fx-slider="${name}"]`).forEach((control) => {
        control.dataset.previousValue = previous;
      });
    };
    input.addEventListener('focus', rememberPreviousValue);
    input.addEventListener('pointerdown', rememberPreviousValue);
    input.addEventListener('input', () => {
      const nextValue = normaliseFxControlValue(name, input.value);
      effects[name] = {...effects[name], value: nextValue};
      syncFxValueControls(name, nextValue);
      renderOutput();
    });
    input.addEventListener('change', () => {
      const previousValue = input.dataset.previousValue ?? Logic.NUMERIC_EFFECT_DEFAULTS[name];
      const nextValue = normaliseFxControlValue(name, input.value);
      effects[name] = {...effects[name], value: previousValue};
      commitMutation(() => {
        effects = Logic.normaliseEffects({...effects, [name]: {...effects[name], value: nextValue}});
      });
      document.querySelectorAll(`[data-fx-value="${name}"],[data-fx-slider="${name}"]`).forEach((control) => {
        control.dataset.previousValue = nextValue;
      });
    });
  });
  els.insertBreak.addEventListener('click', () => insertOrReplaceComposerEvent({type: 'br'}));
  enableFxDragSource(els.insertBreak, {type: 'br'});
  document.querySelectorAll('[data-caret-current]').forEach((button) => {
    const payload = () => {
      const name = button.dataset.caretCurrent;
      return {type: 'tag', code: `<${name}=${Logic.shortestNumber(effects[name]?.value, Logic.NUMERIC_EFFECT_DEFAULTS[name])}>`};
    };
    button.addEventListener('click', () => insertOrReplaceComposerEvent(payload()));
    enableFxDragSource(button, payload);
  });
  document.querySelectorAll('[data-caret-code]').forEach((button) => {
    const payload = {type: 'tag', code: button.dataset.caretCode};
    button.addEventListener('click', () => insertOrReplaceComposerEvent(payload));
    enableFxDragSource(button, payload);
  });
  document.querySelectorAll('[data-caret-insert]').forEach((button) => {
    const payload = () => {
      const name = button.dataset.caretInsert;
      const input = document.querySelector(`[data-caret-value="${name}"]`);
      const code = verifiedCaretTag(name, input?.value);
      return code ? {type: 'tag', code} : null;
    };
    button.addEventListener('click', () => {
      const name = button.dataset.caretInsert;
      const input = document.querySelector(`[data-caret-value="${name}"]`);
      const event = payload();
      if (!event) {
        input?.setAttribute('aria-invalid', 'true');
        input?.focus({preventScroll: true});
        playFeedback('INVALID FX VALUE', true);
        haptic(24);
        return;
      }
      input.removeAttribute('aria-invalid');
      insertOrReplaceComposerEvent(event);
    });
    enableFxDragSource(button, payload);
  });
  els.fxBubbleEditorDone.addEventListener('click', () => {
    closeMegaBubbleEditor();
    els.fxDrawer.querySelector('summary')?.focus({preventScroll: true});
  });
  els.fxBubbleDelete.addEventListener('click', () => {
    const selected = inlineEvents.find((event) => event.id === selectedMegaEventId);
    if (!selected) return;
    selectedMegaEventId = null;
    commitMutation(() => {
      inlineEvents = inlineEvents.filter((event) => event.id !== selected.id);
    }, {haptic: 10});
  });
  els.fxDrawer.addEventListener('toggle', () => {
    if (!els.fxDrawer.open) closeMegaBubbleEditor();
  });
  els.fxPickerBack.addEventListener('click', renderFxPickerChoices);
  els.fxPickerClose.addEventListener('click', closeFxPicker);
  els.fxPickerDrawer.addEventListener('click', openFxDrawerFromPicker);
  els.fxPickerApply.addEventListener('click', applyFxPicker);
  els.fxPickerBackdrop.addEventListener('pointerdown', (event) => {
    if (event.target === els.fxPickerBackdrop) closeFxPicker();
  });
  els.fxPicker.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') { event.preventDefault(); closeFxPicker(); }
  });
  els.deckName.addEventListener('focus', () => requestAnimationFrame(selectDefaultName));
  els.deckName.addEventListener('pointerup', (event) => {
    if (defaultNameUntouched && els.deckName.value === DEFAULT_NAME) { event.preventDefault(); selectDefaultName(); }
    requestAnimationFrame(() => rememberComposerSelection(els.deckName));
  });
  els.deckName.addEventListener('input', () => {
    handleTextInput(els.deckName, els.prismaticDeckName);
  });
  els.deckName.addEventListener('paste', normalisePastedText);
  els.deckName.addEventListener('select', () => rememberComposerSelection(els.deckName));
  els.deckName.addEventListener('keyup', () => rememberComposerSelection(els.deckName));
  els.prismaticDeckName.addEventListener('input', () => {
    handleTextInput(els.prismaticDeckName, els.deckName);
  });
  els.prismaticDeckName.addEventListener('paste', normalisePastedText);
  els.prismaticDeckName.addEventListener('focus', () => rememberComposerSelection(els.prismaticDeckName));
  els.prismaticDeckName.addEventListener('select', () => rememberComposerSelection(els.prismaticDeckName));
  els.prismaticDeckName.addEventListener('keyup', () => rememberComposerSelection(els.prismaticDeckName));
  els.prismaticDeckName.addEventListener('pointerup', () => requestAnimationFrame(() => rememberComposerSelection(els.prismaticDeckName)));
  els.prismaticDeckName.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    closePrismaticNameEditor();
  });
  els.viewModeToggle.addEventListener('click', () => {
    viewMode = viewMode === DEFAULT_VIEW_MODE ? 'prismatic' : DEFAULT_VIEW_MODE;
    renderViewMode();
    haptic([7, 9]);
  });
  els.prismaticEdit.addEventListener('click', openPrismaticNameEditor);
  els.prismaticNameClose.addEventListener('click', closePrismaticNameEditor);
  els.prismaticNameDone.addEventListener('click', closePrismaticNameEditor);
  els.prismaticNameBackdrop.addEventListener('pointerdown', (event) => {
    if (event.target === els.prismaticNameBackdrop) closePrismaticNameEditor();
  });
  els.copyButton.addEventListener('click', copyResult);
  els.copyRawCode.addEventListener('click', copyResult);
  els.copyProbe.addEventListener('click', async () => {
    const copied = await writeClipboard(els.probeOutput.value);
    els.copyStatus.textContent = copied ? 'Arena probe copied.' : 'Probe copy blocked.';
    haptic(copied ? 9 : 24);
  });
  document.addEventListener('keydown', (event) => {
    const isTextField = event.target instanceof HTMLInputElement && ['text', 'search'].includes(event.target.type);
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') { event.preventDefault(); copyResult(); return; }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z' && !isTextField) { event.preventDefault(); undo(); }
    if (event.key === 'Escape' && fxPickerOpen) { closeFxPicker(); return; }
    if (event.key === 'Escape' && !els.prismaticNameBackdrop.hidden) { closePrismaticNameEditor(); return; }
    if (event.key === 'Escape' && stopEditorOpen) { closeStopEditor(); return; }
    if (event.key === 'Escape' && (selectedMegaEventId || selectedMegaGlobalKey)) { closeMegaBubbleEditor(); }
  });
})();
