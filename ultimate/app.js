(() => {
  'use strict';

  const Logic = window.DeckwrightV7Logic;
  const DEFAULT_NAME = 'Your Deck Name';
  const STORAGE_KEY = 'turdgobbler-colourifier-ultimate-v2';
  const LEGACY_STORAGE_KEY = 'turdgobbler-deckwright-v7';
  const MAX_COLOURS = 7;
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
    {key: 'bold', label: 'BOLD', hint: 'HEAVIER TEXT', code: '<b>'},
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
  const EFFECT_BY_KEY = Object.fromEntries(EFFECTS.map((effect) => [effect.key, effect]));
  const $ = (id) => document.getElementById(id);
  const els = {
    deckName: $('deckName'), startOver: $('startOver'),
    copyButton: $('copyButton'), copyLabel: $('copyLabel'), outputPreview: $('outputPreview'),
    budgetTotal: $('budgetTotal'), budgetText: $('budgetText'), budgetColour: $('budgetColour'),
    budgetFx: $('budgetFx'), outputStatus: $('outputStatus'), colourCount: $('colourCount'),
    effectCount: $('effectCount'), spriteCount: $('spriteCount'), megaTube: $('megaTube'),
    tubeTrack: $('tubeTrack'), tubeFill: $('tubeFill'),
    tubeLayerRail: $('tubeLayerRail'), tubeLayerGuides: $('tubeLayerGuides'),
    trashDropZone: $('trashDropZone'),
    tubeNameCanvas: $('tubeNameCanvas'),
    dropGuide: $('dropGuide'), dropMagnifier: $('dropMagnifier'),
    dropMagnifierGlyph: $('dropMagnifierGlyph'), dropMagnifierLabel: $('dropMagnifierLabel'),
    undoButton: $('undoButton'), redoButton: $('redoButton'),
    clearFxButton: $('clearFxButton'), tubeStatus: $('tubeStatus'), layerInspector: $('layerInspector'),
    colourPicker: $('colourPicker'), colourHex: $('colourHex'), addCustomColour: $('addCustomColour'),
    colourWheel: $('colourWheel'), wheelCursor: $('wheelCursor'),
    rotateColours: $('rotateColours'), flipColours: $('flipColours'), savePalette: $('savePalette'),
    savedPalettes: $('savedPalettes'),
    colourSources: $('colourSources'), recentColours: $('recentColours'),
    effectSources: $('effectSources'), recentEffects: $('recentEffects'), spriteSources: $('spriteSources'),
    wubrgComposer: $('wubrgComposer'), wubrgIdentity: $('wubrgIdentity'), wubrgOrder: $('wubrgOrder'),
    clearWubrg: $('clearWubrg'), wubrgContext: $('wubrgContext'),
    wubrgResults: $('wubrgResults'), colourPresets: $('colourPresets'), stylePresets: $('stylePresets'),
    colourLayerBubble: $('colourLayerBubble'), fxLayerBubble: $('fxLayerBubble'),
    sourceLibrary: $('sourceLibrary'),
    saveComposition: $('saveComposition'), savedCompositions: $('savedCompositions'),
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
  let state = createDefaultState();

  function uid(prefix) {
    return `${prefix}-${Date.now().toString(36)}-${nextId++}`;
  }

  function makeColours(colours) {
    const source = colours.length ? colours : ['#FFFFFF'];
    return source.slice(0, MAX_COLOURS).map((colour, index) => ({
      id: uid('colour'),
      colour: colour.toUpperCase(),
      position: source.length === 1 ? .5 : index / (source.length - 1)
    }));
  }

  function createDefaultState() {
    return {
      name: DEFAULT_NAME,
      colours: makeColours([MANA.U.colour, MANA.R.colour, MANA.G.colour]),
      formatting: {bold: false, italic: false, underline: false, strike: false},
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
      bold: false,
      italic: Boolean(state.formatting?.italic),
      underline: Boolean(state.formatting?.underline),
      strike: Boolean(state.formatting?.strike)
    };
    state.effects = Logic.normaliseEffects(state.effects || {});
    state.events = Logic.normaliseInlineEvents(state.events, state.name.length).map((event) => ({
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
    toastTimer = setTimeout(() => els.toast.classList.remove('visible'), 2200);
  }

  function canonicalIdentity(codes) {
    const unique = Array.from(new Set(codes));
    return MANA_ORDER.filter((code) => unique.includes(code)).join('');
  }

  function identityName(codes) {
    const key = canonicalIdentity(codes);
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
    if (['bold', 'italic', 'underline', 'strike', 'sup', 'sub'].includes(key)) {
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
    return {b: 'bold', i: 'italic', u: 'underline', s: 'strike'}[match[1].toLowerCase()] || match[1].toLowerCase();
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
      bold: source.formatting.bold,
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
    const simple = String(code).match(/^<(b|i|u|s|sup|sub|smallcaps)>$/i);
    if (simple) {
      const key = simple[1].toLowerCase();
      if (key === 'b') preview.bold = true;
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
    if (preview.bold) glyph.style.fontWeight = '900';
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

  function renderPreview(build) {
    els.outputPreview.replaceChildren();
    if (!build.text && !build.inlineEvents.length) {
      const empty = document.createElement('span');
      empty.className = 'preview-empty';
      empty.textContent = 'TYPE A DECK NAME';
      els.outputPreview.appendChild(empty);
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
          els.outputPreview.appendChild(document.createElement('br'));
        } else if (event.type === 'sprite') {
          const sprite = document.createElement('i');
          sprite.className = 'preview-sprite';
          sprite.dataset.dropOffset = String(offset);
          sprite.style.backgroundImage = `var(--arena-sprite-${event.value})`;
          sprite.setAttribute('aria-label', `Sprite ${event.value} at position ${offset}`);
          els.outputPreview.appendChild(sprite);
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
      els.outputPreview.appendChild(glyph);
    }
    const endTarget = document.createElement('span');
    endTarget.className = 'preview-end-target';
    endTarget.dataset.dropOffset = String(build.text.length);
    endTarget.setAttribute('aria-label', `End of name, position ${build.text.length}`);
    els.outputPreview.appendChild(endTarget);
  }

  function gradientCss() {
    const stops = effectiveState().colours.slice().sort((left, right) => left.position - right.position);
    if (stops.length === 1) return stops[0].colour;
    return `linear-gradient(90deg,${stops.map((stop) => `${stop.colour} ${(stop.position * 100).toFixed(2)}%`).join(',')})`;
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
    els.copyLabel.textContent = over ? 'COPY ANYWAY' : 'COPY NAME';
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

  function addAnchorGuide(startX, endX, kind) {
    const startY = els.tubeLayerRail.offsetTop + 16;
    const endY = els.tubeFill.offsetTop + els.tubeFill.offsetHeight / 2;
    const deltaX = endX - startX;
    const deltaY = endY - startY;
    const length = Math.hypot(deltaX, deltaY);
    if (Math.abs(deltaX) < 4 || length < 4) return;
    const guide = document.createElement('i');
    guide.className = `layer-guide guide-${kind}`;
    guide.style.left = `${(els.tubeLayerRail.offsetLeft + startX).toFixed(1)}px`;
    guide.style.top = `${startY.toFixed(1)}px`;
    guide.style.width = `${length.toFixed(1)}px`;
    guide.style.transform = `rotate(${Math.atan2(deltaY, deltaX)}rad)`;
    els.tubeLayerGuides.appendChild(guide);
  }

  function layoutRailTokens() {
    const railBounds = els.tubeLayerRail.getBoundingClientRect();
    els.tubeLayerGuides.replaceChildren();
    const tokens = Array.from(els.tubeLayerRail.querySelectorAll('.tube-token'))
      .map((token) => {
        const kind = token.dataset.layerKind || 'effect';
        const anchor = kind === 'colour'
          ? railXFromColourPosition(Number(token.dataset.anchorPosition || 0))
          : railXFromOffset(Number(token.dataset.anchorOffset || 0));
        const desired = token.hasAttribute('data-visual-position')
          ? railXFromColourPosition(Number(token.dataset.visualPosition || 0))
          : anchor;
        return {token, kind, anchor, desired};
      })
      .sort((left, right) => left.desired - right.desired);
    if (!tokens.length || !railBounds.width) return;
    const edge = 16;
    const available = Math.max(1, railBounds.width - edge * 2);
    const gap = Math.min(35, available / Math.max(1, tokens.length - 1));
    const dense = gap < 27;
    let previous = edge - gap;
    tokens.forEach((entry) => {
      entry.resolved = Math.max(entry.desired, previous + gap);
      previous = entry.resolved;
    });
    const overflow = Math.max(0, tokens.at(-1).resolved - (railBounds.width - edge));
    if (overflow) tokens.forEach((entry) => { entry.resolved -= overflow; });
    for (let index = tokens.length - 2; index >= 0; index -= 1) {
      tokens[index].resolved = Math.min(tokens[index].resolved, tokens[index + 1].resolved - gap);
    }
    const underflow = Math.max(0, edge - tokens[0].resolved);
    tokens.forEach((entry) => {
      entry.resolved += underflow;
      entry.token.classList.toggle('dense', dense);
      entry.token.style.left = `${entry.resolved.toFixed(1)}px`;
      addAnchorGuide(entry.resolved, entry.anchor, entry.kind);
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
    els.tubeStatus.textContent = pendingLayerOffset !== null
      ? pendingLayerCategory === 'colours'
        ? `COLOUR POINT ${Math.round((pendingLayerPosition ?? colourCaretPosition()) * 100)}% LOCKED · CHOOSE A COLOUR`
        : `FX BUBBLE ${Math.round((pendingLayerPosition ?? positionFromOffset(pendingLayerOffset)) * 100)}% · COMPILES AT TEXT POSITION ${pendingLayerOffset}`
      : `COLOUR + FX MOVE FREELY · GUIDE LINES SHOW THE COMPILED TEXT POSITION`;
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

  function beginTokenDrag(event, options) {
    if (event.button !== 0) return;
    event.stopPropagation();
    event.preventDefault();
    const before = snapshot();
    const startX = event.clientX;
    const startY = event.clientY;
    let moved = false;
    const target = event.currentTarget;
    try { target.setPointerCapture(event.pointerId); } catch (_) {}
    const move = (moveEvent) => {
      if (moveEvent.pointerId !== event.pointerId) return;
      if (!moved && Math.hypot(moveEvent.clientX - startX, moveEvent.clientY - startY) < 4) return;
      if (!moved) {
        moved = true;
        target.classList.add('dragging');
        els.megaTube.classList.add('dragging-layer');
        setTrashZone(true, false, options.canRemove !== false);
      }
      const overTrash = pointerInside(els.trashDropZone, moveEvent.clientX, moveEvent.clientY);
      setTrashZone(true, overTrash, options.canRemove !== false);
      if (overTrash) {
        showCanvasDropTarget(null);
        hideDropMagnifier();
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
      target.style.left = `${railXFromColourPosition(position).toFixed(1)}px`;
      showCanvasDropTarget(snapTarget);
      showDropMagnifier(snapTarget, offset, moveEvent.clientX, options.kind === 'colour' ? position : null);
      renderOutput();
      els.tubeFill.style.background = gradientCss();
    };
    const finish = (finishEvent, cancelled = false) => {
      if (finishEvent.pointerId !== event.pointerId) return;
      const deleteRequested = moved && pointerInside(els.trashDropZone, finishEvent.clientX, finishEvent.clientY);
      target.removeEventListener('pointermove', move);
      target.removeEventListener('pointerup', finish);
      target.removeEventListener('pointercancel', cancel);
      try { if (target.hasPointerCapture(event.pointerId)) target.releasePointerCapture(event.pointerId); } catch (_) {}
      target.classList.remove('dragging');
      els.megaTube.classList.remove('dragging-layer');
      setTrashZone(false);
      els.dropGuide.classList.remove('visible');
      hideDropMagnifier();
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
    target.addEventListener('pointermove', move);
    target.addEventListener('pointerup', finish);
    target.addEventListener('pointercancel', cancel);
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
      finish: () => { state.selected = {kind: 'colour', id: stop.id}; },
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
    button.dataset.layerKind = 'effect';
    button.dataset.anchorOffset = String(event.offset);
    button.dataset.visualPosition = String(event.position ?? positionFromOffset(event.offset));
    button.dataset.layerId = event.id;
    button.classList.toggle('selected', state.selected?.kind === 'event' && state.selected.id === event.id);
    if (event.type === 'sprite') {
      button.innerHTML = `<i style="background-image:var(--arena-sprite-${event.value})"></i>`;
    } else {
      button.innerHTML = `<span>${key === 'br' ? '↵' : (EFFECT_BY_KEY[key]?.label || key).slice(0, 3)}</span>`;
    }
    button.setAttribute('role', 'slider');
    button.setAttribute('aria-label', `${eventLabel(event)} bubble at ${Math.round((event.position ?? positionFromOffset(event.offset)) * 100)} percent, compiled at text position ${event.offset}. Drag to move; press Enter to edit.`);
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
      finish: () => { state.selected = {kind: 'event', id: event.id}; },
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
    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'inspector-close';
    close.textContent = '×';
    close.setAttribute('aria-label', 'Close layer inspector');
    close.addEventListener('click', clearSelection);
    header.appendChild(close);
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
    setActiveTab(state.selected.kind === 'colour' ? 'colours' : 'effects');
  }

  function renderColourInspector(stop) {
    const currentPercent = Math.round(stop.position * 100);
    els.layerInspector.replaceChildren(inspectorHeader('COLOUR', stop.colour, `${currentPercent}% ACROSS TUBE`));
    const body = document.createElement('div');
    body.className = 'inspector-controls';
    const picker = document.createElement('input');
    picker.type = 'color';
    picker.value = stop.colour;
    picker.setAttribute('aria-label', 'Selected colour');
    const hex = document.createElement('input');
    hex.type = 'text';
    hex.value = stop.colour;
    hex.maxLength = 7;
    hex.setAttribute('aria-label', 'Selected colour hex code');
    const applyColour = (value) => {
      const clean = normaliseHex(value);
      if (!clean) return;
      mutate(() => {
        stop.colour = clean;
        state.selected = {kind: 'colour', id: stop.id};
      }, `Colour changed to ${clean}`);
    };
    picker.addEventListener('change', () => {
      hex.value = picker.value.toUpperCase();
      applyColour(picker.value);
    });
    hex.addEventListener('change', () => {
      const clean = normaliseHex(hex.value);
      if (!clean) {
        hex.setAttribute('aria-invalid', 'true');
        announce('Use a six-digit hex colour', true);
        return;
      }
      applyColour(clean);
    });
    const fields = document.createElement('div');
    fields.className = 'inspector-fields';
    fields.append(
      labelledControl('COLOUR', picker),
      labelledControl('HEX', hex),
      positionStepper(currentPercent, 100, (percent) => mutate(() => {
        stop.position = percent / 100;
        state.selected = {kind: 'colour', id: stop.id};
      }, `Colour moved to ${percent}%`))
    );
    const actions = document.createElement('div');
    actions.className = 'inspector-actions';
    actions.append(
      actionButton('MORE COLOURS', 'more-choices-button', openSelectedChoices),
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

  function positionStepper(value, maximum, update) {
    const wrap = document.createElement('div');
    wrap.className = 'position-stepper';
    const previous = actionButton('←', 'step-button', () => update(Math.max(0, value - 1)));
    previous.setAttribute('aria-label', 'Move layer one character left');
    previous.disabled = value <= 0;
    const readout = document.createElement('span');
    readout.innerHTML = `<small>POSITION</small><b>${value} / ${maximum}</b>`;
    const next = actionButton('→', 'step-button', () => update(Math.min(maximum, value + 1)));
    next.setAttribute('aria-label', 'Move layer one character right');
    next.disabled = value >= maximum;
    wrap.append(previous, readout, next);
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
      const value = document.createElement('input');
      value.type = 'number';
      value.min = String(definition.min);
      value.max = String(definition.max);
      value.step = String(definition.step);
      value.value = eventValue(event);
      value.addEventListener('change', () => mutate(() => {
        const safe = Math.max(definition.min, Math.min(definition.max, Number(value.value)));
        event.code = `<${key}=${Logic.shortestNumber(safe, definition.value)}>`;
        state.selected = {kind: 'event', id: event.id};
      }, `${definition.label} updated`));
      fields.appendChild(labelledControl('VALUE', value));
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
    const visualPercent = Math.round((event.position ?? positionFromOffset(event.offset)) * 100);
    fields.appendChild(positionStepper(visualPercent, 100, (percent) => mutate(() => {
      event.position = percent / 100;
      event.offset = offsetFromPosition(event.position);
      state.selected = {kind: 'event', id: event.id};
    }, `${eventLabel(event)} bubble moved to ${percent}%`)));
    const actions = document.createElement('div');
    actions.className = 'inspector-actions';
    actions.append(
      actionButton(event.type === 'sprite' ? 'MORE SPRITES / FX' : 'MORE FX', 'more-choices-button', openSelectedChoices),
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
      ? `USE AT ${Math.round((pendingLayerPosition ?? colourCaretPosition()) * 100)}%`
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
      state.selected = {kind: 'colour', id: newStop.id};
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
    renderInspector();
    setCaret(safeOffset, false);
    setActiveTab(category);
    const label = category === 'colours' ? 'colour' : 'effect or sprite';
    announce(category === 'colours'
      ? `Colour point locked at ${Math.round(pendingLayerPosition * 100)}% — choose a ${label}`
      : `FX bubble locked at ${Math.round(pendingLayerPosition * 100)}% — it compiles at text position ${safeOffset}`);
  }

  function cancelPendingLayer() {
    pendingLayerOffset = null;
    pendingLayerPosition = null;
    pendingLayerCategory = null;
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
    announce(`Drag the ${payload.kind === 'colour' ? 'Colour' : 'FX'} bubble onto the name first`, true);
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
      state.selected = {kind: 'event', id: event.id};
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
        }
        ghost.style.left = `${moveEvent.clientX}px`;
        ghost.style.top = `${moveEvent.clientY}px`;
        const bounds = els.tubeTrack.getBoundingClientRect();
        const inside = moveEvent.clientX >= bounds.left && moveEvent.clientX <= bounds.right &&
          moveEvent.clientY >= bounds.top && moveEvent.clientY <= bounds.bottom;
        if (!inside) {
          showCanvasDropTarget(null);
          hideDropMagnifier();
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
        showDropMagnifier(target, offset, moveEvent.clientX, payload.category === 'colours' ? visualPosition : null);
        els.megaTube.classList.add('drop-ready');
      };
      const cleanup = () => {
        element.removeEventListener('pointermove', move);
        element.removeEventListener('pointerup', finish);
        element.removeEventListener('pointercancel', cancel);
        try { if (element.hasPointerCapture(event.pointerId)) element.releasePointerCapture(event.pointerId); } catch (_) {}
        ghost?.remove();
        element.classList.remove('dragging');
        els.megaTube.classList.remove('source-dragging', 'drop-ready');
        showCanvasDropTarget(null);
        hideDropMagnifier();
        els.dropGuide.classList.remove('visible');
      };
      const finish = (finishEvent) => {
        if (finishEvent.pointerId !== event.pointerId) return;
        cleanup();
        if (!moved) {
          announce(`Drag the ${payload.category === 'colours' ? 'Colour' : 'FX'} bubble onto the name`);
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
      element.addEventListener('pointermove', move);
      element.addEventListener('pointerup', finish);
      element.addEventListener('pointercancel', cancel);
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

  function wheelColourAt(x, y) {
    const radius = els.colourWheel.width / 2;
    const dx = x - radius;
    const dy = y - radius;
    const distance = Math.min(1, Math.hypot(dx, dy) / radius);
    const hue = (Math.atan2(dy, dx) * 180 / Math.PI + 360) % 360;
    return hslToHex(hue, distance, .5 + (1 - distance) * .5);
  }

  function drawColourWheel() {
    const canvas = els.colourWheel;
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
        const colour = wheelColourAt(x, y);
        image.data[index] = Number.parseInt(colour.slice(1, 3), 16);
        image.data[index + 1] = Number.parseInt(colour.slice(3, 5), 16);
        image.data[index + 2] = Number.parseInt(colour.slice(5, 7), 16);
        image.data[index + 3] = 255;
      }
    }
    context.putImageData(image, 0, 0);
  }

  function positionWheelCursor(colour) {
    const hsl = hexToHsl(colour);
    const radians = hsl.hue * Math.PI / 180;
    const distance = hsl.saturation * 50;
    els.wheelCursor.style.left = `${50 + Math.cos(radians) * distance}%`;
    els.wheelCursor.style.top = `${50 + Math.sin(radians) * distance}%`;
    els.wheelCursor.style.setProperty('--cursor-colour', colour);
  }

  function setColourDraft(colour) {
    const clean = normaliseHex(colour);
    if (!clean) return false;
    els.colourHex.value = clean;
    els.colourPicker.value = clean;
    positionWheelCursor(clean);
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

  function previewStyle(preset) {
    const manualEvents = state.events.filter((event) => event.source !== 'stylized-preset');
    setPreview({
      colours: preset.colours ? makeColours(preset.colours) : state.colours,
      formatting: {bold: false, italic: false, underline: false, strike: false, ...clone(preset.formatting)},
      effects: Logic.normaliseEffects(clone(preset.effects)),
      events: [...manualEvents, ...styledPresetEvents(preset)]
    });
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

  function renderSavedCompositions() {
    els.savedCompositions.replaceChildren();
    if (!state.savedCompositions.length) {
      const empty = document.createElement('p');
      empty.className = 'empty-saved';
      empty.textContent = 'NO SAVED PRESETS YET';
      els.savedCompositions.appendChild(empty);
      return;
    }
    state.savedCompositions.forEach((entry, index) => {
      const row = document.createElement('div');
      row.className = 'saved-composition';
      const load = document.createElement('button');
      load.type = 'button';
      load.className = 'load-composition';
      const colours = entry.composition.colours?.map((stop) => stop.colour).filter(Logic.validHex) || ['#FFFFFF'];
      const fxCount = entry.composition.events?.length || 0;
      load.innerHTML = `<i style="background:${gradientFromColours(colours)}"></i><span><b>${escapeHtml(entry.name)}</b><small>${colours.length} COLOURS · ${fxCount} POSITIONED FX</small></span><em>LOAD</em>`;
      load.addEventListener('click', () => mutate(() => {
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
      }, `${entry.name} loaded`));
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'remove-saved';
      remove.textContent = '×';
      remove.setAttribute('aria-label', `Delete saved preset ${entry.name}`);
      remove.addEventListener('click', () => {
        state.savedCompositions.splice(index, 1);
        persist();
        renderSavedCompositions();
        announce(`${entry.name} deleted`);
      });
      row.append(load, remove);
      els.savedCompositions.appendChild(row);
    });
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
    renderSavedCompositions();
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

  function renderRecentEffects() {
    els.recentEffects.replaceChildren();
    const available = state.selected?.kind !== 'global' && state.recentEffects.length;
    els.recentEffects.hidden = !available;
    if (!available) return;
    state.recentEffects.forEach((entry) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'recent-choice';
      button.innerHTML = `<span>${entry.label}</span><code>${entry.payload.event.code || `SPRITE ${entry.payload.event.value}`}</code>`;
      button.addEventListener('click', () => selectSourcePayload(clone(entry.payload), entry.label));
      els.recentEffects.appendChild(button);
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
    else if (key === 'rotate') example.append(letter('A', 'tilt-left'), letter('A', 'tilt-right'));
    else if (key === 'voffset') example.append(letter('A', 'low'), letter('A', 'high'));
    else if (key === 'pos') example.append(letter('A', 'positioned'));
    else if (key === 'sup') example.append(letter('A'), letter('A', 'sup'));
    else if (key === 'sub') example.append(letter('A'), letter('A', 'sub'));
    else if (key === 'br') example.append(letter('A'), letter('B', 'new-line'));
    else if (key === 'mspace') example.append(letter('A', 'cell'), letter('A', 'cell'));
    else if (key === 'space') example.append(letter('A'), letter('A', 'spaced'));
    else if (key === 'mark') example.append(letter('Aa', 'marked'));
    else if (key === 'alpha') example.append(letter('Aa', 'faded'));
    else if (key === 'bold') example.append(letter('Aa', 'bold'));
    else if (key === 'italic') example.append(letter('Aa', 'italic'));
    else if (key === 'underline') example.append(letter('Aa', 'underline'));
    else if (key === 'strike') example.append(letter('Aa', 'strike'));
    else if (key === 'allCaps') example.append(letter('Aa'), letter('AA', 'after'));
    else if (key === 'smallCaps') example.append(letter('Aa', 'smallcaps'));
    container.appendChild(example);
  }

  function renderEffectSources() {
    els.effectSources.replaceChildren();
    renderRecentEffects();
    EFFECTS.forEach((effect) => {
      if (effect.wholeName) return;
      const card = document.createElement('div');
      card.className = `effect-source-card source-${effect.key}`;
      const payload = effectPayload(effect.key);
      const place = document.createElement('button');
      place.type = 'button';
      place.className = 'effect-source';
      place.disabled = !payload;
      place.innerHTML = `<span><b>${effect.label}</b><small>PLACE AT THIS POSITION</small><code>${effect.code}</code></span>`;
      renderFxExample(place, effect.key);
      place.setAttribute('aria-label', `Choose ${effect.label} for the current position.`);
      if (payload) {
        place.addEventListener('click', () => selectSourcePayload(effectPayload(effect.key), effect.label));
      }
      card.appendChild(place);
      els.effectSources.appendChild(card);
    });
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
            state.colours = makeColours(state.wubrg.map((manaCode) => MANA[manaCode].colour));
          }
          state.selected = null;
          state.activeTab = 'wubrg';
        }, state.wubrg.includes(code) ? `${MANA[code].name} removed` : `${MANA[code].name} added`);
      });
      els.wubrgComposer.appendChild(button);
    });
    els.wubrgIdentity.textContent = identityName(state.wubrg);
    els.wubrgOrder.textContent = state.wubrg.length ? state.wubrg.join(' → ') : '—';
    els.clearWubrg.disabled = !state.wubrg.length;
    renderWubrgResults();
  }

  function applyWubrgRecipe(recipe) {
    const sameIdentity = state.wubrg.length === recipe.codes.length
      && canonicalIdentity(state.wubrg) === canonicalIdentity(recipe.codes);
    const nextCodes = sameIdentity
      ? [...state.wubrg.slice(1), state.wubrg[0]]
      : recipe.codes.slice();
    mutate(() => {
      state.wubrg = nextCodes;
      state.colours = makeColours(nextCodes.map((code) => MANA[code].colour));
      state.selected = null;
      state.activeTab = 'wubrg';
    }, sameIdentity ? `${recipe.name} order rotated` : `${recipe.name} applied`);
  }

  function renderWubrgResults() {
    els.wubrgResults.replaceChildren();
    const required = Array.from(new Set(state.wubrg));
    if (!required.length) {
      els.wubrgContext.textContent = 'SELECT PIPS · COLOURS APPLY IMMEDIATELY';
      return;
    }
    let recipes = identityRecipes().filter((recipe) => required.every((code) => recipe.codes.includes(code)));
    if (required.length >= 4) {
      recipes = [{key: canonicalIdentity(required), name: required.length === 4 ? 'FOUR COLOUR' : 'FIVE COLOUR', codes: required.slice()}];
    } else {
      recipes = recipes.slice(0, 12);
    }
    els.wubrgContext.textContent = `${recipes.length} MATCHING ${recipes.length === 1 ? 'IDENTITY' : 'IDENTITIES'} · TAP THE ACTIVE ONE TO ROTATE`;
    recipes.forEach((recipe) => {
      const button = document.createElement('button');
      button.type = 'button';
      const selected = state.wubrg.length === recipe.codes.length
        && canonicalIdentity(state.wubrg) === canonicalIdentity(recipe.codes);
      button.className = 'wubrg-quick-preset';
      button.classList.toggle('selected', selected);
      button.style.setProperty('--preset', gradientFromColours(recipe.codes.map((code) => MANA[code].colour)));
      button.innerHTML = `<b>${recipe.name}</b><span>${selected ? `${state.wubrg.join(' → ')} · ROTATE` : recipe.codes.join(' / ')}</span>`;
      attachPresetPreview(button, () => previewColours(recipe.codes.map((code) => MANA[code].colour)));
      button.addEventListener('click', () => applyWubrgRecipe(recipe));
      els.wubrgResults.appendChild(button);
    });
  }

  function gradientFromColours(colours) {
    if (colours.length === 1) return colours[0];
    return `linear-gradient(90deg,${colours.map((colour, index) => `${colour} ${index / (colours.length - 1) * 100}%`).join(',')})`;
  }

  function renderPresets() {
    els.colourPresets.replaceChildren();
    COLOUR_PRESETS.forEach((preset) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'preset-card colour-preset-card';
      button.innerHTML = `<span class="preset-gradient" style="background:${gradientFromColours(preset.colours)}"></span><span><b>${preset.name}</b><small>${preset.note} · ${preset.colours.length} COLOURS</small></span><em>APPLY</em>`;
      attachPresetPreview(button, () => previewColours(preset.colours));
      button.addEventListener('click', () => applyColourRecipe(preset.colours, preset.name));
      els.colourPresets.appendChild(button);
    });
    els.stylePresets.replaceChildren();
    STYLE_PRESETS.forEach((preset) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `preset-card style-preset-card preset-${preset.id}`;
      const sampleStyle = [];
      if (preset.formatting.italic) sampleStyle.push('font-style:italic');
      if (preset.formatting.underline) sampleStyle.push('text-decoration:underline');
      if (preset.formatting.strike) sampleStyle.push('text-decoration:line-through');
      if (preset.effects.rotate?.enabled) sampleStyle.push(`transform:rotate(${preset.effects.rotate.value}deg)`);
      if (preset.effects.size?.enabled) sampleStyle.push(`font-size:${Math.min(25, Number(preset.effects.size.value) + 5)}px`);
      if (preset.colours) sampleStyle.push(`background:${gradientFromColours(preset.colours)}`, 'color:transparent', 'background-clip:text');
      button.innerHTML = `<span class="style-sample" style="${sampleStyle.join(';')}">${preset.sample}</span><span><b>${preset.name}</b><small>${preset.note}</small></span><em>APPLY</em>`;
      attachPresetPreview(button, () => previewStyle(preset));
      button.addEventListener('click', () => mutate(() => {
        state.formatting = {bold: false, italic: false, underline: false, strike: false, ...clone(preset.formatting)};
        state.effects = Logic.normaliseEffects(clone(preset.effects));
        if (preset.colours) {
          state.colours = makeColours(preset.colours);
          state.wubrg = [];
        }
        state.events = [
          ...state.events.filter((event) => event.source !== 'stylized-preset'),
          ...styledPresetEvents(preset)
        ];
        state.selected = null;
        state.activeTab = null;
      }, `${preset.name} layered onto the live name`));
      els.stylePresets.appendChild(button);
    });
  }

  function setActiveTab(name, focus = false) {
    const valid = ['colours', 'effects', 'wubrg', 'presets'];
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
    els.sourceLibrary.hidden = !state.activeTab;
    if (state.activeTab && changed) {
      requestAnimationFrame(() => {
        const panel = document.querySelector(`[data-panel="${state.activeTab}"]`);
        if (panel) panel.scrollTop = 0;
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
    renderSavedCompositions();
    setActiveTab(state.activeTab);
  }

  async function copyText(text, label = 'Copied') {
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
    announce(label);
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

  function offsetFromCanvasEvent(event) {
    const target = canvasTargetFromPoint(event.clientX, event.target);
    if (target) return Number(target.dataset.dropOffset);
    const bounds = els.tubeNameCanvas.getBoundingClientRect();
    const position = Math.max(0, Math.min(1, (event.clientX - bounds.left) / Math.max(1, bounds.width)));
    return offsetFromPosition(position);
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

  function showDropMagnifier(target, offset, clientX, colourPosition = null) {
    const safeOffset = Math.max(0, Math.min(state.name.length, Number(offset) || 0));
    const isColour = colourPosition !== null;
    const percent = isColour ? Math.round(colourPosition * 100) : null;
    const glyph = isColour
      ? `${percent}%`
      : safeOffset >= state.name.length
        ? 'END'
        : state.name[safeOffset] === ' '
          ? '␠'
          : state.name[safeOffset] || '∅';
    const bounds = els.tubeTrack.getBoundingClientRect();
    const left = Math.max(54, Math.min(bounds.width - 54, clientX - bounds.left));
    els.dropMagnifier.style.left = `${left}px`;
    els.dropMagnifierGlyph.textContent = glyph;
    els.dropMagnifierLabel.textContent = isColour
      ? percent === 0
        ? 'LEFT EDGE'
        : percent === 100
          ? 'RIGHT EDGE'
          : 'COLOUR POINT'
      : safeOffset >= state.name.length
        ? `END · POSITION ${safeOffset}`
        : `BEFORE ${state.name[safeOffset] === ' ' ? 'SPACE' : state.name[safeOffset]} · POSITION ${safeOffset}`;
    els.dropMagnifier.hidden = false;
    if (target) target.classList.add('drop-hover');
  }

  function hideDropMagnifier() {
    els.dropMagnifier.hidden = true;
  }

  function selectWheelPoint(event) {
    const bounds = els.colourWheel.getBoundingClientRect();
    const scaleX = els.colourWheel.width / Math.max(1, bounds.width);
    const scaleY = els.colourWheel.height / Math.max(1, bounds.height);
    const radius = els.colourWheel.width / 2;
    let x = (event.clientX - bounds.left) * scaleX;
    let y = (event.clientY - bounds.top) * scaleY;
    const dx = x - radius;
    const dy = y - radius;
    const distance = Math.hypot(dx, dy);
    if (distance > radius) {
      x = radius + dx / distance * radius;
      y = radius + dy / distance * radius;
    }
    setColourDraft(wheelColourAt(x, y));
  }

  function installEvents() {
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
    els.copyButton.addEventListener('click', () => copyText(currentBuild?.raw, currentBuild?.overLimit ? 'Copied — Arena may truncate it' : 'Arena name copied'));
    els.undoButton.addEventListener('click', undo);
    els.redoButton.addEventListener('click', redo);
    els.clearFxButton.addEventListener('click', () => mutate(() => {
      state.formatting = {bold: false, italic: false, underline: false, strike: false};
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
    els.clearWubrg.addEventListener('click', () => {
      state.wubrg = [];
      persist();
      renderWubrg();
    });
    els.saveComposition.addEventListener('click', saveCurrentComposition);
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
    const colourReservoirPayload = {kind: 'reservoir', category: 'colours'};
    const fxReservoirPayload = {kind: 'reservoir', category: 'effects'};
    enableReservoirDrag(els.colourLayerBubble, colourReservoirPayload);
    enableReservoirDrag(els.fxLayerBubble, fxReservoirPayload);
    document.querySelectorAll('[data-tab]').forEach((tab) => {
      tab.addEventListener('click', () => {
        cancelPendingLayer();
        state.selected = null;
        renderInspector();
        setActiveTab(state.activeTab === tab.dataset.tab ? null : tab.dataset.tab);
      });
      tab.addEventListener('keydown', (event) => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        const tabs = Array.from(document.querySelectorAll('[data-tab]'));
        const current = tabs.indexOf(tab);
        const next = event.key === 'Home' ? 0
          : event.key === 'End' ? tabs.length - 1
            : (current + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
        setActiveTab(tabs[next].dataset.tab, true);
      });
    });
    document.querySelectorAll('[data-close-panel]').forEach((button) => {
      button.addEventListener('click', () => {
        cancelPendingLayer();
        setActiveTab(null);
      });
    });
    document.querySelectorAll('[data-close-context]').forEach((button) => {
      button.addEventListener('click', () => {
        cancelPendingLayer();
        state.selected = null;
        setActiveTab(null);
        renderInspector();
      });
    });
    els.tubeNameCanvas.addEventListener('click', (event) => {
      const offset = offsetFromCanvasEvent(event);
      setCaret(offset, false);
      announce(`Text position set to ${state.caret}`);
    });
    els.tubeTrack.addEventListener('click', (event) => {
      if (event.target.closest('.tube-token, .tube-name-canvas')) return;
      setCaret(offsetFromPosition(tubePosition(event.clientX)), false);
      announce(`Text position set to ${state.caret}`);
    });
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
    window.addEventListener('resize', () => requestAnimationFrame(layoutRailTokens));
    document.fonts?.ready?.then(() => {
      renderOutput();
      renderTube();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        if (pendingLayerOffset !== null) {
          cancelPendingLayer();
          setActiveTab(null);
          announce('New layer cancelled');
        } else if (state.activeTab) {
          setActiveTab(null);
        } else if (state.selected) {
          clearSelection();
        }
      }
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault();
        copyText(currentBuild?.raw, 'Arena name copied');
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
