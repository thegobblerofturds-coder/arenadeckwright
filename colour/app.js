(() => {
  'use strict';

  const LIMIT = 64;
  const CELL_WIDTH = 24;
  const DEFAULT_NAME = 'YOUR DECKLIST HERE';
  const RAINBOW = ['#FF304F', '#FF8A1D', '#FFE23A', '#52D769', '#18C8FF', '#4378FF', '#B641FF'];
  const MANA = {
    white: '#F4E7C4',
    blue: '#2684FF',
    black: '#4B2C59',
    red: '#E34832',
    green: '#39A96B'
  };
  const PRESET_GROUPS = [
    {id: 'special', name: 'Special palettes', detail: 'Rainbow & skies', defaultOpen: true},
    {id: 'guilds', name: 'Two-colour guilds', detail: 'All 10 guilds'},
    {id: 'tricolour', name: 'Three-colour families', detail: 'All 10 combinations'}
  ];
  const COLOUR_PRESETS = [
    {group: 'special', name: 'Rainbow', colours: RAINBOW},
    {group: 'special', name: 'Sunset', colours: ['#542E91', '#D83468', '#F45B32', '#FF9F1C', '#FFE66D']},
    {group: 'special', name: 'Sunrise', colours: ['#34306E', '#7251B5', '#E56B8A', '#FFAA5A', '#FFF1A8']},

    {group: 'guilds', family: 'Allied guilds', name: 'Azorius', detail: 'White + Blue', colours: [MANA.white, MANA.blue], smooth: true},
    {group: 'guilds', family: 'Allied guilds', name: 'Dimir', detail: 'Blue + Black', colours: [MANA.blue, MANA.black], smooth: true},
    {group: 'guilds', family: 'Allied guilds', name: 'Rakdos', detail: 'Black + Red', colours: [MANA.black, MANA.red], smooth: true},
    {group: 'guilds', family: 'Allied guilds', name: 'Gruul', detail: 'Red + Green', colours: [MANA.red, MANA.green], smooth: true},
    {group: 'guilds', family: 'Allied guilds', name: 'Selesnya', detail: 'Green + White', colours: [MANA.green, MANA.white], smooth: true},
    {group: 'guilds', family: 'Enemy guilds', name: 'Orzhov', detail: 'White + Black', colours: [MANA.white, MANA.black], smooth: true},
    {group: 'guilds', family: 'Enemy guilds', name: 'Izzet', detail: 'Blue + Red', colours: [MANA.blue, MANA.red], smooth: true},
    {group: 'guilds', family: 'Enemy guilds', name: 'Golgari', detail: 'Black + Green', colours: [MANA.black, MANA.green], smooth: true},
    {group: 'guilds', family: 'Enemy guilds', name: 'Boros', detail: 'Red + White', colours: [MANA.red, MANA.white], smooth: true},
    {group: 'guilds', family: 'Enemy guilds', name: 'Simic', detail: 'Green + Blue', colours: [MANA.green, MANA.blue], smooth: true},

    {group: 'tricolour', family: 'Shards of Alara', name: 'Bant', detail: 'Green + White + Blue', colours: [MANA.green, MANA.white, MANA.blue], smooth: true},
    {group: 'tricolour', family: 'Shards of Alara', name: 'Esper', detail: 'White + Blue + Black', colours: [MANA.white, MANA.blue, MANA.black], smooth: true},
    {group: 'tricolour', family: 'Shards of Alara', name: 'Grixis', detail: 'Blue + Black + Red', colours: [MANA.blue, MANA.black, MANA.red], smooth: true},
    {group: 'tricolour', family: 'Shards of Alara', name: 'Jund', detail: 'Black + Red + Green', colours: [MANA.black, MANA.red, MANA.green], smooth: true},
    {group: 'tricolour', family: 'Shards of Alara', name: 'Naya', detail: 'Red + Green + White', colours: [MANA.red, MANA.green, MANA.white], smooth: true},
    {group: 'tricolour', family: 'Tarkir wedges', name: 'Abzan', detail: 'White + Black + Green', colours: [MANA.white, MANA.black, MANA.green], smooth: true},
    {group: 'tricolour', family: 'Tarkir wedges', name: 'Jeskai', detail: 'Blue + Red + White', colours: [MANA.blue, MANA.red, MANA.white], smooth: true},
    {group: 'tricolour', family: 'Tarkir wedges', name: 'Sultai', detail: 'Black + Green + Blue', colours: [MANA.black, MANA.green, MANA.blue], smooth: true},
    {group: 'tricolour', family: 'Tarkir wedges', name: 'Mardu', detail: 'Red + White + Black', colours: [MANA.red, MANA.white, MANA.black], smooth: true},
    {group: 'tricolour', family: 'Tarkir wedges', name: 'Temur', detail: 'Green + Blue + Red', colours: [MANA.green, MANA.blue, MANA.red], smooth: true}
  ];
  const $ = (id) => document.getElementById(id);
  const Logic = window.ArenaLogic;

  const els = {
    deckName: $('deckName'),
    inputCallout: $('inputCallout'),
    preview: $('preview'),
    copyButton: $('copyButton'),
    copiedBurst: $('copiedBurst'),
    colourifier: document.querySelector('.colourifier'),
    techActivation: $('techActivation'),
    rawCount: $('rawCount'),
    gradientPips: $('gradientPips'),
    advancedToggle: $('advancedToggle'),
    advancedPanel: $('advancedPanel'),
    segments: $('segments'),
    segmentTemplate: $('segmentTemplate'),
    splitTrack: $('splitTrack'),
    splitScroller: $('splitScroller'),
    splitEmpty: $('splitEmpty'),
    recentColors: $('recentColors'),
    colourPresets: $('colourPresets'),
    formatBold: $('formatBold'),
    formatItalic: $('formatItalic'),
    formatUnderline: $('formatUnderline'),
    formatStrike: $('formatStrike'),
    rawOutput: $('rawOutput'),
    visibleCount: $('visibleCount'),
    tagCount: $('tagCount'),
    remainingCount: $('remainingCount'),
    undoButton: $('undoButton'),
    redoButton: $('redoButton'),
    feedback: $('toolFeedback'),
    gradientFrom: $('gradientFrom'),
    gradientTo: $('gradientTo'),
    colorFromValue: $('colorFromValue'),
    colorToValue: $('colorToValue'),
    fromTrigger: $('fromTrigger'),
    toTrigger: $('toTrigger'),
    fromPopover: $('fromPopover'),
    toPopover: $('toPopover')
  };

  let formatting = {bold: false, italic: false, underline: false, strike: false};
  let activePalette = RAINBOW.slice();
  let segments = Logic.distributePalette(DEFAULT_NAME, activePalette, LIMIT).segments;
  let selectedIndex = 0;
  let history = [];
  let future = [];
  let activeDrag = null;
  let feedbackTimer = null;
  let copyFeedbackTimer = null;
  let activationTimer = null;
  let recentColors = loadRecentColors();

  const validHex = Logic.validHex;
  const arenaColor = Logic.arenaColor;
  const arenaHex = Logic.arenaHex;
  const fullName = () => segments.map((segment) => segment.text).join('');
  const visibleSegments = () => Logic.nonEmpty(segments);
  const formatPrefix = () => Logic.formatPrefix(formatting);
  const contentLimit = () => LIMIT - formatPrefix().length;
  const rawName = () => Logic.formattedRawName(segments, formatting);
  const snapshot = () => JSON.stringify({
    segments,
    palette: activePalette,
    formatting,
    from: els.gradientFrom.value.toUpperCase(),
    to: els.gradientTo.value.toUpperCase()
  });

  function restoreSnapshot(state) {
    const saved = JSON.parse(state);
    segments = Array.isArray(saved) ? saved : saved.segments;
    if (!Array.isArray(saved)) {
      if (Array.isArray(saved.palette) && saved.palette.some(validHex)) activePalette = saved.palette.filter(validHex).map((colour) => colour.toUpperCase());
      else if (segments.length) activePalette = segments.map((segment) => segment.color.toUpperCase());
      if (saved.formatting && typeof saved.formatting === 'object') {
        formatting = {
          bold: Boolean(saved.formatting.bold),
          italic: Boolean(saved.formatting.italic),
          underline: Boolean(saved.formatting.underline),
          strike: Boolean(saved.formatting.strike)
        };
      }
      if (validHex(saved.from)) els.gradientFrom.value = saved.from.toUpperCase();
      if (validHex(saved.to)) els.gradientTo.value = saved.to.toUpperCase();
    }
  }

  function remember(state) {
    if (!state || state === snapshot()) return false;
    if (history[history.length - 1] !== state) history.push(state);
    if (history.length > 100) history.shift();
    future = [];
    updateHistoryButtons();
    return true;
  }

  function capturePaletteFromSegments() {
    if (segments.length) activePalette = segments.map((segment) => segment.color.toUpperCase());
  }

  function mutate(change, capturePalette = true) {
    const before = snapshot();
    change();
    if (capturePalette) capturePaletteFromSegments();
    remember(before);
    normalizeSelection();
    render();
    return before !== snapshot();
  }

  function beginEdit(input) {
    if (!input._arenaStart) input._arenaStart = snapshot();
  }

  function finishEdit(input) {
    remember(input._arenaStart);
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
    els.undoButton.disabled = history.length === 0;
    els.redoButton.disabled = future.length === 0;
  }

  function normalizeSelection() {
    selectedIndex = Math.max(0, Math.min(selectedIndex, Math.max(0, segments.length - 1)));
  }

  function distributeName(name, palette = activePalette) {
    if (!name) {
      segments = [];
      selectedIndex = 0;
      return;
    }
    const result = Logic.distributePalette(name, palette, contentLimit());
    segments = result.error === 'too-long'
      ? [{color: palette[Math.floor(palette.length / 2)] || '#18C8FF', text: name}]
      : result.segments;
    normalizeSelection();
  }

  function rebuildMainGradient() {
    const name = fullName();
    const from = els.gradientFrom.value.toUpperCase();
    const to = els.gradientTo.value.toUpperCase();
    activePalette = makeSmoothPalette(from, to);
    distributeName(name, activePalette);
    selectedIndex = 0;
  }

  function syncEndpointControls() {
    const palette = activePalette.length ? activePalette : RAINBOW;
    els.gradientFrom.value = palette[0].toUpperCase();
    els.gradientTo.value = palette[palette.length - 1].toUpperCase();
    els.colorFromValue.value = els.gradientFrom.value.toUpperCase();
    els.colorToValue.value = els.gradientTo.value.toUpperCase();
    els.fromTrigger.style.setProperty('--orb', els.gradientFrom.value.toUpperCase());
    els.toTrigger.style.setProperty('--orb', els.gradientTo.value.toUpperCase());
  }

  function render() {
    syncEndpointControls();
    syncFormattingControls();
    renderSegments();
    renderSplitEditor();
    renderRecentColors();
    renderColourPresets();
    updateOutput();
    updateHistoryButtons();
  }

  function syncFormattingControls() {
    els.formatBold.setAttribute('aria-pressed', String(formatting.bold));
    els.formatItalic.setAttribute('aria-pressed', String(formatting.italic));
    els.formatUnderline.setAttribute('aria-pressed', String(formatting.underline));
    els.formatStrike.setAttribute('aria-pressed', String(formatting.strike));
  }

  function toggleFormatting(style) {
    const before = snapshot();
    const name = fullName();
    formatting[style] = !formatting[style];
    distributeName(name, activePalette);
    remember(before);
    render();
  }

  function renderSegments() {
    els.segments.innerHTML = '';
    segments.forEach((segment, index) => {
      const row = els.segmentTemplate.content.firstElementChild.cloneNode(true);
      const picker = row.querySelector('.color-picker');
      const hex = row.querySelector('.hex-input');
      const text = row.querySelector('.text-input');
      row.classList.toggle('selected', index === selectedIndex);
      picker.value = segment.color;
      hex.value = segment.color;
      text.value = segment.text;

      const selectRow = () => {
        selectedIndex = index;
        els.segments.querySelectorAll('.segment-row').forEach((item, rowIndex) => item.classList.toggle('selected', rowIndex === index));
      };
      row.addEventListener('click', selectRow);
      row.addEventListener('focusin', selectRow);

      picker.addEventListener('focus', () => beginEdit(picker));
      picker.addEventListener('input', () => {
        segments[index].color = picker.value.toUpperCase();
        capturePaletteFromSegments();
        hex.value = segments[index].color;
        syncEndpointControls();
        renderSplitEditor();
        updateOutput();
      });
      picker.addEventListener('change', () => {
        finishEdit(picker);
        addRecentColor(segments[index].color);
        renderRecentColors();
      });

      hex.addEventListener('focus', () => beginEdit(hex));
      hex.addEventListener('input', () => hex.setCustomValidity(''));
      hex.addEventListener('change', () => {
        const normalized = Logic.normalizeColorHex(hex.value, true);
        if (!normalized) {
          hex.setCustomValidity('Enter a 3- or 6-digit hex colour, such as #F0A or #FF00AA.');
          hex.reportValidity();
          finishEdit(hex);
          return;
        }
        hex.setCustomValidity('');
        segments[index].color = normalized;
        capturePaletteFromSegments();
        finishEdit(hex);
        addRecentColor(normalized);
        render();
      });
      hex.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') hex.blur();
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

  function makeSmoothPalette(from, to) {
    return Logic.buildSafeGradient('1234567', from, to, LIMIT).segments.map((segment) => segment.color.toUpperCase());
  }

  function makeSmoothMultiPalette(colours) {
    if (colours.length < 2) return colours.slice();
    const longPalette = [];
    colours.slice(0, -1).forEach((colour, index) => {
      const leg = makeSmoothPalette(colour, colours[index + 1]);
      if (index) leg.shift();
      longPalette.push(...leg);
    });
    if (longPalette.length <= 7) return longPalette;
    return Array.from({length: 7}, (_, index) => longPalette[Math.round(index * (longPalette.length - 1) / 6)]);
  }

  function paletteForPreset(preset) {
    return preset.smooth ? makeSmoothMultiPalette(preset.colours) : preset.colours.slice();
  }

  function paletteSignature(palette) {
    return palette.map((colour) => arenaHex(colour)).join('|');
  }

  function renderColourPresets() {
    const openGroups = new Set(Array.from(els.colourPresets.querySelectorAll('details[open]')).map((group) => group.dataset.presetGroup));
    const firstRender = els.colourPresets.children.length === 0;
    els.colourPresets.innerHTML = '';
    const activeSignature = paletteSignature(activePalette);
    PRESET_GROUPS.forEach((group) => {
      const presets = COLOUR_PRESETS.filter((preset) => preset.group === group.id);
      const drawer = document.createElement('details');
      const summary = document.createElement('summary');
      const summaryCopy = document.createElement('span');
      const summaryName = document.createElement('strong');
      const summaryDetail = document.createElement('small');
      const count = document.createElement('b');
      const body = document.createElement('div');
      drawer.className = 'preset-group';
      drawer.dataset.presetGroup = group.id;
      drawer.open = openGroups.has(group.id) || (firstRender && group.defaultOpen);
      summaryName.textContent = group.name;
      summaryDetail.textContent = group.detail;
      count.textContent = presets.length;
      count.setAttribute('aria-label', `${presets.length} presets`);
      summaryCopy.append(summaryName, summaryDetail);
      summary.append(summaryCopy, count);
      body.className = 'preset-group-body';

      const families = [...new Set(presets.map((preset) => preset.family || ''))];
      families.forEach((family) => {
        const familySection = document.createElement('section');
        const grid = document.createElement('div');
        familySection.className = 'preset-family';
        grid.className = 'preset-grid';
        if (family) {
          const heading = document.createElement('h4');
          heading.textContent = family;
          familySection.appendChild(heading);
        }
        presets.filter((preset) => (preset.family || '') === family).forEach((preset) => {
          const palette = paletteForPreset(preset);
          const button = document.createElement('button');
          const name = document.createElement('strong');
          const detail = document.createElement('span');
          button.type = 'button';
          button.className = 'preset-button';
          button.style.setProperty('--preset-gradient', gradientCss(palette));
          button.classList.toggle('selected', paletteSignature(palette) === activeSignature);
          button.setAttribute('aria-label', `Apply ${preset.name} colour preset without changing the deck name`);
          name.textContent = preset.name;
          detail.textContent = preset.detail || `${palette.length} colours`;
          button.append(name, detail);
          button.addEventListener('click', () => {
            const before = snapshot();
            activePalette = palette.slice();
            distributeName(fullName(), activePalette);
            selectedIndex = 0;
            remember(before);
            render();
            flash(`${preset.name} colours applied. Your deck name was not changed.`);
          });
          grid.appendChild(button);
        });
        familySection.appendChild(grid);
        body.appendChild(familySection);
      });
      drawer.append(summary, body);
      els.colourPresets.appendChild(drawer);
    });
  }

  function gradientCss(colors) {
    if (!colors.length) return 'linear-gradient(90deg,#ffffff,#ffffff)';
    if (colors.length === 1) return `linear-gradient(90deg,${colors[0]},${colors[0]})`;
    return `linear-gradient(90deg,${colors.map((color, index) => `${color} ${Math.round(index / (colors.length - 1) * 100)}%`).join(',')})`;
  }

  function updateOutput() {
    const name = fullName();
    if (document.activeElement !== els.deckName) els.deckName.value = name;
    els.preview.innerHTML = '';
    visibleSegments().forEach((segment) => {
      const span = document.createElement('span');
      span.textContent = segment.text;
      span.style.color = arenaColor(segment.color);
      span.style.fontWeight = formatting.bold ? '1000' : '700';
      span.style.fontStyle = formatting.italic ? 'italic' : 'normal';
      span.style.textDecorationLine = [
        formatting.underline && 'underline',
        formatting.strike && 'line-through'
      ].filter(Boolean).join(' ') || 'none';
      els.preview.appendChild(span);
    });

    const raw = rawName();
    const rawLength = raw.length;
    const visible = Array.from(name).length;
    const stages = visibleSegments();
    els.rawOutput.value = raw;
    els.rawCount.textContent = `${rawLength} / ${LIMIT} char`;
    els.rawCount.parentElement.classList.toggle('over', rawLength > LIMIT);
    els.visibleCount.textContent = visible;
    els.tagCount.textContent = stages.length + formatPrefix().length / 3;
    els.remainingCount.textContent = LIMIT - rawLength;
    els.copyButton.disabled = visible === 0;
    els.copyButton.classList.toggle('over-limit', rawLength > LIMIT);
    els.copyButton.setAttribute('aria-label', rawLength > LIMIT
      ? 'Copy the coloured Arena deck name; warning: it exceeds 64 characters'
      : 'Copy the coloured Arena deck name');

    els.gradientPips.innerHTML = '';
    stages.forEach((segment, index) => {
      const pip = document.createElement('i');
      const colour = arenaColor(segment.color);
      pip.style.setProperty('--pip', colour);
      pip.title = `Colour stage ${index + 1}: ${arenaHex(segment.color)}`;
      els.gradientPips.appendChild(pip);
    });
    els.gradientPips.setAttribute('aria-label', `${stages.length} colour stage${stages.length === 1 ? '' : 's'}`);
    els.copiedBurst.style.setProperty('--burst-gradient', gradientCss(stages.map((segment) => arenaColor(segment.color))));
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
      cell.textContent = /\s/.test(character) ? '\u00B7' : character;
      cell.style.setProperty('--char-colour', arenaColor(segments[segmentIndex]?.color || '#FFFFFF'));
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
      handle.dataset.boundaryIndex = index;
      handle.style.left = 10 + position * CELL_WIDTH + 'px';
      handle.setAttribute('aria-label', `Move boundary ${index + 1}; currently after character ${position}`);
      handle.title = 'Drag to move this colour boundary';
      handle.addEventListener('pointerdown', (event) => {
        event.preventDefault();
        activeDrag = {index, start: snapshot(), saved: false};
      });
      handle.addEventListener('keydown', (event) => {
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
        event.preventDefault();
        const direction = event.key === 'ArrowLeft' ? -1 : 1;
        mutate(() => moveBoundary(index, boundaryPositions()[index] + direction));
        requestAnimationFrame(() => els.splitTrack.querySelector(`[data-boundary-index="${index}"]`)?.focus());
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
    if (!moveBoundary(activeDrag.index, requested)) return;
    if (!activeDrag.saved) {
      remember(activeDrag.start);
      activeDrag.saved = true;
    }
    renderSegments();
    renderSplitEditor();
    updateOutput();
  });
  window.addEventListener('pointerup', () => { activeDrag = null; });
  window.addEventListener('pointercancel', () => { activeDrag = null; });

  function loadRecentColors() {
    try {
      const stored = JSON.parse(localStorage.getItem('arenaRecentColours') || localStorage.getItem('arenaRecentColors') || '[]');
      if (Array.isArray(stored)) return stored.filter(validHex).map((colour) => colour.toUpperCase()).slice(0, 10);
    } catch (_) {}
    return RAINBOW.slice(0, 5);
  }

  function storeRecentColors() {
    try { localStorage.setItem('arenaRecentColours', JSON.stringify(recentColors)); } catch (_) {}
  }

  function addRecentColor(colour) {
    colour = colour.toUpperCase();
    if (!validHex(colour)) return;
    recentColors = [colour, ...recentColors.filter((item) => item !== colour)].slice(0, 10);
    storeRecentColors();
  }

  function renderRecentColors() {
    els.recentColors.innerHTML = '';
    if (!recentColors.length) {
      const empty = document.createElement('span');
      empty.className = 'recent-empty';
      empty.textContent = 'Colours you use will appear here.';
      els.recentColors.appendChild(empty);
      return;
    }
    recentColors.forEach((colour) => {
      const swatch = document.createElement('button');
      swatch.type = 'button';
      swatch.className = 'recent-swatch';
      swatch.style.setProperty('--swatch', colour);
      swatch.title = `Use ${colour}`;
      swatch.setAttribute('aria-label', `Use recent colour ${colour}`);
      swatch.addEventListener('click', () => {
        mutate(() => {
          if (!segments.length) segments = [{color: colour, text: ''}];
          else segments[selectedIndex].color = colour;
        });
        addRecentColor(colour);
        renderRecentColors();
      });
      els.recentColors.appendChild(swatch);
    });
  }

  function closeColourPopovers(except = null) {
    [
      {widget: $('fromWidget'), trigger: els.fromTrigger, popover: els.fromPopover},
      {widget: $('toWidget'), trigger: els.toTrigger, popover: els.toPopover}
    ].forEach(({widget, trigger, popover}) => {
      if (widget === except) return;
      popover.hidden = true;
      trigger.setAttribute('aria-expanded', 'false');
    });
  }

  function bindColourWidget(widget, trigger, popover, picker, hex) {
    trigger.addEventListener('click', () => {
      const opening = popover.hidden;
      closeColourPopovers(opening ? widget : null);
      popover.hidden = !opening;
      trigger.setAttribute('aria-expanded', String(opening));
      if (opening) requestAnimationFrame(() => picker.focus());
    });

    picker.addEventListener('focus', () => beginEdit(picker));
    picker.addEventListener('input', () => {
      hex.value = picker.value.toUpperCase();
      rebuildMainGradient();
      render();
    });
    picker.addEventListener('change', () => {
      finishEdit(picker);
      addRecentColor(picker.value.toUpperCase());
      renderRecentColors();
    });

    hex.addEventListener('focus', () => beginEdit(hex));
    hex.addEventListener('input', () => {
      hex.setCustomValidity('');
      const normalized = Logic.normalizeColorHex(hex.value, false);
      if (!normalized) return;
      picker.value = normalized;
      rebuildMainGradient();
      render();
    });
    hex.addEventListener('change', () => {
      const normalized = Logic.normalizeColorHex(hex.value, true);
      if (!normalized) {
        hex.setCustomValidity('Enter a 3- or 6-digit hex colour, such as #F0A or #FF00AA.');
        hex.reportValidity();
        finishEdit(hex);
        return;
      }
      hex.setCustomValidity('');
      picker.value = normalized;
      hex.value = normalized;
      rebuildMainGradient();
      render();
      finishEdit(hex);
      addRecentColor(normalized);
      renderRecentColors();
    });
    hex.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') hex.blur();
    });
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
      fallback.style.position = 'fixed';
      fallback.style.left = '-9999px';
      document.body.appendChild(fallback);
      fallback.select();
      const copied = document.execCommand('copy');
      fallback.remove();
      return copied;
    } catch (_) {
      return false;
    }
  }

  function playCopyFeedback(message = 'Copied!', error = false) {
    clearTimeout(copyFeedbackTimer);
    els.copyButton.classList.remove('copy-confirmed');
    els.copiedBurst.classList.remove('show');
    els.copiedBurst.classList.toggle('error', error);
    els.copiedBurst.replaceChildren();
    const colours = error ? ['#FF304F'] : visibleSegments().map((segment) => arenaColor(segment.color));
    Array.from(message).forEach((character, index, letters) => {
      const letter = document.createElement('span');
      const colourIndex = colours.length < 2 ? 0 : Math.round(index * (colours.length - 1) / Math.max(1, letters.length - 1));
      letter.textContent = character;
      letter.style.color = colours[colourIndex] || '#FFFFFF';
      els.copiedBurst.appendChild(letter);
    });
    void els.copiedBurst.offsetWidth;
    els.copyButton.classList.add('copy-confirmed');
    els.copiedBurst.classList.add('show');
    setTimeout(() => els.copyButton.classList.remove('copy-confirmed'), 230);
    copyFeedbackTimer = setTimeout(() => els.copiedBurst.classList.remove('show'), 950);
  }

  function flash(message, error = false) {
    clearTimeout(feedbackTimer);
    els.feedback.textContent = message;
    els.feedback.style.color = error ? '#ff8793' : '#6ce9ff';
    feedbackTimer = setTimeout(() => { els.feedback.textContent = ''; }, 3000);
  }

  els.deckName.addEventListener('focus', () => beginEdit(els.deckName));
  els.deckName.addEventListener('input', () => {
    const caret = els.deckName.selectionStart;
    distributeName(els.deckName.value, activePalette);
    render();
    els.deckName.focus();
    els.deckName.setSelectionRange(caret, caret);
  });
  els.deckName.addEventListener('change', () => finishEdit(els.deckName));

  bindColourWidget($('fromWidget'), els.fromTrigger, els.fromPopover, els.gradientFrom, els.colorFromValue);
  bindColourWidget($('toWidget'), els.toTrigger, els.toPopover, els.gradientTo, els.colorToValue);

  document.addEventListener('click', (event) => {
    if (!$('fromWidget').contains(event.target) && !$('toWidget').contains(event.target)) closeColourPopovers();
  });
  document.addEventListener('pointerdown', () => {
    els.inputCallout.classList.add('dismissed');
    setTimeout(() => { els.inputCallout.hidden = true; }, 240);
  }, {once: true, capture: true});
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeColourPopovers();
    const modifier = event.ctrlKey || event.metaKey;
    if (!modifier || event.altKey || /^(INPUT|TEXTAREA)$/.test(document.activeElement?.tagName || '')) return;
    if (event.key.toLowerCase() === 'z') {
      event.preventDefault();
      event.shiftKey ? redo() : undo();
    } else if (event.key.toLowerCase() === 'y') {
      event.preventDefault();
      redo();
    }
  });

  els.copyButton.addEventListener('click', async () => {
    const raw = rawName();
    if (!raw) return;
    const copied = await writeClipboard(raw);
    if (!copied) playCopyFeedback('COPY BLOCKED', true);
    else if (raw.length > LIMIT) playCopyFeedback('TOO MANY LETTERS!', true);
    else playCopyFeedback('COPIED!');
  });

  els.advancedToggle.addEventListener('click', () => {
    const opening = els.advancedPanel.hidden;
    els.advancedPanel.hidden = !opening;
    els.advancedToggle.setAttribute('aria-expanded', String(opening));
    els.advancedToggle.setAttribute('aria-label', opening ? 'Close advanced colour controls' : 'Open advanced colour controls');
    els.colourifier.classList.toggle('tech-awake', opening);
    clearTimeout(activationTimer);
    els.colourifier.classList.remove('activating');
    if (opening) {
      void els.techActivation.offsetWidth;
      els.colourifier.classList.add('activating');
      activationTimer = setTimeout(() => els.colourifier.classList.remove('activating'), 1450);
    }
  });

  $('addSegment').addEventListener('click', () => {
    mutate(() => {
      segments.push({color: recentColors[0] || '#FFFFFF', text: ''});
      selectedIndex = segments.length - 1;
    });
    els.segments.lastElementChild?.querySelector('.text-input')?.focus();
  });
  els.undoButton.addEventListener('click', undo);
  els.redoButton.addEventListener('click', redo);
  els.formatBold.addEventListener('click', () => toggleFormatting('bold'));
  els.formatItalic.addEventListener('click', () => toggleFormatting('italic'));
  els.formatUnderline.addEventListener('click', () => toggleFormatting('underline'));
  els.formatStrike.addEventListener('click', () => toggleFormatting('strike'));

  $('saveProject').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify({
      version: 3,
      tool: "TurdGobbler's Deck Name Colourifier",
      colours: {from: els.gradientFrom.value.toUpperCase(), to: els.gradientTo.value.toUpperCase()},
      formatting: {...formatting},
      segments
    }, null, 2)], {type: 'application/json'});
    const anchor = document.createElement('a');
    anchor.href = URL.createObjectURL(blob);
    anchor.download = 'gobbler-deck-colour-project.json';
    anchor.click();
    URL.revokeObjectURL(anchor.href);
    flash('Project exported.');
  });

  $('loadProject').addEventListener('change', async (event) => {
    try {
      const data = JSON.parse(await event.target.files[0].text());
      if (!Array.isArray(data.segments) || !data.segments.every((segment) => validHex(segment.color) && typeof segment.text === 'string')) throw new Error();
      mutate(() => {
        segments = data.segments.map((segment) => ({color: segment.color.toUpperCase(), text: segment.text}));
        const colours = data.colours || data.colors;
        if (validHex(colours?.from)) els.gradientFrom.value = colours.from.toUpperCase();
        if (validHex(colours?.to)) els.gradientTo.value = colours.to.toUpperCase();
        const importedFormatting = data.formatting || {};
        formatting = {
          bold: Boolean(importedFormatting.bold),
          italic: Boolean(importedFormatting.italic),
          underline: Boolean(importedFormatting.underline),
          strike: Boolean(importedFormatting.strike)
        };
        selectedIndex = 0;
      });
      flash('Project imported.');
    } catch (_) {
      flash('That project file is not valid.', true);
    }
    event.target.value = '';
  });

  render();
})();
