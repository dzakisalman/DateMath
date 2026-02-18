/* ===========================
   DateMath – app.js
=========================== */

(function () {
  'use strict';

  // ── DOM References ──────────────────────────────────────────────
  const form          = document.getElementById('dateForm');
  const startDateEl   = document.getElementById('startDate');
  const daysInputEl   = document.getElementById('daysInput');
  const btnAfter      = document.getElementById('btnAfter');
  const btnBefore     = document.getElementById('btnBefore');
  const decrementBtn  = document.getElementById('decrementBtn');
  const incrementBtn  = document.getElementById('incrementBtn');
  const resultSection = document.getElementById('resultSection');
  const resultBadge   = document.getElementById('resultBadge');
  const resultDate    = document.getElementById('resultDate');
  const resultDay     = document.getElementById('resultDay');
  const resultDetail  = document.getElementById('resultDetail');
  const presetBtns    = document.querySelectorAll('.preset-btn');

  // ── State ───────────────────────────────────────────────────────
  let direction = 'after'; // 'after' | 'before'

  // ── Indonesian locale data ──────────────────────────────────────
  const HARI = [
    'Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'
  ];

  const BULAN = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  // ── Initialise default date to today ───────────────────────────
  function initDefaultDate() {
    const today = new Date();
    const yyyy  = today.getFullYear();
    const mm    = String(today.getMonth() + 1).padStart(2, '0');
    const dd    = String(today.getDate()).padStart(2, '0');
    startDateEl.value = `${yyyy}-${mm}-${dd}`;
  }

  // ── Direction toggle ────────────────────────────────────────────
  function setDirection(dir) {
    direction = dir;
    if (dir === 'after') {
      btnAfter.classList.add('active');
      btnAfter.setAttribute('aria-checked', 'true');
      btnBefore.classList.remove('active');
      btnBefore.setAttribute('aria-checked', 'false');
    } else {
      btnBefore.classList.add('active');
      btnBefore.setAttribute('aria-checked', 'true');
      btnAfter.classList.remove('active');
      btnAfter.setAttribute('aria-checked', 'false');
    }
  }

  btnAfter.addEventListener('click', () => setDirection('after'));
  btnBefore.addEventListener('click', () => setDirection('before'));

  // ── Stepper buttons ─────────────────────────────────────────────
  decrementBtn.addEventListener('click', () => {
    const current = parseInt(daysInputEl.value, 10) || 0;
    if (current > 0) daysInputEl.value = current - 1;
  });

  incrementBtn.addEventListener('click', () => {
    const current = parseInt(daysInputEl.value, 10) || 0;
    daysInputEl.value = current + 1;
  });

  // ── Preset buttons ──────────────────────────────────────────────
  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const days = btn.dataset.days;
      daysInputEl.value = days;

      // Highlight selected preset
      presetBtns.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');

      // Auto-calculate if date is already set
      if (startDateEl.value) {
        calculate();
      }
    });
  });

  // Remove preset highlight when days input changes manually
  daysInputEl.addEventListener('input', () => {
    presetBtns.forEach(b => b.classList.remove('selected'));
  });

  // ── Format date to Indonesian string ───────────────────────────
  function formatDateID(date) {
    const d = date.getDate();
    const m = BULAN[date.getMonth()];
    const y = date.getFullYear();
    return `${d} ${m} ${y}`;
  }

  // ── Calculate ───────────────────────────────────────────────────
  function calculate() {
    // Clear previous errors
    clearErrors();

    const dateValue = startDateEl.value;
    const daysValue = parseInt(daysInputEl.value, 10);

    // Validation
    let hasError = false;

    if (!dateValue) {
      showError(startDateEl, 'Pilih tanggal awal terlebih dahulu.');
      hasError = true;
    }

    if (isNaN(daysValue) || daysValue < 0) {
      showError(daysInputEl, 'Masukkan jumlah hari yang valid (≥ 0).');
      hasError = true;
    }

    if (hasError) return;

    // Parse start date (avoid timezone offset issues)
    const [year, month, day] = dateValue.split('-').map(Number);
    const startDate = new Date(year, month - 1, day);

    // Compute result date
    const resultDateObj = new Date(startDate);
    if (direction === 'after') {
      resultDateObj.setDate(resultDateObj.getDate() + daysValue);
    } else {
      resultDateObj.setDate(resultDateObj.getDate() - daysValue);
    }

    // Display result
    showResult(startDate, resultDateObj, daysValue);
  }

  // ── Show Result ─────────────────────────────────────────────────
  function showResult(startDate, resultDateObj, days) {
    const dayName    = HARI[resultDateObj.getDay()];
    const dateStr    = formatDateID(resultDateObj);
    const startStr   = formatDateID(startDate);
    const dirLabel   = direction === 'after' ? 'setelah' : 'sebelum';
    const dirEmoji   = direction === 'after' ? '➕' : '➖';
    const badgeColor = direction === 'after'
      ? 'background: rgba(96,165,250,0.15); border-color: rgba(96,165,250,0.35); color: #60a5fa;'
      : 'background: rgba(244,114,182,0.15); border-color: rgba(244,114,182,0.35); color: #f472b6;';

    // Badge
    resultBadge.style.cssText = badgeColor;
    resultBadge.innerHTML = `${dirEmoji} ${days} hari ${dirLabel}`;

    // Date
    resultDate.textContent = dateStr;

    // Day name
    resultDay.textContent = dayName;

    // Detail
    if (days === 0) {
      resultDetail.textContent = `Tanggal yang sama dengan tanggal awal (${startStr}).`;
    } else {
      resultDetail.textContent = `${days} hari ${dirLabel} ${startStr} adalah ${dayName}, ${dateStr}.`;
    }

    // Show section with animation
    resultSection.classList.remove('visible');
    void resultSection.offsetWidth; // force reflow
    resultSection.classList.add('visible');

    // Scroll into view smoothly
    setTimeout(() => {
      resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
  }

  // ── Validation helpers ──────────────────────────────────────────
  function showError(inputEl, message) {
    inputEl.classList.add('error');

    // Remove existing error msg if any
    const existing = inputEl.parentElement.querySelector('.error-msg');
    if (existing) existing.remove();

    const msg = document.createElement('p');
    msg.className = 'error-msg';
    msg.setAttribute('role', 'alert');
    msg.innerHTML = `⚠️ ${message}`;
    inputEl.parentElement.after(msg);
  }

  function clearErrors() {
    document.querySelectorAll('.form-input.error').forEach(el => el.classList.remove('error'));
    document.querySelectorAll('.error-msg').forEach(el => el.remove());
  }

  // ── Form submit ─────────────────────────────────────────────────
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculate();
  });

  // ── Keyboard: Enter on inputs triggers calculate ────────────────
  [startDateEl, daysInputEl].forEach(el => {
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        calculate();
      }
    });
  });

  // ── Init ────────────────────────────────────────────────────────
  initDefaultDate();

})();
