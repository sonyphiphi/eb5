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


// ===== SECTION 3 CONCERN TABS =====
function initConcernTabs() {
  const tabs = document.querySelectorAll('[data-concern-tab]');
  const panels = document.querySelectorAll('[data-concern-panel]');
  if (!tabs.length || !panels.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-concern-tab');
      tabs.forEach(item => {
        const isActive = item === tab;
        item.classList.toggle('active', isActive);
        item.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });
      panels.forEach(panel => {
        panel.classList.toggle('active', panel.getAttribute('data-concern-panel') === target);
      });
    });
  });
}
initConcernTabs();

// ===== FORM SUBMIT TO CMS / HUBSPOT =====
const SITE_URL = 'https://sigroup.vn';
const URL_AJAX = 'https://sigroup.vn/wp-admin/admin-ajax.php';

function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name) || '';
}

function fillTrackingFields() {
  const trackingFields = [
    'utm_source', 'utm_medium', 'utm_campaign', 'utm_id', 'utm_term', 'utm_content',
    'hsa_acc', 'hsa_cam', 'hsa_grp', 'hsa_ad', 'hsa_src', 'hsa_net', 'hsa_ver'
  ];

  trackingFields.forEach(field => {
    const input = document.getElementById(field);
    if (!input) return;
    const value = getQueryParam(field);
    if (value) input.value = value;
  });

  const source = getQueryParam('utm_source');
  const nguonLead = document.getElementById('nguon_lead');
  if (nguonLead && source) nguonLead.value = source;

  const utmId = document.getElementById('utm_id');
  if (utmId && !utmId.value) utmId.value = 'null';
}

function initCmsHubspotContactForm() {
  const form = document.getElementById('home-contact-ladipage');
  if (!form) return;

  const phoneInput = document.getElementById('PhoneNumber');
  const alertBox = form.querySelector('.home-contact-alert');
  const submitBtn = document.getElementById('si-btn');

  fillTrackingFields();

  if (phoneInput) {
    phoneInput.addEventListener('input', function () {
      this.value = this.value.replace(/[^0-9]/g, '').slice(0, 10);
    });

    phoneInput.addEventListener('paste', function (e) {
      e.preventDefault();
      const pastedText = (e.clipboardData || window.clipboardData).getData('text');
      this.value = pastedText.replace(/[^0-9]/g, '').slice(0, 10);
    });

    phoneInput.addEventListener('keypress', function (e) {
      const char = String.fromCharCode(e.which);
      if (!/[0-9]/.test(char)) e.preventDefault();
    });
  }

  function setAlert(message, type = 'error') {
    if (!alertBox) {
      alert(message);
      return;
    }
    alertBox.textContent = message;
    alertBox.className = `home-contact-alert ${type}`;
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    fillTrackingFields();

    const fullNameInput = form.querySelector('input[name="FullName"]');
    const yearBornInput = form.querySelector('input[name="YearBorn"]');
    const phoneInputEl = form.querySelector('input[name="PhoneNumber"]');
    const emailInput = form.querySelector('input[name="Email"]');
    const citySelect = form.querySelector('select[name="thanh_pho"]');
    const programSelect = form.querySelector('select[name="chuong_trinh_quan_tam"]');

    const FullName = fullNameInput.value.trim();
    const YearBorn = yearBornInput.value.trim();
    let PhoneNumber = phoneInputEl.value.trim().replace(/\D/g, '');
    const Email = emailInput.value.trim();
    const thanh_pho = citySelect.value.trim();
    const chuong_trinh_quan_tam = programSelect.value.trim();

    if (FullName === '') {
      setAlert('Họ và Tên là bắt buộc.');
      fullNameInput.focus();
      return;
    }
    if (YearBorn === '') {
      setAlert('Năm sinh là bắt buộc.');
      yearBornInput.focus();
      return;
    }
    if (PhoneNumber === '') {
      setAlert('Số điện thoại là bắt buộc.');
      phoneInputEl.focus();
      return;
    }
    if (PhoneNumber.length !== 10) {
      setAlert('Số điện thoại phải có đúng 10 chữ số.');
      phoneInputEl.focus();
      return;
    }

    const validPrefixes = ['032', '033', '034', '035', '036', '037', '038', '039', '056', '058', '059', '070', '076', '077', '078', '079', '081', '082', '083', '084', '085', '086', '088', '089', '090', '091', '092', '093', '094', '096', '097', '098', '099'];
    const prefix = PhoneNumber.substring(0, 3);
    if (!validPrefixes.includes(prefix)) {
      setAlert('Số điện thoại không hợp lệ. Vui lòng nhập đúng đầu số di động Việt Nam.');
      phoneInputEl.focus();
      return;
    }

    phoneInputEl.value = PhoneNumber;

    if (Email === '') {
      setAlert('Email là bắt buộc.');
      emailInput.focus();
      return;
    }
    if (chuong_trinh_quan_tam === '') {
      setAlert('Chương trình là bắt buộc.');
      programSelect.focus();
      return;
    }
    if (thanh_pho === '') {
      setAlert('Tỉnh thành là bắt buộc.');
      citySelect.focus();
      return;
    }

    const formData = new FormData(form);
    formData.append('action', 'register_sig_contact');

    if (submitBtn) {
      submitBtn.textContent = 'Đang gửi...';
      submitBtn.disabled = true;
    }
    setAlert('Đang gửi thông tin...', 'loading');

    fetch(URL_AJAX, {
      method: 'POST',
      body: formData,
    })
      .then(response => response.json())
      .then(data => {
        if (data.status) {
          if (typeof fbq === 'function') {
            fbq('track', 'Lead');
          }
          window.location.href = SITE_URL + '/thank-you';
          window.parent.location.href = SITE_URL + '/thank-you';
        } else {
          setAlert('Error: ' + (data.response || 'Không gửi được thông tin.'));
        }
      })
      .catch(error => {
        console.error('Error:', error);
        setAlert('Không gửi được thông tin. Vui lòng thử lại hoặc liên hệ hotline.');
      })
      .finally(() => {
        if (submitBtn) {
          submitBtn.textContent = 'Gửi đi';
          submitBtn.disabled = false;
        }
      });
  });
}

initCmsHubspotContactForm();

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
