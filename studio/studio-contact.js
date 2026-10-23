/* Shared contact chooser. Links retain their own navigation actions. */
(() => {
  'use strict'
  const root = document.documentElement
  const triggers = [...document.querySelectorAll('[data-contact-open]')]
  const svg = (paths, className = 'contact-icon') => `<svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="${paths}"/></svg>`
  const arrow = svg('M7 17 17 7M7 7h10v10')
  let opener = null
  let dialog

  if (triggers.length) {
    dialog = document.createElement('dialog')
    dialog.className = 'contact-dialog'
    dialog.id = 'contact-dialog'
    dialog.setAttribute('aria-labelledby', 'contact-dialog-title')
    dialog.setAttribute('aria-describedby', 'contact-dialog-description')
    dialog.innerHTML = `
      <div class="contact-dialog-head"><p class="eyebrow">LET’S TALK / YOUR WAY</p><button class="contact-dialog-close" type="button" aria-label="Close contact options" autofocus>${svg('M6 6l12 12M18 6 6 18')}</button></div>
      <h2 id="contact-dialog-title">How would you like<br>to get in touch?</h2>
      <p class="contact-dialog-intro" id="contact-dialog-description">Choose the way that suits you. You’ll speak directly with me.</p>
      <div class="contact-options">
        <a class="contact-option" href="https://wa.me/260975996792" target="_blank" rel="noopener noreferrer">${svg('M20 11.5a8.5 8.5 0 0 1-12.6 7.4L3 20l1.1-4.4A8.5 8.5 0 1 1 20 11.5ZM8 8c.3 3.5 2.5 5.7 6 6l1-1.5-2-1-1 1a5 5 0 0 1-2.5-2.5l1-1-1-2L8 8Z')}<span><strong>WhatsApp</strong><small>Opens WhatsApp in a new tab</small></span>${arrow}</a>
        <a class="contact-option" href="tel:+260975996792">${svg('M7 3H4a1 1 0 0 0-1 1c0 9.4 7.6 17 17 17a1 1 0 0 0 1-1v-3l-5-2-2 2a15 15 0 0 1-7-7l2-2-2-5Z')}<span><strong>Phone</strong><small>Call +260 975 996 792</small></span>${arrow}</a>
        <a class="contact-option" href="mailto:teditstudiozm@gmail.com">${svg('M4 5h16v14H4V5Zm0 1 8 7 8-7')}<span><strong>Email</strong><small>teditstudiozm@gmail.com</small></span>${arrow}</a>
        <a class="contact-option" href="enquire.html">${svg('M6 3h9l3 3v15H6V3Zm8 0v5h4M9 12h6M9 16h6')}<span><strong>Enquiry form</strong><small>Share your project details and request a quote</small></span>${arrow}</a>
      </div>`
    document.body.append(dialog)

    const close = () => dialog.close()
    dialog.querySelector('.contact-dialog-close').addEventListener('click', close)
    let backdropStart = false
    const outside = event => {
      const bounds = dialog.getBoundingClientRect()
      return event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom
    }
    dialog.addEventListener('pointerdown', event => { backdropStart = event.target === dialog && outside(event) })
    dialog.addEventListener('click', event => {
      if (backdropStart && event.target === dialog && outside(event)) close()
      backdropStart = false
    })
    dialog.addEventListener('close', () => {
      root.classList.remove('contact-dialog-open')
      if (opener) {
        opener.setAttribute('aria-expanded', 'false')
        opener.focus({preventScroll: true})
      }
    })
    triggers.forEach(trigger => {
      trigger.addEventListener('click', () => {
        if (typeof dialog.showModal !== 'function') { location.href = 'enquire.html'; return }
        if (dialog.open) return
        opener = trigger
        dialog.showModal()
        root.classList.add('contact-dialog-open')
        trigger.setAttribute('aria-expanded', 'true')
      })
    })
  }

  const reduced = matchMedia('(prefers-reduced-motion: reduce)')
  const fine = matchMedia('(hover: hover) and (pointer: fine)')
  let effects = []

  function initialiseEffects() {
    if (effects.length) return
    document.querySelectorAll('.wa-interactive').forEach(link => {
      const listeners = new AbortController()
      const options = {signal: listeners.signal, passive: true}
      let rect = null, inside = false, raf = 0, lastFrame = 0, pendingPointer = null
      let x = 0, y = 0, vx = 0, vy = 0, targetX = 0, targetY = 0
      const allowed = () => fine.matches && !reduced.matches
      const write = () => {
        link.style.setProperty('--wa-x', `${x.toFixed(3)}px`)
        link.style.setProperty('--wa-y', `${y.toFixed(3)}px`)
        link.style.setProperty('--wa-depth-x', `${(x * .2).toFixed(3)}px`)
        link.style.setProperty('--wa-depth-y', `${(y * .2).toFixed(3)}px`)
      }
      const frame = timestamp => {
        raf = 0
        if (!allowed()) { reset(); return }
        const dt = lastFrame ? Math.min((timestamp - lastFrame) / 1000, .032) : 1 / 60
        lastFrame = timestamp
        if (pendingPointer) {
          link.style.setProperty('--px', `${pendingPointer.x.toFixed(2)}px`)
          link.style.setProperty('--py', `${pendingPointer.y.toFixed(2)}px`)
          pendingPointer = null
        }
        const stiffness = inside ? 340 : 180
        const friction = Math.exp(-(inside ? 30 : 24) * dt)
        vx = (vx + (targetX - x) * stiffness * dt) * friction
        vy = (vy + (targetY - y) * stiffness * dt) * friction
        x += vx * dt
        y += vy * dt
        x = Math.max(-16, Math.min(16, x))
        y = Math.max(-12, Math.min(12, y))
        write()
        if (Math.abs(targetX - x) + Math.abs(targetY - y) + Math.abs(vx) + Math.abs(vy) > .015) raf = requestAnimationFrame(frame)
        else { x = targetX; y = targetY; vx = vy = 0; write(); lastFrame = 0 }
      }
      const start = () => { if (!raf) raf = requestAnimationFrame(frame) }
      function reset() {
        cancelAnimationFrame(raf)
        raf = lastFrame = 0
        x = y = vx = vy = targetX = targetY = 0
        pendingPointer = null
        inside = false
        link.removeAttribute('data-pointer-inside')
        write()
      }
      link.addEventListener('pointerenter', event => {
        if (!allowed() || event.pointerType === 'touch') return
        inside = true
        rect = link.getBoundingClientRect()
        link.dataset.pointerInside = 'true'
      }, options)
      link.addEventListener('pointermove', event => {
        if (!allowed() || event.pointerType === 'touch') return
        if (!rect) rect = link.getBoundingClientRect()
        const px = event.clientX - rect.left, py = event.clientY - rect.top
        const nx = Math.max(-1, Math.min(1, px / rect.width * 2 - 1))
        const ny = Math.max(-1, Math.min(1, py / rect.height * 2 - 1))
        targetX = nx * 16
        targetY = ny * 12
        pendingPointer = {x: px - x, y: py - y}
        start()
      }, options)
      link.addEventListener('pointerleave', () => {
        inside = false
        rect = null
        pendingPointer = null
        link.removeAttribute('data-pointer-inside')
        targetX = targetY = 0
        if (allowed()) start(); else reset()
      }, options)
      link.addEventListener('pointercancel', reset, options)
      link.addEventListener('blur', () => { if (!inside) reset() }, options)
      window.addEventListener('resize', () => { rect = null }, options)
      reduced.addEventListener('change', reset, {signal: listeners.signal})
      fine.addEventListener('change', reset, {signal: listeners.signal})
      effects.push(() => { listeners.abort(); cancelAnimationFrame(raf); reset() })
    })
  }
  initialiseEffects()
  window.addEventListener('pagehide', () => {
    effects.forEach(destroy => destroy())
    effects = []
    if (dialog?.open) dialog.close()
  })
  window.addEventListener('pageshow', event => { if (event.persisted) initialiseEffects() })
})()
