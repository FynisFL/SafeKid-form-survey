# HƯỚNG DẪN GOOGLE APPS SCRIPT — CHI TIẾT

Kết nối form khảo sát SafeKid với Google Sheets để lưu phản hồi.
Thời gian làm: **~10 phút**. Không cần biết lập trình.

---

## 📌 LUỒNG TỔNG QUÁT

```
[Form HTML trên GitHub Pages]
        │  gửi dữ liệu (POST)
        ▼
[Google Apps Script Web App]   ← file Code.gs + columns.gs
        │  ghi từng dòng
        ▼
[Google Sheet "SafeKid Survey Data"]   ← 41 cột
```

---

# BƯỚC 1 — TẠO GOOGLE SHEET

### 1.1. Tạo sheet mới

Mở link này trên trình duyệt:

```
https://sheets.new
```

Google sẽ tự tạo một bảng tính trống.

### 1.2. Đặt tên

Bấm vào chữ **"Untitled spreadsheet"** ở góc trên bên trái → đổi thành:

```
SafeKid Survey Data
```

### 1.3. Copy SPREADSHEET_ID

Nhìn lên thanh địa chỉ, bro sẽ thấy URL dạng:

```
https://docs.google.com/spreadsheets/d/1a2B3c4D5e6F7g8H9i0JkLmN_oPqRsTuVwXyZ/edit#gid=0
                                       └──────────── copy đoạn này ────────────┘
```

**Copy đoạn giữa `/d/` và `/edit`** — đó là SPREADSHEET_ID.

> 💡 Mẹo: đoạn ID này dài khoảng 44 ký tự, gồm chữ hoa, chữ thường, số, gạch dưới và gạch ngang.
> Dán tạm vào Notepad để dùng ở Bước 3.

---

# BƯỚC 2 — MỞ APPS SCRIPT & DÁN CODE

### 2.1. Mở Apps Script

Trong Google Sheet vừa tạo:

```
Menu Extensions  →  Apps Script
```

Một tab mới mở ra với giao diện soạn code.

### 2.2. Xoá code mẫu

Trong file `Code.gs` (đang mở sẵn), bro sẽ thấy:

```javascript
function myFunction() {
}
```

**Chọn hết (Ctrl + A) → Xoá (Delete)** để trống hoàn toàn.

### 2.3. Dán file thứ nhất — Code.gs

1. Mở file `survey/apps-script/Code.gs` trong thư mục dự án
2. Copy **toàn bộ** nội dung
3. Dán vào khung code trống trong Apps Script
4. Bấm **Ctrl + S** để lưu

### 2.4. Tạo file thứ hai — columns.gs

Đây là bước **quan trọng nhất**, nhiều người bỏ sót.

1. Trong Apps Script, nhìn cột bên trái có chữ **Files**
2. Bấm dấu **➕** cạnh chữ "Files"
3. Chọn **Script**
4. Đặt tên file: `columns`
5. Bấm **Enter**

Một file `columns.gs` mới hiện ra, đang trống.

6. Mở file `survey/apps-script/columns.gs` trong thư mục dự án
7. Copy **toàn bộ** nội dung
8. Dán vào file `columns.gs` vừa tạo
9. Bấm **Ctrl + S**

> ⚠️ **Bắt buộc phải có 2 file.** Nếu chỉ dán `Code.gs`, khi chạy sẽ báo lỗi
> `ReferenceError: COLUMNS is not defined`.

### 2.5. Kiểm tra cấu trúc

Cột trái phải hiển thị đúng như này:

```
Files
├── Code.gs        ← đã dán nội dung
└── columns.gs     ← đã dán nội dung
```

---

# BƯỚC 3 — ĐIỀN SPREADSHEET_ID

Trong file `Code.gs`, tìm dòng này (khoảng dòng 20):

```javascript
const SPREADSHEET_ID = '';        // để trống = dùng sheet chứa script này
```

Dán ID đã copy ở Bước 1.3 vào giữa 2 dấu nháy đơn:

```javascript
const SPREADSHEET_ID = '1a2B3c4D5e6F7g8H9i0JkLmN_oPqRsTuVwXyZ';
```

Bấm **Ctrl + S** để lưu.

> 💡 **Có thể để trống.** Vì Apps Script được tạo từ trong Sheet, để trống thì nó tự
> dùng chính Sheet đó. Chỉ cần điền khi bro muốn ghi vào Sheet khác.

---

# BƯỚC 4 — TẠO HEADER (chạy 1 lần)

### 4.1. Chọn hàm

Nhìn thanh công cụ phía trên khung code, có dropdown hiển thị tên hàm.
Bấm vào đó → chọn **`setupSheet`**

### 4.2. Chạy

Bấm nút **▶ Run**

### 4.3. Cấp quyền (lần đầu)

Google sẽ hiện popup **"Authorization required"**:

1. Bấm **Review permissions**
2. Chọn tài khoản Google của bro
3. Sẽ thấy cảnh báo **"Google hasn't verified this app"**
   → Bấm **Advanced** (góc dưới trái)
   → Bấm **Go to SafeKid Survey Data (unsafe)**
   → Bấm **Allow**

> ⚠️ Cảnh báo này là bình thường. Google hiện cảnh báo với **mọi** script tự viết,
> kể cả của chính mình. Đây không phải virus.

### 4.4. Kiểm tra kết quả

Quay lại tab Google Sheet, bro sẽ thấy sheet mới tên **`Responses`** với **41 cột header** tiếng Việt, dòng đầu được tô nền xanh đậm.

Cột đầu tiên là **Thời gian**, cột cuối là **Mã phản hồi**.

> 💡 Nếu không thấy sheet `Responses` → xem phần **Xử lý lỗi** ở cuối.

---

# BƯỚC 5 — DEPLOY THÀNH WEB APP

### 5.1. Mở hộp thoại deploy

Góc trên bên phải Apps Script:

```
Bấm "Deploy"  →  chọn "New deployment"
```

### 5.2. Chọn loại

Bấm icon **⚙️ (bánh răng)** cạnh chữ "Select type" → chọn **Web app**

### 5.3. Cấu hình — QUAN TRỌNG

Điền đúng 4 trường:

| Trường | Giá trị | Ghi chú |
|---|---|---|
| Description | `SafeKid Survey v3` | Tên gợi nhớ, không quan trọng |
| Execute as | **Me (email của bro)** | Bắt buộc |
| Who has access | **Anyone** | ⚠️ Bắt buộc — nếu để "Only myself" form sẽ không gửi được |
| | | |

> 🔴 **Sai "Who has access" là lỗi phổ biến nhất.** Để "Anyone" thì phụ huynh
> ở bất kỳ đâu cũng gửi được. Để "Only myself" thì chỉ bro gửi được.

### 5.4. Deploy

Bấm **Deploy** → chờ vài giây

### 5.5. Copy URL

Hiện ra hộp thoại với **Web app URL** dạng:

```
https://script.google.com/macros/s/AKfycbxXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/exec
```

**Copy toàn bộ URL này.** Đây là ENDPOINT để nối với form.

> ⚠️ URL phải kết thúc bằng **`/exec`**.
> Nếu thấy `/dev` thì đó là link test, không dùng được cho form.

---

# BƯỚC 6 — KIỂM TRA BACKEND CHẠY ĐƯỢC

Dán URL `/exec` vừa copy vào thanh địa chỉ trình duyệt → Enter.

Phải thấy JSON như này:

```json
{
  "status": "ok",
  "service": "SafeKid Survey Backend",
  "version": "3.0 (20 câu)",
  "responses": 0,
  "columns": 41,
  "time": "2026-10-07T09:30:00.000Z"
}
```

**Nếu thấy `"status":"ok"` → backend đã chạy.** ✅

---

# BƯỚC 7 — NỐI FORM VỚI BACKEND

Mở file `survey/survey.js`, tìm dòng 10:

```javascript
const ENDPOINT = '';   // ví dụ: 'https://script.google.com/macros/s/AKfy.../exec'
```

Dán URL vào:

```javascript
const ENDPOINT = 'https://script.google.com/macros/s/AKfycbx.../exec';
```

Lưu file → **push lên GitHub** (file `survey.js`).

---

# BƯỚC 8 — TEST GỬI THẬT

1. Mở form trên GitHub Pages
2. Làm hết 1 lượt khảo sát
3. Bấm **Gửi khảo sát**
4. Thấy màn hình **"Đã gửi thành công!"** kèm mã phản hồi
5. Mở Google Sheet → tab `Responses` → **phải có 1 dòng mới**

> Nếu Sheet không có dòng mới → xem **Xử lý lỗi** bên dưới.

---

# 📊 XEM THỐNG KÊ NHANH

Trong Apps Script, chọn hàm **`summary`** ở dropdown → bấm **▶ Run**

Xem kết quả ở panel **Execution log** phía dưới. Nó in ra:

- Tổng số phản hồi
- Phân bố Purchase Intention (Q19) — **KPI chính**
- Phân bố WTP hardware (Q16)
- **Xếp hạng 6 thông tin máy cũ (Q13)** → bằng chứng Passport / Data Wipe
- **Xếp hạng 8 tính năng (Q11)** → chốt MVP

---

# 🔧 XỬ LÝ LỖI THƯỜNG GẶP

## Lỗi 0 (HAY GẶP NHẤT): `TypeError: Cannot read properties of undefined (reading 'postData')`

**Nguyên nhân:** bro bấm **▶ Run** hàm `doPost` trong Apps Script.

**Đây KHÔNG phải lỗi.** Hàm `doPost` chỉ chạy khi có form gửi dữ liệu tới — nó cần
tham số `e` (request) mà Apps Script chỉ truyền vào khi gọi qua URL `/exec`.
Bấm Run tay thì `e` là `undefined` → báo lỗi này.

**Cách xử lý:**

| Muốn làm gì | Chạy hàm nào |
|---|---|
| Tạo header trong Sheet | **`setupSheet`** |
| Kiểm tra mọi thứ có ổn không | **`diagnose`** |
| Xem thống kê phản hồi | **`summary`** |
| Nhận dữ liệu từ form | ❌ **Đừng chạy tay** — deploy rồi để form tự gửi |

**Bước đúng tiếp theo:**

1. Chọn hàm **`diagnose`** ở dropdown → bấm **▶ Run** → xem Execution log
2. Nếu `diagnose` báo tất cả ✅ → chuyển sang **Bước 5 (Deploy)**
3. Sau khi deploy xong, mở form và bấm Gửi — lúc đó `doPost` mới chạy

> 💡 Nếu vẫn muốn tự kiểm tra `doPost` không cần form, chạy hàm `testDoPost` — t đã
> viết sẵn để giả lập một lượt gửi.

---

## Lỗi 1: `ReferenceError: COLUMNS is not defined`

**Nguyên nhân:** chưa tạo file `columns.gs`

**Cách sửa:**
1. Cột trái Apps Script → bấm **➕** cạnh "Files"
2. Chọn **Script** → đặt tên `columns`
3. Dán nội dung file `survey/apps-script/columns.gs` vào
4. Lưu → chạy lại `setupSheet`

---

## Lỗi 2: Sheet không có dòng mới sau khi submit

**Kiểm tra theo thứ tự:**

1. **`ENDPOINT` đã điền chưa?**
   Mở Console trình duyệt (F12) → tab Console. Nếu thấy dòng chữ
   `DEMO MODE — chưa kết nối backend` thì `ENDPOINT` còn trống.

2. **URL có kết thúc bằng `/exec` không?**
   Nếu là `/dev` → sai link, phải deploy lại.

3. **"Who has access" có phải "Anyone" không?**
   Vào `Deploy → Manage deployments` → kiểm tra lại.

4. **Đã deploy phiên bản mới sau khi sửa code chưa?**
   Sửa code xong phải `Deploy → New deployment` lại. Deploy cũ vẫn chạy code cũ.

5. **Xem sheet `Log`**
   Nếu có sheet tên `Log` với dòng lỗi → copy nội dung lỗi gửi lại để kiểm tra.

---

## Lỗi 3: `Authorization required` lặp lại

**Nguyên nhân:** chưa cấp quyền, hoặc đăng nhập nhầm tài khoản.

**Cách sửa:**
1. Chạy lại hàm `setupSheet`
2. Khi popup hiện → **Review permissions** → chọn tài khoản
3. **Advanced** → **Go to ... (unsafe)** → **Allow**

---

## Lỗi 4: Form báo "Có lỗi khi gửi"

**Nguyên nhân thường gặp:** mở form bằng `file://` (double-click file HTML)

**Cách sửa:** form phải chạy qua `http://` hoặc `https://`:
- Local: `python -m http.server 8787` → mở `http://127.0.0.1:8787/survey/`
- Public: GitHub Pages / Netlify

---

## Lỗi 5: Header hiện `undefined` ở vài cột

**Nguyên nhân:** file `columns.gs` bị cũ, không khớp `survey-schema.js`.

**Cách sửa:**
```bash
cd SafeKid-Prototype
node generate-columns.js      # sinh lại columns.gs
```
Rồi dán lại nội dung mới vào Apps Script.

---

# 🔄 KHI SỬA CÂU HỎI SAU NÀY

Nếu bro thêm/bớt câu trong `survey-schema.js`:

1. Chạy `node generate-columns.js` → sinh `columns.gs` mới
2. Dán lại `columns.gs` vào Apps Script
3. **Xoá sheet `Responses` cũ** (vì số cột thay đổi)
4. Chạy lại `setupSheet` để tạo header mới

> ⚠️ Nếu đã có dữ liệu rồi thì **đừng xoá** — tải CSV về trước, hoặc tạo Sheet mới.

---

# 📥 LẤY DỮ LIỆU RA ĐỂ PHÂN TÍCH

Khi đã thu đủ mẫu:

1. Google Sheet → menu **File → Download → Comma-separated values (.csv)**
2. Import vào **SPSS** — tên biến đã có sẵn theo cột
3. Hoặc mở bằng Excel / Google Sheets để vẽ biểu đồ

### Cột quan trọng nhất

| Cột | Ý nghĩa |
|---|---|
| `Q19` | **Purchase intention** — KPI chính quyết định go/no-go |
| `Q13_wipe` | Bằng chứng **Certified Data Wipe** |
| `Q13_repair` | Bằng chứng **Watch Passport** |
| `Q11_*` | 8 tính năng → chốt MVP |
| `Q16` | WTP hardware → chốt giá Life 1 |
| `Q17` | Phí Premium |
| `Q20` | Lý do không mua |

---

*Nhóm DigiBabi · Cuộc thi Sinh viên Kinh doanh Số 2026 · Nội dung 3*
