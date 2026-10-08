/**
 * ══════════════════════════════════════════════════════════
 *  SAFEKID SURVEY — GOOGLE APPS SCRIPT BACKEND  (v3 · 20 câu)
 *  Nhận dữ liệu từ web form → ghi vào Google Sheet
 * ══════════════════════════════════════════════════════════
 *
 *  CÁCH DÙNG:
 *  1. Tạo Google Sheet mới, đặt tên: "SafeKid Survey Data"
 *  2. Menu Extensions → Apps Script
 *  3. Tạo 2 file trong Apps Script:
 *     - Code.gs     → dán nội dung file này
 *     - columns.gs  → dán nội dung file survey/apps-script/columns.gs
 *  4. Sửa SPREADSHEET_ID bên dưới (lấy từ URL sheet)
 *  5. Deploy → New deployment → Web app
 *     - Execute as: Me
 *     - Who has access: Anyone
 *  6. Copy URL /exec → dán vào ENDPOINT trong survey.js
 */

/* ══════ CẤU HÌNH ══════ */
// Lấy từ URL: docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit
const SPREADSHEET_ID = '';        // để trống = dùng sheet chứa script này
const SHEET_NAME     = 'Responses';
const LOG_SHEET_NAME = 'Log';

/* ══════ ENTRY POINTS ══════ */

/**
 * Nhận dữ liệu từ form.
 *
 * ⚠️ KHÔNG bấm Run hàm này trong Apps Script — sẽ báo lỗi
 *    "Cannot read properties of undefined (reading 'postData')".
 *    Hàm này chỉ chạy khi form gửi dữ liệu tới qua URL /exec.
 *
 *    Muốn kiểm tra backend: chạy hàm `setupSheet` hoặc `summary`.
 */
function doPost(e) {
  /* Chạy tay trong editor -> e là undefined. Báo lỗi rõ ràng thay vì crash. */
  if (!e || !e.postData) {
    const msg = 'Hàm doPost() chỉ chạy khi form gửi dữ liệu tới. '
              + 'Đừng bấm Run hàm này. Hãy chạy setupSheet để tạo header, '
              + 'hoặc summary để xem thống kê.';
    Logger.log(msg);
    return json({ status: 'error', message: msg });
  }

  try {
    const data = JSON.parse(e.postData.contents);
    const ss = getSpreadsheet();
    const sheet = getOrCreateSheet(ss, SHEET_NAME, true);

    const row = COLUMNS.map(col => {
      const v = data[col];
      if (v === undefined || v === null) return '';
      if (typeof v === 'object') return JSON.stringify(v);
      return v;
    });

    /* Mã phản hồi */
    row.push('R' + String(sheet.getLastRow()).padStart(4, '0'));
    sheet.appendRow(row);

    return json({ status: 'success', row: sheet.getLastRow() });
  } catch (err) {
    logError(err, e);
    return json({ status: 'error', message: String(err) });
  }
}

/** Health check — mở URL bằng trình duyệt để kiểm tra */
function doGet(e) {
  const ss = getSpreadsheet();
  const sheet = getOrCreateSheet(ss, SHEET_NAME, true);
  const count = Math.max(0, sheet.getLastRow() - 1);
  return json({
    status: 'ok',
    service: 'SafeKid Survey Backend',
    version: '3.0 (20 câu)',
    responses: count,
    columns: COLUMNS.length + 1,
    time: new Date().toISOString()
  });
}

/** Cho phép gọi từ trình duyệt / test */
function doOptions() {
  return ContentService.createTextOutput('').setMimeType(ContentService.MimeType.TEXT);
}

/* ══════ HELPERS ══════ */

function getSpreadsheet() {
  if (SPREADSHEET_ID) return SpreadsheetApp.openById(SPREADSHEET_ID);
  return SpreadsheetApp.getActiveSpreadsheet();
}

function getOrCreateSheet(ss, name, withHeaders) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    if (withHeaders) writeHeaders(sheet);
  } else if (withHeaders && sheet.getLastRow() === 0) {
    writeHeaders(sheet);
  }
  return sheet;
}

function writeHeaders(sheet) {
  const headers = COLUMNS.map(c => HEADERS_VI[c] || c);
  headers.push('Mã phản hồi');
  sheet.appendRow(headers);

  const range = sheet.getRange(1, 1, 1, headers.length);
  range.setFontWeight('bold')
       .setBackground('#0b1220')
       .setFontColor('#00d4ff')
       .setVerticalAlignment('middle');
  sheet.setFrozenRows(1);
  sheet.setRowHeight(1, 40);
  sheet.setColumnWidths(1, headers.length, 120);
  sheet.setColumnWidth(1, 165);
  sheet.setColumnWidth(2, 110);
}

function logError(err, e) {
  try {
    const ss = getSpreadsheet();
    const log = getOrCreateSheet(ss, LOG_SHEET_NAME, false);
    if (log.getLastRow() === 0) log.appendRow(['Thời gian', 'Lỗi', 'Payload']);
    log.appendRow([new Date().toISOString(), String(err), e && e.postData ? String(e.postData.contents).slice(0, 500) : '']);
  } catch (_) { /* im lặng */ }
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/* ══════ TIỆN ÍCH — chạy tay trong editor ══════ */

/** Tạo sheet + header ngay (chạy 1 lần sau khi dán code) */
function setupSheet() {
  const ss = getSpreadsheet();
  const sheet = getOrCreateSheet(ss, SHEET_NAME, true);
  Logger.log('Sheet "%s" sẵn sàng. %s cột.', sheet.getName(), COLUMNS.length + 1);
}

/* ══════ CHẨN ĐOÁN — chạy hàm này nếu gặp trục trặc ══════ */

/**
 * Kiểm tra toàn bộ backend trong 1 lần chạy.
 * Chọn hàm `diagnose` ở dropdown → bấm Run → xem Execution log.
 */
function diagnose() {
  const lines = [];
  const log = (s) => { lines.push(s); Logger.log(s); };

  log('════════ CHẨN ĐOÁN SAFEKID BACKEND ════════');
  log('');

  /* 1. columns.gs */
  try {
    if (typeof COLUMNS === 'undefined') {
      log('❌ File columns.gs CHƯA có hoặc chưa lưu');
      log('   → Cột trái bấm ➕ cạnh "Files" → Script → đặt tên "columns" → dán nội dung columns.gs');
      log('');
      return;
    }
    log(`✅ columns.gs: ${COLUMNS.length} cột`);
    const noHdr = COLUMNS.filter(c => !HEADERS_VI[c]);
    if (noHdr.length) log(`   ⚠️  ${noHdr.length} cột thiếu header: ${noHdr.join(', ')}`);
    else log('✅ HEADERS_VI: đủ nhãn cho mọi cột');
  } catch (err) {
    log('❌ Lỗi đọc columns.gs: ' + err);
    return;
  }
  log('');

  /* 2. Sheet */
  let sheet;
  try {
    const ss = getSpreadsheet();
    log(`✅ Kết nối được Sheet: "${ss.getName()}"`);
    sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      log(`❌ Chưa có tab "${SHEET_NAME}"`);
      log('   → Chạy hàm setupSheet để tạo');
      log('');
      return;
    }
    log(`✅ Tab "${SHEET_NAME}" tồn tại`);
  } catch (err) {
    log('❌ Không truy cập được Sheet: ' + err);
    log('   → Kiểm tra SPREADSHEET_ID trong Code.gs');
    return;
  }
  log('');

  /* 3. Header */
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  if (lastRow === 0) {
    log('❌ Sheet trống — chưa có header');
    log('   → Chạy hàm setupSheet');
    return;
  }
  log(`✅ Header: ${lastCol} cột (cần ${COLUMNS.length + 1})`);
  if (lastCol !== COLUMNS.length + 1) {
    log(`   ⚠️  Số cột KHÔNG khớp! Xoá tab Responses rồi chạy lại setupSheet.`);
  }
  const hdr = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  log(`   Cột đầu: "${hdr[0]}" · Cột cuối: "${hdr[lastCol - 1]}"`);
  log('');

  /* 4. Dữ liệu */
  const n = Math.max(0, lastRow - 1);
  log(`✅ Số phản hồi hiện có: ${n}`);
  log('');

  /* 5. Trạng thái deploy */
  log('📌 NHẮC LẠI — để form gửi được dữ liệu:');
  log('   1. Deploy → New deployment → Web app');
  log('   2. Execute as: Me');
  log('   3. Who has access: Anyone   ← BẮT BUỘC');
  log('   4. URL phải kết thúc bằng /exec (không phải /dev)');
  log('');
  log('════════ KẾT THÚC ════════');
}

/* ══════ TEST & THỐNG KÊ ══════ */

/**
 * Giả lập một lượt gửi form để kiểm tra doPost.
 * Chạy hàm này nếu muốn thử backend mà không cần mở form.
 * Dòng thử sẽ được ghi vào Sheet với nhãn [TEST].
 */
function testDoPost() {
  /* Test 1: Q19 = 1 (không mua) → Q20 hiện */
  const fake1 = {};
  COLUMNS.forEach(c => { fake1[c] = ''; });
  fake1.timestamp = new Date().toISOString();
  fake1.duration_sec = 0;
  fake1.version = 'TEST';
  fake1.source = '[TEST] chạy từ Apps Script';
  fake1.Q19 = '1';
  fake1.Q20 = 'Giá cao; Chưa cần thiết';
  fake1.Q13_wipe = '5';
  fake1.Q11_sos = '5';

  const res1 = doPost({ postData: { contents: JSON.stringify(fake1) } });
  const out1 = JSON.parse(res1.getContent());
  Logger.log('Test 1 (Q19=1, Q20 hiện): %s', JSON.stringify(out1));

  /* Test 2: Q19 = 4 (mua) → Q20 ẩn */
  const fake2 = {};
  COLUMNS.forEach(c => { fake2[c] = ''; });
  fake2.timestamp = new Date().toISOString();
  fake2.duration_sec = 0;
  fake2.version = 'TEST';
  fake2.source = '[TEST] chạy từ Apps Script';
  fake2.Q19 = '4';
  fake2.Q20 = '';
  fake2.Q13_wipe = '5';
  fake2.Q11_sos = '5';

  const res2 = doPost({ postData: { contents: JSON.stringify(fake2) } });
  const out2 = JSON.parse(res2.getContent());
  Logger.log('Test 2 (Q19=4, Q20 ẩn): %s', JSON.stringify(out2));

  if (out1.status === 'success' && out2.status === 'success') {
    Logger.log('✅ Backend hoạt động. Đã ghi 2 dòng thử vào Sheet (nhớ xoá dòng đó sau).');
  } else {
    Logger.log('❌ Backend lỗi: %s / %s', out1.message, out2.message);
  }
  return { test1: out1, test2: out2 };
}

/** Xem nhanh thống kê */
function summary() {
  const sheet = getOrCreateSheet(getSpreadsheet(), SHEET_NAME, true);
  const n = Math.max(0, sheet.getLastRow() - 1);
  Logger.log('Tổng phản hồi: %s', n);
  if (!n) return;

  const rows = sheet.getRange(2, 1, n, COLUMNS.length).getValues();

  function dist(colName, label) {
    const i = COLUMNS.indexOf(colName);
    if (i < 0) return;
    const d = {};
    rows.forEach(r => { const v = r[i]; d[v] = (d[v] || 0) + 1; });
    Logger.log('%s: %s', label, JSON.stringify(d));
  }

  dist('Q19', 'Purchase Intention (Q19) — KPI chính');
  dist('Q16', 'WTP hardware (Q16)');
  dist('Q17', 'Phí Premium (Q17)');
  dist('Q14', 'Chênh lệch giá máy cũ (Q14)');

  function avgOf(keys, labels) {
    return keys.map((k, idx) => {
      const i = COLUMNS.indexOf(k);
      if (i < 0) return null;
      let sum = 0, cnt = 0;
      rows.forEach(r => { const v = Number(r[i]); if (!isNaN(v) && v > 0) { sum += v; cnt++; } });
      return { label: labels[idx], avg: cnt ? +(sum / cnt).toFixed(2) : 0 };
    }).filter(Boolean);
  }

  /* Ma trận Q13 — bằng chứng Passport / Data Wipe */
  const q13 = avgOf(
    ['Q13_condition','Q13_repair','Q13_warranty','Q13_wipe','Q13_age','Q13_origin'],
    ['Tình trạng KT','Lịch sử sửa chữa','Còn bảo hành','Đã xóa dữ liệu','Đã dùng bao lâu','Nguồn gốc']
  ).sort((a, b) => b.avg - a.avg);
  Logger.log('Xếp hạng thông tin máy cũ (Q13) — bằng chứng Passport/Data Wipe:');
  q13.forEach((a, i) => Logger.log('   %s. %s: %s', i + 1, a.label, a.avg));

  /* Ma trận Q11 — chốt MVP */
  const q11 = avgOf(
    ['Q11_gps','Q11_sos','Q11_zone','Q11_call','Q11_habit','Q11_app','Q11_ai','Q11_passport'],
    ['GPS','SOS','Safe Zone','Gọi giới hạn','Habit/Reward','Parent App','S.F AI','Watch Passport']
  ).sort((a, b) => b.avg - a.avg);
  Logger.log('Xếp hạng tính năng (Q11) — chốt MVP:');
  q11.forEach((a, i) => Logger.log('   %s. %s: %s', i + 1, a.label, a.avg));
}
