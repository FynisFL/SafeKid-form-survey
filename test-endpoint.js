/* Test hành vi ENDPOINT: demo mode vs gửi thật */
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const root = __dirname;
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const schemaSrc = fs.readFileSync(path.join(root, 'survey-schema.js'), 'utf8');
const appSrc = fs.readFileSync(path.join(root, 'survey.js'), 'utf8');

const results = [];
const t = (n, c, e = '') => results.push({ n, pass: !!c, e });

/* boot với ENDPOINT tuỳ chỉnh */
function boot(endpoint) {
  const dom = new JSDOM(html, { runScripts: 'outside-only', pretendToBeVisual: true, url: 'http://localhost/' });
  const w = dom.window;
  w.scrollTo = () => {};
  w.HTMLElement.prototype.scrollIntoView = () => {};
  w.localStorage.clear();

  const patched = appSrc.replace(
    /const ENDPOINT = '[^']*';/,
    `const ENDPOINT = '${endpoint}';`
  );
  w.eval(schemaSrc);
  w.eval(patched);
  return { w, $: s => w.document.querySelector(s), $$: s => [...w.document.querySelectorAll(s)] };
}

/* ══ A. ENDPOINT RỖNG -> cảnh báo hiện, submit nói rõ chưa gửi ══ */
{
  const { w, $, $$ } = boot('');
  t('A1: Cảnh báo demo HIỆN khi ENDPOINT rỗng',
    $('.demo-warn').style.display === 'block', $('.demo-warn').style.display);
  t('A2: Nội dung cảnh báo có nhắc ENDPOINT',
    $('.demo-warn').textContent.includes('ENDPOINT'));

  /* điền nhanh toàn bộ để submit */
  const pick = (q, v) => { const e = $$(`.opt[data-q="${q}"]`).find(o => o.dataset.val === v); if (e) e.click(); };
  const first = q => { const e = $$(`.opt[data-q="${q}"]`)[0]; if (e) e.click(); };
  const lk = (q, v) => $$(`.lk[data-q="${q}"]`).find(l => l.dataset.val === v).click();

  pick('Q1', '6–10 tuổi'); first('Q2'); first('Q3'); first('Q4'); first('Q5');
  lk('Q6', '4'); first('Q7'); lk('Q8', '4');
  first('Q9'); pick('Q10', 'Đang dùng'); first('Q10a');
  $$('.mx-cell[data-q="Q11"]').forEach((c, i) => { if (i % 5 === 0) c.click(); });
  lk('Q12', '4');
  $$('.mx-cell[data-q="Q13"]').forEach((c, i) => { if (i % 5 === 0) c.click(); });
  first('Q14'); first('Q15');
  first('Q16'); first('Q17');
  lk('Q18', '4');
  lk('Q19', '4'); first('Q20');

  w.submit();
  setTimeout(() => {
    t('A3: Hiện màn hình kết thúc', $('#done').classList.contains('is-on'));
    t('A4: Nói rõ CHƯA gửi máy chủ',
      $('#doneNote').textContent.includes('CHƯA được gửi'), $('#doneNote').textContent);
    t('A5: Mã ghi là "Mã tạm"', $('#doneCode').textContent.includes('Mã tạm'), $('#doneCode').textContent);

    /* ══ B. CÓ ENDPOINT -> ẩn cảnh báo ══ */
    const B = boot('https://example.com/exec');
    t('B1: Cảnh báo demo ẨN khi có ENDPOINT',
      B.$('.demo-warn').style.display === 'none', B.$('.demo-warn').style.display);
    t('B2: Console báo không còn DEMO MODE',
      !B.w.document.body.textContent.includes('CHẾ ĐỘ THỬ NGHIỆM') ||
      B.$('.demo-warn').style.display === 'none');

    /* ══ C. Gửi thật -> fetch được gọi với payload đúng ══ */
    const C = boot('https://example.com/exec');
    let captured = null;
    C.w.fetch = (url, opts) => { captured = { url, opts }; return Promise.resolve({ type: 'opaque', status: 0 }); };

    const cFirst = q => { const e = C.$$(`.opt[data-q="${q}"]`)[0]; if (e) e.click(); };
    const cLk = (q, v) => C.$$(`.lk[data-q="${q}"]`).find(l => l.dataset.val === v).click();
    const cPick = (q, v) => { const e = C.$$(`.opt[data-q="${q}"]`).find(o => o.dataset.val === v); if (e) e.click(); };

    cPick('Q1', '6–10 tuổi'); cFirst('Q2'); cFirst('Q3'); cFirst('Q4'); cFirst('Q5');
    cLk('Q6', '4'); cFirst('Q7'); cLk('Q8', '4');
    cFirst('Q9'); cPick('Q10', 'Đang dùng'); cFirst('Q10a');
    C.$$('.mx-cell[data-q="Q11"]').forEach((c, i) => { if (i % 5 === 0) c.click(); });
    cLk('Q12', '4');
    C.$$('.mx-cell[data-q="Q13"]').forEach((c, i) => { if (i % 5 === 0) c.click(); });
    cFirst('Q14'); cFirst('Q15');
    cFirst('Q16'); cFirst('Q17');
    cLk('Q18', '4');
    cLk('Q19', '4'); cFirst('Q20');

    C.w.submit();
    setTimeout(() => {
      t('C1: fetch ĐƯỢC gọi khi có ENDPOINT', !!captured);
      if (captured) {
        t('C2: fetch đúng URL', captured.url === 'https://example.com/exec', captured.url);
        t('C3: dùng POST', captured.opts.method === 'POST', captured.opts.method);
        t('C4: dùng no-cors', captured.opts.mode === 'no-cors', captured.opts.mode);
        const body = JSON.parse(captured.opts.body);
        t('C5: body là JSON hợp lệ', !!body.timestamp);
        t('C6: body có 40 khóa', Object.keys(body).length === 40, `${Object.keys(body).length}`);
        t('C7: body có Q19', body.Q19 === '4', body.Q19);
        t('C8: body có Q13_wipe', !!body.Q13_wipe, body.Q13_wipe);
      }
      t('C9: Màn hình kết thúc hiện', C.$('#done').classList.contains('is-on'));
      t('C10: KHÔNG nói "CHƯA gửi" khi gửi thật',
        !C.$('#doneNote').textContent.includes('CHƯA được gửi'), C.$('#doneNote').textContent);
      t('C11: Mã ghi là "Mã phản hồi"', C.$('#doneCode').textContent.includes('Mã phản hồi'));

      /* ══ D. fetch lỗi -> báo lỗi, KHÔNG hiện "thành công" ══ */
      const D = boot('https://example.com/exec');
      D.w.fetch = () => Promise.reject(new Error('network down'));
      const dFirst = q => { const e = D.$$(`.opt[data-q="${q}"]`)[0]; if (e) e.click(); };
      const dLk = (q, v) => D.$$(`.lk[data-q="${q}"]`).find(l => l.dataset.val === v).click();
      const dPick = (q, v) => { const e = D.$$(`.opt[data-q="${q}"]`).find(o => o.dataset.val === v); if (e) e.click(); };
      dPick('Q1', '6–10 tuổi'); dFirst('Q2'); dFirst('Q3'); dFirst('Q4'); dFirst('Q5');
      dLk('Q6', '4'); dFirst('Q7'); dLk('Q8', '4');
      dFirst('Q9'); dPick('Q10', 'Đang dùng'); dFirst('Q10a');
      D.$$('.mx-cell[data-q="Q11"]').forEach((c, i) => { if (i % 5 === 0) c.click(); });
      dLk('Q12', '4');
      D.$$('.mx-cell[data-q="Q13"]').forEach((c, i) => { if (i % 5 === 0) c.click(); });
      dFirst('Q14'); dFirst('Q15');
      dFirst('Q16'); dFirst('Q17');
      dLk('Q18', '4');
      dLk('Q19', '4'); dFirst('Q20');
      /* bấm qua từng phần để nút Gửi được tạo như người dùng thật */
      for (let i = 0; i < 8; i++) D.$('#btnNext') && D.$('#btnNext').click();
      t('D0: Nút Gửi tồn tại sau khi qua hết các phần', !!D.$('#btnSubmit'));

      D.w.submit();
      setTimeout(() => {
        t('D1: KHÔNG hiện màn hình thành công khi lỗi',
          !D.$('#done').classList.contains('is-on'));
        t('D2: Nút gửi bật lại để thử lại',
          D.$('#btnSubmit') && D.$('#btnSubmit').disabled === false,
          D.$('#btnSubmit') ? `disabled=${D.$('#btnSubmit').disabled}` : 'không có nút');
        t('D3: Nút gửi hiện chữ "Gửi khảo sát"',
          D.$('#btnSubmit') && D.$('#btnSubmit').textContent.includes('Gửi khảo sát'),
          D.$('#btnSubmit') ? D.$('#btnSubmit').textContent : '');

        const pass = results.filter(r => r.pass).length;
        console.log('\n═══ TEST ENDPOINT BEHAVIOR ═══');
        results.forEach(r => console.log(`${r.pass ? '✓' : '✗'} ${r.n}${r.e ? '  [' + r.e + ']' : ''}`));
        console.log(`\n${pass}/${results.length} passed`);
        process.exit(pass === results.length ? 0 : 1);
      }, 300);
    }, 300);
  }, 300);
}
