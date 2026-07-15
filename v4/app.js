(() => {
  'use strict';

  const Logic = window.DeckwrightV4Logic;
  const DEFAULT_NAME = 'YOUR DECK NAME';
  const ORDER = 'WUBRG';
  const MANA = {
    W: {name: 'White', colour: '#F4E7C4'},
    U: {name: 'Blue', colour: '#2684FF'},
    B: {name: 'Black', colour: '#6B4777'},
    R: {name: 'Red', colour: '#E34832'},
    G: {name: 'Green', colour: '#39A96B'}
  };
  const PRESETS = [
    {name: 'Azorius', codes: ['W', 'U']},
    {name: 'Dimir', codes: ['U', 'B']},
    {name: 'Rakdos', codes: ['B', 'R']},
    {name: 'Gruul', codes: ['R', 'G']},
    {name: 'Selesnya', codes: ['G', 'W']},
    {name: 'Orzhov', codes: ['W', 'B']},
    {name: 'Izzet', codes: ['U', 'R']},
    {name: 'Golgari', codes: ['B', 'G']},
    {name: 'Boros', codes: ['R', 'W']},
    {name: 'Simic', codes: ['G', 'U']},
    {name: 'Bant', codes: ['G', 'W', 'U']},
    {name: 'Esper', codes: ['W', 'U', 'B']},
    {name: 'Grixis', codes: ['U', 'B', 'R']},
    {name: 'Jund', codes: ['B', 'R', 'G']},
    {name: 'Naya', codes: ['R', 'G', 'W']},
    {name: 'Abzan', codes: ['W', 'B', 'G']},
    {name: 'Jeskai', codes: ['U', 'R', 'W']},
    {name: 'Sultai', codes: ['B', 'G', 'U']},
    {name: 'Mardu', codes: ['R', 'W', 'B']},
    {name: 'Temur', codes: ['G', 'U', 'R']}
  ];

  const $ = (id) => document.getElementById(id);
  const els = {
    deckName: $('deckName'),
    inputState: $('inputState'),
    outputPreview: $('outputPreview'),
    copyButton: $('copyButton'),
    copyBurst: $('copyBurst'),
    copyStatus: $('copyStatus'),
    rawCount: $('rawCount'),
    gradientPips: $('gradientPips'),
    identityName: $('identityName'),
    identityCodes: $('identityCodes'),
    manaWheel: $('manaWheel'),
    presetRail: $('presetRail'),
    customStart: $('customStart'),
    customEnd: $('customEnd'),
    customStartValue: $('customStartValue'),
    customEndValue: $('customEndValue'),
    customState: $('customState')
  };

  let targetCount = 2;
  let selectedCodes = ['U', 'R'];
  let customActive = false;
  let defaultNameUntouched = true;
  let formatting = {bold: false, italic: false, underline: false, strike: false};
  let currentBuild = null;
  let feedbackTimer = null;

  function setKey(codes) {
    return [...codes].sort((a, b) => ORDER.indexOf(a) - ORDER.indexOf(b)).join('');
  }

  function activePreset() {
    const key = setKey(selectedCodes);
    return PRESETS.find((preset) => preset.codes.length === selectedCodes.length && setKey(preset.codes) === key) || null;
  }

  function activeCodes() {
    const preset = activePreset();
    return preset ? preset.codes : selectedCodes;
  }

  function activeColours() {
    if (customActive) return [els.customStart.value.toUpperCase(), els.customEnd.value.toUpperCase()];
    return activeCodes().map((code) => MANA[code].colour);
  }

  function gradientCss(colours) {
    const palette = Logic.smoothPalette(colours, 7);
    return `linear-gradient(90deg,${palette.join(',')})`;
  }

  function renderPreview(segments) {
    els.outputPreview.replaceChildren();
    segments.forEach((segment) => {
      const span = document.createElement('span');
      span.textContent = segment.text;
      span.style.color = Logic.arenaColour(segment.colour);
      span.style.fontWeight = formatting.bold ? '900' : '850';
      span.style.fontStyle = formatting.italic ? 'italic' : 'normal';
      span.style.textDecoration = [
        formatting.underline && 'underline',
        formatting.strike && 'line-through'
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

  function renderOutput() {
    currentBuild = Logic.build(els.deckName.value, activeColours(), formatting, Logic.LIMIT);
    renderPreview(currentBuild.segments);
    renderPips(currentBuild.segments);
    els.rawCount.textContent = `${currentBuild.rawLength} / ${Logic.LIMIT}`;
    const invalid = currentBuild.unsupported.length > 0;
    els.inputState.textContent = invalid ? 'UNSUPPORTED CHARACTER' : (customActive ? 'CUSTOM ACTIVE' : 'ASCII READY');
    els.inputState.classList.toggle('error', invalid);
  }

  function renderIdentity() {
    const preset = activePreset();
    const missing = targetCount - selectedCodes.length;
    els.identityName.textContent = customActive ? 'Custom' : (preset?.name || (missing > 0 ? `Select ${missing} more` : 'Custom identity'));
    els.identityCodes.textContent = selectedCodes.length ? selectedCodes.join(' / ') : '—';
    els.customState.textContent = customActive ? 'ACTIVE' : 'INACTIVE';
    document.querySelectorAll('.mode-button').forEach((button) => {
      const selected = Number(button.dataset.count) === targetCount;
      button.classList.toggle('selected', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
    els.manaWheel.querySelectorAll('.mana-button').forEach((button) => {
      button.setAttribute('aria-pressed', String(selectedCodes.includes(button.dataset.code)));
    });
    els.presetRail.querySelectorAll('.preset-button').forEach((button) => {
      button.classList.toggle('selected', !customActive && preset?.name === button.dataset.name);
    });
  }

  function renderAll() {
    renderIdentity();
    renderOutput();
  }

  function buildManaWheel() {
    Object.entries(MANA).forEach(([code, mana]) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'mana-button';
      button.dataset.code = code;
      button.textContent = code;
      button.title = mana.name;
      button.setAttribute('aria-label', mana.name);
      button.style.setProperty('--mana', mana.colour);
      button.addEventListener('click', () => selectMana(code));
      els.manaWheel.appendChild(button);
    });
  }

  function buildPresetRail() {
    els.presetRail.replaceChildren();
    PRESETS.filter((preset) => preset.codes.length === targetCount).forEach((preset) => {
      const button = document.createElement('button');
      const name = document.createElement('strong');
      const codes = document.createElement('span');
      const colours = preset.codes.map((code) => MANA[code].colour);
      button.type = 'button';
      button.className = 'preset-button';
      button.dataset.name = preset.name;
      button.style.setProperty('--preset', gradientCss(colours));
      button.setAttribute('aria-label', `Use ${preset.name}, ${preset.codes.join(' ')}`);
      name.textContent = preset.name;
      codes.textContent = preset.codes.join(' / ');
      button.append(name, codes);
      button.addEventListener('click', () => {
        selectedCodes = preset.codes.slice();
        customActive = false;
        renderAll();
      });
      els.presetRail.appendChild(button);
    });
  }

  function selectMana(code) {
    customActive = false;
    const existing = selectedCodes.indexOf(code);
    if (existing >= 0) {
      if (selectedCodes.length > 1) selectedCodes.splice(existing, 1);
    } else if (selectedCodes.length < targetCount) {
      selectedCodes.push(code);
    } else {
      selectedCodes = [...selectedCodes.slice(1), code];
    }
    renderAll();
  }

  function changeMode(count) {
    if (count === targetCount) return;
    targetCount = count;
    selectedCodes = count === 2 ? ['U', 'R'] : ['U', 'R', 'W'];
    customActive = false;
    buildPresetRail();
    renderAll();
  }

  function activateCustom() {
    customActive = true;
    els.customStartValue.textContent = els.customStart.value.toUpperCase();
    els.customEndValue.textContent = els.customEnd.value.toUpperCase();
    renderAll();
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
    els.deckName.setRangeText(clean, els.deckName.selectionStart, els.deckName.selectionEnd, 'end');
    defaultNameUntouched = false;
    renderOutput();
  }

  async function writeClipboard(text) {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
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
    } catch (_) {
      return false;
    }
  }

  function playFeedback(message, error = false) {
    clearTimeout(feedbackTimer);
    els.copyBurst.classList.remove('show');
    els.copyButton.classList.remove('copy-confirmed');
    els.copyBurst.classList.toggle('error', error);
    els.copyBurst.replaceChildren();
    const colours = error
      ? ['#FF5264']
      : currentBuild.segments.map((segment) => Logic.arenaColour(segment.colour));
    Array.from(message).forEach((character, index, letters) => {
      const span = document.createElement('span');
      const colourIndex = colours.length < 2 ? 0 : Math.round(index * (colours.length - 1) / Math.max(1, letters.length - 1));
      span.textContent = character;
      span.style.color = colours[colourIndex] || '#FFFFFF';
      els.copyBurst.appendChild(span);
    });
    void els.copyBurst.offsetWidth;
    els.copyButton.classList.add('copy-confirmed');
    els.copyBurst.classList.add('show');
    els.copyStatus.textContent = message;
    setTimeout(() => els.copyButton.classList.remove('copy-confirmed'), 220);
    feedbackTimer = setTimeout(() => els.copyBurst.classList.remove('show'), 1050);
  }

  async function copyResult() {
    if (!currentBuild.raw) return;
    if (currentBuild.unsupported.length) {
      playFeedback('UNSUPPORTED CHARACTER', true);
      return;
    }
    const copied = await writeClipboard(currentBuild.raw);
    if (!copied) playFeedback('COPY BLOCKED', true);
    else if (currentBuild.rawLength > Logic.LIMIT) playFeedback('OVER 64 — COPIED', true);
    else playFeedback('PASTE INTO ARENA!');
  }

  buildManaWheel();
  buildPresetRail();
  document.querySelectorAll('.mode-button').forEach((button) => {
    button.addEventListener('click', () => changeMode(Number(button.dataset.count)));
  });
  document.querySelectorAll('.format-grid button').forEach((button) => {
    button.addEventListener('click', () => {
      const key = button.dataset.format;
      formatting[key] = !formatting[key];
      button.setAttribute('aria-pressed', String(formatting[key]));
      renderOutput();
    });
  });
  els.customStart.addEventListener('input', activateCustom);
  els.customEnd.addEventListener('input', activateCustom);
  els.deckName.addEventListener('focus', () => requestAnimationFrame(selectDefaultName));
  els.deckName.addEventListener('pointerup', (event) => {
    if (!defaultNameUntouched || els.deckName.value !== DEFAULT_NAME) return;
    event.preventDefault();
    selectDefaultName();
  });
  els.deckName.addEventListener('input', () => {
    defaultNameUntouched = false;
    renderOutput();
  });
  els.deckName.addEventListener('paste', normalisePastedText);
  els.copyButton.addEventListener('click', copyResult);
  renderAll();
})();
