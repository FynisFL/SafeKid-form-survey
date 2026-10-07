/* End-to-end test form khảo sát 20 câu bằng jsdom */
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const root = __dirname;
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const schemaSrc = fs.readFileSync(path.join(root, 'survey-schema.js'), 'utf8');
const appSrc = fs.readFileSync(path.join(root, 'survey.js'), 'utf8');

const results = [];
const t = (n, c, e = '') => results.push({ n, pass: !!c, e });

function boot() {
  const dom = new JSDOM(html, { runScripts: 'outside-only', pretendToBeVisual: true, url: 'http://localhost/' });
  const w = dom.window;
  w.scrollTo = () => {};
  w.HTMLElement.prototype.scrollIntoView = () => {};
  w.localStorage.clear();
  /* jsdom không có fetch — mock để test luồng submit khi đã cấu hình ENDPOINT */
  w.fetch = () => Promise.resolve({ type: 'opaque', status: 0 });
  w.eval(schemaSrc);
  w.eval(appSrc);
  return { w, $: s => w.document.querySelector(s), $$: s => [...w.document.querySelectorAll(s)] };
}

/* ══ 1. RENDER ══ */
{
  const { w, $, $$ } = boot();
  const S = w.SURVEY;
  const nq = S.sections.flatMap(s => s.questions).length;
  t('9 phần được render', $$('.section').length === 9, `got ${$$('.section').length}`);
  t('22 câu được render', $$('.q').length === nq, `got ${$$('.q').length} / schema ${nq}`);
  t('Phần 1 active', $('.section.is-active')?.dataset.sec === 'S1');
  t('Progress 0%', $('#progressPct').textContent === '0%', $('#progressPct').textContent);
  t('Nút lùi ẩn ở phần 1', $('#btnPrev').style.visibility === 'hidden');
  t('Q10a ẩn ban đầu', w.getComputedStyle($('#q_Q10a')).display === 'none');
  t('Q10b ẩn ban đầu', w.getComputedStyle($('#q_Q10b')).display === 'none');
  t('Có 2 ma trận render', $$('.matrix').length === 2, `got ${$$('.matrix').length}`);
  t('Q11 có 8 dòng', $$('.mx-row').length === 14, `tổng 14 dòng (8+6), got ${$$('.mx-row').length}`);
}

/* ══ 2. VALIDATION ══ */
{
  const { $, $$ } = boot();
  $('#btnNext').click();
  t('Chặn khi phần 1 trống', $('.section.is-active').dataset.sec === 'S1');
  t('Hiện cảnh báo lỗi', $('#err').classList.contains('is-on'));
  t('Liệt kê Q1 thiếu', $('#err').textContent.includes('Q1'), $('#err').textContent.slice(0, 70));
}

/* ══ 3. SCREENER ══ */
{
  const { w, $, $$ } = boot();
  const pick = (qid, val) => $$(`.opt[data-q="${qid}"]`).find(o => o.dataset.val === val).click();
  pick('Q1', 'Chưa có con');
  pick('Q2', '31–35');
  pick('Q3', 'Hà Nội');
  pick('Q4', '20–30 triệu');
  pick('Q5', 'Không dùng gì');
  $('#btnNext').click();
  t('Screener chặn người ngoài target', $('#stop').classList.contains('is-on'));
  t('Ẩn nav sau khi dừng', $('#nav').style.display === 'none');
}

/* ══ 4. GATE BRANCHING ══ */
{
  const { w, $, $$ } = boot();
  const pick = (qid, val) => $$(`.opt[data-q="${qid}"]`).find(o => o.dataset.val === val).click();
  const disp = id => w.getComputedStyle($('#q_' + id)).display;
  pick('Q10', 'Đang dùng');
  t('Q10a hiện khi "Đang dùng"', disp('Q10a') !== 'none');
  t('Q10b ẩn khi "Đang dùng"', disp('Q10b') === 'none');
  pick('Q10', 'Chưa từng biết đến');
  t('Q10a ẩn khi đổi nhánh', disp('Q10a') === 'none');
  t('Q10b hiện khi đổi nhánh', disp('Q10b') !== 'none');
}

/* ══ 5. MATRIX ══ */
{
  const { $, $$ } = boot();
  const mx = (qid, row, val) => $$(`.mx-cell[data-q="${qid}"][data-row="${row}"]`).find(c => c.dataset.val === val).click();
  mx('Q11', 'gps', '5');
  mx('Q11', 'sos', '5');
  t('Chọn được ô ma trận', $$('.mx-cell[data-q="Q11"].is-on').length === 2);
  mx('Q11', 'gps', '3');
  t('Chọn lại thay thế ô cũ', $$('.mx-cell[data-q="Q11"][data-row="gps"].is-on').length === 1);
  mx('Q13', 'wipe', '5');
  t('Ma trận Q13 chọn được', $$('.mx-cell[data-q="Q13"].is-on').length === 1);
}

/* ══ 6. CHECKBOX MAX + EXCLUSIVE ══ */
{
  const { $, $$ } = boot();
  const cb = (qid, val) => $$(`.opt[data-q="${qid}"][data-check]`).find(o => o.dataset.val === val).click();
  cb('Q7', 'Con đi lạc');
  cb('Q7', 'Con bị người lạ tiếp cận');
  cb('Q7', 'Không liên lạc được với con');
  t('Q7 đạt max 3', $$('.opt[data-q="Q7"].is-on').length === 3);
  cb('Q7', 'Con bị bắt nạt');
  t('Q7 chặn chọn thứ 4', $$('.opt[data-q="Q7"].is-on').length === 3);
  cb('Q5', 'Điện thoại riêng');
  cb('Q5', 'Không dùng gì');
  t('Loại trừ Q5 hoạt động', $$('.opt[data-q="Q5"].is-on').length === 1);
  t('Đúng ô loại trừ', $$('.opt[data-q="Q5"].is-on')[0].dataset.val === 'Không dùng gì');
}

/* ══ 7. FULL FLOW + SUBMIT ══ */
{
  const { w, $, $$ } = boot();
  const pick = (qid, val) => { const e = $$(`.opt[data-q="${qid}"]`).find(o => o.dataset.val === val); if (e) e.click(); };
  const first = qid => { const e = $$(`.opt[data-q="${qid}"]`)[0]; if (e) e.click(); };
  const lk = (qid, val) => $$(`.lk[data-q="${qid}"]`).find(l => l.dataset.val === val).click();

  /* P1 */
  pick('Q1', '6–10 tuổi'); first('Q2'); first('Q3'); first('Q4'); first('Q5');
  $('#btnNext').click();
  t('Sang phần 2', $('.section.is-active').dataset.sec === 'S2', $('.section.is-active').dataset.sec);
  /* P2 */
  lk('Q6', '4'); first('Q7'); lk('Q8', '4');
  $('#btnNext').click();
  /* P3 */
  first('Q9'); pick('Q10', 'Đang dùng'); first('Q10a');
  $('#btnNext').click();
  /* P4 — ma trận Q11 đủ 8 dòng */
  $$('.mx-cell[data-q="Q11"]').forEach((c, i) => { if (i % 5 === 0) c.click(); });
  t('Q11 đủ 8 dòng đã chọn', $$('.mx-cell[data-q="Q11"].is-on').length === 8, `got ${$$('.mx-cell[data-q="Q11"].is-on').length}`);
  $('#btnNext').click();
  /* P5 */
  lk('Q12', '4');
  $('#btnNext').click();
  /* P6 — ma trận Q13 đủ 6 dòng */
  $$('.mx-cell[data-q="Q13"]').forEach((c, i) => { if (i % 5 === 0) c.click(); });
  t('Q13 đủ 6 dòng đã chọn', $$('.mx-cell[data-q="Q13"].is-on').length === 6, `got ${$$('.mx-cell[data-q="Q13"].is-on').length}`);
  first('Q14'); first('Q15');
  $('#btnNext').click();
  /* P7 */
  first('Q16'); first('Q17');
  $('#btnNext').click();
  /* P8 */
  lk('Q18', '4');
  $('#btnNext').click();
  /* P9 */
  lk('Q19', '4'); first('Q20');

  t('Đến được phần 9', $('.section.is-active').dataset.sec === 'S9', $('.section.is-active').dataset.sec);
  t('Nút gửi xuất hiện', !!$('#btnSubmit'));

  const payload = w.buildPayload();
  t('Payload có timestamp', typeof payload.timestamp === 'string' && payload.timestamp.includes('T'));
  t('Payload flatten Q11 -> 8 cột', Object.keys(payload).filter(k => k.startsWith('Q11_')).length === 8);
  t('Payload flatten Q13 -> 6 cột', Object.keys(payload).filter(k => k.startsWith('Q13_')).length === 6);
  t('Payload nối nhiều lựa chọn bằng ;', typeof payload.Q7 === 'string' && payload.Q7.length > 0, payload.Q7);
  t('Payload version 3.0', payload.version === '3.0', payload.version);
  t('Payload có duration', typeof payload.duration_sec === 'number');

  /* submit */
  w.submit();
  setTimeout(() => {
    t('Submit hiện màn hình cảm ơn', $('#done').classList.contains('is-on'));
    const sent = JSON.parse(w.localStorage.getItem('safekid_sent') || '[]');
    t('Payload gửi được lưu bản sao', sent.length === 1, `${sent.length}`);
    t('Payload có >= 40 khóa', Object.keys((sent[0] || {}).payload || {}).length >= 40,
      `${Object.keys((sent[0] || {}).payload || {}).length}`);

    const pass = results.filter(r => r.pass).length;
    console.log('\n═══ TEST FORM 20 CÂU (jsdom) ═══');
    results.forEach(r => console.log(`${r.pass ? '✓' : '✗'} ${r.n}${r.e ? '  [' + r.e + ']' : ''}`));
    console.log(`\n${pass}/${results.length} passed`);
    process.exit(pass === results.length ? 0 : 1);
  }, 400);
}
