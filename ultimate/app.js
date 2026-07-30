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
    {name: 'CLEAN SLATE', note: 'NO GLOBAL FX', sample: 'Arena', formatting: {}, effects: {}},
    {name: 'ARCANE WHISPER', note: 'ITALIC · EXPERIMENTAL SMALL CAPS', sample: 'Arcane', formatting: {italic: true}, effects: {smallCaps: true}},
    {name: 'TITAN', note: 'SIZE 20 · TIGHT', sample: 'TITAN', formatting: {}, effects: {size: {enabled: true, value: 20}, cspace: {enabled: true, value: -1}}},
    {name: 'SKYLINE', note: 'SUPERSCRIPT · WIDE', sample: 'Skyline', formatting: {}, effects: {sup: true, cspace: {enabled: true, value: 2}}},
    {name: 'CHAOS TILT', note: 'ROTATE · ITALIC', sample: 'Chaos', formatting: {italic: true}, effects: {rotate: {enabled: true, value: -8}}},
    {name: 'SIGNAL FLARE', note: 'UNDERLINE · WIDE', sample: 'Signal', formatting: {underline: true}, effects: {cspace: {enabled: true, value: 3}}},
    {name: 'MICRO TYPE', note: 'SIZE 7 · SPACED', sample: 'MICRO', formatting: {}, effects: {size: {enabled: true, value: 7}, cspace: {enabled: true, value: 4}}},
    {name: 'FALLEN', note: 'SUBSCRIPT · STRIKE', sample: 'Fallen', formatting: {strike: true}, effects: {sub: true}}
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
    dropGuide: $('dropGuide'), undoButton: $('undoButton'), redoButton: $('redoButton'),
    clearFxButton: $('clearFxButton'), tubeStatus: $('tubeStatus'), layerInspector: $('layerInspector'),
    colourPicker: $('colourPicker'), colourHex: $('colourHex'), addCustomColour: $('addCustomColour'),
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
      activeTab: 'colours',
      wubrg: []
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
      wubrg: state.wubrg
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
            activeTab: 'colours'
          };
        }
      }
    } catch (_) {}
    if (!saved) return;
    state = {...createDefaultState(), ...saved};
    state.activeTab = ['colours', 'effects', 'wubrg', 'colour-presets', 'style-presets'].includes(saved.activeTab)
      ? saved.activeTab
      : 'colours';
    normaliseState();
  }

  function mutate(change, message = '') {
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

  function activeGlobals() {
    const entries = [];
    ['italic', 'underline', 'strike'].forEach((key) => {
      if (state.formatting[key]) entries.push({key, label: EFFECT_BY_KEY[key].label, code: EFFECT_BY_KEY[key].code});
    });
    ['allCaps', 'smallCaps', 'sup', 'sub'].forEach((key) => {
      if (state.effects[key]) entries.push({key, label: EFFECT_BY_KEY[key].label, code: EFFECT_BY_KEY[key].code || 'Aa→AA'});
    });
    ['size', 'cspace', 'rotate', 'voffset', 'pos'].forEach((key) => {
      if (state.effects[key]?.enabled) entries.push({
        key,
        label: EFFECT_BY_KEY[key].label,
        code: `<${key}=${state.effects[key].value}>`
      });
    });
    return entries;
  }

  function compile() {
    currentBuild = Logic.compileArena({
      text: state.name,
      positionedColours: state.colours.map(({colour, position}) => ({colour, position})),
      formatting: state.formatting,
      effects: state.effects,
      inlineEvents: state.events,
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

  function initialPreviewState() {
    return {
      italic: state.formatting.italic,
      underline: state.formatting.underline,
      strike: state.formatting.strike,
      smallCaps: state.effects.smallCaps,
      sup: state.effects.sup,
      sub: state.effects.sub,
      size: state.effects.size.enabled ? Number(state.effects.size.value) : null,
      cspace: state.effects.cspace.enabled ? Number(state.effects.cspace.value) : null,
      rotate: state.effects.rotate.enabled ? Number(state.effects.rotate.value) : null,
      voffset: state.effects.voffset.enabled ? Number(state.effects.voffset.value) : null,
      pendingPos: state.effects.pos.enabled ? Number(state.effects.pos.value) : null,
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
          sprite.style.backgroundImage = `var(--arena-sprite-${event.value})`;
          sprite.setAttribute('aria-hidden', 'true');
          els.outputPreview.appendChild(sprite);
        } else {
          applyPreviewTag(preview, event.code);
        }
      });
      if (offset >= build.text.length) continue;
      const glyph = document.createElement('span');
      glyph.className = 'preview-glyph';
      glyph.dataset.colour = previewColourAt(build, offset);
      glyph.textContent = build.text[offset];
      applyGlyphStyles(glyph, preview);
      els.outputPreview.appendChild(glyph);
    }
  }

  function gradientCss() {
    const stops = state.colours.slice().sort((left, right) => left.position - right.position);
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

  function colourCaretPosition() {
    if (state.name.length <= 1) return state.caret > 0 ? 1 : 0;
    return Math.max(0, Math.min(1, state.caret / (state.name.length - 1)));
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
    els.tubeStatus.textContent = `ACTIVE CARET ${state.caret} · CLICK A SOURCE TO LAYER HERE`;
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

  function colourToken(stop, index, stackIndex = 0, stackCount = 1) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'tube-token colour-token';
    button.style.left = `${stop.position * 100}%`;
    button.style.setProperty('--token-colour', stop.colour);
    button.style.setProperty('--stack-x', `${(stackIndex - (stackCount - 1) / 2) * 18}px`);
    button.style.setProperty('--stack-y', `${(stackIndex % 2) * 5}px`);
    button.dataset.layerId = stop.id;
    button.classList.toggle('selected', state.selected?.kind === 'colour' && state.selected.id === stop.id);
    button.innerHTML = `<span>${index + 1}</span>`;
    button.setAttribute('role', 'slider');
    button.setAttribute('aria-label', `Colour ${index + 1}, ${stop.colour}. Drag to move; press Enter to edit.`);
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
    sortedColours.forEach((stop, index) => {
      const cluster = sortedColours.filter((candidate) => Math.abs(candidate.position - stop.position) < .001);
      els.tubeColourLayer.appendChild(colourToken(stop, index, cluster.indexOf(stop), cluster.length));
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
    els.clearFxButton.disabled = !globals.length && !state.events.length;
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

  function renderColourSources() {
    els.colourSources.replaceChildren();
    QUICK_COLOURS.forEach(([name, colour]) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'colour-source';
      button.style.setProperty('--source-colour', colour);
      button.innerHTML = `<i></i><span><b>${name}</b><code>${colour}</code></span>`;
      button.addEventListener('click', () => addColour(colour));
      enableSourceDrag(button, {kind: 'colour', colour});
      els.colourSources.appendChild(button);
    });
  }

  function renderEffectSources() {
    els.effectSources.replaceChildren();
    EFFECTS.forEach((effect) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `effect-source source-${effect.key}`;
      button.classList.toggle('active', globalEnabled(effect.key));
      if (effect.global) button.setAttribute('aria-pressed', String(globalEnabled(effect.key)));
      button.innerHTML = `<span class="effect-glyph">${effect.key === 'br' ? '↵' : effect.label.slice(0, 2)}</span><span><b>${effect.label}</b><small>${effect.hint}</small><code>${effect.code || 'Aa→AA'}</code></span>`;
      button.addEventListener('click', () => {
        if (effect.global) {
          mutate(() => {
            toggleGlobal(effect.key);
            state.selected = globalEnabled(effect.key) ? {kind: 'global', id: effect.key} : null;
          }, `${effect.label} ${globalEnabled(effect.key) ? 'removed' : 'toggled'}`);
        } else {
          insertPayload(effectPayload(effect.key), state.caret);
        }
      });
      const payload = effectPayload(effect.key);
      if (payload) enableSourceDrag(button, () => effectPayload(effect.key));
      els.effectSources.appendChild(button);
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
      button.addEventListener('click', () => insertPayload(payload, state.caret));
      enableSourceDrag(button, payload);
      els.spriteSources.appendChild(button);
    });
  }

  function applyColourRecipe(colours, label) {
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
      button.addEventListener('click', () => applyColourRecipe(preset.colours, preset.name));
      els.colourPresets.appendChild(button);
    });
    els.stylePresets.replaceChildren();
    STYLE_PRESETS.forEach((preset) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'preset-card style-preset-card';
      const sampleStyle = [];
      if (preset.formatting.italic) sampleStyle.push('font-style:italic');
      if (preset.formatting.underline) sampleStyle.push('text-decoration:underline');
      if (preset.formatting.strike) sampleStyle.push('text-decoration:line-through');
      if (preset.effects.rotate?.enabled) sampleStyle.push(`transform:rotate(${preset.effects.rotate.value}deg)`);
      if (preset.effects.size?.enabled) sampleStyle.push(`font-size:${Math.min(25, Number(preset.effects.size.value) + 5)}px`);
      button.innerHTML = `<span class="style-sample" style="${sampleStyle.join(';')}">${preset.sample}</span><span><b>${preset.name}</b><small>${preset.note}</small></span><em>APPLY</em>`;
      button.addEventListener('click', () => mutate(() => {
        state.formatting = {bold: false, italic: false, underline: false, strike: false, ...clone(preset.formatting)};
        state.effects = Logic.normaliseEffects(clone(preset.effects));
        state.selected = null;
      }, `${preset.name} replaced the global style layer`));
      els.stylePresets.appendChild(button);
    });
  }

  function setActiveTab(name, focus = false) {
    state.activeTab = name;
    document.querySelectorAll('[data-tab]').forEach((tab) => {
      const active = tab.dataset.tab === name;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      if (active && focus) tab.focus();
    });
    document.querySelectorAll('[data-panel]').forEach((panel) => {
      panel.hidden = panel.dataset.panel !== name;
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
      state.events = [];
      state.selected = null;
    }, 'All effect and sprite layers cleared'));
    els.addCustomColour.addEventListener('click', () => addColour(els.colourHex.value));
    els.colourPicker.addEventListener('input', () => { els.colourHex.value = els.colourPicker.value.toUpperCase(); });
    els.colourHex.addEventListener('input', () => {
      els.colourHex.value = els.colourHex.value.toUpperCase();
      const clean = normaliseHex(els.colourHex.value);
      if (clean) els.colourPicker.value = clean;
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
      tab.addEventListener('click', () => setActiveTab(tab.dataset.tab));
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
    els.tubeTrack.addEventListener('click', (event) => {
      if (event.target.closest('.tube-token')) return;
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
      let payload = dragPayload;
      if (!payload) {
        try { payload = JSON.parse(event.dataTransfer?.getData('application/x-ultimate-layer') || 'null'); } catch (_) {}
      }
      const position = tubePosition(event.clientX);
      els.dropGuide.classList.remove('visible');
      els.megaTube.classList.remove('drop-ready', 'source-dragging');
      dragPayload = null;
      if (payload) insertPayload(payload, offsetFromPosition(position), position);
    });
    document.addEventListener('keydown', (event) => {
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
  renderColourSources();
  renderSpriteSources();
  renderPresets();
  installEvents();
  renderAll();
})();
