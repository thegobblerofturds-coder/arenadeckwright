(() => {
  'use strict';

  const Logic = window.DeckwrightV7Logic;
  const DEFAULT_NAME = 'Your Deck Name';
  const STORAGE_KEY = 'turdgobbler-colourifier-ultimate-v2';
  const LEGACY_STORAGE_KEY = 'turdgobbler-deckwright-v7';
  const MAX_COLOURS = Math.floor(Logic.LIMIT / 6);
  const MAX_HISTORY = 50;
  const MANA_ORDER = ['W', 'U', 'B', 'R', 'G'];
  const MANA = {
    W: {name: 'White', colour: '#F4E7C4'},
    U: {name: 'Blue', colour: '#2684FF'},
    B: {name: 'Black', colour: '#6B4777'},
    R: {name: 'Red', colour: '#E34832'},
    G: {name: 'Green', colour: '#39A96B'}
  };
  const IDENTITY_NAMES = {
    W: 'MONO-WHITE', U: 'MONO-BLUE', B: 'MONO-BLACK', R: 'MONO-RED', G: 'MONO-GREEN',
    WU: 'AZORIUS', UB: 'DIMIR', BR: 'RAKDOS', RG: 'GRUUL', WG: 'SELESNYA',
    WB: 'ORZHOV', UR: 'IZZET', BG: 'GOLGARI', WR: 'BOROS', UG: 'SIMIC',
    WUG: 'BANT', WUB: 'ESPER', UBR: 'GRIXIS', BRG: 'JUND', WRG: 'NAYA',
    WBG: 'ABZAN', WUR: 'JESKAI', UBG: 'SULTAI', WBR: 'MARDU', URG: 'TEMUR',
    WUBR: 'YORE-TILLER', UBRG: 'GLINT-EYE', WBRG: 'DUNE-BROOD',
    WURG: 'INK-TREADER', WUBG: 'WITCH-MAW', WUBRG: 'FIVE-COLOUR'
  };
  const QUICK_COLOURS = [
    ['ARENA WHITE', '#F2F3F3'], ['EMBER', '#F03444'], ['ORANGE', '#FF8A24'],
    ['GOLD', '#FFE14A'], ['VENOM', '#63D42F'], ['AQUA', '#25BDE5'],
    ['BLUE', '#4669E8'], ['VIOLET', '#A447D1'], ['PINK', '#F05BA7'],
    ['SILVER', '#9DA4AA'], ['INK', '#171A22'], ['BONE', '#EAD9B5']
  ];
  const COLOUR_PRESETS = [
    {name: 'PRISMATIC', note: 'FULL SPECTRUM', colours: ['#F03444', '#FF8A24', '#FFE14A', '#43C96B', '#25BDE5', '#4669E8', '#A447D1']},
    {name: 'SUNSET RELIC', note: 'VIOLET TO GOLD', colours: ['#45256F', '#A52E72', '#E24B4B', '#F1872B', '#FFD56A']},
    {name: 'TOXIC FOIL', note: 'INK TO ACID', colours: ['#10190D', '#267026', '#63D42F', '#D7FF45']},
    {name: 'VOID SIGNAL', note: 'DEEP BLUE GLOW', colours: ['#111630', '#27478C', '#3F7FE8', '#79D8FF']},
    {name: 'BLOOD MOON', note: 'CRIMSON HEAT', colours: ['#35070E', '#8F1426', '#E34832', '#FF9B55']},
    {name: 'AETHER MINT', note: 'COOL LUMINOUS', colours: ['#153A43', '#28A98B', '#72E2C4', '#D8FFF2']},
    {name: 'ROYAL STATIC', note: 'PURPLE ELECTRIC', colours: ['#2A174A', '#6E36BE', '#B356F0', '#F3B4FF']},
    {name: 'SILVER SCREEN', note: 'MONO METAL', colours: ['#282C31', '#7B8288', '#F2F3F3', '#9DA4AA', '#41464B']}
  ];
  const STYLE_PRESETS = [
    {
      id: 'ice-rainbow', name: 'ICE RAINBOW', note: 'FROSTED FULL-SPECTRUM COLOUR', sample: 'ICE',
      colours: ['#E8FDFF', '#7CEBFF', '#6D9CFF', '#B778FF', '#FF91D8', '#FFF2B6'],
      formatting: {}, effects: {}
    },
    {
      id: 'sunset', name: 'SUNSET', note: 'VIOLET, EMBER, ORANGE, GOLD', sample: 'DUSK',
      colours: ['#482367', '#A82F68', '#ED4D4B', '#FF8C31', '#FFD66A'],
      formatting: {}, effects: {}
    },
    {
      id: 'bubbles', name: 'BUBBLES', note: 'BOUNCING SIZE + VERTICAL WAVES', sample: 'OoO',
      colours: ['#73F2FF', '#FFB4E6'],
      formatting: {}, effects: {}, startCodes: ['<size=10>', '<cspace=1>'], pattern: 'bubbles'
    },
    {
      id: 'drift-away', name: 'DRIFT AWAY', note: 'SHRINK, RISE, AND SPACE OUT', sample: 'drift',
      colours: ['#F4FBFF', '#9CDBFF', '#848BFF'],
      formatting: {}, effects: {}, startCodes: ['<i>', '<cspace=2>'], pattern: 'drift'
    },
    {
      id: 'matrix-glitch', name: 'MATRIX GLITCH', note: 'MATRIX GREEN + STAGGERED GLITCH', sample: '0101',
      colours: ['#073B1B', '#00FF66', '#C8FFD9'],
      formatting: {}, effects: {allCaps: true}, startCodes: ['<cspace=1>'], pattern: 'glitch'
    },
    {
      id: 'upside-down', name: 'UPSIDE DOWN', note: '180° ROTATION + VOID COLOUR', sample: 'ɐuǝɹ∀',
      colours: ['#B9FFEE', '#56D7D2', '#D384FF'],
      formatting: {}, effects: {}, startCodes: ['<rotate=180>', '<cspace=1>']
    }
  ];
  const EFFECTS = [
    {key: 'italic', label: 'ITALIC', hint: 'SLANT TEXT', code: '<i>'},
    {key: 'underline', label: 'UNDERLINE', hint: 'LINE BELOW', code: '<u>'},
    {key: 'strike', label: 'STRIKE', hint: 'LINE THROUGH', code: '<s>'},
    {key: 'allCaps', label: 'ALL CAPS', hint: 'ZERO TAG COST', wholeName: true, inline: false},
    {key: 'smallCaps', label: 'SMALL CAPS', hint: 'EXPERIMENTAL TAG', code: '<smallcaps>', wholeName: true, inline: false},
    {key: 'sup', label: 'SUPERSCRIPT', hint: 'RAISE + SHRINK', code: '<sup>'},
    {key: 'sub', label: 'SUBSCRIPT', hint: 'LOWER + SHRINK', code: '<sub>'},
    {key: 'size', label: 'SIZE', hint: 'GLYPH SCALE', code: '<size=10>', min: 5, max: 29, step: 1, value: 10},
    {key: 'cspace', label: 'CHAR SPACE', hint: 'LETTER GAP', code: '<cspace=5>', min: -20, max: 50, step: .5, value: 5},
    {key: 'rotate', label: 'ROTATE', hint: 'PER-LETTER TILT', code: '<rotate=15>', min: -180, max: 180, step: 1, value: 15},
    {key: 'voffset', label: 'VERT OFFSET', hint: 'MOVE UP / DOWN', code: '<voffset=5>', min: -50, max: 50, step: .5, value: 5},
    {key: 'pos', label: 'POSITION', hint: 'HORIZONTAL START', code: '<pos=40>', min: 0, max: 500, step: 1, value: 40},
    {key: 'br', label: 'LINE BREAK', hint: 'BREAK AT POSITION', code: '<br>', global: null},
    {key: 'mspace', label: 'MONO SPACE', hint: 'FIXED WIDTH', code: '<mspace=1em>', global: null, value: '1em'},
    {key: 'space', label: 'SPACE', hint: 'INSERT SPACING', code: '<space=1em>', global: null, value: '1em'},
    {key: 'mark', label: 'HIGHLIGHT', hint: 'MARK COLOUR', code: '<mark=#FFFF0080>', global: null, value: '#FFFF0080'},
    {key: 'alpha', label: 'ALPHA', hint: 'TEXT OPACITY', code: '<alpha=#80>', global: null, value: '#80'}
  ];
  const FX_GROUPS = [
    {key: 'motion', label: 'MOTION', icon: '↝', note: 'MOVE AND OFFSET', effects: ['voffset', 'pos', 'space', 'br']},
    {key: 'text', label: 'TEXT', icon: 'Aa', note: 'LETTER TREATMENT', effects: ['italic', 'underline', 'strike']},
    {key: 'transform', label: 'TRANSFORM', icon: '↻', note: 'SHAPE AND SCALE', effects: ['size', 'rotate', 'sup', 'sub', 'cspace']},
    {key: 'visual', label: 'VISUAL', icon: '✦', note: 'FINISH AND WIDTH', effects: ['mark', 'alpha', 'mspace']}
  ];
  const EFFECT_BY_KEY = Object.fromEntries(EFFECTS.map((effect) => [effect.key, effect]));
  const $ = (id) => document.getElementById(id);
  const els = {
    instructionsButton: $('instructionsButton'), instructionsPanel: $('instructionsPanel'),
    deckName: $('deckName'), startOver: $('startOver'),
    copyButton: $('copyButton'), copyLabel: $('copyLabel'),
    outputPreview: $('outputPreview'),
    budgetTotal: $('budgetTotal'), budgetText: $('budgetText'), budgetColour: $('budgetColour'),
    budgetFx: $('budgetFx'), outputStatus: $('outputStatus'), colourCount: $('colourCount'),
    effectCount: $('effectCount'), spriteCount: $('spriteCount'), megaTube: $('megaTube'),
    tubeTrack: $('tubeTrack'), tubeFill: $('tubeFill'),
    tubeLayerRail: $('tubeLayerRail'), tubeLayerGuides: $('tubeLayerGuides'),
    tubeCentreMarker: $('tubeCentreMarker'),
    trashDropZone: $('trashDropZone'),
    tubeNameCanvas: $('tubeNameCanvas'),
    dropGuide: $('dropGuide'),
    undoButton: $('undoButton'), redoButton: $('redoButton'), forceGradient: $('forceGradient'),
    clearFxButton: $('clearFxButton'), tubeStatus: $('tubeStatus'), layerInspector: $('layerInspector'),
    colourPicker: $('colourPicker'), colourHex: $('colourHex'), addCustomColour: $('addCustomColour'),
    colourWheel: $('colourWheel'), wheelCursor: $('wheelCursor'),
    colourWheelPreview: $('colourWheelPreview'), colourWheelPreviewHex: $('colourWheelPreviewHex'),
    rotateColours: $('rotateColours'), flipColours: $('flipColours'), savePalette: $('savePalette'),
    savedPalettes: $('savedPalettes'),
    colourSources: $('colourSources'), recentColours: $('recentColours'),
    effectSources: $('effectSources'), spriteSources: $('spriteSources'),
    fxOrbit: $('fxOrbit'), fxOrbitCentre: $('fxOrbitCentre'), fxBackButton: $('fxBackButton'),
    fxOrbitStatus: $('fxOrbitStatus'),
    wubrgComposer: $('wubrgComposer'),
    wubrgContext: $('wubrgContext'), wubrgResults: $('wubrgResults'),
    presetOrbit: $('presetOrbit'), presetOrbitItems: $('presetOrbitItems'),
    presetOrbitCentre: $('presetOrbitCentre'), presetBackButton: $('presetBackButton'),
    presetRenameEditor: $('presetRenameEditor'), presetRenameInput: $('presetRenameInput'),
    presetRenameSave: $('presetRenameSave'), presetRenameCancel: $('presetRenameCancel'),
    presetOrbitStatus: $('presetOrbitStatus'), presetPreviewActions: $('presetPreviewActions'),
    presetKeepButton: $('presetKeepButton'), presetCancelButton: $('presetCancelButton'),
    colourLayerBubble: $('colourLayerBubble'), fxLayerBubble: $('fxLayerBubble'),
    spriteLayerBubble: $('spriteLayerBubble'),
    sourceLibrary: $('sourceLibrary'), choiceCard: $('choiceCard'),
    pendingChoiceBanner: $('pendingChoiceBanner'), pendingChoiceTitle: $('pendingChoiceTitle'),
    toast: $('toast')
  };

  let nextId = 1;
  let history = [];
  let future = [];
  let currentBuild = null;
  let toastTimer = null;
  let previewOverride = null;
  let pendingLayerOffset = null;
  let pendingLayerPosition = null;
  let pendingLayerCategory = null;
  let fxMenuLevel = 'root';
  let fxMenuPage = 0;
  let presetMenuLevel = 'root';
  let presetMenuPage = 0;
  let selectedSavedPresetId = null;
  let stagedPreset = null;
  let state = createDefaultState();
  const spriteAssets = new Map();

  function uid(prefix) {
    return `${prefix}-${Date.now().toString(36)}-${nextId++}`;
  }

  function applySpriteAssetState(element, status) {
    if (!element) return;
    element.classList.toggle('sprite-loading', status === 'loading');
    element.classList.toggle('sprite-loaded', status === 'loaded');
    element.classList.toggle('sprite-error', status === 'error');
  }

  function watchSpriteAsset(element, sprite) {
    const key = Number(sprite);
    let record = spriteAssets.get(key);
    if (!record) {
      const image = new Image();
      record = {status: 'loading', promise: null};
      record.promise = new Promise((resolve) => {
        image.addEventListener('load', () => {
          record.status = 'loaded';
          resolve('loaded');
        }, {once: true});
        image.addEventListener('error', () => {
          record.status = 'error';
          resolve('error');
        }, {once: true});
      });
      image.src = `assets/sprites/${key}.png`;
      spriteAssets.set(key, record);
    }
    applySpriteAssetState(element, record.status);
    record.promise.then((status) => {
      if (element.isConnected) applySpriteAssetState(element, status);
    });
  }

  function makeColours(colours) {
    const source = colours.length ? colours : ['#FFFFFF'];
    return source.slice(0, MAX_COLOURS).map((colour, index) => ({
      id: uid('colour'),
      colour: colour.toUpperCase(),
      position: source.length === 1 ? .5 : index / (source.length - 1)
    }));
  }

  function makeEvenWubrgColours(colours, textLength = DEFAULT_NAME.length) {
    const source = colours.length ? colours : ['#FFFFFF'];
    const length = Math.max(0, Math.floor(Number(textLength) || 0));
    const denominator = Math.max(1, length - 1);
    return source.slice(0, MAX_COLOURS).map((colour, index) => ({
      id: uid('colour'),
      colour: colour.toUpperCase(),
      position: source.length === 1
        ? .5
        : length > 1
          ? Math.floor(index * length / source.length) / denominator
          : index / source.length
    }));
  }

  function createDefaultState() {
    return {
      name: DEFAULT_NAME,
      colours: makeColours([MANA.U.colour, MANA.R.colour, MANA.G.colour]),
      formatting: {italic: false, underline: false, strike: false},
      effects: Logic.normaliseEffects({}),
      events: [],
      caret: DEFAULT_NAME.length,
      selected: null,
      activeTab: null,
      wubrg: [],
      favourites: [],
      savedCompositions: [],
      recentColours: [],
      recentEffects: []
    };
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[character]);
  }

  function snapshot() {
    return clone({
      name: state.name,
      colours: state.colours,
      formatting: state.formatting,
      effects: state.effects,
      events: state.events,
      caret: state.caret,
      selected: state.selected,
      wubrg: state.wubrg,
      favourites: state.favourites,
      savedCompositions: state.savedCompositions,
      recentColours: state.recentColours,
      recentEffects: state.recentEffects
    });
  }

  function restoreSnapshot(saved) {
    Object.assign(state, clone(saved));
    normaliseState();
  }

  function normaliseState() {
    state.name = String(state.name ?? DEFAULT_NAME);
    state.caret = Math.max(0, Math.min(state.name.length, Math.floor(Number(state.caret) || 0)));
    const colours = (Array.isArray(state.colours) ? state.colours : [])
      .filter((stop) => stop && Logic.validHex(stop.colour) && Number.isFinite(Number(stop.position)))
      .map((stop) => ({
        id: stop.id || uid('colour'),
        colour: stop.colour.toUpperCase(),
        position: Math.max(0, Math.min(1, Number(stop.position)))
      }))
      .sort((left, right) => left.position - right.position);
    state.colours = (colours.length ? colours : makeColours(['#FFFFFF'])).slice(0, MAX_COLOURS);
    state.formatting = {
      italic: Boolean(state.formatting?.italic),
      underline: Boolean(state.formatting?.underline),
      strike: Boolean(state.formatting?.strike)
    };
    state.effects = Logic.normaliseEffects(state.effects || {});
    state.events = Logic.normaliseInlineEvents(state.events, state.name.length)
      .filter((event) => !(event.type === 'tag' && String(event.code).toLowerCase() === '<b>'))
      .map((event) => ({
      ...event,
      id: event.id || uid('event'),
      position: Number.isFinite(Number(event.position))
        ? Math.max(0, Math.min(1, Number(event.position)))
        : state.name.length
          ? event.offset / state.name.length
          : 0
    }));
    state.wubrg = Array.isArray(state.wubrg)
      ? state.wubrg.filter((code, index, source) => MANA[code] && source.indexOf(code) === index).slice(0, 5)
      : [];
    state.favourites = (Array.isArray(state.favourites) ? state.favourites : [])
      .filter((entry) => entry && Array.isArray(entry.colours) && entry.colours.some(Logic.validHex))
      .slice(0, 10)
      .map((entry, index) => ({
        name: String(entry.name || `SAVED ${index + 1}`),
        colours: entry.colours.filter(Logic.validHex).slice(0, MAX_COLOURS).map((colour) => colour.toUpperCase())
      }));
    state.savedCompositions = (Array.isArray(state.savedCompositions) ? state.savedCompositions : [])
      .filter((entry) => entry?.composition && Array.isArray(entry.composition.colours))
      .slice(0, 12)
      .map((entry, index) => ({
        id: String(entry.id || uid('saved')),
        name: String(entry.name || `SAVED PRESET ${index + 1}`).slice(0, 48),
        composition: clone(entry.composition)
      }));
    state.recentColours = (Array.isArray(state.recentColours) ? state.recentColours : [])
      .filter(Logic.validHex)
      .map((colour) => colour.toUpperCase())
      .filter((colour, index, source) => source.indexOf(colour) === index)
      .slice(0, 4);
    state.recentEffects = (Array.isArray(state.recentEffects) ? state.recentEffects : [])
      .filter((entry) => entry?.label && entry?.payload?.kind === 'event' && entry.payload.event)
      .slice(0, 4)
      .map((entry) => ({label: String(entry.label), payload: clone(entry.payload)}));
    if (state.selected?.kind === 'colour' && !state.colours.some((stop) => stop.id === state.selected.id)) state.selected = null;
    if (state.selected?.kind === 'event' && !state.events.some((event) => event.id === state.selected.id)) state.selected = null;
  }

  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        version: 2,
        ...snapshot(),
        activeTab: state.activeTab
      }));
    } catch (_) {}
  }

  function restore() {
    let saved = null;
    try {
      saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      if (!saved) {
        const legacy = JSON.parse(localStorage.getItem(LEGACY_STORAGE_KEY) || 'null');
        if (legacy) {
          saved = {
            name: legacy.name || DEFAULT_NAME,
            colours: legacy.gradientStops,
            formatting: legacy.formatting,
            effects: legacy.effects,
            events: legacy.inlineEvents,
            caret: (legacy.name || DEFAULT_NAME).length,
            wubrg: legacy.manaSelection,
            favourites: (legacy.favourites || []).map((entry) => ({
              name: entry.name,
              colours: (entry.stops || []).map((stop) => stop.colour)
            })),
            activeTab: null
          };
        }
      }
    } catch (_) {}
    if (!saved) return;
    state = {...createDefaultState(), ...saved};
    state.activeTab = null;
    normaliseState();
  }

  function mutate(change, message = '') {
    previewOverride = null;
    history.push(snapshot());
    if (history.length > MAX_HISTORY) history.shift();
    future = [];
    change();
    normaliseState();
    persist();
    renderAll();
    if (message) announce(message);
  }

  function undo() {
    if (!history.length) return;
    const libraries = {
      favourites: state.favourites,
      savedCompositions: state.savedCompositions,
      recentColours: state.recentColours,
      recentEffects: state.recentEffects
    };
    future.push(snapshot());
    restoreSnapshot(history.pop());
    Object.assign(state, libraries);
    persist();
    renderAll();
    announce('Undid last change');
  }

  function redo() {
    if (!future.length) return;
    const libraries = {
      favourites: state.favourites,
      savedCompositions: state.savedCompositions,
      recentColours: state.recentColours,
      recentEffects: state.recentEffects
    };
    history.push(snapshot());
    restoreSnapshot(future.pop());
    Object.assign(state, libraries);
    persist();
    renderAll();
    announce('Redid change');
  }

  function announce(message, isError = false) {
    els.toast.textContent = message;
    els.toast.classList.toggle('error', isError);
    els.toast.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => els.toast.classList.remove('visible'), 3600);
  }

  function canonicalIdentity(codes) {
    const unique = Array.from(new Set(codes));
    return MANA_ORDER.filter((code) => unique.includes(code)).join('');
  }

  function identityName(codes) {
    const key = canonicalIdentity(codes);
    if (key.length === 4) return `4 COLOUR (${IDENTITY_NAMES[key] || key})`;
    if (key.length === 5) return '5 COLOUR';
    return IDENTITY_NAMES[key] || (key ? `${key} IDENTITY` : 'CHOOSE COLOURS');
  }

  function identityRecipes() {
    const recipes = [];
    for (let mask = 1; mask < 32; mask += 1) {
      const codes = MANA_ORDER.filter((_, index) => mask & (1 << index));
      const key = canonicalIdentity(codes);
      recipes.push({key, name: IDENTITY_NAMES[key] || key, codes});
    }
    return recipes.sort((left, right) => left.codes.length - right.codes.length || left.name.localeCompare(right.name));
  }

  function effectPayload(key) {
    const definition = EFFECT_BY_KEY[key];
    if (!definition || definition.inline === false) return null;
    if (key === 'br') return {kind: 'event', event: {type: 'br'}};
    if (['italic', 'underline', 'strike', 'sup', 'sub'].includes(key)) {
      return {kind: 'event', event: {type: 'tag', code: definition.code}};
    }
    if (['size', 'cspace', 'rotate', 'voffset', 'pos'].includes(key)) {
      const value = state.effects[key]?.value ?? definition.value;
      return {kind: 'event', event: {type: 'tag', code: `<${key}=${Logic.shortestNumber(value, definition.value)}>`}};
    }
    if (['mspace', 'space', 'mark', 'alpha'].includes(key)) {
      return {kind: 'event', event: {type: 'tag', code: definition.code}};
    }
    return null;
  }

  function eventKey(event) {
    if (event.type === 'sprite') return 'sprite';
    if (event.type === 'br') return 'br';
    const match = String(event.code || '').match(/^<([a-z]+)(?:=|>)/i);
    if (!match) return 'fx';
    return {i: 'italic', u: 'underline', s: 'strike'}[match[1].toLowerCase()] || match[1].toLowerCase();
  }

  function eventLabel(event) {
    if (event.type === 'sprite') return `SPRITE ${event.value}`;
    const key = eventKey(event);
    return EFFECT_BY_KEY[key]?.label || key.toUpperCase();
  }

  function eventValue(event) {
    const match = String(event.code || '').match(/^<[a-z]+=(.+)>$/i);
    return match ? match[1] : '';
  }

  function effectiveState() {
    if (!previewOverride) return state;
    return {
      ...state,
      colours: previewOverride.colours || state.colours,
      formatting: previewOverride.formatting || state.formatting,
      effects: previewOverride.effects || state.effects,
      events: previewOverride.events || state.events
    };
  }

  function activeGlobals(source = state) {
    const entries = [];
    ['allCaps', 'smallCaps'].forEach((key) => {
      if (source.effects[key]) entries.push({key, label: EFFECT_BY_KEY[key].label, code: EFFECT_BY_KEY[key].code || 'Aa→AA'});
    });
    return entries;
  }

  function compile() {
    const source = effectiveState();
    currentBuild = Logic.compileArena({
      text: source.name,
      positionedColours: source.colours.map(({colour, position}) => ({colour, position})),
      formatting: source.formatting,
      effects: source.effects,
      inlineEvents: source.events,
      limit: Logic.LIMIT
    });
    return currentBuild;
  }

  function previewColourAt(build, offset) {
    let colour = build.segments[0]?.colour || '#FFFFFF';
    build.segments.forEach((segment) => {
      if (segment.start <= offset) colour = segment.colour;
    });
    return colour;
  }

  function initialPreviewState(source = effectiveState()) {
    return {
      italic: source.formatting.italic,
      underline: source.formatting.underline,
      strike: source.formatting.strike,
      smallCaps: source.effects.smallCaps,
      sup: source.effects.sup,
      sub: source.effects.sub,
      size: source.effects.size.enabled ? Number(source.effects.size.value) : null,
      cspace: source.effects.cspace.enabled ? Number(source.effects.cspace.value) : null,
      rotate: source.effects.rotate.enabled ? Number(source.effects.rotate.value) : null,
      voffset: source.effects.voffset.enabled ? Number(source.effects.voffset.value) : null,
      pendingPos: source.effects.pos.enabled ? Number(source.effects.pos.value) : null,
      mspace: '',
      mark: '',
      alpha: 1
    };
  }

  function applyPreviewTag(preview, code) {
    const simple = String(code).match(/^<(i|u|s|sup|sub|smallcaps)>$/i);
    if (simple) {
      const key = simple[1].toLowerCase();
      if (key === 'i') preview.italic = true;
      if (key === 'u') preview.underline = true;
      if (key === 's') preview.strike = true;
      if (key === 'smallcaps') preview.smallCaps = true;
      if (key === 'sup') { preview.sup = true; preview.sub = false; }
      if (key === 'sub') { preview.sub = true; preview.sup = false; }
      return;
    }
    const valueTag = String(code).match(/^<([a-z]+)=([^>]+)>$/i);
    if (!valueTag) return;
    const [, rawName, value] = valueTag;
    const name = rawName.toLowerCase();
    if (['size', 'cspace', 'rotate', 'voffset'].includes(name)) preview[name] = Number(value);
    if (name === 'pos') preview.pendingPos = Number(value);
    if (name === 'mspace' || name === 'space') preview.mspace = value;
    if (name === 'mark') preview.mark = value;
    if (name === 'alpha' && /^#[0-9a-f]{2}$/i.test(value)) preview.alpha = Number.parseInt(value.slice(1), 16) / 255;
  }

  function applyGlyphStyles(glyph, preview) {
    glyph.style.color = glyph.dataset.colour;
    if (preview.italic) glyph.style.fontStyle = 'italic';
    const decorations = [preview.underline && 'underline', preview.strike && 'line-through'].filter(Boolean);
    if (decorations.length) glyph.style.textDecoration = decorations.join(' ');
    if (preview.smallCaps) glyph.style.fontVariant = 'small-caps';
    if (Number.isFinite(preview.size)) glyph.style.fontSize = `${Math.max(5, Math.min(29, preview.size))}px`;
    if (Number.isFinite(preview.cspace)) glyph.style.marginRight = `${Math.max(-8, Math.min(18, preview.cspace * .3))}px`;
    if (preview.mspace) glyph.style.minWidth = preview.mspace;
    if (preview.mark) glyph.style.background = preview.mark;
    glyph.style.opacity = String(Math.max(0, Math.min(1, preview.alpha)));
    if (Number.isFinite(preview.pendingPos)) {
      glyph.style.marginLeft = `${Math.max(0, Math.min(80, preview.pendingPos * .15))}px`;
      preview.pendingPos = null;
    }
    const transforms = [];
    if (Number.isFinite(preview.voffset)) transforms.push(`translateY(${-Math.max(-18, Math.min(18, preview.voffset * .45))}px)`);
    if (preview.sup) transforms.push('translateY(-.38em)', 'scale(.75)');
    if (preview.sub) transforms.push('translateY(.3em)', 'scale(.75)');
    if (Number.isFinite(preview.rotate)) transforms.push(`rotate(${Math.max(-180, Math.min(180, preview.rotate))}deg)`);
    if (transforms.length) glyph.style.transform = transforms.join(' ');
  }

  function applySpriteStyles(sprite, preview) {
    if (Number.isFinite(preview.size)) {
      const size = Math.max(12, Math.min(72, preview.size * 2.1));
      sprite.style.width = `${size}px`;
      sprite.style.height = `${size}px`;
      sprite.style.marginBottom = `${Math.max(-15, -size * .24)}px`;
    }
    if (Number.isFinite(preview.cspace)) {
      sprite.style.marginRight = `${Math.max(-8, Math.min(18, preview.cspace * .3))}px`;
    }
    if (preview.mspace) sprite.style.minWidth = preview.mspace;
    if (preview.mark) {
      sprite.style.backgroundColor = preview.mark;
      sprite.style.boxShadow = `0 0 0 3px ${preview.mark}`;
    }
    sprite.style.opacity = String(Math.max(0, Math.min(1, preview.alpha)));
    if (Number.isFinite(preview.pendingPos)) {
      sprite.style.marginLeft = `${Math.max(0, Math.min(80, preview.pendingPos * .15))}px`;
      preview.pendingPos = null;
    }
    const transforms = [];
    if (Number.isFinite(preview.voffset)) transforms.push(`translateY(${-Math.max(-18, Math.min(18, preview.voffset * .45))}px)`);
    if (preview.sup) transforms.push('translateY(-.38em)', 'scale(.75)');
    if (preview.sub) transforms.push('translateY(.3em)', 'scale(.75)');
    if (Number.isFinite(preview.rotate)) transforms.push(`rotate(${Math.max(-180, Math.min(180, preview.rotate))}deg)`);
    if (transforms.length) sprite.style.transform = transforms.join(' ');
  }

  function renderPreview(build, container = els.outputPreview) {
    container.replaceChildren();
    if (!build.text && !build.inlineEvents.length) {
      const empty = document.createElement('span');
      empty.className = 'preview-empty';
      empty.textContent = 'TYPE A DECK NAME';
      container.appendChild(empty);
      return;
    }
    const preview = initialPreviewState();
    const eventsAt = new Map();
    build.inlineEvents.forEach((event) => {
      if (!eventsAt.has(event.offset)) eventsAt.set(event.offset, []);
      eventsAt.get(event.offset).push(event);
    });
    for (let offset = 0; offset <= build.text.length; offset += 1) {
      (eventsAt.get(offset) || []).forEach((event) => {
        if (event.type === 'br') {
          container.appendChild(document.createElement('br'));
        } else if (event.type === 'sprite') {
          const sprite = document.createElement('i');
          sprite.className = 'preview-sprite';
          sprite.dataset.dropOffset = String(offset);
          if (event.id) sprite.dataset.eventId = String(event.id);
          sprite.style.backgroundImage = `var(--arena-sprite-${event.value})`;
          sprite.setAttribute('aria-label', `Sprite ${event.value} at position ${offset}`);
          applySpriteStyles(sprite, preview);
          container.appendChild(sprite);
          watchSpriteAsset(sprite, event.value);
        } else {
          applyPreviewTag(preview, event.code);
        }
      });
      if (offset >= build.text.length) continue;
      const glyph = document.createElement('span');
      glyph.className = 'preview-glyph';
      glyph.dataset.colour = previewColourAt(build, offset);
      glyph.dataset.dropOffset = String(offset);
      glyph.textContent = build.text[offset];
      applyGlyphStyles(glyph, preview);
      container.appendChild(glyph);
    }
    const endTarget = document.createElement('span');
    endTarget.className = 'preview-end-target';
    endTarget.dataset.dropOffset = String(build.text.length);
    endTarget.setAttribute('aria-label', `End of name, position ${build.text.length}`);
    container.appendChild(endTarget);
  }

  function gradientCss() {
    const stops = effectiveState().colours.slice().sort((left, right) => left.position - right.position);
    if (stops.length === 1) return stops[0].colour;
    return `linear-gradient(90deg,${stops.map((stop) => `${stop.colour} ${(stop.position * 100).toFixed(2)}%`).join(',')})`;
  }

  function allowableGradientStops(build = currentBuild) {
    if (!build || state.colours.length < 2) return 0;
    const budgetStops = Math.floor((Logic.LIMIT - build.breakdown.text - build.breakdown.fx) / 6);
    return Math.max(0, Math.min(MAX_COLOURS, Math.max(1, build.text.length || 1), budgetStops));
  }

  function forceGradient() {
    const count = allowableGradientStops();
    if (state.colours.length < 2) {
      announce('Add at least two colours before forcing a gradient', true);
      return;
    }
    if (count < 2) {
      announce('The Arena character budget cannot fit a gradient', true);
      return;
    }
    const sourceStops = state.colours.slice().sort((left, right) => left.position - right.position);
    const blended = Logic.sampleGradientStops(sourceStops, count);
    mutate(() => {
      state.colours = makeColours(blended);
      state.wubrg = [];
      state.selected = null;
    }, `Smooth ${count}-stage gradient created`);
  }

  function renderOutput() {
    const build = compile();
    const fittedSize = Math.max(13, 22 - Math.max(0, state.name.length - 18) * .28);
    els.tubeNameCanvas.style.setProperty('--name-size', `${fittedSize.toFixed(1)}px`);
    renderPreview(build);
    els.budgetText.textContent = String(build.breakdown.text);
    els.budgetColour.textContent = String(build.breakdown.colour);
    els.budgetFx.textContent = String(build.breakdown.fx);
    els.budgetTotal.textContent = String(build.rawLength);
    const over = build.overLimit;
    els.copyButton.disabled = !build.raw;
    els.copyButton.classList.toggle('over-budget', over);
    els.megaTube.classList.toggle('preset-previewing', Boolean(previewOverride));
    els.megaTube.style.setProperty('--budget-progress', `${Math.min(100, build.rawLength / build.limit * 100)}%`);
    els.outputStatus.classList.toggle('error', over);
    els.outputStatus.textContent = over
      ? `${build.rawLength - build.limit} OVER ARENA LIMIT`
      : `${build.limit - build.rawLength} CHARACTERS FREE · ${build.colourStages}/${build.requestedColourStages} COLOURS COMPILED`;
    els.copyLabel.textContent = over ? 'COPY ANYWAY' : '✓ FINISHED';
    els.forceGradient.disabled = state.colours.length < 2 || allowableGradientStops(build) < 2;
    els.forceGradient.title = state.colours.length < 2
      ? 'Add at least two colours first'
      : els.forceGradient.disabled
        ? 'The Arena character budget cannot fit two colour stages'
        : `Blend into ${allowableGradientStops(build)} colour stages`;
    if (build.unsupported.length) els.outputStatus.textContent += ' · CHECK UNSUPPORTED GLYPHS';
  }

  function tubePosition(clientX) {
    const bounds = els.tubeTrack.getBoundingClientRect();
    return Math.max(0, Math.min(1, (clientX - bounds.left) / Math.max(1, bounds.width)));
  }

  function colourPositionFromClientX(clientX) {
    const bounds = els.tubeLayerRail.getBoundingClientRect();
    return Math.max(0, Math.min(1, (clientX - bounds.left) / Math.max(1, bounds.width)));
  }

  function offsetFromPosition(position) {
    return Math.round(Math.max(0, Math.min(1, position)) * state.name.length);
  }

  function positionFromOffset(offset) {
    return state.name.length ? Math.max(0, Math.min(1, offset / state.name.length)) : 0;
  }

  function tubePositionLabel(value) {
    const position = Math.max(0, Math.min(1, Number(value) || 0));
    if (position <= .08) return 'LEFT EDGE';
    if (position < .4) return 'LEFT';
    if (position <= .6) return 'CENTRE';
    if (position < .92) return 'RIGHT';
    return 'RIGHT EDGE';
  }

  function colourPositionFromOffset(offset) {
    if (state.name.length <= 1) return state.name.length ? 1 : .5;
    return Math.max(0, Math.min(1, offset / (state.name.length - 1)));
  }

  function colourCaretPosition() {
    return colourPositionFromOffset(state.caret);
  }

  function colourOffsetFromPosition(position) {
    if (state.name.length <= 1) return 0;
    return Math.max(0, Math.min(state.name.length - 1, Math.round(position * (state.name.length - 1))));
  }

  function railXFromOffset(offset) {
    const railBounds = els.tubeLayerRail.getBoundingClientRect();
    if (!railBounds.width) return positionFromOffset(offset) * 100;
    const exact = els.outputPreview.querySelector(`.preview-glyph[data-drop-offset="${offset}"], .preview-end-target[data-drop-offset="${offset}"]`);
    if (!exact) return positionFromOffset(offset) * railBounds.width;
    const targetBounds = exact.getBoundingClientRect();
    return Math.max(0, Math.min(railBounds.width, targetBounds.left + targetBounds.width / 2 - railBounds.left));
  }

  function railXFromColourPosition(position) {
    const width = els.tubeLayerRail.getBoundingClientRect().width;
    return Math.max(0, Math.min(1, Number(position) || 0)) * width;
  }

  function guideTargetBounds(entry) {
    const offset = String(entry.anchorOffset);
    let targets = [];
    if (entry.anchorTarget === 'sprite') {
      const sprite = Array.from(els.outputPreview.querySelectorAll('.preview-sprite'))
        .find((candidate) => candidate.dataset.eventId === entry.layerId);
      if (sprite) targets = [sprite];
    } else {
      const textTarget = els.outputPreview.querySelector(
        `.preview-glyph[data-drop-offset="${offset}"], .preview-end-target[data-drop-offset="${offset}"]`
      );
      if (entry.kind === 'effect') {
        targets = Array.from(els.outputPreview.querySelectorAll(`.preview-sprite[data-drop-offset="${offset}"]`));
      }
      if (textTarget) targets.push(textTarget);
    }
    if (!targets.length) return null;
    const bounds = targets.map((target) => target.getBoundingClientRect());
    return {
      left: Math.min(...bounds.map((box) => box.left)),
      right: Math.max(...bounds.map((box) => box.right)),
      top: Math.min(...bounds.map((box) => box.top)),
      bottom: Math.max(...bounds.map((box) => box.bottom))
    };
  }

  function addAnchorGuide(entry, laneIndex = 0, laneCount = 1) {
    const targetBounds = guideTargetBounds(entry);
    if (!targetBounds) return;
    const canvasBounds = els.tubeNameCanvas.getBoundingClientRect();
    const tokenBounds = entry.token.getBoundingClientRect();
    const startX = tokenBounds.left + tokenBounds.width / 2 - canvasBounds.left;
    const startY = tokenBounds.top - canvasBounds.top + 2;
    const targetWidth = Math.max(8, targetBounds.right - targetBounds.left);
    const laneRatio = (laneIndex + 1) / (laneCount + 1);
    const endX = targetBounds.left + targetWidth * laneRatio - canvasBounds.left;
    const targetBottom = targetBounds.bottom - canvasBounds.top;
    const railTop = els.tubeLayerRail.getBoundingClientRect().top - canvasBounds.top;
    const endY = Math.min(startY - 6, targetBottom + 8, railTop - 12);
    const deltaX = endX - startX;
    const deltaY = endY - startY;
    const length = Math.hypot(deltaX, deltaY);
    if (length < 8) return;
    const selected = entry.token.classList.contains('selected');
    const guide = document.createElement('i');
    guide.className = `layer-guide guide-${entry.kind}${selected ? ' selected' : ''}`;
    guide.style.left = `${startX.toFixed(1)}px`;
    guide.style.top = `${startY.toFixed(1)}px`;
    guide.style.width = `${length.toFixed(1)}px`;
    guide.style.transform = `rotate(${Math.atan2(deltaY, deltaX)}rad)`;
    els.tubeLayerGuides.appendChild(guide);
    if (selected) {
      const bracket = document.createElement('b');
      bracket.className = `anchor-bracket guide-${entry.kind}`;
      bracket.style.left = `${(targetBounds.left - canvasBounds.left - 2).toFixed(1)}px`;
      bracket.style.top = `${(targetBottom + 3).toFixed(1)}px`;
      bracket.style.width = `${Math.max(12, targetWidth + 4).toFixed(1)}px`;
      els.tubeLayerGuides.appendChild(bracket);
    }
  }

  function layoutRailTokens() {
    const railBounds = els.tubeLayerRail.getBoundingClientRect();
    els.tubeLayerGuides.replaceChildren();
    const tokens = Array.from(els.tubeLayerRail.querySelectorAll('.tube-token'))
      .map((token, sourceIndex) => {
        const kind = token.dataset.layerKind || 'effect';
        const anchor = kind === 'colour'
          ? railXFromColourPosition(Number(token.dataset.anchorPosition || 0))
          : railXFromOffset(Number(token.dataset.anchorOffset || 0));
        const desired = token.hasAttribute('data-visual-position')
          ? railXFromColourPosition(Number(token.dataset.visualPosition || 0))
          : anchor;
        return {
          token,
          kind,
          anchor,
          desired,
          sourceIndex,
          layerId: token.dataset.layerId || '',
          anchorTarget: token.dataset.anchorTarget || 'text',
          anchorOffset: Number(token.dataset.anchorOffset || 0),
          pinned: token.classList.contains('dragging')
        };
      });
    if (!tokens.length || !railBounds.width) return;
    const edge = 18;
    const available = Math.max(1, railBounds.width - edge * 2);
    const gap = Math.min(39, available / Math.max(1, tokens.length - 1));
    const dense = gap < 31;
    const maximum = railBounds.width - edge;
    const dragged = tokens.find((entry) => entry.pinned);
    const ordered = tokens.filter((entry) => !entry.pinned)
      .sort((left, right) => left.desired - right.desired || left.sourceIndex - right.sourceIndex);
    if (dragged) {
      const crossingThreshold = gap / 2;
      const insertionIndex = ordered.filter((entry) => entry.desired < dragged.desired - crossingThreshold).length;
      ordered.splice(insertionIndex, 0, dragged);
    }
    ordered.forEach((entry) => {
      entry.resolved = Math.max(edge, Math.min(maximum, entry.desired));
    });
    if (dragged) {
      const pinnedIndex = ordered.indexOf(dragged);
      dragged.resolved = Math.max(edge, Math.min(maximum, dragged.desired));
      for (let index = pinnedIndex - 1; index >= 0; index -= 1) {
        ordered[index].resolved = Math.min(ordered[index].resolved, ordered[index + 1].resolved - gap);
      }
      for (let index = pinnedIndex + 1; index < ordered.length; index += 1) {
        ordered[index].resolved = Math.max(ordered[index].resolved, ordered[index - 1].resolved + gap);
      }
    } else {
      for (let index = 1; index < ordered.length; index += 1) {
        ordered[index].resolved = Math.max(ordered[index].resolved, ordered[index - 1].resolved + gap);
      }
    }
    if (ordered[ordered.length - 1].resolved > maximum) {
      const shift = ordered[ordered.length - 1].resolved - maximum;
      ordered.forEach((entry) => { entry.resolved -= shift; });
    }
    if (ordered[0].resolved < edge) {
      const shift = edge - ordered[0].resolved;
      ordered.forEach((entry) => { entry.resolved += shift; });
    }
    const guideGroups = new Map();
    ordered.forEach((entry) => {
      entry.token.classList.toggle('dense', dense);
      entry.token.style.left = `${entry.resolved.toFixed(1)}px`;
      const key = entry.anchorTarget === 'sprite' ? `sprite:${entry.layerId}` : `offset:${entry.anchorOffset}`;
      if (!guideGroups.has(key)) guideGroups.set(key, []);
      guideGroups.get(key).push(entry);
    });
    guideGroups.forEach((entries) => {
      entries.forEach((entry, index) => addAnchorGuide(entry, index, entries.length));
    });
  }

  function setCaret(offset, focusInput = false) {
    state.caret = Math.max(0, Math.min(state.name.length, Math.round(offset)));
    if (focusInput) {
      els.deckName.focus({preventScroll: true});
      els.deckName.setSelectionRange(state.caret, state.caret);
    }
    renderCaret();
    persist();
  }

  function renderCaret() {
    const pendingLabel = pendingLayerCategory === 'colours' ? 'COLOUR POINT'
      : pendingLayerCategory === 'sprites' ? 'SPRITE BUBBLE'
        : 'FX BUBBLE';
    const pendingChoice = pendingLayerCategory === 'colours' ? 'CHOOSE A COLOUR'
      : pendingLayerCategory === 'sprites' ? 'CHOOSE A SPRITE'
        : 'CHOOSE AN EFFECT';
    els.tubeStatus.textContent = pendingLayerOffset !== null
      ? `${pendingLabel} LOCKED · ${pendingChoice}`
      : `COLOUR + FX + SPRITE MOVE FREELY · GUIDE LINES SHOW THE COMPILED TEXT POSITION`;
    els.megaTube.classList.toggle('layer-pending', pendingLayerOffset !== null);
    if (pendingLayerCategory) els.megaTube.dataset.pendingCategory = pendingLayerCategory;
    else delete els.megaTube.dataset.pendingCategory;
  }

  function selectLayer(kind, id) {
    cancelPendingLayer();
    state.selected = {kind, id};
    state.activeTab = null;
    if (kind === 'colour') {
      const stop = state.colours.find((candidate) => candidate.id === id);
      if (stop) setColourDraft(stop.colour);
    }
    persist();
    renderOutput();
    renderTube();
    renderInspector();
    setActiveTab(null);
  }

  function clearSelection() {
    state.selected = null;
    persist();
    renderOutput();
    renderTube();
    renderInspector();
    setActiveTab(null);
  }

  function pointerInside(element, clientX, clientY) {
    if (!element || element.hidden) return false;
    const bounds = element.getBoundingClientRect();
    return clientX >= bounds.left && clientX <= bounds.right && clientY >= bounds.top && clientY <= bounds.bottom;
  }

  function setTrashZone(visible, hot = false, available = true) {
    els.trashDropZone.hidden = !visible;
    els.trashDropZone.classList.toggle('hot', visible && hot && available);
    els.trashDropZone.classList.toggle('unavailable', visible && !available);
    const label = els.trashDropZone.querySelector('span');
    if (label) label.textContent = available ? 'DROP TO DELETE' : 'KEEP ONE COLOUR';
  }

  function setLayerDragFocus(active) {
    document.body.classList.toggle('layer-drag-active', Boolean(active));
    els.tubeTrack.classList.toggle('drag-focus', Boolean(active));
  }

  function beginTokenDrag(event, options) {
    if (event.button !== 0) return;
    event.stopPropagation();
    event.preventDefault();
    const before = snapshot();
    const startX = event.clientX;
    const startY = event.clientY;
    let moved = false;
    let dragGhost = null;
    const target = event.currentTarget;
    try { target.setPointerCapture(event.pointerId); } catch (_) {}
    const move = (moveEvent) => {
      if (moveEvent.pointerId !== event.pointerId) return;
      moveEvent.preventDefault();
      if (!moved && Math.hypot(moveEvent.clientX - startX, moveEvent.clientY - startY) < 4) return;
      if (!moved) {
        moved = true;
        target.classList.add('dragging');
        dragGhost = target.cloneNode(true);
        dragGhost.removeAttribute('id');
        dragGhost.classList.remove('selected', 'dragging');
        dragGhost.classList.add('layer-drag-ghost');
        dragGhost.setAttribute('aria-hidden', 'true');
        document.body.appendChild(dragGhost);
        els.megaTube.classList.add('dragging-layer');
        setLayerDragFocus(true);
        setTrashZone(true, false, options.canRemove !== false);
      }
      dragGhost.style.left = `${moveEvent.clientX}px`;
      dragGhost.style.top = `${moveEvent.clientY}px`;
      const overTrash = pointerInside(els.trashDropZone, moveEvent.clientX, moveEvent.clientY);
      setTrashZone(true, overTrash, options.canRemove !== false);
      if (overTrash) {
        showCanvasDropTarget(null);
        setCentreMarker(null, false);
        return;
      }
      const direct = document.elementFromPoint(moveEvent.clientX, moveEvent.clientY);
      const snapTarget = options.kind === 'colour' ? null : canvasTargetFromPoint(moveEvent.clientX, direct);
      const position = colourPositionFromClientX(moveEvent.clientX);
      const offset = options.kind === 'colour'
        ? colourOffsetFromPosition(position)
        : snapTarget
          ? Number(snapTarget.dataset.dropOffset)
          : offsetFromPosition(tubePosition(moveEvent.clientX));
      options.update(position, offset);
      target.dataset.visualPosition = String(position);
      if (options.kind === 'colour') {
        target.dataset.anchorPosition = String(position);
        target.dataset.anchorOffset = String(colourOffsetFromPosition(position));
      } else {
        target.dataset.anchorOffset = String(offset);
      }
      layoutRailTokens();
      showCanvasDropTarget(snapTarget);
      setCentreMarker(position, true);
      renderOutput();
      els.tubeFill.style.background = gradientCss();
    };
    const finish = (finishEvent, cancelled = false) => {
      if (finishEvent.pointerId !== event.pointerId) return;
      const deleteRequested = moved && pointerInside(els.trashDropZone, finishEvent.clientX, finishEvent.clientY);
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', finish);
      document.removeEventListener('pointercancel', cancel);
      try { if (target.hasPointerCapture(event.pointerId)) target.releasePointerCapture(event.pointerId); } catch (_) {}
      dragGhost?.remove();
      target.classList.remove('dragging');
      els.megaTube.classList.remove('dragging-layer');
      setLayerDragFocus(false);
      setTrashZone(false);
      els.dropGuide.classList.remove('visible');
      setCentreMarker(null, false);
      showCanvasDropTarget(null);
      if (!moved) {
        options.select();
        return;
      }
      if (cancelled) {
        restoreSnapshot(before);
      } else if (deleteRequested) {
        if (options.canRemove === false || options.remove?.() === false) {
          restoreSnapshot(before);
          announce('The Mega Tube needs at least one colour', true);
        } else {
          history.push(before);
          if (history.length > MAX_HISTORY) history.shift();
          future = [];
          state.selected = null;
          normaliseState();
          persist();
          announce('Layer deleted');
        }
      } else {
        history.push(before);
        if (history.length > MAX_HISTORY) history.shift();
        future = [];
        options.finish();
        normaliseState();
        persist();
      }
      renderAll();
    };
    const cancel = (cancelEvent) => finish(cancelEvent, true);
    document.addEventListener('pointermove', move, {passive: false});
    document.addEventListener('pointerup', finish);
    document.addEventListener('pointercancel', cancel);
  }

  function colourToken(stop, index, compiling = true) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'tube-token colour-token';
    button.style.setProperty('--token-colour', stop.colour);
    button.dataset.layerId = stop.id;
    const anchorOffset = colourOffsetFromPosition(stop.position);
    button.dataset.layerKind = 'colour';
    button.dataset.anchorPosition = String(stop.position);
    button.dataset.anchorOffset = String(anchorOffset);
    button.classList.toggle('selected', state.selected?.kind === 'colour' && state.selected.id === stop.id);
    button.classList.toggle('ghost', !compiling);
    button.innerHTML = `<span>${index + 1}</span>`;
    button.setAttribute('role', 'slider');
    button.setAttribute('aria-label', `Colour ${index + 1}, ${stop.colour}${compiling ? '' : ', currently omitted by the Arena budget'}. Drag to move; press Enter to edit.`);
    button.setAttribute('aria-valuemin', '0');
    button.setAttribute('aria-valuemax', '100');
    button.setAttribute('aria-valuenow', String(Math.round(stop.position * 100)));
    button.addEventListener('pointerdown', (event) => beginTokenDrag(event, {
      kind: 'colour',
      update: (position) => { stop.position = position; },
      select: () => selectLayer('colour', stop.id),
      finish: () => { state.selected = null; },
      canRemove: state.colours.length > 1,
      remove: () => {
        if (state.colours.length <= 1) return false;
        state.colours = state.colours.filter((candidate) => candidate.id !== stop.id);
        state.wubrg = [];
        return true;
      }
    }));
    button.addEventListener('keydown', (event) => {
      if (['Enter', ' '].includes(event.key)) {
        event.preventDefault();
        selectLayer('colour', stop.id);
        return;
      }
      if (['Delete', 'Backspace'].includes(event.key)) {
        event.preventDefault();
        removeColour(stop.id);
        return;
      }
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End', 'PageUp', 'PageDown'].includes(event.key)) return;
      event.preventDefault();
      const step = event.shiftKey || ['PageUp', 'PageDown'].includes(event.key) ? 5 : 1;
      mutate(() => {
        if (event.key === 'Home') stop.position = 0;
        else if (event.key === 'End') stop.position = 1;
        else {
          const direction = event.key === 'ArrowLeft' || event.key === 'PageDown' ? -1 : 1;
          stop.position = Math.max(0, Math.min(1, stop.position + direction * step / 100));
        }
        state.selected = {kind: 'colour', id: stop.id};
      }, `Moved colour ${index + 1}`);
      requestAnimationFrame(() => document.querySelector(`[data-layer-id="${stop.id}"]`)?.focus());
    });
    return button;
  }

  function eventToken(event) {
    const key = eventKey(event);
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `tube-token effect-token token-${key}`;
    if (event.type === 'sprite') button.classList.add('sprite-token');
    button.dataset.layerKind = event.type === 'sprite' ? 'sprite' : 'effect';
    button.dataset.anchorTarget = event.type === 'sprite' ? 'sprite' : 'text';
    button.dataset.anchorOffset = String(event.offset);
    button.dataset.visualPosition = String(event.position ?? positionFromOffset(event.offset));
    button.dataset.layerId = event.id;
    button.classList.toggle('selected', state.selected?.kind === 'event' && state.selected.id === event.id);
    if (event.type === 'sprite') {
      button.innerHTML = `<i style="background-image:var(--arena-sprite-${event.value})"></i>`;
      watchSpriteAsset(button.querySelector('i'), event.value);
    } else {
      button.innerHTML = `<span>${key === 'br' ? '↵' : (EFFECT_BY_KEY[key]?.label || key).slice(0, 3)}</span>`;
    }
    button.setAttribute('role', 'slider');
    button.setAttribute('aria-label', `${eventLabel(event)} bubble near the ${tubePositionLabel(event.position ?? positionFromOffset(event.offset)).toLowerCase()}, compiled at text position ${event.offset}. Drag to move; press Enter to edit.`);
    button.setAttribute('aria-valuemin', '0');
    button.setAttribute('aria-valuemax', '100');
    button.setAttribute('aria-valuenow', String(Math.round((event.position ?? positionFromOffset(event.offset)) * 100)));
    button.addEventListener('pointerdown', (pointerEvent) => beginTokenDrag(pointerEvent, {
      kind: 'event',
      update: (position, offset) => {
        event.position = position;
        event.offset = offset;
      },
      select: () => selectLayer('event', event.id),
      finish: () => { state.selected = null; },
      canRemove: true,
      remove: () => {
        state.events = state.events.filter((candidate) => candidate.id !== event.id);
        return true;
      }
    }));
    button.addEventListener('keydown', (keyEvent) => {
      if (['Enter', ' '].includes(keyEvent.key)) {
        keyEvent.preventDefault();
        selectLayer('event', event.id);
        return;
      }
      if (['Delete', 'Backspace'].includes(keyEvent.key)) {
        keyEvent.preventDefault();
        removeEvent(event.id);
        return;
      }
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End', 'PageUp', 'PageDown'].includes(keyEvent.key)) return;
      keyEvent.preventDefault();
      const step = keyEvent.shiftKey || ['PageUp', 'PageDown'].includes(keyEvent.key) ? 5 : 1;
      mutate(() => {
        const direction = keyEvent.key === 'ArrowLeft' || keyEvent.key === 'PageDown' ? -1 : 1;
        if (keyEvent.key === 'Home') event.position = 0;
        else if (keyEvent.key === 'End') event.position = 1;
        else event.position = Math.max(0, Math.min(1, (event.position ?? positionFromOffset(event.offset)) + direction * step / 100));
        event.offset = offsetFromPosition(event.position);
        state.selected = {kind: 'event', id: event.id};
      }, `Moved ${eventLabel(event)}`);
      requestAnimationFrame(() => document.querySelector(`[data-layer-id="${event.id}"]`)?.focus());
    });
    return button;
  }

  function renderTube() {
    els.tubeTrack.classList.toggle('selection-focus', Boolean(state.selected));
    els.tubeFill.style.background = gradientCss();
    els.tubeLayerRail.replaceChildren();
    els.tubeLayerGuides.replaceChildren();
    const sortedColours = state.colours.slice().sort((left, right) => left.position - right.position);
    const compilingCount = Math.max(1, Math.min(sortedColours.length, currentBuild?.requestedSegments?.length || sortedColours.length));
    const compilingIndices = new Set(compilingCount === 1
      ? [0]
      : Array.from({length: compilingCount}, (_, index) => Math.round(index * (sortedColours.length - 1) / (compilingCount - 1))));
    sortedColours.forEach((stop, index) => {
      els.tubeLayerRail.appendChild(colourToken(stop, index, compilingIndices.has(index)));
    });
    state.events.forEach((event) => {
      els.tubeLayerRail.appendChild(eventToken(event));
    });
    layoutRailTokens();
    const globals = activeGlobals();
    els.colourCount.textContent = String(state.colours.length);
    els.effectCount.textContent = String(globals.length + state.events.filter((event) => event.type !== 'sprite').length);
    els.spriteCount.textContent = String(state.events.filter((event) => event.type === 'sprite').length);
    els.undoButton.disabled = !history.length;
    els.redoButton.disabled = !future.length;
    els.clearFxButton.disabled = !globals.length && !state.events.some((event) => event.type !== 'sprite');
  }

  function inspectorHeader(kicker, title, code = '') {
    const header = document.createElement('header');
    header.innerHTML = `<span><small>${kicker}</small><b>${title}</b></span>${code ? `<code>${code.replaceAll('<', '&lt;').replaceAll('>', '&gt;')}</code>` : ''}`;
    const done = document.createElement('button');
    done.type = 'button';
    done.className = 'inspector-done';
    done.textContent = '✓';
    done.title = 'Done editing';
    done.setAttribute('aria-label', 'Done editing this layer');
    done.addEventListener('click', clearSelection);
    header.appendChild(done);
    return header;
  }

  function actionButton(label, className, action) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = className;
    button.textContent = label;
    button.addEventListener('click', action);
    return button;
  }

  function openSelectedChoices() {
    if (!state.selected) return;
    renderSources();
    if (state.selected.kind === 'colour') {
      setActiveTab('colours');
      return;
    }
    const selectedEvent = state.events.find((event) => event.id === state.selected.id);
    setActiveTab(selectedEvent?.type === 'sprite' ? 'sprites' : 'effects');
  }

  function createMiniColourWheel(stop, hexInput) {
    const editor = document.createElement('div');
    editor.className = 'mini-colour-editor';
    const wheelWrap = document.createElement('div');
    wheelWrap.className = 'mini-colour-wheel-wrap';
    const canvas = document.createElement('canvas');
    canvas.width = 160;
    canvas.height = 160;
    canvas.className = 'mini-colour-wheel';
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', 'Compact circular colour selector. Drag to change the selected colour.');
    const cursor = document.createElement('i');
    cursor.className = 'mini-wheel-cursor';
    cursor.setAttribute('aria-hidden', 'true');
    wheelWrap.append(canvas, cursor);
    const preview = document.createElement('output');
    preview.className = 'mini-colour-preview';
    preview.setAttribute('aria-live', 'polite');
    const swatch = document.createElement('i');
    swatch.setAttribute('aria-hidden', 'true');
    const previewLabel = document.createElement('small');
    previewLabel.textContent = 'THUMB PREVIEW';
    const previewHex = document.createElement('b');
    preview.append(swatch, previewLabel, previewHex);
    editor.append(wheelWrap, preview);
    drawColourWheel(canvas);
    positionWheelCursor(stop.colour, cursor);
    updateColourPreview(preview, previewHex, stop.colour);

    let before = null;
    let changed = false;
    const applyPoint = (event) => {
      const colour = colourFromWheelEvent(canvas, event);
      stop.colour = colour;
      state.wubrg = [];
      state.selected = {kind: 'colour', id: stop.id};
      hexInput.value = colour;
      positionWheelCursor(colour, cursor);
      updateColourPreview(preview, previewHex, colour);
      previewOverride = null;
      changed = true;
      persist();
      renderOutput();
      renderTube();
    };
    const finish = (event) => {
      if (!before || String(event.pointerId) !== canvas.dataset.pointerId) return;
      const finalColour = stop.colour;
      const didChange = changed;
      try { canvas.releasePointerCapture(event.pointerId); } catch (_) {}
      if (didChange) {
        history.push(before);
        if (history.length > MAX_HISTORY) history.shift();
        future = [];
      }
      before = null;
      delete canvas.dataset.pointerId;
      normaliseState();
      persist();
      renderAll();
      if (didChange) announce(`Colour changed to ${finalColour}`);
    };
    canvas.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      before = snapshot();
      changed = false;
      canvas.dataset.pointerId = String(event.pointerId);
      try { canvas.setPointerCapture(event.pointerId); } catch (_) {}
      applyPoint(event);
    });
    canvas.addEventListener('pointermove', (event) => {
      if (String(event.pointerId) !== canvas.dataset.pointerId) return;
      event.preventDefault();
      applyPoint(event);
    });
    canvas.addEventListener('pointerup', finish);
    canvas.addEventListener('pointercancel', (event) => {
      if (!before || String(event.pointerId) !== canvas.dataset.pointerId) return;
      restoreSnapshot(before);
      before = null;
      delete canvas.dataset.pointerId;
      renderAll();
    });
    return editor;
  }

  function renderColourInspector(stop) {
    const currentPosition = Math.round(stop.position * 100);
    els.layerInspector.replaceChildren(inspectorHeader('COLOUR', stop.colour, 'DRAG TO POSITION'));
    const body = document.createElement('div');
    body.className = 'inspector-controls colour-inspector-controls';
    const hex = document.createElement('input');
    hex.type = 'text';
    hex.value = stop.colour;
    hex.maxLength = 7;
    hex.setAttribute('aria-label', 'Selected colour hex code');
    hex.addEventListener('change', () => {
      const clean = normaliseHex(hex.value);
      if (!clean) {
        hex.setAttribute('aria-invalid', 'true');
        announce('Use a six-digit hex colour', true);
        return;
      }
      mutate(() => {
        stop.colour = clean;
        state.wubrg = [];
        state.selected = {kind: 'colour', id: stop.id};
      }, `Colour changed to ${clean}`);
    });
    const fields = document.createElement('div');
    fields.className = 'inspector-fields colour-inspector-fields';
    fields.append(
      createMiniColourWheel(stop, hex),
      labelledControl('HEX', hex),
      draggableRange('TUBE POSITION', currentPosition, 0, 100, 1, (position) => {
        stop.position = position / 100;
        state.wubrg = [];
        state.selected = {kind: 'colour', id: stop.id};
      }, () => `Colour moved to the ${tubePositionLabel(stop.position)}`, (position) => tubePositionLabel(position / 100))
    );
    const actions = document.createElement('div');
    actions.className = 'inspector-actions';
    actions.append(
      actionButton('OPEN FULL WHEEL', 'more-choices-button', openSelectedChoices),
      actionButton('DUPLICATE', 'quiet-button', () => duplicateColour(stop.id)),
      actionButton('DELETE', 'delete-button', () => removeColour(stop.id))
    );
    body.append(fields, actions);
    els.layerInspector.appendChild(body);
  }

  function labelledControl(label, control) {
    const wrap = document.createElement('label');
    const span = document.createElement('span');
    span.textContent = label;
    wrap.append(span, control);
    return wrap;
  }

  function draggableRange(label, value, minimum, maximum, step, apply, message, format = String) {
    const wrap = document.createElement('label');
    wrap.className = 'drag-value-control';
    const heading = document.createElement('span');
    heading.textContent = label;
    const row = document.createElement('span');
    row.className = 'drag-value-row';
    const range = document.createElement('input');
    range.type = 'range';
    range.min = String(minimum);
    range.max = String(maximum);
    range.step = String(step);
    range.value = String(value);
    range.setAttribute('aria-label', `${label}. Drag to adjust.`);
    const readout = document.createElement('output');
    const setReadout = () => {
      const next = Number(range.value);
      const progress = (next - minimum) / Math.max(1, maximum - minimum);
      range.style.setProperty('--range-progress', `${Math.max(0, Math.min(1, progress)) * 100}%`);
      readout.value = format(next);
      readout.textContent = format(next);
    };
    let before = null;
    const begin = () => {
      if (!before) before = snapshot();
    };
    range.addEventListener('pointerdown', begin);
    range.addEventListener('keydown', (event) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown'].includes(event.key)) begin();
    });
    range.addEventListener('input', () => {
      begin();
      const next = Number(range.value);
      apply(next);
      previewOverride = null;
      setReadout();
      persist();
      renderOutput();
      renderTube();
    });
    range.addEventListener('change', () => {
      if (!before) return;
      history.push(before);
      if (history.length > MAX_HISTORY) history.shift();
      future = [];
      before = null;
      normaliseState();
      persist();
      const next = Number(range.value);
      renderAll();
      announce(typeof message === 'function' ? message(next) : message);
    });
    setReadout();
    row.append(range, readout);
    wrap.append(heading, row);
    return wrap;
  }

  function renderEventInspector(event) {
    const key = eventKey(event);
    const definition = EFFECT_BY_KEY[key];
    els.layerInspector.replaceChildren(inspectorHeader(
      event.type === 'sprite' ? `SPRITE · COMPILES AT ${event.offset}` : `FX · COMPILES AT ${event.offset}`,
      eventLabel(event),
      event.code || `<sprite=${event.value}>`
    ));
    const body = document.createElement('div');
    body.className = 'inspector-controls';
    const fields = document.createElement('div');
    fields.className = 'inspector-fields';
    if (event.type === 'sprite') {
      const spriteSelect = document.createElement('select');
      Array.from({length: 16}, (_, sprite) => {
        const option = document.createElement('option');
        option.value = String(sprite);
        option.textContent = `Sprite ${sprite}`;
        option.selected = Number(event.value) === sprite;
        spriteSelect.appendChild(option);
      });
      spriteSelect.addEventListener('change', () => mutate(() => {
        event.value = Number(spriteSelect.value);
        state.selected = {kind: 'event', id: event.id};
      }, `Changed to sprite ${spriteSelect.value}`));
      fields.appendChild(labelledControl('SPRITE', spriteSelect));
    } else if (definition && ['size', 'cspace', 'rotate', 'voffset', 'pos'].includes(key)) {
      fields.appendChild(draggableRange(
        'VALUE',
        Number(eventValue(event)),
        definition.min,
        definition.max,
        definition.step,
        (next) => {
          const safe = Math.max(definition.min, Math.min(definition.max, next));
          event.code = `<${key}=${Logic.shortestNumber(safe, definition.value)}>`;
          state.selected = {kind: 'event', id: event.id};
        },
        () => `${definition.label} updated`,
        (next) => String(Logic.shortestNumber(next, definition.value))
      ));
    } else if (definition && ['mspace', 'space', 'mark', 'alpha'].includes(key)) {
      const value = document.createElement('input');
      value.type = 'text';
      value.value = eventValue(event);
      value.addEventListener('change', () => mutate(() => {
        event.code = `<${key}=${value.value.trim()}>`;
        state.selected = {kind: 'event', id: event.id};
      }, `${definition.label} updated`));
      fields.appendChild(labelledControl('VALUE', value));
    }
    if (event.type !== 'sprite' && !fields.children.length) {
      const note = document.createElement('p');
      note.className = 'inspector-note';
      note.textContent = 'ACTIVE FROM THIS POINT TO THE END OF THE NAME';
      fields.appendChild(note);
    }
    const visualPercent = Math.round((event.position ?? positionFromOffset(event.offset)) * 100);
    fields.appendChild(draggableRange(
      'TUBE POSITION',
      visualPercent,
      0,
      100,
      1,
      (percent) => {
        event.position = percent / 100;
        event.offset = offsetFromPosition(event.position);
        state.selected = {kind: 'event', id: event.id};
      },
      () => `${eventLabel(event)} bubble moved to the ${tubePositionLabel(event.position)}`,
      (position) => tubePositionLabel(position / 100)
    ));
    const actions = document.createElement('div');
    actions.className = 'inspector-actions';
    actions.append(
      actionButton(event.type === 'sprite' ? 'CHANGE SPRITE' : 'CHANGE FX', 'more-choices-button', openSelectedChoices),
      actionButton('DUPLICATE', 'quiet-button', () => duplicateEvent(event.id)),
      actionButton('DELETE', 'delete-button', () => removeEvent(event.id))
    );
    body.append(fields, actions);
    els.layerInspector.appendChild(body);
  }

  function globalEnabled(key) {
    const definition = EFFECT_BY_KEY[key];
    if (!definition?.wholeName) return false;
    return Boolean(state.effects[key]);
  }

  function toggleGlobal(key, force) {
    const definition = EFFECT_BY_KEY[key];
    if (!definition?.wholeName) return;
    const next = force === undefined ? !globalEnabled(key) : Boolean(force);
    state.effects[key] = next;
  }

  function renderWholeNameToggles() {
    document.querySelectorAll('[data-global-toggle]').forEach((button) => {
      const key = button.dataset.globalToggle;
      button.setAttribute('aria-pressed', String(globalEnabled(key)));
    });
  }

  function renderInspector() {
    const selected = state.selected;
    const canUseColour = pendingLayerCategory === 'colours' || selected?.kind === 'colour';
    els.addCustomColour.disabled = !canUseColour;
    els.addCustomColour.textContent = pendingLayerCategory === 'colours'
      ? 'USE COLOUR HERE'
      : selected?.kind === 'colour'
        ? 'APPLY TO SELECTED'
        : 'DROP COLOUR FIRST';
    els.layerInspector.hidden = !selected;
    if (!selected) {
      els.layerInspector.replaceChildren();
      return;
    }
    if (selected.kind === 'colour') {
      const stop = state.colours.find((candidate) => candidate.id === selected.id);
      if (stop) return renderColourInspector(stop);
    }
    if (selected.kind === 'event') {
      const event = state.events.find((candidate) => candidate.id === selected.id);
      if (event) return renderEventInspector(event);
    }
    state.selected = null;
    renderInspector();
  }

  function normaliseHex(value) {
    const text = String(value || '').trim();
    const prefixed = text.startsWith('#') ? text : `#${text}`;
    return Logic.validHex(prefixed) ? prefixed.toUpperCase() : '';
  }

  function addColour(colour, position = colourCaretPosition()) {
    const clean = normaliseHex(colour);
    if (!clean) {
      announce('Use a six-digit hex colour', true);
      return;
    }
    if (state.colours.length >= MAX_COLOURS) {
      announce(`The colour layer is full (${MAX_COLOURS} maximum)`, true);
      return;
    }
    const newStop = {id: uid('colour'), colour: clean, position: Math.max(0, Math.min(1, position))};
    mutate(() => {
      state.colours.push(newStop);
      state.selected = null;
      state.wubrg = [];
    }, `${clean} added`);
  }

  function removeColour(id) {
    if (state.colours.length <= 1) {
      announce('The Mega Tube needs at least one colour', true);
      return;
    }
    mutate(() => {
      state.colours = state.colours.filter((stop) => stop.id !== id);
      state.selected = null;
      state.wubrg = [];
      state.activeTab = null;
    }, 'Colour layer deleted');
  }

  function duplicateColour(id) {
    const source = state.colours.find((stop) => stop.id === id);
    if (!source) return;
    if (state.colours.length >= MAX_COLOURS) {
      announce(`The colour layer is full (${MAX_COLOURS} maximum)`, true);
      return;
    }
    const copy = {...source, id: uid('colour'), position: Math.min(1, source.position + .08)};
    mutate(() => {
      state.colours.push(copy);
      state.selected = {kind: 'colour', id: copy.id};
      state.wubrg = [];
    }, 'Colour layer duplicated');
  }

  function beginLayerSelection(category, offset, position = null) {
    const safeOffset = Math.max(0, Math.min(state.name.length, Math.round(offset)));
    pendingLayerOffset = safeOffset;
    pendingLayerPosition = Math.max(0, Math.min(1, position ?? (
      category === 'colours' ? colourPositionFromOffset(safeOffset) : positionFromOffset(safeOffset)
    )));
    pendingLayerCategory = category;
    state.selected = null;
    const isColour = category === 'colours';
    const isSprite = category === 'sprites';
    const sourceName = isColour ? 'Colour' : isSprite ? 'Sprite' : 'FX';
    const choiceName = isColour ? 'COLOUR' : isSprite ? 'SPRITE' : 'EFFECT';
    els.pendingChoiceTitle.textContent = `PICK ${isSprite || isColour ? 'A' : 'AN'} ${choiceName} TO PLACE THIS BUBBLE`;
    renderInspector();
    setCaret(safeOffset, false);
    setActiveTab(category);
    announce(isColour
      ? 'Colour point locked — choose a colour'
      : `${sourceName} bubble locked — choose ${isSprite ? 'a sprite' : 'an effect'}`);
  }

  function cancelPendingLayer() {
    pendingLayerOffset = null;
    pendingLayerPosition = null;
    pendingLayerCategory = null;
    els.pendingChoiceBanner.hidden = true;
    els.sourceLibrary.classList.remove('pending-choice');
    document.body.classList.remove('layer-choice-open');
    renderCaret();
  }

  function selectSourcePayload(payload, label) {
    if (pendingLayerOffset !== null) {
      const offset = pendingLayerOffset;
      const position = pendingLayerPosition;
      rememberSourcePayload(payload, label);
      cancelPendingLayer();
      state.activeTab = null;
      placePayloadAtOffset(payload, offset, position);
      setActiveTab(null);
      els.tubeNameCanvas.scrollIntoView?.({block: 'nearest', behavior: 'smooth'});
      return;
    }
    if (payload.kind === 'colour' && state.selected?.kind === 'colour') {
      const stop = state.colours.find((candidate) => candidate.id === state.selected.id);
      if (!stop) return;
      rememberSourcePayload(payload, label);
      state.activeTab = null;
      mutate(() => {
        stop.colour = normaliseHex(payload.colour);
        state.wubrg = [];
      }, `${label} applied to the selected colour layer`);
      setActiveTab(null);
      return;
    }
    if (payload.kind === 'event' && state.selected?.kind === 'event') {
      const selected = state.events.find((event) => event.id === state.selected.id);
      if (!selected) return;
      rememberSourcePayload(payload, label);
      const replacement = {
        ...clone(payload.event),
        id: selected.id,
        offset: selected.offset,
        position: selected.position,
        sequence: selected.sequence
      };
      state.activeTab = null;
      mutate(() => {
        state.events = state.events.map((event) => event.id === selected.id ? replacement : event);
        state.selected = {kind: 'event', id: replacement.id};
      }, `${label} replaced the selected layer`);
      setActiveTab(null);
      return;
    }
    const sourceName = payload.kind === 'colour' ? 'Colour'
      : payload.event?.type === 'sprite' ? 'Sprite'
        : 'FX';
    announce(`Drag the ${sourceName} bubble onto the name first`, true);
  }

  function insertPayload(payload, offset = state.caret, position = null) {
    if (!payload) return;
    if (payload.kind === 'reservoir') {
      beginLayerSelection(payload.category, offset);
      return;
    }
    if (payload.kind === 'colour') {
      addColour(payload.colour, position ?? colourCaretPosition());
      return;
    }
    const event = {
      ...payload.event,
      id: uid('event'),
      offset: Math.max(0, Math.min(state.name.length, Math.round(offset))),
      position: Math.max(0, Math.min(1, position ?? positionFromOffset(offset))),
      sequence: state.events.reduce((highest, item) => Math.max(highest, Number(item.sequence) || 0), 0) + 1
    };
    mutate(() => {
      state.events.push(event);
      state.selected = null;
    }, `${eventLabel(event)} layered at position ${event.offset}`);
  }

  function removeEvent(id) {
    mutate(() => {
      state.events = state.events.filter((event) => event.id !== id);
      state.selected = null;
      state.activeTab = null;
    }, 'Effect layer deleted');
  }

  function duplicateEvent(id) {
    const source = state.events.find((event) => event.id === id);
    if (!source) return;
    const copy = {
      ...source,
      id: uid('event'),
      offset: Math.min(state.name.length, source.offset + 1),
      position: Math.min(1, (source.position ?? positionFromOffset(source.offset)) + .05),
      sequence: state.events.reduce((highest, item) => Math.max(highest, Number(item.sequence) || 0), 0) + 1
    };
    mutate(() => {
      state.events.push(copy);
      state.selected = {kind: 'event', id: copy.id};
    }, `${eventLabel(copy)} duplicated`);
  }

  function placePayloadAtOffset(payload, offset, position = null) {
    if (!payload) return;
    const safeOffset = Math.max(0, Math.min(state.name.length, Math.round(offset)));
    const visualPosition = position === null
      ? payload.kind === 'colour' ? colourPositionFromOffset(safeOffset) : positionFromOffset(safeOffset)
      : Math.max(0, Math.min(1, position));
    setCaret(safeOffset, false);
    insertPayload(payload, safeOffset, visualPosition);
  }

  function enableReservoirDrag(element, payload) {
    const sourceName = payload.category === 'colours' ? 'Colour'
      : payload.category === 'sprites' ? 'Sprite'
        : 'FX';
    element.addEventListener('keydown', (event) => {
      if (!['Enter', ' '].includes(event.key)) return;
      event.preventDefault();
      cancelPendingLayer();
      setActiveTab(null);
      beginLayerSelection(payload.category, state.caret);
    });
    element.addEventListener('pointerdown', (event) => {
      if (event.button !== 0) return;
      event.preventDefault();
      cancelPendingLayer();
      setActiveTab(null);
      const startX = event.clientX;
      const startY = event.clientY;
      let moved = false;
      let ghost = null;
      try { element.setPointerCapture(event.pointerId); } catch (_) {}
      const move = (moveEvent) => {
        if (moveEvent.pointerId !== event.pointerId) return;
        moveEvent.preventDefault();
        if (!moved && Math.hypot(moveEvent.clientX - startX, moveEvent.clientY - startY) < 5) return;
        if (!moved) {
          moved = true;
          ghost = element.cloneNode(true);
          ghost.removeAttribute('id');
          ghost.classList.add('reservoir-ghost');
          ghost.setAttribute('aria-hidden', 'true');
          document.body.appendChild(ghost);
          element.classList.add('dragging');
          els.megaTube.classList.add('source-dragging');
          setLayerDragFocus(true);
        }
        ghost.style.left = `${moveEvent.clientX}px`;
        ghost.style.top = `${moveEvent.clientY}px`;
        const bounds = els.tubeTrack.getBoundingClientRect();
        const inside = moveEvent.clientX >= bounds.left && moveEvent.clientX <= bounds.right &&
          moveEvent.clientY >= bounds.top && moveEvent.clientY <= bounds.bottom;
        if (!inside) {
          showCanvasDropTarget(null);
          setCentreMarker(null, false);
          els.dropGuide.classList.remove('visible');
          els.megaTube.classList.remove('drop-ready');
          return;
        }
        const direct = document.elementFromPoint(moveEvent.clientX, moveEvent.clientY);
        const target = payload.category === 'colours' ? null : canvasTargetFromPoint(moveEvent.clientX, direct);
        const visualPosition = colourPositionFromClientX(moveEvent.clientX);
        const offset = payload.category === 'colours'
          ? colourOffsetFromPosition(visualPosition)
          : target
            ? Number(target.dataset.dropOffset)
            : offsetFromPosition(tubePosition(moveEvent.clientX));
        if (target) {
          showCanvasDropTarget(target);
        } else {
          const canvasBounds = els.tubeNameCanvas.getBoundingClientRect();
          els.dropGuide.style.left = `${Math.max(0, Math.min(canvasBounds.width, moveEvent.clientX - canvasBounds.left))}px`;
          els.dropGuide.classList.add('visible');
        }
        setCentreMarker(visualPosition, true);
        els.megaTube.classList.add('drop-ready');
      };
      const cleanup = () => {
        document.removeEventListener('pointermove', move);
        document.removeEventListener('pointerup', finish);
        document.removeEventListener('pointercancel', cancel);
        try { if (element.hasPointerCapture(event.pointerId)) element.releasePointerCapture(event.pointerId); } catch (_) {}
        ghost?.remove();
        element.classList.remove('dragging');
        els.megaTube.classList.remove('source-dragging', 'drop-ready');
        setLayerDragFocus(false);
        showCanvasDropTarget(null);
        setCentreMarker(null, false);
        els.dropGuide.classList.remove('visible');
      };
      const finish = (finishEvent) => {
        if (finishEvent.pointerId !== event.pointerId) return;
        cleanup();
        if (!moved) {
          announce(`Drag the ${sourceName} bubble onto the name`);
          return;
        }
        const bounds = els.tubeTrack.getBoundingClientRect();
        const inside = finishEvent.clientX >= bounds.left && finishEvent.clientX <= bounds.right &&
          finishEvent.clientY >= bounds.top && finishEvent.clientY <= bounds.bottom;
        if (!inside) {
          announce('Drop the bubble inside the Mega Tube', true);
          return;
        }
        const direct = document.elementFromPoint(finishEvent.clientX, finishEvent.clientY);
        const target = payload.category === 'colours' ? null : canvasTargetFromPoint(finishEvent.clientX, direct);
        const visualPosition = colourPositionFromClientX(finishEvent.clientX);
        const offset = payload.category === 'colours'
          ? colourOffsetFromPosition(visualPosition)
          : target
            ? Number(target.dataset.dropOffset)
            : offsetFromPosition(tubePosition(finishEvent.clientX));
        beginLayerSelection(payload.category, offset, visualPosition);
      };
      const cancel = (cancelEvent) => {
        if (cancelEvent.pointerId !== event.pointerId) return;
        cleanup();
      };
      document.addEventListener('pointermove', move, {passive: false});
      document.addEventListener('pointerup', finish);
      document.addEventListener('pointercancel', cancel);
    });
  }

  function hslToHex(hue, saturation, lightness) {
    const h = ((Number(hue) % 360) + 360) % 360 / 360;
    const s = Math.max(0, Math.min(1, Number(saturation)));
    const l = Math.max(0, Math.min(1, Number(lightness)));
    const channel = (offset) => {
      const k = (offset + h * 12) % 12;
      const a = s * Math.min(l, 1 - l);
      return Math.round(255 * (l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))));
    };
    return `#${[channel(0), channel(8), channel(4)].map((value) => value.toString(16).padStart(2, '0')).join('').toUpperCase()}`;
  }

  function hexToHsl(hex) {
    const clean = normaliseHex(hex) || '#FFFFFF';
    const [red, green, blue] = [1, 3, 5].map((index) => Number.parseInt(clean.slice(index, index + 2), 16) / 255);
    const maximum = Math.max(red, green, blue);
    const minimum = Math.min(red, green, blue);
    const lightness = (maximum + minimum) / 2;
    const delta = maximum - minimum;
    if (!delta) return {hue: 0, saturation: 0, lightness};
    const saturation = delta / (1 - Math.abs(2 * lightness - 1));
    let hue = maximum === red
      ? 60 * (((green - blue) / delta) % 6)
      : maximum === green
        ? 60 * ((blue - red) / delta + 2)
        : 60 * ((red - green) / delta + 4);
    if (hue < 0) hue += 360;
    return {hue, saturation, lightness};
  }

  function wheelColourAt(x, y, diameter = els.colourWheel.width) {
    const radius = diameter / 2;
    const dx = x - radius;
    const dy = y - radius;
    const distance = Math.min(1, Math.hypot(dx, dy) / radius);
    const hue = (Math.atan2(dy, dx) * 180 / Math.PI + 360) % 360;
    if (distance <= .72) {
      const intensity = distance / .72;
      return hslToHex(hue, intensity, 1 - intensity * .5);
    }
    return hslToHex(hue, 1, Math.max(0, .5 * (1 - (distance - .72) / .28)));
  }

  function drawColourWheel(canvas = els.colourWheel) {
    const context = canvas.getContext('2d', {alpha: true});
    const image = context.createImageData(canvas.width, canvas.height);
    const radius = canvas.width / 2;
    for (let y = 0; y < canvas.height; y += 1) {
      for (let x = 0; x < canvas.width; x += 1) {
        const distance = Math.hypot(x - radius, y - radius);
        const index = (y * canvas.width + x) * 4;
        if (distance > radius) {
          image.data[index + 3] = 0;
          continue;
        }
        const colour = wheelColourAt(x, y, canvas.width);
        image.data[index] = Number.parseInt(colour.slice(1, 3), 16);
        image.data[index + 1] = Number.parseInt(colour.slice(3, 5), 16);
        image.data[index + 2] = Number.parseInt(colour.slice(5, 7), 16);
        image.data[index + 3] = 255;
      }
    }
    context.putImageData(image, 0, 0);
  }

  function positionWheelCursor(colour, cursor = els.wheelCursor) {
    const hsl = hexToHsl(colour);
    const distance = hsl.lightness < .5
      ? .72 + (1 - hsl.lightness / .5) * .28
      : Math.min(.72, Math.max(hsl.saturation, (1 - hsl.lightness) * 2) * .72);
    const radians = hsl.hue * Math.PI / 180;
    cursor.style.left = `${50 + Math.cos(radians) * distance * 50}%`;
    cursor.style.top = `${50 + Math.sin(radians) * distance * 50}%`;
    cursor.style.setProperty('--cursor-colour', colour);
  }

  function colourFromWheelEvent(canvas, event) {
    const bounds = canvas.getBoundingClientRect();
    const scaleX = canvas.width / Math.max(1, bounds.width);
    const scaleY = canvas.height / Math.max(1, bounds.height);
    const radius = canvas.width / 2;
    let x = (event.clientX - bounds.left) * scaleX;
    let y = (event.clientY - bounds.top) * scaleY;
    const dx = x - radius;
    const dy = y - radius;
    const distance = Math.hypot(dx, dy);
    if (distance > radius) {
      x = radius + dx / distance * radius;
      y = radius + dy / distance * radius;
    }
    return wheelColourAt(x, y, canvas.width);
  }

  function updateColourPreview(output, hexOutput, colour) {
    output.style.setProperty('--preview-colour', colour);
    hexOutput.textContent = colour;
  }

  function setColourDraft(colour) {
    const clean = normaliseHex(colour);
    if (!clean) return false;
    els.colourHex.value = clean;
    els.colourPicker.value = clean;
    positionWheelCursor(clean);
    updateColourPreview(els.colourWheelPreview, els.colourWheelPreviewHex, clean);
    return true;
  }

  function setPreview(override) {
    previewOverride = override;
    renderOutput();
    els.tubeFill.style.background = gradientCss();
  }

  function clearPreview() {
    if (!previewOverride) return;
    previewOverride = null;
    renderOutput();
    els.tubeFill.style.background = gradientCss();
  }

  function previewColours(colours) {
    const source = colours.filter(Logic.validHex);
    setPreview({
      colours: source.map((colour, index) => ({
        id: `preview-${index}`,
        colour: colour.toUpperCase(),
        position: source.length === 1 ? .5 : index / (source.length - 1)
      }))
    });
  }

  function previewEvenWubrgColours(colours) {
    setPreview({colours: makeEvenWubrgColours(colours, state.name.length)});
  }

  function previewStyle(preset) {
    const sprites = state.events.filter((event) => event.type === 'sprite');
    setPreview({
      colours: preset.colours ? makeColours(preset.colours) : state.colours,
      formatting: {italic: false, underline: false, strike: false, ...clone(preset.formatting)},
      effects: Logic.normaliseEffects(clone(preset.effects)),
      events: [...sprites, ...styledPresetEvents(preset)]
    });
  }

  function previewComposition(entry) {
    const composition = entry?.composition;
    if (!composition) return;
    setPreview({
      colours: clone(composition.colours),
      formatting: clone(composition.formatting),
      effects: clone(composition.effects),
      events: clone(composition.events)
    });
  }

  function stageColourPreset(preset) {
    stagedPreset = {kind: 'colour', key: `colour:${preset.name}`, label: preset.name, colours: clone(preset.colours)};
    previewColours(preset.colours);
    renderPresetMenu();
  }

  function stageSpecialPreset(preset) {
    stagedPreset = {kind: 'special', key: `special:${preset.id}`, label: preset.name, presetId: preset.id};
    previewStyle(preset);
    renderPresetMenu();
  }

  function stageSavedPreset(entry) {
    stagedPreset = {kind: 'saved', key: `saved:${entry.id}`, label: entry.name, savedId: entry.id};
    previewComposition(entry);
    renderPresetMenu();
  }

  function keepStagedPreset() {
    const selection = stagedPreset;
    stagedPreset = null;
    if (!selection) {
      clearPreview();
      setActiveTab(null);
      return;
    }
    if (selection.kind === 'colour') {
      applyColourRecipe(selection.colours, selection.label);
      return;
    }
    if (selection.kind === 'special') {
      const preset = STYLE_PRESETS.find((candidate) => candidate.id === selection.presetId);
      if (preset) applySpecialPreset(preset);
      else {
        clearPreview();
        setActiveTab(null);
      }
      return;
    }
    const saved = state.savedCompositions.find((entry) => entry.id === selection.savedId);
    if (saved) loadSavedComposition(saved);
    else {
      clearPreview();
      setActiveTab(null);
    }
  }

  function cancelPresetPreview() {
    const hadPreview = Boolean(stagedPreset);
    stagedPreset = null;
    clearPreview();
    setActiveTab(null);
    if (hadPreview) announce('Preset preview cancelled');
  }

  function closePresetMenu({keep = true} = {}) {
    if (keep) keepStagedPreset();
    else cancelPresetPreview();
  }

  function styledPresetEvents(preset) {
    const length = state.name.length;
    const offset = (fraction) => Math.max(0, Math.min(length, Math.round(length * fraction)));
    const steps = [];
    const push = (fraction, ...codes) => {
      codes.forEach((code) => steps.push({offset: offset(fraction), code}));
    };
    push(0, ...(preset.startCodes || []));
    if (preset.pattern === 'bubbles') {
      push(.34, '<size=18>');
      push(.68, '<size=11>');
    } else if (preset.pattern === 'drift') {
      push(.48, '<size=11>');
      push(.72, '<voffset=7>');
    } else if (preset.pattern === 'glitch') {
      push(.42, '<rotate=-7>');
      push(.7, '<voffset=3>');
    }
    return steps.map((step, index) => ({
      id: `styled-${preset.id}-${index}`,
      type: 'tag',
      code: step.code,
      offset: step.offset,
      sequence: 1000 + index,
      source: 'stylized-preset',
      presetId: preset.id
    }));
  }

  function attachPresetPreview(button, enter, leave = clearPreview) {
    button.addEventListener('pointerenter', enter);
    button.addEventListener('focus', enter);
    button.addEventListener('pointerleave', leave);
    button.addEventListener('blur', leave);
  }

  function renderSavedPalettes() {
    els.savedPalettes.replaceChildren();
    if (!state.favourites.length) {
      const empty = document.createElement('p');
      empty.className = 'empty-saved';
      empty.textContent = 'NO SAVED PALETTES YET';
      els.savedPalettes.appendChild(empty);
      return;
    }
    state.favourites.forEach((entry, index) => {
      const card = document.createElement('div');
      card.className = 'saved-palette';
      const apply = document.createElement('button');
      apply.type = 'button';
      apply.innerHTML = `<i style="background:${gradientFromColours(entry.colours)}"></i><span><b>${entry.name}</b><small>${entry.colours.length} COLOURS</small></span>`;
      attachPresetPreview(apply, () => previewColours(entry.colours));
      apply.addEventListener('click', () => applyColourRecipe(entry.colours, entry.name));
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'remove-saved';
      remove.textContent = '×';
      remove.setAttribute('aria-label', `Delete ${entry.name}`);
      remove.addEventListener('click', () => {
        state.favourites.splice(index, 1);
        persist();
        renderSavedPalettes();
        announce(`${entry.name} deleted`);
      });
      card.append(apply, remove);
      els.savedPalettes.appendChild(card);
    });
  }

  function currentComposition() {
    return clone({
      name: state.name,
      colours: state.colours,
      formatting: state.formatting,
      effects: state.effects,
      events: state.events,
      caret: state.caret
    });
  }

  function compositionSignature(composition) {
    return JSON.stringify({
      name: composition.name,
      colours: composition.colours?.map(({colour, position}) => ({colour, position})),
      formatting: composition.formatting,
      effects: composition.effects,
      events: composition.events?.map(({type, code, value, offset, position, sequence}) => ({
        type, code, value, offset, position, sequence
      }))
    });
  }

  function loadSavedComposition(entry) {
    mutate(() => {
      const favourites = state.favourites;
      const savedCompositions = state.savedCompositions;
      const recentColours = state.recentColours;
      const recentEffects = state.recentEffects;
      Object.assign(state, clone(entry.composition), {
        favourites,
        savedCompositions,
        recentColours,
        recentEffects,
        selected: null,
        activeTab: null,
        wubrg: []
      });
    }, `${entry.name} loaded`);
  }

  function saveCurrentComposition() {
    const composition = currentComposition();
    const signature = compositionSignature(composition);
    if (state.savedCompositions.some((entry) => compositionSignature(entry.composition) === signature)) {
      announce('This complete preset is already saved');
      return;
    }
    const baseName = state.name.trim() || 'UNTITLED';
    const matchingNames = state.savedCompositions.filter((entry) => entry.name.startsWith(baseName)).length;
    const name = matchingNames ? `${baseName} ${matchingNames + 1}` : baseName;
    state.savedCompositions.unshift({id: uid('saved'), name, composition});
    state.savedCompositions = state.savedCompositions.slice(0, 12);
    persist();
    presetMenuLevel = 'saved';
    presetMenuPage = 0;
    renderPresetMenu();
    announce('Complete preset saved on this device');
  }

  function rememberSourcePayload(payload, label) {
    if (payload.kind === 'colour') {
      const colour = normaliseHex(payload.colour);
      if (!colour) return;
      state.recentColours = [colour, ...state.recentColours.filter((entry) => entry !== colour)].slice(0, 4);
    } else if (payload.kind === 'event') {
      const signature = JSON.stringify(payload.event);
      state.recentEffects = [
        {label, payload: clone(payload)},
        ...state.recentEffects.filter((entry) => JSON.stringify(entry.payload.event) !== signature)
      ].slice(0, 4);
    }
    persist();
  }

  function renderRecentColours() {
    els.recentColours.replaceChildren();
    els.recentColours.hidden = !state.recentColours.length;
    state.recentColours.forEach((colour) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'recent-choice';
      button.style.setProperty('--recent-colour', colour);
      button.innerHTML = `<i></i><span>${colour}</span>`;
      button.addEventListener('click', () => selectSourcePayload({kind: 'colour', colour}, colour));
      els.recentColours.appendChild(button);
    });
  }

  function renderColourSources() {
    els.colourSources.replaceChildren();
    renderRecentColours();
    QUICK_COLOURS.forEach(([name, colour]) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'colour-source';
      button.style.setProperty('--source-colour', colour);
      button.innerHTML = `<i></i><span><b>${name}</b><code>${colour}</code></span>`;
      button.addEventListener('click', () => selectSourcePayload({kind: 'colour', colour}, name));
      els.colourSources.appendChild(button);
    });
  }

  function renderFxExample(container, key) {
    const example = document.createElement('span');
    example.className = `fx-example example-${key}`;
    example.setAttribute('aria-hidden', 'true');
    const letter = (text, className = '') => {
      const span = document.createElement('span');
      span.className = className;
      span.textContent = text;
      return span;
    };
    if (key === 'size') example.append(letter('A', 'small'), letter('A', 'large'));
    else if (key === 'cspace') example.append(letter('A A A', 'wide'));
    else if (key === 'rotate') example.append(letter('Aa', 'upside-down'));
    else if (key === 'voffset') example.append(letter('A', 'low'), letter('A', 'high'));
    else if (key === 'pos') example.append(letter('A', 'positioned'));
    else if (key === 'sup') example.append(letter('A'), letter('A', 'sup'));
    else if (key === 'sub') example.append(letter('A'), letter('A', 'sub'));
    else if (key === 'br') example.append(letter('A'), letter('B', 'new-line'));
    else if (key === 'mspace') example.append(letter('A', 'cell'), letter('A', 'cell'));
    else if (key === 'space') example.append(letter('A'), letter('A', 'spaced'));
    else if (key === 'mark') example.append(letter('Aa', 'marked'));
    else if (key === 'alpha') example.append(letter('Aa', 'faded'));
    else if (key === 'italic') example.append(letter('Aa', 'italic'));
    else if (key === 'underline') example.append(letter('Aa', 'underline'));
    else if (key === 'strike') example.append(letter('Aa', 'strike'));
    else if (key === 'allCaps') example.append(letter('Aa'), letter('AA', 'after'));
    else if (key === 'smallCaps') example.append(letter('Aa', 'smallcaps'));
    container.appendChild(example);
  }

  function setFxMenu(level) {
    fxMenuLevel = level;
    fxMenuPage = 0;
    renderEffectSources();
  }

  function appendFxOrbitButton({label, note = '', icon = '', className = '', action, effectKey = ''}) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `fx-orbit-option ${className}`.trim();
    button.innerHTML = `${icon ? `<i aria-hidden="true">${icon}</i>` : ''}<span><b>${escapeHtml(label)}</b>${note ? `<small>${escapeHtml(note)}</small>` : ''}</span>`;
    if (effectKey) renderFxExample(button, effectKey);
    button.addEventListener('click', action);
    els.effectSources.appendChild(button);
    return button;
  }

  function positionFxOrbitButtons() {
    const buttons = Array.from(els.effectSources.children);
    const count = buttons.length;
    buttons.forEach((button, index) => {
      const angle = (count === 1 ? -90 : -155 + index * 130 / (count - 1)) * Math.PI / 180;
      button.style.left = `${50 + Math.cos(angle) * 38}%`;
      button.style.top = `${72 + Math.sin(angle) * 55}%`;
    });
  }

  function appendFxPage(keys) {
    const effects = keys.map((key) => EFFECT_BY_KEY[key]).filter(Boolean);
    const pageSize = effects.length > 4 ? 3 : 4;
    const pageCount = Math.max(1, Math.ceil(effects.length / pageSize));
    fxMenuPage = ((fxMenuPage % pageCount) + pageCount) % pageCount;
    effects.slice(fxMenuPage * pageSize, fxMenuPage * pageSize + pageSize).forEach((effect) => {
      const payload = effectPayload(effect.key);
      appendFxOrbitButton({
        label: effect.label,
        note: effect.hint,
        effectKey: effect.key,
        className: `source-${effect.key}`,
        action: () => {
          if (payload) selectSourcePayload(effectPayload(effect.key), effect.label);
        }
      }).disabled = !payload;
    });
    if (pageCount > 1) {
      appendFxOrbitButton({
        label: 'MORE',
        note: `${fxMenuPage + 1} / ${pageCount}`,
        icon: '→',
        className: 'fx-more-option',
        action: () => {
          fxMenuPage = (fxMenuPage + 1) % pageCount;
          renderEffectSources();
        }
      });
    }
  }

  function renderEffectSources() {
    els.effectSources.replaceChildren();
    const atRoot = fxMenuLevel === 'root';
    const group = FX_GROUPS.find((candidate) => candidate.key === fxMenuLevel);
    if (!atRoot && !group) fxMenuLevel = 'root';
    els.fxOrbitCentre.hidden = fxMenuLevel !== 'root';
    els.fxBackButton.hidden = fxMenuLevel === 'root';
    els.fxOrbit.classList.toggle('nested', fxMenuLevel !== 'root');
    els.fxOrbit.dataset.level = fxMenuLevel;
    if (fxMenuLevel === 'root') {
      els.fxOrbitStatus.textContent = 'CHOOSE AN FX FAMILY';
      FX_GROUPS.forEach((candidate) => appendFxOrbitButton({
        label: candidate.label,
        note: candidate.note,
        icon: candidate.icon,
        action: () => setFxMenu(candidate.key)
      }));
    } else {
      els.fxOrbitStatus.textContent = `${group.label} FX · CHOOSE ONE`;
      appendFxPage(group.effects);
    }
    positionFxOrbitButtons();
  }

  function renderSpriteSources() {
    els.spriteSources.replaceChildren();
    Array.from({length: 16}, (_, sprite) => sprite).forEach((sprite) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'sprite-source';
      button.innerHTML = `<i style="background-image:var(--arena-sprite-${sprite})"></i><span>${sprite}</span>`;
      button.setAttribute('aria-label', `Choose Arena sprite ${sprite} for the current position.`);
      const payload = {kind: 'event', event: {type: 'sprite', value: sprite}};
      button.addEventListener('click', () => selectSourcePayload(payload, `SPRITE ${sprite}`));
      els.spriteSources.appendChild(button);
      watchSpriteAsset(button.querySelector('i'), sprite);
    });
  }

  function applyColourRecipe(colours, label) {
    previewOverride = null;
    mutate(() => {
      state.colours = makeColours(colours);
      state.wubrg = [];
      state.selected = null;
      state.activeTab = null;
    }, `${label} replaced the colour layer`);
  }

  function renderWubrg() {
    els.wubrgComposer.replaceChildren();
    MANA_ORDER.forEach((code) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `mana-pip mana-${code.toLowerCase()}`;
      const selectedIndex = state.wubrg.indexOf(code);
      button.classList.toggle('selected', selectedIndex >= 0);
      button.setAttribute('aria-pressed', String(selectedIndex >= 0));
      button.setAttribute('aria-label', `${MANA[code].name}${selectedIndex >= 0 ? `, position ${selectedIndex + 1}` : ''}`);
      button.innerHTML = `<b>${code}</b><span>${selectedIndex >= 0 ? selectedIndex + 1 : MANA[code].name}</span>`;
      button.addEventListener('click', () => {
        mutate(() => {
          const current = state.wubrg.indexOf(code);
          if (current >= 0) state.wubrg.splice(current, 1);
          else if (state.wubrg.length < 5) state.wubrg.push(code);
          if (state.wubrg.length) {
            state.colours = makeEvenWubrgColours(
              state.wubrg.map((manaCode) => MANA[manaCode].colour),
              state.name.length
            );
          }
          state.selected = null;
          state.activeTab = 'wubrg';
        }, state.wubrg.includes(code) ? `${MANA[code].name} removed` : `${MANA[code].name} added`);
      });
      els.wubrgComposer.appendChild(button);
    });
    renderWubrgResults();
  }

  function wubrgRecipeName(recipe) {
    const identity = canonicalIdentity(recipe.codes);
    if (recipe.codes.length === 4) return `4 COLOUR (${IDENTITY_NAMES[identity] || identity})`;
    if (recipe.codes.length === 5) return '5 COLOUR';
    return recipe.name;
  }

  function applyWubrgRecipe(recipe) {
    const sameIdentity = state.wubrg.length === recipe.codes.length
      && canonicalIdentity(state.wubrg) === canonicalIdentity(recipe.codes);
    const nextCodes = sameIdentity
      ? [...state.wubrg.slice(1), state.wubrg[0]]
      : recipe.codes.slice();
    mutate(() => {
      state.wubrg = nextCodes;
      state.colours = makeEvenWubrgColours(nextCodes.map((code) => MANA[code].colour), state.name.length);
      state.selected = null;
      state.activeTab = 'wubrg';
    }, sameIdentity ? `${wubrgRecipeName(recipe)} colours cycled` : `${wubrgRecipeName(recipe)} applied`);
  }

  function renderWubrgResults() {
    els.wubrgResults.replaceChildren();
    const required = Array.from(new Set(state.wubrg));
    els.wubrgResults.hidden = !required.length;
    if (!required.length) {
      els.wubrgContext.textContent = 'SELECT PIPS · COLOURS APPLY IMMEDIATELY';
      return;
    }
    let recipes = identityRecipes().filter((recipe) => required.every((code) => recipe.codes.includes(code)));
    if (required.length >= 4) {
      recipes = [{key: canonicalIdentity(required), name: identityName(required), codes: required.slice()}];
    }
    els.wubrgContext.textContent = `${recipes.length} MATCHING ${recipes.length === 1 ? 'IDENTITY' : 'IDENTITIES'} · TAP THE ACTIVE ONE TO CYCLE COLOURS`;
    [
      {label: '2 COLOUR', matches: recipes.filter((recipe) => recipe.codes.length === 2)},
      {label: '3 COLOUR', matches: recipes.filter((recipe) => recipe.codes.length === 3)},
      {label: '4 / 5 COLOUR', matches: recipes.filter((recipe) => recipe.codes.length >= 4)}
    ].filter((group) => group.matches.length).forEach((group) => {
      const section = document.createElement('section');
      section.className = 'wubrg-recipe-group';
      const label = document.createElement('small');
      label.textContent = group.label;
      const row = document.createElement('div');
      row.className = 'wubrg-recipe-row';
      group.matches.forEach((recipe) => {
        const button = document.createElement('button');
        button.type = 'button';
        const selected = state.wubrg.length === recipe.codes.length
          && canonicalIdentity(state.wubrg) === canonicalIdentity(recipe.codes);
        button.className = 'wubrg-quick-preset';
        button.classList.toggle('selected', selected);
        button.style.setProperty('--preset', gradientFromColours(recipe.codes.map((code) => MANA[code].colour)));
        button.innerHTML = `<b>${wubrgRecipeName(recipe)}</b><span>${selected ? `CYCLE COLOURS · ${state.wubrg.join(' → ')}` : recipe.codes.join(' / ')}</span>`;
        attachPresetPreview(button, () => previewEvenWubrgColours(recipe.codes.map((code) => MANA[code].colour)));
        button.addEventListener('click', () => applyWubrgRecipe(recipe));
        row.appendChild(button);
      });
      section.append(label, row);
      els.wubrgResults.appendChild(section);
    });
  }

  function gradientFromColours(colours) {
    if (colours.length === 1) return colours[0];
    return `linear-gradient(90deg,${colours.map((colour, index) => `${colour} ${index / (colours.length - 1) * 100}%`).join(',')})`;
  }

  function applySpecialPreset(preset) {
    mutate(() => {
      state.formatting = {italic: false, underline: false, strike: false, ...clone(preset.formatting)};
      state.effects = Logic.normaliseEffects(clone(preset.effects));
      if (preset.colours) {
        state.colours = makeColours(preset.colours);
        state.wubrg = [];
      }
      state.events = [
        ...state.events.filter((event) => event.type === 'sprite'),
        ...styledPresetEvents(preset)
      ];
      state.selected = null;
      state.activeTab = null;
    }, `${preset.name} layered onto the live name`);
  }

  function setPresetMenu(level, options = {}) {
    presetMenuLevel = level;
    if (options.resetPage !== false) presetMenuPage = 0;
    if (options.savedId !== undefined) selectedSavedPresetId = options.savedId;
    renderPresetMenu();
  }

  function presetBack() {
    if (['colour', 'special', 'saved'].includes(presetMenuLevel)) {
      setPresetMenu('root');
      return;
    }
    if (['rename', 'deleteConfirm'].includes(presetMenuLevel)) {
      setPresetMenu('savedActions', {savedId: selectedSavedPresetId});
      return;
    }
    if (presetMenuLevel === 'savedActions') setPresetMenu('saved');
  }

  function appendPresetOrbitButton({label, note = '', icon = '', className = '', gradient = '', action, selected = false}) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `preset-orbit-option ${className}`.trim();
    button.classList.toggle('selected', selected);
    button.setAttribute('aria-pressed', String(selected));
    if (gradient) button.style.setProperty('--preset-orbit-fill', gradient);
    button.innerHTML = `${icon ? `<i aria-hidden="true">${icon}</i>` : ''}<b>${escapeHtml(label)}</b>${note ? `<small>${escapeHtml(note)}</small>` : ''}`;
    button.addEventListener('click', action);
    els.presetOrbitItems.appendChild(button);
    return button;
  }

  function appendPresetPage(items, makeButton, pageSize = 5) {
    const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
    presetMenuPage = ((presetMenuPage % pageCount) + pageCount) % pageCount;
    items.slice(presetMenuPage * pageSize, presetMenuPage * pageSize + pageSize).forEach(makeButton);
    if (pageCount > 1) {
      appendPresetOrbitButton({
        label: 'MORE',
        note: `${presetMenuPage + 1} / ${pageCount}`,
        icon: '→',
        className: 'preset-more-option',
        action: () => {
          presetMenuPage = (presetMenuPage + 1) % pageCount;
          renderPresetMenu();
        }
      });
    }
  }

  function positionPresetOrbitButtons() {
    const buttons = Array.from(els.presetOrbitItems.children);
    const count = buttons.length;
    buttons.forEach((button, index) => {
      const angle = (-90 + index * 360 / Math.max(1, count)) * Math.PI / 180;
      button.style.left = `${50 + Math.cos(angle) * 35}%`;
      button.style.top = `${50 + Math.sin(angle) * 38}%`;
    });
  }

  function selectedSavedPreset() {
    return state.savedCompositions.find((entry) => entry.id === selectedSavedPresetId) || null;
  }

  function savePresetRename() {
    const saved = selectedSavedPreset();
    if (!saved) {
      setPresetMenu('saved');
      return;
    }
    const nextName = els.presetRenameInput.value.trim().slice(0, 48);
    if (!nextName) {
      announce('Give the saved preset a name', true);
      els.presetRenameInput.focus();
      return;
    }
    saved.name = nextName;
    persist();
    setPresetMenu('savedActions', {savedId: saved.id});
    announce(`Saved preset renamed to ${nextName}`);
  }

  function renderPresetMenu() {
    els.presetOrbitItems.replaceChildren();
    const atRoot = presetMenuLevel === 'root';
    els.presetOrbitCentre.hidden = !atRoot;
    els.presetBackButton.hidden = atRoot;
    els.presetRenameEditor.hidden = presetMenuLevel !== 'rename';
    els.presetOrbit.classList.toggle('nested', !atRoot);
    els.presetOrbit.dataset.level = presetMenuLevel;
    els.presetPreviewActions.hidden = !stagedPreset;
    els.presetKeepButton.innerHTML = stagedPreset
      ? `<span aria-hidden="true">✓</span> KEEP ${escapeHtml(stagedPreset.label)}`
      : '<span aria-hidden="true">✓</span> KEEP THIS LOOK';

    if (atRoot) {
      els.presetOrbitStatus.textContent = 'CHOOSE A COLLECTION';
      appendPresetOrbitButton({label: 'COLOUR', note: `${COLOUR_PRESETS.length} PALETTES`, icon: '◒', action: () => setPresetMenu('colour')});
      appendPresetOrbitButton({label: 'SPECIAL', note: `${STYLE_PRESETS.length} LOOKS`, icon: '✦', action: () => setPresetMenu('special')});
      appendPresetOrbitButton({label: 'SAVED', note: `${state.savedCompositions.length} ON DEVICE`, icon: '★', action: () => setPresetMenu('saved')});
    } else if (presetMenuLevel === 'colour') {
      els.presetOrbitStatus.textContent = 'COLOUR PRESETS · TAP TO APPLY';
      appendPresetPage(COLOUR_PRESETS, (preset) => appendPresetOrbitButton({
        label: preset.name,
        note: preset.note,
        gradient: gradientFromColours(preset.colours),
        selected: stagedPreset?.key === `colour:${preset.name}`,
        action: () => stageColourPreset(preset)
      }));
    } else if (presetMenuLevel === 'special') {
      els.presetOrbitStatus.textContent = 'SPECIAL PRESETS · TAP TO APPLY';
      appendPresetPage(STYLE_PRESETS, (preset) => appendPresetOrbitButton({
        label: preset.name,
        note: preset.note,
        icon: preset.sample,
        gradient: gradientFromColours(preset.colours || ['#FFFFFF']),
        selected: stagedPreset?.key === `special:${preset.id}`,
        action: () => stageSpecialPreset(preset)
      }), 6);
    } else if (presetMenuLevel === 'saved') {
      els.presetOrbitStatus.textContent = state.savedCompositions.length
        ? 'SAVED PRESETS · TAP ONE TO MANAGE IT'
        : 'SAVE THE CURRENT COMPLETE LOOK TO BEGIN';
      const savedItems = [{kind: 'save'}, ...state.savedCompositions.map((entry) => ({kind: 'entry', entry}))];
      appendPresetPage(savedItems, (item) => {
        if (item.kind === 'save') {
          appendPresetOrbitButton({label: 'SAVE CURRENT', note: 'COMPLETE LOOK', icon: '+', className: 'preset-save-option', action: saveCurrentComposition});
          return;
        }
        const colours = item.entry.composition.colours?.map((stop) => stop.colour).filter(Logic.validHex) || ['#FFFFFF'];
        appendPresetOrbitButton({
          label: item.entry.name,
          note: 'LOAD · RENAME · DELETE',
          gradient: gradientFromColours(colours),
          selected: stagedPreset?.key === `saved:${item.entry.id}`,
          action: () => {
            stageSavedPreset(item.entry);
            setPresetMenu('savedActions', {savedId: item.entry.id});
          }
        });
      });
    } else {
      const saved = selectedSavedPreset();
      if (!saved) {
        presetMenuLevel = 'saved';
        renderPresetMenu();
        return;
      }
      if (presetMenuLevel === 'savedActions') {
        els.presetOrbitStatus.textContent = saved.name;
        appendPresetOrbitButton({
          label: 'PREVIEW',
          note: 'THEN KEEP TO LOAD',
          icon: '↳',
          selected: stagedPreset?.key === `saved:${saved.id}`,
          action: () => stageSavedPreset(saved)
        });
        appendPresetOrbitButton({label: 'RENAME', note: 'CHANGE ITS LABEL', icon: '✎', action: () => {
          presetMenuLevel = 'rename';
          renderPresetMenu();
          els.presetRenameInput.value = saved.name;
          requestAnimationFrame(() => els.presetRenameInput.focus());
        }});
        appendPresetOrbitButton({label: 'DELETE', note: 'REMOVE FROM DEVICE', icon: '×', className: 'preset-delete-option', action: () => setPresetMenu('deleteConfirm', {savedId: saved.id})});
      } else if (presetMenuLevel === 'rename') {
        els.presetOrbitStatus.textContent = `RENAMING ${saved.name}`;
      } else if (presetMenuLevel === 'deleteConfirm') {
        els.presetOrbitStatus.textContent = `DELETE ${saved.name}?`;
        appendPresetOrbitButton({label: 'YES, DELETE', note: 'CANNOT BE UNDONE', icon: '×', className: 'preset-delete-option', action: () => {
          state.savedCompositions = state.savedCompositions.filter((entry) => entry.id !== saved.id);
          persist();
          selectedSavedPresetId = null;
          setPresetMenu('saved');
          announce(`${saved.name} deleted`);
        }});
        appendPresetOrbitButton({label: 'KEEP IT', note: 'GO BACK', icon: '✓', action: () => setPresetMenu('savedActions', {savedId: saved.id})});
      }
    }
    positionPresetOrbitButtons();
  }

  function renderPresets() {
    renderPresetMenu();
  }

  function positionChoicePanel() {
    if (els.sourceLibrary.hidden) return;
    if (els.sourceLibrary.classList.contains('global-choice')) {
      const nameBounds = els.outputPreview.getBoundingClientRect();
      const minimumPanelHeight = Math.min(330, window.innerHeight * .62);
      const top = Math.max(76, Math.min(window.innerHeight - minimumPanelHeight, nameBounds.bottom + 8));
      els.sourceLibrary.style.setProperty('--global-panel-top', `${Math.round(top)}px`);
      return;
    }
    if (!els.sourceLibrary.classList.contains('refining-choice')) return;
    const selectedId = state.selected?.id;
    const token = Array.from(els.tubeLayerRail.querySelectorAll('.tube-token'))
      .find((candidate) => candidate.dataset.layerId === selectedId);
    const targetBounds = token?.getBoundingClientRect() || els.tubeTrack.getBoundingClientRect();
    const minimumPanelHeight = Math.min(300, window.innerHeight * .56);
    const top = Math.max(68, Math.min(window.innerHeight - minimumPanelHeight, targetBounds.bottom + 9));
    els.sourceLibrary.style.setProperty('--context-panel-top', `${Math.round(top)}px`);
  }

  function setActiveTab(name, focus = false) {
    const valid = ['colours', 'effects', 'sprites', 'wubrg', 'presets'];
    const nextTab = valid.includes(name) ? name : null;
    const changed = state.activeTab !== nextTab;
    state.activeTab = nextTab;
    const tabs = Array.from(document.querySelectorAll('[data-tab]'));
    const activePresetTab = tabs.some((tab) => tab.dataset.tab === state.activeTab);
    tabs.forEach((tab) => {
      const active = tab.dataset.tab === state.activeTab;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = activePresetTab ? (active ? 0 : -1) : 0;
      if (active && focus) tab.focus();
    });
    document.querySelectorAll('[data-panel]').forEach((panel) => {
      panel.hidden = panel.dataset.panel !== state.activeTab;
    });
    const pendingChoice = Boolean(state.activeTab && pendingLayerOffset !== null);
    const globalChoice = Boolean(
      pendingLayerOffset === null &&
      ['wubrg', 'presets'].includes(state.activeTab)
    );
    const refiningChoice = Boolean(
      state.activeTab &&
      pendingLayerOffset === null &&
      state.selected &&
      ['colours', 'effects', 'sprites'].includes(state.activeTab)
    );
    els.sourceLibrary.classList.toggle('pending-choice', pendingChoice);
    els.sourceLibrary.classList.toggle('global-choice', globalChoice);
    els.sourceLibrary.classList.toggle('refining-choice', refiningChoice);
    els.pendingChoiceBanner.hidden = !pendingChoice;
    document.body.classList.toggle('layer-choice-open', pendingChoice);
    if (pendingChoice) {
      els.choiceCard.setAttribute('role', 'dialog');
      els.choiceCard.setAttribute('aria-modal', 'true');
      els.choiceCard.setAttribute('aria-labelledby', 'pendingChoiceTitle');
    } else {
      els.choiceCard.setAttribute('role', 'region');
      els.choiceCard.removeAttribute('aria-modal');
      els.choiceCard.removeAttribute('aria-labelledby');
    }
    els.sourceLibrary.hidden = !state.activeTab;
    if (globalChoice || refiningChoice) requestAnimationFrame(positionChoicePanel);
    if (state.activeTab && changed) {
      if (state.activeTab === 'presets') {
        presetMenuLevel = 'root';
        presetMenuPage = 0;
        selectedSavedPresetId = null;
        stagedPreset = null;
        clearPreview();
        renderPresetMenu();
      }
      if (state.activeTab === 'effects') {
        fxMenuLevel = 'root';
        fxMenuPage = 0;
        renderEffectSources();
      }
      requestAnimationFrame(() => {
        const panel = document.querySelector(`[data-panel="${state.activeTab}"]`);
        if (panel) panel.scrollTop = 0;
        if (pendingChoice) els.choiceCard.focus({preventScroll: true});
      });
    }
    persist();
  }

  function renderSources() {
    renderColourSources();
    renderEffectSources();
    renderWubrg();
  }

  function renderAll() {
    normaliseState();
    els.deckName.value = state.name;
    renderCaret();
    renderOutput();
    renderTube();
    renderWholeNameToggles();
    renderInspector();
    renderSources();
    renderSavedPalettes();
    renderPresetMenu();
    setActiveTab(state.activeTab);
  }

  function playCopySail(source = els.copyButton) {
    const bounds = source?.getBoundingClientRect?.() || {
      left: window.innerWidth / 2, width: 0, top: window.innerHeight / 2
    };
    const sail = document.createElement('span');
    sail.className = 'copy-sail';
    sail.setAttribute('aria-hidden', 'true');
    sail.style.left = `${bounds.left + bounds.width / 2}px`;
    sail.style.top = `${bounds.top}px`;
    Array.from('COPIED!').forEach((letter, index, letters) => {
      const glyph = document.createElement('i');
      glyph.textContent = letter;
      glyph.style.color = Logic.colourAtPosition(state.colours, letters.length === 1 ? .5 : index / (letters.length - 1));
      glyph.style.setProperty('--sail-delay', `${index * 35}ms`);
      sail.appendChild(glyph);
    });
    document.body.appendChild(sail);
    setTimeout(() => sail.remove(), 1450);
  }

  async function copyText(text, label = 'Copied', source = els.copyButton) {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch (_) {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      textarea.remove();
    }
    playCopySail(source);
    announce(label);
  }

  function copyCurrentName(source) {
    return copyText(
      currentBuild?.raw,
      currentBuild?.overLimit ? 'Copied — Arena may truncate it' : 'Arena name copied',
      source
    );
  }

  function syncCaretFromInput() {
    state.caret = els.deckName.selectionStart ?? state.name.length;
    renderCaret();
    persist();
  }

  function handleNameInput() {
    const previous = state.name;
    const next = els.deckName.value;
    if (previous === next) return;
    if (!els.deckName.dataset.editing) {
      history.push(snapshot());
      if (history.length > MAX_HISTORY) history.shift();
      future = [];
      els.deckName.dataset.editing = 'true';
    }
    state.events = Logic.rebaseInlineEvents(state.events, previous, next);
    state.name = next;
    if (state.wubrg.length) {
      state.colours = makeEvenWubrgColours(
        state.wubrg.map((code) => MANA[code].colour),
        next.length
      );
    }
    state.caret = els.deckName.selectionStart ?? next.length;
    normaliseState();
    persist();
    renderCaret();
    renderOutput();
    renderTube();
    renderInspector();
  }

  function canvasTargets() {
    return Array.from(els.outputPreview.querySelectorAll('[data-drop-offset]'));
  }

  function canvasTargetFromPoint(clientX, directTarget = null) {
    const direct = directTarget?.closest?.('[data-drop-offset]');
    if (direct && els.outputPreview.contains(direct)) return direct;
    const targets = canvasTargets();
    if (!targets.length) return null;
    return targets.reduce((closest, candidate) => {
      const bounds = candidate.getBoundingClientRect();
      const centre = bounds.left + bounds.width / 2;
      const distance = Math.abs(clientX - centre);
      return !closest || distance < closest.distance ? {candidate, distance} : closest;
    }, null)?.candidate || null;
  }

  function showCanvasDropTarget(target) {
    els.outputPreview.querySelectorAll('.drop-hover').forEach((node) => node.classList.remove('drop-hover'));
    if (!target) return;
    target.classList.add('drop-hover');
    const targetBounds = target.getBoundingClientRect();
    const trackBounds = els.tubeTrack.getBoundingClientRect();
    const x = targetBounds.left + targetBounds.width / 2 - trackBounds.left;
    els.dropGuide.style.left = `${Math.max(0, Math.min(trackBounds.width, x))}px`;
    els.dropGuide.classList.add('visible');
  }

  function setCentreMarker(position, active) {
    const centred = Boolean(active) && Math.abs((Number(position) || 0) - .5) <= .035;
    els.tubeCentreMarker.classList.toggle('visible', centred);
    els.tubeTrack.classList.toggle('centre-locked', centred);
  }

  function selectWheelPoint(event) {
    setColourDraft(colourFromWheelEvent(els.colourWheel, event));
  }

  function installEvents() {
    const setInstructionsOpen = (open) => {
      els.instructionsPanel.hidden = !open;
      els.instructionsButton.setAttribute('aria-expanded', String(open));
    };
    els.instructionsButton.addEventListener('click', () => {
      setInstructionsOpen(els.instructionsPanel.hidden);
    });
    document.querySelectorAll('[data-close-instructions]').forEach((button) => {
      button.addEventListener('click', () => setInstructionsOpen(false));
    });
    els.deckName.addEventListener('input', handleNameInput);
    ['click', 'keyup', 'select', 'focus'].forEach((type) => els.deckName.addEventListener(type, syncCaretFromInput));
    els.deckName.addEventListener('blur', () => { delete els.deckName.dataset.editing; });
    els.startOver.addEventListener('click', () => mutate(() => {
      const fresh = createDefaultState();
      const activeTab = state.activeTab;
      const favourites = state.favourites;
      const savedCompositions = state.savedCompositions;
      const recentColours = state.recentColours;
      const recentEffects = state.recentEffects;
      state = {...fresh, activeTab, favourites, savedCompositions, recentColours, recentEffects};
    }, 'Started over — Undo is available'));
    els.copyButton.addEventListener('click', () => copyCurrentName(els.copyButton));
    els.undoButton.addEventListener('click', undo);
    els.redoButton.addEventListener('click', redo);
    els.forceGradient.addEventListener('click', forceGradient);
    els.clearFxButton.addEventListener('click', () => mutate(() => {
      state.formatting = {italic: false, underline: false, strike: false};
      state.effects = Logic.normaliseEffects({});
      state.events = state.events.filter((event) => event.type === 'sprite');
      state.selected = null;
    }, 'All effect layers cleared; sprites preserved'));
    els.addCustomColour.addEventListener('click', () => {
      const colour = normaliseHex(els.colourHex.value);
      if (!colour) {
        announce('Use a six-digit hex colour', true);
        return;
      }
      selectSourcePayload({kind: 'colour', colour}, colour);
    });
    els.colourPicker.addEventListener('input', () => setColourDraft(els.colourPicker.value));
    els.colourHex.addEventListener('input', () => {
      els.colourHex.value = els.colourHex.value.toUpperCase();
      const clean = normaliseHex(els.colourHex.value);
      if (clean) {
        els.colourPicker.value = clean;
        positionWheelCursor(clean);
        updateColourPreview(els.colourWheelPreview, els.colourWheelPreviewHex, clean);
      }
    });
    els.colourHex.addEventListener('change', () => {
      if (!setColourDraft(els.colourHex.value)) {
        els.colourHex.setAttribute('aria-invalid', 'true');
        announce('Use a six-digit hex colour', true);
      } else {
        els.colourHex.removeAttribute('aria-invalid');
      }
    });
    els.colourWheel.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      try { els.colourWheel.setPointerCapture(event.pointerId); } catch (_) {}
      selectWheelPoint(event);
    });
    els.colourWheel.addEventListener('pointermove', (event) => {
      if (!els.colourWheel.hasPointerCapture?.(event.pointerId) && !event.buttons) return;
      selectWheelPoint(event);
    });
    els.rotateColours.addEventListener('click', () => mutate(() => {
      const sorted = state.colours.slice().sort((left, right) => left.position - right.position);
      if (sorted.length < 2) return;
      const values = sorted.map((stop) => stop.colour);
      values.unshift(values.pop());
      sorted.forEach((stop, index) => { stop.colour = values[index]; });
      state.wubrg = [];
    }, 'Palette rotated'));
    els.flipColours.addEventListener('click', () => mutate(() => {
      const sorted = state.colours.slice().sort((left, right) => left.position - right.position);
      const values = sorted.map((stop) => stop.colour).reverse();
      sorted.forEach((stop, index) => { stop.colour = values[index]; });
      state.wubrg = [];
    }, 'Palette direction flipped'));
    els.savePalette.addEventListener('click', () => {
      const colours = state.colours.slice().sort((left, right) => left.position - right.position).map((stop) => stop.colour);
      const signature = colours.join(',');
      const existing = state.favourites.findIndex((entry) => entry.colours.join(',') === signature);
      if (existing >= 0) {
        announce('That palette is already saved');
        return;
      }
      state.favourites.unshift({name: `SAVED ${state.favourites.length + 1}`, colours});
      state.favourites = state.favourites.slice(0, 10);
      persist();
      renderSavedPalettes();
      announce('Palette saved on this device');
    });
    document.querySelectorAll('[data-global-toggle]').forEach((button) => {
      button.addEventListener('click', () => {
        const key = button.dataset.globalToggle;
        const removing = globalEnabled(key);
        mutate(() => {
          toggleGlobal(key);
          state.selected = null;
        }, `${EFFECT_BY_KEY[key].label} ${removing ? 'off' : 'on'} for the whole name`);
      });
    });
    els.presetBackButton.addEventListener('click', presetBack);
    els.presetKeepButton.addEventListener('click', keepStagedPreset);
    els.presetCancelButton.addEventListener('click', cancelPresetPreview);
    els.presetRenameSave.addEventListener('click', savePresetRename);
    els.presetRenameCancel.addEventListener('click', () => setPresetMenu('savedActions', {savedId: selectedSavedPresetId}));
    els.presetRenameInput.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter') return;
      event.preventDefault();
      savePresetRename();
    });
    els.fxBackButton.addEventListener('click', () => setFxMenu('root'));
    const colourReservoirPayload = {kind: 'reservoir', category: 'colours'};
    const fxReservoirPayload = {kind: 'reservoir', category: 'effects'};
    const spriteReservoirPayload = {kind: 'reservoir', category: 'sprites'};
    enableReservoirDrag(els.colourLayerBubble, colourReservoirPayload);
    enableReservoirDrag(els.fxLayerBubble, fxReservoirPayload);
    enableReservoirDrag(els.spriteLayerBubble, spriteReservoirPayload);
    document.querySelectorAll('[data-tab]').forEach((tab) => {
      tab.addEventListener('click', () => {
        cancelPendingLayer();
        state.selected = null;
        renderInspector();
        const currentTab = state.activeTab;
        const nextTab = currentTab === tab.dataset.tab ? null : tab.dataset.tab;
        if (currentTab === 'presets') {
          closePresetMenu({keep: true});
          if (nextTab && nextTab !== 'presets') setActiveTab(nextTab);
          return;
        }
        setActiveTab(nextTab);
      });
      tab.addEventListener('keydown', (event) => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        const tabs = Array.from(document.querySelectorAll('[data-tab]'));
        const current = tabs.indexOf(tab);
        const next = event.key === 'Home' ? 0
          : event.key === 'End' ? tabs.length - 1
            : (current + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
        const nextTab = tabs[next].dataset.tab;
        if (state.activeTab === 'presets' && nextTab !== 'presets') {
          closePresetMenu({keep: true});
        }
        setActiveTab(nextTab, true);
      });
    });
    document.querySelectorAll('[data-close-panel]').forEach((button) => {
      button.addEventListener('click', () => {
        cancelPendingLayer();
        if (state.activeTab === 'presets') closePresetMenu({keep: true});
        else setActiveTab(null);
      });
    });
    document.querySelectorAll('[data-close-context]').forEach((button) => {
      button.addEventListener('click', () => {
        cancelPendingLayer();
        state.selected = null;
        if (state.activeTab === 'presets') closePresetMenu({keep: true});
        else setActiveTab(null);
        renderInspector();
      });
    });
    document.addEventListener('pointerdown', (event) => {
      if (pendingLayerOffset !== null || !['presets', 'wubrg'].includes(state.activeTab)) return;
      if (els.sourceLibrary.contains(event.target) || event.target.closest('[data-tab]')) return;
      if (state.activeTab === 'presets') closePresetMenu({keep: true});
      else setActiveTab(null);
    }, true);
    els.tubeTrack.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End', 'Enter'].includes(event.key)) return;
      event.preventDefault();
      if (event.key === 'Enter') {
        setCaret(state.caret, true);
        return;
      }
      const step = event.shiftKey ? 5 : 1;
      if (event.key === 'Home') setCaret(0);
      else if (event.key === 'End') setCaret(state.name.length);
      else setCaret(state.caret + (event.key === 'ArrowRight' ? step : -step));
    });
    window.addEventListener('resize', () => requestAnimationFrame(() => {
      layoutRailTokens();
      positionChoicePanel();
    }));
    document.fonts?.ready?.then(() => {
      renderOutput();
      renderTube();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        if (!els.instructionsPanel.hidden) {
          setInstructionsOpen(false);
          els.instructionsButton.focus({preventScroll: true});
        } else if (pendingLayerOffset !== null) {
          cancelPendingLayer();
          setActiveTab(null);
          announce('New layer cancelled');
        } else if (state.activeTab === 'presets' && presetMenuLevel !== 'root') {
          presetBack();
        } else if (state.activeTab === 'presets') {
          cancelPresetPreview();
        } else if (state.activeTab === 'effects' && fxMenuLevel !== 'root') {
          setFxMenu('root');
        } else if (state.activeTab) {
          setActiveTab(null);
        } else if (state.selected) {
          clearSelection();
        }
      }
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault();
        copyCurrentName(els.copyButton);
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z' && !event.shiftKey) {
        event.preventDefault();
        undo();
      }
      if ((event.ctrlKey || event.metaKey) && (event.key.toLowerCase() === 'y' || (event.shiftKey && event.key.toLowerCase() === 'z'))) {
        event.preventDefault();
        redo();
      }
    });
  }

  restore();
  drawColourWheel();
  setColourDraft('#C94BFF');
  renderColourSources();
  renderSpriteSources();
  renderPresets();
  installEvents();
  renderAll();
})();
