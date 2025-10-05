import React from 'react';
import { Settings } from '../types';
import { LEVELS, TOPICS, VOICES, BASE_SYSTEM_INSTRUCTION } from '../constants';
import { XIcon } from './Icons';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  onSettingsChange: (newSettings: Settings) => void;
  isRecording: boolean;
}

const Dropdown: React.FC<{
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: React.ReactNode;
  disabled: boolean;
}> = ({ label, value, onChange, options, disabled }) => (
  <div className="mb-4">
    <label className="block text-base font-medium text-gray-400 mb-1">{label}</label>
    <select
      value={value}
      onChange={onChange}
      disabled={disabled}
      className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-base text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {options}
    </select>
  </div>
);

const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose, settings, onSettingsChange, isRecording }) => {
  const tutorDescription = `${BASE_SYSTEM_INSTRUCTION}\n\nCURRENT SETTINGS:\n- Level: ${settings.level}\n- Topic: ${settings.topic}`;
  
  return (
    <aside
      className={`absolute top-0 left-0 h-full bg-gray-800 shadow-lg z-10 w-full md:w-1/4 p-6 flex flex-col transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-teal-400">Cài đặt</h2>
        <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-700">
          <XIcon />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pr-2">
        <div className="mb-6 p-4 bg-gray-900 rounded-lg">
          <h3 className="text-lg font-semibold text-teal-500 mb-2">Chân dung Gia sư</h3>
          <p className="text-sm text-gray-400 whitespace-pre-wrap h-60 overflow-y-auto pr-2">{tutorDescription}</p>
        </div>

        <Dropdown
          label="Level"
          value={settings.level}
          onChange={(e) => onSettingsChange({ ...settings, level: e.target.value })}
          disabled={isRecording}
          options={Object.entries(LEVELS).map(([level, desc]) => (
            <option key={level} value={level}>{`${level}: ${desc}`}</option>
          ))}
        />

        <Dropdown
          label="Chủ đề"
          value={settings.topic}
          onChange={(e) => onSettingsChange({ ...settings, topic: e.target.value })}
          disabled={isRecording}
          options={Object.entries(TOPICS).map(([category, topics]) => (
            <optgroup key={category} label={category}>
              {topics.map(topic => <option key={topic} value={topic}>{topic}</option>)}
            </optgroup>
          ))}
        />

        <Dropdown
          label="Giọng nói"
          value={settings.voice}
          onChange={(e) => onSettingsChange({ ...settings, voice: e.target.value })}
          disabled={isRecording}
          options={VOICES.map(voice => <option key={voice} value={voice}>{voice}</option>)}
        />
      </div>
    </aside>
  );
};

export default SettingsPanel;