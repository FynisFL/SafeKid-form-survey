# KHẢO SÁT SAFEKID — HƯỚNG DẪN TRIỂN KHAI

Form khảo sát 9 phần · 20 câu · ~4–5 phút · N = 150 phụ huynh

---

## 📁 CẤU TRÚC FILE

```
survey/
├── index.html              ← form (mở file này)
├── survey.css              ← giao diện
├── survey-schema.js        ← NỘI DUNG CÂU HỎI (sửa ở đây)
├── survey.js               ← logic render + validate + submit
├── verify-schema.js        ← test tính toàn vẹn schema
├── test-survey.js          ← test end-to-end (39 test)
└── apps-script/
    ├── Code.gs             ← backend Google Sheets
    └── columns.gs          ← 40 cột header (auto-generated)
```

---

## 🚀 BƯỚC 1 — CHẠY THỬ LOCAL

Mở: **http://127.0.0.1:8787/survey/index.html**

> ⚠️ **Không mở trực tiếp bằng `file://`** — sẽ bị chặn CORS khi submit.

Ở chế độ này form chạy **demo**: dữ liệu lưu vào `localStorage`, không gửi đi đâu.

---

## 🔗 BƯỚC 2 — TẠO BACKEND GOOGLE SHEETS

> 📘 **Hướng dẫn chi tiết từng bấm chuột:** xem file **`HUONG-DAN-APPS-SCRIPT.md`**
> (có phần xử lý 5 lỗi thường gặp). Dưới đây là bản tóm tắt.

### 2.1. Tạo Sheet
1. Vào [sheets.new](https://sheets.new) → đặt tên **`SafeKid Survey Data`**
2. Copy **SPREADSHEET_ID** từ URL:
   ```
   docs.google.com/spreadsheets/d/【1AbC...XYZ】/edit
                                    └─ copy đoạn này ─┘
   ```

### 2.2. Mở Apps Script
- Trong Sheet: menu **Extensions → Apps Script**
- Xoá hết code mẫu
- Tạo **2 file** trong Apps Script:
  - `Code.gs` ← dán từ `apps-script/Code.gs`
  - `columns.gs` ← dán từ `apps-script/columns.gs` *(bấm ➕ cạnh "Files" → Script → đặt tên `columns`)*
- Sửa dòng:
  ```javascript
  const SPREADSHEET_ID = '1AbC...XYZ';   // ← dán ID vừa copy
  ```

> ⚠️ Thiếu `columns.gs` sẽ báo lỗi `ReferenceError: COLUMNS is not defined`

### 2.3. Tạo header (chạy 1 lần)
- Trong Apps Script, chọn hàm **`setupSheet`** ở dropdown
- Bấm **▶ Run**
- Cấp quyền khi được hỏi (Advanced → Go to project → Allow)
- Kiểm tra Sheet: đã có 41 cột header tiếng Việt

### 2.4. Deploy
- Bấm **Deploy → New deployment**
- Chọn loại: **Web app**
- Cấu hình:
  |      Trường     |      Giá trị      |
  |-----------------|-------------------|
  |   Description   | SafeKid Survey v1 |
  |   Execute as    |       **Me**      |
  |  Who has access |     **Anyone**    |
- Bấm **Deploy** → copy **Web app URL** (kết thúc bằng `/exec`)

### 2.5. Kiểm tra backend
Dán URL `/exec` vào trình duyệt. Phải thấy:
```json
{"status":"ok","service":"SafeKid Survey Backend","version":"3.0 (20 câu)","responses":0,"columns":41}
```

---

## ⚙️ BƯỚC 3 — NỐI FORM VỚI BACKEND

Mở `survey.js`, sửa dòng đầu:
```javascript
const ENDPOINT = 'https://script.google.com/macros/s/AKfy.../exec';
```
Lưu file → reload form → submit thử 1 lần → kiểm tra Sheet có dòng mới.

---

## 🌐 BƯỚC 4 — DEPLOY PUBLIC

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
node verify-schema.js    # kiểm tra tính toàn vẹn schema + độ phủ mục tiêu DBC
node test-survey.js      # 39 test end-to-end
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
| `Q19` | Purchase intention (1–5) | **KPI chính** — go/no-go |
| `Q16` | WTP hardware | Chốt giá Life 1 |
| `Q17` | Mức phí Premium chấp nhận | Chốt giá subscription |
| `Q11_*` | 8 tính năng (1–5) | Chốt MVP |
| `Q13_wipe` | Quan trọng của "đã xóa dữ liệu chưa" | **Bằng chứng Data Wipe** |
| `Q13_repair` | Quan trọng của "lịch sử sửa chữa" | **Bằng chứng Passport** |
| `Q14` | Chênh lệch giá máy cũ | Chốt giá refurbished |
| `Q20` | Lý do không mua | Xử lý objection |


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
