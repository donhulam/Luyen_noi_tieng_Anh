
import React from 'react';
import { RecordingState } from '../types';
import { MicrophoneIcon, StopIcon, RefreshIcon } from './Icons';

interface FooterProps {
  onToggleRecording: () => void;
  recordingState: RecordingState;
  onResetApp: () => void;
}

const Footer: React.FC<FooterProps> = ({ onToggleRecording, recordingState, onResetApp }) => {
  const getButtonContent = () => {
    switch (recordingState) {
      case RecordingState.IDLE:
      case RecordingState.ERROR:
        return {
          icon: <MicrophoneIcon />,
          text: 'Bắt đầu',
          color: 'bg-teal-600 hover:bg-teal-500',
        };
      case RecordingState.CONNECTING:
        return {
          icon: <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>,
          text: 'Đang kết nối...',
          color: 'bg-yellow-600',
        };
      case RecordingState.RECORDING:
        return {
          icon: <StopIcon />,
          text: 'Dừng lại',
          color: 'bg-red-600 hover:bg-red-500',
        };
    }
  };

  const { icon, text, color } = getButtonContent();
  
  const isSessionActive = recordingState === RecordingState.CONNECTING || recordingState === RecordingState.RECORDING;

  return (
    <footer className="bg-gray-800 p-4 flex justify-center items-center">
        <div className="flex items-center space-x-6">
            <button
                onClick={onResetApp}
                className="flex items-center justify-center py-3 px-5 rounded-full text-white bg-gray-600 hover:bg-gray-500 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Tạo phiên mới"
                disabled={isSessionActive}
            >
                <RefreshIcon />
                <span className="font-medium ml-2">Tạo mới</span>
            </button>

            <button
                onClick={onToggleRecording}
                disabled={recordingState === RecordingState.CONNECTING}
                className={`flex items-center justify-center py-3 px-5 rounded-full text-white transition-all duration-300 transform hover:scale-105 shadow-lg ${color} disabled:opacity-75 disabled:cursor-wait min-w-[180px]`}
            >
                <span className="mr-2">{icon}</span>
                <span className="font-medium">{text}</span>
            </button>
        </div>
    </footer>
  );
};

export default Footer;
