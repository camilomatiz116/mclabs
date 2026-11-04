/**
 * eMCi labs - Main Application Scripts
 * Universal bundle: Works seamlessly on both http:// and file:/// environments
 */

// 1. Hero Slider (3 Slides: NASA Standards, Boutique Engineering, Application Lab)
function initHeroSlider() {
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.slider-dot');
  const prevBtn = document.querySelector('.slider-btn-prev');
  const nextBtn = document.querySelector('.slider-btn-next');
  const sliderContainer = document.querySelector('.hero-full-screen');

  if (!slides.length) return;

  let currentIndex = 0;
  let autoplayTimer = null;
  const slideInterval = 7000; // 7 seconds

  function goToSlide(index) {
    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === index);
    });

    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
      dot.setAttribute('aria-selected', i === index ? 'true' : 'false');
    });

    currentIndex = index;
  }

  function nextSlide() {
    const nextIndex = (currentIndex + 1) % slides.length;
    goToSlide(nextIndex);
  }

  function prevSlide() {
    const prevIndex = (currentIndex - 1 + slides.length) % slides.length;
    goToSlide(prevIndex);
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.preventDefault();
      nextSlide();
      resetAutoplay();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.preventDefault();
      prevSlide();
      resetAutoplay();
    });
  }

  dots.forEach(dot => {
    dot.addEventListener('click', (e) => {
      e.preventDefault();
      const targetIndex = parseInt(dot.getAttribute('data-slide'), 10);
      goToSlide(targetIndex);
      resetAutoplay();
    });
  });

  // Touch Swipe for Mobile
  let touchStartX = 0;
  let touchEndX = 0;

  if (sliderContainer) {
    sliderContainer.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    sliderContainer.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    }, { passive: true });

    // Autoplay Pause on Hover
    sliderContainer.addEventListener('mouseenter', () => clearInterval(autoplayTimer));
    sliderContainer.addEventListener('mouseleave', () => startAutoplay());
  }

  function handleSwipe() {
    if (touchEndX < touchStartX - 50) {
      nextSlide();
      resetAutoplay();
    } else if (touchEndX > touchStartX + 50) {
      prevSlide();
      resetAutoplay();
    }
  }

  function startAutoplay() {
    clearInterval(autoplayTimer);
    autoplayTimer = setInterval(nextSlide, slideInterval);
  }

  function resetAutoplay() {
    clearInterval(autoplayTimer);
    startAutoplay();
  }

  // Initial display
  goToSlide(0);
  startAutoplay();
}

// 2. Navbar Mobile Menu & Active State
function initNavbar() {
  const toggleBtn = document.querySelector('.mobile-toggle');
  const navLinks = document.querySelector('.nav-pill-group');
  const links = document.querySelectorAll('.nav-link');

  if (toggleBtn && navLinks) {
    toggleBtn.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });

    links.forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        links.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      });
    });
  }

  // Active section indicator on scroll for anchor links
  const sections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset;
    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 150;
      const sectionId = current.getAttribute('id');
      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        links.forEach(link => {
          if (link.getAttribute('href') === `#${sectionId}`) {
            links.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
          }
        });
      }
    });
  }, { passive: true });
}

// 3. Contact Form (cycor182@hotmail.com)
function initContactForm() {
  const form = document.getElementById('contactForm');
  const statusEl = document.getElementById('formStatus');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('.btn-submit');
    const originalBtnText = submitBtn ? submitBtn.innerHTML : 'Enviar';

    const name = form.querySelector('#nombre') ? form.querySelector('#nombre').value.trim() : '';
    const email = form.querySelector('#email') ? form.querySelector('#email').value.trim() : '';
    const message = form.querySelector('#mensaje') ? form.querySelector('#mensaje').value.trim() : '';

    if (!name || !email || !message) {
      showStatus('Complete todos los campos requeridos.', 'error');
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Enviando solicitud...';
    }

    try {
      const response = await fetch('https://formsubmit.co/ajax/cycor182@hotmail.com', {
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
        showStatus('Su solicitud fue enviada correctamente. Un especialista se comunicará con usted en menos de 24 horas hábiles.', 'success');
        form.reset();
      } else {
        throw new Error('Servidor ocupado');
      }
    } catch (err) {
      const mailtoUrl = `mailto:cycor182@hotmail.com?subject=Consulta Web eMCi labs de ${encodeURIComponent(name)}&body=${encodeURIComponent("Nombre: " + name + "\nEmail: " + email + "\n\nMensaje:\n" + message)}`;
      window.location.href = mailtoUrl;
      showStatus('Abriendo su cliente de correo para enviar la solicitud...', 'success');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
      }
    }
  });

  function showStatus(msg, type) {
    if (!statusEl) return;
    statusEl.className = `form-status ${type}`;
    statusEl.textContent = msg;
    statusEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

// 4. Header: se vuelve sólido al hacer scroll sobre el contenido claro
function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const update = () => header.classList.toggle('is-scrolled', window.scrollY > 40);
  update();
  window.addEventListener('scroll', update, { passive: true });
}

// Bootstrap on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    initHeaderScroll();
    initContactForm();
    initHeroSlider();
  });
} else {
  initNavbar();
  initHeaderScroll();
  initContactForm();
  initHeroSlider();
}
