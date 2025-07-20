// ChatbotAssistant.jsx
import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  X, 
  Bot, 
  User, 
  Lightbulb, 
  FileText, 
  MapPin, 
  Clock,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const ChatbotAssistant = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      from: 'bot', 
      text: 'Hello! I\'m your CityView360 assistant. I can help you with:',
      type: 'greeting',
      suggestions: [
        'Submit a complaint',
        'Check complaint status',
        'Find nearby issues',
        'Get city information'
      ]
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // AI Response Generator (Mock implementation)
  const generateAIResponse = async (userMessage) => {
    setIsTyping(true);
    
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    const lowerMessage = userMessage.toLowerCase();
    let response = { text: '', type: 'text', suggestions: [] };

    if (lowerMessage.includes('complaint') || lowerMessage.includes('issue') || lowerMessage.includes('problem')) {
      response = {
        text: 'I can help you submit a complaint! Please provide details about the issue including location, category (sanitation, roads, water, etc.), and description. You can also upload photos to help us understand the problem better.',
        type: 'complaint_help',
        suggestions: ['Submit new complaint', 'View my complaints', 'Check status']
      };
    } else if (lowerMessage.includes('status') || lowerMessage.includes('update')) {
      response = {
        text: 'I can help you check the status of your complaints. Would you like me to show you your recent complaints and their current status?',
        type: 'status_check',
        suggestions: ['Show my complaints', 'Check specific complaint', 'Get updates']
      };
    } else if (lowerMessage.includes('nearby') || lowerMessage.includes('location') || lowerMessage.includes('map')) {
      response = {
        text: 'I can show you issues reported in your area! This helps you see what others are experiencing and avoid duplicate reports. Would you like to see the map view?',
        type: 'location_help',
        suggestions: ['Show map', 'Nearby issues', 'Report similar issue']
      };
    } else if (lowerMessage.includes('city') || lowerMessage.includes('information') || lowerMessage.includes('services')) {
      response = {
        text: 'I can provide information about city services, upcoming events, and important announcements. What specific information are you looking for?',
        type: 'city_info',
        suggestions: ['City services', 'Events calendar', 'Emergency contacts']
      };
    } else if (lowerMessage.includes('help') || lowerMessage.includes('support')) {
      response = {
        text: 'I\'m here to help! I can assist with submitting complaints, checking status, finding nearby issues, and providing city information. What would you like to do?',
        type: 'help',
        suggestions: ['Submit complaint', 'Check status', 'City information', 'Contact support']
      };
    } else {
      response = {
        text: 'I understand you\'re asking about "' + userMessage + '". Let me help you with that. Could you provide more details or choose from the options below?',
        type: 'general',
        suggestions: ['Submit complaint', 'Check status', 'City information', 'Get help']
      };
    }

    setIsTyping(false);
    return response;
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage = input.trim();
    setInput('');
    setShowSuggestions(false);

    // Add user message
    setMessages(prev => [...prev, { 
      from: 'user', 
      text: userMessage,
      type: 'user_message'
    }]);

    // Generate AI response
    const aiResponse = await generateAIResponse(userMessage);
    setMessages(prev => [...prev, { 
      from: 'bot', 
      text: aiResponse.text,
      type: aiResponse.type,
      suggestions: aiResponse.suggestions
    }]);
  };

  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion);
    setShowSuggestions(false);
  };

  const getMessageIcon = (from, type) => {
    if (from === 'user') {
      return <User className="h-5 w-5 text-indigo-600" />;
    }
    
    switch (type) {
      case 'complaint_help':
        return <FileText className="h-5 w-5 text-green-600" />;
      case 'status_check':
        return <CheckCircle className="h-5 w-5 text-blue-600" />;
      case 'location_help':
        return <MapPin className="h-5 w-5 text-purple-600" />;
      case 'city_info':
        return <Lightbulb className="h-5 w-5 text-yellow-600" />;
      default:
        return <Bot className="h-5 w-5 text-indigo-600" />;
    }
  };

  const getMessageStyle = (from, type) => {
    if (from === 'user') {
      return 'bg-indigo-600 text-white ml-auto';
    }
    
    switch (type) {
      case 'complaint_help':
        return 'bg-green-50 border-l-4 border-green-500';
      case 'status_check':
        return 'bg-blue-50 border-l-4 border-blue-500';
      case 'location_help':
        return 'bg-purple-50 border-l-4 border-purple-500';
      case 'city_info':
        return 'bg-yellow-50 border-l-4 border-yellow-500';
      default:
        return 'bg-gray-50';
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-50">
      {open && (
        <div className="w-96 bg-white rounded-xl shadow-2xl mb-4 flex flex-col overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">CityView360 Assistant</h3>
                <p className="text-xs text-indigo-100">AI-powered civic support</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-white hover:text-indigo-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 space-y-4 h-96 overflow-y-auto bg-gray-50">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex items-start space-x-3 ${msg.from === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div className="flex-shrink-0">
                  {getMessageIcon(msg.from, msg.type)}
                </div>
                <div className={`flex-1 max-w-xs ${msg.from === 'user' ? 'text-right' : ''}`}>
                  <div className={`p-3 rounded-lg ${getMessageStyle(msg.from, msg.type)}`}>
                    <p className="text-sm">{msg.text}</p>
                  </div>
                  
                  {/* Suggestions */}
                  {msg.from === 'bot' && msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {msg.suggestions.map((suggestion, suggestionIdx) => (
                        <button
                          key={suggestionIdx}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="block w-full text-left px-3 py-2 text-xs bg-white border border-gray-200 rounded-md hover:bg-gray-50 hover:border-indigo-300 transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {/* Typing indicator */}
            {isTyping && (
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <Bot className="h-5 w-5 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="border-t bg-white">
            <div className="flex items-center p-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                disabled={isTyping}
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="ml-2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Chat Button */}
      <button
        onClick={() => setOpen(!open)}
        className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105"
        aria-label="Open chatbot assistant"
      >
        {open ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
      </button>
    </div>
  );
};

export default ChatbotAssistant; 