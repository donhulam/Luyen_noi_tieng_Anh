
export enum MessageSender {
  USER = 'user',
  AI = 'ai',
  SYSTEM = 'system',
}

export interface Message {
  id: string;
  text: string;
  sender: MessageSender;
}

export interface Settings {
  level: string;
  topic: string;
  voice: string;
}

export enum RecordingState {
  IDLE = 'idle',
  CONNECTING = 'connecting',
  RECORDING = 'recording',
  ERROR = 'error',
}
