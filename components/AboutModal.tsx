
import React from 'react';
import { XIcon } from './Icons';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
          aria-label="Đóng"
        >
          <XIcon />
        </button>
        <h2 className="text-2xl font-bold text-teal-400 mb-4">Giới thiệu về HUẤN LUYỆN VIÊN TẬP NÓI TIẾNG ANH</h2>
        <div className="text-gray-300 space-y-4 max-h-[70vh] overflow-y-auto pr-4">
          <p>
            Chào mừng bạn đến với <strong>HUẤN LUYỆN VIÊN TẬP NÓI TIẾNG ANH</strong>! Ứng dụng này được thiết kế để giúp bạn cải thiện kỹ năng giao tiếp tiếng Anh một cách tự nhiên và hiệu quả.
          </p>
          <p>
            Gia sư AI tên là Anna sẽ đưa ra các câu tiếng Việt theo chủ đề và cấp độ bạn đã chọn. Nhiệm vụ của bạn là dịch và nói câu đó bằng tiếng Anh.
          </p>
          <h3 className="text-lg font-semibold text-teal-500 mt-4">Cách hoạt động:</h3>
          <ol className="list-decimal list-inside space-y-2">
            <li><strong>Chọn Cài đặt:</strong> Ở bảng điều khiển bên trái, hãy chọn Cấp độ (Level), Chủ đề (Topic) và Giọng nói (Voice) của gia sư AI cho phù hợp với mục tiêu học tập của bạn.</li>
            <li><strong>Bắt đầu Luyện tập:</strong> Nhấn vào nút micro ở phía dưới để bắt đầu phiên học.</li>
            <li><strong>Lắng nghe & Dịch:</strong> Gia sư AI sẽ đọc một câu bằng tiếng Việt.</li>
            <li><strong>Nói câu trả lời:</strong> Bạn hãy dịch câu đó sang tiếng Anh và nói vào micro.</li>
            <li><strong>Nhận Phản hồi:</strong> Anna sẽ phân tích câu trả lời của bạn, đưa ra nhận xét về cả độ chính xác của bản dịch và cách phát âm của bạn. Cô ấy sẽ sửa lỗi và đưa ra lời khuyên để bạn tiến bộ hơn.</li>
          </ol>
          <p className="mt-4">
            Mục tiêu là tạo ra một môi trường thực hành an toàn, không áp lực, giúp bạn tự tin hơn khi giao tiếp bằng tiếng Anh. Chúc bạn có những giờ học vui vẻ và hiệu quả!
          </p>
          <p className="mt-6 border-t border-gray-700 pt-4 text-sm text-gray-500">
            App được tạo bởi: Đỗ Như Lâm - Zalo: 0911 855 646
          </p>
        </div>
         <div className="mt-6 text-right">
            <button 
                onClick={onClose}
                className="bg-teal-600 hover:bg-teal-500 text-white font-bold py-2 px-4 rounded transition-colors"
            >
                Đã hiểu
            </button>
        </div>
      </div>
    </div>
  );
};

export default AboutModal;