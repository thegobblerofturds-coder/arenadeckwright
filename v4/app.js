(() => {
  'use strict';

  const Logic = window.DeckwrightV4Logic;
  const DEFAULT_NAME = 'YOUR DECK NAME';
  const ORDER = 'WUBRG';
  const MAX_CUSTOM_STOPS = 7;
  const MANA = {
    W: {name: 'White', colour: '#F4E7C4'},
    U: {name: 'Blue', colour: '#2684FF'},
    B: {name: 'Black', colour: '#25262A'},
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
    identityPanel: $('identityPanel'),
    manaWheel: $('manaWheel'),
    presetContext: $('presetContext'),
    selectionSummary: $('selectionSummary'),
    presetRail: $('presetRail'),
    advancedToggle: $('advancedToggle'),
    advancedPanel: $('advancedPanel'),
    customPickers: $('customPickers'),
    addCustomColour: $('addCustomColour'),
    customState: $('customState')
  };

  let selectedCodes = ['U', 'R'];
  let customColours = [MANA.U.colour, MANA.R.colour];
  let customActive = false;
  let defaultNameUntouched = true;
  let formatting = {bold: false, italic: false, underline: false, strike: false};
  let currentBuild = null;
  let feedbackTimer = null;
  let advancedOpen = false;

  function setKey(codes) {
    return [...codes].sort((a, b) => ORDER.indexOf(a) - ORDER.indexOf(b)).join('');
  }

  function activePreset() {
    const key = setKey(selectedCodes);
    return PRESETS.find((preset) => preset.codes.length === selectedCodes.length && setKey(preset.codes) === key) || null;
  }

  function activeColours() {
    if (customActive) return customColours.slice();
    return selectedCodes.length ? selectedCodes.map((code) => MANA[code].colour) : ['#747A76'];
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
      span.style.fontFamily = 'Arial, Helvetica, sans-serif';
      span.style.fontWeight = formatting.bold ? '900' : '650';
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
    const ready = customActive || selectedCodes.length > 0;
    currentBuild = Logic.build(els.deckName.value, activeColours(), formatting, Logic.LIMIT);
    renderPreview(currentBuild.segments);
    renderPips(ready ? currentBuild.segments : []);
    els.rawCount.textContent = ready ? `${currentBuild.rawLength} / ${Logic.LIMIT}` : `-- / ${Logic.LIMIT}`;
    const invalid = currentBuild.unsupported.length > 0;
    els.copyButton.disabled = !ready;
    els.inputState.textContent = invalid
      ? 'UNSUPPORTED CHARACTER'
      : (!ready ? 'SELECT A COLOUR' : (customActive ? `${customColours.length} CUSTOM STOPS` : 'ASCII READY'));
    els.inputState.classList.toggle('error', invalid);
  }

  function renderPresetRail() {
    if (!selectedCodes.length) {
      els.presetContext.textContent = 'PRESETS OFFLINE';
      els.selectionSummary.textContent = 'SELECT A COLOUR';
      els.presetRail.replaceChildren();
      const empty = document.createElement('div');
      empty.className = 'preset-empty';
      empty.textContent = 'CHOOSE W / U / B / R / G TO LOAD MATCHES';
      els.presetRail.appendChild(empty);
      return;
    }
    const matches = Logic.matchingPresets(PRESETS, selectedCodes);
    els.presetContext.textContent = `${matches.length} MATCHING ${matches.length === 1 ? 'PRESET' : 'PRESETS'}`;
    els.selectionSummary.textContent = selectedCodes.join(' + ');
    els.presetRail.replaceChildren();
    matches.forEach((preset) => {
        const button = document.createElement('button');
        const name = document.createElement('strong');
        const codes = document.createElement('span');
        const colours = preset.codes.map((code) => MANA[code].colour);
        button.type = 'button';
        button.className = 'preset-button';
        button.dataset.name = preset.name;
        button.style.setProperty('--preset', gradientCss(colours));
        button.setAttribute('aria-label', `Use ${preset.name}, ${preset.codes.map((code) => MANA[code].name).join(', ')}`);
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

  function renderSelection() {
    const preset = activePreset();
    els.customState.textContent = customActive ? `${customColours.length} STOPS` : 'INACTIVE';
    els.addCustomColour.disabled = customColours.length >= MAX_CUSTOM_STOPS;
    els.manaWheel.querySelectorAll('.mana-button').forEach((button) => {
      const code = button.dataset.code;
      const selected = selectedCodes.includes(code);
      button.setAttribute('aria-pressed', String(selected));
      button.disabled = selectedCodes.length >= 3 && !selected;
      button.setAttribute('aria-label', `${MANA[code].name}${selected ? ', selected' : ''}`);
    });
    els.presetRail.querySelectorAll('.preset-button').forEach((button) => {
      button.classList.toggle('selected', !customActive && preset?.name === button.dataset.name);
    });
  }

  function renderAll() {
    renderPresetRail();
    renderSelection();
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

  function selectMana(code) {
    customActive = false;
    const existing = selectedCodes.indexOf(code);
    if (existing >= 0) {
      selectedCodes.splice(existing, 1);
    } else if (selectedCodes.length < 3) {
      selectedCodes.push(code);
    }
    renderAll();
  }

  function renderView() {
    els.identityPanel.hidden = advancedOpen;
    els.advancedPanel.hidden = !advancedOpen;
    els.advancedToggle.classList.toggle('active', advancedOpen);
    els.advancedToggle.setAttribute('aria-expanded', String(advancedOpen));
    els.advancedToggle.setAttribute('aria-checked', String(advancedOpen));
  }

  function toggleAdvanced() {
    advancedOpen = !advancedOpen;
    renderView();
  }

  function customStopLabel(index) {
    if (index === 0) return 'START';
    if (index === customColours.length - 1) return 'END';
    return `STOP ${String(index + 1).padStart(2, '0')}`;
  }

  function renderCustomPickers() {
    els.customPickers.replaceChildren();
    customColours.forEach((colour, index) => {
      const item = document.createElement('div');
      const label = document.createElement('label');
      const title = document.createElement('span');
      const picker = document.createElement('input');
      const value = document.createElement('b');
      item.className = 'custom-picker';
      title.textContent = customStopLabel(index);
      picker.type = 'color';
      picker.value = colour;
      picker.setAttribute('aria-label', `${customStopLabel(index)} custom colour`);
      value.textContent = colour.toUpperCase();
      picker.addEventListener('input', () => {
        customColours[index] = picker.value.toUpperCase();
        value.textContent = customColours[index];
        customActive = true;
        renderSelection();
        renderOutput();
      });
      label.append(title, picker, value);
      item.appendChild(label);
      if (customColours.length > 2) {
        const remove = document.createElement('button');
        remove.type = 'button';
        remove.className = 'remove-custom-colour';
        remove.textContent = 'X';
        remove.setAttribute('aria-label', `Remove ${customStopLabel(index)} custom colour`);
        remove.addEventListener('click', () => {
          customColours.splice(index, 1);
          customActive = true;
          renderCustomPickers();
          renderAll();
        });
        item.appendChild(remove);
      }
      els.customPickers.appendChild(item);
    });
  }

  function addCustomStop() {
    if (customColours.length >= MAX_CUSTOM_STOPS) return;
    const insertAt = Math.max(1, customColours.length - 1);
    const neighbours = Logic.smoothPalette([customColours[insertAt - 1], customColours[insertAt]], 3);
    customColours.splice(insertAt, 0, neighbours[1]);
    customActive = true;
    renderCustomPickers();
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
    else if (currentBuild.rawLength > Logic.LIMIT) playFeedback('OVER 64 - COPIED', true);
    else playFeedback('PASTE INTO ARENA!');
  }

  buildManaWheel();
  renderCustomPickers();
  document.querySelectorAll('.format-grid button').forEach((button) => {
    button.addEventListener('click', () => {
      const key = button.dataset.format;
      formatting[key] = !formatting[key];
      button.setAttribute('aria-pressed', String(formatting[key]));
      renderOutput();
    });
  });
  els.advancedToggle.addEventListener('click', toggleAdvanced);
  els.addCustomColour.addEventListener('click', addCustomStop);
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
  renderView();
})();
