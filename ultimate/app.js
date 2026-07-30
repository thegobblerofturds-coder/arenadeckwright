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
      colours: ['#73F2FF', '#85B8FF', '#D694FF', '#FFB4E6'],
      formatting: {}, effects: {cspace: {enabled: true, value: 2}}, pattern: 'bubbles'
    },
    {
      id: 'drift-away', name: 'DRIFT AWAY', note: 'SHRINK, RISE, FADE, AND SPACE OUT', sample: 'drift',
      colours: ['#F4FBFF', '#9CDBFF', '#848BFF'],
      formatting: {italic: true}, effects: {cspace: {enabled: true, value: 2}}, pattern: 'drift'
    },
    {
      id: 'matrix-glitch', name: 'MATRIX GLITCH', note: 'MATRIX GREEN + STAGGERED GLITCH', sample: '0101',
      colours: ['#073B1B', '#00A846', '#00FF66', '#C8FFD9'],
      formatting: {}, effects: {allCaps: true, cspace: {enabled: true, value: 1}}, pattern: 'glitch'
    },
    {
      id: 'upside-down', name: 'UPSIDE DOWN', note: '180° ROTATION + VOID COLOUR', sample: 'ɐuǝɹ∀',
      colours: ['#B9FFEE', '#56D7D2', '#7A5CFF', '#D384FF'],
      formatting: {}, effects: {rotate: {enabled: true, value: 180}, cspace: {enabled: true, value: 1}}
    }
  ];
  const EFFECTS = [
    {key: 'italic', label: 'ITALIC', hint: 'SLANT TEXT', code: '<i>', global: 'formatting'},
    {key: 'underline', label: 'UNDERLINE', hint: 'LINE BELOW', code: '<u>', global: 'formatting'},
    {key: 'strike', label: 'STRIKE', hint: 'LINE THROUGH', code: '<s>', global: 'formatting'},
    {key: 'allCaps', label: 'ALL CAPS', hint: 'ZERO TAG COST', global: 'boolean', inline: false},
    {key: 'smallCaps', label: 'SMALL CAPS', hint: 'EXPERIMENTAL TAG', code: '<smallcaps>', global: 'boolean', inline: false},
    {key: 'sup', label: 'SUPERSCRIPT', hint: 'RAISE + SHRINK', code: '<sup>', global: 'boolean'},
    {key: 'sub', label: 'SUBSCRIPT', hint: 'LOWER + SHRINK', code: '<sub>', global: 'boolean'},
    {key: 'size', label: 'SIZE', hint: 'GLYPH SCALE', code: '<size=10>', global: 'numeric', min: 5, max: 29, step: 1, value: 10},
    {key: 'cspace', label: 'CHAR SPACE', hint: 'LETTER GAP', code: '<cspace=5>', global: 'numeric', min: -20, max: 50, step: .5, value: 5},
    {key: 'rotate', label: 'ROTATE', hint: 'PER-LETTER TILT', code: '<rotate=15>', global: 'numeric', min: -180, max: 180, step: 1, value: 15},
    {key: 'voffset', label: 'VERT OFFSET', hint: 'MOVE UP / DOWN', code: '<voffset=5>', global: 'numeric', min: -50, max: 50, step: .5, value: 5},
    {key: 'pos', label: 'POSITION', hint: 'HORIZONTAL START', code: '<pos=40>', global: 'numeric', min: 0, max: 500, step: 1, value: 40},
    {key: 'br', label: 'LINE BREAK', hint: 'BREAK AT CARET', code: '<br>', global: null},
    {key: 'mspace', label: 'MONO SPACE', hint: 'FIXED WIDTH', code: '<mspace=1em>', global: null, value: '1em'},
    {key: 'space', label: 'SPACE', hint: 'INSERT SPACING', code: '<space=1em>', global: null, value: '1em'},
    {key: 'mark', label: 'HIGHLIGHT', hint: 'MARK COLOUR', code: '<mark=#FFFF0080>', global: null, value: '#FFFF0080'},
    {key: 'alpha', label: 'ALPHA', hint: 'TEXT OPACITY', code: '<alpha=#80>', global: null, value: '#80'}
  ];
  const EFFECT_BY_KEY = Object.fromEntries(EFFECTS.map((effect) => [effect.key, effect]));
  const $ = (id) => document.getElementById(id);
  const els = {
    deckName: $('deckName'), startOver: $('startOver'), caretReadout: $('caretReadout'),
    copyButton: $('copyButton'), copyLabel: $('copyLabel'), outputPreview: $('outputPreview'),
    budgetTotal: $('budgetTotal'), budgetText: $('budgetText'), budgetColour: $('budgetColour'),
    budgetFx: $('budgetFx'), outputStatus: $('outputStatus'), colourCount: $('colourCount'),
    effectCount: $('effectCount'), spriteCount: $('spriteCount'), megaTube: $('megaTube'),
    tubeGlobals: $('tubeGlobals'), tubeTrack: $('tubeTrack'), tubeFill: $('tubeFill'),
    tubeTicks: $('tubeTicks'), tubeFxLayer: $('tubeFxLayer'), tubeColourLayer: $('tubeColourLayer'),
    tubeNameCanvas: $('tubeNameCanvas'), characterTargets: $('characterTargets'),
    dropGuide: $('dropGuide'), undoButton: $('undoButton'), redoButton: $('redoButton'),
    clearFxButton: $('clearFxButton'), tubeStatus: $('tubeStatus'), layerInspector: $('layerInspector'),
    colourPicker: $('colourPicker'), colourHex: $('colourHex'), addCustomColour: $('addCustomColour'),
    applyCustomColour: $('applyCustomColour'), colourWheel: $('colourWheel'), wheelCursor: $('wheelCursor'),
    rotateColours: $('rotateColours'), flipColours: $('flipColours'), savePalette: $('savePalette'),
    savedPalettes: $('savedPalettes'),
    colourSources: $('colourSources'), effectSources: $('effectSources'), spriteSources: $('spriteSources'),
    wubrgComposer: $('wubrgComposer'), wubrgIdentity: $('wubrgIdentity'), wubrgOrder: $('wubrgOrder'),
    applyWubrg: $('applyWubrg'), clearWubrg: $('clearWubrg'), wubrgSearch: $('wubrgSearch'),
    wubrgResults: $('wubrgResults'), colourPresets: $('colourPresets'), stylePresets: $('stylePresets'),
    rawCode: $('rawCode'), copyRawCode: $('copyRawCode'), toast: $('toast')
  };

  let nextId = 1;
  let history = [];
  let future = [];
  let currentBuild = null;
  let toastTimer = null;
  let dragPayload = null;
  let previewOverride = null;
  let armedPayload = null;
  let armedLabel = '';
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
      favourites: []
    };
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
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
      favourites: state.favourites
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
      id: event.id || uid('event')
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
    state.activeTab = ['colours', 'effects', 'wubrg', 'colour-presets', 'style-presets'].includes(saved.activeTab)
      ? saved.activeTab
      : null;
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
    future.push(snapshot());
    restoreSnapshot(history.pop());
    persist();
    renderAll();
    announce('Undid last change');
  }

  function redo() {
    if (!future.length) return;
    history.push(snapshot());
    restoreSnapshot(future.pop());
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
    return match ? match[1].toLowerCase() : 'fx';
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
    ['italic', 'underline', 'strike'].forEach((key) => {
      if (source.formatting[key]) entries.push({key, label: EFFECT_BY_KEY[key].label, code: EFFECT_BY_KEY[key].code});
    });
    ['allCaps', 'smallCaps', 'sup', 'sub'].forEach((key) => {
      if (source.effects[key]) entries.push({key, label: EFFECT_BY_KEY[key].label, code: EFFECT_BY_KEY[key].code || 'Aa→AA'});
    });
    ['size', 'cspace', 'rotate', 'voffset', 'pos'].forEach((key) => {
      if (source.effects[key]?.enabled) entries.push({
        key,
        label: EFFECT_BY_KEY[key].label,
        code: `<${key}=${source.effects[key].value}>`
      });
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

  function selectedRange(build) {
    if (!state.selected) return null;
    if (state.selected.kind === 'global') return {start: 0, end: build.text.length};
    if (state.selected.kind === 'colour') {
      const colours = state.colours.slice().sort((left, right) => left.position - right.position);
      const index = colours.findIndex((stop) => stop.id === state.selected.id);
      if (index < 0) return null;
      const start = index === 0 || build.text.length < 2 ? 0 : Math.round(colours[index].position * (build.text.length - 1));
      const end = index === colours.length - 1 || build.text.length < 2
        ? build.text.length
        : Math.max(start + 1, Math.round(colours[index + 1].position * (build.text.length - 1)));
      return {start, end};
    }
    if (state.selected.kind === 'event') {
      const selected = state.events.find((event) => event.id === state.selected.id);
      if (!selected) return null;
      if (selected.type === 'sprite' || selected.type === 'br') {
        return {start: selected.offset, end: Math.min(build.text.length, selected.offset + 1)};
      }
      const key = eventKey(selected);
      const next = state.events
        .filter((event) => event.offset > selected.offset && eventKey(event) === key)
        .sort((left, right) => left.offset - right.offset)[0];
      return {start: selected.offset, end: next?.offset ?? build.text.length};
    }
    return null;
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
    const affected = selectedRange(build);
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
          sprite.setAttribute('aria-label', `Sprite ${event.value} at caret ${offset}`);
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
      glyph.classList.toggle('affected', Boolean(affected && offset >= affected.start && offset < affected.end));
      glyph.textContent = build.text[offset];
      applyGlyphStyles(glyph, preview);
      els.outputPreview.appendChild(glyph);
    }
    const endTarget = document.createElement('span');
    endTarget.className = 'preview-end-target';
    endTarget.dataset.dropOffset = String(build.text.length);
    endTarget.setAttribute('aria-label', `End of name, caret ${build.text.length}`);
    els.outputPreview.appendChild(endTarget);
  }

  function gradientCss() {
    const stops = effectiveState().colours.slice().sort((left, right) => left.position - right.position);
    if (stops.length === 1) return stops[0].colour;
    return `linear-gradient(90deg,${stops.map((stop) => `${stop.colour} ${(stop.position * 100).toFixed(2)}%`).join(',')})`;
  }

  function renderOutput() {
    const build = compile();
    renderPreview(build);
    els.budgetText.textContent = String(build.breakdown.text);
    els.budgetColour.textContent = String(build.breakdown.colour);
    els.budgetFx.textContent = String(build.breakdown.fx);
    els.budgetTotal.textContent = String(build.rawLength);
    els.rawCode.value = build.raw;
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
    els.caretReadout.textContent = `CARET ${state.caret} / ${state.name.length}`;
    els.tubeStatus.textContent = armedPayload
      ? `${armedLabel} READY · TAP A LETTER OR THE END SLOT · ESC TO CANCEL`
      : `ACTIVE CARET ${state.caret} · DRAG TO A LETTER OR OPEN A SOURCE MENU`;
    els.megaTube.classList.toggle('placement-armed', Boolean(armedPayload));
  }

  function renderTicks() {
    els.tubeTicks.replaceChildren();
    const length = state.name.length;
    const stride = length <= 24 ? 1 : Math.ceil(length / 24);
    for (let offset = 0; offset <= length; offset += stride) {
      const tick = document.createElement('i');
      tick.style.left = `${positionFromOffset(offset) * 100}%`;
      tick.dataset.offset = String(offset);
      els.tubeTicks.appendChild(tick);
    }
    if (length && length % stride) {
      const tick = document.createElement('i');
      tick.style.left = '100%';
      tick.dataset.offset = String(length);
      els.tubeTicks.appendChild(tick);
    }
  }

  function selectLayer(kind, id) {
    state.selected = {kind, id};
    persist();
    renderOutput();
    renderTube();
    renderInspector();
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
        target.style.setProperty('--stack-x', '0px');
        target.style.setProperty('--stack-y', '0px');
        els.megaTube.classList.add('dragging-layer');
      }
      const position = tubePosition(moveEvent.clientX);
      options.update(position);
      target.style.left = `${(options.visualPosition(position) * 100).toFixed(3)}%`;
      els.dropGuide.style.left = `${(position * 100).toFixed(3)}%`;
      els.dropGuide.classList.add('visible');
      renderOutput();
      els.tubeFill.style.background = gradientCss();
    };
    const finish = (finishEvent, cancelled = false) => {
      if (finishEvent.pointerId !== event.pointerId) return;
      target.removeEventListener('pointermove', move);
      target.removeEventListener('pointerup', finish);
      target.removeEventListener('pointercancel', cancel);
      try { if (target.hasPointerCapture(event.pointerId)) target.releasePointerCapture(event.pointerId); } catch (_) {}
      target.classList.remove('dragging');
      els.megaTube.classList.remove('dragging-layer');
      els.dropGuide.classList.remove('visible');
      if (!moved) {
        options.select();
        return;
      }
      if (cancelled) {
        restoreSnapshot(before);
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

  function colourToken(stop, index, stackIndex = 0, stackCount = 1, compiling = true) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'tube-token colour-token';
    button.style.left = `${stop.position * 100}%`;
    button.style.setProperty('--token-colour', stop.colour);
    button.style.setProperty('--stack-x', `${(stackIndex - (stackCount - 1) / 2) * 18}px`);
    button.style.setProperty('--stack-y', `${(stackIndex % 2) * 5}px`);
    button.dataset.layerId = stop.id;
    button.classList.toggle('selected', state.selected?.kind === 'colour' && state.selected.id === stop.id);
    button.classList.toggle('ghost', !compiling);
    button.innerHTML = `<span>${index + 1}</span>`;
    button.setAttribute('role', 'slider');
    button.setAttribute('aria-label', `Colour ${index + 1}, ${stop.colour}${compiling ? '' : ', currently omitted by the Arena budget'}. Drag to move; press Enter to edit.`);
    button.setAttribute('aria-valuemin', '0');
    button.setAttribute('aria-valuemax', '100');
    button.setAttribute('aria-valuenow', String(Math.round(stop.position * 100)));
    button.addEventListener('pointerdown', (event) => beginTokenDrag(event, {
      update: (position) => { stop.position = position; },
      visualPosition: (position) => position,
      select: () => selectLayer('colour', stop.id),
      finish: () => { state.selected = {kind: 'colour', id: stop.id}; }
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
      const base = state.name.length > 1 ? 1 / (state.name.length - 1) : .05;
      const step = event.shiftKey || ['PageUp', 'PageDown'].includes(event.key) ? base * 5 : base;
      mutate(() => {
        if (event.key === 'Home') stop.position = 0;
        else if (event.key === 'End') stop.position = 1;
        else if (event.key === 'ArrowLeft' || event.key === 'PageDown') stop.position -= step;
        else stop.position += step;
        state.selected = {kind: 'colour', id: stop.id};
      }, `Moved colour ${index + 1}`);
      requestAnimationFrame(() => document.querySelector(`[data-layer-id="${stop.id}"]`)?.focus());
    });
    return button;
  }

  function eventToken(event, stackIndex = 0, stackCount = 1) {
    const key = eventKey(event);
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `tube-token effect-token token-${key}`;
    if (event.type === 'sprite') button.classList.add('sprite-token');
    button.style.left = `${positionFromOffset(event.offset) * 100}%`;
    button.style.setProperty('--stack-x', `${(stackIndex - (stackCount - 1) / 2) * 20}px`);
    button.style.setProperty('--stack-y', `${(stackIndex % 2) * 6}px`);
    button.dataset.layerId = event.id;
    button.classList.toggle('selected', state.selected?.kind === 'event' && state.selected.id === event.id);
    if (event.type === 'sprite') {
      button.innerHTML = `<i style="background-image:var(--arena-sprite-${event.value})"></i>`;
    } else {
      button.innerHTML = `<span>${key === 'br' ? '↵' : (EFFECT_BY_KEY[key]?.label || key).slice(0, 3)}</span>`;
    }
    button.setAttribute('role', 'slider');
    button.setAttribute('aria-label', `${eventLabel(event)} at caret ${event.offset}. Drag to move; press Enter to edit.`);
    button.setAttribute('aria-valuemin', '0');
    button.setAttribute('aria-valuemax', String(state.name.length));
    button.setAttribute('aria-valuenow', String(event.offset));
    button.addEventListener('pointerdown', (pointerEvent) => beginTokenDrag(pointerEvent, {
      update: (position) => { event.offset = offsetFromPosition(position); },
      visualPosition: () => positionFromOffset(event.offset),
      select: () => selectLayer('event', event.id),
      finish: () => { state.selected = {kind: 'event', id: event.id}; }
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
        if (keyEvent.key === 'Home') event.offset = 0;
        else if (keyEvent.key === 'End') event.offset = state.name.length;
        else if (keyEvent.key === 'ArrowLeft' || keyEvent.key === 'PageDown') event.offset -= step;
        else event.offset += step;
        state.selected = {kind: 'event', id: event.id};
      }, `Moved ${eventLabel(event)}`);
      requestAnimationFrame(() => document.querySelector(`[data-layer-id="${event.id}"]`)?.focus());
    });
    return button;
  }

  function renderTube() {
    els.tubeFill.style.background = gradientCss();
    renderTicks();
    els.tubeColourLayer.replaceChildren();
    els.tubeFxLayer.replaceChildren();
    const sortedColours = state.colours.slice().sort((left, right) => left.position - right.position);
    const compilingCount = Math.max(1, Math.min(sortedColours.length, currentBuild?.requestedSegments?.length || sortedColours.length));
    const compilingIndices = new Set(compilingCount === 1
      ? [0]
      : Array.from({length: compilingCount}, (_, index) => Math.round(index * (sortedColours.length - 1) / (compilingCount - 1))));
    sortedColours.forEach((stop, index) => {
      const cluster = sortedColours.filter((candidate) => Math.abs(candidate.position - stop.position) < .001);
      els.tubeColourLayer.appendChild(colourToken(stop, index, cluster.indexOf(stop), cluster.length, compilingIndices.has(index)));
    });
    state.events.forEach((event) => {
      const cluster = state.events.filter((candidate) => candidate.offset === event.offset);
      els.tubeFxLayer.appendChild(eventToken(event, cluster.indexOf(event), cluster.length));
    });
    els.tubeGlobals.replaceChildren();
    activeGlobals().forEach((entry) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'global-token';
      button.classList.toggle('selected', state.selected?.kind === 'global' && state.selected.id === entry.key);
      button.innerHTML = `<b>${entry.label}</b><code>${entry.code}</code>`;
      button.setAttribute('aria-label', `Global ${entry.label}. Click to edit.`);
      button.addEventListener('click', () => selectLayer('global', entry.key));
      els.tubeGlobals.appendChild(button);
    });
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

  function renderColourInspector(stop) {
    els.layerInspector.replaceChildren(inspectorHeader('COLOUR LAYER', stop.colour, `POSITION ${Math.round(stop.position * 100)}%`));
    const body = document.createElement('div');
    body.className = 'inspector-controls colour-inspector-controls';
    const picker = document.createElement('input');
    picker.type = 'color';
    picker.value = stop.colour;
    picker.setAttribute('aria-label', 'Selected colour');
    const hex = document.createElement('input');
    hex.type = 'text';
    hex.value = stop.colour;
    hex.maxLength = 7;
    hex.setAttribute('aria-label', 'Selected colour hex code');
    const position = document.createElement('input');
    position.type = 'range';
    position.min = '0';
    position.max = '100';
    position.step = '1';
    position.value = String(Math.round(stop.position * 100));
    position.setAttribute('aria-label', 'Colour position in Mega Tube');
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
    position.addEventListener('change', () => mutate(() => {
      stop.position = Number(position.value) / 100;
      state.selected = {kind: 'colour', id: stop.id};
    }, 'Colour position updated'));
    const fields = document.createElement('div');
    fields.className = 'inspector-fields';
    fields.append(
      labelledControl('COLOUR', picker),
      labelledControl('HEX', hex),
      labelledControl('TUBE POSITION', position)
    );
    const actions = document.createElement('div');
    actions.className = 'inspector-actions';
    actions.append(
      actionButton('OPEN COLOUR MENU', 'quiet-button', () => {
        setColourDraft(stop.colour);
        setActiveTab('colours');
      }),
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

  function renderEventInspector(event) {
    const key = eventKey(event);
    const definition = EFFECT_BY_KEY[key];
    els.layerInspector.replaceChildren(inspectorHeader(
      event.type === 'sprite' ? 'SPRITE LAYER' : 'POSITIONED FX LAYER',
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
    const position = document.createElement('input');
    position.type = 'range';
    position.min = '0';
    position.max = String(state.name.length);
    position.step = '1';
    position.value = String(event.offset);
    position.setAttribute('aria-label', 'Effect caret position');
    position.addEventListener('change', () => mutate(() => {
      event.offset = Number(position.value);
      state.selected = {kind: 'event', id: event.id};
    }, `${eventLabel(event)} moved to caret ${position.value}`));
    fields.appendChild(labelledControl(`CARET ${event.offset} / ${state.name.length}`, position));
    const actions = document.createElement('div');
    actions.className = 'inspector-actions';
    actions.append(
      actionButton('DUPLICATE', 'quiet-button', () => duplicateEvent(event.id)),
      actionButton('DELETE', 'delete-button', () => removeEvent(event.id))
    );
    body.append(fields, actions);
    els.layerInspector.appendChild(body);
  }

  function globalEnabled(key) {
    const definition = EFFECT_BY_KEY[key];
    if (!definition) return false;
    if (definition.global === 'formatting') return Boolean(state.formatting[key]);
    if (definition.global === 'numeric') return Boolean(state.effects[key]?.enabled);
    return Boolean(state.effects[key]);
  }

  function toggleGlobal(key, force) {
    const definition = EFFECT_BY_KEY[key];
    if (!definition?.global) return;
    const next = force === undefined ? !globalEnabled(key) : Boolean(force);
    if (definition.global === 'formatting') state.formatting[key] = next;
    else if (definition.global === 'numeric') {
      state.effects[key] = {enabled: next, value: state.effects[key]?.value ?? definition.value};
    } else {
      state.effects[key] = next;
      if (key === 'sup' && next) state.effects.sub = false;
      if (key === 'sub' && next) state.effects.sup = false;
    }
  }

  function renderGlobalInspector(key) {
    const definition = EFFECT_BY_KEY[key];
    if (!definition) {
      state.selected = null;
      renderInspector();
      return;
    }
    const code = key === 'allCaps'
      ? 'ZERO TAG COST'
      : definition.global === 'numeric'
        ? `<${key}=${state.effects[key].value}>`
        : definition.code;
    els.layerInspector.replaceChildren(inspectorHeader('GLOBAL STYLE LAYER', definition.label, code));
    const body = document.createElement('div');
    body.className = 'inspector-controls';
    const fields = document.createElement('div');
    fields.className = 'inspector-fields';
    if (definition.global === 'numeric') {
      const value = document.createElement('input');
      value.type = 'range';
      value.min = String(definition.min);
      value.max = String(definition.max);
      value.step = String(definition.step);
      value.value = state.effects[key].value;
      const exact = document.createElement('input');
      exact.type = 'number';
      exact.min = String(definition.min);
      exact.max = String(definition.max);
      exact.step = String(definition.step);
      exact.value = state.effects[key].value;
      const update = (raw) => mutate(() => {
        const safe = Math.max(definition.min, Math.min(definition.max, Number(raw)));
        state.effects[key] = {enabled: true, value: Logic.shortestNumber(safe, definition.value)};
        state.selected = {kind: 'global', id: key};
      }, `${definition.label} updated`);
      value.addEventListener('change', () => update(value.value));
      exact.addEventListener('change', () => update(exact.value));
      fields.append(labelledControl('VALUE', exact), labelledControl(`${definition.min} — ${definition.max}`, value));
    } else {
      const explanation = document.createElement('p');
      explanation.className = 'inspector-note';
      explanation.textContent = definition.hint;
      fields.appendChild(explanation);
    }
    const actions = document.createElement('div');
    actions.className = 'inspector-actions';
    if (effectPayload(key)) {
      actions.appendChild(actionButton('DUPLICATE AT CARET', 'quiet-button', () => {
        insertPayload(effectPayload(key), state.caret);
      }));
    }
    actions.appendChild(actionButton('REMOVE GLOBAL', 'delete-button', () => mutate(() => {
      toggleGlobal(key, false);
      state.selected = null;
    }, `${definition.label} removed`)));
    body.append(fields, actions);
    els.layerInspector.appendChild(body);
  }

  function renderInspector() {
    const selected = state.selected;
    els.applyCustomColour.disabled = selected?.kind !== 'colour';
    if (!selected) {
      els.layerInspector.innerHTML = '<div class="inspector-empty"><span>SELECT A BUBBLE</span><p>Edit, duplicate, or delete a colour, effect, or sprite layer here.</p></div>';
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
    if (selected.kind === 'global') return renderGlobalInspector(selected.id);
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
    }, `${clean} added at the active caret`);
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

  function insertPayload(payload, offset = state.caret, position = null) {
    if (!payload) return;
    if (payload.kind === 'colour') {
      addColour(payload.colour, position ?? colourCaretPosition());
      return;
    }
    const event = {
      ...payload.event,
      id: uid('event'),
      offset: Math.max(0, Math.min(state.name.length, Math.round(offset))),
      sequence: state.events.reduce((highest, item) => Math.max(highest, Number(item.sequence) || 0), 0) + 1
    };
    mutate(() => {
      state.events.push(event);
      state.selected = {kind: 'event', id: event.id};
    }, `${eventLabel(event)} layered at caret ${event.offset}`);
  }

  function removeEvent(id) {
    mutate(() => {
      state.events = state.events.filter((event) => event.id !== id);
      state.selected = null;
    }, 'Effect layer deleted');
  }

  function duplicateEvent(id) {
    const source = state.events.find((event) => event.id === id);
    if (!source) return;
    const copy = {
      ...source,
      id: uid('event'),
      offset: Math.min(state.name.length, source.offset + 1),
      sequence: state.events.reduce((highest, item) => Math.max(highest, Number(item.sequence) || 0), 0) + 1
    };
    mutate(() => {
      state.events.push(copy);
      state.selected = {kind: 'event', id: copy.id};
    }, `${eventLabel(copy)} duplicated`);
  }

  function clearArmedPlacement() {
    armedPayload = null;
    armedLabel = '';
    els.outputPreview.querySelectorAll('.drop-hover').forEach((node) => node.classList.remove('drop-hover'));
    renderCaret();
  }

  function armPlacement(payload, label) {
    if (!payload) return;
    armedPayload = clone(payload);
    armedLabel = label;
    renderCaret();
    els.tubeNameCanvas.scrollIntoView?.({block: 'nearest', behavior: 'smooth'});
    announce(`${label} ready — tap a letter in the live name`);
  }

  function placePayloadAtOffset(payload, offset) {
    if (!payload) return;
    const safeOffset = Math.max(0, Math.min(state.name.length, Math.round(offset)));
    const colourPosition = colourPositionFromOffset(safeOffset);
    clearArmedPlacement();
    setCaret(safeOffset, false);
    insertPayload(payload, safeOffset, colourPosition);
  }

  function enableSourceDrag(element, payloadProvider) {
    element.draggable = true;
    element.classList.add('draggable-source');
    element.addEventListener('dragstart', (event) => {
      const payload = typeof payloadProvider === 'function' ? payloadProvider() : payloadProvider;
      if (!payload || !event.dataTransfer) {
        event.preventDefault();
        return;
      }
      dragPayload = payload;
      event.dataTransfer.effectAllowed = 'copy';
      event.dataTransfer.setData('application/x-ultimate-layer', JSON.stringify(payload));
      event.dataTransfer.setData('text/plain', payload.kind === 'colour' ? payload.colour : 'Arena effect');
      element.classList.add('dragging');
      els.megaTube.classList.add('source-dragging');
    });
    element.addEventListener('dragend', () => {
      dragPayload = null;
      element.classList.remove('dragging');
      els.megaTube.classList.remove('source-dragging', 'drop-ready');
      els.dropGuide.classList.remove('visible');
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
    if (preset.pattern === 'bubbles') {
      push(0, '<size=10>', '<voffset=0>');
      push(.2, '<size=18>', '<voffset=-6>');
      push(.4, '<size=12>', '<voffset=4>');
      push(.6, '<size=20>', '<voffset=-8>');
      push(.8, '<size=11>', '<voffset=3>');
    } else if (preset.pattern === 'drift') {
      push(0, '<size=19>', '<voffset=0>', '<alpha=#FF>');
      push(.33, '<size=15>', '<voffset=3>', '<alpha=#CC>');
      push(.66, '<size=11>', '<voffset=7>', '<alpha=#88>');
      push(.84, '<size=7>', '<voffset=12>', '<alpha=#55>');
    } else if (preset.pattern === 'glitch') {
      push(0, '<rotate=-6>', '<voffset=-1>');
      push(.25, '<rotate=8>', '<voffset=4>');
      push(.5, '<rotate=-9>', '<voffset=-5>');
      push(.75, '<rotate=5>', '<voffset=2>');
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

  function renderColourSources() {
    els.colourSources.replaceChildren();
    QUICK_COLOURS.forEach(([name, colour]) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'colour-source';
      button.style.setProperty('--source-colour', colour);
      button.innerHTML = `<i></i><span><b>${name}</b><code>${colour}</code></span>`;
      button.addEventListener('click', () => armPlacement({kind: 'colour', colour}, name));
      enableSourceDrag(button, {kind: 'colour', colour});
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
    else if (key === 'italic') example.append(letter('Aa', 'italic'));
    else if (key === 'underline') example.append(letter('Aa', 'underline'));
    else if (key === 'strike') example.append(letter('Aa', 'strike'));
    else if (key === 'allCaps') example.append(letter('Aa'), letter('AA', 'after'));
    else if (key === 'smallCaps') example.append(letter('Aa', 'smallcaps'));
    container.appendChild(example);
  }

  function renderEffectSources() {
    els.effectSources.replaceChildren();
    EFFECTS.forEach((effect) => {
      const card = document.createElement('div');
      card.className = `effect-source-card source-${effect.key}`;
      card.classList.toggle('active', globalEnabled(effect.key));
      const payload = effectPayload(effect.key);
      const place = document.createElement('button');
      place.type = 'button';
      place.className = 'effect-source';
      place.disabled = !payload;
      place.innerHTML = `<span><b>${effect.label}</b><small>${payload ? 'PLACE FROM A LETTER' : 'WHOLE NAME ONLY'}</small><code>${effect.code || 'Aa→AA'}</code></span>`;
      renderFxExample(place, effect.key);
      place.setAttribute('aria-label', payload
        ? `Place ${effect.label} from a character. Click then choose a letter, or drag to the live name.`
        : `${effect.label} is available for the whole name.`);
      if (payload) {
        place.addEventListener('click', () => armPlacement(effectPayload(effect.key), effect.label));
        enableSourceDrag(place, () => effectPayload(effect.key));
      }
      card.appendChild(place);
      if (effect.global) {
        const toggle = document.createElement('button');
        toggle.type = 'button';
        toggle.className = 'global-effect-toggle';
        toggle.setAttribute('aria-pressed', String(globalEnabled(effect.key)));
        toggle.innerHTML = `<span>WHOLE NAME</span><b>${globalEnabled(effect.key) ? 'ON' : 'OFF'}</b>`;
        toggle.addEventListener('click', () => {
          const removing = globalEnabled(effect.key);
          mutate(() => {
            toggleGlobal(effect.key);
            state.selected = globalEnabled(effect.key) ? {kind: 'global', id: effect.key} : null;
          }, `${effect.label} ${removing ? 'removed from' : 'applied to'} the whole name`);
        });
        card.appendChild(toggle);
      }
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
      button.setAttribute('aria-label', `Arena sprite ${sprite}. Click to add at caret or drag into the Mega Tube.`);
      const payload = {kind: 'event', event: {type: 'sprite', value: sprite}};
      button.addEventListener('click', () => armPlacement(payload, `SPRITE ${sprite}`));
      enableSourceDrag(button, payload);
      els.spriteSources.appendChild(button);
    });
  }

  function applyColourRecipe(colours, label) {
    previewOverride = null;
    mutate(() => {
      state.colours = makeColours(colours);
      state.wubrg = [];
      state.selected = null;
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
        const current = state.wubrg.indexOf(code);
        if (current >= 0) state.wubrg.splice(current, 1);
        else state.wubrg.push(code);
        persist();
        renderWubrg();
      });
      els.wubrgComposer.appendChild(button);
    });
    els.wubrgIdentity.textContent = identityName(state.wubrg);
    els.wubrgOrder.textContent = state.wubrg.length ? state.wubrg.join(' → ') : '—';
    els.applyWubrg.disabled = !state.wubrg.length;
    els.clearWubrg.disabled = !state.wubrg.length;
    renderWubrgResults();
  }

  function renderWubrgResults() {
    const query = els.wubrgSearch.value.trim().toLowerCase();
    const currentKey = canonicalIdentity(state.wubrg);
    let recipes = identityRecipes().filter((recipe) => {
      if (!query) return recipe.codes.length >= 2 && recipe.codes.length <= 3;
      return `${recipe.name} ${recipe.key} ${recipe.codes.map((code) => MANA[code].name).join(' ')}`.toLowerCase().includes(query);
    });
    if (currentKey) {
      recipes = recipes.sort((left, right) => (right.key === currentKey) - (left.key === currentKey));
    }
    recipes = recipes.slice(0, query ? 20 : 12);
    els.wubrgResults.replaceChildren();
    recipes.forEach((recipe) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'preset-card wubrg-card';
      button.classList.toggle('match', recipe.key === currentKey);
      button.innerHTML = `<span class="preset-gradient" style="background:${gradientFromColours(recipe.codes.map((code) => MANA[code].colour))}"></span><span><b>${recipe.name}</b><small>${recipe.codes.join(' · ')}</small></span><em>APPLY</em>`;
      attachPresetPreview(button, () => previewColours(recipe.codes.map((code) => MANA[code].colour)));
      button.addEventListener('click', () => applyColourRecipe(recipe.codes.map((code) => MANA[code].colour), recipe.name));
      els.wubrgResults.appendChild(button);
    });
    if (!recipes.length) {
      const empty = document.createElement('p');
      empty.className = 'empty-results';
      empty.textContent = 'NO IDENTITY MATCHES THAT SEARCH';
      els.wubrgResults.appendChild(empty);
    }
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
      }, `${preset.name} layered onto the live name`));
      els.stylePresets.appendChild(button);
    });
  }

  function setActiveTab(name, focus = false) {
    const valid = ['colours', 'effects', 'wubrg', 'colour-presets', 'style-presets'];
    state.activeTab = valid.includes(name) ? name : null;
    document.querySelectorAll('[data-tab]').forEach((tab) => {
      const active = tab.dataset.tab === state.activeTab;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = state.activeTab ? (active ? 0 : -1) : 0;
      if (active && focus) tab.focus();
    });
    document.querySelectorAll('[data-panel]').forEach((panel) => {
      panel.hidden = panel.dataset.panel !== state.activeTab;
    });
    persist();
  }

  function renderSources() {
    renderEffectSources();
    renderWubrg();
  }

  function renderAll() {
    normaliseState();
    els.deckName.value = state.name;
    renderCaret();
    renderOutput();
    renderTube();
    renderInspector();
    renderSources();
    renderSavedPalettes();
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

  function payloadFromDrop(event) {
    if (dragPayload) return dragPayload;
    try {
      return JSON.parse(event.dataTransfer?.getData('application/x-ultimate-layer') || 'null');
    } catch (_) {
      return null;
    }
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
      state = {...fresh, activeTab};
    }, 'Started over — Undo is available'));
    els.copyButton.addEventListener('click', () => copyText(currentBuild?.raw, currentBuild?.overLimit ? 'Copied — Arena may truncate it' : 'Arena name copied'));
    els.copyRawCode.addEventListener('click', () => copyText(currentBuild?.raw, 'Raw Arena code copied'));
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
      armPlacement({kind: 'colour', colour}, colour);
    });
    els.applyCustomColour.addEventListener('click', () => {
      const stop = state.selected?.kind === 'colour'
        ? state.colours.find((candidate) => candidate.id === state.selected.id)
        : null;
      const colour = normaliseHex(els.colourHex.value);
      if (!stop || !colour) return;
      mutate(() => {
        stop.colour = colour;
        state.wubrg = [];
        state.selected = {kind: 'colour', id: stop.id};
      }, `Selected colour changed to ${colour}`);
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
    els.applyWubrg.addEventListener('click', () => {
      if (state.wubrg.length) applyColourRecipe(state.wubrg.map((code) => MANA[code].colour), identityName(state.wubrg));
    });
    els.clearWubrg.addEventListener('click', () => {
      state.wubrg = [];
      persist();
      renderWubrg();
    });
    els.wubrgSearch.addEventListener('input', renderWubrgResults);
    document.querySelectorAll('[data-tab]').forEach((tab) => {
      tab.addEventListener('click', () => setActiveTab(state.activeTab === tab.dataset.tab ? null : tab.dataset.tab));
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
      button.addEventListener('click', () => setActiveTab(null));
    });
    els.tubeNameCanvas.addEventListener('click', (event) => {
      const offset = offsetFromCanvasEvent(event);
      if (armedPayload) {
        placePayloadAtOffset(armedPayload, offset);
        return;
      }
      setCaret(offset, false);
      announce(`Active caret moved to ${state.caret}`);
    });
    els.tubeNameCanvas.addEventListener('dragover', (event) => {
      const types = Array.from(event.dataTransfer?.types || []);
      if (!dragPayload && !types.includes('application/x-ultimate-layer')) return;
      event.preventDefault();
      event.stopPropagation();
      if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
      const target = canvasTargetFromPoint(event.clientX, event.target);
      showCanvasDropTarget(target);
      els.megaTube.classList.add('drop-ready');
    });
    els.tubeNameCanvas.addEventListener('dragleave', (event) => {
      if (els.tubeNameCanvas.contains(event.relatedTarget)) return;
      showCanvasDropTarget(null);
      els.dropGuide.classList.remove('visible');
      els.megaTube.classList.remove('drop-ready');
    });
    els.tubeNameCanvas.addEventListener('drop', (event) => {
      event.preventDefault();
      event.stopPropagation();
      const payload = payloadFromDrop(event);
      const offset = offsetFromCanvasEvent(event);
      showCanvasDropTarget(null);
      els.dropGuide.classList.remove('visible');
      els.megaTube.classList.remove('drop-ready', 'source-dragging');
      dragPayload = null;
      if (payload) placePayloadAtOffset(payload, offset);
    });
    els.tubeTrack.addEventListener('click', (event) => {
      if (event.target.closest('.tube-token, .tube-name-canvas')) return;
      setCaret(offsetFromPosition(tubePosition(event.clientX)), false);
      announce(`Active caret moved to ${state.caret}`);
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
    els.tubeTrack.addEventListener('dragover', (event) => {
      const types = Array.from(event.dataTransfer?.types || []);
      if (!dragPayload && !types.includes('application/x-ultimate-layer')) return;
      event.preventDefault();
      if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
      const position = tubePosition(event.clientX);
      els.dropGuide.style.left = `${position * 100}%`;
      els.dropGuide.classList.add('visible');
      els.megaTube.classList.add('drop-ready');
    });
    els.tubeTrack.addEventListener('dragleave', (event) => {
      if (els.tubeTrack.contains(event.relatedTarget)) return;
      els.dropGuide.classList.remove('visible');
      els.megaTube.classList.remove('drop-ready');
    });
    els.tubeTrack.addEventListener('drop', (event) => {
      event.preventDefault();
      const payload = payloadFromDrop(event);
      const position = tubePosition(event.clientX);
      els.dropGuide.classList.remove('visible');
      els.megaTube.classList.remove('drop-ready', 'source-dragging');
      dragPayload = null;
      if (payload) insertPayload(payload, offsetFromPosition(position), position);
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && armedPayload) {
        clearArmedPlacement();
        announce('Placement cancelled');
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
