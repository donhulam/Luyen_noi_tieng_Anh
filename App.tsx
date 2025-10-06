import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Message } from './types';
import { LEVELS, TOPICS } from './constants';
import {
  connectToLiveSession,
  decode,
  decodeAudioData,
  createPcmBlob
} from './services/geminiService';
import { Settings, X, Menu, Mic, MicOff, Volume2, HelpCircle } from './components/icons';
import { LiveSession, LiveServerMessage, ErrorEvent, CloseEvent } from '@google/genai';

const INPUT_SAMPLE_RATE = 16000;
const OUTPUT_SAMPLE_RATE = 24000;
const SCRIPT_PROCESSOR_BUFFER_SIZE = 4096;

const App: React.FC = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(true);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [level, setLevel] = useState<string>(LEVELS[0]);
  const [topic, setTopic] = useState<string>('1. Giới thiệu & Làm quen');
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Click the microphone to start your session.');
  
  const currentUserTranscriptionRef = useRef('');
  const currentTutorTranscriptionRef = useRef('');
  const [displayUserTranscription, setDisplayUserTranscription] = useState('');
  const [displayTutorTranscription, setDisplayTutorTranscription] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
  const sessionRef = useRef<LiveSession | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const nextStartTimeRef = useRef(0);
  const audioPlaybackSources = useRef(new Set<AudioBufferSourceNode>());

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, displayUserTranscription, displayTutorTranscription]);
  
  const getSystemPrompt = useCallback(() => {
    return `You are Anna, a friendly and patient AI English tutor. Your student's native language is Vietnamese, and they are learning English.
Your primary goal is to help the user practice translating Vietnamese sentences into spoken English.

Current Settings:
- Level: ${level}
- Topic: ${topic}

Your instructions are:
1. **Communicate primarily in English.** Use English for all feedback, instructions, and encouragement.
2. The **ONLY** time you will use Vietnamese is to provide the specific sentence for the user to translate.
3. Start the conversation by giving the user a Vietnamese sentence to translate, based on the specified topic and difficulty level.
4. The user will respond by speaking the English translation into their microphone.
5. Listen carefully to their spoken English response.
6. Provide clear, concise feedback **in English** on both the **accuracy of the translation** and their **pronunciation**.
7. If the translation is wrong or pronunciation is off, gently correct them and explain the mistake simply in English. Be very encouraging.
8. Give only ONE Vietnamese phrase at a time. Wait for the user's attempt before providing the next one.
9. Maintain a supportive, positive, and patient tone throughout the entire session.
10. **Adhere strictly to the specified topic and difficulty level above for the Vietnamese sentences you provide.**`;
  }, [level, topic]);

  const stopSession = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (scriptProcessorRef.current) {
        scriptProcessorRef.current.disconnect();
        scriptProcessorRef.current = null;
    }
    if (mediaStreamSourceRef.current) {
        mediaStreamSourceRef.current.disconnect();
        mediaStreamSourceRef.current = null;
    }
    if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
      inputAudioContextRef.current.close();
      inputAudioContextRef.current = null;
    }
    sessionPromiseRef.current?.then(session => session.close());
    sessionPromiseRef.current = null;
    sessionRef.current = null;

    audioPlaybackSources.current.forEach(source => source.stop());
    audioPlaybackSources.current.clear();
    if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
        outputAudioContextRef.current.close();
        outputAudioContextRef.current = null;
    }
    nextStartTimeRef.current = 0;
    
    setIsSessionActive(false);
    setStatusMessage('Session ended. Click the microphone to practice again.');
  }, []);

  const handleNewSession = useCallback(async () => {
    if (isSessionActive) {
      stopSession();
    }
    setMessages([]);
    setDisplayUserTranscription('');
    setDisplayTutorTranscription('');
    currentUserTranscriptionRef.current = '';
    currentTutorTranscriptionRef.current = '';
    setStatusMessage('Connecting to tutor...');

    try {
      inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: INPUT_SAMPLE_RATE });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: OUTPUT_SAMPLE_RATE });

      sessionPromiseRef.current = connectToLiveSession(getSystemPrompt(), {
        onopen: async () => {
            console.log('Session opened.');
            setIsSessionActive(true);
            setStatusMessage('Connected! Start speaking when you are ready.');
            
            try {
                streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
                const source = inputAudioContextRef.current!.createMediaStreamSource(streamRef.current);
                mediaStreamSourceRef.current = source;
                const scriptProcessor = inputAudioContextRef.current!.createScriptProcessor(SCRIPT_PROCESSOR_BUFFER_SIZE, 1, 1);
                scriptProcessorRef.current = scriptProcessor;

                scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                    const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                    const pcmBlob = createPcmBlob(inputData);
                    sessionPromiseRef.current?.then((session) => {
                        session.sendRealtimeInput({ media: pcmBlob });
                    });
                };
                source.connect(scriptProcessor);
                scriptProcessor.connect(inputAudioContextRef.current!.destination);
            } catch (err) {
                console.error('Microphone access denied:', err);
                setStatusMessage('Microphone access denied. Please allow permission.');
                stopSession();
            }
        },
        onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.inputTranscription) {
                currentUserTranscriptionRef.current += message.serverContent.inputTranscription.text;
                setDisplayUserTranscription(currentUserTranscriptionRef.current);
            }
            if (message.serverContent?.outputTranscription) {
                currentTutorTranscriptionRef.current += message.serverContent.outputTranscription.text;
                setDisplayTutorTranscription(currentTutorTranscriptionRef.current);
            }
            if (message.serverContent?.turnComplete) {
                const userText = currentUserTranscriptionRef.current.trim();
                const tutorText = currentTutorTranscriptionRef.current.trim();
                const newMessages: Message[] = [];
                if (userText) newMessages.push({ role: 'user', content: userText });
                if (tutorText) newMessages.push({ role: 'ai', content: tutorText });
                if (newMessages.length > 0) setMessages(prev => [...prev, ...newMessages]);
                
                currentUserTranscriptionRef.current = '';
                currentTutorTranscriptionRef.current = '';
                setDisplayUserTranscription('');
                setDisplayTutorTranscription('');
            }

            const parts = message.serverContent?.modelTurn?.parts;
            if (parts) {
                for (const part of parts) {
                    const base64Audio = part.inlineData?.data;
                    if (base64Audio) {
                        const audioContext = outputAudioContextRef.current!;
                        nextStartTimeRef.current = Math.max(nextStartTimeRef.current, audioContext.currentTime);
        
                        const audioBuffer = await decodeAudioData(decode(base64Audio), audioContext, OUTPUT_SAMPLE_RATE, 1);
                        const source = audioContext.createBufferSource();
                        source.buffer = audioBuffer;
                        source.connect(audioContext.destination);
                        source.onended = () => audioPlaybackSources.current.delete(source);
                        source.start(nextStartTimeRef.current);
                        nextStartTimeRef.current += audioBuffer.duration;
                        audioPlaybackSources.current.add(source);
                    }
                }
            }
            
            if (message.serverContent?.interrupted) {
                audioPlaybackSources.current.forEach(source => source.stop());
                audioPlaybackSources.current.clear();
                nextStartTimeRef.current = 0;
            }
        },
        onerror: (e: ErrorEvent) => {
          console.error('Session error:', e);
          setStatusMessage('A connection error occurred. Please restart.');
          stopSession();
        },
        onclose: (e: CloseEvent) => {
          console.log('Session closed.');
          stopSession();
        },
      });

      sessionRef.current = await sessionPromiseRef.current;
    } catch (error) {
      console.error('Failed to start session:', error);
      setStatusMessage('Failed to start session. Please check your connection.');
      setIsSessionActive(false);
    }
  }, [isSessionActive, getSystemPrompt, stopSession]);
  
  useEffect(() => {
    return () => { stopSession(); };
  }, [stopSession]);
  
  const handleMicButtonClick = () => {
    if (isSessionActive) {
      stopSession();
    } else {
      handleNewSession();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 to-indigo-100 font-sans">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 shadow-lg flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">English Speaking Coach</h1>
          <p className="text-indigo-100 mt-1">Practice your English conversation skills with an AI Tutor</p>
        </div>
        <button onClick={() => setIsHelpModalOpen(true)} className="flex items-center gap-2 text-white bg-white/20 hover:bg-white/30 font-medium py-2 px-4 rounded-lg transition-colors">
          <HelpCircle size={20} />
          <span>Help & Introduction</span>
        </button>
      </div>
      
      {isHelpModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 transition-opacity" onClick={() => setIsHelpModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full m-4 relative transition-transform transform scale-95" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setIsHelpModalOpen(false)} className="absolute top-4 right-4 p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800 rounded-full transition"><X size={20} /></button>
            <h2 className="text-2xl font-bold text-indigo-700 mb-4">How to Use Your AI English Tutor</h2>
            <p className="text-gray-600 mb-6">Welcome to your personal English Speaking Coach! Here's a quick guide to get started:</p>
            <ol className="space-y-4 text-gray-700">
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-indigo-100 text-indigo-600 font-bold rounded-full flex items-center justify-center flex-shrink-0">1</div>
                <div><span className="font-semibold">Configure Your Session:</span> Use the <span className="font-semibold text-indigo-600">Settings</span> panel on the left to choose your proficiency <span className="font-semibold">Level</span> and a <span className="font-semibold">Topic</span> to practice. Click <span className="italic">"Start New Session"</span> when you're ready.</div>
              </li>
               <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-indigo-100 text-indigo-600 font-bold rounded-full flex items-center justify-center flex-shrink-0">2</div>
                <div><span className="font-semibold">Start Speaking:</span> Click the large <span className="font-semibold text-indigo-600">microphone button</span> at the bottom. Your AI tutor, Anna, will greet you and give you a sentence in Vietnamese to translate.</div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-indigo-100 text-indigo-600 font-bold rounded-full flex items-center justify-center flex-shrink-0">3</div>
                <div><span className="font-semibold">Translate & Speak:</span> Speak the English translation clearly into your microphone. You'll see a live transcription of what you're saying.</div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-indigo-100 text-indigo-600 font-bold rounded-full flex items-center justify-center flex-shrink-0">4</div>
                <div><span className="font-semibold">Receive Feedback:</span> Anna will provide instant feedback on your translation accuracy and pronunciation, all in English.</div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-indigo-100 text-indigo-600 font-bold rounded-full flex items-center justify-center flex-shrink-0">5</div>
                <div><span className="font-semibold">End the Session:</span> Click the red microphone button at any time to finish.</div>
              </li>
            </ol>
             <p className="text-center text-sm text-gray-500 mt-8">
              Tạo bởi: Đỗ Như Lâm - Zalo: 0911 855 646
            </p>
             <button onClick={() => setIsHelpModalOpen(false)} className="mt-4 w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition shadow-md">
              Got it, let's practice!
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {isSettingsOpen && (
          <div className="w-80 bg-white shadow-xl p-6 overflow-y-auto relative border-r border-gray-200 transition-all duration-300">
            <button onClick={() => setIsSettingsOpen(false)} className="absolute top-4 right-4 p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800 rounded-lg transition"><X size={20} /></button>
            <h2 className="text-xl font-bold mb-6 text-indigo-700 flex items-center gap-2"><Settings size={22} />Settings</h2>
            <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-indigo-200">
              <h3 className="font-semibold mb-2 text-indigo-800">👋 Meet Your Tutor, Anna!</h3>
              <p className="text-sm text-gray-700 leading-relaxed">I'll provide sentences in Vietnamese for you to translate and speak in English. I'll then give you feedback on your translation and pronunciation. Let's get started!</p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2 text-gray-700">Level</label>
              <select value={level} onChange={(e) => setLevel(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition">
                {LEVELS.map((l) => (<option key={l} value={l}>{l}</option>))}
              </select>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2 text-gray-700">Topic</label>
              <select value={topic} onChange={(e) => setTopic(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition">
                {TOPICS.map((t) => (<option key={t} value={t} disabled={t.includes(':')}>{t}</option>))}
              </select>
            </div>
            <button onClick={handleNewSession} className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition shadow-md disabled:opacity-70" disabled={isSessionActive}>
              🔄 Start New Session
            </button>
          </div>
        )}

        <div className="flex-1 flex flex-col bg-white/50">
          {!isSettingsOpen && (<button onClick={() => setIsSettingsOpen(true)} className="absolute top-24 left-4 p-3 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition z-10"><Menu size={20} /></button>)}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 && !isSessionActive && (
              <div className="text-center text-gray-500 mt-20 flex flex-col items-center">
                <Volume2 size={48} className="mx-auto mb-4 text-indigo-400" />
                <p className="text-lg">Your session is ready.</p><p>Press the microphone button to begin your voice conversation.</p>
              </div>
            )}
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'ai' && <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex-shrink-0 text-white font-bold text-sm flex items-center justify-center">A</div>}
                <div className={`max-w-[80%] p-4 rounded-2xl ${msg.role === 'user' ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-br-none' : 'bg-gray-100 text-gray-800 border border-gray-200 rounded-bl-none'}`}>
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                </div>
              </div>
            ))}
            {displayUserTranscription && (<div className="flex items-end gap-2 justify-end"><div className="max-w-[80%] p-4 rounded-2xl bg-indigo-200 text-indigo-900 rounded-br-none opacity-70"><p className="whitespace-pre-wrap leading-relaxed">{displayUserTranscription}</p></div></div>)}
            {displayTutorTranscription && (<div className="flex items-end gap-2 justify-start"><div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex-shrink-0 text-white font-bold text-sm flex items-center justify-center">A</div><div className="max-w-[80%] p-4 rounded-2xl bg-gray-50 text-gray-700 border border-gray-200 rounded-bl-none opacity-70"><p className="whitespace-pre-wrap leading-relaxed">{displayTutorTranscription}</p></div></div>)}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-6 bg-white/80 backdrop-blur-sm border-t border-gray-200">
            <div className="flex justify-center">
              <button onClick={handleMicButtonClick} className={`p-6 rounded-full shadow-2xl transition-all transform hover:scale-110 ${isSessionActive ? 'bg-red-500 hover:bg-red-600 animate-pulse' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'}`}>
                {isSessionActive ? <MicOff size={32} className="text-white" /> : <Mic size={32} className="text-white" />}
              </button>
            </div>
            <p className="text-center mt-3 text-sm text-gray-600 h-5">{statusMessage}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
