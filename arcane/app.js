(() => {
  'use strict';

  const LIMIT = 64;
  const CELL_WIDTH = 22;
  const $ = (id) => document.getElementById(id);
  const Logic = window.ArenaLogic;
  const els = {
    segments: $('segments'), template: $('segmentTemplate'), deckName: $('deckName'),
    preview: $('preview'), raw: $('rawOutput'), rawCount: $('rawCount'),
    visible: $('visibleCount'), tags: $('tagCount'), remaining: $('remainingCount'),
    meter: $('meterFill'), status: $('status'), splitTrack: $('splitTrack'),
    splitScroller: $('splitScroller'), splitEmpty: $('splitEmpty'),
    recentColors: $('recentColors'), gradientNote: $('gradientNote'),
    feedback: $('toolFeedback'), undo: $('undoButton'), redo: $('redoButton'),
    gradientPips: $('gradientPips'), gradientCount: $('gradientCount')
  };

  let segments = [];
  let selectedIndex = 0;
  let history = [];
  let future = [];
  let activeDrag = null;
  let feedbackTimer = null;
  let recentColors = loadRecentColors();

  const presets = [
    {name: 'Ember Crown', segments: [{color: '#FF6B35', text: 'Ember '}, {color: '#FFD166', text: 'Crown'}]},
    {name: 'Neon Tempo', segments: [{color: '#00E5FF', text: 'Neon '}, {color: '#A855F7', text: 'Tempo'}]},
    {name: 'Forest Pact', segments: [{color: '#56D364', text: 'Forest '}, {color: '#D2A85A', text: 'Pact'}]},
    {name: 'Mono', segments: [{color: '#E8EAF0', text: 'Clean Slate'}]}
  ];

  const validHex = Logic.validHex;
  const snapshot = () => JSON.stringify({
    segments,
    from: $('gradientFrom').value.toUpperCase(),
    to: $('gradientTo').value.toUpperCase()
  });
  const fullName = () => segments.map((segment) => segment.text).join('');
  const serializedSegments = () => Logic.nonEmpty(segments);
  const arenaHex = Logic.arenaHex;
  const arenaColor = Logic.arenaColor;
  const rawName = () => Logic.rawName(segments);

  function restoreSnapshot(state) {
    const saved = JSON.parse(state);
    if (Array.isArray(saved)) {
      segments = saved;
    } else {
      segments = saved.segments;
      if (Logic.validHex(saved.from)) $('gradientFrom').value = saved.from;
      if (Logic.validHex(saved.to)) $('gradientTo').value = saved.to;
    }
    updateQuickColorLabels();
  }

  function remember(state) {
    if (state === snapshot()) return false;
    if (history[history.length - 1] !== state) history.push(state);
    if (history.length > 100) history.shift();
    future = [];
    updateHistoryButtons();
    return true;
  }

  function mutate(change) {
    const before = snapshot();
    change();
    remember(before);
    normalizeSelection();
    render();
    return before !== snapshot();
  }

  function beginEdit(input) {
    input._arenaStart = snapshot();
  }

  function finishEdit(input) {
    if (input._arenaStart) remember(input._arenaStart);
    input._arenaStart = null;
    updateHistoryButtons();
  }

  function undo() {
    if (!history.length) return;
    future.push(snapshot());
    restoreSnapshot(history.pop());
    normalizeSelection();
    render();
  }

  function redo() {
    if (!future.length) return;
    history.push(snapshot());
    restoreSnapshot(future.pop());
    normalizeSelection();
    render();
  }

  function updateHistoryButtons() {
    els.undo.disabled = history.length === 0;
    els.redo.disabled = future.length === 0;
  }

  function normalizeSelection() {
    selectedIndex = Math.max(0, Math.min(selectedIndex, Math.max(0, segments.length - 1)));
  }

  function render() {
    updateQuickColorLabels();
    renderSegments();
    renderSplitEditor();
    renderRecentColors();
    updateOutput();
    updateHistoryButtons();
  }

  function renderSegments() {
    els.segments.innerHTML = '';
    segments.forEach((segment, index) => {
      const row = els.template.content.firstElementChild.cloneNode(true);
      const picker = row.querySelector('.color-picker');
      const hex = row.querySelector('.hex-input');
      const text = row.querySelector('.text-input');
      row.classList.toggle('selected', index === selectedIndex);
      picker.value = segment.color;
      hex.value = segment.color;
      text.value = segment.text;

      row.addEventListener('click', () => {
        selectedIndex = index;
        els.segments.querySelectorAll('.segment-row').forEach((item, rowIndex) => item.classList.toggle('selected', rowIndex === index));
      });
      row.addEventListener('focusin', () => {
        selectedIndex = index;
        els.segments.querySelectorAll('.segment-row').forEach((item, rowIndex) => item.classList.toggle('selected', rowIndex === index));
      });

      picker.addEventListener('focus', () => beginEdit(picker));
      picker.addEventListener('input', () => {
        segments[index].color = picker.value.toUpperCase();
        hex.value = segments[index].color;
        renderSplitEditor();
        updateOutput();
      });
      picker.addEventListener('change', () => {
        finishEdit(picker);
        addRecentColor(segments[index].color);
        renderRecentColors();
      });

      hex.addEventListener('focus', () => beginEdit(hex));
      hex.addEventListener('change', () => {
        let value = hex.value.trim();
        if (!value.startsWith('#')) value = '#' + value;
        if (validHex(value)) {
          segments[index].color = value.toUpperCase();
          finishEdit(hex);
          addRecentColor(segments[index].color);
        }
        render();
      });

      text.addEventListener('focus', () => beginEdit(text));
      text.addEventListener('input', () => {
        segments[index].text = text.value;
        renderSplitEditor();
        updateOutput();
      });
      text.addEventListener('change', () => finishEdit(text));

      row.querySelector('.remove-button').addEventListener('click', () => mutate(() => segments.splice(index, 1)));
      row.querySelector('.move-up').addEventListener('click', () => moveSegment(index, -1));
      row.querySelector('.move-down').addEventListener('click', () => moveSegment(index, 1));
      els.segments.appendChild(row);
    });
  }

  function moveSegment(index, delta) {
    const next = index + delta;
    if (next < 0 || next >= segments.length) return;
    mutate(() => {
      [segments[index], segments[next]] = [segments[next], segments[index]];
      selectedIndex = next;
    });
  }

  function updateOutput() {
    const name = fullName();
    if (document.activeElement !== els.deckName) els.deckName.value = name;
    els.preview.innerHTML = '';
    serializedSegments().forEach((segment) => {
      const span = document.createElement('span');
      span.textContent = segment.text;
      span.style.color = arenaColor(segment.color);
      els.preview.appendChild(span);
    });
    const visible = Array.from(name).length;
    const tags = serializedSegments().length;
    const raw = rawName();
    const length = raw.length;
    const remaining = LIMIT - length;
    if (!visible) {
      els.preview.classList.add('empty');
      els.preview.textContent = 'Your deck name appears here';
    } else {
      els.preview.classList.remove('empty');
    }
    els.raw.value = raw;
    els.rawCount.textContent = `${length} / ${LIMIT}`;
    els.visible.textContent = visible;
    els.tags.textContent = tags;
    els.remaining.textContent = remaining;
    els.meter.style.width = Math.min(100, length / LIMIT * 100) + '%';
    els.meter.style.background = length > LIMIT ? 'var(--danger)' : length > 54 ? 'var(--accent)' : 'var(--ok)';
    const over = length > LIMIT;
    els.status.className = 'status' + (over ? ' error' : '');
    els.status.textContent = over
      ? `${length - LIMIT} character${length - LIMIT === 1 ? '' : 's'} over Arena's limit.`
      : `${remaining} character${remaining === 1 ? '' : 's'} available.`;
    $('copyButton').disabled = over || !visible;
    $('colorWords').disabled = !name.trim();
    $('optimizeTags').disabled = segments.length === 0;
    $('applyGradient').disabled = !name;
    const maxStops = Logic.maxGradientStops(name, LIMIT);
    updateGradientCapacity(name);
    els.gradientNote.textContent = !name
      ? "Uses the smoothest gradient that fits Arena's 64-character limit."
      : maxStops < 1
        ? 'This name is too long to fit even one color tag.'
        : `${Math.min(Array.from(name).length, maxStops)} color stop${Math.min(Array.from(name).length, maxStops) === 1 ? '' : 's'} fit without going over 64.`;
  }

  function updateGradientCapacity(name) {
    if (!els.gradientPips || !els.gradientCount) return;
    const result = name
      ? Logic.buildSafeGradient(name, $('gradientFrom').value.toUpperCase(), $('gradientTo').value.toUpperCase(), LIMIT)
      : {segments: [], error: 'empty'};
    const stops = result.error ? [] : result.segments;
    els.gradientPips.innerHTML = '';
    stops.forEach((segment, index) => {
      const pip = document.createElement('i');
      pip.style.setProperty('--stop-color', arenaColor(segment.color));
      pip.title = `Safe color stop ${index + 1}: ${arenaHex(segment.color)}`;
      els.gradientPips.appendChild(pip);
    });
    els.gradientCount.textContent = `${stops.length} STOP${stops.length === 1 ? '' : 'S'}`;
    els.gradientPips.setAttribute('aria-label', `${stops.length} safe gradient stop${stops.length === 1 ? '' : 's'} available`);
  }

  function boundaryPositions() {
    return Logic.boundaryPositions(segments);
  }

  function renderSplitEditor() {
    const characters = Array.from(fullName());
    const boundaries = boundaryPositions();
    els.splitTrack.innerHTML = '';
    els.splitTrack.style.width = Math.max(characters.length * CELL_WIDTH + 20, 40) + 'px';
    let segmentIndex = 0;
    let nextBoundary = boundaries[0] ?? Infinity;
    characters.forEach((character, index) => {
      while (index >= nextBoundary && segmentIndex < segments.length - 1) {
        segmentIndex += 1;
        nextBoundary = boundaries[segmentIndex] ?? Infinity;
      }
      const cell = document.createElement('span');
      cell.className = 'split-char' + (/\s/.test(character) ? ' space' : '');
      cell.textContent = /\s/.test(character) ? '·' : character;
      cell.style.setProperty('--char-color', arenaColor(segments[segmentIndex]?.color || '#FFFFFF'));
      cell.setAttribute('aria-hidden', 'true');
      els.splitTrack.appendChild(cell);
    });

    let handleCount = 0;
    boundaries.forEach((position, index) => {
      const previous = index === 0 ? 0 : boundaries[index - 1];
      const next = index === boundaries.length - 1 ? characters.length : boundaries[index + 1];
      if (next - previous < 2) return;
      const handle = document.createElement('button');
      handle.className = 'split-handle';
      handle.type = 'button';
      handle.style.left = 10 + position * CELL_WIDTH + 'px';
      handle.setAttribute('aria-label', `Move boundary ${index + 1}; currently after character ${position}`);
      handle.title = 'Drag to move this color boundary';
      handle.addEventListener('pointerdown', (event) => {
        event.preventDefault();
        activeDrag = {index, start: snapshot(), saved: false};
      });
      handle.addEventListener('keydown', (event) => {
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
        event.preventDefault();
        const direction = event.key === 'ArrowLeft' ? -1 : 1;
        mutate(() => moveBoundary(index, boundaryPositions()[index] + direction));
        requestAnimationFrame(() => els.splitTrack.querySelectorAll('.split-handle')[index]?.focus());
      });
      els.splitTrack.appendChild(handle);
      handleCount += 1;
    });
    els.splitEmpty.classList.toggle('visible', handleCount === 0);
  }

  function moveBoundary(index, requestedPosition) {
    const result = Logic.moveBoundary(segments, index, requestedPosition);
    if (result.moved) segments = result.segments;
    return result.moved;
  }

  window.addEventListener('pointermove', (event) => {
    if (!activeDrag) return;
    const rect = els.splitTrack.getBoundingClientRect();
    const requested = Math.round((event.clientX - rect.left - 10) / CELL_WIDTH);
    const beforeMove = snapshot();
    if (!moveBoundary(activeDrag.index, requested)) return;
    if (!activeDrag.saved) {
      remember(activeDrag.start);
      activeDrag.saved = true;
    }
    if (beforeMove !== snapshot()) {
      renderSegments();
      renderSplitEditor();
      updateOutput();
    }
  });
  window.addEventListener('pointerup', () => { activeDrag = null; });
  window.addEventListener('pointercancel', () => { activeDrag = null; });

  function rebuildQuickGradient(name) {
    if (!name) {
      segments = [];
      selectedIndex = 0;
      return;
    }
    const from = $('gradientFrom').value.toUpperCase();
    const to = $('gradientTo').value.toUpperCase();
    const result = Logic.buildSafeGradient(name, from, to, LIMIT);
    segments = result.error === 'too-long' ? [{color: from, text: name}] : result.segments;
    selectedIndex = 0;
  }

  function updateQuickColorLabels() {
    $('colorFromValue').value = $('gradientFrom').value.toUpperCase();
    $('colorToValue').value = $('gradientTo').value.toUpperCase();
    $('gradientFrom').closest('.mana-orb')?.style.setProperty('--orb', $('gradientFrom').value);
    $('gradientTo').closest('.mana-orb')?.style.setProperty('--orb', $('gradientTo').value);
  }

  function bindQuickColor(input, output) {
    input.addEventListener('focus', () => beginEdit(input));
    input.addEventListener('input', () => {
      output.value = input.value.toUpperCase();
      rebuildQuickGradient(fullName());
      render();
    });
    input.addEventListener('change', () => {
      finishEdit(input);
      addRecentColor(input.value.toUpperCase());
      renderRecentColors();
    });

    output.addEventListener('focus', () => beginEdit(output));
    output.addEventListener('input', () => {
      output.setCustomValidity('');
      const normalized = Logic.normalizeColorHex(output.value, false);
      if (!normalized) return;
      input.value = normalized;
      rebuildQuickGradient(fullName());
      render();
    });
    output.addEventListener('change', () => {
      const normalized = Logic.normalizeColorHex(output.value, true);
      if (!normalized) {
        output.setCustomValidity('Enter a 3- or 6-digit hex color, such as #F0A or #FF00AA.');
        output.reportValidity();
        finishEdit(output);
        return;
      }
      output.setCustomValidity('');
      input.value = normalized;
      output.value = normalized;
      rebuildQuickGradient(fullName());
      render();
      finishEdit(output);
      addRecentColor(normalized);
      renderRecentColors();
    });
    output.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') output.blur();
    });
  }

  function applySafeGradient() {
    const name = fullName();
    if (!name) return;
    const result = Logic.buildSafeGradient(name, $('gradientFrom').value.toUpperCase(), $('gradientTo').value.toUpperCase(), LIMIT);
    if (result.error === 'too-long') {
      flash('Shorten the name before applying a gradient.', true);
      return;
    }
    const from = $('gradientFrom').value.toUpperCase();
    const to = $('gradientTo').value.toUpperCase();
    mutate(() => {
      segments = result.segments;
      selectedIndex = 0;
    });
    addRecentColor(to);
    addRecentColor(from);
    renderRecentColors();
    flash(`${serializedSegments().length} safe gradient stop${serializedSegments().length === 1 ? '' : 's'} applied.`);
  }

  function colorEachWord() {
    const name = fullName();
    if (!name.trim()) return;
    const chunks = Logic.splitWords(name);
    if (!chunks.length) return;
    const currentPalette = segments.filter((segment) => segment.text.length > 0).map((segment) => segment.color);
    const palette = [...new Set([...currentPalette, ...recentColors])];
    if (palette.length < 2) {
      palette.push($('gradientFrom').value.toUpperCase(), $('gradientTo').value.toUpperCase());
    }
    mutate(() => {
      segments = chunks.map((text, index) => ({color: palette[index % palette.length], text}));
      selectedIndex = 0;
    });
    flash(`${chunks.length} word${chunks.length === 1 ? '' : 's'} colored.`);
  }

  function optimizeTags() {
    const beforeLength = rawName().length;
    const beforeRows = segments.length;
    const changed = mutate(() => { segments = Logic.mergeAdjacent(segments); });
    const saved = beforeLength - rawName().length;
    const removedRows = beforeRows - segments.length;
    flash(!changed
      ? 'Already optimized.'
      : saved > 0
        ? `${saved} character${saved === 1 ? '' : 's'} saved.`
        : `${removedRows} empty color row${removedRows === 1 ? '' : 's'} removed.`);
  }

  function flash(message, error = false) {
    clearTimeout(feedbackTimer);
    els.feedback.textContent = message;
    els.feedback.style.color = error ? 'var(--danger)' : 'var(--ok)';
    feedbackTimer = setTimeout(() => { els.feedback.textContent = ''; }, 3000);
  }

  function loadRecentColors() {
    try {
      const stored = JSON.parse(localStorage.getItem('arenaRecentColors') || '[]');
      if (Array.isArray(stored)) return stored.filter(validHex).map((color) => color.toUpperCase()).slice(0, 8);
    } catch (_) {}
    return ['#FF4D8D', '#FFCC4D'];
  }

  function storeRecentColors() {
    try { localStorage.setItem('arenaRecentColors', JSON.stringify(recentColors)); } catch (_) {}
  }

  function addRecentColor(color) {
    color = color.toUpperCase();
    if (!validHex(color)) return;
    recentColors = [color, ...recentColors.filter((item) => item !== color)].slice(0, 8);
    storeRecentColors();
  }

  function renderRecentColors() {
    els.recentColors.innerHTML = '';
    if (!recentColors.length) {
      const empty = document.createElement('span');
      empty.className = 'recent-empty';
      empty.textContent = 'Colors you use will appear here.';
      els.recentColors.appendChild(empty);
      return;
    }
    recentColors.forEach((color) => {
      const swatch = document.createElement('button');
      swatch.type = 'button';
      swatch.className = 'recent-swatch';
      swatch.style.setProperty('--swatch', color);
      swatch.title = `Use ${color}`;
      swatch.setAttribute('aria-label', `Use recent color ${color}`);
      swatch.addEventListener('click', () => {
        mutate(() => {
          if (!segments.length) segments = [{color, text: ''}];
          else segments[selectedIndex].color = color;
        });
        addRecentColor(color);
        renderRecentColors();
      });
      els.recentColors.appendChild(swatch);
    });
  }

  $('addSegment').addEventListener('click', () => {
    mutate(() => {
      segments.push({color: recentColors[0] || '#FFFFFF', text: ''});
      selectedIndex = segments.length - 1;
    });
    els.segments.lastElementChild?.querySelector('.text-input').focus();
  });

  els.deckName.addEventListener('focus', () => beginEdit(els.deckName));
  els.deckName.addEventListener('input', () => {
    const value = els.deckName.value;
    const caret = els.deckName.selectionStart;
    rebuildQuickGradient(value);
    render();
    els.deckName.focus();
    els.deckName.setSelectionRange(caret, caret);
  });
  els.deckName.addEventListener('change', () => finishEdit(els.deckName));
  bindQuickColor($('gradientFrom'), $('colorFromValue'));
  bindQuickColor($('gradientTo'), $('colorToValue'));

  $('clearButton').addEventListener('click', () => mutate(() => { segments = []; selectedIndex = 0; }));
  $('applyGradient').addEventListener('click', applySafeGradient);
  $('colorWords').addEventListener('click', colorEachWord);
  $('optimizeTags').addEventListener('click', optimizeTags);
  els.undo.addEventListener('click', undo);
  els.redo.addEventListener('click', redo);

  document.addEventListener('keydown', (event) => {
    const modifier = event.ctrlKey || event.metaKey;
    if (!modifier || event.altKey) return;
    const editing = /^(INPUT|TEXTAREA)$/.test(document.activeElement?.tagName || '');
    if (editing) return;
    if (event.key.toLowerCase() === 'z') {
      event.preventDefault();
      event.shiftKey ? redo() : undo();
    } else if (event.key.toLowerCase() === 'y') {
      event.preventDefault();
      redo();
    }
  });

  $('copyButton').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(rawName()); }
    catch (_) {
      const fallback = document.createElement('textarea');
      fallback.value = rawName();
      fallback.setAttribute('readonly', '');
      fallback.style.position = 'fixed';
      fallback.style.left = '-9999px';
      document.body.appendChild(fallback);
      fallback.select();
      document.execCommand('copy');
      fallback.remove();
    }
    const button = $('copyButton');
    const label = button.querySelector('span');
    const note = button.querySelector('small');
    label.textContent = 'Copied';
    note.textContent = 'The spell is ready';
    setTimeout(() => {
      label.textContent = 'Copy Name';
      note.textContent = 'Place the encoded name on your clipboard';
    }, 1200);
  });

  presets.forEach((preset) => {
    const button = document.createElement('button');
    button.className = 'preset';
    button.textContent = preset.name;
    button.addEventListener('click', () => mutate(() => {
      segments = preset.segments.map((segment) => ({...segment}));
      $('gradientFrom').value = segments[0].color;
      $('gradientTo').value = segments[segments.length - 1].color;
      selectedIndex = 0;
    }));
    $('presets').appendChild(button);
  });

  $('saveProject').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify({
      version: 3,
      colors: {from: $('gradientFrom').value.toUpperCase(), to: $('gradientTo').value.toUpperCase()},
      segments
    }, null, 2)], {type: 'application/json'});
    const anchor = document.createElement('a');
    anchor.href = URL.createObjectURL(blob);
    anchor.download = 'arena-deck-name.json';
    anchor.click();
    URL.revokeObjectURL(anchor.href);
  });

  $('loadProject').addEventListener('change', async (event) => {
    try {
      const data = JSON.parse(await event.target.files[0].text());
      if (!Array.isArray(data.segments) || !data.segments.every((segment) => validHex(segment.color) && typeof segment.text === 'string')) throw new Error();
      mutate(() => {
        segments = data.segments.map((segment) => ({color: segment.color.toUpperCase(), text: segment.text}));
        if (Logic.validHex(data.colors?.from)) $('gradientFrom').value = data.colors.from.toUpperCase();
        if (Logic.validHex(data.colors?.to)) $('gradientTo').value = data.colors.to.toUpperCase();
        selectedIndex = 0;
      });
    } catch (_) {
      alert('That project file is not valid.');
    }
    event.target.value = '';
  });

  render();
})();
