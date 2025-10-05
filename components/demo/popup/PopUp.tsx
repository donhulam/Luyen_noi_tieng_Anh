/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import './PopUp.css';

interface PopUpProps {
  onClose: () => void;
}

const PopUp: React.FC<PopUpProps> = ({ onClose }) => {
  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h2>Chào mừng bạn đến với Huấn luyện viên giao tiếp tiếng Anh!</h2>
        <p>Đây là một phương pháp tuyệt vời để bạn luyện tập phản xạ dịch và nói một cách tự nhiên.</p>
        <p>Cách học của chúng ta:</p>
        <ol>
          <li><span className="icon">record_voice_over</span>Chọn một chủ đề bạn muốn luyện tập.</li>
          <li><span className="icon">play_circle</span>Nhấn 'Bắt đầu phiên' và lắng nghe câu tiếng Việt từ gia sư.</li>
          <li><span className="icon">mic</span>Nhiệm vụ của bạn là dịch câu đó sang tiếng Anh và nói vào micrô. Gia sư sẽ lắng nghe và đưa ra phản hồi bằng tiếng Anh.</li>
        </ol>
        <button onClick={onClose}>Bắt đầu nào</button>
      </div>
    </div>
  );
};

export default PopUp;