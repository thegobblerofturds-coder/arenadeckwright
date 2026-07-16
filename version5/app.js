(() => {
  'use strict';

  const Logic = window.DeckwrightV5Logic;
  const DEFAULT_NAME = 'YOUR DECK NAME';
  const STORAGE_KEY = 'turdgobbler-deckwright-v5';
  const MAX_STOPS = 7;
  const MANA_ORDER = ['W', 'U', 'B', 'R', 'G'];
  const MANA = {
    W: {name: 'White', colour: '#F4E7C4'},
    U: {name: 'Blue', colour: '#2684FF'},
    B: {name: 'Black', colour: '#6B4777'},
    R: {name: 'Red', colour: '#E34832'},
    G: {name: 'Green', colour: '#39A96B'}
  };
  const IDENTITIES = {
    W: 'WHITE', U: 'BLUE', B: 'BLACK', R: 'RED', G: 'GREEN',
    WU: 'AZORIUS', UB: 'DIMIR', BR: 'RAKDOS', RG: 'GRUUL', WG: 'SELESNYA',
    WB: 'ORZHOV', UR: 'IZZET', BG: 'GOLGARI', WR: 'BOROS', UG: 'SIMIC',
    WUG: 'BANT', WUB: 'ESPER', UBR: 'GRIXIS', BRG: 'JUND', WRG: 'NAYA',
    WBG: 'ABZAN', WUR: 'JESKAI', UBG: 'SULTAI', WBR: 'MARDU', URG: 'TEMUR'
  };
  const MTG_PRESETS = Object.entries(IDENTITIES)
    .filter(([codes]) => codes.length === 2 || codes.length === 3)
    .map(([codes, name]) => ({name, codes: Array.from(codes)}));
  const BUILT_INS = [
    {name: 'RAINBOW', colours: ['#F03444', '#FF8A24', '#FFE14A', '#43C96B', '#25BDE5', '#4669E8', '#A447D1']},
    {name: 'SUNSET', colours: ['#45256F', '#A52E72', '#E24B4B', '#F1872B', '#FFD56A']},
    {name: 'SUNRISE', colours: ['#253365', '#7757A5', '#E77D91', '#FFB45D', '#FFF0B0']},
    {name: 'SILVER', colours: ['#41464B', '#9DA4AA', '#F2F3F3', '#7B8288', '#202326']},
    {name: 'MIDNIGHT', colours: ['#080B18', '#14275E', '#315CB5', '#7A67C7']},
    {name: 'TOXIC', colours: ['#10190D', '#267026', '#63D42F', '#D7FF45']}
  ];

  const $ = (id) => document.getElementById(id);
  const els = {
    deckName: $('deckName'), inputState: $('inputState'), outputPreview: $('outputPreview'),
    copyButton: $('copyButton'), copyBurst: $('copyBurst'), copyStatus: $('copyStatus'),
    copyHintMessage: $('copyHintMessage'),
    rawCount: $('rawCount'), gradientPips: $('gradientPips'), undoButton: $('undoButton'),
    rotateGradient: $('rotateGradient'), flipGradient: $('flipGradient'), gradientBar: $('gradientBar'),
    barStopMarkers: $('barStopMarkers'), stopRail: $('stopRail'), quickPalettes: $('quickPalettes'),
    paletteTray: $('paletteTray'),
    manaComposer: $('manaComposer'), identityName: $('identityName'), manaOrder: $('manaOrder'),
    clearMana: $('clearMana'), builtInPalettes: $('builtInPalettes'), savedPalettes: $('savedPalettes'),
    favouriteCurrent: $('favouriteCurrent'),
    presetContext: $('presetContext'), selectionSummary: $('selectionSummary'), presetRail: $('presetRail')
  };

  let gradientStops = makeStops([MANA.U.colour, MANA.R.colour]);
  let formatting = {bold: false, italic: false, underline: false, strike: false};
  let selectedStop = 0;
  let manaSelection = [];
  let paletteTrayOpen = false;
  let favourites = [];
  let history = [];
  let currentBuild = null;
  let feedbackTimer = null;
  let defaultNameUntouched = true;

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function makeStops(colours) {
    const source = colours.slice(0, MAX_STOPS).map((colour) => colour.toUpperCase());
    if (!source.length) source.push('#FFFFFF');
    if (source.length === 1) source.push(source[0]);
    return source.map((colour, index) => ({colour, position: index / (source.length - 1)}));
  }

  function identityKey(codes) {
    return Array.from(new Set(codes)).sort((left, right) => MANA_ORDER.indexOf(left) - MANA_ORDER.indexOf(right)).join('');
  }

  function stopSignature(stops = gradientStops) {
    return Logic.normaliseGradientStops(stops)
      .map((stop) => `${stop.colour}@${stop.position.toFixed(3)}`)
      .join('|');
  }

  function gradientCss(stops = gradientStops) {
    return `linear-gradient(90deg,${Logic.normaliseGradientStops(stops)
      .map((stop) => `${stop.colour} ${(stop.position * 100).toFixed(1)}%`)
      .join(',')})`;
  }

  function saveableStops(stops = gradientStops) {
    return Logic.normaliseGradientStops(stops).map((stop) => ({
      colour: stop.colour,
      position: stop.position
    }));
  }

  function paletteWithLocks(stops) {
    let incoming = Logic.normaliseGradientStops(stops).slice(0, MAX_STOPS);
    const locked = gradientStops.filter((stop) => stop.locked);
    if (!locked.length) return incoming;

    locked.forEach((lockedStop) => {
      let index = incoming.findIndex((stop) =>
        !stop.locked && Math.abs(stop.position - lockedStop.position) < .015
      );
      if (index < 0 && incoming.length < MAX_STOPS) {
        incoming.push({...lockedStop, locked: true});
        incoming = Logic.normaliseGradientStops(incoming);
        index = incoming.findIndex((stop) =>
          stop.locked && stop.colour === lockedStop.colour && Math.abs(stop.position - lockedStop.position) < .015
        );
      }
      if (index < 0) {
        index = incoming.reduce((best, stop, candidate) => {
          if (stop.locked) return best;
          if (best < 0) return candidate;
          return Math.abs(stop.position - lockedStop.position) < Math.abs(incoming[best].position - lockedStop.position) ? candidate : best;
        }, -1);
      }
      if (index >= 0) {
        incoming[index] = {...incoming[index], colour: lockedStop.colour, position: lockedStop.position, locked: true};
      }
    });
    return Logic.normaliseGradientStops(incoming).slice(0, MAX_STOPS);
  }

  function haptic(duration = 6) {
    const pulse = Array.isArray(duration)
      ? duration.map((value, index) => index % 2 === 0 ? Math.min(48, value + 8) : value)
      : Math.min(42, Math.max(12, duration + 8));
    try { navigator.vibrate?.(pulse); } catch (_) {}
  }

  function pulseSelectedMarker(index = selectedStop) {
    els.barStopMarkers.querySelectorAll('.bar-marker').forEach((marker) => marker.classList.toggle('selected', marker.dataset.stopIndex === String(index)));
    els.stopRail.querySelectorAll('.stop-chip').forEach((chip) => chip.classList.toggle('selected', chip.dataset.stopIndex === String(index)));
    const marker = els.barStopMarkers.querySelector(`[data-stop-index="${index}"]`);
    if (!marker) return;
    marker.classList.remove('selection-pulse');
    void marker.offsetWidth;
    marker.classList.add('selection-pulse');
  }

  function snapshot() {
    return clone({gradientStops, formatting, selectedStop, manaSelection});
  }

  function checkpoint() {
    history.push(snapshot());
    if (history.length > 30) history.shift();
  }

  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        gradientStops, formatting, manaSelection, favourites
      }));
    } catch (_) {}
  }

  function validSavedPalette(entry) {
    return entry && typeof entry.name === 'string' && Array.isArray(entry.stops) && entry.stops.length >= 2;
  }

  function restorePreferences() {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      if (Array.isArray(stored.gradientStops)) gradientStops = Logic.normaliseGradientStops(stored.gradientStops).slice(0, MAX_STOPS);
      if (stored.formatting && typeof stored.formatting === 'object') {
        Object.keys(formatting).forEach((key) => { formatting[key] = Boolean(stored.formatting[key]); });
      }
      if (Array.isArray(stored.manaSelection)) manaSelection = stored.manaSelection.filter((code) => MANA[code]).slice(0, 3);
      if (Array.isArray(stored.favourites)) {
        favourites = stored.favourites.filter(validSavedPalette).slice(0, 4).map((entry, index) => ({
          name: `SLOT ${String(index + 1).padStart(2, '0')}`,
          stops: saveableStops(entry.stops)
        }));
      }
    } catch (_) {}
    selectedStop = Math.min(selectedStop, gradientStops.length - 1);
  }

  function commitMutation(mutator, options = {}) {
    checkpoint();
    mutator();
    gradientStops = Logic.normaliseGradientStops(gradientStops).slice(0, MAX_STOPS);
    selectedStop = Math.max(0, Math.min(selectedStop, gradientStops.length - 1));
    persist();
    renderAll();
    haptic(options.haptic || 5);
  }

  function undo() {
    const previous = history.pop();
    if (!previous) return;
    gradientStops = Logic.normaliseGradientStops(previous.gradientStops).slice(0, MAX_STOPS);
    formatting = {...formatting, ...previous.formatting};
    selectedStop = Math.min(previous.selectedStop, gradientStops.length - 1);
    manaSelection = previous.manaSelection || [];
    persist();
    renderAll();
    haptic(8);
  }

  function renderPreview(segments) {
    els.outputPreview.replaceChildren();
    segments.forEach((segment) => {
      const span = document.createElement('span');
      span.textContent = segment.text;
      span.style.color = Logic.arenaColour(segment.colour);
      span.style.fontWeight = formatting.bold ? '900' : '650';
      span.style.fontStyle = formatting.italic ? 'italic' : 'normal';
      span.style.textDecoration = [
        formatting.underline && 'underline', formatting.strike && 'line-through'
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
    const sampled = Logic.sampleGradientStops(gradientStops, 7);
    currentBuild = Logic.build(els.deckName.value, sampled, formatting, Logic.LIMIT);
    renderPreview(currentBuild.segments);
    renderPips(currentBuild.segments);
    const overBy = Math.max(0, currentBuild.rawLength - Logic.LIMIT);
    els.rawCount.textContent = overBy ? `${currentBuild.rawLength} / ${Logic.LIMIT} · +${overBy}` : `${currentBuild.rawLength} / ${Logic.LIMIT}`;
    els.rawCount.classList.toggle('over-limit', overBy > 0);
    const invalid = currentBuild.unsupported.length > 0;
    els.inputState.textContent = invalid ? 'UNSUPPORTED CHARACTER' : `${gradientStops.length} STOPS`;
    els.inputState.classList.toggle('error', invalid);
  }

  function syncGradientSurface() {
    els.gradientBar.style.background = gradientCss();
    const glowRoot = document.documentElement.style;
    glowRoot.setProperty('--user-glow-a', gradientStops[0].colour);
    glowRoot.setProperty('--user-glow-mid', Logic.colourAtPosition(gradientStops, .5));
    glowRoot.setProperty('--user-glow-b', gradientStops[gradientStops.length - 1].colour);
  }

  function stopPositionBounds(index) {
    if (index <= 0 || index >= gradientStops.length - 1) return null;
    const minimum = gradientStops[index - 1].position + .015;
    const maximum = gradientStops[index + 1].position - .015;
    return minimum <= maximum ? {minimum, maximum} : null;
  }

  function setDraggedStopPosition(index, clientX, marker) {
    const bounds = els.gradientBar.getBoundingClientRect();
    const limits = stopPositionBounds(index);
    if (!limits || !bounds.width) return;
    const requested = (clientX - bounds.left) / bounds.width;
    const position = Math.max(limits.minimum, Math.min(limits.maximum, requested));
    gradientStops[index].position = position;
    marker.style.left = `${position * 100}%`;
    marker.setAttribute('aria-valuenow', String(Math.round(position * 100)));
    const readout = els.stopRail.querySelector(`[data-stop-index="${index}"] .stop-position`);
    if (readout) readout.textContent = `${Math.round(position * 100)}%`;
    syncGradientSurface();
    renderOutput();
  }

  function renderGradientBar() {
    syncGradientSurface();
    els.barStopMarkers.replaceChildren();
    gradientStops.forEach((stop, index) => {
      const marker = document.createElement('button');
      const movable = index > 0 && index < gradientStops.length - 1;
      marker.type = 'button';
      marker.className = 'bar-marker';
      marker.dataset.stopIndex = String(index);
      marker.classList.toggle('selected', index === selectedStop);
      marker.classList.toggle('pinned', !movable);
      marker.style.left = `${stop.position * 100}%`;
      marker.style.setProperty('--stop-colour', stop.colour);
      marker.textContent = String(index + 1);
      marker.setAttribute('role', 'slider');
      marker.setAttribute('aria-label', movable ? `Gradient stop ${index + 1} position` : `Gradient stop ${index + 1}, fixed endpoint`);
      marker.setAttribute('aria-valuemin', '0');
      marker.setAttribute('aria-valuemax', '100');
      marker.setAttribute('aria-valuenow', String(Math.round(stop.position * 100)));
      marker.setAttribute('aria-readonly', String(!movable));
      marker.title = movable ? 'Drag to position this colour' : 'Gradient endpoint';
      marker.addEventListener('click', (event) => {
        event.stopPropagation();
        selectedStop = index;
        renderGradientEditor();
        pulseSelectedMarker(index);
        haptic(3);
      });
      marker.addEventListener('pointerdown', (event) => {
        event.stopPropagation();
        selectedStop = index;
        if (!movable) return;
        event.preventDefault();
        const startX = event.clientX;
        let dragging = false;
        try { marker.setPointerCapture(event.pointerId); } catch (_) {}
        const move = (moveEvent) => {
          if (moveEvent.pointerId !== event.pointerId) return;
          if (!dragging && Math.abs(moveEvent.clientX - startX) < 3) return;
          if (!dragging) { checkpoint(); dragging = true; marker.classList.add('dragging'); }
          setDraggedStopPosition(index, moveEvent.clientX, marker);
        };
        const finish = (finishEvent) => {
          if (finishEvent.pointerId !== event.pointerId) return;
          marker.removeEventListener('pointermove', move);
          marker.removeEventListener('pointerup', finish);
          marker.removeEventListener('pointercancel', finish);
          if (!dragging) return;
          persist();
          renderAll();
          haptic(7);
        };
        marker.addEventListener('pointermove', move);
        marker.addEventListener('pointerup', finish);
        marker.addEventListener('pointercancel', finish);
      });
      marker.addEventListener('keydown', (event) => {
        event.stopPropagation();
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End', 'Enter', ' '].includes(event.key)) return;
        event.preventDefault();
        if (!movable || ['Enter', ' '].includes(event.key)) {
          selectedStop = index;
          renderGradientEditor();
          return;
        }
        const limits = stopPositionBounds(index);
        if (!limits) return;
        const step = event.shiftKey ? .1 : .02;
        let position = gradientStops[index].position;
        if (event.key === 'ArrowLeft') position -= step;
        if (event.key === 'ArrowRight') position += step;
        if (event.key === 'Home') position = limits.minimum;
        if (event.key === 'End') position = limits.maximum;
        commitMutation(() => {
          gradientStops[index].position = Math.max(limits.minimum, Math.min(limits.maximum, position));
          selectedStop = index;
        });
      });
      els.barStopMarkers.appendChild(marker);
    });
  }

  function moveStop(index, direction) {
    const destination = index + direction;
    if (destination < 0 || destination >= gradientStops.length) return;
    commitMutation(() => {
      const source = {colour: gradientStops[index].colour, locked: gradientStops[index].locked};
      gradientStops[index].colour = gradientStops[destination].colour;
      gradientStops[index].locked = gradientStops[destination].locked;
      gradientStops[destination].colour = source.colour;
      gradientStops[destination].locked = source.locked;
      selectedStop = destination;
      manaSelection = [];
    });
  }

  function removeStop(index) {
    if (gradientStops.length <= 2) return;
    commitMutation(() => {
      gradientStops.splice(index, 1);
      selectedStop = Math.min(index, gradientStops.length - 1);
      manaSelection = [];
    });
  }

  function renderStopRail() {
    els.stopRail.replaceChildren();
    gradientStops.forEach((stop, index) => {
      const item = document.createElement('div');
      const head = document.createElement('button');
      const picker = document.createElement('input');
      const hex = document.createElement('input');
      const controls = document.createElement('div');
      item.className = 'stop-chip';
      item.classList.toggle('selected', index === selectedStop);
      item.classList.toggle('locked', Boolean(stop.locked));
      item.dataset.stopIndex = String(index);
      item.style.setProperty('--chip-colour', stop.colour);
      head.type = 'button';
      head.className = 'stop-head';
      head.innerHTML = `<small>STOP ${String(index + 1).padStart(2, '0')}</small><em class="stop-position">${Math.round(stop.position * 100)}%</em>`;
      head.addEventListener('click', () => { selectedStop = index; renderGradientEditor(); pulseSelectedMarker(index); haptic(3); });
      picker.type = 'color';
      picker.value = stop.colour;
      picker.setAttribute('aria-label', `Colour for gradient stop ${index + 1}`);
      picker.addEventListener('click', () => { selectedStop = index; pulseSelectedMarker(index); });
      picker.addEventListener('change', () => commitMutation(() => {
        gradientStops[index].colour = picker.value.toUpperCase();
        selectedStop = index;
        manaSelection = [];
      }));
      hex.type = 'text';
      hex.className = 'stop-hex';
      hex.value = stop.colour;
      hex.maxLength = 7;
      hex.autocapitalize = 'characters';
      hex.autocomplete = 'off';
      hex.spellcheck = false;
      hex.setAttribute('aria-label', `Hex code for gradient stop ${index + 1}`);
      hex.addEventListener('focus', () => {
        selectedStop = index;
        els.stopRail.querySelectorAll('.stop-chip').forEach((chip) => chip.classList.remove('selected'));
        item.classList.add('selected');
        els.barStopMarkers.querySelectorAll('.bar-marker').forEach((marker) => marker.classList.toggle('selected', marker.dataset.stopIndex === String(index)));
        pulseSelectedMarker(index);
        hex.select();
      });
      const applyStopHex = () => {
        const colour = normaliseHex(hex.value);
        if (!colour) {
          hex.classList.add('error');
          hex.setAttribute('aria-invalid', 'true');
          hex.select();
          haptic(18);
          return;
        }
        hex.classList.remove('error');
        hex.removeAttribute('aria-invalid');
        if (colour === stop.colour) {
          hex.value = colour;
          return;
        }
        commitMutation(() => {
          gradientStops[index].colour = colour;
          selectedStop = index;
          manaSelection = [];
        });
      };
      hex.addEventListener('input', () => {
        hex.value = hex.value.toUpperCase();
        hex.classList.remove('error');
        hex.removeAttribute('aria-invalid');
      });
      hex.addEventListener('change', applyStopHex);
      hex.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter') return;
        event.preventDefault();
        applyStopHex();
      });
      controls.className = 'stop-controls';
      const left = document.createElement('button');
      const lock = document.createElement('button');
      const remove = document.createElement('button');
      const right = document.createElement('button');
      left.type = lock.type = remove.type = right.type = 'button';
      lock.className = 'stop-lock';
      lock.innerHTML = '<i aria-hidden="true"></i>';
      lock.setAttribute('aria-pressed', String(Boolean(stop.locked)));
      lock.setAttribute('aria-label', `${stop.locked ? 'Unlock' : 'Lock'} stop ${index + 1} colour`);
      lock.title = stop.locked ? 'Unlock this colour' : 'Keep this colour when applying palettes';
      left.textContent = '‹'; remove.textContent = '×'; right.textContent = '›';
      left.disabled = index === 0; right.disabled = index === gradientStops.length - 1; remove.disabled = gradientStops.length <= 2;
      left.setAttribute('aria-label', `Move stop ${index + 1} left`);
      right.setAttribute('aria-label', `Move stop ${index + 1} right`);
      remove.setAttribute('aria-label', `Remove stop ${index + 1}`);
      left.addEventListener('click', () => moveStop(index, -1));
      right.addEventListener('click', () => moveStop(index, 1));
      remove.addEventListener('click', () => removeStop(index));
      lock.addEventListener('click', () => commitMutation(() => {
        gradientStops[index].locked = !gradientStops[index].locked;
        selectedStop = index;
      }));
      controls.append(left, lock, remove, right);
      item.append(head, picker, hex, controls);
      els.stopRail.appendChild(item);
    });
    const add = document.createElement('button');
    add.type = 'button';
    add.className = 'add-stop';
    add.disabled = gradientStops.length >= MAX_STOPS;
    add.innerHTML = `<b>+</b><span>${add.disabled ? 'MAX' : 'STOP'}</span>`;
    add.setAttribute('aria-label', add.disabled ? 'Maximum of seven stops reached' : 'Add a colour stop in the largest gap');
    add.addEventListener('click', () => addStopAt(largestGapPosition()));
    els.stopRail.appendChild(add);
  }

  function renderGradientEditor() {
    renderGradientBar();
    renderStopRail();
    els.undoButton.disabled = history.length === 0;
    els.rotateGradient.disabled = gradientStops.length < 2;
    els.flipGradient.disabled = gradientStops.length < 2;
  }

  function largestGapPosition() {
    let best = {size: -1, position: .5};
    for (let index = 1; index < gradientStops.length; index += 1) {
      const left = gradientStops[index - 1].position;
      const right = gradientStops[index].position;
      if (right - left > best.size) best = {size: right - left, position: (left + right) / 2};
    }
    return best.position;
  }

  function addStopAt(position) {
    if (gradientStops.length >= MAX_STOPS) return;
    const point = Math.max(.01, Math.min(.99, position));
    commitMutation(() => {
      const colour = Logic.colourAtPosition(gradientStops, point);
      gradientStops.push({colour, position: point});
      gradientStops.sort((left, right) => left.position - right.position);
      selectedStop = gradientStops.findIndex((stop) => Math.abs(stop.position - point) < .0001);
      manaSelection = [];
    });
  }

  function rotateGradient() {
    commitMutation(() => {
      const entries = Logic.rotatePalette(gradientStops.map((stop) => ({colour: stop.colour, locked: stop.locked})));
      gradientStops = gradientStops.map((stop, index) => ({...stop, ...entries[index]}));
      selectedStop = selectedStop === 0 ? gradientStops.length - 1 : selectedStop - 1;
      if (manaSelection.length > 1) manaSelection = Logic.rotatePalette(manaSelection);
    });
  }

  function flipGradient() {
    commitMutation(() => {
      const entries = Logic.flipPalette(gradientStops.map((stop) => ({colour: stop.colour, locked: stop.locked})));
      gradientStops = gradientStops.map((stop, index) => ({...stop, ...entries[index]}));
      selectedStop = gradientStops.length - 1 - selectedStop;
      if (manaSelection.length > 1) manaSelection = Logic.flipPalette(manaSelection);
    });
  }

  function normaliseHex(value) {
    const clean = String(value).trim().replace(/^#/, '');
    if (/^[0-9a-f]{3}$/i.test(clean)) return '#' + clean.split('').map((digit) => digit + digit).join('').toUpperCase();
    if (/^[0-9a-f]{6}$/i.test(clean)) return '#' + clean.toUpperCase();
    return null;
  }

  function renderManaComposer() {
    els.manaComposer.replaceChildren();
    MANA_ORDER.forEach((code) => {
      const button = document.createElement('button');
      const badge = document.createElement('i');
      const order = manaSelection.indexOf(code);
      button.type = 'button';
      button.className = 'mana-button';
      button.dataset.code = code;
      button.style.setProperty('--mana', MANA[code].colour);
      button.textContent = code;
      button.setAttribute('aria-label', `${MANA[code].name}${order >= 0 ? `, gradient position ${order + 1}` : ''}`);
      button.setAttribute('aria-pressed', String(order >= 0));
      button.disabled = manaSelection.length >= 3 && order < 0;
      if (order >= 0) { badge.textContent = String(order + 1); button.appendChild(badge); }
      button.addEventListener('click', () => {
        commitMutation(() => {
          const existing = manaSelection.indexOf(code);
          if (existing >= 0) manaSelection.splice(existing, 1);
          else if (manaSelection.length < 3) manaSelection.push(code);
          if (manaSelection.length) {
            const colours = manaSelection.map((manaCode) => MANA[manaCode].colour);
            gradientStops = paletteWithLocks(makeStops(colours.length === 1 ? [colours[0], colours[0]] : colours));
            selectedStop = 0;
          }
        }, {name: 'MTG'});
      });
      els.manaComposer.appendChild(button);
    });
    const key = identityKey(manaSelection);
    els.identityName.textContent = IDENTITIES[key] || (manaSelection.length ? 'CUSTOM IDENTITY' : 'CHOOSE COLOURS');
    els.manaOrder.textContent = manaSelection.length ? manaSelection.join(' → ') : '—';
    els.clearMana.disabled = manaSelection.length === 0;
  }

  function presetColours(preset) {
    return preset.codes.map((code) => MANA[code].colour);
  }

  function applyMtgPreset(preset) {
    const sameIdentity = manaSelection.length === preset.codes.length
      && identityKey(manaSelection) === identityKey(preset.codes);
    const nextCodes = sameIdentity ? Logic.rotatePalette(manaSelection) : preset.codes.slice();
    commitMutation(() => {
      gradientStops = paletteWithLocks(makeStops(nextCodes.map((code) => MANA[code].colour)));
      manaSelection = nextCodes;
      selectedStop = 0;
    });
  }

  function renderMtgPresets() {
    const requiredCodes = Array.from(new Set(manaSelection));
    els.presetRail.replaceChildren();
    if (!requiredCodes.length) {
      els.presetContext.textContent = 'PRESETS OFFLINE';
      els.selectionSummary.textContent = 'SELECT PIPS';
      return;
    }
    const matches = Logic.matchingPresets(MTG_PRESETS, requiredCodes);
    els.presetContext.textContent = `${matches.length} MATCHING ${matches.length === 1 ? 'PRESET' : 'PRESETS'}`;
    els.selectionSummary.textContent = requiredCodes.join(' + ');
    if (!matches.length) {
      const empty = document.createElement('div');
      empty.className = 'preset-empty';
      empty.textContent = 'NO MATCHES // TRY A NAME OR CLEAR A PIP';
      els.presetRail.appendChild(empty);
      return;
    }
    matches.forEach((preset) => {
      const button = document.createElement('button');
      const name = document.createElement('strong');
      const detail = document.createElement('span');
      const colours = presetColours(preset);
      const selected = manaSelection.length === preset.codes.length
        && identityKey(manaSelection) === identityKey(preset.codes);
      button.type = 'button';
      button.className = 'preset-button';
      button.classList.toggle('selected', selected);
      button.style.setProperty('--preset', gradientCss(makeStops(colours)));
      button.setAttribute('aria-label', `Apply ${preset.name} colours${selected ? ' in the next order' : ''}`);
      name.textContent = preset.name;
      detail.textContent = selected ? `${manaSelection.join(' → ')} // ROTATE` : preset.codes.join(' / ');
      button.append(name, detail);
      button.addEventListener('click', () => applyMtgPreset(preset));
      els.presetRail.appendChild(button);
    });
  }

  function applyPalette(stops, name) {
    commitMutation(() => {
      gradientStops = paletteWithLocks(stops);
      selectedStop = 0;
      manaSelection = [];
    }, {name});
  }

  function paletteButton(entry, className = '') {
    const button = document.createElement('button');
    const title = document.createElement('strong');
    const detail = document.createElement('span');
    button.type = 'button';
    button.className = `palette-button ${className}`.trim();
    button.style.setProperty('--palette', gradientCss(entry.stops));
    title.textContent = entry.name;
    detail.textContent = `${entry.stops.length} STOPS`;
    button.append(title, detail);
    button.addEventListener('click', () => applyPalette(entry.stops, entry.name));
    return button;
  }

  function renderBuiltIns() {
    els.builtInPalettes.replaceChildren();
    BUILT_INS.forEach((palette) => els.builtInPalettes.appendChild(paletteButton({name: palette.name, stops: makeStops(palette.colours)})));
  }

  function renderQuickPalettes() {
    els.quickPalettes.replaceChildren();
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'palette-menu-button';
    button.innerHTML = '<span class="palette-menu-icon" aria-hidden="true"><i></i><i></i><i></i><i></i></span><span>PALETTES</span>';
    button.title = paletteTrayOpen ? 'Close palette library' : 'Open palette library';
    button.setAttribute('aria-label', button.title);
    button.setAttribute('aria-expanded', String(paletteTrayOpen));
    button.addEventListener('click', () => {
      paletteTrayOpen = !paletteTrayOpen;
      renderQuickPalettes();
      renderPaletteTray();
      haptic(4);
    });
    els.quickPalettes.appendChild(button);
    els.quickPalettes.classList.toggle('tray-open', paletteTrayOpen);
  }

  function renderPaletteTray() {
    els.paletteTray.hidden = !paletteTrayOpen;
  }

  function renderSavedPalettes() {
    els.savedPalettes.replaceChildren();
    const currentSignature = stopSignature();
    const favouriteIndex = favourites.findIndex((entry) => stopSignature(entry.stops) === currentSignature);
    const paletteSlotsFull = favourites.length >= 4 && favouriteIndex < 0;
    els.favouriteCurrent.setAttribute('aria-pressed', String(favouriteIndex >= 0));
    els.favouriteCurrent.disabled = paletteSlotsFull;
    els.favouriteCurrent.innerHTML = favouriteIndex >= 0
      ? '<b aria-hidden="true">&#9733;</b> SAVED'
      : paletteSlotsFull
        ? '<b aria-hidden="true">4/4</b> SLOTS FULL'
        : '<b aria-hidden="true">&#9734;</b> SAVE CURRENT';
    els.favouriteCurrent.title = paletteSlotsFull ? 'Remove a saved palette to free a slot' : '';

    if (favourites.length) {
      const group = document.createElement('section');
      const heading = document.createElement('h3');
      const strip = document.createElement('div');
      heading.textContent = 'SAVED PALETTES // 4 SLOTS';
      strip.className = 'palette-strip compact';
      favourites.forEach((entry, index) => {
        const wrap = document.createElement('div');
        const remove = document.createElement('button');
        wrap.className = 'saved-palette';
        remove.type = 'button';
        remove.className = 'remove-saved';
        remove.textContent = '×';
        remove.setAttribute('aria-label', `Remove saved palette ${entry.name}`);
        remove.addEventListener('click', () => {
          favourites.splice(index, 1);
          persist(); renderSavedPalettes(); haptic(5);
        });
        wrap.append(paletteButton(entry), remove);
        strip.appendChild(wrap);
      });
      group.append(heading, strip);
      els.savedPalettes.appendChild(group);
    }
  }

  function toggleFavourite() {
    const signature = stopSignature();
    const index = favourites.findIndex((entry) => stopSignature(entry.stops) === signature);
    if (index >= 0) favourites.splice(index, 1);
    else if (favourites.length < 4) {
      const occupied = new Set(favourites.map((entry) => Number((entry.name.match(/SLOT\s+(\d+)/) || [])[1])));
      const slot = [1, 2, 3, 4].find((candidate) => !occupied.has(candidate)) || favourites.length + 1;
      favourites.push({name: `SLOT ${String(slot).padStart(2, '0')}`, stops: saveableStops()});
    }
    persist(); renderSavedPalettes(); haptic(8);
  }

  function renderFormatting() {
    document.querySelectorAll('.format-pad button').forEach((button) => {
      button.setAttribute('aria-pressed', String(formatting[button.dataset.format]));
    });
  }

  function renderAll() {
    renderOutput();
    renderGradientEditor();
    renderManaComposer();
    renderMtgPresets();
    renderQuickPalettes();
    renderPaletteTray();
    renderSavedPalettes();
    renderFormatting();
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
      if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(text); return true; }
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
    } catch (_) { return false; }
  }

  function playFeedback(message, error = false) {
    clearTimeout(feedbackTimer);
    els.copyBurst.classList.remove('show');
    els.copyButton.classList.remove('copy-confirmed');
    els.copyButton.classList.remove('feedback-active', 'feedback-error');
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
    els.copyButton.classList.add('feedback-active');
    els.copyButton.classList.toggle('feedback-error', error);
    els.copyHintMessage.textContent = message;
    els.copyBurst.classList.add('show');
    els.copyStatus.textContent = message;
    setTimeout(() => els.copyButton.classList.remove('copy-confirmed'), 220);
    feedbackTimer = setTimeout(() => {
      els.copyBurst.classList.remove('show');
      els.copyButton.classList.remove('feedback-active', 'feedback-error');
      els.copyHintMessage.textContent = '';
    }, 1050);
  }

  async function copyResult() {
    if (!currentBuild.raw) return;
    if (currentBuild.unsupported.length) { playFeedback('UNSUPPORTED CHARACTER', true); haptic(24); return; }
    const copied = await writeClipboard(currentBuild.raw);
    if (!copied) { playFeedback('COPY BLOCKED', true); haptic(24); }
    else if (currentBuild.rawLength > Logic.LIMIT) { playFeedback('OVER 64 - COPIED', true); haptic([15, 30, 15]); }
    else { playFeedback('COPIED!'); haptic(12); }
  }

  restorePreferences();
  renderBuiltIns();
  renderAll();

  els.undoButton.addEventListener('click', undo);
  els.rotateGradient.addEventListener('click', rotateGradient);
  els.flipGradient.addEventListener('click', flipGradient);
  els.gradientBar.addEventListener('click', (event) => {
    if (event.target.closest('.bar-marker')) return;
    const bounds = els.gradientBar.getBoundingClientRect();
    addStopAt((event.clientX - bounds.left) / bounds.width);
  });
  els.gradientBar.addEventListener('keydown', (event) => {
    if (!['Enter', ' '].includes(event.key)) return;
    event.preventDefault(); addStopAt(largestGapPosition());
  });
  els.clearMana.addEventListener('click', () => commitMutation(() => { manaSelection = []; }));
  els.favouriteCurrent.addEventListener('click', toggleFavourite);
  document.querySelectorAll('.format-pad button').forEach((button) => button.addEventListener('click', () => {
    commitMutation(() => { formatting[button.dataset.format] = !formatting[button.dataset.format]; });
  }));
  els.deckName.addEventListener('focus', () => requestAnimationFrame(selectDefaultName));
  els.deckName.addEventListener('pointerup', (event) => {
    if (!defaultNameUntouched || els.deckName.value !== DEFAULT_NAME) return;
    event.preventDefault(); selectDefaultName();
  });
  els.deckName.addEventListener('input', () => { defaultNameUntouched = false; renderOutput(); });
  els.deckName.addEventListener('paste', normalisePastedText);
  els.copyButton.addEventListener('click', copyResult);
  document.addEventListener('keydown', (event) => {
    const isTextField = event.target instanceof HTMLInputElement && ['text', 'search'].includes(event.target.type);
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') { event.preventDefault(); copyResult(); return; }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z' && !isTextField) { event.preventDefault(); undo(); }
  });
})();
