/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { useUI } from '../lib/state';

export default function Header() {
  const { toggleSidebar } = useUI();

  return (
    <header>
      <div className="header-left">
        <h1>Huấn luyện viên giao tiếp tiếng Anh</h1>
        <p>Thực hành giao tiếp tiếng Anh với gia sư AI.</p>
      </div>
      <div className="header-right">
        <button
          className="settings-button"
          onClick={toggleSidebar}
          aria-label="Cài đặt"
        >
          <span className="icon">tune</span>
        </button>
      </div>
    </header>
  );
}