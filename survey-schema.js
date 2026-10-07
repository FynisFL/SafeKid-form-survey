/* ============================================================
   SAFEKID SURVEY — SCHEMA (BẢN CHỐT 20 CÂU)
   9 phần · 20 câu · ~4–5 phút · N = 150
   Chỉnh câu hỏi ở ĐÂY, không cần đụng survey.js
   ============================================================ */

const LIKERT_5 = ['1','2','3','4','5'];

const SURVEY = {
  meta: {
    title: 'Khảo sát SafeKid',
    subtitle: 'Nghiên cứu nhu cầu thiết bị an toàn cho trẻ em 3–10 tuổi',
    org: 'Nhóm DigiBabi · DBC 2026',
    estTime: '4–5 phút',
    version: '3.0'
  },

  sections: [
    /* ══════════ PHẦN 1 — HỒ SƠ ══════════ */
    {
      id: 'S1',
      name: 'Thông tin cơ bản',
      icon: '👤',
      desc: 'Phần này giúp chúng tôi hiểu bối cảnh gia đình anh/chị.',
      questions: [
        {
          id: 'Q1', type: 'checkbox', required: true,
          text: 'Anh/chị hiện có con trong độ tuổi nào?',
          hint: 'Chọn tất cả độ tuổi phù hợp',
          options: ['Chưa có con', 'Dưới 3 tuổi', '3–5 tuổi', '6–10 tuổi', 'Trên 10 tuổi'],
          screener: { passIfAny: ['3–5 tuổi', '6–10 tuổi'] },
          goal: 'Sàng lọc mẫu đúng target 3–10 tuổi'
        },
        {
          id: 'Q2', type: 'single', required: true,
          text: 'Độ tuổi của anh/chị?',
          options: ['18–24', '25–30', '31–35', '36–40', '41–45', '46+'],
          goal: 'Profile phụ huynh'
        },
        {
          id: 'Q3', type: 'single', required: true,
          text: 'Anh/chị hiện sống ở đâu?',
          options: ['Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Tỉnh / thành phố khác'],
          goal: 'Phân khúc địa lý'
        },
        {
          id: 'Q4', type: 'single', required: true,
          text: 'Thu nhập hộ gia đình mỗi tháng?',
          options: ['Dưới 10 triệu', '10–20 triệu', '20–30 triệu', '30–40 triệu', '40–60 triệu', 'Trên 60 triệu', 'Không muốn trả lời'],
          goal: 'Phân khúc thu nhập → WTP'
        },
        {
          id: 'Q5', type: 'checkbox', required: true,
          text: 'Bé hiện đang dùng thiết bị nào để liên lạc?',
          hint: 'Chọn tất cả phù hợp',
          options: ['Không dùng gì', 'Điện thoại của bố mẹ', 'Điện thoại riêng', 'Smartwatch', 'Máy tính bảng', 'Khác'],
          exclusiveValues: ['Không dùng gì'],
          goal: 'Hiện trạng thiết bị → đối thủ thay thế'
        }
      ]
    },

    /* ══════════ PHẦN 2 — NỖI LO ══════════ */
    {
      id: 'S2',
      name: 'Nỗi lo hiện tại',
      icon: '💭',
      desc: 'Chúng tôi muốn hiểu những lo lắng thật của anh/chị khi con ở ngoài.',
      questions: [
        {
          id: 'Q6', type: 'likert', required: true, scale: LIKERT_5,
          text: 'Khi con ở ngoài mà không có anh/chị bên cạnh, mức độ lo lắng của anh/chị là bao nhiêu?',
          scaleLabels: ['Không lo lắng chút nào', 'Rất lo lắng'],
          goal: 'Đo cường độ pain point'
        },
        {
          id: 'Q7', type: 'checkbox', required: true, max: 3,
          text: 'Tình huống nào khiến anh/chị lo lắng NHẤT?',
          hint: 'Chọn tối đa 3',
          options: ['Con đi lạc', 'Con bị người lạ tiếp cận', 'Không liên lạc được với con', 'Con đi vào khu vực nguy hiểm', 'Con bị bắt nạt', 'Con dùng điện thoại quá nhiều', 'Khác'],
          goal: 'Xác định pain ưu tiên → MVP'
        },
        {
          id: 'Q8', type: 'likert', required: true, scale: LIKERT_5,
          text: 'Anh/chị lo ngại ở mức nào khi cho con dùng smartphone sớm?',
          scaleLabels: ['Không lo', 'Rất lo'],
          goal: 'Kiểm tra giả định "chống smartphone sớm"'
        }
      ]
    },

    /* ══════════ PHẦN 3 — HIỆN TRẠNG ══════════ */
    {
      id: 'S3',
      name: 'Hiện trạng liên lạc',
      icon: '📞',
      desc: 'Về cách anh/chị đang liên lạc với con hiện nay.',
      questions: [
        {
          id: 'Q9', type: 'checkbox', required: true,
          text: 'Hiện tại anh/chị liên lạc với con bằng cách nào?',
          hint: 'Chọn tất cả phù hợp',
          options: ['Gọi qua điện thoại của bố mẹ', 'Con dùng điện thoại riêng', 'Nhờ giáo viên', 'Nhắn tin', 'Không có cách nào', 'Khác'],
          exclusiveValues: ['Không có cách nào'],
          goal: 'Hiện trạng hành vi'
        },
        {
          id: 'Q10', type: 'single', required: true, gate: true,
          text: 'Anh/chị đã từng dùng hoặc cân nhắc mua smartwatch cho bé chưa?',
          options: ['Đang dùng', 'Đã từng dùng', 'Từng cân nhắc nhưng chưa mua', 'Chưa từng biết đến'],
          goal: 'Mức thâm nhập thị trường'
        },
        {
          id: 'Q10a', type: 'checkbox', required: true,
          showIf: { q: 'Q10', in: ['Đang dùng', 'Đã từng dùng'] },
          text: 'Lý do chính anh/chị chọn smartwatch là gì?',
          hint: 'Chọn tất cả phù hợp',
          options: ['Định vị an toàn', 'Gọi điện 2 chiều', 'Hạn chế smartphone', 'Tiện lợi', 'Bé thích', 'Khác'],
          goal: 'Động lực mua'
        },
        {
          id: 'Q10b', type: 'checkbox', required: true,
          showIf: { q: 'Q10', in: ['Từng cân nhắc nhưng chưa mua', 'Chưa từng biết đến'] },
          text: 'Lý do chính anh/chị chưa mua là gì?',
          hint: 'Chọn tất cả phù hợp',
          options: ['Giá cao', 'Chưa thấy cần thiết', 'Lo pin yếu', 'Lo GPS không chính xác', 'Lo quyền riêng tư', 'Sợ bé làm hỏng', 'Phí thuê bao', 'Bé còn nhỏ quá', 'Khác'],
          goal: 'Rào cản mua → xử lý objection'
        }
      ]
    },

    /* ══════════ PHẦN 4 — TÍNH NĂNG ══════════ */
    {
      id: 'S4',
      name: 'Mức độ quan trọng của tính năng',
      icon: '⭐',
      desc: 'Đánh giá từng tính năng theo mức độ quan trọng với gia đình anh/chị.',
      questions: [
        {
          id: 'Q11', type: 'matrix', required: true, scale: LIKERT_5,
          text: 'Đánh giá mức độ QUAN TRỌNG của từng tính năng',
          scaleLabels: ['Không quan trọng', 'Rất quan trọng'],
          rows: [
            { id: 'gps', label: 'Định vị GPS thời gian thực' },
            { id: 'sos', label: 'Nút SOS khẩn cấp' },
            { id: 'zone', label: 'Vùng an toàn (Safe Zone)' },
            { id: 'call', label: 'Gọi điện 2 chiều giới hạn danh bạ' },
            { id: 'habit', label: 'Nhiệm vụ & đổi xu (rèn thói quen)' },
            { id: 'app', label: 'Ứng dụng cho phụ huynh (Parent App)' },
            { id: 'ai', label: 'Trợ lý AI hỗ trợ khách hàng' },
            { id: 'passport', label: 'Hộ chiếu thiết bị (xem lịch sử & tình trạng máy)' }
          ],
          goal: 'CÂU QUAN TRỌNG NHẤT — chốt MVP'
        }
      ]
    },

    /* ══════════ PHẦN 5 — ĐÁNH GIÁ SAFEKID ══════════ */
    {
      id: 'S5',
      name: 'Đánh giá giải pháp SafeKid',
      icon: '💡',
      intro: {
        title: 'Giới thiệu về SafeKid',
        body: 'SafeKid là một hệ sinh thái thiết bị đeo dành cho trẻ em, tập trung vào ba nhóm giá trị:\n\n<b>1. An toàn</b> — định vị, SOS và liên lạc có kiểm soát.\n<b>2. Tự lập</b> — hỗ trợ hình thành thói quen qua nhiệm vụ và phần thưởng.\n<b>3. Bền vững</b> — thiết bị có thể được kiểm định, xóa dữ liệu và tái sử dụng qua nhiều vòng đời thay vì bỏ đi sau một lần dùng.'
      },
      questions: [
        {
          id: 'Q12', type: 'likert', required: true, scale: LIKERT_5,
          text: 'Sau khi đọc mô tả trên, mức độ HỮU ÍCH của giải pháp này với gia đình anh/chị là bao nhiêu?',
          scaleLabels: ['Hoàn toàn không hữu ích', 'Rất hữu ích'],
          goal: 'Solution-Customer Fit'
        }
      ]
    },

    /* ══════════ PHẦN 6 — THIẾT BỊ TÁI SỬ DỤNG ══════════ */
    {
      id: 'S6',
      name: 'Thiết bị đã qua sử dụng & Trade-in',
      icon: '♻️',
      desc: 'SafeKid dự kiến có bán cả thiết bị đã qua sử dụng (đã kiểm định) với giá thấp hơn máy mới. Phần này hỏi ý kiến anh/chị về loại thiết bị đó.',
      questions: [
        {
          id: 'Q13', type: 'matrix', required: true, scale: LIKERT_5,
          text: 'Khi mua thiết bị đã qua sử dụng cho con, mức độ QUAN TRỌNG của từng thông tin sau là bao nhiêu?',
          scaleLabels: ['Không quan trọng', 'Rất quan trọng'],
          rows: [
            { id: 'condition', label: 'Tình trạng kỹ thuật hiện tại' },
            { id: 'repair', label: 'Lịch sử sửa chữa / thay linh kiện' },
            { id: 'warranty', label: 'Còn bảo hành hay không' },
            { id: 'wipe', label: 'Đã xóa sạch dữ liệu chưa' },
            { id: 'age', label: 'Thiết bị đã dùng bao lâu' },
            { id: 'origin', label: 'Nguồn gốc / chính hãng thu hồi' }
          ],
          goal: '★ Chứng minh nhu cầu Watch Passport + Certified Data Wipe (không nhắc tên giải pháp)'
        },
        {
          id: 'Q14', type: 'single', required: true,
          text: 'Giá máy đã qua sử dụng nên rẻ hơn máy mới bao nhiêu là hợp lý?',
          options: ['10–15%', '20–25%', '30–40%', 'Trên 40%', 'Không mua máy cũ ở bất kỳ giá nào'],
          goal: 'Chốt giá Life 2/3 + đo mức chấp nhận refurbished'
        },
        {
          id: 'Q15', type: 'single', required: true,
          text: 'Anh/chị có sẵn sàng gửi trả thiết bị cũ để đổi sang máy mới hoặc nhận ưu đãi không?',
          options: ['Có, rất sẵn sàng', 'Có, nếu ưu đãi hấp dẫn', 'Không chắc', 'Không, giữ lại dùng'],
          goal: 'Trade-in có khả thi'
        }
      ]
    },

    /* ══════════ PHẦN 7 — GIÁ ══════════ */
    {
      id: 'S7',
      name: 'Mức giá & phí dịch vụ',
      icon: '💰',
      desc: 'Về mức giá anh/chị thấy hợp lý.',
      questions: [
        {
          id: 'Q16', type: 'single', required: true,
          text: 'Với thiết bị đeo an toàn cho trẻ có GPS + SOS + gọi 2 chiều, mức giá nào anh/chị thấy HỢP LÝ?',
          options: ['Dưới 500.000đ', '500.000 – 1 triệu', '1 – 1,5 triệu', '1,5 – 2 triệu', '2 – 3 triệu', 'Trên 3 triệu'],
          goal: '★ WTP hardware → chốt giá Life 1 (DBC bắt buộc)'
        },
        {
          id: 'Q17', type: 'single', required: true,
          text: 'Nếu thiết bị cần trả phí hàng tháng cho các tính năng nâng cao (định vị realtime, vùng an toàn, lịch sử vị trí), anh/chị thấy mức nào phù hợp?',
          options: ['Sẵn sàng, khoảng 49.000đ/tháng', 'Sẵn sàng, từ 79.000đ/tháng trở lên', 'Có thể, nếu dưới 29.000đ/tháng', 'Không sẵn sàng trả phí định kỳ'],
          goal: 'Premium intention + mức phí (gộp 1 câu)'
        }
      ]
    },

    /* ══════════ PHẦN 8 — RIÊNG TƯ ══════════ */
    {
      id: 'S8',
      name: 'Quyền riêng tư',
      icon: '🔒',
      desc: 'Về dữ liệu của con.',
      questions: [
        {
          id: 'Q18', type: 'likert', required: true, scale: LIKERT_5,
          text: 'Anh/chị lo ngại ở mức nào về việc dữ liệu vị trí của con được thu thập?',
          scaleLabels: ['Không lo', 'Rất lo'],
          goal: 'Cường độ privacy concern — rủi ro lớn nhất'
        }
      ]
    },

    /* ══════════ PHẦN 9 — KHẢ NĂNG MUA ══════════ */
    {
      id: 'S9',
      name: 'Khả năng mua',
      icon: '🛒',
      desc: 'Đánh giá cuối cùng của anh/chị.',
      questions: [
        {
          id: 'Q19', type: 'likert', required: true, scale: LIKERT_5,
          text: 'Nếu SafeKid có mặt trên thị trường với mức giá hợp lý, anh/chị có cân nhắc mua không?',
          scaleLabels: ['Chắc chắn không', 'Chắc chắn có'],
          goal: '★ PURCHASE INTENTION — KPI chính'
        },
        {
          id: 'Q20', type: 'checkbox', required: true,
          text: 'Lý do chính khiến anh/chị KHÔNG mua là gì?',
          hint: 'Chọn tất cả phù hợp',
          options: ['Giá cao', 'Chưa cần thiết', 'Lo pin yếu', 'Lo GPS kém chính xác', 'Lo quyền riêng tư', 'Bé còn nhỏ', 'Đã có giải pháp khác', 'Không tin sản phẩm mới', 'Khác'],
          goal: 'Rào cản lớn nhất → xử lý objection'
        }
      ]
    }
  ]
};

if (typeof window !== 'undefined') window.SURVEY = SURVEY;
