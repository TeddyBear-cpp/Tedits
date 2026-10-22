/* A damped 2D wave equation. Ambient disturbances and taps share one height field,
   so overlapping waves interfere instead of drawing independent circle overlays. */
(() => {
  'use strict'
  const hero = document.querySelector('.service-hero')
  const canvas = hero?.querySelector('.service-wave-canvas')
  if (!canvas) return
  const context = canvas.getContext('2d', {alpha: true})
  if (!context) return
  const toggle = hero.querySelector('.wave-toggle')
  const reduced = matchMedia('(prefers-reduced-motion: reduce)')
  const interactive = 'a,button,input,select,textarea,summary,label'
  const step = 1 / 60
  let columns = 0, rows = 0, width = 0, height = 0
  let current, previous, next, damping, pixels
  let elapsed = 0, nextAmbient = 0, accumulator = 0, lastFrame = 0, lastDraw = 0, raf = 0
  let visible = true, paused = false, pointer = null
  let light = [211, 230, 239], shade = [39, 61, 80]

  function colour() {
    const dark = document.documentElement.dataset.theme === 'dark'
    light = dark ? [211, 230, 239] : [234, 246, 250]
    shade = dark ? [14, 28, 40] : [65, 95, 119]
    if (pixels) draw()
  }

  function disturb(x, y, radius, strength) {
    const reach = Math.ceil(radius * 3)
    for (let iy = Math.max(1, Math.floor(y - reach)); iy < Math.min(rows - 1, y + reach); iy++) {
      for (let ix = Math.max(1, Math.floor(x - reach)); ix < Math.min(columns - 1, x + reach); ix++) {
        const dx = (ix - x) / radius, dy = (iy - y) / radius
        const distance = (dx * dx + dy * dy) * .5
        // A crest with a surrounding trough displaces no net water volume.
        const pulse = (1 - distance) * Math.exp(-distance) * strength
        const index = iy * columns + ix
        current[index] += pulse
        previous[index] += pulse * .82
      }
    }
  }

  function ambient() {
    // A drifting source and occasional close pairs avoid a metronomic rain loop.
    disturb(columns * (.87 + Math.random() * .09), rows * (.065 + Math.random() * .075),
      3.2 + Math.random() * 1.8, 1.2 + Math.random() * 1.1)
    nextAmbient = elapsed + (Math.random() < .23 ? .24 + Math.random() * .35 : .9 + Math.random() * 2.2)
  }

  function advance() {
    for (let y = 1; y < rows - 1; y++) {
      const start = y * columns
      for (let x = 1; x < columns - 1; x++) {
        const i = start + x, value = current[i]
        const laplacian = current[i - 1] + current[i + 1] + current[i - columns] + current[i + columns] - 4 * value
        // c²=.44 satisfies the 2D stability limit. The edge sponge absorbs energy.
        next[i] = value + (value - previous[i]) * damping[i] + .44 * laplacian
      }
    }
    const recycled = previous
    previous = current
    current = next
    next = recycled
  }

  function draw() {
    const data = pixels.data
    for (let y = 1; y < rows - 1; y++) {
      for (let x = 1; x < columns - 1; x++) {
        const i = y * columns + x
        const dx = current[i + 1] - current[i - 1]
        const dy = current[i + columns] - current[i - columns]
        // Directional surface lighting makes crests bright and troughs shaded.
        const normal = (dx * -.55 + dy * -.83) * 3.2
        const rgb = normal > 0 ? light : shade
        const opacity = Math.min(.45, Math.abs(normal) * .85)
        const p = i * 4
        data[p] = rgb[0]
        data[p + 1] = rgb[1]
        data[p + 2] = rgb[2]
        data[p + 3] = Math.round(opacity * 255)
      }
    }
    context.putImageData(pixels, 0, 0)
  }

  function resize() {
    const bounds = hero.getBoundingClientRect()
    if (!bounds.width || !bounds.height) return
    const cell = Math.max(4, Math.sqrt(bounds.width * bounds.height / 72000))
    const newColumns = Math.ceil(bounds.width / cell)
    const newRows = Math.ceil(bounds.height / cell)
    width = bounds.width
    height = bounds.height
    if (newColumns === columns && newRows === rows) return
    columns = canvas.width = newColumns
    rows = canvas.height = newRows
    current = new Float32Array(columns * rows)
    previous = new Float32Array(columns * rows)
    next = new Float32Array(columns * rows)
    damping = new Float32Array(columns * rows)
    pixels = context.createImageData(columns, rows)
    const edge = Math.min(16, Math.min(columns, rows) * .13)
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < columns; x++) {
        const distance = Math.min(x, y, columns - x - 1, rows - y - 1)
        const sponge = Math.max(0, 1 - distance / edge)
        damping[y * columns + x] = .994 - sponge * sponge * .23
      }
    }
    elapsed = 0
    if (!reduced.matches) {
      ambient()
      // Start with a surface already in motion, rather than a blank first frame.
      for (let i = 0; i < 90; i++) {
        elapsed += step
        if (elapsed >= nextAmbient) ambient()
        advance()
      }
    }
    draw()
    update()
  }

  function frame(timestamp) {
    raf = 0
    const delta = lastFrame ? Math.min((timestamp - lastFrame) / 1000, .05) : step
    lastFrame = timestamp
    accumulator += delta
    let ticks = 0
    while (accumulator >= step && ticks < 3) {
      elapsed += step
      if (elapsed >= nextAmbient) ambient()
      advance()
      accumulator -= step
      ticks++
    }
    // Render at 30fps; physics uses a fixed 60Hz step independent of refresh rate.
    if (timestamp - lastDraw >= 30) {
      draw()
      lastDraw = timestamp
    }
    raf = requestAnimationFrame(frame)
  }

  function update() {
    cancelAnimationFrame(raf)
    raf = 0
    lastFrame = 0
    accumulator = 0
    toggle.hidden = reduced.matches
    toggle.textContent = paused ? 'Resume waves' : 'Pause waves'
    toggle.setAttribute('aria-pressed', String(paused))
    if (pixels && !paused && !reduced.matches && visible && !document.hidden) raf = requestAnimationFrame(frame)
  }

  hero.addEventListener('pointerdown', event => {
    if (event.button !== 0 || event.target.closest(interactive)) return
    pointer = {id: event.pointerId, x: event.clientX, y: event.clientY, time: performance.now()}
  }, {passive: true})
  hero.addEventListener('pointerup', event => {
    const tap = pointer
    pointer = null
    if (!tap || tap.id !== event.pointerId || paused || reduced.matches || !pixels || event.target.closest(interactive)) return
    // A scrolling gesture or text selection should never create a splash.
    if (Math.hypot(event.clientX - tap.x, event.clientY - tap.y) > 10 || performance.now() - tap.time > 700) return
    const rect = hero.getBoundingClientRect()
    disturb((event.clientX - rect.left) / width * columns, (event.clientY - rect.top) / height * rows,
      2.8 + Math.random() * .8, 1.8)
    draw()
  }, {passive: true})
  hero.addEventListener('pointercancel', () => { pointer = null }, {passive: true})
  toggle.addEventListener('click', () => { paused = !paused; update() })
  document.addEventListener('visibilitychange', update)
  reduced.addEventListener('change', () => {
    if (reduced.matches && pixels) context.clearRect(0, 0, columns, rows)
    update()
  })
  new ResizeObserver(resize).observe(hero)
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; update() }, {threshold: 0}).observe(hero)
  new MutationObserver(colour).observe(document.documentElement, {attributes: true, attributeFilter: ['data-theme']})
  colour()
  resize()
})()
