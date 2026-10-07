/* ============================================================
   SAFEKID SURVEY — RENDERER + LOGIC
   Đọc SURVEY từ survey-schema.js
   ============================================================ */

/* ── CẤU HÌNH BACKEND ──────────────────────────────────────
   Điền URL Google Apps Script Web App vào đây sau khi deploy.
   Để trống = chạy chế độ demo (lưu localStorage, không gửi đi).
   ────────────────────────────────────────────────────────── */
const ENDPOINT = 'https://script.google.com/macros/s/AKfycbyd7Bae2_9K67ktiyayzbMVVU5ykwoa4nsR-ahJwbI8DGkzOHCGUnMymvWuTHDl9HO8/exec';   // ví dụ: 'https://script.google.com/macros/s/AKfy.../exec'

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

const S = window.SURVEY;
const FLAT = [];              // tất cả câu, theo thứ tự
const SEC_OF = {};            // questionId -> sectionId
S.sections.forEach(sec => sec.questions.forEach(q => { FLAT.push(q); SEC_OF[q.id] = sec.id; }));

/* Câu nào là "gate" của một nhánh (có câu khác showIf vào nó) —
   tự suy ra từ schema để không phải hardcode ID khi đổi câu hỏi */
const GATE_IDS = new Set(FLAT.filter(q => q.showIf).map(q => q.showIf.q));

const state = {
  idx: 0,                     // index section hiện tại
  answers: {},                // questionId -> value
  order: {},                  // questionId -> array (ranking)
  startedAt: Date.now(),
  stopped: false,
  submitted: false
};

/* ══════════════════════════════════════════════════════════
   HELPERS
   ══════════════════════════════════════════════════════════ */
function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('is-on');
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.remove('is-on'), 2400);
}
function isVisible(q) {
  if (!q.showIf) return true;
  const ans = state.answers[q.showIf.q];
  if (ans == null) return false;
  const vals = Array.isArray(ans) ? ans : [ans];
  return vals.some(v => q.showIf.in.includes(v));
}
function visibleQuestions(sec) {
  return sec.questions.filter(isVisible);
}

/* ══════════════════════════════════════════════════════════
   RENDER
   ══════════════════════════════════════════════════════════ */
function renderAll() {
  const host = $('#sections');
  host.innerHTML = S.sections.map((sec, si) => `
    <section class="section" data-sec="${sec.id}" data-idx="${si}">
      <div class="sec-head">
        <div class="sec-icon">${sec.icon}</div>
        <div>
          <div class="sec-num">Phần ${si + 1} / ${S.sections.length}</div>
          <h2 class="sec-name">${esc(sec.name)}</h2>
        </div>
      </div>
      ${sec.desc ? `<p class="sec-desc">${esc(sec.desc)}</p>` : ''}
      ${sec.intro ? `
        <div class="intro-block">
          <p class="intro-t"><span>📖</span>${esc(sec.intro.title)}</p>
          <p class="intro-b">${sec.intro.body}</p>
        </div>` : ''}
      <div class="qlist">
        ${sec.questions.map(q => renderQuestion(q)).join('')}
      </div>
    </section>
  `).join('');

  bindAll();
  refreshBranching();
  goSection(0, true);
}

function renderQuestion(q) {
  const label = `${q.text}${q.required ? '<span class="q-req">*</span>' : ''}`;
  const hint = q.hint ? `<p class="q-hint">${esc(q.hint)}</p>` : '';
  return `
    <div class="q" data-q="${q.id}" id="q_${q.id}">
      <div class="q-top">
        <span class="q-id">${q.id}</span>
        <div class="q-body">
          <p class="q-text">${label}</p>
          ${hint}
        </div>
      </div>
      <div class="q-input">${renderInput(q)}</div>
    </div>`;
}

function renderInput(q) {
  switch (q.type) {

    case 'single':
      return `<div class="opts">${q.options.map(o => `
        <div class="opt" data-q="${q.id}" data-val="${esc(o)}" role="radio" tabindex="0">
          <span class="mark radio"></span>
          <span class="opt-label">${esc(o)}</span>
        </div>`).join('')}</div>`;

    case 'checkbox': {
      const cap = q.max ? `<p class="q-hint" data-cap="${q.id}">Đã chọn 0/${q.max}</p>` : '';
      return `<div class="opts">${q.options.map(o => `
        <div class="opt" data-q="${q.id}" data-val="${esc(o)}" data-check="1" role="checkbox" tabindex="0">
          <span class="mark"><svg viewBox="0 0 24 24" fill="none" stroke="#04060c" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span>
          <span class="opt-label">${esc(o)}</span>
        </div>`).join('')}</div>${cap}`;
    }

    case 'likert':
      return `<div class="likert">${q.scale.map(v => `
        <div class="lk" data-q="${q.id}" data-val="${esc(v)}" tabindex="0">${esc(v)}</div>`).join('')}</div>
        ${q.scaleLabels ? `<div class="likert-legend"><span>${esc(q.scaleLabels[0])}</span><span>${esc(q.scaleLabels[1])}</span></div>` : ''}`;

    case 'nps':
      return `<div class="likert nps">${q.scale.map(v => `
        <div class="lk" data-q="${q.id}" data-val="${esc(v)}" tabindex="0">${esc(v)}</div>`).join('')}</div>
        ${q.scaleLabels ? `<div class="likert-legend"><span>${esc(q.scaleLabels[0])}</span><span>${esc(q.scaleLabels[1])}</span></div>` : ''}`;

    case 'matrix': {
      const head = `<div class="mx-head"><span></span>${q.scale.map(v => `<span>${esc(v)}</span>`).join('')}</div>`;
      const rows = q.rows.map(r => `
        <div class="mx-row" data-mxrow="${r.id}">
          <span class="mx-label">${esc(r.label)}</span>
          ${q.scale.map(v => `<div class="mx-cell" data-q="${q.id}" data-row="${r.id}" data-val="${esc(v)}" tabindex="0">${esc(v)}</div>`).join('')}
        </div>`).join('');
      const legend = q.scaleLabels
        ? `<div class="matrix-legend"><span>${esc(q.scaleLabels[0])}</span><span>${esc(q.scaleLabels[1])}</span></div>` : '';
      return `${head}<div class="matrix">${rows}</div>${legend}`;
    }

    case 'ranking':
      return `<div class="rank-list" data-rank="${q.id}">
        ${q.options.map((o, i) => `
          <div class="rank-item" data-q="${q.id}" data-val="${esc(o)}" draggable="true">
            <span class="rank-num">${i + 1}</span>
            <span class="rank-label">${esc(o)}</span>
            <span class="rank-btns">
              <button class="rank-btn" data-move="up" aria-label="Lên" ${i === 0 ? 'disabled' : ''}>▲</button>
              <button class="rank-btn" data-move="down" aria-label="Xuống" ${i === q.options.length - 1 ? 'disabled' : ''}>▼</button>
            </span>
          </div>`).join('')}
      </div>`;

    case 'paragraph':
      return `<textarea data-q="${q.id}" data-text="1" placeholder="Chia sẻ ý kiến của anh/chị..."></textarea>`;

    case 'short':
      return `<input type="text" data-q="${q.id}" data-text="1" placeholder="Email hoặc số điện thoại...">`;

    default:
      return `<p class="q-hint">Loại câu hỏi chưa hỗ trợ: ${q.type}</p>`;
  }
}

/* ══════════════════════════════════════════════════════════
   BIND EVENTS
   ══════════════════════════════════════════════════════════ */
function bindAll() {
  document.addEventListener('click', onClick);
  document.addEventListener('keydown', e => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.classList?.contains('opt')) {
      e.preventDefault(); e.target.click();
    }
    if ((e.key === 'Enter' || e.key === ' ') && e.target.classList?.contains('lk')) {
      e.preventDefault(); e.target.click();
    }
    if ((e.key === 'Enter' || e.key === ' ') && e.target.classList?.contains('mx-cell')) {
      e.preventDefault(); e.target.click();
    }
  });

  $('#btnNext').addEventListener('click', next);
  $('#btnPrev').addEventListener('click', prev);

  document.addEventListener('input', e => {
    const t = e.target.closest('[data-text]');
    if (t) state.answers[t.dataset.q] = t.value;
  });

  bindRanking();
}

function onClick(e) {
  /* ranking buttons */
  const moveBtn = e.target.closest('[data-move]');
  if (moveBtn) { e.stopPropagation(); moveRank(moveBtn); return; }

  /* matrix cell */
  const mx = e.target.closest('.mx-cell');
  if (mx) {
    const q = mx.dataset.q, row = mx.dataset.row, val = mx.dataset.val;
    if (!state.answers[q]) state.answers[q] = {};
    state.answers[q][row] = val;
    $$(`.mx-cell[data-q="${q}"][data-row="${row}"]`).forEach(c => c.classList.toggle('is-on', c === mx));
    clearError($(`#q_${q}`));
    return;
  }

  /* likert / nps */
  const lk = e.target.closest('.lk');
  if (lk) {
    const q = lk.dataset.q;
    state.answers[q] = lk.dataset.val;
    $$(`.lk[data-q="${q}"]`).forEach(c => c.classList.toggle('is-on', c === lk));
    clearError($(`#q_${q}`));
    return;
  }

  /* option (single / checkbox) */
  const opt = e.target.closest('.opt');
  if (opt) {
    const qid = opt.dataset.q;
    const qdef = FLAT.find(x => x.id === qid);
    const val = opt.dataset.val;

    if (opt.dataset.check) {
      /* checkbox */
      let cur = state.answers[qid] || [];
      const idx = cur.indexOf(val);
      const excl = qdef.exclusiveValues || [];
      const isExclusive = excl.includes(val);

      if (idx > -1) {
        cur.splice(idx, 1);
      } else {
        if (isExclusive) {
          cur = [val];
        } else {
          cur = cur.filter(v => !excl.includes(v));
          if (qdef.max && cur.length >= qdef.max) {
            toast(`Chỉ chọn tối đa ${qdef.max} lựa chọn`);
            return;
          }
          cur.push(val);
        }
      }
      state.answers[qid] = cur;

      const wrap = opt.parentElement;
      $$('.opt', wrap).forEach(o => {
        o.classList.toggle('is-on', cur.includes(o.dataset.val));
        if (qdef.max && !isExclusive) {
          o.classList.toggle('is-locked', !cur.includes(o.dataset.val) && cur.length >= qdef.max);
        } else {
          o.classList.remove('is-locked');
        }
      });

      const cap = $(`[data-cap="${qid}"]`);
      if (cap) cap.textContent = `Đã chọn ${cur.length}/${qdef.max}`;

    } else {
      /* single */
      state.answers[qid] = val;
      const wrap = opt.parentElement;
      $$('.opt', wrap).forEach(o => o.classList.toggle('is-on', o === opt));
    }

    clearError($(`#q_${qid}`));
    /* tự động phát hiện câu nào là gate của nhánh -> không hardcode ID */
    if (GATE_IDS.has(qid)) refreshBranching();
    if (qid === 'Q1') refreshScreener();
    return;
  }
}

/* ══════════════════════════════════════════════════════════
   BRANCHING — ẩn/hiện câu theo showIf
   ══════════════════════════════════════════════════════════ */
function refreshBranching() {
  FLAT.forEach(q => {
    if (!q.showIf) return;
    const el = $(`#q_${q.id}`);
    if (!el) return;
    const vis = isVisible(q);
    el.style.display = vis ? '' : 'none';
    if (!vis) {
      delete state.answers[q.id];
      resetQuestionUI(q);
    }
  });
}
function resetQuestionUI(q) {
  const el = $(`#q_${q.id}`);
  if (!el) return;
  $$('.opt, .lk, .mx-cell', el).forEach(c => c.classList.remove('is-on', 'is-locked'));
  $$('textarea, input', el).forEach(t => t.value = '');
  el.classList.remove('has-error');
}

/* ══════════════════════════════════════════════════════════
   SCREENER
   ══════════════════════════════════════════════════════════ */
function refreshScreener() {
  const ans = state.answers['Q1'] || [];
  const pass = ans.some(v => ['3–5 tuổi', '6–10 tuổi'].includes(v));
  state.stopped = !pass && ans.length > 0;
}

/* ══════════════════════════════════════════════════════════
   RANKING (drag + buttons)
   ══════════════════════════════════════════════════════════ */
let dragEl = null;
function bindRanking() {
  $$('[data-rank]').forEach(list => {
    const qid = list.dataset.rank;
    if (!state.order[qid]) {
      state.order[qid] = $$('.rank-item', list).map(i => i.dataset.val);
    }
    /* đặt giá trị mặc định để câu ranking luôn được coi là đã trả lời */
    if (state.answers[qid] == null) state.answers[qid] = [...state.order[qid]];
    $$('.rank-item', list).forEach(item => {
      item.addEventListener('dragstart', () => { dragEl = item; item.classList.add('is-drag'); });
      item.addEventListener('dragend', () => { item.classList.remove('is-drag'); dragEl = null; });
      item.addEventListener('dragover', e => {
        e.preventDefault();
        if (!dragEl || dragEl === item) return;
        const rect = item.getBoundingClientRect();
        const after = e.clientY > rect.top + rect.height / 2;
        item.parentElement.insertBefore(dragEl, after ? item.nextSibling : item);
        syncRankOrder(list);
      });
    });
  });
}
function syncRankOrder(list) {
  const qid = list.dataset.rank;
  state.order[qid] = $$('.rank-item', list).map(i => i.dataset.val);
  const n = $$('.rank-item', list).length;
  $$('.rank-item', list).forEach((it, i) => {
    $('.rank-num', it).textContent = i + 1;
    $('[data-move="up"]', it).disabled = i === 0;
    $('[data-move="down"]', it).disabled = i === n - 1;
  });
  state.answers[qid] = state.order[qid];
  clearError($(`#q_${qid}`));
}
function moveRank(btn) {
  const item = btn.closest('.rank-item');
  const list = item.closest('[data-rank]');
  const dir = btn.dataset.move;
  if (dir === 'up' && item.previousElementSibling) list.insertBefore(item, item.previousElementSibling);
  if (dir === 'down' && item.nextElementSibling) list.insertBefore(item.nextElementSibling, item);
  syncRankOrder(list);
}

/* ══════════════════════════════════════════════════════════
   VALIDATION
   ══════════════════════════════════════════════════════════ */
function validateSection(si) {
  const sec = S.sections[si];
  const missing = [];
  visibleQuestions(sec).forEach(q => {
    if (!q.required) return;
    const v = state.answers[q.id];
    const empty = v == null || v === '' || (Array.isArray(v) && v.length === 0)
      || (q.type === 'matrix' && (!v || Object.keys(v).length < q.rows.length));
    if (empty) missing.push(q.id);
  });
  return missing;
}
function clearError(el) { if (el) el.classList.remove('has-error'); }
function showError(missing) {
  $$('.q').forEach(q => q.classList.remove('has-error'));
  missing.forEach(id => $(`#q_${id}`)?.classList.add('has-error'));
  const e = $('#err');
  e.innerHTML = `⚠️ Vui lòng trả lời ${missing.length} câu còn thiếu: <b>${missing.join(', ')}</b>`;
  e.classList.add('is-on');
  $(`#q_${missing[0]}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/* ══════════════════════════════════════════════════════════
   NAVIGATION
   ══════════════════════════════════════════════════════════ */
function goSection(i, silent) {
  state.idx = i;
  $$('.section').forEach(s => s.classList.toggle('is-active', Number(s.dataset.idx) === i));
  $('#progressLabel').textContent = `Phần ${i + 1} / ${S.sections.length}`;
  const pct = S.sections.length > 1 ? Math.round((i / (S.sections.length - 1)) * 100) : 100;
  $('#progressFill').style.width = pct + '%';
  $('#progressPct').textContent = pct + '%';
  $('#btnPrev').style.visibility = i === 0 ? 'hidden' : 'visible';
  const last = i === S.sections.length - 1;
  $('#btnNext').style.display = last ? 'none' : '';
  $('#btnSubmit')?.remove();
  if (last) {
    const b = document.createElement('button');
    b.className = 'btn btn-submit'; b.id = 'btnSubmit'; b.textContent = 'Gửi khảo sát ✓';
    b.addEventListener('click', submit);
    $('#nav').appendChild(b);
  }
  $('#err').classList.remove('is-on');
  if (!silent) window.scrollTo({ top: 0, behavior: 'smooth' });
}

function next() {
  const missing = validateSection(state.idx);
  if (missing.length) { showError(missing); return; }
  if (state.stopped) { finishScreener(); return; }
  if (state.idx < S.sections.length - 1) goSection(state.idx + 1);
}
function prev() {
  if (state.idx > 0) goSection(state.idx - 1);
}

function finishScreener() {
  $('#progressWrap').style.display = 'none';
  $$('.section').forEach(s => s.classList.remove('is-active'));
  $('#nav').style.display = 'none';
  $('#stop').classList.add('is-on');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ══════════════════════════════════════════════════════════
   SUBMIT
   ══════════════════════════════════════════════════════════ */
async function submit() {
  /* validate toàn bộ các section */
  for (let i = 0; i < S.sections.length; i++) {
    const missing = validateSection(i);
    if (missing.length) { goSection(i); setTimeout(() => showError(missing), 120); return; }
  }

  const payload = buildPayload();
  const btn = $('#btnSubmit');
  if (btn) { btn.disabled = true; btn.textContent = 'Đang gửi...'; }

  try {
    if (ENDPOINT) {
      await fetch(ENDPOINT, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });
    } else {
      /* chế độ demo — lưu localStorage */
      const store = JSON.parse(localStorage.getItem('safekid_survey') || '[]');
      store.push(payload);
      localStorage.setItem('safekid_survey', JSON.stringify(store));
    }
    showDone(payload);
  } catch (err) {
    if (btn) { btn.disabled = false; btn.textContent = 'Gửi khảo sát ✓'; }
    toast('Có lỗi khi gửi. Vui lòng thử lại.');
    console.error(err);
  }
}

function buildPayload() {
  const a = state.answers;
  const out = {
    timestamp: new Date().toISOString(),
    duration_sec: Math.round((Date.now() - state.startedAt) / 1000),
    version: S.meta.version,
    source: 'web-form'
  };
  FLAT.forEach(q => {
    const v = a[q.id];
    if (v == null) { out[q.id] = ''; return; }
    if (q.type === 'matrix') {
      q.rows.forEach(r => { out[`${q.id}_${r.id}`] = v[r.id] || ''; });
      out[q.id] = JSON.stringify(v);
    } else if (Array.isArray(v)) {
      out[q.id] = v.join('; ');
    } else {
      out[q.id] = v;
    }
  });
  return out;
}

function showDone(payload) {
  state.submitted = true;
  $('#progressWrap').style.display = 'none';
  $$('.section').forEach(s => s.classList.remove('is-active'));
  $('#nav').style.display = 'none';
  $('#err').classList.remove('is-on');
  $('#doneCode').textContent = 'Mã phản hồi: ' + payload.timestamp.slice(0, 19).replace('T', ' ');
  $('#done').classList.add('is-on');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ══════════════════════════════════════════════════════════
   INIT
   ══════════════════════════════════════════════════════════ */
function syncMeta() {
  /* đồng bộ các chip ở header với schema — tránh ghi cứng số phần / thời gian */
  const timeEl = $('#metaTime');
  const secEl = $('#metaSections');
  const lbl = $('#progressLabel');
  if (timeEl && S.meta.estTime) timeEl.textContent = S.meta.estTime;
  if (secEl) secEl.textContent = S.sections.length;
  if (lbl) lbl.textContent = `Phần 1 / ${S.sections.length}`;
}

syncMeta();
renderAll();
console.log(`%cSafeKid Survey v${S.meta.version}`, 'color:#00d4ff;font-weight:700', `— ${FLAT.length} câu, ${S.sections.length} phần${ENDPOINT ? '' : ' (DEMO MODE — chưa kết nối backend)'}`);
