(() => {
  const form = document.getElementById('quote-form')
  if (!form) return
  const status = document.getElementById('quote-status')
  const submit = document.getElementById('quote-submit')
  const needsError = document.getElementById('needs-error')
  const needs = [...form.querySelectorAll('input[name="needs"]')]

  function hasNeed() {
    return needs.some(input => input.checked)
  }

  needs.forEach(input => input.addEventListener('change', () => {
    if (hasNeed()) needsError.hidden = true
  }))

  form.addEventListener('submit', async event => {
    event.preventDefault()
    if (!hasNeed()) {
      needsError.hidden = false
      needs[0].focus()
      return
    }
    needsError.hidden = true
    form.setAttribute('aria-busy', 'true')
    submit.disabled = true
    status.dataset.state = 'sending'
    status.textContent = 'Sending your enquiry…'
    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: {Accept: 'application/json'},
      })
      if (!response.ok) throw new Error('Submission failed')
      form.reset()
      status.dataset.state = 'success'
      status.textContent = 'Thank you — your enquiry has been sent. I’ll get back to you soon.'
    } catch (_) {
      status.dataset.state = 'error'
      status.textContent = 'Your enquiry could not be sent. Your details are still here; please try again or message me on WhatsApp.'
    } finally {
      form.removeAttribute('aria-busy')
      submit.disabled = false
    }
  })
})()
