/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { create } from 'zustand';
import { coachingTools } from './tools/customer-support';
import { DEFAULT_LIVE_API_MODEL, DEFAULT_VOICE } from './constants';
import {
  FunctionResponse,
  LiveServerToolCall,
  GoogleGenAI,
  Type,
  FunctionResponseScheduling,
} from '@google/genai';

export const communicationTopics = [
  // A. CUỘC SỐNG HÀNG NGÀY
  { id: 'daily_intro', category: 'A. CUỘC SỐNG HÀNG NGÀY', title: '1. Giới thiệu & Làm quen', description: 'Luyện các câu giới thiệu bản thân và làm quen với người mới.', prompts: ['Tên tôi là An', 'Bạn tên là gì?', 'Rất vui được gặp bạn'] },
  { id: 'daily_family', category: 'A. CUỘC SỐNG HÀNG NGÀY', title: '2. Gia đình & Mối quan hệ', description: 'Nói về các thành viên trong gia đình và các mối quan hệ xã hội.', prompts: ['Gia đình tôi có 4 người', 'Đây là bạn của tôi', 'Anh ấy là anh trai tôi'] },
  { id: 'daily_housing', category: 'A. CUỘC SỐNG HÀNG NGÀY', title: '3. Nhà ở & Sinh hoạt', description: 'Mô tả về nhà cửa và các hoạt động sinh hoạt thường ngày.', prompts: ['Tôi sống trong một căn hộ', 'Phòng khách rất rộng', 'Tôi thường nấu ăn ở nhà'] },
  { id: 'daily_shopping', category: 'A. CUỘC SỐNG HÀNG NGÀY', title: '4. Mua sắm', description: 'Thực hành các mẫu câu khi đi mua sắm ở siêu thị, cửa hàng.', prompts: ['Cái này giá bao nhiêu?', 'Tôi muốn mua một chiếc áo', 'Bạn có cỡ nhỏ hơn không?'] },
  { id: 'daily_eating', category: 'A. CUỘC SỐNG HÀNG NGÀY', title: '5. Ăn uống', description: 'Giao tiếp tại nhà hàng, quán cafe và nói về đồ ăn, thức uống.', prompts: ['Cho tôi xem thực đơn', 'Tôi muốn đặt một bàn', 'Món này rất ngon'] },
  { id: 'daily_transport', category: 'A. CUỘC SỐNG HÀNG NGÀY', title: '6. Giao thông', description: 'Hỏi đường, sử dụng các phương tiện giao thông công cộng như taxi, xe bus.', prompts: ['Làm ơn chỉ đường đến...', 'Bắt một chiếc taxi', 'Bến xe bus ở đâu?'] },
  { id: 'daily_health', category: 'A. CUỘC SỐNG HÀNG NGÀY', title: '7. Sức khỏe', description: 'Giao tiếp khi đi khám bệnh, ở bệnh viện hoặc mua thuốc.', prompts: ['Tôi cảm thấy không khỏe', 'Tôi cần gặp bác sĩ', 'Đơn thuốc của tôi'] },
  { id: 'daily_travel', category: 'A. CUỘC SỐNG HÀNG NGÀY', title: '8. Du lịch', description: 'Các tình huống giao tiếp ở sân bay, khách sạn và khi đi tham quan.', prompts: ['Tôi muốn đặt một phòng', 'Chuyến bay của tôi bị trễ', 'Vé vào cửa là bao nhiêu?'] },
  { id: 'daily_entertainment', category: 'A. CUỘC SỐNG HÀNG NGÀY', title: '9. Giải trí', description: 'Nói về sở thích cá nhân như phim ảnh, âm nhạc, thể thao.', prompts: ['Sở thích của tôi là đọc sách', 'Bạn có thích xem phim không?', 'Tôi là một fan bóng đá'] },
  { id: 'daily_weather', category: 'A. CUỘC SỐNG HÀNG NGÀY', title: '10. Thời tiết & Môi trường', description: 'Mô tả về thời tiết và thảo luận các vấn đề về môi trường.', prompts: ['Hôm nay trời đẹp', 'Dự báo thời tiết nói sẽ mưa', 'Chúng ta nên bảo vệ môi trường'] },

  // B. HỌC TẬP & PHÁT TRIỂN
  { id: 'dev_education', category: 'B. HỌC TẬP & PHÁT TRIỂN', title: '11. Trường học & Giáo dục', description: 'Thảo luận về các chủ đề liên quan đến trường lớp, môn học và hệ thống giáo dục.', prompts: ['Tôi là sinh viên', 'Môn học yêu thích của tôi là...', 'Giáo dục rất quan trọng'] },
  { id: 'dev_exams', category: 'B. HỌC TẬP & PHÁT TRIỂN', title: '12. Thi cử & Chứng chỉ', description: 'Nói về các kỳ thi, việc ôn tập và các loại chứng chỉ học thuật.', prompts: ['Tôi sắp có một kỳ thi', 'Tôi cần ôn tập cho bài kiểm tra', 'Bạn đã có bằng IELTS chưa?'] },
  { id: 'dev_online', category: 'B. HỌC TẬP & PHÁT TRIỂN', title: '13. Học online & Công nghệ', description: 'Trao đổi về các khóa học trực tuyến và vai trò của công nghệ trong giáo dục.', prompts: ['Tôi đang tham gia một khóa học online', 'Công nghệ giúp việc học dễ dàng hơn', 'Chúng ta có thể học mọi thứ trên mạng'] },
  { id: 'dev_reading', category: 'B. HỌC TẬP & PHÁT TRIỂN', title: '14. Đọc sách & Nghiên cứu', description: 'Nói về thói quen đọc sách và các hoạt động nghiên cứu khoa học.', prompts: ['Tôi thích đọc sách khoa học', 'Bài nghiên cứu này rất thú vị', 'Thư viện có nhiều sách hay'] },
  { id: 'dev_presentation', category: 'B. HỌC TẬP & PHÁT TRIỂN', title: '15. Thuyết trình & Báo cáo', description: 'Luyện tập các kỹ năng trình bày một bài thuyết trình hoặc báo cáo.', prompts: ['Hôm nay tôi sẽ nói về...', 'Slide tiếp theo là...', 'Cảm ơn vì đã lắng nghe'] },
  { id: 'dev_discussion', category: 'B. HỌC TẬP & PHÁT TRIỂN', title: '16. Thảo luận nhóm', description: 'Thực hành các mẫu câu dùng trong các buổi thảo luận nhóm.', prompts: ['Theo ý kiến của tôi...', 'Tôi đồng ý với bạn', 'Chúng ta hãy xem xét vấn đề này'] },
  { id: 'dev_scholarship', category: 'B. HỌC TẬP & PHÁT TRIỂN', title: '17. Phỏng vấn học bổng', description: 'Các câu hỏi và câu trả lời thường gặp khi phỏng vấn xin học bổng.', prompts: ['Tại sao bạn xứng đáng với học bổng này?', 'Kế hoạch học tập của bạn là gì?', 'Hãy giới thiệu về bản thân bạn'] },
  { id: 'dev_thesis', category: 'B. HỌC TẬP & PHÁT TRIỂN', title: '18. Viết luận văn & Paper', description: 'Trao đổi về quá trình viết và các nội dung trong luận văn, bài báo khoa học.', prompts: ['Đề tài luận văn của tôi là...', 'Tôi đang gặp khó khăn với phần...', 'Giáo sư đã cho tôi vài lời khuyên'] },

  // C. CÔNG VIỆC & SỰ NGHIỆP
  { id: 'work_interview', category: 'C. CÔNG VIỆC & SỰ NGHIỆP', title: '19. Phỏng vấn xin việc', description: 'Luyện tập trả lời các câu hỏi phỏng vấn xin việc phổ biến.', prompts: ['Hãy nói về điểm yếu của bạn', 'Tại sao bạn muốn công việc này?', 'Bạn có câu hỏi nào cho chúng tôi không?'] },
  { id: 'work_cv', category: 'C. CÔNG VIỆC & SỰ NGHIỆP', title: '20. CV & Cover letter (nói về)', description: 'Thực hành cách trình bày về kinh nghiệm và kỹ năng trong CV.', prompts: ['Tôi có 5 năm kinh nghiệm', 'Kỹ năng của tôi bao gồm...', 'Tôi đã từng làm việc tại...'] },
  { id: 'work_meeting', category: 'C. CÔNG VIỆC & SỰ NGHIỆP', title: '21. Họp & Meeting', description: 'Các mẫu câu sử dụng khi chủ trì hoặc tham gia một cuộc họp.', prompts: ['Chúng ta hãy bắt đầu cuộc họp', 'Mục tiêu của hôm nay là...', 'Ai có ý kiến gì khác không?'] },
  { id: 'work_email', category: 'C. CÔNG VIỆC & SỰ NGHIỆP', title: '22. Email & Giao tiếp công việc', description: 'Luyện các cấu trúc viết và nói chuyện chuyên nghiệp trong công việc.', prompts: ['Tôi viết email này để...', 'Vui lòng xem tệp đính kèm', 'Trân trọng'] },
  { id: 'work_negotiation', category: 'C. CÔNG VIỆC & SỰ NGHIỆP', title: '23. Thương lượng & Đàm phán', description: 'Thực hành kỹ năng đàm phán và thương lượng trong kinh doanh.', prompts: ['Đề nghị của chúng tôi là...', 'Chúng ta có thể thỏa hiệp không?', 'Đây là mức giá cuối cùng'] },
  { id: 'work_management', category: 'C. CÔNG VIỆC & SỰ NGHIỆP', title: '24. Quản lý & Lãnh đạo', description: 'Trao đổi về các phong cách và kỹ năng quản lý, lãnh đạo.', prompts: ['Là một người quản lý, tôi...', 'Chúng ta cần giao việc rõ ràng', 'Động viên nhân viên là rất quan trọng'] },
  { id: 'work_teamwork', category: 'C. CÔNG VIỆC & SỰ NGHIỆP', title: '25. Làm việc nhóm & Collaboration', description: 'Các mẫu câu hiệu quả để tăng cường sự hợp tác trong nhóm.', prompts: ['Chúng ta là một đội', 'Hãy cùng nhau giải quyết vấn đề này', 'Cảm ơn sự đóng góp của bạn'] },
  { id: 'work_customer', category: 'C. CÔNG VIỆC & SỰ NGHIỆP', title: '26. Khách hàng & Dịch vụ', description: 'Giao tiếp với khách hàng và xử lý các yêu cầu dịch vụ.', prompts: ['Tôi có thể giúp gì cho bạn?', 'Cảm ơn bạn đã liên hệ', 'Chúng tôi sẽ giải quyết vấn đề này ngay'] },
  { id: 'work_report', category: 'C. CÔNG VIỆC & SỰ NGHIỆP', title: '27. Báo cáo tiến độ', description: 'Trình bày và thảo luận về tiến độ của một dự án hoặc công việc.', prompts: ['Dự án đang đi đúng tiến độ', 'Chúng ta đã hoàn thành 50%', 'Tuần tới chúng ta sẽ làm...'] },
  { id: 'work_performance', category: 'C. CÔNG VIỆC & SỰ NGHIỆP', title: '28. Đánh giá hiệu suất', description: 'Thực hành các buổi nói chuyện về đánh giá kết quả công việc.', prompts: ['Bạn đã làm rất tốt', 'Chúng ta cần cải thiện ở điểm...', 'Mục tiêu cho năm tới là...'] },
  { id: 'work_leave', category: 'C. CÔNG VIỆC & SỰ NGHIỆP', title: '29. Xin nghỉ phép & Xử lý vấn đề', description: 'Các tình huống xin nghỉ và cách trao đổi để xử lý các vấn đề phát sinh.', prompts: ['Tôi muốn xin nghỉ phép một ngày', 'Tôi gặp một vấn đề cá nhân', 'Làm ơn cho tôi lời khuyên'] },
  { id: 'work_networking', category: 'C. CÔNG VIỆC & SỰ NGHIỆP', title: '30. Networking & Mối quan hệ', description: 'Kỹ năng bắt chuyện và xây dựng mối quan hệ trong môi trường nghề nghiệp.', prompts: ['Công việc của bạn là gì?', 'Rất vui được kết nối với bạn', 'Đây là danh thiếp của tôi'] },

  // D. CHUYÊN MÔN
  { id: 'spec_it', category: 'D. CHUYÊN MÔN (Theo ngành)', title: '31. Công nghệ thông tin', description: 'Các thuật ngữ và mẫu câu thông dụng trong ngành CNTT.', prompts: ['Tôi là một lập trình viên', 'Có một lỗi trong đoạn mã này', 'Hệ thống đang bị treo'] },
  { id: 'spec_marketing', category: 'D. CHUYÊN MÔN (Theo ngành)', title: '32. Marketing & Sales', description: 'Trao đổi về các chiến dịch marketing và hoạt động bán hàng.', prompts: ['Chúng ta cần một chiến dịch marketing mới', 'Đối tượng khách hàng của chúng ta là ai?', 'Doanh số đã tăng 10%'] },
  { id: 'spec_finance', category: 'D. CHUYÊN MÔN (Theo ngành)', title: '33. Tài chính & Kế toán', description: 'Thảo luận về báo cáo tài chính, ngân sách và các vấn đề kế toán.', prompts: ['Báo cáo tài chính quý này', 'Ngân sách của chúng ta có hạn', 'Chúng ta cần cắt giảm chi phí'] },
  { id: 'spec_medical', category: 'D. CHUYÊN MÔN (Theo ngành)', title: '34. Y tế & Dược', description: 'Giao tiếp chuyên ngành trong lĩnh vực y tế, dược phẩm.', prompts: ['Bệnh nhân có triệu chứng...', 'Liều lượng là hai viên mỗi ngày', 'Thuốc này có tác dụng phụ không?'] },
  { id: 'spec_engineering', category: 'D. CHUYÊN MÔN (Theo ngành)', title: '35. Kỹ thuật & Xây dựng', description: 'Các thuật ngữ và trao đổi trong ngành kỹ thuật, xây dựng.', prompts: ['Bản thiết kế này cần được sửa đổi', 'Vật liệu này không đủ chắc chắn', 'Dự án đang trong giai đoạn xây dựng'] },
  { id: 'spec_law', category: 'D. CHUYÊN MÔN (Theo ngành)', title: '36. Luật & Pháp lý', description: 'Thảo luận về các điều khoản hợp đồng và các vấn đề pháp lý.', prompts: ['Theo hợp đồng...', 'Điều này là trái pháp luật', 'Chúng tôi cần tham khảo ý kiến luật sư'] },
  { id: 'spec_art', category: 'D. CHUYÊN MÔN (Theo ngành)', title: '37. Nghệ thuật & Thiết kế', description: 'Trình bày ý tưởng và phản hồi về các sản phẩm nghệ thuật, thiết kế.', prompts: ['Bố cục này trông rất đẹp', 'Tôi thích sự kết hợp màu sắc này', 'Cảm hứng của tôi đến từ...'] },
  { id: 'spec_science', category: 'D. CHUYÊN MÔN (Theo ngành)', title: '38. Khoa học & Nghiên cứu', description: 'Trình bày các giả thuyết và kết quả nghiên cứu khoa học.', prompts: ['Giả thuyết của tôi là...', 'Dữ liệu cho thấy rằng...', 'Chúng tôi cần thêm bằng chứng'] },
  { id: 'spec_education_pro', category: 'D. CHUYÊN MÔN (Theo ngành)', title: '39. Giáo dục & Đào tạo', description: 'Trao đổi về phương pháp giảng dạy và chương trình đào tạo.', prompts: ['Phương pháp giảng dạy này rất hiệu quả', 'Học sinh cần được thực hành nhiều hơn', 'Chương trình giảng dạy cần được cập nhật'] },
  { id: 'spec_logistics', category: 'D. CHUYÊN MÔN (Theo ngành)', title: '40. Logistics & Vận tải', description: 'Giao tiếp về các vấn đề trong chuỗi cung ứng và vận tải hàng hóa.', prompts: ['Lô hàng đã được gửi đi', 'Chúng tôi gặp vấn đề ở khâu hải quan', 'Lịch trình giao hàng là khi nào?'] },

  // E. XÃ HỘI & VĂN HÓA
  { id: 'social_news', category: 'E. XÃ HỘI & VĂN HÓA', title: '41. Tin tức & Thời sự', description: 'Thảo luận và đưa ra ý kiến về các sự kiện, tin tức mới nhất.', prompts: ['Bạn đã đọc tin tức hôm nay chưa?', 'Sự kiện đó đang gây tranh cãi', 'Tôi nghĩ rằng...'] },
  { id: 'social_politics', category: 'E. XÃ HỘI & VĂN HÓA', title: '42. Chính trị & Kinh tế', description: 'Trao đổi về các chủ đề chính trị và tình hình kinh tế trong và ngoài nước.', prompts: ['Cuộc bầu cử sắp diễn ra', 'Lạm phát đang tăng cao', 'Chính sách mới sẽ ảnh hưởng đến...'] },
  { id: 'social_culture', category: 'E. XÃ HỘI & VĂN HÓA', title: '43. Văn hóa & Lịch sử', description: 'Nói về các nét đặc trưng văn hóa, phong tục và các sự kiện lịch sử.', prompts: ['Văn hóa của nước tôi...', 'Sự kiện lịch sử này rất quan trọng', 'Chúng ta có thể học hỏi từ quá khứ'] },
  { id: 'social_debate', category: 'E. XÃ HỘI & VĂN HÓA', title: '44. Tranh luận & Phân tích', description: 'Luyện tập kỹ năng đưa ra lập luận và phân tích một vấn đề xã hội.', prompts: ['Một mặt, điều này là đúng', 'Mặt khác, chúng ta cần xem xét...', 'Kết luận của tôi là...'] },
  { id: 'social_trends', category: 'E. XÃ HỘI & VĂN HÓA', title: '45. Xu hướng xã hội', description: 'Thảo luận về các xu hướng mới trong xã hội, công nghệ và lối sống.', prompts: ['Làm việc từ xa đang trở thành xu hướng', 'Giới trẻ ngày nay rất năng động', 'Mạng xã hội có ảnh hưởng lớn'] },
  { id: 'social_environment', category: 'E. XÃ HỘI & VĂN HÓA', title: '46. Vấn đề môi trường', description: 'Trao đổi về biến đổi khí hậu, ô nhiễm và các giải pháp bảo vệ môi trường.', prompts: ['Biến đổi khí hậu là một vấn đề nghiêm trọng', 'Chúng ta cần tái chế rác', 'Năng lượng tái tạo là tương lai'] },
  { id: 'social_technology', category: 'E. XÃ HỘI & VĂN HÓA', title: '47. Công nghệ & Tương lai', description: 'Bàn luận về tác động của công nghệ mới và dự đoán về tương lai.', prompts: ['Trí tuệ nhân tạo sẽ thay đổi thế giới', 'Bạn nghĩ tương lai sẽ như thế nào?', 'Công nghệ có cả mặt tốt và mặt xấu'] },
  { id: 'social_art', category: 'E. XÃ HỘI & VĂN HÓA', title: '48. Nghệ thuật & Văn học', description: 'Phân tích và chia sẻ cảm nhận về các tác phẩm nghệ thuật, văn học.', prompts: ['Bức tranh này thật ấn tượng', 'Cuốn sách này có ý nghĩa sâu sắc', 'Tôi thích phong cách của tác giả này'] },
  { id: 'social_religion', category: 'E. XÃ HỘI & VĂN HОA', title: '49. Tôn giáo & Triết học', description: 'Trao đổi về các hệ thống tín ngưỡng và các câu hỏi triết học lớn.', prompts: ['Triết học giúp chúng ta hiểu cuộc sống', 'Mỗi tôn giáo có một niềm tin riêng', 'Câu hỏi về ý nghĩa cuộc sống'] },
  { id: 'social_smalltalk', category: 'E. XÃ HỘI & VĂN HÓA', title: '50. Small talk & Chit-chat', description: 'Luyện tập các cuộc nói chuyện phiếm tự nhiên về các chủ đề thông thường.', prompts: ['Cuối tuần của bạn thế nào?', 'Bạn có kế hoạch gì cho kỳ nghỉ không?', 'Thời tiết dạo này thật thất thường'] },

  // F. TÌNH HUỐNG ĐẶC BIỆT
  { id: 'sit_emergency', category: 'F. TÌNH HUỐNG ĐẶC BIỆT', title: '51. Khẩn cấp (mất đồ, gặp nạn)', description: 'Các mẫu câu cần thiết để xử lý các tình huống khẩn cấp.', prompts: ['Giúp tôi với! Tôi bị lạc', 'Tôi đã bị mất ví', 'Hãy gọi cảnh sát'] },
  { id: 'sit_complaint', category: 'F. TÌNH HUỐNG ĐẶC BIỆT', title: '52. Khiếu nại & Giải quyết tranh chấp', description: 'Cách đưa ra lời phàn nàn một cách lịch sự và giải quyết mâu thuẫn.', prompts: ['Tôi muốn khiếu nại về dịch vụ', 'Có một sự nhầm lẫn ở đây', 'Chúng ta có thể tìm ra giải pháp không?'] },
  { id: 'sit_praise', category: 'F. TÌNH HUỐNG ĐẶC BIỆT', title: '53. Khen ngợi & Phê bình', description: 'Luyện tập cách đưa ra lời khen và góp ý mang tính xây dựng.', prompts: ['Bạn đã làm một công việc tuyệt vời', 'Tôi rất ấn tượng với...', 'Tôi có một vài góp ý nhỏ'] },
  { id: 'sit_apology', category: 'F. TÌNH HUỐNG ĐẶC BIỆT', title: '54. Xin lỗi & Giải thích', description: 'Cách nói lời xin lỗi chân thành và đưa ra lời giải thích hợp lý.', prompts: ['Tôi thành thật xin lỗi', 'Đó hoàn toàn là lỗi của tôi', 'Để tôi giải thích'] },
  { id: 'sit_empathy', category: 'F. TÌNH HUỐNG ĐẶC BIỆT', title: '55. Đồng cảm & An ủi', description: 'Các mẫu câu để thể hiện sự đồng cảm và an ủi người khác.', prompts: ['Tôi hiểu cảm giác của bạn', 'Mọi chuyện rồi sẽ ổn thôi', 'Nếu bạn cần gì, hãy nói với tôi'] },
  { id: 'sit_humor', category: 'F. TÌNH HUỐNG ĐẶC BIỆT', title: '56. Đùa cợt & Hài hước', description: 'Luyện tập cách sử dụng sự hài hước một cách tinh tế trong giao tiếp.', prompts: ['Tôi chỉ đùa thôi', 'Bạn có óc hài hước thật', 'Câu chuyện đó thật buồn cười'] },
  { id: 'sit_debate', category: 'F. TÌNH HUỐNG ĐẶC BIỆT', title: '57. Tranh luận & Bảo vệ quan điểm', description: 'Kỹ năng bảo vệ ý kiến của mình một cách thuyết phục trong một cuộc tranh luận.', prompts: ['Tôi không hoàn toàn đồng ý', 'Lập luận của tôi dựa trên...', 'Hãy để tôi trình bày quan điểm của mình'] },
  { id: 'sit_persuasion', category: 'F. TÌNH HUỐNG ĐẶC BIỆT', title: '58. Thuyết phục & Ảnh hưởng', description: 'Cách sử dụng ngôn ngữ để thuyết phục và tạo ảnh hưởng đến người khác.', prompts: ['Hãy tưởng tượng nếu chúng ta...', 'Lợi ích chính là...', 'Tôi tin rằng đây là lựa chọn tốt nhất'] },
  { id: 'sit_advice', category: 'F. TÌNH HUỐNG ĐẶC BIỆT', title: '59. Tư vấn & Góp ý', description: 'Cách đưa ra lời khuyên và góp ý một cách chân thành và hiệu quả.', prompts: ['Nếu tôi là bạn, tôi sẽ...', 'Bạn đã thử cách này chưa?', 'Đây chỉ là ý kiến của tôi thôi'] },
  { id: 'sit_storytelling', category: 'F. TÌNH HUỐNG ĐẶC BIỆT', title: '60. Storytelling & Kể chuyện', description: 'Luyện tập kỹ năng kể một câu chuyện hấp dẫn và lôi cuốn.', prompts: ['Ngày xửa ngày xưa...', 'Điều bất ngờ đã xảy ra', 'Và cuối cùng...'] },
];

export type TopicId = typeof communicationTopics[number]['id'];
export type Level = 'level1' | 'level2' | 'level3' | 'level4' | 'level5';

const levelDescriptions: Record<Level, string> = {
  level1: `**LEVEL 1 - SURVIVAL (A1-A2):**
- You must provide simple Vietnamese sentences that are 5-8 words long.
- The required English translation should use basic tenses like simple present and simple past.
- The vocabulary must be basic and related to everyday situations.`,
  level2: `**LEVEL 2 - FUNCTIONAL (B1):**
- You must provide complex Vietnamese sentences that are 10-15 words long.
- The required English translation should involve more complex tenses (e.g., present perfect, future simple).
- Introduce phrases for expressing simple opinions.`,
  level3: `**LEVEL 3 - PROFESSIONAL (B2):**
- You must provide Vietnamese sentences with multiple clauses, 15-20 words long.
- Introduce vocabulary suitable for discussion and debate.
- Touch upon basic professional or business contexts related to the topic.`,
  level4: `**LEVEL 4 - FLUENT (C1):**
- You must provide Vietnamese sentences that require complex and subtle English expression.
- The required English translation should include phrasal verbs and common idioms.
- Frame the task in an in-depth professional communication context.`,
  level5: `**LEVEL 5 - NATIVE-LIKE (C2):**
- You must provide Vietnamese sentences that require understanding of English slang, humor, or cultural references.
- The required English translation should convey nuances and implications.
- The phrases should challenge the user to respond like a native speaker.`,
};

const baseSystemPrompt = `You are Anna, a friendly and patient AI English tutor. Your student's native language is Vietnamese, and they are learning English.
Your primary goal is to help the user practice translating Vietnamese sentences into spoken English.

Your instructions are:
1.  **Communicate primarily in English.** Use English for all feedback, instructions, and encouragement.
2.  The **ONLY** time you will use Vietnamese is to provide the specific sentence for the user to translate.
3.  Start the conversation by giving the user a Vietnamese sentence to translate, based on the specified topic and difficulty level.
4.  The user will respond by speaking the English translation into their microphone.
5.  Listen carefully to their spoken English response.
6.  Use the 'provide_pronunciation_feedback' tool to analyze their pronunciation.
7.  Provide clear, concise feedback **in English** on both the **accuracy of the translation** and their **pronunciation**.
8.  If the translation is wrong or pronunciation is off, gently correct them and explain the mistake simply in English. Be very encouraging.
9.  Give only ONE Vietnamese phrase at a time. Wait for the user's attempt before providing the next one.
10. Maintain a supportive, positive, and patient tone throughout the entire session.
11. **Adhere strictly to the specified topic and difficulty level below for the Vietnamese sentences you provide.**`;


function generateSystemPrompt(topic: TopicId, level: Level): string {
  const selectedTopic = communicationTopics.find(t => t.id === topic) || communicationTopics[0];
  const levelDescription = levelDescriptions[level];
  const topicInstruction = `The current topic is: "${selectedTopic.title}". Your sentences must relate to this topic.`;
  return `${baseSystemPrompt}\n\n${topicInstruction}\n\n${levelDescription}`;
}

/**
 * Settings
 */
export const useSettings = create<{
  systemPrompt: string;
  model: string;
  voice: string;
  level: Level;
  setSystemPrompt: (prompt: string) => void;
  setModel: (model: string) => void;
  setVoice: (voice: string) => void;
  setLevel: (level: Level) => void;
}>(set => ({
  systemPrompt: generateSystemPrompt('daily_intro', 'level1'),
  model: DEFAULT_LIVE_API_MODEL,
  voice: DEFAULT_VOICE,
  level: 'level1',
  setSystemPrompt: prompt => set({ systemPrompt: prompt }),
  setModel: model => set({ model }),
  setVoice: voice => set({ voice }),
  setLevel: (level: Level) => {
    set({ level });
    const currentTopic = useTools.getState().topic;
    const newPrompt = generateSystemPrompt(currentTopic, level);
    useSettings.getState().setSystemPrompt(newPrompt);
  },
}));

/**
 * UI
 */
export const useUI = create<{
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}>(set => ({
  isSidebarOpen: true,
  toggleSidebar: () => set(state => ({ isSidebarOpen: !state.isSidebarOpen })),
}));

/**
 * Tools
 */
export interface FunctionCall {
  name: string;
  description?: string;
  parameters?: any;
  isEnabled: boolean;
  scheduling?: FunctionResponseScheduling;
}

export const useTools = create<{
  tools: FunctionCall[];
  topic: TopicId;
  isAddingTool: boolean;
  setTopic: (topic: TopicId) => void;
  toggleTool: (toolName: string) => void;
  addTool: () => Promise<void>;
  removeTool: (toolName: string) => void;
  updateTool: (oldName: string, updatedTool: FunctionCall) => void;
}>((set, get) => ({
  tools: coachingTools,
  topic: 'daily_intro',
  isAddingTool: false,
  setTopic: (topic: TopicId) => {
    set({ topic });
    const currentLevel = useSettings.getState().level;
    const newPrompt = generateSystemPrompt(topic, currentLevel);
    useSettings.getState().setSystemPrompt(newPrompt);
  },
  toggleTool: (toolName: string) =>
    set(state => ({
      tools: state.tools.map(tool =>
        tool.name === toolName ? { ...tool, isEnabled: !tool.isEnabled } : tool,
      ),
    })),
  addTool: async () => {
    set({ isAddingTool: true });
    try {
      const { topic, tools } = get();
      const topicTitle =
        communicationTopics.find(t => t.id === topic)?.title ||
        'general conversation';
      const existingToolNames = tools.map(t => t.name).join(', ');

      const apiKey = process.env.GEMINI_API_KEY as string;
      if (!apiKey) {
        throw new Error('Missing GEMINI_API_KEY environment variable.');
      }
      const ai = new GoogleGenAI({ apiKey });

      const prompt = `You are an expert in designing function calling tools for large language models.
Your task is to suggest ONE new function tool for an AI English tutor.
The tutor is currently teaching the topic: "${topicTitle}".
The tutor already has these skills: [${existingToolNames}].
The new tool should be creative, relevant to the topic, and NOT a duplicate of existing skills.
The function name must be in snake_case.
Generate a JSON object where the "parameters" property MUST be a JSON string.
For example: { "name": "new_tool", "description": "A new tool.", "parameters": "{\\"type\\":\\"OBJECT\\",\\"properties\\":{\\"arg1\\":{\\"type\\":\\"STRING\\"}},\\"required\\":[\\"arg1\\"]}" }.
If the function has no parameters, the value for "parameters" should be the string "{\\"type\\":\\"OBJECT\\",\\"properties\\":{}}".`;

      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          name: {
            type: Type.STRING,
            description:
              'A short, descriptive, snake_case name for the function, without any special characters or spaces.',
          },
          description: {
            type: Type.STRING,
            description:
              'A concise, one-sentence description of what the function does.',
          },
          parameters: {
            type: Type.STRING,
            description:
              'A JSON string representing the parameters object. For a function with no parameters, this must be "{\\"type\\":\\"OBJECT\\",\\"properties\\":{}}".',
          },
        },
        required: ['name', 'description', 'parameters'],
      };

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: responseSchema,
        },
      });

      const result = JSON.parse(response.text);
      const generatedTool = {
        name: result.name,
        description: result.description,
        parameters: JSON.parse(result.parameters),
      };

      if (
        generatedTool &&
        generatedTool.name &&
        !tools.some(t => t.name === generatedTool.name)
      ) {
        const newTool: FunctionCall = {
          ...generatedTool,
          isEnabled: true,
          scheduling: FunctionResponseScheduling.INTERRUPT,
        };
        set(state => ({ tools: [...state.tools, newTool] }));
      } else {
        console.warn(
          'Generated tool was invalid or a duplicate.',
          generatedTool,
        );
      }
    } catch (error) {
      console.error('Failed to generate and add a new tool:', error);
    } finally {
      set({ isAddingTool: false });
    }
  },
  removeTool: (toolName: string) =>
    set(state => ({
      tools: state.tools.filter(tool => tool.name !== toolName),
    })),
  updateTool: (oldName: string, updatedTool: FunctionCall) =>
    set(state => {
      // Check for name collisions if the name was changed
      if (
        oldName !== updatedTool.name &&
        state.tools.some(tool => tool.name === updatedTool.name)
      ) {
        console.warn(`Tool with name "${updatedTool.name}" already exists.`);
        // Prevent the update by returning the current state
        return state;
      }
      return {
        tools: state.tools.map(tool =>
          tool.name === oldName ? updatedTool : tool,
        ),
      };
    }),
}));

/**
 * Logs
 */
export interface LiveClientToolResponse {
  functionResponses?: FunctionResponse[];
}
export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

export interface ConversationTurn {
  timestamp: Date;
  role: 'user' | 'agent' | 'system';
  text: string;
  isFinal: boolean;
  toolUseRequest?: LiveServerToolCall;
  toolUseResponse?: LiveClientToolResponse;
  groundingChunks?: GroundingChunk[];
}

export const useLogStore = create<{
  turns: ConversationTurn[];
  addTurn: (turn: Omit<ConversationTurn, 'timestamp'>) => void;
  updateLastTurn: (update: Partial<ConversationTurn>) => void;
  clearTurns: () => void;
}>((set, get) => ({
  turns: [],
  addTurn: (turn: Omit<ConversationTurn, 'timestamp'>) =>
    set(state => ({
      turns: [...state.turns, { ...turn, timestamp: new Date() }],
    })),
  updateLastTurn: (update: Partial<Omit<ConversationTurn, 'timestamp'>>) => {
    set(state => {
      if (state.turns.length === 0) {
        return state;
      }
      const newTurns = [...state.turns];
      const lastTurn = { ...newTurns[newTurns.length - 1], ...update };
      newTurns[newTurns.length - 1] = lastTurn;
      return { turns: newTurns };
    });
  },
  clearTurns: () => set({ turns: [] }),
}));