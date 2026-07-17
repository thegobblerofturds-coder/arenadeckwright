(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.DeckwrightV6Logic = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const LIMIT = 64;
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
    if (source.length === 1) {
      source[0].position = 0;
      return source;
    }
    source[0].position = 0;
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
    const gaps = gradientStopGaps(source.length, minimumGap, anchorGap);
    if (!gaps.regular && !gaps.anchor) return source;
    source[0].position = 0;
    for (let index = 1; index < source.length; index += 1) {
      const gap = index === 1 ? gaps.anchor : gaps.regular;
      source[index].position = Math.max(source[index].position, source[index - 1].position + gap);
    }
    if (source[source.length - 1].position > 1) {
      source[source.length - 1].position = 1;
      for (let index = source.length - 2; index > 0; index -= 1) {
        source[index].position = Math.min(source[index].position, source[index + 1].position - gaps.regular);
      }
    }
    source[0].position = 0;
    return source;
  }

  function collisionPosition(stops, movingIndex, requestedPosition, minimumGap = 0, anchorGap = minimumGap) {
    const source = Array.isArray(stops) ? stops : [];
    const requested = Math.max(0, Math.min(1, Number(requestedPosition) || 0));
    if (movingIndex < 0 || movingIndex >= source.length || source.length < 2) return requested;
    const gaps = gradientStopGaps(source.length, minimumGap, anchorGap);
    if (!gaps.regular && !gaps.anchor) return requested;
    const occupied = source
      .map((stop, index) => ({index, position: Math.max(0, Math.min(1, Number(stop?.position) || 0))}))
      .filter((stop) => stop.index !== movingIndex)
      .sort((left, right) => left.position - right.position);
    const intervals = [];
    let intervalStart = 0;
    occupied.forEach((stop) => {
      const gap = stop.index === 0 || movingIndex === 0 ? gaps.anchor : gaps.regular;
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
    build
  };
});
