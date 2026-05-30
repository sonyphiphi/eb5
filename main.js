/* ============================================
   SI GROUP EB-5 LANDING PAGE — MAIN JS
   ============================================ */

// ===== NAVBAR SCROLL =====
const navbar = document.getElementById('navbar');
const announceBar = document.querySelector('.announce-bar');

function updateNavbar() {
  const offset = announceBar ? announceBar.offsetHeight : 0;
  const isMobileHeader = window.matchMedia('(max-width: 768px)').matches;
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
    navbar.style.top = isMobileHeader ? offset + 'px' : '0';
  } else {
    navbar.classList.remove('scrolled');
    navbar.style.top = offset + 'px';
  }
}
window.addEventListener('scroll', updateNavbar, { passive: true });
window.addEventListener('resize', updateNavbar, { passive: true });
updateNavbar();

// ===== MOBILE MENU =====
function toggleMobileMenu(forceClose = false) {
  const navLinksEl = document.getElementById('navLinks');
  if (!navLinksEl) return;
  const shouldOpen = forceClose ? false : !navLinksEl.classList.contains('mobile-open');
  navLinksEl.classList.toggle('mobile-open', shouldOpen);
  document.body.classList.toggle('mobile-menu-open', shouldOpen);
}

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
  const group = btn.closest('.faq-group');
  const answer = item?.querySelector('.faq-a');
  if (!item || !group || !answer) return;

  const isOpen = item.classList.contains('open');

  group.querySelectorAll('.faq-item.open').forEach(openItem => {
    if (openItem !== item) {
      openItem.classList.remove('open');
      openItem.querySelector('.faq-a')?.classList.remove('open');
    }
  });

  item.classList.toggle('open', !isOpen);
  answer.classList.toggle('open', !isOpen);
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
      document.body.classList.remove('mobile-menu-open');
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

// ===== EB-5 CASE PROJECT EXPLORER =====
const EB5_CASE_PROJECTS = [
            {
                id: 1,
                title: "CMB Nhóm 101",
                subtitle: "Phát triển và xây dựng kho bãi công nghiệp / kho vận hạng A, xây theo yêu cầu (Build-to-Suit) phục vụ cho nhà sản xuất ô tô toàn cầu Stellantis.",
                description: "Phát triển và xây dựng kho bãi công nghiệp / kho vận hạng A, xây theo yêu cầu (Build-to-Suit) phục vụ cho nhà sản xuất ô tô toàn cầu Stellantis.",
                regionalCenter: "CMB Regional Centers",
                location: "6850 Denton Road, Thị trấn Van Buren, Quận Wayne, Detroit, Bang Michigan, Hoa Kỳ.",
                teaType: "TEA (Vùng có tỉ lệ thất nghiệp cao 13,28%).",
                investment: "800.000 USD/suất.",
                totalSlots: "99 suất đầu tư (Tổng vốn huy động tối đa 79.200.000 USD).",
                jobsPerInvestor: "23+ việc làm / nhà đầu tư",
                status: "Đang mở suất",
                statusKey: "open",
                driveLink: "https://drive.google.com/drive/u/0/folders/1mlrvAqyZ03VHcRaHpPgveQDcer9cBx5V",
                imageType: "industrial",
                country: "US Hoa Kỳ"
            },
            {
                id: 2,
                title: "CMB Nhóm 102",
                subtitle: "Dự án Hillwood Park 275 bao gồm việc phát triển và xây dựng một cơ sở phân phối hiện đại hạng A xây theo yêu cầu từ tập đoàn phần cứng The Hillman Group.",
                description: "Dự án Hillwood Park 275 bao gồm việc phát triển và xây dựng một cơ sở phân phối hiện đại hạng A xây theo yêu cầu từ tập đoàn phần cứng The Hillman Group.",
                regionalCenter: "CMB Regional Centers",
                location: "550 Forest Fair Drive, Fairfield, Ohio, Hoa Kỳ.",
                teaType: "TEA (Vùng có tỉ lệ thất nghiệp cao đạt 8,406%, vượt mức tối thiểu 6,0% theo quy định).",
                investment: "800.000 USD / suất đầu tư.",
                totalSlots: "Tối đa 46 suất đầu tư (Tổng vốn vay EB-5 huy động lên tới 36.800.000 USD).",
                jobsPerInvestor: "12+ việc làm / nhà đầu tư",
                status: "Đang mở suất",
                statusKey: "open",
                driveLink: "#contact",
                imageType: "logistics",
                country: "US Hoa Kỳ"
            },
            {
                id: 3,
                title: "CMB Nhóm 97",
                subtitle: "Phát triển và xây dựng Giai đoạn 1 của dự án logistics công nghiệp tiêu chuẩn hạng A.",
                description: "Phát triển và xây dựng Giai đoạn 1 của dự án logistics công nghiệp tiêu chuẩn hạng A.",
                regionalCenter: "CMB Regional Centers",
                location: "Tọa lạc giữa Old San Antonio Road và Onion Creek, góc Tây Nam giao lộ cao tốc 45 Toll và I-35, phía Tây Nam thành phố Austin, Quận Travis, bang Texas, Hoa Kỳ.",
                teaType: "TEA (Vùng có tỉ lệ thất nghiệp cao đạt 5,4495%, vượt mức tối thiểu 5,4% theo quy định).",
                investment: "800.000 USD / suất đầu tư.",
                totalSlots: "19 suất đầu tư (Tổng vốn vay EB-5 huy động tối đa là 15.200.000 USD).",
                jobsPerInvestor: "15+ việc làm / nhà đầu tư",
                status: "Đang mở suất",
                statusKey: "open",
                driveLink: "#contact",
                imageType: "industrial",
                country: "US Hoa Kỳ"
            },
            {
                id: 4,
                title: "CMB Nhóm 96",
                subtitle: "Phát triển và xây dựng một tòa tháp nhà ở sinh viên cao cấp 14 tầng nằm ngoài khuôn viên trường.",
                description: "Phát triển và xây dựng một tòa tháp nhà ở sinh viên cao cấp 14 tầng nằm ngoài khuôn viên trường.",
                regionalCenter: "CMB Regional Centers",
                location: "Giao lộ Đại lộ 13 và Đường Alder, Khu Đại học, liền kề với trường Đại học Oregon, thành phố Eugene, bang Oregon, Hoa Kỳ.",
                teaType: "TEA (Vùng có tỉ lệ thất nghiệp cao lên đến 19,06%, vượt mức tối thiểu 6,0% theo quy định).",
                investment: "800.000 USD / suất đầu tư.",
                totalSlots: "50 suất đầu tư (Tổng vốn vay EB-5 huy động tối đa là 40.000.000 USD)",
                jobsPerInvestor: "17+ việc làm / nhà đầu tư",
                status: "Đang mở suất",
                statusKey: "open",
                driveLink: "#contact",
                imageType: "residential",
                country: "US Hoa Kỳ"
            },
            {
                id: 5,
                title: "Trung tâm Logistics Cảng Thái Bình Dương",
                subtitle: "Dự án đầu tư cơ sở hạ tầng mang tính đột phá nhằm xử lý ô nhiễm môi trường, xây dựng hệ thống xử lý chất thải, lắp đặt các tiện ích thiết yếu và công trình đường bộ công cộng để tạo ra quỹ đất sạch, sẵn sàng cho việc xây dựng trung tâm kho bãi/logistics quy mô lớn.",
                description: "Dự án đầu tư cơ sở hạ tầng mang tính đột phá nhằm xử lý ô nhiễm môi trường, xây dựng hệ thống xử lý chất thải, lắp đặt các tiện ích thiết yếu và công trình đường bộ công cộng để tạo ra quỹ đất sạch, sẵn sàng cho việc xây dựng trung tâm kho bãi/logistics quy mô lớn.",
                regionalCenter: "CanAm Enterprises",
                location: "20400 South Main Street, Thành phố Carson, bang California, Hoa Kỳ",
                teaType: "Cơ sở hạ tầng (Dự án Cơ sở hạ tầng EB-5 do cơ quan chính phủ là CRA trực tiếp sở hữu, quản lý và vận hành)",
                investment: "800.000 USD / suất đầu tư.",
                totalSlots: "225 suất đầu tư (Tổng vốn vay EB-5 huy động tối đa 180.000.000 USD).",
                jobsPerInvestor: "14+ việc làm / nhà đầu tư",
                status: "Đang mở suất",
                statusKey: "open",
                driveLink: "#contact",
                imageType: "logistics",
                country: "US Hoa Kỳ"
            },
            {
                id: 6,
                title: "Bellwether TerraPower Isotopes",
                subtitle: "Xây dựng cơ sở sản xuất tiên tiến phục vụ lĩnh vực khoa học đời sống.",
                description: "Xây dựng cơ sở sản xuất tiên tiến phục vụ lĩnh vực khoa học đời sống.",
                regionalCenter: "CanAm Enterprises",
                location: "Quận Bellwether, thành phố Philadelphia, bang Pennsylvania, Hoa Kỳ.",
                teaType: "TEA",
                investment: "800.000 USD / suất đầu tư.",
                totalSlots: "138 suất đầu tư (Tổng giá trị khoản vay EB-5 huy động là 110,4 triệu USD).",
                jobsPerInvestor: "13+ việc làm / nhà đầu tư",
                status: "Đang mở suất",
                statusKey: "open",
                driveLink: "#contact",
                imageType: "industrial",
                country: "US Hoa Kỳ"
            },
            {
                id: 7,
                title: "Ainsley at Tivoli",
                subtitle: "Dự án phát triển cộng đồng căn hộ cao cấp 5 tầng gồm 300 căn tại trung tâm Tivoli Village, Las Vegas, Nevada.",
                description: "Dự án phát triển cộng đồng căn hộ cao cấp 5 tầng gồm 300 căn tại trung tâm Tivoli Village, Las Vegas, Nevada.",
                regionalCenter: "CanAm Enterprises",
                location: "Trung tâm Tivoli Village, Las Vegas, Nevada, Hoa Kỳ.",
                teaType: "TEA",
                investment: "800.000 USD / suất đầu tư.",
                totalSlots: "50 suất đầu tư (Tổng vốn EB-5: 40.000.000 USD)",
                jobsPerInvestor: "17+ việc làm / nhà đầu tư",
                status: "Đang mở suất",
                statusKey: "open",
                driveLink: "#contact",
                imageType: "residential",
                country: "US Hoa Kỳ"
            },
            {
                id: 8,
                title: "Arte at the District",
                subtitle: "Dự án khu phức hợp cho thuê hạng A tại Northwood Village, West Palm Beach, Florida. Dự án tích hợp căn hộ, khu mua sắm/tiện ích.",
                description: "Dự án khu phức hợp cho thuê hạng A tại Northwood Village, West Palm Beach, Florida. Dự án tích hợp căn hộ, khu mua sắm/tiện ích.",
                regionalCenter: "Smith Central Atlantic Regional Center",
                location: "2400 Broadway, West Palm Beach, Florida, Hoa Kỳ.",
                teaType: "TEA",
                investment: "800.000 USD/suất",
                totalSlots: "40 suất đầu tư (Tổng vốn EB-5: 32.000.000 USD)",
                jobsPerInvestor: "38 việc làm/nhà đầu tư",
                status: "Đang mở suất",
                statusKey: "open",
                driveLink: "#contact",
                imageType: "commercial",
                country: "US Hoa Kỳ"
            },
            {
                id: 9,
                title: "Madison Bradenton Multifamily",
                subtitle: "Phát triển và xây dựng dự án Madison Bradenton, khu nhà ở đa gia đình, cùng các tiện ích dự kiến gồm clubhouse, trung tâm dịch vụ doanh nghiệp, quầy cà phê, hồ bơi, khu BBQ ngoài trời, khu nhận bưu kiện/thư và công viên thú cưng.",
                description: "Phát triển và xây dựng dự án Madison Bradenton, khu nhà ở đa gia đình, cùng các tiện ích dự kiến gồm clubhouse, trung tâm dịch vụ doanh nghiệp, quầy cà phê, hồ bơi, khu BBQ ngoài trời, khu nhận bưu kiện/thư và công viên thú cưng.",
                regionalCenter: "Peachtree South Regional Center",
                location: "303 301 Boulevard West, Bradenton, Florida, Hoa Kỳ.",
                teaType: "TEA",
                investment: "800.000 USD/suất",
                totalSlots: "58 suất đầu tư (Tổng vốn huy động tối đa 46.400.000 USD).",
                jobsPerInvestor: "17+ việc làm / nhà đầu tư",
                status: "Đang mở suất",
                statusKey: "open",
                driveLink: "#contact",
                imageType: "residential",
                country: "US Hoa Kỳ"
            },
            {
                id: 10,
                title: "Utopia Living",
                subtitle: "Dự án căn hộ cao cấp tích hợp các tiện ích hiện đại như bể bơi, phòng tập thể dục, khu vui chơi trẻ em, v.v.",
                description: "Dự án căn hộ cao cấp tích hợp các tiện ích hiện đại như bể bơi, phòng tập thể dục, khu vui chơi trẻ em, v.v.",
                regionalCenter: "Manhattan Regional Center",
                location: "Fresh Meadows, Queens, Thành phố New York, Hoa Kỳ.",
                teaType: "TEA",
                investment: "800.000 USD/suất",
                totalSlots: "328 suất đầu tư (Tổng vốn vay EB-5 khoảng 254.9 triệu USD).",
                jobsPerInvestor: "16+ việc làm / nhà đầu tư",
                status: "Đang mở suất",
                statusKey: "open",
                driveLink: "#contact",
                imageType: "residential",
                country: "US Hoa Kỳ"
            }
        ];
let eb5CurrentSelectedIndex = 0;

function eb5EscapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[ch]));
}

function eb5GenerateBlueprintSVG(imageType) {
  let svgContent = '';
  if (imageType === 'industrial') {
    svgContent = `
      <rect x="20" y="100" width="50" height="150" stroke="url(#eb5GoldGradient)" stroke-width="1" fill="none" opacity="0.6"/>
      <rect x="80" y="60" width="50" height="190" stroke="url(#eb5GoldGradient)" stroke-width="1" fill="none" opacity="0.8"/>
      <rect x="140" y="30" width="60" height="220" stroke="url(#eb5GoldGradient)" stroke-width="2" fill="none"><animate attributeName="stroke-width" values="1.5;2;1.5" dur="3s" repeatCount="indefinite" /></rect>
      <rect x="155" y="45" width="10" height="15" stroke="url(#eb5GoldGradient)" stroke-width="1" fill="none" opacity="0.7"/>
      <rect x="175" y="45" width="10" height="15" stroke="url(#eb5GoldGradient)" stroke-width="1" fill="none" opacity="0.7"/>
      <rect x="210" y="80" width="50" height="170" stroke="url(#eb5GoldGradient)" stroke-width="1.5" fill="none" opacity="0.7"/>
      <rect x="270" y="120" width="40" height="130" stroke="url(#eb5GoldGradient)" stroke-width="1" fill="none" opacity="0.5"/>`;
  } else if (imageType === 'logistics') {
    svgContent = `
      <line x1="30" y1="180" x2="290" y2="180" stroke="url(#eb5GoldGradient)" stroke-width="1" stroke-dasharray="4" opacity="0.5" />
      <rect x="40" y="120" width="240" height="110" stroke="url(#eb5GoldGradient)" stroke-width="2" fill="none" rx="3" />
      <rect x="60" y="80" width="90" height="40" stroke="url(#eb5GoldGradient)" stroke-width="1.2" fill="none" opacity="0.8" />
      <rect x="170" y="80" width="90" height="40" stroke="url(#eb5GoldGradient)" stroke-width="1.2" fill="none" opacity="0.8" />
      <line x1="120" y1="120" x2="120" y2="230" stroke="url(#eb5GoldGradient)" stroke-width="1" opacity="0.4" />
      <line x1="200" y1="120" x2="200" y2="230" stroke="url(#eb5GoldGradient)" stroke-width="1" opacity="0.4" />`;
  } else if (imageType === 'residential') {
    svgContent = `
      <rect x="40" y="40" width="240" height="210" stroke="url(#eb5GoldGradient)" stroke-width="1" fill="none" opacity="0.4" rx="4"/>
      <rect x="65" y="60" width="80" height="190" stroke="url(#eb5GoldGradient)" stroke-width="2" fill="none" rx="2" />
      <rect x="175" y="60" width="80" height="190" stroke="url(#eb5GoldGradient)" stroke-width="1.5" fill="none" rx="2" opacity="0.8"/>
      <line x1="50" y1="100" x2="270" y2="100" stroke="url(#eb5GoldGradient)" stroke-width="1" opacity="0.5"/>
      <line x1="50" y1="140" x2="270" y2="140" stroke="url(#eb5GoldGradient)" stroke-width="1" opacity="0.5"/>
      <line x1="50" y1="180" x2="270" y2="180" stroke="url(#eb5GoldGradient)" stroke-width="1" opacity="0.5"/>`;
  } else {
    svgContent = `
      <polygon points="160,20 40,90 280,90" stroke="url(#eb5GoldGradient)" stroke-width="1.5" fill="none"/>
      <rect x="60" y="90" width="200" height="160" stroke="url(#eb5GoldGradient)" stroke-width="2" fill="none" rx="3"/>
      <circle cx="160" cy="150" r="30" stroke="url(#eb5GoldGradient)" stroke-width="1" fill="none" opacity="0.6"/>
      <line x1="160" y1="90" x2="160" y2="250" stroke="url(#eb5GoldGradient)" stroke-width="1" opacity="0.5" />
      <line x1="60" y1="170" x2="260" y2="170" stroke="url(#eb5GoldGradient)" stroke-width="1" opacity="0.5" />`;
  }
  return `
    <div class="case-blueprint">
      <svg viewBox="0 0 320 260" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Sơ đồ thiết kế kiến trúc dự án">
        <defs><linearGradient id="eb5GoldGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#E2C799"/><stop offset="100%" stop-color="#B68D40"/></linearGradient></defs>
        ${svgContent}
      </svg>
      <div class="case-blueprint-caption"><strong>Sơ đồ thiết kế kiến trúc</strong><i>Hình ảnh render & thực địa lưu trong thư mục dự án</i></div>
    </div>`;
}

function eb5StatusClass(statusKey) {
  if (statusKey === 'pending') return 'pending';
  if (statusKey === 'closed') return 'closed';
  return 'open';
}

function eb5RenderProjectList() {
  const list = document.getElementById('caseProjectList');
  if (!list) return;
  list.innerHTML = EB5_CASE_PROJECTS.map((proj, index) => `
    <button type="button" class="case-list-item ${index === eb5CurrentSelectedIndex ? 'active' : ''}" onclick="eb5SelectProject(${index})" aria-pressed="${index === eb5CurrentSelectedIndex ? 'true' : 'false'}">
      <span class="case-list-main">
        <span class="case-list-title-row"><span class="case-list-num">#${index + 1}</span><span class="case-list-title">${eb5EscapeHtml(proj.title)}</span></span>
        <span class="case-list-sub">${eb5EscapeHtml(proj.subtitle)}</span>
      </span>
      <span class="case-list-meta"><span class="case-status ${eb5StatusClass(proj.statusKey)}">${eb5EscapeHtml(proj.status)}</span><span class="case-list-invest">${eb5EscapeHtml(String(proj.investment).split('/')[0])}</span></span>
    </button>`).join('');
}

function eb5SelectProject(index) {
  eb5CurrentSelectedIndex = index;
  eb5RenderProjectList();
  const detail = document.getElementById('caseDetailView');
  const pane = document.getElementById('caseDetailPane');
  if (!detail) return;
  const proj = EB5_CASE_PROJECTS[index];
  detail.classList.remove('fade-in-active');
  void detail.offsetWidth;
  detail.classList.add('fade-in-active');
  detail.innerHTML = `
    <div class="case-detail-grid">
      <div>${eb5GenerateBlueprintSVG(proj.imageType)}</div>
      <div class="case-detail-content">
        <div>
          <div class="case-badge-row"><span class="case-country">${eb5EscapeHtml(proj.country)}</span><span class="case-status ${eb5StatusClass(proj.statusKey)}">${eb5EscapeHtml(proj.status)}</span></div>
          <h3 class="case-detail-title">${eb5EscapeHtml(proj.title)}</h3>
          <p class="case-detail-desc">${eb5EscapeHtml(proj.description)}</p>
        </div>
        <div class="case-spec-grid">
          <div class="case-spec"><small>Vị Trí</small><strong title="${eb5EscapeHtml(proj.location)}">${eb5EscapeHtml(proj.location)}</strong></div>
          <div class="case-spec"><small>Loại Vùng</small><strong class="gold">${eb5EscapeHtml(proj.teaType)}</strong></div>
          <div class="case-spec"><small>Mức Đầu Tư</small><strong class="gold">${eb5EscapeHtml(proj.investment)}</strong></div>
          <div class="case-spec"><small>Trung Tâm Vùng</small><strong>${eb5EscapeHtml(proj.regionalCenter)}</strong></div>
          <div class="case-spec"><small>Việc Làm Tạo Ra</small><strong class="green">${eb5EscapeHtml(proj.jobsPerInvestor)}</strong></div>
          <div class="case-spec"><small>Quy Mô EB-5</small><strong title="${eb5EscapeHtml(proj.totalSlots)}">${eb5EscapeHtml(proj.totalSlots)}</strong></div>
        </div>
        <div class="case-actions">
          <a class="case-consult-link" href="#contact" data-project-consult="${eb5EscapeHtml(proj.title)}">Nhận tư vấn dự án phù hợp →</a>
        </div>
      </div>
    </div>`;
  if (window.innerWidth < 1080 && pane) pane.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function eb5InitCaseExplorer() {
  if (!document.getElementById('caseProjectList') || !document.getElementById('caseDetailView')) return;
  eb5RenderProjectList();
  eb5SelectProject(0);
}

document.addEventListener('DOMContentLoaded', eb5InitCaseExplorer);
if (document.readyState !== 'loading') eb5InitCaseExplorer();

