/* ===== ANATRA Landing Page - JavaScript ===== */

document.addEventListener('DOMContentLoaded', () => {

  /* --- Header Scroll Effect --- */
  const header = document.querySelector('.header');
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    if (currentScroll > 60) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    lastScroll = currentScroll;
  });

  /* --- Scroll Reveal Animation --- */
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        // Thêm độ trễ tuần tự cho các phần tử cùng nhóm
        const delay = entry.target.dataset.delay || 0;
        setTimeout(() => {
          entry.target.classList.add('active');
        }, delay * 150);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });
  revealElements.forEach(el => revealObserver.observe(el));

  /* --- Counter Animation --- */
  const counters = document.querySelectorAll('.counter');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.target);
        const suffix = el.dataset.suffix || '';
        const prefix = el.dataset.prefix || '';
        const duration = 2000;
        const startTime = performance.now();

        function updateCounter(currentTime) {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          // Easing: easeOutExpo
          const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
          const current = Math.floor(eased * target);
          el.textContent = prefix + current.toLocaleString('vi-VN') + suffix;
          if (progress < 1) {
            requestAnimationFrame(updateCounter);
          }
        }
        requestAnimationFrame(updateCounter);
        counterObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(el => counterObserver.observe(el));

  /* --- Countdown Timer (2 ngày) --- */
  const countdownEl = document.querySelector('.countdown');
  if (countdownEl) {
    // Đặt thời gian hết hạn = ngày mai + 1 ngày
    const endTime = new Date();
    endTime.setDate(endTime.getDate() + 2);
    endTime.setHours(23, 59, 59, 0);

    function updateCountdown() {
      const now = new Date();
      const diff = endTime - now;
      if (diff <= 0) return;

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      const hoursEl = document.getElementById('cd-hours');
      const minutesEl = document.getElementById('cd-minutes');
      const secondsEl = document.getElementById('cd-seconds');

      if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
      if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, '0');
      if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, '0');
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);
  }

  /* --- Tạo particle vàng bay cho hero --- */
  const particlesContainer = document.querySelector('.particles');
  if (particlesContainer) {
    for (let i = 0; i < 25; i++) {
      const particle = document.createElement('div');
      particle.classList.add('particle');
      particle.style.left = Math.random() * 100 + '%';
      particle.style.animationDelay = Math.random() * 6 + 's';
      particle.style.animationDuration = (4 + Math.random() * 4) + 's';
      particle.style.width = (2 + Math.random() * 4) + 'px';
      particle.style.height = particle.style.width;
      particlesContainer.appendChild(particle);
    }
  }

  /* --- Smooth scroll cho anchor links --- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* --- Parallax nhẹ cho hero image --- */
  const heroImg = document.querySelector('.hero-image');
  if (heroImg) {
    window.addEventListener('scroll', () => {
      const scrolled = window.pageYOffset;
      if (scrolled < window.innerHeight) {
        heroImg.style.transform = `translateY(${scrolled * 0.08}px)`;
      }
    });
  }

});

/* ===== HỆ THỐNG ĐẶT HÀNG MODAL ===== */

// Hàm format tiền VNĐ
function formatMoney(amount) {
  return amount.toLocaleString('vi-VN') + 'đ';
}

// Mở modal đặt hàng, tự động tick sản phẩm nếu có
function openOrderModal(productId) {
  const modal = document.getElementById('orderModal');
  const stepForm = document.getElementById('step-form');
  const stepQr = document.getElementById('step-qr');

  // Reset về bước form
  stepForm.style.display = 'block';
  stepQr.style.display = 'none';

  // Nếu có productId, tự động tick checkbox tương ứng
  if (productId) {
    const cb = document.getElementById('cb-' + productId);
    if (cb) cb.checked = true;
  }

  // Cập nhật tổng tiền
  updateTotal();

  // Hiển thị modal với animation
  modal.style.display = 'flex';
  // Trigger reflow để animation chạy
  void modal.offsetWidth;
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

// Đóng modal
function closeOrderModal() {
  const modal = document.getElementById('orderModal');
  modal.classList.remove('active');
  
  setTimeout(() => {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }, 350);
}

// Cập nhật tổng tiền khi tick/untick sản phẩm
function updateTotal() {
  const checkboxes = document.querySelectorAll('input[name="products"]');
  let total = 0;
  let count = 0;

  checkboxes.forEach(cb=> {
    if (cb.checked) {
      total += parseInt(cb.dataset.price);
      count++;
    }
  });

  const totalEl = document.getElementById('formTotal');
  const totalAmountEl = document.getElementById('totalAmount');
  const btnSubmit = document.getElementById('btnSubmit');

  if (count > 0) {
    totalEl.style.display = 'flex';
    totalAmountEl.textContent = formatMoney(total);
    btnSubmit.disabled = false;
  } else {
    totalEl.style.display = 'none';
    btnSubmit.disabled = true;
  }
}

// ====================================================
// CẤU HÌNH: Dán URL Apps Script Web App vào đây
// ====================================================
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwGKiCDgfSlws7VhCYvXA_blc890N_PMdbOHv0AGpUy021lBLvO44NUfo2vcFIXQqe2aA/exec';

// Map tên viết tắt sản phẩm cho nội dung CK
const PRODUCT_SHORT = {
  'tra-hanh-phuc': 'THP',
  'tra-biet-on': 'TBO',
  'an-tra': 'AT'
};

// Submit form → tạo nội dung CK, gửi Google Sheet, chuyển sang bước QR
function submitOrder(e) {
  e.preventDefault();

  // Lấy thông tin form
  const fullname = document.getElementById('fullname').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const email = document.getElementById('email').value.trim();
  const address = document.getElementById('address').value.trim();
  const note = document.getElementById('note').value.trim();

  // Validate cơ bản
  if (!fullname || !phone) {
    alert('Vui lòng điền đầy đủ họ tên và số điện thoại!');
    return;
  }

  if (!address) {
    alert('Vui lòng nhập địa chỉ nhận hàng!');
    return;
  }

  // Thu thập sản phẩm đã chọn
  const checkboxes = document.querySelectorAll('input[name="products"]:checked');
  if (checkboxes.length === 0) {
    alert('Vui lòng chọn ít nhất 1 sản phẩm!');
    return;
  }

  let total = 0;
  const items = [];
  const productNames = [];
  const shortNames = [];

  checkboxes.forEach(cb => {
    const price = parseInt(cb.dataset.price);
    total += price;
    items.push({ name: cb.dataset.name, price });
    productNames.push(cb.dataset.name);
    shortNames.push(PRODUCT_SHORT[cb.value] || cb.value);
  });

  // Tạo nội dung chuyển khoản: Tên SP viết tắt + SĐT
  const transferNote = shortNames.join(' ') + ' ' + phone;

  // === HIỂN THỊ BƯỚC QR ===

  // Tạo nội dung order summary
  const summaryEl = document.getElementById('qrOrderSummary');
  let summaryHTML = '';
  items.forEach(item => {
    summaryHTML += `<div class="qr-item"><span>🍵 ${item.name}</span><span>${formatMoney(item.price)}</span></div>`;
  });
  summaryEl.innerHTML = summaryHTML;

  // Hiển thị tổng tiền
  document.getElementById('qrTotal').textContent = formatMoney(total);

  // Hiển thị nội dung chuyển khoản
  document.getElementById('transferNoteValue').textContent = transferNote;

  // Tạo QR SePay: MBBank, STK 0987886711
  const qrUrl = `https://qr.sepay.vn/img?acc=0987886711&bank=MBBank&amount=${total}&des=${encodeURIComponent(transferNote)}&template=compact`;
  document.getElementById('qrImage').src = qrUrl;

  // Chuyển sang bước QR
  document.getElementById('step-form').style.display = 'none';
  document.getElementById('step-qr').style.display = 'block';
  document.querySelector('.modal').scrollTop = 0;

  // === GỬI DỮ LIỆU LÊN GOOGLE SHEET (chạy nền, không block UI) ===
  if (GOOGLE_SCRIPT_URL && GOOGLE_SCRIPT_URL !== 'PASTE_YOUR_APPS_SCRIPT_URL_HERE') {
    const payload = {
      fullname: fullname,
      phone: phone,
      email: email,
      address: address,
      products: productNames.join(', '),
      total: total,
      transferNote: transferNote,
      note: note
    };

    fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(() => {
      console.log('✅ Đã gửi đơn hàng lên Google Sheet');
    })
    .catch(err => {
      console.error('❌ Lỗi gửi Google Sheet:', err);
    });
  } else {
    console.warn('⚠️ Chưa cấu hình GOOGLE_SCRIPT_URL. Dữ liệu chưa được gửi.');
  }
}

// Quay lại bước form từ bước QR
function backToForm() {
  document.getElementById('step-form').style.display = 'block';
  document.getElementById('step-qr').style.display = 'none';
  document.querySelector('.modal').scrollTop = 0;
}

// Đóng modal khi click vào overlay (ngoài modal)
document.addEventListener('click', function(e) {
  if (e.target.classList.contains('modal-overlay')) {
    closeOrderModal();
  }
});

// Đóng modal khi nhấn Escape
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    closeOrderModal();
  }
});
