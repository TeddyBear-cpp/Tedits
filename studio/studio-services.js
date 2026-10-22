(() => {
  const target = document.getElementById('business-rotation')
  if (!target) return

  const examples = (target.dataset.examples || target.textContent).split('|').map(value => value.trim()).filter(Boolean)
  if (examples.length < 2) return
  let index = 0
  let timer
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

  function next() {
    if (document.hidden || reducedMotion.matches) return
    target.classList.add('is-changing')
    window.setTimeout(() => {
      index = (index + 1) % examples.length
      target.textContent = examples[index]
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
