(() => {
  'use strict';

  const compact = Math.min(window.innerWidth, window.innerHeight) < 600;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const initialMaximum = reducedMotion ? 28 : (compact ? 76 : 112);
  const hardMaximum = reducedMotion ? 36 : (compact ? 96 : 144);
  const layer = document.createElement('div');
  const arrows = [];
  const target = {x: window.innerWidth / 2, y: window.innerHeight / 2};
  let lastPointerAt = performance.now();
  let frame = 0;

  layer.id = 'cheugSwarm';
  layer.setAttribute('aria-hidden', 'true');
  document.body.appendChild(layer);

  function randomBetween(minimum, maximum) {
    return minimum + Math.random() * (maximum - minimum);
  }

  function startingPoint(size) {
    const edge = Math.floor(Math.random() * 4);
    if (edge === 0) return {x: randomBetween(-size, window.innerWidth), y: randomBetween(-size * 5, -size)};
    if (edge === 1) return {x: window.innerWidth + randomBetween(size, size * 4), y: randomBetween(0, window.innerHeight)};
    if (edge === 2) return {x: randomBetween(0, window.innerWidth), y: window.innerHeight + randomBetween(size, size * 4)};
    return {x: randomBetween(-size * 4, -size), y: randomBetween(0, window.innerHeight)};
  }

  function spawnArrow(force = false) {
    if (arrows.length >= (force ? hardMaximum : initialMaximum)) return;
    const element = document.createElement('span');
    const size = randomBetween(compact ? 24 : 28, compact ? 64 : 92);
    const start = startingPoint(size);
    const arrow = {
      element,
      x: start.x,
      y: start.y,
      size,
      phase: randomBetween(0, Math.PI * 2),
      orbit: randomBetween(30, compact ? 120 : 190),
      orbitSpeed: randomBetween(.0007, .0028) * (Math.random() < .5 ? -1 : 1),
      follow: randomBetween(.018, .065),
      jitter: randomBetween(1, compact ? 3.5 : 5.5),
      pulse: randomBetween(.002, .008)
    };
    element.className = 'cheug-arrow';
    element.textContent = '➤';
    element.style.setProperty('--arrow-size', `${size}px`);
    layer.appendChild(element);
    arrows.push(arrow);
  }

  function aimAt(x, y) {
    target.x = Math.max(0, Math.min(window.innerWidth, x));
    target.y = Math.max(0, Math.min(window.innerHeight, y));
    lastPointerAt = performance.now();
  }

  window.addEventListener('pointermove', (event) => aimAt(event.clientX, event.clientY), {passive: true});
  window.addEventListener('pointerdown', (event) => {
    aimAt(event.clientX, event.clientY);
    for (let index = 0; index < 12; index += 1) spawnArrow(true);
  }, {passive: true});
  window.addEventListener('resize', () => aimAt(window.innerWidth / 2, window.innerHeight / 2), {passive: true});

  function animate(now) {
    if (now - lastPointerAt > 1800) {
      target.x = window.innerWidth * (.5 + Math.sin(now * .00053) * .34);
      target.y = window.innerHeight * (.48 + Math.cos(now * .00071) * .31);
    }

    arrows.forEach((arrow, index) => {
      const angleAroundTarget = arrow.phase + now * arrow.orbitSpeed;
      const desiredX = target.x + Math.cos(angleAroundTarget) * arrow.orbit;
      const desiredY = target.y + Math.sin(angleAroundTarget * 1.17) * arrow.orbit * .72;
      const madness = Math.sin(now * arrow.pulse + index) * arrow.jitter;
      arrow.x += (desiredX - arrow.x) * arrow.follow + madness;
      arrow.y += (desiredY - arrow.y) * arrow.follow + Math.cos(now * arrow.pulse + index) * arrow.jitter;
      const direction = Math.atan2(target.y - arrow.y, target.x - arrow.x) * 180 / Math.PI;
      const throb = 1 + Math.sin(now * .008 + arrow.phase) * .12;
      arrow.element.style.transform = `translate3d(${arrow.x - arrow.size / 2}px,${arrow.y - arrow.size / 2}px,0) rotate(${direction}deg) scale(${throb})`;
    });
    frame = window.requestAnimationFrame(animate);
  }

  window.setTimeout(() => {
    layer.classList.add('cheugs-awake');
    let created = 0;
    const cascade = window.setInterval(() => {
      const batch = reducedMotion ? 2 : Math.floor(randomBetween(4, 9));
      for (let index = 0; index < batch && created < initialMaximum; index += 1) {
        spawnArrow();
        created += 1;
      }
      if (created >= initialMaximum) window.clearInterval(cascade);
    }, reducedMotion ? 100 : 52);
    frame = window.requestAnimationFrame(animate);
  }, 1000);

  window.addEventListener('pagehide', () => window.cancelAnimationFrame(frame), {once: true});
})();
