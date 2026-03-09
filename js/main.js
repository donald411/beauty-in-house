/* ============================================
   BEAUTY IN HOUSE — Main JS
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Header scroll behavior ---------- */
  const header = document.getElementById('header');
  function updateHeader() {
    if (window.scrollY > 60) {
      header.classList.add('scrolled');
      header.classList.remove('transparent');
    } else {
      header.classList.remove('scrolled');
      header.classList.add('transparent');
    }
  }
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });


  /* ---------- Mobile nav ---------- */
  const toggle   = document.querySelector('.menu-toggle');
  const mobileNav = document.querySelector('.mobile-nav');
  const overlay  = document.querySelector('.mobile-overlay');
  const closeBtn = document.querySelector('.mobile-nav-close');

  function openNav()  { mobileNav.classList.add('open'); overlay.classList.add('open'); document.body.style.overflow = 'hidden'; }
  function closeNav() { mobileNav.classList.remove('open'); overlay.classList.remove('open'); document.body.style.overflow = ''; }

  if (toggle)   toggle.addEventListener('click', openNav);
  if (closeBtn) closeBtn.addEventListener('click', closeNav);
  if (overlay)  overlay.addEventListener('click', closeNav);

  document.querySelectorAll('.mobile-nav-links a').forEach(a => {
    a.addEventListener('click', closeNav);
  });


  /* ---------- Smooth scroll for nav links ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });


  /* ---------- Scroll reveal ---------- */
  const reveals = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

  reveals.forEach(el => observer.observe(el));


  /* ---------- Counter animation ---------- */
  function animateCounter(el, target, duration = 2000, suffix = '') {
    let start = 0;
    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  const statsObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        document.querySelectorAll('[data-count]').forEach(el => {
          const target = parseInt(el.dataset.count);
          const suffix = el.dataset.suffix || '';
          animateCounter(el, target, 2200, suffix);
        });
        statsObserver.disconnect();
      }
    });
  }, { threshold: 0.5 });

  const heroStats = document.querySelector('.hero-stats');
  if (heroStats) statsObserver.observe(heroStats);


  /* ---------- Language toggle ---------- */
  const langBtns = document.querySelectorAll('.nav-lang button');
  langBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      langBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });


  /* ---------- Brand card hover glow ---------- */
  document.querySelectorAll('.brand-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width)  * 100;
      const y = ((e.clientY - rect.top)  / rect.height) * 100;
      card.style.setProperty('--mx', x + '%');
      card.style.setProperty('--my', y + '%');
    });
  });


  /* ---------- Form handling → Google Sheet ---------- */
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();

      // Basic validation
      const company = document.getElementById('company');
      const name = document.getElementById('name');
      const email = document.getElementById('email');
      const country = document.getElementById('country');
      const message = document.getElementById('message');
      const agree = document.getElementById('agree');

      if (!company.value.trim() || !name.value.trim() || !email.value.trim() || !country.value.trim() || !message.value.trim()) {
        showToast('Please fill in all required fields.');
        return;
      }
      if (!agree.checked) {
        showToast('Please agree to the privacy terms.');
        return;
      }

      var submitBtn = contactForm.querySelector('.form-submit');
      var successMsg = document.getElementById('form-success');

      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending…';

      var formData = {
        site: 'B',
        company: company.value.trim(),
        country: country.value.trim(),
        name: name.value.trim(),
        email: email.value.trim(),
        'business-type': document.getElementById('business-type').value,
        'brands-interest': document.getElementById('brands-interest').value.trim(),
        message: message.value.trim(),
      };

      var iframe = document.getElementById('hidden-iframe');
      if (!iframe) {
        iframe = document.createElement('iframe');
        iframe.id = 'hidden-iframe';
        iframe.name = 'hidden-iframe';
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
      }

      var hiddenForm = document.createElement('form');
      hiddenForm.method = 'POST';
      hiddenForm.action = 'https://script.google.com/macros/s/AKfycbzdR5O2WpQ0VVyvqreBsuJCjqEjtoR0DacwuH2FryifvN9WGVZzvbPNFjFG71be3FuG/exec';
      hiddenForm.target = 'hidden-iframe';
      hiddenForm.style.display = 'none';

      Object.keys(formData).forEach(function(key) {
        var input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = formData[key];
        hiddenForm.appendChild(input);
      });

      document.body.appendChild(hiddenForm);
      hiddenForm.submit();
      document.body.removeChild(hiddenForm);

      contactForm.reset();
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Inquiry';
      if (successMsg) {
        successMsg.style.display = 'block';
        successMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
      setTimeout(function() {
        if (successMsg) successMsg.style.display = 'none';
      }, 8000);

      showToast('Your inquiry has been sent. We will reply within 24 hours.');
    });
  }


  /* ---------- Toast notification ---------- */
  function showToast(msg) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span>✓</span> ${msg}`;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 400);
    }, 4000);
  }


  /* ---------- Active nav section highlight ---------- */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
    });
    navLinks.forEach(a => {
      a.classList.remove('active-link');
      if (a.getAttribute('href') === '#' + current) a.classList.add('active-link');
    });
  }, { passive: true });

});
