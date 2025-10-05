import React from 'react';
import { InfoIcon } from './Icons';

interface HeaderProps {
  onShowAbout: () => void;
}

const Header: React.FC<HeaderProps> = ({ onShowAbout }) => {
  return (
    <header className="bg-gray-800 p-4 shadow-md flex items-center justify-center relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2">
        <button 
          onClick={onShowAbout}
          className="text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-gray-700"
          aria-label="Giới thiệu về ứng dụng"
        >
          <InfoIcon />
        </button>
      </div>
      <div className="text-center">
        <h1 className="font-bold text-teal-400">HUẤN LUYỆN VIÊN TẬP NÓI TIẾNG ANH</h1>
        <p className="text-gray-400">Thực hành giao tiếp tiếng Anh với gia sư AI</p>
      </div>
    </header>
  );
};

export default Header;