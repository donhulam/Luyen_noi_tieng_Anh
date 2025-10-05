import React, { useRef, useEffect } from 'react';
import { Message, MessageSender } from '../types';

interface ChatWindowProps {
  messages: Message[];
}

const ChatBubble: React.FC<{ message: Message }> = ({ message }) => {
  const isUser = message.sender === MessageSender.USER;
  const bubbleClasses = isUser
    ? 'bg-teal-600 self-end'
    : 'bg-gray-700 self-start';
  const textClasses = isUser ? 'text-white' : 'text-gray-200';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`max-w-xl px-4 py-2 rounded-lg shadow-md ${bubbleClasses}`}>
            <p className={`text-base ${textClasses}`}>{message.text}</p>
        </div>
    </div>
  );
};

const SystemMessage: React.FC<{ text: string }> = ({ text }) => {
    return (
        <div className="text-center my-4">
            <p className="text-sm text-gray-500 italic">{text}</p>
        </div>
    );
};

const ChatWindow: React.FC<ChatWindowProps> = ({ messages }) => {
  const endOfMessagesRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex-1 p-6 overflow-y-auto bg-gray-900">
      {messages.map((msg) => (
        msg.sender === MessageSender.SYSTEM
            ? <SystemMessage key={msg.id} text={msg.text} />
            : <ChatBubble key={msg.id} message={msg} />
      ))}
      <div ref={endOfMessagesRef} />
    </div>
  );
};

export default ChatWindow;