/* ===========================
   DateMath – app.js
=========================== */

(function () {
  'use strict';

  // ── Indonesian locale data ──────────────────────────────────────
  const HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const BULAN = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  // ── Helpers ─────────────────────────────────────────────────────
  function formatDateID(date) {
    return `${date.getDate()} ${BULAN[date.getMonth()]} ${date.getFullYear()}`;
  }

  function getTodayMidnight() {
    const t = new Date();
    return new Date(t.getFullYear(), t.getMonth(), t.getDate());
  }

  function parseLocalDate(value) {
    const [y, m, d] = value.split('-').map(Number);
    return new Date(y, m - 1, d);
  }

  // ── Validation helpers ──────────────────────────────────────────
  function showError(inputEl, message) {
    inputEl.classList.add('error');
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

  function revealSection(sectionEl) {
    sectionEl.classList.remove('visible');
    void sectionEl.offsetWidth;
    sectionEl.classList.add('visible');
    setTimeout(() => sectionEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
  }

  /* ================================================================
     TAB SWITCHER
  ================================================================ */
  const tab1 = document.getElementById('tab1');
  const tab2 = document.getElementById('tab2');
  const panel1 = document.getElementById('panel1');
  const panel2 = document.getElementById('panel2');

  function switchTab(active) {
    if (active === 1) {
      tab1.classList.add('active'); tab1.setAttribute('aria-selected', 'true');
      tab2.classList.remove('active'); tab2.setAttribute('aria-selected', 'false');
      panel1.hidden = false;
      panel2.hidden = true;
    } else {
      tab2.classList.add('active'); tab2.setAttribute('aria-selected', 'true');
      tab1.classList.remove('active'); tab1.setAttribute('aria-selected', 'false');
      panel2.hidden = false;
      panel1.hidden = true;
      updateTodayChip();
    }
  }

  tab1.addEventListener('click', () => switchTab(1));
  tab2.addEventListener('click', () => switchTab(2));

  /* ================================================================
     PANEL 1 – Date Calculator
  ================================================================ */
  const form = document.getElementById('dateForm');
  const startDateEl = document.getElementById('startDate');
  const daysInputEl = document.getElementById('daysInput');
  const btnAfter = document.getElementById('btnAfter');
  const btnBefore = document.getElementById('btnBefore');
  const decrementBtn = document.getElementById('decrementBtn');
  const incrementBtn = document.getElementById('incrementBtn');
  const resultSection = document.getElementById('resultSection');
  const resultBadge = document.getElementById('resultBadge');
  const resultDate = document.getElementById('resultDate');
  const resultDay = document.getElementById('resultDay');
  const resultDetail = document.getElementById('resultDetail');
  const presetBtns = document.querySelectorAll('.preset-btn');

  let direction = 'after';

  // Default date = today
  (function initDefaultDate() {
    const t = getTodayMidnight();
    const yyyy = t.getFullYear();
    const mm = String(t.getMonth() + 1).padStart(2, '0');
    const dd = String(t.getDate()).padStart(2, '0');
    startDateEl.value = `${yyyy}-${mm}-${dd}`;
  })();

  // Direction toggle
  function setDirection(dir) {
    direction = dir;
    btnAfter.classList.toggle('active', dir === 'after');
    btnAfter.setAttribute('aria-checked', String(dir === 'after'));
    btnBefore.classList.toggle('active', dir === 'before');
    btnBefore.setAttribute('aria-checked', String(dir === 'before'));
  }
  btnAfter.addEventListener('click', () => setDirection('after'));
  btnBefore.addEventListener('click', () => setDirection('before'));

  // Stepper buttons
  decrementBtn.addEventListener('click', () => {
    const v = parseInt(daysInputEl.value, 10) || 0;
    if (v > 0) daysInputEl.value = v - 1;
  });
  incrementBtn.addEventListener('click', () => {
    const v = parseInt(daysInputEl.value, 10) || 0;
    daysInputEl.value = v + 1;
  });

  // Preset buttons
  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      daysInputEl.value = btn.dataset.days;
      presetBtns.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      if (startDateEl.value) calculate();
    });
  });
  daysInputEl.addEventListener('input', () => presetBtns.forEach(b => b.classList.remove('selected')));

  // Calculate
  function calculate() {
    clearErrors();
    const dateValue = startDateEl.value;
    const daysValue = parseInt(daysInputEl.value, 10);
    let hasError = false;

    if (!dateValue) { showError(startDateEl, 'Pilih tanggal awal terlebih dahulu.'); hasError = true; }
    if (isNaN(daysValue) || daysValue < 0) { showError(daysInputEl, 'Masukkan jumlah hari yang valid (≥ 0).'); hasError = true; }
    if (hasError) return;

    const startDate = parseLocalDate(dateValue);
    const resultDateObj = new Date(startDate);
    resultDateObj.setDate(resultDateObj.getDate() + (direction === 'after' ? daysValue : -daysValue));

    const dayName = HARI[resultDateObj.getDay()];
    const dateStr = formatDateID(resultDateObj);
    const startStr = formatDateID(startDate);
    const dirLabel = direction === 'after' ? 'setelah' : 'sebelum';
    const dirEmoji = direction === 'after' ? '➕' : '➖';

    const badgeColor = direction === 'after'
      ? 'background:rgba(96,165,250,.15);border-color:rgba(96,165,250,.35);color:#60a5fa;'
      : 'background:rgba(244,114,182,.15);border-color:rgba(244,114,182,.35);color:#f472b6;';

    resultBadge.style.cssText = badgeColor;
    resultBadge.innerHTML = `${dirEmoji} ${daysValue} hari ${dirLabel}`;
    resultDate.textContent = dateStr;
    resultDay.textContent = dayName;
    resultDetail.textContent = daysValue === 0
      ? `Tanggal yang sama dengan tanggal awal (${startStr}).`
      : `${daysValue} hari ${dirLabel} ${startStr} adalah ${dayName}, ${dateStr}.`;

    revealSection(resultSection);
  }

  form.addEventListener('submit', e => { e.preventDefault(); calculate(); });
  [startDateEl, daysInputEl].forEach(el =>
    el.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); calculate(); } })
  );

  /* ================================================================
     PANEL 2 – Days From Today (DFT)
  ================================================================ */
  const dftForm = document.getElementById('dftForm');
  const targetDateEl = document.getElementById('targetDate');
  const todayChipEl = document.getElementById('todayChip');
  const dftResultSection = document.getElementById('dftResultSection');
  const dftBigNumber = document.getElementById('dftBigNumber');
  const dftLabel = document.getElementById('dftLabel');
  const dftSub = document.getElementById('dftSub');
  const dftBreakdown = document.getElementById('dftBreakdown');

  function updateTodayChip() {
    const today = getTodayMidnight();
    todayChipEl.textContent = `📅 Hari ini: ${HARI[today.getDay()]}, ${formatDateID(today)}`;
  }

  updateTodayChip();

  // Auto-calculate when user picks a date
  targetDateEl.addEventListener('change', () => {
    if (targetDateEl.value) calculateDFT();
  });

  function calculateDFT() {
    clearErrors();
    const value = targetDateEl.value;
    if (!value) { showError(targetDateEl, 'Pilih tanggal target terlebih dahulu.'); return; }

    const today = getTodayMidnight();
    const targetDate = parseLocalDate(value);
    const diffMs = targetDate - today;
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    dftBigNumber.className = 'dft-big-number';

    if (diffDays === 0) {
      dftBigNumber.classList.add('today');
      dftBigNumber.textContent = '🎉';
      dftLabel.textContent = 'Hari ini!';
      dftSub.textContent = `Tanggal yang kamu masukkan adalah hari ini, ${formatDateID(today)}.`;
      dftBreakdown.innerHTML = '';

    } else if (diffDays > 0) {
      dftBigNumber.textContent = `+${diffDays}`;
      dftLabel.textContent = `${diffDays} hari lagi`;
      dftSub.textContent = `${formatDateID(targetDate)} (${HARI[targetDate.getDay()]}) masih ${diffDays} hari dari sekarang.`;
      dftBreakdown.innerHTML = buildBreakdown(diffDays);

    } else {
      const absDays = Math.abs(diffDays);
      dftBigNumber.classList.add('past');
      dftBigNumber.textContent = `−${absDays}`;
      dftLabel.textContent = `${absDays} hari yang lalu`;
      dftSub.textContent = `${formatDateID(targetDate)} (${HARI[targetDate.getDay()]}) sudah berlalu ${absDays} hari yang lalu.`;
      dftBreakdown.innerHTML = buildBreakdown(absDays);
    }

    revealSection(dftResultSection);
  }

  function buildBreakdown(days) {
    const years = Math.floor(days / 365);
    const months = Math.floor((days % 365) / 30);
    const weeks = Math.floor((days % 30) / 7);
    const rem = days % 7;

    const items = [];
    if (years > 0) items.push(`<span class="dft-breakdown-item"><strong>${years}</strong> tahun</span>`);
    if (months > 0) items.push(`<span class="dft-breakdown-item"><strong>${months}</strong> bulan</span>`);
    if (weeks > 0) items.push(`<span class="dft-breakdown-item"><strong>${weeks}</strong> minggu</span>`);
    if (rem > 0) items.push(`<span class="dft-breakdown-item"><strong>${rem}</strong> hari</span>`);
    if (items.length === 0) items.push(`<span class="dft-breakdown-item"><strong>${days}</strong> hari</span>`);

    return items.join('');
  }

  dftForm.addEventListener('submit', e => { e.preventDefault(); calculateDFT(); });
  targetDateEl.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); calculateDFT(); } });

})();
