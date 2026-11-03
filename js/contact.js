/**
 * eMCi labs - Contact form handling (sends directly to camilomatiz114@gmail.com)
 */
export function initContactForm() {
  const form = document.getElementById('contactForm');
  const statusEl = document.getElementById('formStatus');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('.btn-submit');
    const originalBtnText = submitBtn.innerHTML;

    const name = form.querySelector('#nombre').value.trim();
    const email = form.querySelector('#email').value.trim();
    const message = form.querySelector('#mensaje').value.trim();

    if (!name || !email || !message) {
      showStatus('Por favor completa todos los campos requeridos.', 'error');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <svg class="spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10" stroke-dasharray="32" stroke-linecap="round"></circle>
      </svg>
      Enviando mensaje...
    `;

    try {
      // Submitting via FormSubmit AJAX endpoint targeted to camilomatiz114@gmail.com
      const response = await fetch('https://formsubmit.co/ajax/camilomatiz114@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          _subject: `Nuevo mensaje de ${name} [Web eMCi labs]`,
          _template: 'table',
          _captcha: 'false',
          Nombre: name,
          Email: email,
          Mensaje: message
        })
      });

      if (response.ok) {
        showStatus('¡Mensaje enviado con éxito! Nos pondremos en contacto contigo a la brevedad.', 'success');
        form.reset();
      } else {
        throw new Error('Servidor ocupado');
      }
    } catch (err) {
      console.warn('Fallback a envío directo:', err);
      // Fallback: Opens user's mail client directly prefilled to contacto@emcilabs.com
      const mailtoUrl = `mailto:contacto@emcilabs.com?subject=Consulta Web eMCi labs de ${encodeURIComponent(name)}&body=${encodeURIComponent("Nombre: " + name + "\nEmail: " + email + "\n\nMensaje:\n" + message)}`;
      window.location.href = mailtoUrl;
      showStatus('Abriendo tu gestor de correo para enviar tu mensaje...', 'success');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
    }
  });

  function showStatus(msg, type) {
    if (!statusEl) return;
    statusEl.className = `form-status ${type}`;
    statusEl.textContent = msg;
    statusEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}
