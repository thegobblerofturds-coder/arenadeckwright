(() => {
  'use strict';

  const LIMIT = 64;
  const keeper = document.getElementById('goblinKeeper');
  const speech = document.getElementById('goblinReaction');
  const purse = document.querySelector('.character-purse');
  const coins = document.getElementById('shopCoins');
  const spendSummary = document.getElementById('shopSpendSummary');
  const budgetTotal = document.getElementById('budgetTotal');
  const budgetText = document.getElementById('budgetText');
  const budgetColour = document.getElementById('budgetColour');
  const budgetFx = document.getElementById('budgetFx');
  const toast = document.getElementById('toast');
  const stream = document.getElementById('tubeNameCanvas');
  const copyButton = document.getElementById('copyButton');

  if (!keeper || !speech || !purse || !coins || !budgetTotal) return;

  const lines = {
    idle: [
      'Bring me a deck name. I sell questionable improvements.',
      'Sixty-four characters. Spend every one badly.',
      'The water is clear. The merchandise is less so.',
      'Nothing leaves this shop except a very fancy deck name.'
    ],
    browse: [
      'Excellent choice. Probably.',
      'Pick it up. Feel the craftsmanship wobble.',
      'Every charm has a price. Even the ugly ones.',
      'You look like someone who needs more rotation.'
    ],
    drag: [
      'Careful! That one is freshly enchanted.',
      'A little left. No, your other left.',
      'Line it up with the letter you want to ruin.',
      'That snap means it is definitely working.'
    ],
    purchase: [
      'Sold! No refunds. Except the very obvious refund shelf.',
      'A fine waste of characters.',
      'Into the name it goes!',
      'Look at that. More expensive already.'
    ],
    cauldron: [
      'Whole-name brew! Stand back from the bubbles.',
      'One scoop affects every letter. Efficiently irresponsible.',
      'The cauldron is listening. Choose a charm.'
    ],
    tune: [
      'Turn it until it looks expensive.',
      'A precise measurement, approximately.',
      'More! Or less! One of those.'
    ],
    refund: [
      'Refunded. I was never emotionally attached.',
      'Back on the shelf with the suspicious ones.',
      'Your character coins have crawled home.'
    ],
    success: [
      'Pleasure doing business. Paste it into Arena!',
      'Copied! Try not to spend it all in one place.',
      'A masterpiece. Legally, I had nothing to do with it.'
    ],
    broke: [
      'Empty purse! Put something back.',
      'No coins, no charm. Shop rules.',
      'I cannot accept imaginary characters as payment.'
    ],
    nope: [
      'That belongs beside a letter, not in my cauldron.',
      'The cauldron says no. Loudly.',
      'Position that one in the riverbank rail.'
    ],
    inspect: [
      'Go on, turn the little knob.',
      'Purchased goods may still be tampered with.',
      'Tune it. I have absolutely calibrated everything.'
    ],
    typing: [
      'Letters first. Then we spend the rest on nonsense.',
      'A strong name. It could use dangerous accessories.',
      'Keep typing. The purse is keeping count.'
    ]
  };

  let moodTimer = 0;
  let idleTimer = 0;
  let lastLine = '';
  let lastToast = '';
  let pointerStart = null;
  let pointerMoved = false;

  function choose(kind) {
    const group = lines[kind] || lines.idle;
    const choices = group.filter((line) => line !== lastLine);
    return choices[Math.floor(Math.random() * choices.length)] || group[0];
  }

  function react(kind = 'idle', message = '') {
    const line = message || choose(kind);
    lastLine = line;
    keeper.dataset.mood = kind;
    speech.textContent = line;
    keeper.classList.remove('reacting');
    void keeper.offsetWidth;
    keeper.classList.add('reacting');
    clearTimeout(moodTimer);
    moodTimer = window.setTimeout(() => {
      keeper.dataset.mood = 'idle';
      keeper.classList.remove('reacting');
    }, kind === 'broke' ? 3200 : 2200);
  }

  function numberFrom(element) {
    return Math.max(0, Number.parseInt(element?.textContent || '0', 10) || 0);
  }

  function updatePurse() {
    const spent = numberFrom(budgetTotal);
    const remaining = Math.max(0, LIMIT - spent);
    const text = numberFrom(budgetText);
    const colour = numberFrom(budgetColour);
    const fx = numberFrom(budgetFx);
    coins.textContent = String(remaining);
    spendSummary.textContent = `TEXT ${text} · DYE ${colour} · CHARMS ${fx}`;
    purse.style.setProperty('--coins-left', String(remaining / LIMIT));
    purse.classList.toggle('low', remaining <= 12 && spent <= LIMIT);
    purse.classList.toggle('empty', spent >= LIMIT);
    purse.classList.toggle('overdrawn', spent > LIMIT);
    document.querySelectorAll('[data-shop-price]').forEach((item) => {
      const price = Number(item.dataset.shopPrice) || 0;
      item.classList.toggle('unaffordable', price > remaining);
      item.setAttribute('aria-description', `${price} character coins; ${remaining} remaining`);
    });
  }

  function reactToToast() {
    const message = toast?.textContent?.trim() || '';
    if (!message || message === lastToast) return;
    lastToast = message;
    const lower = message.toLowerCase();
    if (lower.includes('copied')) react('success');
    else if (lower.includes('refus') || lower.includes('needed') || lower.includes('short')) react('broke');
    else if (lower.includes('delete') || lower.includes('refund') || lower.includes('cleared')) react('refund');
    else if (lower.includes('cancel')) react('nope', 'Changed your mind? I will pretend I did not notice.');
    else if (lower.includes('undo')) react('tune', 'Time runs backward in this shop. Very expensive plumbing.');
    else if (lower.includes('redo')) react('tune', 'And forward again. Please stop bending time near the stock.');
    else if (lower.includes('saved')) react('purchase', 'Filed in the recipe book. My handwriting is flawless.');
    else if (lower.includes('layered') || lower.includes('applied') || lower.includes('brewed') || lower.includes('created')) react('purchase');
    else if (toast?.classList.contains('error')) react('nope');
  }

  new MutationObserver(updatePurse).observe(budgetTotal, {childList: true, characterData: true, subtree: true});
  [budgetText, budgetColour, budgetFx].forEach((item) => {
    if (item) new MutationObserver(updatePurse).observe(item, {childList: true, characterData: true, subtree: true});
  });
  if (toast) new MutationObserver(reactToToast).observe(toast, {childList: true, characterData: true, subtree: true, attributes: true});
  new MutationObserver(updatePurse).observe(document.body, {childList: true, subtree: true});

  window.addEventListener('goblin-shop-reaction', (event) => {
    react(event.detail?.type || 'purchase');
  });

  document.addEventListener('pointerover', (event) => {
    const ware = event.target.closest?.('.tool-door, .colour-source, .fx-orbit-option, .sprite-source, [data-global-brew]');
    if (ware && !ware.matches(':disabled')) react('browse');
  });

  document.addEventListener('pointerdown', (event) => {
    const draggable = event.target.closest?.('.side-bubble, .tube-token, input[type="range"]');
    if (draggable) react(draggable.matches('input') ? 'tune' : 'drag');
  }, true);

  document.addEventListener('input', (event) => {
    if (event.target.id === 'deckName') react('typing');
    if (event.target.matches?.('input[type="range"], #colourWheel')) react('tune');
  });

  document.addEventListener('click', (event) => {
    const button = event.target.closest?.('button');
    if (!button) return;
    if (button.id === 'globalCauldron') react('cauldron');
    else if (button.id === 'moreButton') react('inspect', 'The ledger contains numbers. Try not to frighten them.');
    else if (button.classList.contains('delete-button') || button.classList.contains('danger-soft')) react('refund');
    else if (button.id === 'copyButton') react(button.disabled ? 'broke' : 'success');
  }, true);

  stream?.addEventListener('pointerdown', (event) => {
    if (event.button !== 0 || event.target.closest('.tube-token, .layer-rail-frame, button, input')) return;
    pointerStart = {x: event.clientX, y: event.clientY, id: event.pointerId};
    pointerMoved = false;
  });
  stream?.addEventListener('pointermove', (event) => {
    if (!pointerStart || event.pointerId !== pointerStart.id) return;
    if (Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y) > 8) pointerMoved = true;
  });
  stream?.addEventListener('pointerup', (event) => {
    if (!pointerStart || event.pointerId !== pointerStart.id) return;
    const shouldCopy = !pointerMoved && !copyButton.disabled && !event.target.closest('.tube-token, .layer-rail-frame, button, input');
    pointerStart = null;
    pointerMoved = false;
    if (shouldCopy) copyButton.click();
  });
  stream?.addEventListener('pointercancel', () => {
    pointerStart = null;
    pointerMoved = false;
  });

  document.addEventListener('pointermove', (event) => {
    if (!document.body.classList.contains('layer-drag-active')) return;
    const x = Math.max(-1, Math.min(1, event.clientX / window.innerWidth * 2 - 1));
    const y = Math.max(-1, Math.min(1, event.clientY / window.innerHeight * 2 - 1));
    keeper.style.setProperty('--look-x', x.toFixed(2));
    keeper.style.setProperty('--look-y', y.toFixed(2));
    keeper.dataset.mood = 'drag';
  });

  function scheduleIdleLine() {
    clearTimeout(idleTimer);
    idleTimer = window.setTimeout(() => {
      if (!document.hidden && !document.body.classList.contains('layer-drag-active')) react('idle');
      scheduleIdleLine();
    }, 18000);
  }

  updatePurse();
  scheduleIdleLine();
})();
