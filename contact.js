const contactForm = document.getElementById('contact-form');
if (contactForm) {
  const submitButton = document.getElementById('submit-btn');
  const contactStatus = document.getElementById('form-status');
  contactForm.addEventListener('submit', async event => {
    event.preventDefault();
    if (submitButton.disabled) return;
    submitButton.disabled = true;
    contactForm.setAttribute('aria-busy', 'true');
    contactStatus.dataset.state = 'sending';
    contactStatus.textContent = 'Sending your message…';
    submitButton.textContent = 'Sending…';
    try {
      const response = await fetch(contactForm.action, {
        method: 'POST', body: new FormData(contactForm), headers: { Accept: 'application/json' }
      });
      if (!response.ok) throw new Error('Send failed');
      contactStatus.dataset.state = 'success';
      contactStatus.textContent = 'Thank you — your message has been sent.';
      contactForm.reset();
    } catch {
      contactStatus.dataset.state = 'error';
      contactStatus.textContent = 'Your message could not be sent. Your details are still here; please try again, or contact me on Instagram.';
    } finally {
      submitButton.disabled = false;
      contactForm.removeAttribute('aria-busy');
      submitButton.innerHTML = 'Send message <span aria-hidden="true">↗</span>';
    }
  });
}
