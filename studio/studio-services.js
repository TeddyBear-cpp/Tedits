(() => {
  const target = document.getElementById('business-rotation')
  if (!target) return

  const examples = (target.dataset.examples || target.textContent).split('|').map(value => value.trim()).filter(Boolean)
  if (examples.length < 2) return
  // Stack hidden sizing copies in the same grid cell. The tallest phrase sets
  // the slot height at every viewport/font size, without measuring each switch.
  const current = document.createElement('span')
  current.className = 'business-current'
  current.textContent = target.textContent
  const sizingCopies = [...new Set(examples)].map(example => {
    const copy = document.createElement('span')
    copy.className = 'business-size'
    copy.setAttribute('aria-hidden', 'true')
    copy.textContent = example
    return copy
  })
  target.replaceChildren(current, ...sizingCopies)
  let index = 0
  let timer
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

  function next() {
    if (document.hidden || reducedMotion.matches) return
    target.classList.add('is-changing')
    window.setTimeout(() => {
      index = (index + 1) % examples.length
      current.textContent = examples[index]
      target.classList.remove('is-changing')
    }, 190)
  }

  function updateTimer() {
    window.clearInterval(timer)
    if (!reducedMotion.matches) timer = window.setInterval(next, 3000)
  }

  updateTimer()
  if (reducedMotion.addEventListener) reducedMotion.addEventListener('change', updateTimer)
  else reducedMotion.addListener(updateTimer)
})()
