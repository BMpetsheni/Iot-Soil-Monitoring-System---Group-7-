
import React, { useState, useEffect, useRef } from 'react';
import { useData } from '../context/DataContext';
import { getChatbotResponse } from '../services/geminiService';
import { ChatMessage } from '../types';
import Loader from '../components/Loader';

const AskAiPage: React.FC = () => {
  const { soilData, weatherData, loading: dataLoading, error: dataError } = useData();
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState<string>('');
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to the bottom of the chat history when a new message is added
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isChatLoading || !weatherData) return;

    const newHistory: ChatMessage[] = [...chatHistory, { role: 'user', text: userInput }];
    setChatHistory(newHistory);
    const currentInput = userInput;
    setUserInput('');
    setIsChatLoading(true);

    try {
        const response = await getChatbotResponse(currentInput, soilData, weatherData, newHistory);
        setChatHistory(prev => [...prev, { role: 'model', text: response }]);
    } catch (err) {
        setChatHistory(prev => [...prev, { role: 'model', text: "Sorry, I couldn't get a response. Please try again." }]);
        console.error(err);
    } finally {
        setIsChatLoading(false);
    }
  };

  if (dataLoading) {
    return <div className="flex justify-center items-center h-full"><Loader message="Loading farm data..." /></div>
  }

  if (dataError) {
    return <div className="text-red-500 text-center p-4">{dataError}</div>
  }

  return (
    <div className="flex flex-col h-full">
      <h1 className="text-3xl font-bold text-on-surface mb-4">Ask AgriSense AI</h1>
      <div className="bg-surface rounded-xl shadow-sm flex flex-col flex-1">
        <div className="p-4 border-b border-slate-200">
          <p className="text-sm text-on-surface-secondary">Ask questions about your soil data, weather, or get advice.</p>
        </div>
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {chatHistory.length === 0 && (
              <div className="text-center text-on-surface-secondary p-8">
                  <span className="material-symbols-outlined text-6xl">chat</span>
                  <p className="mt-2">Start a conversation by typing a question below.</p>
              </div>
          )}
          {chatHistory.map((msg, index) => (
            <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
              {msg.role === 'model' && <span className="material-symbols-outlined text-primary bg-slate-200 rounded-full p-1.5">auto_awesome</span>}
              <div className={`max-w-xl p-3 rounded-xl ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-slate-100 text-on-surface'}`}>
                <p className="text-sm">{msg.text}</p>
              </div>
            </div>
          ))}
          {isChatLoading && (
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-primary bg-slate-200 rounded-full p-1.5">auto_awesome</span>
              <div className="max-w-xl p-3 rounded-xl bg-slate-100 text-on-surface">
                 <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-75"></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-150"></div>
                 </div>
              </div>
            </div>
          )}
        </div>
        <div className="p-4 border-t border-slate-200 bg-white rounded-b-xl">
          <form onSubmit={handleSendMessage} className="flex items-center gap-3">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="e.g., Is it a good time to apply fertilizer?"
              className="flex-1 w-full px-3 py-2 text-sm border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              disabled={isChatLoading}
            />
            <button type="submit" disabled={isChatLoading || !userInput.trim()} className="px-4 py-2 bg-primary text-white font-semibold rounded-lg shadow-sm hover:bg-primary-dark disabled:bg-gray-400 transition-colors">
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AskAiPage;
