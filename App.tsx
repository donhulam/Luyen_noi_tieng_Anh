
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleGenAI, LiveSession, LiveServerMessage, Modality, Type, FunctionDeclaration, Blob } from '@google/genai';
import { Settings, Message, MessageSender, RecordingState } from './types';
import { LEVELS, TOPICS, VOICES, BASE_SYSTEM_INSTRUCTION } from './constants';
import SettingsPanel from './components/SettingsPanel';
import ChatWindow from './components/ChatWindow';
import Footer from './components/Footer';
import Header from './components/Header';
import AboutModal from './components/AboutModal';
import { MenuIcon } from './components/Icons';

// Helper functions for audio encoding/decoding
function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function encode(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

const providePronunciationFeedback: FunctionDeclaration = {
  name: 'provide_pronunciation_feedback',
  description: "Analyzes the user's spoken English pronunciation and provides feedback.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      user_spoken_text: {
        type: Type.STRING,
        description: "The English text spoken by the user, as transcribed by the system."
      }
    },
    required: ['user_spoken_text']
  }
};

const App: React.FC = () => {
  const [settings, setSettings] = useState<Settings>({
    level: Object.keys(LEVELS)[0],
    topic: TOPICS['CUỘC SỐNG HÀNG NGÀY'][0],
    voice: VOICES[0],
  });
  const [messages, setMessages] = useState<Message[]>([
    { id: 'initial', text: 'Chào mừng bạn! Hãy chọn cài đặt và nhấn nút micro để bắt đầu.', sender: MessageSender.SYSTEM }
  ]);
  const [recordingState, setRecordingState] = useState<RecordingState>(RecordingState.IDLE);
  const [isSettingsOpen, setIsSettingsOpen] = useState(true);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);

  const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const nextStartTimeRef = useRef<number>(0);
  const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const currentInputTranscriptionRef = useRef('');
  const currentOutputTranscriptionRef = useRef('');

  const stopRecording = useCallback(async () => {
    if (sessionPromiseRef.current) {
        try {
            const session = await sessionPromiseRef.current;
            session.close();
        } catch (error) {
            console.error('Error closing session:', error);
        }
    }

    if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
    }

    if (scriptProcessorRef.current) {
        scriptProcessorRef.current.disconnect();
        scriptProcessorRef.current = null;
    }

    if(mediaStreamSourceRef.current) {
        mediaStreamSourceRef.current.disconnect();
        mediaStreamSourceRef.current = null;
    }

    if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
        await inputAudioContextRef.current.close();
    }
    if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
       await outputAudioContextRef.current.close();
    }

    inputAudioContextRef.current = null;
    outputAudioContextRef.current = null;
    sessionPromiseRef.current = null;
    setRecordingState(RecordingState.IDLE);
  }, []);

  const resetApp = useCallback(() => {
    stopRecording(); // Clean up any active session
    
    // Reset all states to their initial values
    setSettings({
      level: Object.keys(LEVELS)[0],
      topic: TOPICS['CUỘC SỐNG HÀNG NGÀY'][0],
      voice: VOICES[0],
    });
    setMessages([
      { id: 'initial', text: 'Chào mừng bạn! Hãy chọn cài đặt và nhấn nút micro để bắt đầu.', sender: MessageSender.SYSTEM }
    ]);
    setIsSettingsOpen(true);
    setIsAboutModalOpen(false);

    // Reset refs holding session data
    currentInputTranscriptionRef.current = '';
    currentOutputTranscriptionRef.current = '';
    nextStartTimeRef.current = 0;
    
    // Stop and clear any lingering audio sources
    for (const source of audioSourcesRef.current.values()) {
        try {
            source.stop();
        } catch (e) {
            console.error("Error stopping audio source:", e);
        }
    }
    audioSourcesRef.current.clear();
  }, [stopRecording]);

  useEffect(() => {
    return () => {
        stopRecording();
    };
  }, [stopRecording]);

  const handleMessage = useCallback(async (message: LiveServerMessage) => {
    if (message.serverContent) {
        const { inputTranscription, outputTranscription, turnComplete, modelTurn } = message.serverContent;
        if(outputTranscription) {
            currentOutputTranscriptionRef.current += outputTranscription.text;
            setMessages(prev => {
                const lastMessage = prev[prev.length - 1];
                if (lastMessage && lastMessage.sender === MessageSender.AI) {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1] = {...lastMessage, text: currentOutputTranscriptionRef.current};
                    return newMessages;
                } else {
                    return [...prev, { id: `ai-${Date.now()}`, text: currentOutputTranscriptionRef.current, sender: MessageSender.AI }];
                }
            });
        }
        if (inputTranscription) {
             currentInputTranscriptionRef.current += inputTranscription.text;
             setMessages(prev => {
                const lastMessage = prev[prev.length - 1];
                if (lastMessage && lastMessage.sender === MessageSender.USER) {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1] = {...lastMessage, text: currentInputTranscriptionRef.current};
                    return newMessages;
                } else {
                     return [...prev, { id: `user-${Date.now()}`, text: currentInputTranscriptionRef.current, sender: MessageSender.USER }];
                }
            });
        }
        if (turnComplete) {
            currentInputTranscriptionRef.current = '';
            currentOutputTranscriptionRef.current = '';
        }

        const audioData = modelTurn?.parts[0]?.inlineData?.data;
        if (audioData && outputAudioContextRef.current) {
            const outputCtx = outputAudioContextRef.current;
            const decodedBytes = decode(audioData);
            
            if (decodedBytes.length > 0) {
                nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
                const audioBuffer = await decodeAudioData(decodedBytes, outputCtx, 24000, 1);
                
                const source = outputCtx.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(outputCtx.destination);
                source.addEventListener('ended', () => {
                    audioSourcesRef.current.delete(source);
                });
                source.start(nextStartTimeRef.current);
                nextStartTimeRef.current += audioBuffer.duration;
                audioSourcesRef.current.add(source);
            }
        }

        if (message.serverContent?.interrupted) {
            for (const source of audioSourcesRef.current.values()) {
                source.stop();
                audioSourcesRef.current.delete(source);
            }
            nextStartTimeRef.current = 0;
        }
    }
    if (message.toolCall && sessionPromiseRef.current) {
        for (const fc of message.toolCall.functionCalls) {
            sessionPromiseRef.current.then((session) => {
                session.sendToolResponse({
                    functionResponses: {
                        id: fc.id,
                        name: fc.name,
                        response: { result: "Pronunciation analysis requested and processed." },
                    }
                });
            });
        }
    }
  }, []);

  const startRecording = useCallback(async () => {
    setIsSettingsOpen(false);
    setRecordingState(RecordingState.CONNECTING);
    setMessages([]);

    try {
        const fullSystemInstruction = `${BASE_SYSTEM_INSTRUCTION}\n\nCURRENT SETTINGS:\n- Level: ${settings.level}\n- Topic: ${settings.topic}`;
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        
        inputAudioContextRef.current = new (window.AudioContext)({ sampleRate: 16000 });
        outputAudioContextRef.current = new (window.AudioContext)({ sampleRate: 24000 });
        streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });

        sessionPromiseRef.current = ai.live.connect({
            model: 'gemini-2.5-flash-native-audio-preview-09-2025',
            callbacks: {
                onopen: () => {
                    if (!inputAudioContextRef.current || !streamRef.current) return;
                    setRecordingState(RecordingState.RECORDING);
                    mediaStreamSourceRef.current = inputAudioContextRef.current.createMediaStreamSource(streamRef.current);
                    scriptProcessorRef.current = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
                    
                    scriptProcessorRef.current.onaudioprocess = (event: AudioProcessingEvent) => {
                        const inputData = event.inputBuffer.getChannelData(0);
                        const pcmBlob = createBlob(inputData);
                        if (sessionPromiseRef.current) {
                            sessionPromiseRef.current.then((session) => {
                                session.sendRealtimeInput({ media: pcmBlob });
                            });
                        }
                    };

                    mediaStreamSourceRef.current.connect(scriptProcessorRef.current);
                    scriptProcessorRef.current.connect(inputAudioContextRef.current.destination);
                },
                onmessage: handleMessage,
                onerror: (e: ErrorEvent) => {
                    console.error('Session error:', e);
                    setMessages(prev => [...prev, { id: 'error', text: 'Đã xảy ra lỗi. Vui lòng thử lại.', sender: MessageSender.SYSTEM }]);
                    setRecordingState(RecordingState.ERROR);
                    stopRecording();
                },
                onclose: (e: CloseEvent) => {
                    console.log('Session closed');
                    stopRecording();
                },
            },
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: settings.voice } } },
                systemInstruction: fullSystemInstruction,
                inputAudioTranscription: {},
                outputAudioTranscription: {},
                tools: [{ functionDeclarations: [providePronunciationFeedback] }],
            },
        });

    } catch (error) {
        console.error('Failed to start recording:', error);
        setMessages(prev => [...prev, { id: 'error-mic', text: 'Không thể truy cập micro. Vui lòng cấp quyền và thử lại.', sender: MessageSender.SYSTEM }]);
        setRecordingState(RecordingState.ERROR);
    }
  }, [settings.level, settings.topic, settings.voice, handleMessage, stopRecording]);

  const toggleRecording = () => {
    if (recordingState === RecordingState.RECORDING || recordingState === RecordingState.CONNECTING) {
        stopRecording();
    } else {
        startRecording();
    }
  };

  function createBlob(data: Float32Array): Blob {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      int16[i] = data[i] * 32768;
    }
    return {
      data: encode(new Uint8Array(int16.buffer)),
      mimeType: 'audio/pcm;rate=16000',
    };
  }

  async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    if (frameCount <= 0) {
      // Return a silent buffer of minimal length to avoid createBuffer error
      return ctx.createBuffer(numChannels, 1, sampleRate); 
    }
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  }
  
  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-100">
      <Header onShowAbout={() => setIsAboutModalOpen(true)} />
      <div className="flex flex-1 overflow-hidden relative">
        <SettingsPanel
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          settings={settings}
          onSettingsChange={setSettings}
          isRecording={recordingState === RecordingState.RECORDING}
        />
        <main className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${isSettingsOpen ? 'hidden md:flex md:ml-1/4' : 'flex'}`}>
           {!isSettingsOpen && (
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="absolute top-4 left-4 z-20 p-2 bg-gray-700 rounded-full hover:bg-gray-600 transition-colors"
              aria-label="Mở cài đặt"
            >
              <MenuIcon />
            </button>
          )}
          <ChatWindow messages={messages} />
        </main>
      </div>
      <Footer 
        onToggleRecording={toggleRecording} 
        recordingState={recordingState}
        onResetApp={resetApp}
      />
      <AboutModal isOpen={isAboutModalOpen} onClose={() => setIsAboutModalOpen(false)} />
    </div>
  );
};

export default App;
