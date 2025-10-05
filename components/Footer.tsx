import React from 'react';
import { RecordingState } from '../types';
import { MicrophoneIcon, StopIcon } from './Icons';

interface FooterProps {
  onToggleRecording: () => void;
  recordingState: RecordingState;
}

const Footer: React.FC<FooterProps> = ({ onToggleRecording, recordingState }) => {
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

  return (
    <footer className="bg-gray-800 p-4 flex justify-center items-center">
      <button
        onClick={onToggleRecording}
        disabled={recordingState === RecordingState.CONNECTING}
        className={`flex items-center justify-center p-4 rounded-full text-white transition-all duration-300 transform hover:scale-105 shadow-lg ${color} disabled:opacity-75 disabled:cursor-wait`}
      >
        <span className="mr-2">{icon}</span>
        <span className="font-medium">{text}</span>
      </button>
    </footer>
  );
};

export default Footer;