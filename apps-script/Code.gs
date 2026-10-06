/**
 * ══════════════════════════════════════════════════════════
 *  SAFEKID SURVEY — GOOGLE APPS SCRIPT BACKEND
 *  Nhận dữ liệu từ web form → ghi vào Google Sheet
 * ══════════════════════════════════════════════════════════
 *
 *  CÁCH DÙNG:
 *  1. Tạo Google Sheet mới, đặt tên: "SafeKid Survey Data"
 *  2. Menu Extensions → Apps Script
 *  3. Xoá code mẫu, dán toàn bộ file này vào
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

/* ══════ CỘT — khớp đúng thứ tự survey-schema.js ══════ */
const COLUMNS = [
  'timestamp', 'duration_sec', 'version', 'source',
  /* S1 */ 'Q1','Q2','Q3','Q4','Q5','Q6','Q7','Q8',
  /* S2 */ 'Q9','Q10','Q11','Q12','Q13','Q14',
  /* S3 */ 'Q15','Q16a','Q16b','Q17','Q18',
  /* S4 */ 'Q19_gps','Q19_sos','Q19_zone','Q19_call','Q19_remind','Q19_habit','Q19_app','Q19_ai','Q19_passport','Q19_tradein',
           'Q20','Q21',
  /* S5 */ 'Q22','Q23','Q24','Q25',
  /* S6 */ 'Q26','Q27','Q28','Q29','Q30','Q31','Q32','Q33',
  /* S7 */ 'Q34','Q35','Q36','Q37',
  /* S8 */ 'Q38','Q39','Q40','Q41','Q42',
  /* S9 */ 'Q43','Q44','Q45','Q46','Q47',
  /* S10 */ 'Q48','Q49','Q50','Q51',
  /* S11 */ 'Q52','Q53','Q54','Q55',
  /* S12 */ 'Q56','Q57','Q58','Q59','Q60'
];

/* Nhãn tiếng Việt cho header (dễ đọc khi phân tích) */
const HEADERS_VI = {
  timestamp: 'Thời gian', duration_sec: 'Thời lượng (giây)', version: 'Phiên bản', source: 'Nguồn',
  Q1: 'S1-Tuổi con', Q2: 'S1-Vai trò', Q3: 'S1-Tuổi PH', Q4: 'S1-Số con', Q5: 'S1-Khu vực',
  Q6: 'S1-Thu nhập', Q7: 'S1-Tình trạng đi học', Q8: 'S1-Thiết bị đang dùng',
  Q9: 'S2-Mức lo lắng', Q10: 'S2-Tình huống lo nhất', Q11: 'S2-Lo smartphone sớm',
  Q12: 'S2-Lo ngại cụ thể', Q13: 'S2-Cách liên lạc', Q14: 'S2-Hài lòng hiện tại',
  Q15: 'S3-Kinh nghiệm smartwatch', Q16a: 'S3-Lý do mua', Q16b: 'S3-Chưa hài lòng',
  Q17: 'S3-Lý do chưa mua', Q18: 'S3-Xếp hạng tiêu chí',
  Q19_gps: 'S4-GPS', Q19_sos: 'S4-SOS', Q19_zone: 'S4-Safe Zone', Q19_call: 'S4-Gọi giới hạn',
  Q19_remind: 'S4-Nhắc nhở', Q19_habit: 'S4-Habit/Reward', Q19_app: 'S4-Parent App',
  Q19_ai: 'S4-S.F AI', Q19_passport: 'S4-Watch Passport', Q19_tradein: 'S4-Trade-in',
  Q20: 'S4-Top 3 tính năng', Q21: 'S4-Trả thêm cho Habit',
  Q22: 'S5-Hữu ích', Q23: 'S5-Hấp dẫn nhất', Q24: 'S5-Chưa thuyết phục', Q25: 'S5-Cân nhắc trước mua',
  Q26: 'S6-Sẵn sàng máy cũ', Q27: 'S6-Điều tin tưởng', Q28: 'S6-Điều không tin',
  Q29: 'S6-Data Wipe quan trọng', Q30: 'S6-Passport quan trọng', Q31: 'S6-Chênh lệch giá',
  Q32: 'S6-Sẵn sàng Trade-in', Q33: 'S6-Hình thức Trade-in',
  Q34: 'S7-Giá hợp lý', Q35: 'S7-Quá đắt', Q36: 'S7-Quá rẻ', Q37: 'S7-Thời điểm mua',
  Q38: 'S8-Sẵn sàng trả phí', Q39: 'S8-Mức phí tháng', Q40: 'S8-Hình thức trả',
  Q41: 'S8-Đáng trả tiền nhất', Q42: 'S8-Gói năm',
  Q43: 'S9-Lo dữ liệu vị trí', Q44: 'S9-Lo ngại cụ thể', Q45: 'S9-Xoá dữ liệu quan trọng',
  Q46: 'S9-Ưu tiên an toàn/privacy', Q47: 'S9-Muốn kiểm soát quyền',
  Q48: 'S10-AI hữu ích', Q49: 'S10-AI tin tưởng', Q50: 'S10-Lo AI sai', Q51: 'S10-Khi cần người thật',
  Q52: 'S11-PURCHASE INTENTION', Q53: 'S11-Lý do mua', Q54: 'S11-Lý do không mua', Q55: 'S11-NPS',
  Q56: 'S12-Thay đổi gì', Q57: 'S12-Thiếu tính năng', Q58: 'S12-Lo lắng nhất',
  Q59: 'S12-Mô tả SafeKid', Q60: 'S12-Liên hệ'
};

/* ══════ ENTRY POINTS ══════ */

/** Nhận dữ liệu từ form */
function doPost(e) {
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

    /* Thêm mã phản hồi + thời điểm nhận */
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
    version: '1.0',
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

  /* format header */
  const range = sheet.getRange(1, 1, 1, headers.length);
  range.setFontWeight('bold')
       .setBackground('#0b1220')
       .setFontColor('#00d4ff')
       .setVerticalAlignment('middle');
  sheet.setFrozenRows(1);
  sheet.setRowHeight(1, 34);
  sheet.setColumnWidths(1, headers.length, 130);
  sheet.setColumnWidth(1, 165);
  sheet.setColumnWidth(2, 110);
}

function logError(err, e) {
  try {
    const ss = getSpreadsheet();
    const log = getOrCreateSheet(ss, LOG_SHEET_NAME, false);
    if (log.getLastRow() === 0) log.appendRow(['Thời gian', 'Lỗi', 'Payload']);
    log.appendRow([new Date().toISOString(), String(err), e?.postData?.contents?.slice(0, 500) || '']);
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

/** Xem nhanh thống kê */
function summary() {
  const sheet = getOrCreateSheet(getSpreadsheet(), SHEET_NAME, true);
  const n = Math.max(0, sheet.getLastRow() - 1);
  const rows = n ? sheet.getRange(2, 1, n, COLUMNS.length).getValues() : [];
  Logger.log('Tổng phản hồi: %s', n);
  if (!n) return;

  /* đếm purchase intention Q52 (cột index) */
  const iQ52 = COLUMNS.indexOf('Q52');
  const dist = {};
  rows.forEach(r => { const v = r[iQ52]; dist[v] = (dist[v] || 0) + 1; });
  Logger.log('Phân bố Purchase Intention (Q52): %s', JSON.stringify(dist));

  const iQ34 = COLUMNS.indexOf('Q34');
  const dist34 = {};
  rows.forEach(r => { const v = r[iQ34]; dist34[v] = (dist34[v] || 0) + 1; });
  Logger.log('Phân bố WTP hardware (Q34): %s', JSON.stringify(dist34));
}
