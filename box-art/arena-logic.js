(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.ArenaLogic = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const validHex = (value) => /^#[0-9a-f]{6}$/i.test(value);
  function normalizeColorHex(value, allowShort = true) {
    const digits = String(value).trim().replace(/^#/, '');
    if (/^[0-9a-f]{6}$/i.test(digits)) return '#' + digits.toUpperCase();
    if (allowShort && /^[0-9a-f]{3}$/i.test(digits)) {
      return '#' + digits.split('').map((digit) => digit + digit).join('').toUpperCase();
    }
    return null;
  }
  const arenaHex = (value) => value.slice(1).split('').filter((_, index) => index % 2 === 0).join('').toUpperCase();
  const arenaColor = (value) => '#' + arenaHex(value).split('').map((digit) => digit + digit).join('');
  const nonEmpty = (segments) => segments.filter((segment) => segment.text.length > 0);
  const rawName = (segments) => nonEmpty(segments).map((segment) => `<#${arenaHex(segment.color)}>${segment.text}`).join('');
  function formatPrefix(formatting = {}) {
    return [
      formatting.bold && '<b>',
      formatting.italic && '<i>',
      formatting.underline && '<u>',
      formatting.strike && '<s>'
    ].filter(Boolean).join('');
  }
  function formattedRawName(segments, formatting = {}) {
    const content = rawName(segments);
    return content ? formatPrefix(formatting) + content : '';
  }

  function boundaryPositions(segments) {
    let position = 0;
    return segments.slice(0, -1).map((segment) => {
      position += Array.from(segment.text).length;
      return position;
    });
  }

  function moveBoundary(segments, index, requestedPosition) {
    const copy = segments.map((segment) => ({...segment}));
    const characters = Array.from(copy.map((segment) => segment.text).join(''));
    const boundaries = boundaryPositions(copy);
    if (index < 0 || index >= boundaries.length) return {segments: copy, moved: false};
    const previous = index === 0 ? 0 : boundaries[index - 1];
    const next = index === boundaries.length - 1 ? characters.length : boundaries[index + 1];
    const minimum = previous + 1;
    const maximum = next - 1;
    if (maximum < minimum) return {segments: copy, moved: false};
    const position = Math.max(minimum, Math.min(maximum, requestedPosition));
    if (position === boundaries[index]) return {segments: copy, moved: false};
    boundaries[index] = position;
    copy.forEach((segment, segmentIndex) => {
      const start = segmentIndex === 0 ? 0 : boundaries[segmentIndex - 1];
      const end = segmentIndex === copy.length - 1 ? characters.length : boundaries[segmentIndex];
      segment.text = characters.slice(start, end).join('');
    });
    return {segments: copy, moved: true};
  }

  function mergeAdjacent(segments) {
    const merged = [];
    nonEmpty(segments).forEach((segment) => {
      const previous = merged[merged.length - 1];
      if (previous && arenaHex(previous.color) === arenaHex(segment.color)) previous.text += segment.text;
      else merged.push({...segment});
    });
    return merged;
  }

  function hexToRgb(hex) {
    return [1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16));
  }

  function rgbToHex(rgb) {
    return '#' + rgb.map((value) => Math.round(value).toString(16).padStart(2, '0')).join('').toUpperCase();
  }

  function gradientColor(from, to, progress) {
    const start = hexToRgb(from);
    const end = hexToRgb(to);
    return rgbToHex(start.map((value, index) => value + (end[index] - value) * progress));
  }

  function maxGradientStops(name, limit) {
    return Math.floor((limit - name.length) / 6);
  }

  function buildSafeGradient(name, from, to, limit) {
    if (!name) return {segments: [], maxStops: 0, error: 'empty'};
    const maxStops = maxGradientStops(name, limit);
    if (maxStops < 1) return {segments: [], maxStops, error: 'too-long'};
    const characters = Array.from(name);
    const stopCount = Math.min(characters.length, maxStops);
    const generated = [];
    for (let index = 0; index < stopCount; index += 1) {
      const start = Math.floor(index * characters.length / stopCount);
      const end = Math.floor((index + 1) * characters.length / stopCount);
      const progress = stopCount === 1 ? 0 : index / (stopCount - 1);
      generated.push({color: gradientColor(from, to, progress), text: characters.slice(start, end).join('')});
    }
    return {segments: mergeAdjacent(generated), maxStops, error: null};
  }

  function distributePalette(name, colors, limit) {
    if (!name) return {segments: [], maxStops: 0, error: 'empty'};
    const maxStops = maxGradientStops(name, limit);
    if (maxStops < 1) return {segments: [], maxStops, error: 'too-long'};
    const characters = Array.from(name);
    const palette = colors.filter(validHex).map((color) => color.toUpperCase());
    if (!palette.length) palette.push('#FFFFFF');
    const stopCount = Math.min(characters.length, maxStops, palette.length);
    const generated = [];
    for (let index = 0; index < stopCount; index += 1) {
      const start = Math.floor(index * characters.length / stopCount);
      const end = Math.floor((index + 1) * characters.length / stopCount);
      const paletteIndex = stopCount === 1
        ? Math.floor(palette.length / 2)
        : Math.round(index * (palette.length - 1) / (stopCount - 1));
      generated.push({color: palette[paletteIndex], text: characters.slice(start, end).join('')});
    }
    return {segments: mergeAdjacent(generated), maxStops, error: null};
  }

  function splitWords(name) {
    const firstTextIndex = name.search(/\S/);
    if (firstTextIndex < 0) return [];
    const leading = name.slice(0, firstTextIndex);
    const chunks = name.slice(firstTextIndex).match(/\S+\s*/g) || [];
    if (chunks.length) chunks[0] = leading + chunks[0];
    return chunks;
  }

  return {
    validHex,
    normalizeColorHex,
    arenaHex,
    arenaColor,
    nonEmpty,
    rawName,
    formatPrefix,
    formattedRawName,
    boundaryPositions,
    moveBoundary,
    mergeAdjacent,
    maxGradientStops,
    buildSafeGradient,
    distributePalette,
    splitWords
  };
});
