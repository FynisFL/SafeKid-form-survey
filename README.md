# KHẢO SÁT SAFEKID — HƯỚNG DẪN TRIỂN KHAI

Form khảo sát 12 phần · 61 câu · ~8–12 phút · N = 150 phụ huynh

---

## 📁 CẤU TRÚC FILE

```
survey/
├── index.html              ← form (mở file này)
├── survey.css              ← giao diện
├── survey-schema.js        ← NỘI DUNG CÂU HỎI (sửa ở đây)
├── survey.js               ← logic render + validate + submit
├── verify-schema.js        ← test tính toàn vẹn schema
├── test-survey.js          ← test end-to-end (48 test)
└── apps-script/
    └── Code.gs             ← backend Google Sheets
```

## 🔗 BƯỚC 1 — TẠO BACKEND GOOGLE SHEETS

### 1.1. Tạo Sheet
1. Vào [sheets.new](https://sheets.new) → đặt tên **`SafeKid Survey Data`**
2. Copy **SPREADSHEET_ID** từ URL:
   ```
   docs.google.com/spreadsheets/d/【1AbC...XYZ】/edit
                                    └─ copy đoạn này ─┘
   ```

### 1.2. Mở Apps Script
- Trong Sheet: menu **Extensions → Apps Script**
- Xoá hết code mẫu
- Dán toàn bộ nội dung `apps-script/Code.gs`
- Sửa dòng:
  ```javascript
  const SPREADSHEET_ID = '1AbC...XYZ';   // ← dán ID vừa copy
  ```

### 1.3. Tạo header (chạy 1 lần)
- Trong Apps Script, chọn hàm **`setupSheet`** ở dropdown
- Bấm **▶ Run**
- Cấp quyền khi được hỏi (Advanced → Go to project → Allow)
- Kiểm tra Sheet: đã có 76 cột header tiếng Việt

### 1.4. Deploy
- Bấm **Deploy → New deployment**
- Chọn loại: **Web app**
- Cấu hình:
  | Trường | Giá trị |
  |---|---|
  | Description | SafeKid Survey v1 |
  | Execute as | **Me** |
  | Who has access | **Anyone** |
- Bấm **Deploy** → copy **Web app URL** (kết thúc bằng `/exec`)

### 1.5. Kiểm tra backend
Dán URL `/exec` vào trình duyệt. Phải thấy:
```json
{"status":"ok","service":"SafeKid Survey Backend","version":"1.0","responses":0,"columns":76}
```

---

## ⚙️ BƯỚC 2 — NỐI FORM VỚI BACKEND

Mở `survey.js`, sửa dòng đầu:
```javascript
const ENDPOINT = 'https://script.google.com/macros/s/AKfy.../exec';
```
Lưu file → reload form → submit thử 1 lần → kiểm tra Sheet có dòng mới.

---

## 🌐 BƯỚC 3 — DEPLOY PUBLIC

### Cách A — GitHub Pages (khuyến nghị)
1. Tạo repo mới, ví dụ `safekid-survey`
2. Upload 4 file: `index.html`, `survey.css`, `survey-schema.js`, `survey.js`
3. Settings → Pages → Source: **Deploy from a branch** → `main` → `/ (root)`
4. Link: `https://<username>.github.io/safekid-survey/`

### Cách B — Netlify Drop (nhanh nhất)
1. Vào [app.netlify.com/drop](https://app.netlify.com/drop)
2. Kéo thả **cả thư mục** `survey/`
3. Nhận link ngay lập tức

### Sau khi có link
- Tạo **QR code** từ link → in trên tờ rơi / slide
- Chia sẻ vào group phụ huynh, Zalo, Facebook

---

## 🧪 TEST

```bash
cd survey
node verify-schema.js    # kiểm tra tính toàn vẹn schema
node test-survey.js      # 48 test end-to-end
```

Cả hai phải pass hết trước khi deploy.

---

## 📊 SAU KHI THU ĐỦ MẪU

1. **Google Sheet** → File → Download → **CSV**
2. Import vào **SPSS** — biến đã được mã hoá sẵn theo cột
3. Hoặc phân tích bằng Python/Excel

### Biến chính cần phân tích
| Biến | Ý nghĩa | Dùng cho |
|---|---|---|
| `Q52` | Purchase intention (1–5) | **KPI chính** — go/no-go |
| `Q34` | WTP hardware | Chốt giá Life 1 |
| `Q39` | Mức phí Premium chấp nhận | Chốt giá subscription |
| `Q19_*` | 10 tính năng (1–5) | Chốt MVP |
| `Q29` | Data Wipe quan trọng | Thiết kế quy trình |
| `Q30` | Passport quan trọng | Passport có phải USP |
| `Q31` | Chênh lệch giá Life1/Life2 | Chốt giá refurbished |
| `Q55` | NPS (0–10) | Chỉ số tổng thể |
| `Q54` | Lý do không mua | Xử lý objection |

---

## ⚠️ NGUYÊN TẮC

- **Không sửa dữ liệu** để khớp với concept.
- **Không báo cáo tỷ lệ** không truy được về dataset.
- Nếu kết quả **không ủng hộ** SafeKid → đó vẫn là kết quả đúng, phải báo cáo thật.
- Mọi con số trong report phải truy được về Sheet gốc.

---

## 🔧 SỬA CÂU HỎI

Mở `survey-schema.js`. Mỗi câu có dạng:
```javascript
{
  id: 'Q99',                    // mã câu (đổi thì phải đổi cả Code.gs)
  type: 'single',               // single | checkbox | likert | nps | matrix | ranking | paragraph | short
  required: true,
  text: 'Nội dung câu hỏi?',
  hint: 'Ghi chú nhỏ',          // optional
  options: ['A', 'B', 'C'],
  exclusiveValues: ['Không'],   // optional — chọn cái này sẽ bỏ các cái khác
  max: 3,                       // optional — giới hạn số lựa chọn
  showIf: { q: 'Q15', in: ['A'] },  // optional — chỉ hiện khi điều kiện đúng
  goal: 'Mục tiêu câu hỏi'      // ghi chú nội bộ
}
```

Sau khi sửa, chạy lại `node verify-schema.js` để chắc chắn không lỗi.

---

*Nhóm DigiBabi · Cuộc thi Sinh viên Kinh doanh Số 2026 · Nội dung 3*
