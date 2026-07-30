(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.DeckwrightV7Logic = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const LIMIT = 64;
  const NUMERIC_EFFECT_DEFAULTS = Object.freeze({size: 10, cspace: 5, rotate: 15, voffset: 5, pos: 40});
  const NUMERIC_EFFECT_LIMITS = Object.freeze({size: Object.freeze({minimum: 5, maximum: 29})});
  const GLOBAL_EFFECT_ORDER = Object.freeze([
    'sup', 'sub', 'bold', 'italic', 'underline', 'strike', 'smallCaps',
    'size', 'cspace', 'rotate', 'voffset', 'pos'
  ]);
  const ARENA_TAG_REGISTRY = Object.freeze({
    verified: Object.freeze([
      'size', 'cspace', 'rotate', 'voffset', 'sup', 'sub', 'pos', 'br', 'sprite',
      'mspace', 'space', 'mark', 'alpha', 'align'
    ]),
    candidate: Object.freeze([
      'smallcaps', 'allcaps', 'lowercase', 'indent', 'line-indent', 'line-height',
      'margin', 'width', 'nobr', 'closing-reset'
    ]),
    noOp: Object.freeze(['font-weight', 'sprite-tint']),
    unsafe: Object.freeze(['font', 'font-material'])
  });
  const validHex = (value) => /^#[0-9a-f]{6}$/i.test(String(value));

  function arenaHex(value) {
    const hex = validHex(value) ? value : '#FFFFFF';
    return hex.slice(1).split('').filter((_, index) => index % 2 === 0).join('').toUpperCase();
  }

  function arenaColour(value) {
    return '#' + arenaHex(value).split('').map((digit) => digit + digit).join('');
  }

  function formatPrefix(formatting = {}) {
    return [
      formatting.bold && '<b>',
      formatting.italic && '<i>',
      formatting.underline && '<u>',
      formatting.strike && '<s>'
    ].filter(Boolean).join('');
  }

  function hexToRgb(hex) {
    return [1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16));
  }

  function rgbToHex(rgb) {
    return '#' + rgb.map((value) => Math.round(value).toString(16).padStart(2, '0')).join('').toUpperCase();
  }

  function interpolate(from, to, progress) {
    const start = hexToRgb(from);
    const end = hexToRgb(to);
    return rgbToHex(start.map((value, index) => value + (end[index] - value) * progress));
  }

  function smoothPalette(colours, steps = 7) {
    const source = colours.filter(validHex).map((colour) => colour.toUpperCase());
    if (!source.length) source.push('#FFFFFF');
    if (source.length === 1 || steps <= 1) return [source[Math.floor(source.length / 2)]];
    return Array.from({length: steps}, (_, index) => {
      const position = index * (source.length - 1) / (steps - 1);
      const left = Math.floor(position);
      const right = Math.min(source.length - 1, left + 1);
      return interpolate(source[left], source[right], position - left);
    });
  }

  function normaliseGradientStops(stops) {
    const source = (Array.isArray(stops) ? stops : [])
      .filter((stop) => stop && validHex(stop.colour) && Number.isFinite(Number(stop.position)))
      .map((stop) => {
        const normalised = {
          colour: stop.colour.toUpperCase(),
          position: Math.max(0, Math.min(1, Number(stop.position)))
        };
        return normalised;
      })
      .sort((left, right) => left.position - right.position);
    if (!source.length) return [{colour: '#FFFFFF', position: 0}];
    return source;
  }

  function gradientStopGaps(count, requestedGap, requestedAnchorGap = requestedGap) {
    if (count < 2) return {regular: 0, anchor: 0};
    const parsedGap = Number(requestedGap);
    const parsedAnchorGap = Number(requestedAnchorGap);
    const regular = Number.isFinite(parsedGap) ? Math.max(0, parsedGap) : 0;
    const anchor = Number.isFinite(parsedAnchorGap) ? Math.max(regular, parsedAnchorGap) : regular;
    const requestedTotal = anchor + regular * Math.max(0, count - 2);
    const scale = requestedTotal > 1 ? 1 / requestedTotal : 1;
    return {regular: regular * scale, anchor: anchor * scale};
  }

  function separateGradientStops(stops, minimumGap = 0, anchorGap = minimumGap) {
    const source = normaliseGradientStops(stops);
    if (source.length < 2) return source;
    const gaps = gradientStopGaps(source.length, minimumGap, minimumGap);
    if (!gaps.regular) return source;
    for (let index = 1; index < source.length; index += 1) {
      source[index].position = Math.max(source[index].position, source[index - 1].position + gaps.regular);
    }
    if (source[source.length - 1].position > 1) {
      source[source.length - 1].position = 1;
      for (let index = source.length - 2; index >= 0; index -= 1) {
        source[index].position = Math.min(source[index].position, source[index + 1].position - gaps.regular);
      }
    }
    if (source[0].position < 0) {
      source[0].position = 0;
      for (let index = 1; index < source.length; index += 1) {
        source[index].position = Math.max(source[index].position, source[index - 1].position + gaps.regular);
      }
    }
    return source;
  }

  function collisionPosition(stops, movingIndex, requestedPosition, minimumGap = 0, anchorGap = minimumGap) {
    const source = Array.isArray(stops) ? stops : [];
    const requested = Math.max(0, Math.min(1, Number(requestedPosition) || 0));
    if (movingIndex < 0 || movingIndex >= source.length || source.length < 2) return requested;
    const gaps = gradientStopGaps(source.length, minimumGap, minimumGap);
    if (!gaps.regular && !gaps.anchor) return requested;
    const occupied = source
      .map((stop, index) => ({index, position: Math.max(0, Math.min(1, Number(stop?.position) || 0))}))
      .filter((stop) => stop.index !== movingIndex)
      .sort((left, right) => left.position - right.position);
    const intervals = [];
    let intervalStart = 0;
    occupied.forEach((stop) => {
      const gap = gaps.regular;
      const intervalEnd = stop.position - gap;
      if (intervalEnd >= intervalStart) intervals.push([intervalStart, intervalEnd]);
      intervalStart = Math.max(intervalStart, stop.position + gap);
    });
    if (intervalStart <= 1) intervals.push([intervalStart, 1]);
    if (!intervals.length) return requested;
    const current = Math.max(0, Math.min(1, Number(source[movingIndex]?.position) || 0));
    const direction = requested >= current ? 1 : -1;
    return intervals.reduce((best, interval) => {
      const candidate = Math.max(interval[0], Math.min(interval[1], requested));
      const distance = Math.abs(candidate - requested);
      if (distance < best.distance - 1e-9) return {position: candidate, distance};
      if (Math.abs(distance - best.distance) <= 1e-9) {
        if (direction > 0 && candidate > best.position) return {position: candidate, distance};
        if (direction < 0 && candidate < best.position) return {position: candidate, distance};
      }
      return best;
    }, {position: requested, distance: Infinity}).position;
  }

  function colourAtPosition(stops, position) {
    const source = normaliseGradientStops(stops);
    const point = Math.max(0, Math.min(1, Number(position) || 0));
    const rightIndex = source.findIndex((stop) => stop.position >= point);
    if (rightIndex < 0) return source[source.length - 1].colour;
    if (rightIndex === 0) return source[0].colour;
    const left = source[rightIndex - 1];
    const right = source[rightIndex];
    const distance = right.position - left.position;
    return distance <= 0 ? right.colour : interpolate(left.colour, right.colour, (point - left.position) / distance);
  }

  function sampleGradientStops(stops, steps = 7) {
    const count = Math.max(1, Math.floor(steps));
    if (count === 1) return [colourAtPosition(stops, .5)];
    return Array.from({length: count}, (_, index) => colourAtPosition(stops, index / (count - 1)));
  }

  function isWhiteish(colour) {
    if (!validHex(colour)) return false;
    const [red, green, blue] = hexToRgb(colour);
    const brightness = .2126 * red + .7152 * green + .0722 * blue;
    const chroma = Math.max(red, green, blue) - Math.min(red, green, blue);
    return brightness >= 218 && chroma <= 65;
  }

  function isMostlyWhite(stops) {
    const samples = sampleGradientStops(stops, 13);
    const whiteishSamples = samples.filter(isWhiteish).length;
    return whiteishSamples >= Math.ceil(samples.length * 2 / 3);
  }

  function mergeAdjacent(segments) {
    const merged = [];
    segments.filter((segment) => segment.text.length).forEach((segment) => {
      const previous = merged[merged.length - 1];
      if (previous && arenaHex(previous.colour) === arenaHex(segment.colour)) previous.text += segment.text;
      else merged.push({...segment});
    });
    return merged;
  }

  function distribute(name, palette, formatting = {}, limit = LIMIT) {
    if (!name) return {segments: [], maxStops: 0, overLimit: false};
    const prefixLength = formatPrefix(formatting).length;
    const maxStops = Math.floor((limit - prefixLength - name.length) / 6);
    const characters = Array.from(name);
    const usablePalette = palette.filter(validHex).map((colour) => colour.toUpperCase());
    if (!usablePalette.length) usablePalette.push('#FFFFFF');
    const stopCount = Math.min(characters.length, usablePalette.length, Math.max(1, maxStops));
    const generated = Array.from({length: stopCount}, (_, index) => {
      const start = Math.floor(index * characters.length / stopCount);
      const end = Math.floor((index + 1) * characters.length / stopCount);
      const paletteIndex = stopCount === 1
        ? Math.floor(usablePalette.length / 2)
        : Math.round(index * (usablePalette.length - 1) / (stopCount - 1));
      return {colour: usablePalette[paletteIndex], text: characters.slice(start, end).join('')};
    });
    const segments = mergeAdjacent(generated);
    const raw = serialize(segments, formatting);
    return {segments, maxStops, overLimit: raw.length > limit};
  }

  function serialize(segments, formatting = {}) {
    const content = segments
      .filter((segment) => segment.text.length)
      .map((segment) => `<#${arenaHex(segment.colour)}>${segment.text}`)
      .join('');
    return content ? formatPrefix(formatting) + content : '';
  }

  function unsupportedCharacters(value) {
    return Array.from(new Set(Array.from(String(value)).filter((character) => {
      const code = character.codePointAt(0);
      return code < 32 || code > 126;
    })));
  }

  function matchingPresets(presets, requiredCodes) {
    const required = Array.from(new Set(requiredCodes));
    return presets.filter((preset) => Array.isArray(preset.codes) && required.every((code) => preset.codes.includes(code)));
  }

  function rotatePalette(colours) {
    return colours.length < 2 ? colours.slice() : [...colours.slice(1), colours[0]];
  }

  function flipPalette(colours) {
    return colours.slice().reverse();
  }

  function paletteSignature(colours) {
    return colours.map((colour) => String(colour).toUpperCase()).join('|');
  }

  function paletteRotations(colours) {
    const rotations = [];
    let current = colours.slice();
    for (let index = 0; index < colours.length; index += 1) {
      if (!rotations.some((rotation) => paletteSignature(rotation) === paletteSignature(current))) rotations.push(current);
      current = rotatePalette(current);
    }
    return rotations;
  }

  function isPaletteRotation(current, palette) {
    const signature = paletteSignature(current);
    return paletteRotations(palette).some((rotation) => paletteSignature(rotation) === signature);
  }

  function nextPaletteRotation(current, palette) {
    const rotations = paletteRotations(palette);
    if (!rotations.length) return [];
    const signature = paletteSignature(current);
    const index = rotations.findIndex((rotation) => paletteSignature(rotation) === signature);
    return rotations[index < 0 ? 0 : (index + 1) % rotations.length].slice();
  }

  function build(name, colours, formatting = {}, limit = LIMIT) {
    const palette = smoothPalette(colours, 7);
    const result = distribute(name, palette, formatting, limit);
    const raw = serialize(result.segments, formatting);
    return {
      ...result,
      palette,
      raw,
      rawLength: raw.length,
      unsupported: unsupportedCharacters(name)
    };
  }

  function shortestNumber(value, fallback = 0) {
    const parsed = Number(value);
    const safe = Number.isFinite(parsed) ? parsed : Number(fallback) || 0;
    const rounded = Math.round(safe * 1000) / 1000;
    return Object.is(rounded, -0) ? '0' : String(rounded);
  }

  function normaliseEffects(effects = {}) {
    const normalised = {
      allCaps: Boolean(effects.allCaps),
      smallCaps: Boolean(effects.smallCaps),
      sup: Boolean(effects.sup),
      sub: Boolean(effects.sub)
    };
    Object.entries(NUMERIC_EFFECT_DEFAULTS).forEach(([name, defaultValue]) => {
      const source = effects[name];
      const objectSource = source && typeof source === 'object';
      const enabled = objectSource ? Boolean(source.enabled) : source !== undefined && source !== null && source !== false;
      const value = objectSource ? source.value : source;
      const parsed = Number(value);
      const limits = NUMERIC_EFFECT_LIMITS[name];
      const constrained = limits && Number.isFinite(parsed)
        ? Math.max(limits.minimum, Math.min(limits.maximum, parsed))
        : value;
      normalised[name] = {enabled, value: shortestNumber(constrained, defaultValue)};
    });
    return normalised;
  }

  function globalEffectTags(formatting = {}, effects = {}) {
    const fx = normaliseEffects(effects);
    const codes = {
      sup: fx.sup && '<sup>',
      sub: fx.sub && '<sub>',
      bold: formatting.bold && '<b>',
      italic: formatting.italic && '<i>',
      underline: formatting.underline && '<u>',
      strike: formatting.strike && '<s>',
      smallCaps: fx.smallCaps && '<smallcaps>',
      size: fx.size.enabled && `<size=${fx.size.value}>`,
      cspace: fx.cspace.enabled && `<cspace=${fx.cspace.value}>`,
      rotate: fx.rotate.enabled && `<rotate=${fx.rotate.value}>`,
      voffset: fx.voffset.enabled && `<voffset=${fx.voffset.value}>`,
      pos: fx.pos.enabled && `<pos=${fx.pos.value}>`
    };
    return GLOBAL_EFFECT_ORDER
      .filter((key) => codes[key])
      .map((key) => ({key, code: codes[key], cost: codes[key].length}));
  }

  function inlineEventCode(event) {
    if (!event || typeof event !== 'object') return '';
    if (event.type === 'br') return '<br>';
    if (event.type === 'sprite') {
      const sprite = Number(event.value);
      return Number.isInteger(sprite) && sprite >= 0 && sprite <= 15 ? `<sprite=${sprite}>` : '';
    }
    if (event.type === 'tag') {
      const code = String(event.code || '');
      return /^<[^<>]+>$/.test(code) ? code : '';
    }
    return '';
  }

  function normaliseInlineEvents(events, textLength = Infinity) {
    const maximum = Number.isFinite(textLength) ? Math.max(0, textLength) : Number.MAX_SAFE_INTEGER;
    return (Array.isArray(events) ? events : [])
      .map((event, index) => {
        const code = inlineEventCode(event);
        if (!code) return null;
        const offset = Math.max(0, Math.min(maximum, Math.floor(Number(event.offset) || 0)));
        return {...event, offset, code, sequence: Number.isFinite(Number(event.sequence)) ? Number(event.sequence) : index};
      })
      .filter(Boolean)
      .sort((left, right) => left.offset - right.offset || left.sequence - right.sequence);
  }

  function insertInlineEvent(events, event, offset) {
    const code = inlineEventCode(event);
    if (!code) return Array.isArray(events) ? events.slice() : [];
    const source = Array.isArray(events) ? events.slice() : [];
    const sequence = source.reduce((highest, item) => Math.max(highest, Number(item.sequence) || 0), 0) + 1;
    source.push({...event, offset: Math.max(0, Math.floor(Number(offset) || 0)), sequence});
    return source;
  }

  function rebaseInlineEvents(events, previousText, nextText) {
    const before = String(previousText || '');
    const after = String(nextText || '');
    let prefix = 0;
    while (prefix < before.length && prefix < after.length && before[prefix] === after[prefix]) prefix += 1;
    let suffix = 0;
    while (
      suffix < before.length - prefix && suffix < after.length - prefix &&
      before[before.length - 1 - suffix] === after[after.length - 1 - suffix]
    ) suffix += 1;
    const removedEnd = before.length - suffix;
    const insertedEnd = after.length - suffix;
    const delta = after.length - before.length;
    return normaliseInlineEvents(events, before.length).map((event) => {
      if (event.offset <= prefix) return {...event};
      if (event.offset >= removedEnd) return {...event, offset: Math.max(0, Math.min(after.length, event.offset + delta))};
      return {...event, offset: insertedEnd};
    });
  }

  function packTubeBubbles(items, trackWidth, textLength, options = {}) {
    const width = Math.max(1, Number(trackWidth) || 1);
    const length = Math.max(0, Number(textLength) || 0);
    const maximumSize = Math.max(18, Number(options.maximumSize) || 34);
    const minimumSize = Math.max(12, Math.min(maximumSize, Number(options.minimumSize) || 18));
    const breathingRoom = Math.max(2, Number(options.breathingRoom) || 4);
    const edge = Math.max(0, Number(options.edge) || 2);
    const source = (Array.isArray(items) ? items : [])
      .map((item, index) => ({
        ...item,
        sourceIndex: Number.isFinite(Number(item.sourceIndex)) ? Number(item.sourceIndex) : index,
        offset: Math.max(0, Math.min(length, Number(item.offset) || 0)),
        order: Number(item.order) || 0
      }))
      .sort((left, right) => left.offset - right.offset || left.order - right.order || left.sourceIndex - right.sourceIndex);
    if (!source.length) return {bubbleSize: maximumSize, entries: []};
    const denseSize = source.length > 1
      ? (width - edge * 2 - breathingRoom * (source.length - 1)) / source.length
      : maximumSize;
    const bubbleSize = Math.max(minimumSize, Math.min(maximumSize, denseSize));
    const minimumCentre = edge + bubbleSize / 2;
    const maximumCentre = Math.max(minimumCentre, width - edge - bubbleSize / 2);
    const usable = Math.max(0, maximumCentre - minimumCentre);
    const separation = source.length > 1
      ? Math.min(bubbleSize + breathingRoom, usable / (source.length - 1))
      : 0;
    const positions = source.map((item) => {
      const ratio = length ? item.offset / length : 0;
      return minimumCentre + ratio * usable;
    });
    for (let index = 1; index < positions.length; index += 1) {
      positions[index] = Math.max(positions[index], positions[index - 1] + separation);
    }
    if (positions[positions.length - 1] > maximumCentre) {
      positions[positions.length - 1] = maximumCentre;
      for (let index = positions.length - 2; index >= 0; index -= 1) {
        positions[index] = Math.min(positions[index], positions[index + 1] - separation);
      }
    }
    if (positions[0] < minimumCentre) {
      positions[0] = minimumCentre;
      for (let index = 1; index < positions.length; index += 1) {
        positions[index] = Math.max(positions[index], positions[index - 1] + separation);
      }
    }
    return {
      bubbleSize,
      entries: source.map((item, index) => ({...item, left: positions[index]}))
    };
  }

  function normaliseColourSegments(segments, hasContent) {
    if (!hasContent) return [];
    const source = (Array.isArray(segments) ? segments : [])
      .filter((segment) => segment && validHex(segment.colour))
      .map((segment) => ({
        start: Math.max(0, Math.floor(Number(segment.start) || 0)),
        colour: segment.colour.toUpperCase()
      }))
      .sort((left, right) => left.start - right.start);
    if (!source.length || source[0].start !== 0) source.unshift({start: 0, colour: source[0]?.colour || '#FFFFFF'});
    const merged = [];
    source.forEach((segment) => {
      const previous = merged[merged.length - 1];
      if (previous && previous.start === segment.start) previous.colour = segment.colour;
      else if (!previous || arenaHex(previous.colour) !== arenaHex(segment.colour)) merged.push(segment);
    });
    return merged;
  }

  function serializeStructured(options = {}) {
    const typedText = String(options.text || '');
    const effects = normaliseEffects(options.effects);
    const text = effects.allCaps ? typedText.toUpperCase() : typedText;
    const events = normaliseInlineEvents(options.inlineEvents, text.length);
    const hasContent = text.length > 0 || events.length > 0;
    if (!hasContent) {
      return {raw: '', text, segments: [], inlineEvents: events, effectTags: [], breakdown: {text: 0, fx: 0, colour: 0, total: 0}};
    }
    const effectTags = globalEffectTags(options.formatting, effects);
    const segments = normaliseColourSegments(options.segments, hasContent)
      .filter((segment) => segment.start <= text.length);
    const segmentsAt = new Map(segments.map((segment) => [segment.start, segment]));
    const eventsAt = new Map();
    events.forEach((event) => {
      if (!eventsAt.has(event.offset)) eventsAt.set(event.offset, []);
      eventsAt.get(event.offset).push(event);
    });
    let content = '';
    for (let offset = 0; offset <= text.length; offset += 1) {
      const segment = segmentsAt.get(offset);
      if (segment) content += `<#${arenaHex(segment.colour)}>`;
      (eventsAt.get(offset) || []).forEach((event) => { content += event.code; });
      if (offset < text.length) content += text[offset];
    }
    const prefix = effectTags.map((tag) => tag.code).join('');
    const raw = prefix + content;
    const textCost = text.length;
    const fxCost = prefix.length + events.reduce((total, event) => total + event.code.length, 0);
    const colourCost = segments.length * 6;
    return {
      raw,
      text,
      segments,
      inlineEvents: events,
      effectTags,
      breakdown: {text: textCost, fx: fxCost, colour: colourCost, total: raw.length}
    };
  }

  function distributedColourSegments(text, palette, count) {
    const usablePalette = (Array.isArray(palette) ? palette : []).filter(validHex).map((colour) => colour.toUpperCase());
    if (!usablePalette.length) usablePalette.push('#FFFFFF');
    const length = String(text || '').length;
    const stageCount = Math.max(1, Math.min(Math.floor(Number(count) || 1), Math.max(1, length)));
    return Array.from({length: stageCount}, (_, index) => ({
      start: length ? Math.floor(index * length / stageCount) : 0,
      colour: usablePalette[stageCount === 1
        ? Math.floor(usablePalette.length / 2)
        : Math.round(index * (usablePalette.length - 1) / (stageCount - 1))]
    }));
  }

  function positionedColourSegments(text, stops, count) {
    const source = normaliseGradientStops(stops);
    const length = String(text || '').length;
    const stageCount = Math.max(1, Math.min(Math.floor(Number(count) || 1), source.length, Math.max(1, length)));
    const selected = stageCount === 1
      ? [source[0]]
      : Array.from({length: stageCount}, (_, index) => source[Math.round(index * (source.length - 1) / (stageCount - 1))]);
    return selected.map((stop) => ({
      start: length > 1 ? Math.round(stop.position * (length - 1)) : 0,
      colour: stop.colour
    }));
  }

  function segmentsWithText(text, segments) {
    return segments.map((segment, index) => {
      const end = segments[index + 1]?.start ?? text.length;
      return {...segment, end, text: text.slice(segment.start, end)};
    });
  }

  function compileArena(options = {}) {
    const typedText = String(options.text || '');
    const effects = normaliseEffects(options.effects);
    const transformedText = effects.allCaps ? typedText.toUpperCase() : typedText;
    const positionedColours = Array.isArray(options.positionedColours) && options.positionedColours.length
      ? normaliseGradientStops(options.positionedColours)
      : [];
    const palette = positionedColours.length
      ? positionedColours.map((stop) => stop.colour)
      : (Array.isArray(options.palette) ? options.palette : []).filter(validHex);
    const events = normaliseInlineEvents(options.inlineEvents, transformedText.length);
    const hasContent = transformedText.length > 0 || events.length > 0;
    const requestedColourStages = hasContent
      ? Math.min(Math.max(1, palette.length || 1), Math.max(1, transformedText.length || 1))
      : 0;
    const limit = Number.isFinite(Number(options.limit)) ? Math.max(0, Number(options.limit)) : LIMIT;
    let compiled = serializeStructured({text: typedText, formatting: options.formatting, effects, segments: [], inlineEvents: events});
    let requestedSegments = [];
    if (hasContent) {
      for (let count = requestedColourStages; count >= 1; count -= 1) {
        const candidateSegments = positionedColours.length
          ? positionedColourSegments(transformedText, positionedColours, count)
          : distributedColourSegments(transformedText, palette, count);
        const candidate = serializeStructured({
          text: typedText,
          formatting: options.formatting,
          effects,
          segments: candidateSegments,
          inlineEvents: events
        });
        compiled = candidate;
        requestedSegments = candidateSegments;
        if (candidate.raw.length <= limit || count === 1) break;
      }
    }
    const visibleSegments = segmentsWithText(compiled.text, compiled.segments);
    const unsupported = unsupportedCharacters(typedText);
    return {
      ...compiled,
      segments: visibleSegments,
      palette: palette.length ? palette.slice() : ['#FFFFFF'],
      rawLength: compiled.raw.length,
      overLimit: compiled.raw.length > limit,
      limit,
      unsupported,
      requestedColourStages,
      colourStages: compiled.segments.length,
      maxColourStages: compiled.segments.length,
      maxStops: compiled.segments.length,
      requestedSegments,
      appliedEffects: compiled.effectTags.map((tag) => tag.key),
      omittedEffects: []
    };
  }

  return {
    LIMIT,
    validHex,
    arenaHex,
    arenaColour,
    formatPrefix,
    smoothPalette,
    normaliseGradientStops,
    separateGradientStops,
    collisionPosition,
    colourAtPosition,
    sampleGradientStops,
    positionedColourSegments,
    isWhiteish,
    isMostlyWhite,
    mergeAdjacent,
    distribute,
    serialize,
    unsupportedCharacters,
    matchingPresets,
    rotatePalette,
    flipPalette,
    paletteRotations,
    isPaletteRotation,
    nextPaletteRotation,
    build,
    NUMERIC_EFFECT_DEFAULTS,
    GLOBAL_EFFECT_ORDER,
    ARENA_TAG_REGISTRY,
    shortestNumber,
    normaliseEffects,
    globalEffectTags,
    inlineEventCode,
    normaliseInlineEvents,
    insertInlineEvent,
    rebaseInlineEvents,
    packTubeBubbles,
    serializeStructured,
    compileArena
  };
});
