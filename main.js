/* ============================================
   SI GROUP EB-5 LANDING PAGE — MAIN JS
   ============================================ */

// ===== NAVBAR SCROLL =====
const navbar = document.getElementById('navbar');
const announceBar = document.querySelector('.announce-bar');

function updateNavbar() {
  const offset = announceBar ? announceBar.offsetHeight : 0;
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
    navbar.style.top = '0';
  } else {
    navbar.classList.remove('scrolled');
    navbar.style.top = offset + 'px';
  }
}
window.addEventListener('scroll', updateNavbar, { passive: true });
updateNavbar();

// ===== SCROLL REVEAL =====
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        revealObserver.unobserve(e.target);
      }
    });
  },
  { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
);

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ===== COUNTER ANIMATION =====
function animateCounter(el) {
  const target = parseInt(el.getAttribute('data-target'), 10);
  const duration = 1800;
  const start = performance.now();
  const update = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target).toLocaleString();
    if (progress < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.querySelectorAll('.counter').forEach(animateCounter);
        counterObserver.unobserve(e.target);
      }
    });
  },
  { threshold: 0.3 }
);

document.querySelectorAll('.stats-grid').forEach(el => counterObserver.observe(el));
// Fallback: nếu observer không chạy trong browser/tunnel, vẫn hiển thị số thật sau 2.2s.
setTimeout(() => {
  document.querySelectorAll('.counter').forEach(el => {
    if ((el.textContent || '').trim() === '0') el.textContent = parseInt(el.getAttribute('data-target'), 10).toLocaleString();
  });
}, 2200);

// ===== YOUTUBE EMBED / FILE FALLBACK =====
(function initYoutubeEmbeds() {
  document.querySelectorAll('.youtube-embed').forEach(card => {
    const videoId = card.dataset.videoId;
    if (!videoId) return;

    // YouTube iframe can show "Error 153: Video player configuration error"
    // when index.html is opened directly with file:// because there is no valid web origin.
    // In that case, keep the thumbnail link so the video opens reliably on YouTube.
    if (window.location.protocol === 'file:') return;

    const title = card.dataset.videoTitle || 'YouTube video';
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube.com/embed/${videoId}?rel=0`;
    iframe.title = title;
    iframe.loading = 'lazy';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    iframe.allowFullscreen = true;
    card.replaceChildren(iframe);
  });
})();

// ===== FAQ ACCORDION =====
function toggleFaq(btn) {
  const item = btn.closest('.faq-item');
  const answer = item.querySelector('.faq-a');
  const isOpen = item.classList.contains('open');

  // Close all
  document.querySelectorAll('.faq-item.open').forEach(openItem => {
    openItem.classList.remove('open');
    openItem.querySelector('.faq-a').classList.remove('open');
  });

  // Open clicked if was closed
  if (!isOpen) {
    item.classList.add('open');
    answer.classList.add('open');
  }
}

// ===== SMOOTH SCROLL FOR ANCHOR LINKS =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const navH = navbar.offsetHeight + (announceBar ? announceBar.offsetHeight : 0);
      const top = target.getBoundingClientRect().top + window.scrollY - navH - 20;
      window.scrollTo({ top, behavior: 'smooth' });
      // Close mobile menu
      document.getElementById('navLinks').classList.remove('mobile-open');
    }
  });
});

// ===== ACTIVE NAV LINK ON SCROLL =====
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + e.target.id) {
            link.classList.add('active');
          }
        });
      }
    });
  },
  { threshold: 0.35 }
);
sections.forEach(s => sectionObserver.observe(s));

// ===== FORM SUBMIT =====
function submitForm(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  btn.textContent = 'Đang gửi...';
  btn.disabled = true;

  setTimeout(() => {
    btn.textContent = 'Gửi Yêu Cầu Tư Vấn Miễn Phí →';
    btn.disabled = false;
    e.target.reset();

    const toast = document.getElementById('successToast');
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 4000);
  }, 1200);
}

// ===== STICKY CTA =====
const stickyCta = document.getElementById('stickyCta');
window.addEventListener('scroll', () => {
  if (window.innerWidth <= 768) {
    if (window.scrollY > window.innerHeight * 0.5) {
      stickyCta.style.display = 'flex';
    } else {
      stickyCta.style.display = 'none';
    }
  }
}, { passive: true });

// ===== CLOSE MOBILE MENU ON OUTSIDE CLICK =====
document.addEventListener('click', (e) => {
  const navLinks = document.getElementById('navLinks');
  const toggle = document.getElementById('menuToggle');
  if (navLinks.classList.contains('mobile-open') &&
      !navLinks.contains(e.target) &&
      !toggle.contains(e.target)) {
    navLinks.classList.remove('mobile-open');
  }
});

// ===== HERO PARTICLES (subtle floating dots) =====
(function initParticles() {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:1;opacity:0.5';
  hero.insertBefore(canvas, hero.firstChild);

  const ctx = canvas.getContext('2d');
  const particles = [];
  const COUNT = 60;

  function resize() {
    canvas.width = hero.offsetWidth;
    canvas.height = hero.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  for (let i = 0; i < COUNT; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.3,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      a: Math.random() * 0.6 + 0.1
    });
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(241, 209, 169, ${p.a})`;
      ctx.fill();
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;
    });
    requestAnimationFrame(draw);
  }
  draw();
})();

// ===== NAVBAR POSITION INIT (accounts for announce bar) =====
window.addEventListener('load', () => {
  if (announceBar && window.scrollY < 10) {
    navbar.style.top = announceBar.offsetHeight + 'px';
  }
});
