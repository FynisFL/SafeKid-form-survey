/* ============================================================
   SAFEKID SURVEY — SCHEMA
   12 sections · 60 questions · branching logic
   Chỉnh câu hỏi ở ĐÂY, không cần đụng survey.js
   ============================================================ */

const LIKERT_5 = ['1','2','3','4','5'];

const SURVEY = {
  meta: {
    title: 'Khảo sát SafeKid',
    subtitle: 'Nghiên cứu nhu cầu thiết bị an toàn cho trẻ em 3–10 tuổi',
    org: 'Nhóm DigiBabi · DBC 2026',
    estTime: '8–12 phút',
    version: '1.0'
  },

  sections: [
    /* ══════════ SECTION 1 ══════════ */
    {
      id: 'S1',
      name: 'Thông tin cơ bản',
      icon: '👤',
      desc: 'Phần này giúp chúng tôi hiểu bối cảnh gia đình anh/chị.',
      questions: [
        {
          id: 'Q1', type: 'checkbox', required: true, max: null,
          text: 'Anh/chị hiện có con trong độ tuổi nào?',
          hint: 'Chọn tất cả độ tuổi phù hợp',
          options: ['Chưa có con', 'Dưới 3 tuổi', '3–5 tuổi', '6–10 tuổi', 'Trên 10 tuổi'],
          screener: { passIfAny: ['3–5 tuổi', '6–10 tuổi'] },
          goal: 'Sàng lọc mẫu đúng target'
        },
        {
          id: 'Q2', type: 'single', required: true,
          text: 'Anh/chị là ai của bé?',
          options: ['Mẹ', 'Cha', 'Ông bà', 'Người chăm sóc khác'],
          goal: 'Phân tích theo vai trò'
        },
        {
          id: 'Q3', type: 'single', required: true,
          text: 'Độ tuổi của anh/chị?',
          options: ['18–24', '25–30', '31–35', '36–40', '41–45', '46+'],
          goal: 'Profile'
        },
        {
          id: 'Q4', type: 'single', required: true,
          text: 'Anh/chị có bao nhiêu con trong độ tuổi 3–10?',
          options: ['1', '2', '3', '4+'],
          goal: 'Quy mô hộ'
        },
        {
          id: 'Q5', type: 'single', required: true,
          text: 'Anh/chị hiện sống ở đâu?',
          options: ['Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Tỉnh / thành phố khác'],
          goal: 'Phân khúc địa lý'
        },
        {
          id: 'Q6', type: 'single', required: true,
          text: 'Thu nhập hộ gia đình mỗi tháng?',
          options: ['Dưới 10 triệu', '10–20 triệu', '20–30 triệu', '30–40 triệu', '40–60 triệu', 'Trên 60 triệu', 'Không muốn trả lời'],
          goal: 'Phân khúc thu nhập → WTP'
        },
        {
          id: 'Q7', type: 'single', required: true,
          text: 'Bé hiện đang đi học / hoạt động ngoài nhà ở mức nào?',
          options: ['Chưa đi học', 'Bán trú tại trường', 'Học 1 buổi + hoạt động ngoại khoá', 'Chủ yếu ở nhà'],
          goal: 'Mức độ tiếp xúc môi trường ngoài'
        },
        {
          id: 'Q8', type: 'checkbox', required: true,
          text: 'Bé hiện đang dùng thiết bị nào để liên lạc?',
          hint: 'Chọn tất cả phù hợp',
          options: ['Không dùng gì', 'Điện thoại của bố mẹ', 'Điện thoại riêng', 'Smartwatch', 'Máy tính bảng', 'Khác'],
          exclusiveValues: ['Không dùng gì'],
          goal: 'Hiện trạng thiết bị → đối thủ thay thế'
        }
      ]
    },

    /* ══════════ SECTION 2 ══════════ */
    {
      id: 'S2',
      name: 'Nỗi lo hiện tại',
      icon: '💭',
      desc: 'Chúng tôi muốn hiểu những lo lắng thật của anh/chị khi con ở ngoài.',
      questions: [
        {
          id: 'Q9', type: 'likert', required: true, scale: LIKERT_5,
          text: 'Khi con ở ngoài mà không có anh/chị bên cạnh, mức độ lo lắng của anh/chị là bao nhiêu?',
          scaleLabels: ['Không lo lắng chút nào', 'Rất lo lắng'],
          goal: 'Đo cường độ pain point'
        },
        {
          id: 'Q10', type: 'checkbox', required: true, max: 3,
          text: 'Tình huống nào khiến anh/chị lo lắng NHẤT?',
          hint: 'Chọn tối đa 3',
          options: ['Con đi lạc', 'Con bị người lạ tiếp cận', 'Không liên lạc được với con', 'Con đi vào khu vực nguy hiểm', 'Con bị bắt nạt', 'Con dùng điện thoại quá nhiều', 'Khác'],
          goal: 'Xác định pain ưu tiên → MVP'
        },
        {
          id: 'Q11', type: 'likert', required: true, scale: LIKERT_5,
          text: 'Anh/chị lo ngại ở mức nào khi cho con dùng smartphone sớm?',
          scaleLabels: ['Không lo', 'Rất lo'],
          goal: 'Kiểm tra giả định "chống smartphone sớm"'
        },
        {
          id: 'Q12', type: 'checkbox', required: true,
          text: 'Anh/chị lo ngại cụ thể điều gì ở smartphone?',
          hint: 'Chọn tất cả phù hợp',
          options: ['Nghiện game', 'Mạng xã hội', 'Nội dung không phù hợp', 'Cuộc gọi từ số lạ', 'Ảnh hưởng mắt', 'Xao nhãng học tập', 'Chi phí', 'Không lo ngại'],
          exclusiveValues: ['Không lo ngại'],
          goal: 'Chi tiết hoá pain point'
        },
        {
          id: 'Q13', type: 'checkbox', required: true,
          text: 'Hiện tại anh/chị liên lạc với con bằng cách nào?',
          hint: 'Chọn tất cả phù hợp',
          options: ['Gọi qua điện thoại của bố mẹ', 'Con dùng điện thoại riêng', 'Nhờ giáo viên', 'Nhắn tin', 'Không có cách nào', 'Khác'],
          exclusiveValues: ['Không có cách nào'],
          goal: 'Hiện trạng hành vi'
        },
        {
          id: 'Q14', type: 'single', required: true,
          text: 'Anh/chị có hài lòng với cách liên lạc hiện tại không?',
          options: ['Rất hài lòng', 'Hài lòng', 'Bình thường', 'Chưa hài lòng', 'Rất chưa hài lòng'],
          goal: 'Đo khoảng trống giải pháp'
        }
      ]
    },

    /* ══════════ SECTION 3 ══════════ */
    {
      id: 'S3',
      name: 'Kinh nghiệm với thiết bị',
      icon: '⌚',
      desc: 'Về kinh nghiệm của anh/chị với các thiết bị dành cho trẻ.',
      questions: [
        {
          id: 'Q15', type: 'single', required: true, gate: true,
          text: 'Anh/chị đã từng dùng hoặc cân nhắc mua smartwatch cho bé chưa?',
          options: ['Đang dùng', 'Đã từng dùng', 'Từng cân nhắc nhưng chưa mua', 'Chưa từng biết đến'],
          goal: 'Mức thâm nhập thị trường'
        },
        {
          id: 'Q16a', type: 'checkbox', required: true,
          showIf: { q: 'Q15', in: ['Đang dùng', 'Đã từng dùng'] },
          text: 'Lý do chính anh/chị chọn smartwatch là gì?',
          hint: 'Chọn tất cả phù hợp',
          options: ['Định vị an toàn', 'Gọi điện 2 chiều', 'Hạn chế smartphone', 'Tiện lợi', 'Bé thích', 'Khác'],
          goal: 'Động lực mua'
        },
        {
          id: 'Q16b', type: 'checkbox', required: true,
          showIf: { q: 'Q15', in: ['Đang dùng', 'Đã từng dùng'] },
          text: 'Điều gì anh/chị CHƯA hài lòng ở sản phẩm đã dùng?',
          hint: 'Chọn tất cả phù hợp',
          options: ['Pin yếu', 'GPS kém chính xác', 'Độ bền kém', 'Phí thuê bao cao', 'Khó sử dụng', 'Bé không thích', 'Dịch vụ sau bán kém', 'Khác'],
          goal: 'Pain point đối thủ → market gap'
        },
        {
          id: 'Q17', type: 'checkbox', required: true,
          showIf: { q: 'Q15', in: ['Từng cân nhắc nhưng chưa mua', 'Chưa từng biết đến'] },
          text: 'Lý do chính anh/chị chưa mua là gì?',
          hint: 'Chọn tất cả phù hợp',
          options: ['Giá cao', 'Chưa thấy cần thiết', 'Lo pin yếu', 'Lo GPS không chính xác', 'Lo quyền riêng tư', 'Sợ bé làm hỏng', 'Phí thuê bao', 'Bé còn nhỏ quá', 'Khác'],
          goal: 'Rào cản mua → xử lý objection'
        },
        {
          id: 'Q18', type: 'ranking', required: true,
          text: 'Khi quyết định mua thiết bị cho con, anh/chị xếp hạng các yếu tố sau thế nào?',
          hint: 'Kéo hoặc bấm để sắp xếp — quan trọng nhất lên đầu',
          options: ['Giá cả', 'Chất lượng & độ bền', 'Tính năng an toàn', 'Thương hiệu', 'Dịch vụ sau bán'],
          goal: 'Tiêu chí quyết định mua'
        }
      ]
    },

    /* ══════════ SECTION 4 ══════════ */
    {
      id: 'S4',
      name: 'Mức độ quan trọng của tính năng',
      icon: '⭐',
      desc: 'Đánh giá từng tính năng theo mức độ quan trọng với gia đình anh/chị.',
      questions: [
        {
          id: 'Q19', type: 'matrix', required: true, scale: LIKERT_5,
          text: 'Đánh giá mức độ QUAN TRỌNG của từng tính năng',
          scaleLabels: ['Không quan trọng', 'Rất quan trọng'],
          rows: [
            { id: 'gps', label: 'Định vị GPS thời gian thực' },
            { id: 'sos', label: 'Nút SOS khẩn cấp' },
            { id: 'zone', label: 'Vùng an toàn (Safe Zone)' },
            { id: 'call', label: 'Gọi điện 2 chiều giới hạn danh bạ' },
            { id: 'remind', label: 'Nhắc nhở / quản lý thời gian' },
            { id: 'habit', label: 'Nhiệm vụ & đổi xu (Habit / Reward)' },
            { id: 'app', label: 'Ứng dụng cho phụ huynh (Parent App)' },
            { id: 'ai', label: 'Trợ lý AI hỗ trợ (S.F AI)' },
            { id: 'passport', label: 'Hộ chiếu thiết bị (Watch Passport)' },
            { id: 'tradein', label: 'Thu đổi thiết bị cũ (Trade-in)' }
          ],
          goal: 'Câu quan trọng nhất — chốt MVP'
        },
        {
          id: 'Q20', type: 'checkbox', required: true, max: 3,
          text: 'Trong các tính năng trên, hãy chọn 3 tính năng anh/chị cho là QUAN TRỌNG NHẤT',
          hint: 'Chọn tối đa 3',
          options: ['Định vị GPS thời gian thực', 'Nút SOS khẩn cấp', 'Vùng an toàn (Safe Zone)', 'Gọi điện 2 chiều giới hạn danh bạ', 'Nhắc nhở / quản lý thời gian', 'Nhiệm vụ & đổi xu', 'Ứng dụng cho phụ huynh', 'Trợ lý AI hỗ trợ', 'Hộ chiếu thiết bị (Watch Passport)', 'Thu đổi thiết bị cũ (Trade-in)'],
          goal: 'Ưu tiên tuyệt đối → USP'
        },
        {
          id: 'Q21', type: 'single', required: true,
          text: 'Anh/chị có sẵn sàng trả thêm tiền cho tính năng "hình thành thói quen cho trẻ" không?',
          options: ['Có, sẵn sàng', 'Có thể, nếu giá hợp lý', 'Không, nên miễn phí', 'Không quan tâm tính năng này'],
          goal: 'Đo giá trị lớp Growth'
        }
      ]
    },

    /* ══════════ SECTION 5 ══════════ */
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
          id: 'Q22', type: 'likert', required: true, scale: LIKERT_5,
          text: 'Sau khi đọc mô tả trên, mức độ HỮU ÍCH của giải pháp này với gia đình anh/chị là bao nhiêu?',
          scaleLabels: ['Hoàn toàn không hữu ích', 'Rất hữu ích'],
          goal: 'Solution-Customer Fit'
        },
        {
          id: 'Q23', type: 'checkbox', required: true, max: 2,
          text: 'Điểm nào HẤP DẪN NHẤT với anh/chị?',
          hint: 'Chọn tối đa 2',
          options: ['Nhóm An toàn', 'Nhóm Tự lập (thói quen)', 'Nhóm Bền vững (tái sử dụng)', 'Giá dự kiến', 'Thiết kế & văn hoá (12 con giáp)', 'Ứng dụng phụ huynh'],
          goal: 'Value proposition mạnh nhất'
        },
        {
          id: 'Q24', type: 'checkbox', required: true,
          text: 'Điểm nào CHƯA THUYẾT PHỤC anh/chị?',
          hint: 'Chọn tất cả phù hợp',
          options: ['Chưa rõ khác gì đối thủ', 'Quá nhiều tính năng, phức tạp', 'Lo pin yếu', 'Lo giá cao', 'Lo quyền riêng tư', 'Không tin chất lượng', 'Chưa cần thiết', 'Khác'],
          goal: 'Objection chính → pitch'
        },
        {
          id: 'Q25', type: 'checkbox', required: true,
          text: 'Anh/chị sẽ cân nhắc điều gì TRƯỚC KHI mua?',
          hint: 'Chọn tất cả phù hợp',
          options: ['Xem sản phẩm thật', 'Đọc đánh giá người dùng', 'So sánh với thương hiệu khác', 'Hỏi ý kiến bạn bè / người thân', 'Thử dùng trước', 'Khác'],
          goal: 'Xây trust journey'
        }
      ]
    },

    /* ══════════ SECTION 6 ══════════ */
    {
      id: 'S6',
      name: 'Thiết bị tái sử dụng & Trade-in',
      icon: '♻️',
      desc: 'Về mô hình thiết bị được kiểm định và tái sử dụng.',
      intro: {
        title: 'Mô hình vòng đời SafeKid',
        body: 'SafeKid dự kiến cho phép một thiết bị được <b>thu hồi (Trade-in)</b>, kiểm định, xóa sạch dữ liệu và tái sử dụng cho một trẻ khác dưới dạng <b>"Certified Refurbished"</b> — với mức giá dễ tiếp cận hơn máy mới.\n\nMỗi thiết bị có một <b>Watch Passport</b> ghi nhận trạng thái kỹ thuật, lịch sử kiểm định và bảo hành.\n\n<i>Watch Passport theo dõi THIẾT BỊ, không lưu danh tính hay dữ liệu của trẻ.</i>'
      },
      questions: [
        {
          id: 'Q26', type: 'single', required: true,
          text: 'Anh/chị có sẵn sàng mua thiết bị đã qua sử dụng (đã kiểm định, xóa dữ liệu) với giá thấp hơn máy mới không?',
          options: ['Sẵn sàng', 'Có thể, nếu được bảo đảm', 'Chỉ mua máy mới', 'Không bao giờ mua máy cũ'],
          goal: 'Thị trường refurbished có tồn tại'
        },
        {
          id: 'Q27', type: 'checkbox', required: true, max: 3,
          text: 'Điều gì khiến anh/chị TIN TƯỞNG một thiết bị đã qua sử dụng?',
          hint: 'Chọn tối đa 3',
          options: ['Có chứng nhận kiểm định', 'Có giấy xác nhận xóa dữ liệu', 'Bảo hành rõ ràng', 'Chính hãng thu hồi', 'Có thể kiểm tra tình trạng thiết bị', 'Giá rẻ hơn đáng kể', 'Khác'],
          goal: 'Điều kiện trust'
        },
        {
          id: 'Q28', type: 'checkbox', required: true,
          text: 'Điều gì khiến anh/chị KHÔNG tin tưởng?',
          hint: 'Chọn tất cả phù hợp',
          options: ['Sợ dữ liệu cũ còn sót lại', 'Sợ thiết bị nhanh hỏng', 'Không rõ nguồn gốc', 'Không có bảo hành', 'Bé dùng thiết bị cũ thấy không thoải mái', 'Khác'],
          goal: 'Rào cản tâm lý'
        },
        {
          id: 'Q29', type: 'likert', required: true, scale: LIKERT_5,
          text: 'Mức độ QUAN TRỌNG của "Giấy xác nhận xóa dữ liệu" (Certified Data Wipe) khi mua thiết bị đã qua sử dụng?',
          scaleLabels: ['Không quan trọng', 'Cực kỳ quan trọng'],
          goal: 'Data Wipe có phải điều kiện bắt buộc'
        },
        {
          id: 'Q30', type: 'likert', required: true, scale: LIKERT_5,
          text: 'Mức độ QUAN TRỌNG của "Hộ chiếu thiết bị" (Watch Passport) — nơi xem trạng thái và lịch sử kiểm định?',
          scaleLabels: ['Không quan trọng', 'Cực kỳ quan trọng'],
          goal: 'Passport có đáng là USP'
        },
        {
          id: 'Q31', type: 'single', required: true,
          text: 'Giá máy đã qua sử dụng nên rẻ hơn máy mới bao nhiêu là hợp lý?',
          options: ['10–15%', '20–25%', '30–40%', 'Trên 40%', 'Không mua máy cũ ở bất kỳ giá nào'],
          goal: 'Chốt giá Life 2/3'
        },
        {
          id: 'Q32', type: 'single', required: true,
          text: 'Anh/chị có sẵn sàng gửi trả thiết bị cũ để đổi sang máy mới hoặc nhận ưu đãi không?',
          options: ['Có, rất sẵn sàng', 'Có, nếu ưu đãi hấp dẫn', 'Không chắc', 'Không, giữ lại dùng'],
          goal: 'Trade-in có khả thi'
        },
        {
          id: 'Q33', type: 'single', required: true,
          text: 'Hình thức Trade-in anh/chị thấy thuận tiện nhất?',
          options: ['Mang đến cửa hàng / chi nhánh', 'Gửi qua bưu điện / đơn vị vận chuyển', 'Nhân viên đến tận nhà', 'Khác'],
          goal: 'Thiết kế quy trình'
        }
      ]
    },

    /* ══════════ SECTION 7 ══════════ */
    {
      id: 'S7',
      name: 'Mức giá hợp lý',
      icon: '💰',
      desc: 'Về mức giá anh/chị thấy hợp lý cho một thiết bị đeo an toàn cho trẻ.',
      questions: [
        {
          id: 'Q34', type: 'single', required: true,
          text: 'Với thiết bị đeo an toàn cho trẻ có GPS + SOS + gọi 2 chiều, mức giá nào anh/chị thấy HỢP LÝ?',
          options: ['Dưới 500.000đ', '500.000 – 1 triệu', '1 – 1,5 triệu', '1,5 – 2 triệu', '2 – 3 triệu', 'Trên 3 triệu'],
          goal: 'WTP cơ bản'
        },
        {
          id: 'Q35', type: 'single', required: true,
          text: 'Ở mức giá nào anh/chị thấy QUÁ ĐẮT, không cân nhắc mua?',
          options: ['Trên 1 triệu', 'Trên 1,5 triệu', 'Trên 2 triệu', 'Trên 3 triệu', 'Trên 5 triệu'],
          goal: 'Ngưỡng chặn trên'
        },
        {
          id: 'Q36', type: 'single', required: true,
          text: 'Ở mức giá nào anh/chị thấy QUÁ RẺ, nghi ngờ chất lượng?',
          options: ['Dưới 300.000đ', 'Dưới 500.000đ', 'Dưới 800.000đ', 'Dưới 1 triệu', 'Không có ngưỡng này'],
          goal: 'Ngưỡng chặn dưới'
        },
        {
          id: 'Q37', type: 'single', required: true,
          text: 'Anh/chị dự kiến mua thiết bị này khi nào?',
          options: ['Ngay khi ra mắt', 'Trong 3 tháng tới', 'Trong 6–12 tháng', 'Khi bé lớn hơn', 'Chưa có kế hoạch'],
          goal: 'Timeline mua → roadmap'
        }
      ]
    },

    /* ══════════ SECTION 8 ══════════ */
    {
      id: 'S8',
      name: 'Phí dịch vụ hàng tháng',
      icon: '🔄',
      desc: 'Về khả năng trả phí cho các tính năng nâng cao.',
      questions: [
        {
          id: 'Q38', type: 'single', required: true, gate: true,
          text: 'Nếu thiết bị cần trả phí hàng tháng cho các tính năng nâng cao (định vị realtime, vùng an toàn, lịch sử vị trí), anh/chị có sẵn sàng trả không?',
          options: ['Sẵn sàng', 'Có thể', 'Không sẵn sàng', 'Phải miễn phí hoàn toàn'],
          goal: 'Premium intention'
        },
        {
          id: 'Q39', type: 'single', required: true,
          showIf: { q: 'Q38', in: ['Sẵn sàng', 'Có thể'] },
          text: 'Mức phí hàng tháng anh/chị chấp nhận được?',
          options: ['19.000đ', '29.000đ', '49.000đ', '79.000đ', 'Trên 99.000đ'],
          goal: 'Chốt giá Premium'
        },
        {
          id: 'Q40', type: 'single', required: true,
          text: 'Anh/chị thích trả theo hình thức nào?',
          options: ['Theo tuần', 'Theo tháng', 'Theo năm (rẻ hơn)', 'Trả 1 lần cho nhiều năm', 'Không muốn trả phí định kỳ'],
          goal: 'Cấu trúc gói'
        },
        {
          id: 'Q41', type: 'checkbox', required: true, max: 3,
          text: 'Tính năng nào anh/chị thấy ĐÁNG TRẢ TIỀN NHẤT?',
          hint: 'Chọn tối đa 3',
          options: ['Định vị realtime', 'Vùng an toàn', 'Lịch sử vị trí', 'Nhiệm vụ & đổi xu', 'Cảnh báo tháo thiết bị', 'Chế độ lớp học', 'Phân tích giấc ngủ', 'Khác'],
          goal: 'Đặt paywall đúng chỗ'
        },
        {
          id: 'Q42', type: 'single', required: true,
          text: 'Anh/chị có sẵn sàng mua gói dài hạn (1 năm) nếu được giảm giá không?',
          options: ['Có, nếu giảm 20%+', 'Có, nếu giảm 10–15%', 'Không, thích trả ngắn hạn', 'Không quan tâm'],
          goal: 'Chiến lược gói năm'
        }
      ]
    },

    /* ══════════ SECTION 9 ══════════ */
    {
      id: 'S9',
      name: 'Quyền riêng tư & dữ liệu trẻ',
      icon: '🔒',
      desc: 'Về mức độ quan tâm của anh/chị đến dữ liệu của con.',
      questions: [
        {
          id: 'Q43', type: 'likert', required: true, scale: LIKERT_5,
          text: 'Anh/chị lo ngại ở mức nào về việc dữ liệu vị trí của con được thu thập?',
          scaleLabels: ['Không lo', 'Rất lo'],
          goal: 'Cường độ privacy concern'
        },
        {
          id: 'Q44', type: 'checkbox', required: true,
          text: 'Anh/chị lo ngại cụ thể điều gì?',
          hint: 'Chọn tất cả phù hợp',
          options: ['Ai có thể xem vị trí con', 'Dữ liệu bị bán cho bên thứ ba', 'Bị hack', 'Không rõ lưu bao lâu', 'Con bị theo dõi quá mức', 'Không lo ngại'],
          exclusiveValues: ['Không lo ngại'],
          goal: 'Chi tiết concern'
        },
        {
          id: 'Q45', type: 'likert', required: true, scale: LIKERT_5,
          text: 'Mức độ quan trọng của việc "dữ liệu con được xoá hoàn toàn khi không dùng nữa"?',
          scaleLabels: ['Không quan trọng', 'Cực kỳ quan trọng'],
          goal: 'Data Wipe ở góc privacy'
        },
        {
          id: 'Q46', type: 'single', required: true,
          text: 'Nếu phải chọn, anh/chị ưu tiên điều nào hơn?',
          options: ['Tính năng an toàn đầy đủ (dù thu nhiều dữ liệu)', 'Quyền riêng tư tối đa (dù ít tính năng)', 'Cân bằng cả hai'],
          goal: 'Trade-off an toàn vs privacy'
        },
        {
          id: 'Q47', type: 'single', required: true,
          text: 'Anh/chị có muốn kiểm soát được ai xem được vị trí của con không?',
          options: ['Rất muốn', 'Có, nếu dễ cài đặt', 'Không quan trọng', 'Không cần'],
          goal: 'Tính năng permission control'
        }
      ]
    },

    /* ══════════ SECTION 10 ══════════ */
    {
      id: 'S10',
      name: 'Trợ lý AI hỗ trợ',
      icon: '🤖',
      desc: 'Về trợ lý AI hỗ trợ khách hàng.',
      intro: {
        title: 'Về S.F AI',
        body: 'SafeKid dự kiến có trợ lý AI <b>(S.F AI)</b> hỗ trợ khách hàng 24/7: giải đáp thắc mắc, tư vấn sản phẩm, hướng dẫn sử dụng.\n\nVới các vấn đề phức tạp (bảo hành, kỹ thuật), khách hàng được chuyển sang <b>nhân viên thật</b>.\n\n<i>S.F AI không xử lý tình huống khẩn cấp.</i>'
      },
      questions: [
        {
          id: 'Q48', type: 'likert', required: true, scale: LIKERT_5,
          text: 'Mức độ HỮU ÍCH của trợ lý AI hỗ trợ khách hàng 24/7 với anh/chị?',
          scaleLabels: ['Không hữu ích', 'Rất hữu ích'],
          goal: 'AI value'
        },
        {
          id: 'Q49', type: 'likert', required: true, scale: LIKERT_5,
          text: 'Mức độ TIN TƯỞNG của anh/chị vào câu trả lời của AI?',
          scaleLabels: ['Hoàn toàn không tin', 'Rất tin'],
          goal: 'AI trust'
        },
        {
          id: 'Q50', type: 'likert', required: true, scale: LIKERT_5,
          text: 'Anh/chị lo ngại AI tư vấn sai ở mức nào?',
          scaleLabels: ['Không lo', 'Rất lo'],
          goal: 'Risk của AI'
        },
        {
          id: 'Q51', type: 'checkbox', required: true,
          text: 'Khi nào anh/chị MUỐN gặp nhân viên thật thay vì AI?',
          hint: 'Chọn tất cả phù hợp',
          options: ['Khi hỏi về bảo hành', 'Khi có vấn đề kỹ thuật', 'Khi quyết định mua', 'Khi AI trả lời không rõ', 'Khi cần giải quyết gấp', 'Luôn muốn gặp người thật'],
          goal: 'Thiết kế human handoff'
        }
      ]
    },

    /* ══════════ SECTION 11 ══════════ */
    {
      id: 'S11',
      name: 'Khả năng mua',
      icon: '🛒',
      desc: 'Đánh giá cuối cùng của anh/chị.',
      questions: [
        {
          id: 'Q52', type: 'likert', required: true, scale: LIKERT_5,
          text: 'Nếu SafeKid có mặt trên thị trường với mức giá hợp lý, anh/chị có cân nhắc mua không?',
          scaleLabels: ['Chắc chắn không', 'Chắc chắn có'],
          goal: 'PURCHASE INTENTION — KPI chính'
        },
        {
          id: 'Q53', type: 'checkbox', required: true, max: 3,
          text: 'Lý do chính anh/chị CÓ THỂ mua là gì?',
          hint: 'Chọn tối đa 3',
          options: ['An toàn cho con', 'Hạn chế smartphone', 'Rèn thói quen', 'Thiết kế đẹp', 'Bé thích', 'Giá hợp lý', 'Thương hiệu tin cậy', 'Bền vững, thân thiện môi trường', 'Khác'],
          goal: 'Động lực mua'
        },
        {
          id: 'Q54', type: 'checkbox', required: true,
          text: 'Lý do chính khiến anh/chị KHÔNG mua là gì?',
          hint: 'Chọn tất cả phù hợp',
          options: ['Giá cao', 'Chưa cần thiết', 'Lo pin yếu', 'Lo GPS kém chính xác', 'Lo quyền riêng tư', 'Bé còn nhỏ', 'Đã có giải pháp khác', 'Không tin sản phẩm mới', 'Khác'],
          goal: 'Rào cản lớn nhất'
        },
        {
          id: 'Q55', type: 'nps', required: true, scale: ['0','1','2','3','4','5','6','7','8','9','10'],
          text: 'Anh/chị sẽ giới thiệu SafeKid cho bạn bè / người thân ở mức nào?',
          scaleLabels: ['Chắc chắn không', 'Chắc chắn có'],
          goal: 'NPS sơ bộ'
        }
      ]
    },

    /* ══════════ SECTION 12 ══════════ */
    {
      id: 'S12',
      name: 'Chia sẻ thêm',
      icon: '💬',
      desc: 'Phần cuối — anh/chị có thể chia sẻ tự do. Tất cả đều không bắt buộc.',
      questions: [
        {
          id: 'Q56', type: 'paragraph', required: false,
          text: 'Nếu được thay đổi MỘT điều ở thiết bị đeo cho trẻ, anh/chị muốn thay đổi gì?',
          goal: 'Insight mở'
        },
        {
          id: 'Q57', type: 'paragraph', required: false,
          text: 'Anh/chị thấy thiếu tính năng gì ở các sản phẩm hiện có trên thị trường?',
          goal: 'Market gap'
        },
        {
          id: 'Q58', type: 'paragraph', required: false,
          text: 'Điều gì khiến anh/chị lo lắng nhất khi cho con dùng thiết bị đeo?',
          goal: 'Risk chưa lường'
        },
        {
          id: 'Q59', type: 'paragraph', required: false,
          text: 'Anh/chị sẽ mô tả SafeKid bằng một câu như thế nào?',
          goal: 'Kiểm tra positioning'
        },
        {
          id: 'Q60', type: 'short', required: false,
          text: 'Nếu muốn nhận kết quả khảo sát hoặc tham gia thử nghiệm sản phẩm, để lại liên hệ',
          hint: 'Không bắt buộc — email hoặc số điện thoại',
          goal: 'Recruit cho user testing'
        }
      ]
    }
  ]
};

if (typeof window !== 'undefined') window.SURVEY = SURVEY;
