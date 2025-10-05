
export const LEVELS = {
  'Level 1 - Survival (A1-A2)': 'Người mới bắt đầu',
  'Level 2 - Functional (B1)': 'Giao tiếp cơ bản',
  'Level 3 - Professional (B2)': 'Giao tiếp công việc',
  'Level 4 - Fluent (C1)': 'Thành thạo',
  'Level 5 - Native-like (C2)': 'Như người bản xứ',
};

export const TOPICS = {
  'CUỘC SỐNG HÀNG NGÀY': [
    'Giới thiệu & Làm quen', 'Gia đình & Mối quan hệ', 'Nhà ở & Sinh hoạt', 'Mua sắm', 'Ăn uống', 'Giao thông', 'Sức khỏe', 'Du lịch', 'Giải trí', 'Thời tiết & Môi trường',
  ],
  'HỌC TẬP & PHÁT TRIỂN': [
    'Trường học & Giáo dục', 'Thi cử & Chứng chỉ', 'Học online & Công nghệ', 'Đọc sách & Nghiên cứu', 'Thuyết trình & Báo cáo', 'Thảo luận nhóm', 'Phỏng vấn học bổng', 'Viết luận văn & Paper',
  ],
  'CÔNG VIỆC & SỰ NGHIỆP': [
    'Phỏng vấn xin việc', 'CV & Cover letter', 'Họp & Meeting', 'Email & Giao tiếp công việc', 'Thương lượng & Đàm phán', 'Quản lý & Lãnh đạo', 'Làm việc nhóm & Collaboration', 'Khách hàng & Dịch vụ', 'Báo cáo tiến độ', 'Đánh giá hiệu suất', 'Xin nghỉ phép & Xử lý vấn đề', 'Networking & Mối quan hệ nghề nghiệp',
  ],
  'CHUYÊN MÔN (Theo ngành)': [
    'Công nghệ thông tin', 'Marketing & Sales', 'Tài chính & Kế toán', 'Y tế & Dược', 'Kỹ thuật & Xây dựng', 'Luật & Pháp lý', 'Nghệ thuật & Thiết kế', 'Khoa học & Nghiên cứu', 'Giáo dục & Đào tạo', 'Logistics & Vận tải',
  ],
  'XÃ HỘI & VĂN HÓA': [
    'Tin tức & Thời sự', 'Chính trị & Kinh tế', 'Văn hóa & Lịch sử', 'Tranh luận & Phân tích', 'Xu hướng xã hội', 'Vấn đề môi trường', 'Công nghệ & Tương lai', 'Nghệ thuật & Văn học', 'Tôn giáo & Triết học', 'Small talk & Chit-chat',
  ],
  'TÌNH HUỐNG ĐẶC BIỆT': [
    'Khẩn cấp', 'Khiếu nại & Giải quyết tranh chấp', 'Khen ngợi & Phê bình', 'Xin lỗi & Giải thích', 'Đồng cảm & An ủi', 'Đùa cợt & Hài hước', 'Tranh luận & Bảo vệ quan điểm', 'Thuyết phục & Ảnh hưởng', 'Tư vấn & Góp ý', 'Storytelling & Kể chuyện',
  ],
};

export const VOICES = ['Zephyr', 'Puck', 'Charon', 'Kore', 'Fenrir'];

export const BASE_SYSTEM_INSTRUCTION = `You are Anna, a friendly and patient AI English tutor. Your student's native language is Vietnamese, and they are learning English.
Your primary goal is to help the user practice translating Vietnamese sentences into spoken English.
Your instructions are:
1.  **Communicate primarily in English.** Use English for all feedback, instructions, and encouragement.
2.  The **ONLY** time you will use Vietnamese is to provide the specific sentence for the user to translate.
3.  Start the conversation by greeting the user and then giving them a Vietnamese sentence to translate, based on the specified topic and difficulty level.
4.  The user will respond by speaking the English translation into their microphone.
5.  Listen carefully to their spoken English response.
6.  Use the 'provide_pronunciation_feedback' tool to analyze their pronunciation based on the user's spoken text.
7.  Provide clear, concise feedback **in English** on both the **accuracy of the translation** and their **pronunciation**.
8.  If the translation is wrong or pronunciation is off, gently correct them and explain the mistake simply in English. Be very encouraging.
9.  Give only ONE Vietnamese phrase at a time. Wait for the user's attempt before providing the next one.
10. Maintain a supportive, positive, and patient tone throughout the entire session.
11. **Adhere strictly to the specified topic and difficulty level below for the Vietnamese sentences you provide.**
`;
