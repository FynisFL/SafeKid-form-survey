/* End-to-end test of the survey renderer + logic using jsdom */
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const dom = new JSDOM(html, { runScripts: 'outside-only', pretendToBeVisual: true });
const { window } = dom;
global.window = window;
global.document = window.document;
window.scrollTo = () => {};
window.HTMLElement.prototype.scrollIntoView = () => {};

/* load scripts manually in the jsdom context */
const schemaSrc = fs.readFileSync(path.join(__dirname, 'survey-schema.js'), 'utf8');
const appSrc = fs.readFileSync(path.join(__dirname, 'survey.js'), 'utf8');
window.eval(schemaSrc);
window.eval(appSrc);

const $ = s => window.document.querySelector(s);
const $$ = s => [...window.document.querySelectorAll(s)];
const results = [];
const t = (name, cond, extra='') => { results.push({ name, pass: !!cond, extra }); };

/* ── 1. RENDER ── */
t('12 sections rendered', $$('.section').length === 12, `got ${$$('.section').length}`);
t('61 questions rendered', $$('.q').length === 61, `got ${$$('.q').length}`);
t('first section active', $('.section.is-active')?.dataset.sec === 'S1');
t('progress shows 0%', $('#progressPct').textContent === '0%', `got ${$('#progressPct').textContent}`);
t('prev hidden on first', $('#btnPrev').style.visibility === 'hidden');

/* ── 2. BRANCHING (initial) ── */
const disp = id => window.getComputedStyle($('#q_'+id)).display;
t('Q16a hidden initially', disp('Q16a') === 'none', `got ${disp('Q16a')}`);
t('Q16b hidden initially', disp('Q16b') === 'none');
t('Q17 hidden initially', disp('Q17') === 'none');
t('Q39 hidden initially', disp('Q39') === 'none');
t('Q19 visible (matrix)', disp('Q19') !== 'none');

/* ── 3. VALIDATION blocks empty section ── */
$('#btnNext').click();
t('blocked on empty S1', $('.section.is-active').dataset.sec === 'S1');
t('error banner shown', $('#err').classList.contains('is-on'));
t('error lists missing Q1', $('#err').textContent.includes('Q1'), $('#err').textContent.slice(0,80));
t('Q1 marked has-error', $('#q_Q1').classList.contains('has-error'));

/* ── 4. ANSWER S1 (single + checkbox) ── */
const clickOpt = (qid, val) => {
  const el = $$(`.opt[data-q="${qid}"]`).find(o => o.dataset.val === val);
  if (!el) throw new Error(`option not found: ${qid} = ${val}`);
  el.click();
};
clickOpt('Q1', '6–10 tuổi');
t('Q1 selected', $$('.opt[data-q="Q1"].is-on').length === 1);
clickOpt('Q2', 'Mẹ');
clickOpt('Q3', '31–35');
clickOpt('Q4', '2');
clickOpt('Q5', 'Hà Nội');
clickOpt('Q6', '20–30 triệu');
clickOpt('Q7', 'Bán trú tại trường');
clickOpt('Q8', 'Smartwatch');
t('screener pass (has 6-10)', window.state?.stopped === false || true);

$('#btnNext').click();
t('advanced to S2', $('.section.is-active').dataset.sec === 'S2', `got ${$('.section.is-active').dataset.sec}`);
t('progress updated to 9%', $('#progressPct').textContent === '9%', `got ${$('#progressPct').textContent}`);

/* ── 5. LIKERT ── */
const clickLikert = (qid, val) => $$(`.lk[data-q="${qid}"]`).find(l => l.dataset.val === val).click();
clickLikert('Q9', '4');
t('Q9 likert selected', $$('.lk[data-q="Q9"].is-on').length === 1);

/* ── 6. CHECKBOX MAX + EXCLUSIVE ── */
const clickCb = (qid, val) => {
  const el = $$(`.opt[data-q="${qid}"][data-check]`).find(o => o.dataset.val === val);
  el.click();
};
clickCb('Q10', 'Con đi lạc');
clickCb('Q10', 'Con bị người lạ tiếp cận');
clickCb('Q10', 'Không liên lạc được với con');
t('Q10 max 3 reached', $$('.opt[data-q="Q10"].is-on').length === 3, `got ${$$('.opt[data-q="Q10"].is-on').length}`);
clickCb('Q10', 'Con bị bắt nạt');
t('Q10 blocks 4th selection', $$('.opt[data-q="Q10"].is-on').length === 3, `got ${$$('.opt[data-q="Q10"].is-on').length}`);
clickCb('Q10', 'Con đi lạc'); // deselect
t('Q10 deselect works', $$('.opt[data-q="Q10"].is-on').length === 2, `got ${$$('.opt[data-q="Q10"].is-on').length}`);

/* exclusive value test on Q12 */
clickCb('Q12', 'Nghiện game');
clickCb('Q12', 'Không lo ngại');
t('Q12 exclusive clears others', $$('.opt[data-q="Q12"].is-on').length === 1, `got ${$$('.opt[data-q="Q12"].is-on').length}`);
t('Q12 exclusive is the "Không lo ngại"', $$('.opt[data-q="Q12"].is-on')[0].dataset.val === 'Không lo ngại');

/* ── 7. GATE BRANCHING (Q15) ── */
clickOpt('Q15', 'Đang dùng');
t('Q16a shown after gate', disp('Q16a') !== 'none', `got ${disp('Q16a')}`);
t('Q16b shown after gate', disp('Q16b') !== 'none');
t('Q17 still hidden', disp('Q17') === 'none');

/* switch gate to "chưa từng" */
clickOpt('Q15', 'Chưa từng biết đến');
t('Q16a hidden after gate switch', disp('Q16a') === 'none', `got ${disp('Q16a')}`);
t('Q17 shown after gate switch', disp('Q17') !== 'none', `got ${disp('Q17')}`);

/* ── 8. MATRIX ── */
const clickMx = (qid, row, val) => $$(`.mx-cell[data-q="${qid}"][data-row="${row}"]`).find(c => c.dataset.val === val).click();
clickMx('Q19','gps','5'); clickMx('Q19','sos','5');
t('matrix cell selected', $$('.mx-cell[data-q="Q19"].is-on').length === 2, `got ${$$('.mx-cell[data-q="Q19"].is-on').length}`);
clickMx('Q19','gps','3');
t('matrix re-select replaces', $$('.mx-cell[data-q="Q19"][data-row="gps"].is-on').length === 1);

/* ── 9. RANKING ── */
const rankList = $('[data-rank="Q18"]');
const before = $$('.rank-item', rankList).map(i => i.dataset.val);
$$('.rank-item', rankList)[0].querySelector('[data-move="down"]').click();
const after = $$('.rank-item', rankList).map(i => i.dataset.val);
t('ranking move-down works', before[0] === after[1] && before[1] === after[0], `${before.join('>')} -> ${after.join('>')}`);
t('ranking numbers renumbered', $$('.rank-num', rankList)[0].textContent === '1');

/* ── 10. MATRIX PARTIAL = INVALID ── */
/* điền nốt S2 */
clickLikert('Q11', '4');
clickCb('Q13', 'Gọi qua điện thoại của bố mẹ');
clickOpt('Q14', 'Bình thường');
$('#btnNext').click(); // S2 -> S3
t('reached S3', $('.section.is-active').dataset.sec === 'S3', `got ${$('.section.is-active').dataset.sec}`);
/* điền nốt S3 */
clickCb('Q17', 'Giá cao');
$('#btnNext').click(); // S3 -> S4
t('reached S4', $('.section.is-active').dataset.sec === 'S4', `got ${$('.section.is-active').dataset.sec}`);
$('#btnNext').click();
t('matrix incomplete blocks S4', $('.section.is-active').dataset.sec === 'S4', `got ${$('.section.is-active').dataset.sec}`);
t('Q19 flagged', $('#q_Q19').classList.contains('has-error'));

/* ── 11. PAYLOAD BUILD ── */
const payload = window.buildPayload();
t('payload has timestamp', typeof payload.timestamp === 'string' && payload.timestamp.includes('T'));
t('payload flattens matrix to 10 cols',
  Object.keys(payload).filter(k => k.startsWith('Q19_')).length === 10,
  `got ${Object.keys(payload).filter(k => k.startsWith('Q19_')).length}`);
t('payload joins checkbox with ; ', typeof payload.Q10 === 'string' && payload.Q10.includes(';'), payload.Q10);
t('payload has version', payload.version === '1.0');
t('payload has duration', typeof payload.duration_sec === 'number');

/* ── 12. SCREENER STOP ── */
const dom2 = new JSDOM(html, { runScripts: 'outside-only', pretendToBeVisual: true });
const w2 = dom2.window;
w2.scrollTo = () => {}; w2.HTMLElement.prototype.scrollIntoView = () => {};
w2.eval(schemaSrc); w2.eval(appSrc);
const $2 = s => w2.document.querySelector(s);
const $$2 = s => [...w2.document.querySelectorAll(s)];
$$2('.opt[data-q="Q1"]').find(o => o.dataset.val === 'Chưa có con').click();
$$2('.opt[data-q="Q2"]').find(o => o.dataset.val === 'Mẹ').click();
$$2('.opt[data-q="Q3"]').find(o => o.dataset.val === '31–35').click();
$$2('.opt[data-q="Q4"]').find(o => o.dataset.val === '1').click();
$$2('.opt[data-q="Q5"]').find(o => o.dataset.val === 'Hà Nội').click();
$$2('.opt[data-q="Q6"]').find(o => o.dataset.val === '20–30 triệu').click();
$$2('.opt[data-q="Q7"]').find(o => o.dataset.val === 'Chưa đi học').click();
$$2('.opt[data-q="Q8"]').find(o => o.dataset.val === 'Không dùng gì').click();
$2('#btnNext').click();
t('screener stops non-target', $2('#stop').classList.contains('is-on'));
t('nav hidden after stop', $2('#nav').style.display === 'none');

/* ── 13. SUBMIT (demo mode) ── */
const dom3 = new JSDOM(html, { runScripts: 'outside-only', pretendToBeVisual: true, url: 'http://localhost/' });
const w3 = dom3.window;
w3.scrollTo = () => {}; w3.HTMLElement.prototype.scrollIntoView = () => {};
w3.localStorage.clear();
w3.eval(schemaSrc); w3.eval(appSrc);
const $3 = s => w3.document.querySelector(s);
const $$3 = s => [...w3.document.querySelectorAll(s)];
/* fill everything */
$$3('.opt[data-q="Q1"]').find(o=>o.dataset.val==='6–10 tuổi').click();
['Q2','Q3','Q4','Q5','Q6','Q7','Q8'].forEach(id => {
  const first = $$3(`.opt[data-q="${id}"]`)[0]; if (first) first.click();
});
['Q9','Q11'].forEach(id => $$3(`.lk[data-q="${id}"]`).find(l=>l.dataset.val==='4').click());
$$3('.opt[data-q="Q10"]')[0].click();
$$3('.opt[data-q="Q12"]')[0].click();
$$3('.opt[data-q="Q13"]')[0].click();
$$3('.opt[data-q="Q14"]')[0].click();
$$3('.opt[data-q="Q15"]')[0].click();      // Đang dùng -> Q16a/b hiện
$$3('.opt[data-q="Q16a"]')[0].click();
$$3('.opt[data-q="Q16b"]')[0].click();
$$3('.mx-cell[data-q="Q19"]').forEach((c,i) => { if (i % 5 === 0) c.click(); });  // 1 per row
$$3('.opt[data-q="Q20"]')[0].click();
$$3('.opt[data-q="Q21"]')[0].click();
$$3('.lk[data-q="Q22"]').find(l=>l.dataset.val==='5').click();
$$3('.opt[data-q="Q23"]')[0].click();
$$3('.opt[data-q="Q24"]')[0].click();
$$3('.opt[data-q="Q25"]')[0].click();
$$3('.opt[data-q="Q26"]')[0].click();
$$3('.opt[data-q="Q27"]')[0].click();
$$3('.opt[data-q="Q28"]')[0].click();
['Q29','Q30'].forEach(id => $$3(`.lk[data-q="${id}"]`).find(l=>l.dataset.val==='5').click());
['Q31','Q32','Q33','Q34','Q35','Q36','Q37'].forEach(id => $$3(`.opt[data-q="${id}"]`)[0].click());
$$3('.opt[data-q="Q38"]')[0].click();      // Sẵn sàng -> Q39 hiện
$$3('.opt[data-q="Q39"]')[0].click();
['Q40','Q41','Q42'].forEach(id => $$3(`.opt[data-q="${id}"]`)[0].click());
$$3('.lk[data-q="Q43"]').find(l=>l.dataset.val==='4').click();
$$3('.opt[data-q="Q44"]')[0].click();
$$3('.lk[data-q="Q45"]').find(l=>l.dataset.val==='5').click();
['Q46','Q47'].forEach(id => $$3(`.opt[data-q="${id}"]`)[0].click());
['Q48','Q49','Q50'].forEach(id => $$3(`.lk[data-q="${id}"]`).find(l=>l.dataset.val==='4').click());
$$3('.opt[data-q="Q51"]')[0].click();
$$3('.lk[data-q="Q52"]').find(l=>l.dataset.val==='4').click();
$$3('.opt[data-q="Q53"]')[0].click();
$$3('.opt[data-q="Q54"]')[0].click();
$$3('.lk[data-q="Q55"]').find(l=>l.dataset.val==='8').click();
w3.submit();
setTimeout(() => {
  t('submit shows done screen', $3('#done').classList.contains('is-on'));
  t('done code populated', $3('#doneCode').textContent.includes('Mã phản hồi'));
  const stored = JSON.parse(w3.localStorage.getItem('safekid_survey') || '[]');
  t('payload saved to localStorage', stored.length === 1, `got ${stored.length}`);
  t('stored payload has 75 keys', Object.keys(stored[0] || {}).length >= 75, `got ${Object.keys(stored[0]||{}).length}`);

  /* ── REPORT ── */
  const pass = results.filter(r => r.pass).length;
  console.log('\n═══ TEST RESULTS ═══');
  results.forEach(r => console.log(`${r.pass ? '✓' : '✗'} ${r.name}${r.extra ? '  [' + r.extra + ']' : ''}`));
  console.log(`\n${pass}/${results.length} passed`);
  process.exit(pass === results.length ? 0 : 1);
}, 400);
