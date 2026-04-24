import React, { useState, useRef, useEffect } from 'react';
import { ChatBubbleLeftRightIcon, XMarkIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your Smart Crime assistant. How can I help you today?',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateBotResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    if (message.includes('hello') || message.includes('hi')) {
      return 'Hello! Welcome to Smart Crime. How can I assist you with our crime monitoring platform?';
    }
    if (message.includes('feature') || message.includes('what can you do')) {
      return 'Smart Crime offers: Real-time incident reporting, Predictive analytics, Role-based access, Secure evidence storage, Mobile app access, and Community alerts. Would you like to know more about any specific feature?';
    }
    if (message.includes('price') || message.includes('cost') || message.includes('pricing')) {
      return 'We offer flexible pricing plans: Starter for small communities, Growth for growing organizations, and Enterprise for large-scale deployments. All plans include core features. Would you like to schedule a demo?';
    }
    if (message.includes('demo') || message.includes('trial')) {
      return 'I\'d be happy to help you schedule a demo! You can click "Request Demo" in the pricing section or fill out the contact form. Our team will reach out within 24 hours.';
    }
    if (message.includes('security') || message.includes('safe') || message.includes('protect')) {
      return 'Security is our top priority! We use end-to-end encryption, role-based access control, audit trails, and secure data storage. All data is hosted in Uganda with full compliance with local regulations.';
    }
    if (message.includes('mobile') || message.includes('app')) {
      return 'Yes! Smart Crime includes a fully-featured mobile app for both iOS and Android. You can report incidents, receive alerts, and access analytics on the go.';
    }
    if (message.includes('uganda') || message.includes('kampala')) {
      return 'Smart Crime is proudly built for Ugandan communities! We understand local needs and are headquartered in Kampala. Our system is optimized for Ugandan law enforcement and community structures.';
    }
    if (message.includes('contact') || message.includes('support') || message.includes('help')) {
      return 'You can reach us at: Email: info@smartcrime.ug, Phone: +256 123 456 789, or use the contact form on our website. Our support team is available 24/7.';
    }
    if (message.includes('bye') || message.includes('goodbye')) {
      return 'Thank you for chatting with Smart Crime! Feel free to reach out anytime. Have a safe day!';
    }
    
    return 'I\'m here to help! You can ask me about our features, pricing, security, mobile app, or how to get started. What would you like to know?';
  };

  const sendMessage = async () => {
    if (inputValue.trim() === '') return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate bot typing delay
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: generateBotResponse(inputValue),
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickActions = [
    { text: 'Tell me about features', action: () => setInputValue('What features does Smart Crime offer?') },
    { text: 'Pricing info', action: () => setInputValue('What are your pricing plans?') },
    { text: 'Security details', action: () => setInputValue('How secure is my data?') },
    { text: 'Request demo', action: () => setInputValue('I want to schedule a demo') }
  ];

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-110 animate-bounce"
      >
        <ChatBubbleLeftRightIcon className="h-6 w-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 h-96 bg-white rounded-lg shadow-2xl flex flex-col animate-fade-in-up">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
        <div className="flex items-center">
          <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
          <div>
            <h3 className="font-semibold">Smart Crime Assistant</h3>
            <p className="text-xs text-blue-100">Always here to help</p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-white hover:bg-blue-700 p-1 rounded"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs px-3 py-2 rounded-lg ${
                message.sender === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p className="text-sm">{message.text}</p>
              <p className={`text-xs mt-1 ${
                message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
              }`}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-900 px-3 py-2 rounded-lg">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <div className="px-4 py-2 border-t border-gray-200">
        <div className="flex flex-wrap gap-1">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-full transition-colors"
            >
              {action.text}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <button
            onClick={sendMessage}
            disabled={inputValue.trim() === '' || isTyping}
            className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <PaperAirplaneIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
