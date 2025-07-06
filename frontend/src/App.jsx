import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageCircle, Loader2, Settings, X, Menu } from 'lucide-react';

const ChatBot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [backendUrl, setBackendUrl] = useState('http://localhost:5000');
  const [showSettings, setShowSettings] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('checking');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check backend connection on component mount
  useEffect(() => {
    checkBackendConnection();
  }, [backendUrl]);

  const checkBackendConnection = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/health`);
      if (response.ok) {
        setConnectionStatus('connected');
      } else {
        setConnectionStatus('error');
      }
    } catch (error) {
      setConnectionStatus('error');
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    if (connectionStatus !== 'connected') {
      alert('Backend is not connected. Please check your backend URL in settings.');
      return;
    }

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const payload = {
        messages: [...messages, userMessage]
      };

      const response = await fetch(`${backendUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const result = await response.json();
        const botMessage = {
          role: 'assistant',
          content: result.choices[0].message.content
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        const errorData = await response.json();
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `❌ Error ${response.status}: ${errorData.error || 'Unknown error'}`,
          isError: true
        }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `❌ Network error: ${error.message}`,
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-green-400';
      case 'error': return 'text-red-400';
      default: return 'text-yellow-400';
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return 'Connected';
      case 'error': return 'Disconnected';
      default: return 'Checking...';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-2 sm:p-4 md:p-6">
      <div className="w-full max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-5xl bg-white/10 backdrop-blur-lg rounded-lg sm:rounded-xl md:rounded-2xl shadow-2xl border border-white/20 overflow-hidden h-[95vh] sm:h-[90vh] md:h-[85vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-3 sm:p-4 md:p-6 text-white flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
              <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <h1 className="text-sm sm:text-lg md:text-2xl font-bold truncate">Omkar's Groq ChatBot</h1>
                <p className="text-purple-100 text-xs sm:text-sm hidden sm:block">Powered by LLaMA 3 via Python Backend</p>
              </div>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
              {/* Connection Status - Hidden on mobile */}
              <div className="text-xs sm:text-sm hidden md:block">
                <span className="text-purple-100">Backend: </span>
                <span className={getConnectionStatusColor()}>{getConnectionStatusText()}</span>
              </div>
              
              {/* Mobile menu button */}
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-1.5 sm:p-2 hover:bg-white/20 rounded-lg transition-colors"
                  aria-label="Settings"
                >
                  <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button
                  onClick={clearChat}
                  className="px-2 py-1.5 sm:px-4 sm:py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-xs sm:text-sm"
                >
                  <span className="hidden sm:inline">Clear Chat</span>
                  <span className="sm:hidden">Clear</span>
                </button>
              </div>
            </div>
          </div>
          
          {/* Mobile connection status */}
          <div className="mt-2 text-xs md:hidden">
            <span className="text-purple-100">Backend: </span>
            <span className={getConnectionStatusColor()}>{getConnectionStatusText()}</span>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="bg-gray-800/50 p-3 sm:p-4 border-b border-white/10 flex-shrink-0">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold text-sm sm:text-base">Settings</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-white"
                aria-label="Close settings"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs sm:text-sm text-gray-300 mb-1">
                  Backend URL
                </label>
                <input
                  type="text"
                  value={backendUrl}
                  onChange={(e) => setBackendUrl(e.target.value)}
                  placeholder="http://localhost:5000"
                  className="w-full p-2 sm:p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none text-sm"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Make sure your Python backend is running on this URL
                </p>
              </div>
              <button
                onClick={checkBackendConnection}
                className="px-3 py-2 sm:px-4 sm:py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm"
              >
                Test Connection
              </button>
            </div>
          </div>
        )}

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4 bg-gray-900/20">
          {messages.length === 0 ? (
            <div className="text-center text-gray-400 mt-8 sm:mt-16 md:mt-20">
              <MessageCircle className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 opacity-50" />
              <p className="text-base sm:text-lg font-medium">Start a conversation!</p>
              <p className="text-sm">Ask me anything and I'll help you out.</p>
              {connectionStatus !== 'connected' && (
                <p className="text-red-400 text-sm mt-2">
                  ⚠️ Backend not connected. Check settings.
                </p>
              )}
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[75%] md:max-w-xs lg:max-w-md xl:max-w-lg px-3 py-2 sm:px-4 sm:py-3 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                      : message.isError
                      ? 'bg-red-500/20 text-red-200 border border-red-500/30'
                      : 'bg-gray-700/50 text-gray-100 border border-gray-600/30'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                    {message.content}
                  </p>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-700/50 border border-gray-600/30 px-3 py-2 sm:px-4 sm:py-3 rounded-2xl">
                <div className="flex items-center space-x-2 text-gray-300">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-3 sm:p-4 md:p-6 bg-gray-800/30 border-t border-white/10 flex-shrink-0">
          <div className="flex space-x-2 sm:space-x-4">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message here..."
              className="flex-1 p-2 sm:p-3 md:p-4 bg-gray-700/50 text-white rounded-xl border border-gray-600 focus:border-purple-500 focus:outline-none resize-none text-sm sm:text-base"
              rows="1"
              disabled={isLoading}
              style={{ minHeight: '40px' }}
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || !input.trim() || connectionStatus !== 'connected'}
              className="px-3 py-2 sm:px-4 sm:py-3 md:px-6 md:py-4 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-all duration-200 flex items-center justify-center space-x-1 sm:space-x-2 min-w-[50px] sm:min-w-[80px]"
            >
              <Send className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline text-sm">Send</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;