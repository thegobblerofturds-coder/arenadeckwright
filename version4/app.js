(() => {
  'use strict';

  const Logic = window.DeckwrightV4Logic;
  const DEFAULT_NAME = 'YOUR DECK NAME';
  const MAX_GRADIENT_COLOURS = 7;
  const MANA = {
    W: {name: 'White', colour: '#F4E7C4'},
    U: {name: 'Blue', colour: '#2684FF'},
    B: {name: 'Black', colour: '#6B4777'},
    R: {name: 'Red', colour: '#E34832'},
    G: {name: 'Green', colour: '#39A96B'}
  };
  const GENERAL_PALETTES = [
    {name: 'Rainbow', colours: ['#F03444', '#FF8A24', '#FFE14A', '#43C96B', '#25BDE5', '#4669E8', '#A447D1']},
    {name: 'Sunset', colours: ['#45256F', '#A52E72', '#E24B4B', '#F1872B', '#FFD56A']},
    {name: 'Sunrise', colours: ['#253365', '#7757A5', '#E77D91', '#FFB45D', '#FFF0B0']},
    {name: 'Silver', colours: ['#41464B', '#9DA4AA', '#F2F3F3', '#7B8288', '#202326']}
  ];
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
    gradientBar: $('gradientBar'),
    colourStops: $('colourStops'),
    rotateGradient: $('rotateGradient'),
    flipGradient: $('flipGradient'),
    generalPalettes: $('generalPalettes'),
    manaWheel: $('manaWheel'),
    presetContext: $('presetContext'),
    selectionSummary: $('selectionSummary'),
    presetRail: $('presetRail')
  };

  let gradientColours = [MANA.U.colour, MANA.R.colour];
  let selectedCodes = [];
  let formatting = {bold: false, italic: false, underline: false, strike: false};
  let defaultNameUntouched = true;
  let currentBuild = null;
  let feedbackTimer = null;

  function presetColours(preset) {
    return preset.codes.map((code) => MANA[code].colour);
  }

  function manaCodesForColours(colours) {
    return colours.map((colour) => {
      const match = Object.entries(MANA).find(([, mana]) => mana.colour.toUpperCase() === String(colour).toUpperCase());
      return match ? match[0] : '?';
    });
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
    currentBuild = Logic.build(els.deckName.value, gradientColours, formatting, Logic.LIMIT);
    renderPreview(currentBuild.segments);
    renderPips(currentBuild.segments);
    const overBy = Math.max(0, currentBuild.rawLength - Logic.LIMIT);
    els.rawCount.textContent = overBy
      ? `${currentBuild.rawLength} / ${Logic.LIMIT} · +${overBy}`
      : `${currentBuild.rawLength} / ${Logic.LIMIT}`;
    els.rawCount.classList.toggle('over-limit', overBy > 0);
    const invalid = currentBuild.unsupported.length > 0;
    els.inputState.textContent = invalid ? 'UNSUPPORTED CHARACTER' : `${gradientColours.length} COLOUR ${gradientColours.length === 1 ? 'STOP' : 'STOPS'}`;
    els.inputState.classList.toggle('error', invalid);
  }

  function renderGradientBar() {
    els.gradientBar.style.background = gradientCss(gradientColours);
    els.rotateGradient.disabled = gradientColours.length < 2;
    els.flipGradient.disabled = gradientColours.length < 2;
  }

  function renderColourStops() {
    els.colourStops.replaceChildren();
    gradientColours.forEach((colour, index) => {
      const item = document.createElement('div');
      const label = document.createElement('label');
      const number = document.createElement('span');
      const picker = document.createElement('input');
      const value = document.createElement('b');
      item.className = 'colour-stop';
      number.textContent = String(index + 1).padStart(2, '0');
      picker.type = 'color';
      picker.value = colour;
      picker.setAttribute('aria-label', `Gradient colour ${index + 1}`);
      value.textContent = colour.toUpperCase();
      picker.addEventListener('input', () => {
        gradientColours[index] = picker.value.toUpperCase();
        value.textContent = gradientColours[index];
        renderGradientBar();
        renderShortcutSelection();
        renderOutput();
      });
      label.append(number, picker, value);
      item.appendChild(label);
      if (gradientColours.length > 2) {
        const remove = document.createElement('button');
        remove.type = 'button';
        remove.className = 'remove-colour';
        remove.textContent = 'X';
        remove.setAttribute('aria-label', `Remove gradient colour ${index + 1}`);
        remove.addEventListener('click', () => {
          gradientColours.splice(index, 1);
          renderColourEditor();
          renderShortcutSelection();
          renderOutput();
        });
        item.appendChild(remove);
      }
      els.colourStops.appendChild(item);
    });

    const add = document.createElement('button');
    const symbol = document.createElement('b');
    const label = document.createElement('span');
    add.type = 'button';
    add.className = 'add-colour-tile';
    add.disabled = gradientColours.length >= MAX_GRADIENT_COLOURS;
    add.setAttribute('aria-label', add.disabled ? 'Maximum of seven gradient colours reached' : 'Add another gradient colour');
    symbol.textContent = '+';
    label.textContent = add.disabled ? 'MAX' : 'COLOUR';
    add.append(symbol, label);
    add.addEventListener('click', addGradientColour);
    els.colourStops.appendChild(add);
  }

  function renderColourEditor() {
    renderGradientBar();
    renderColourStops();
  }

  function applyPalette(colours) {
    gradientColours = colours.slice(0, MAX_GRADIENT_COLOURS).map((colour) => colour.toUpperCase());
    renderColourEditor();
    renderShortcutSelection();
    renderOutput();
  }

  function applyCyclingPalette(colours) {
    applyPalette(Logic.nextPaletteRotation(gradientColours, colours));
  }

  function rotateGradient() {
    if (gradientColours.length < 2) return;
    gradientColours = Logic.rotatePalette(gradientColours);
    renderColourEditor();
    renderShortcutSelection();
    renderOutput();
  }

  function flipGradient() {
    if (gradientColours.length < 2) return;
    gradientColours = Logic.flipPalette(gradientColours);
    renderColourEditor();
    renderShortcutSelection();
    renderOutput();
  }

  function addGradientColour() {
    if (gradientColours.length >= MAX_GRADIENT_COLOURS) return;
    const insertAt = Math.max(1, gradientColours.length - 1);
    const midpoint = Logic.smoothPalette([gradientColours[insertAt - 1], gradientColours[insertAt]], 3)[1];
    gradientColours.splice(insertAt, 0, midpoint);
    renderColourEditor();
    renderShortcutSelection();
    renderOutput();
  }

  function renderGeneralPalettes() {
    els.generalPalettes.replaceChildren();
    GENERAL_PALETTES.forEach((palette) => {
      const button = document.createElement('button');
      const name = document.createElement('strong');
      const count = document.createElement('span');
      button.type = 'button';
      button.className = 'palette-button';
      button.dataset.palette = palette.name;
      button.style.setProperty('--palette', gradientCss(palette.colours));
      button.setAttribute('aria-label', `Load the editable ${palette.name} palette; click again to rotate it`);
      name.textContent = palette.name;
      count.textContent = `${palette.colours.length} COLOURS`;
      button.append(name, count);
      button.addEventListener('click', () => applyCyclingPalette(palette.colours));
      els.generalPalettes.appendChild(button);
    });
  }

  function buildManaWheel() {
    Object.entries(MANA).forEach(([code, mana]) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'mana-button';
      button.dataset.code = code;
      button.textContent = code;
      button.title = mana.name;
      button.setAttribute('aria-label', `Filter presets by ${mana.name}`);
      button.style.setProperty('--mana', mana.colour);
      button.addEventListener('click', () => toggleManaFilter(code));
      els.manaWheel.appendChild(button);
    });
  }

  function toggleManaFilter(code) {
    const existing = selectedCodes.indexOf(code);
    if (existing >= 0) selectedCodes.splice(existing, 1);
    else if (selectedCodes.length < 3) selectedCodes.push(code);
    renderPresetRail();
    renderManaSelection();
    renderShortcutSelection();
  }

  function renderManaSelection() {
    els.manaWheel.querySelectorAll('.mana-button').forEach((button) => {
      const selected = selectedCodes.includes(button.dataset.code);
      button.setAttribute('aria-pressed', String(selected));
      button.disabled = selectedCodes.length >= 3 && !selected;
    });
  }

  function renderPresetRail() {
    els.presetRail.replaceChildren();
    if (!selectedCodes.length) {
      els.presetContext.textContent = 'PRESETS OFFLINE';
      els.selectionSummary.textContent = 'SELECT PIPS';
      const empty = document.createElement('div');
      empty.className = 'preset-empty';
      empty.textContent = 'CHOOSE W / U / B / R / G TO FILTER MTG PRESETS';
      els.presetRail.appendChild(empty);
      return;
    }
    const matches = Logic.matchingPresets(PRESETS, selectedCodes);
    els.presetContext.textContent = `${matches.length} MATCHING ${matches.length === 1 ? 'PRESET' : 'PRESETS'}`;
    els.selectionSummary.textContent = selectedCodes.join(' + ');
    matches.forEach((preset) => {
      const button = document.createElement('button');
      const name = document.createElement('strong');
      const codes = document.createElement('span');
      const colours = presetColours(preset);
      button.type = 'button';
      button.className = 'preset-button';
      button.dataset.preset = preset.name;
      button.style.setProperty('--preset', gradientCss(colours));
      button.setAttribute('aria-label', `Load the editable ${preset.name} colours; click again to rotate them`);
      name.textContent = preset.name;
      codes.textContent = preset.codes.join(' / ');
      button.append(name, codes);
      button.addEventListener('click', () => applyCyclingPalette(colours));
      els.presetRail.appendChild(button);
    });
  }

  function renderShortcutSelection() {
    els.generalPalettes.querySelectorAll('.palette-button').forEach((button) => {
      const palette = GENERAL_PALETTES.find((candidate) => candidate.name === button.dataset.palette);
      const selected = Boolean(palette && Logic.isPaletteRotation(gradientColours, palette.colours));
      const detail = button.querySelector('span');
      button.classList.toggle('selected', selected);
      if (palette) button.style.setProperty('--palette', gradientCss(selected ? gradientColours : palette.colours));
      if (palette && detail) detail.textContent = selected ? 'TAP AGAIN  ↻' : `${palette.colours.length} COLOURS`;
    });
    els.presetRail.querySelectorAll('.preset-button').forEach((button) => {
      const preset = PRESETS.find((candidate) => candidate.name === button.dataset.preset);
      const colours = preset ? presetColours(preset) : [];
      const selected = Boolean(preset && Logic.isPaletteRotation(gradientColours, colours));
      const detail = button.querySelector('span');
      button.classList.toggle('selected', selected);
      if (preset) button.style.setProperty('--preset', gradientCss(selected ? gradientColours : colours));
      if (preset && detail) detail.textContent = selected
        ? `${manaCodesForColours(gradientColours).join(' / ')}  ↻`
        : preset.codes.join(' / ');
    });
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
    else playFeedback('COPIED!');
  }

  buildManaWheel();
  renderGeneralPalettes();
  renderColourEditor();
  renderPresetRail();
  renderManaSelection();
  renderShortcutSelection();
  renderOutput();

  els.rotateGradient.addEventListener('click', rotateGradient);
  els.flipGradient.addEventListener('click', flipGradient);
  document.querySelectorAll('.format-pad button').forEach((button) => {
    button.addEventListener('click', () => {
      const key = button.dataset.format;
      formatting[key] = !formatting[key];
      button.setAttribute('aria-pressed', String(formatting[key]));
      renderOutput();
    });
  });
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
  document.addEventListener('keydown', (event) => {
    if (!(event.ctrlKey || event.metaKey) || event.key !== 'Enter') return;
    event.preventDefault();
    copyResult();
  });
})();
