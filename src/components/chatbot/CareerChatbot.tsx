import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Send, 
  Bot, 
  User, 
  MessageCircle, 
  Lightbulb,
  TrendingUp,
  GraduationCap,
  DollarSign,
  Clock,
  Loader2,
  BarChart3,
  Target,
  Map,
  Copy,
  Check
} from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  suggestions?: string[];
  careerPath?: any;
  isCareerPath?: boolean;
  isTyping?: boolean;
  rawContent?: string;
}

interface CareerChatbotProps {
  streamName?: string;
  userProfile?: any;
}

// Typewriter component for animated text
const TypewriterText: React.FC<{ 
  text: string; 
  speed?: number; 
  onComplete?: () => void;
  className?: string;
}> = ({ text, speed = 30, onComplete, className = "" }) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);
      return () => clearTimeout(timer);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, text, speed, onComplete]);

  return (
    <div className={`${className} whitespace-pre-wrap`}>
      {displayText}
      {currentIndex < text.length && (
        <span className="animate-pulse">|</span>
      )}
    </div>
  );
};

// Markdown-like text renderer
const MarkdownRenderer: React.FC<{ content: string; isAnimated?: boolean }> = ({ 
  content, 
  isAnimated = false 
}) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const processContent = (text: string) => {
    // Split content into sections
    const sections = text.split('\n\n').filter(section => section.trim());
    
    return sections.map((section, index) => {
      const lines = section.trim().split('\n');
      
      return (
        <div key={index} className="mb-4 last:mb-0">
          {lines.map((line, lineIndex) => {
            const trimmedLine = line.trim();
            
            // Headers (starting with #)
            if (trimmedLine.startsWith('# ')) {
              return (
                <h2 key={lineIndex} className="text-lg font-bold text-gray-900 mb-2">
                  {trimmedLine.substring(2)}
                </h2>
              );
            }
            
            // Subheaders (starting with ##)
            if (trimmedLine.startsWith('## ')) {
              return (
                <h3 key={lineIndex} className="text-md font-semibold text-gray-800 mb-2">
                  {trimmedLine.substring(3)}
                </h3>
              );
            }
            
            // Bold sections (wrapped in **)
            if (trimmedLine.includes('**')) {
              const parts = trimmedLine.split('**');
              return (
                <div key={lineIndex} className="mb-2">
                  {parts.map((part, partIndex) => 
                    partIndex % 2 === 1 ? (
                      <strong key={partIndex} className="font-semibold text-gray-900">
                        {part}
                      </strong>
                    ) : (
                      <span key={partIndex}>{part}</span>
                    )
                  )}
                </div>
              );
            }
            
            // Bullet points
            if (trimmedLine.startsWith('• ') || trimmedLine.startsWith('- ')) {
              return (
                <div key={lineIndex} className="flex items-start gap-2 mb-1 ml-4">
                  <span className="text-primary font-bold">•</span>
                  <span className="text-gray-700">{trimmedLine.substring(2)}</span>
                </div>
              );
            }
            
            // Emoji sections (starting with emoji)
            if (/^[^\w\s]/.test(trimmedLine)) {
              const emojiMatch = trimmedLine.match(/^([^\w\s]+)\s*(.*)/);
              if (emojiMatch) {
                return (
                  <div key={lineIndex} className="flex items-center gap-2 mb-2 p-2 bg-blue-50 rounded-lg">
                    <span className="text-lg">{emojiMatch[1]}</span>
                    <strong className="text-blue-900">{emojiMatch[2]}</strong>
                  </div>
                );
              }
            }
            
            // Regular paragraphs
            if (trimmedLine && !trimmedLine.startsWith('•') && !trimmedLine.startsWith('-')) {
              return (
                <p key={lineIndex} className="text-gray-700 mb-2 leading-relaxed">
                  {trimmedLine}
                </p>
              );
            }
            
            return null;
          })}
        </div>
      );
    });
  };

  if (isAnimated) {
    return (
      <div className="space-y-2">
        <TypewriterText 
          text={content} 
          speed={20}
          className="text-sm"
        />
      </div>
    );
  }

  return (
    <div className="text-sm space-y-2">
      {processContent(content)}
      
      {/* Copy button for long content */}
      {content.length > 200 && (
        <div className="mt-3 pt-2 border-t border-gray-100">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={() => copyToClipboard(content)}
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 mr-1" />
                {t('chatbot.copied')}
              </>
            ) : (
              <>
                <Copy className="h-3 w-3 mr-1" />
                {t('chatbot.copy')}
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

const CareerChatbot: React.FC<CareerChatbotProps> = ({ streamName, userProfile }) => {
  const { t, i18n } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: `${t('chatbot.greeting')}${streamName ? `${t('chatbot.greeting_stream')}${streamName}` : ''}. 

${t('chatbot.ask_about')}
${t('chatbot.career_paths')}  
${t('chatbot.salary_comparisons')}
${t('chatbot.education_vs_skills')}
${t('chatbot.industry_trends')}

${t('chatbot.try_asking')}`,
      sender: 'bot',
      timestamp: new Date(),
      suggestions: [
        t('chatbot.suggestions.career_path_graphic'),
        t('chatbot.suggestions.graduation_worth'),
        t('chatbot.suggestions.compare_salaries'),
        t('chatbot.suggestions.high_growth')
      ]
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [availableRoles, setAvailableRoles] = useState<any[]>([]);
  const [typingMessageId, setTypingMessageId] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Quick suggestion buttons
  const quickSuggestions = [
    { text: t('chatbot.suggestions.career_path_graphic'), icon: Map },
    { text: t('chatbot.suggestions.compare_salaries'), icon: BarChart3 },
    { text: t('chatbot.suggestions.graduation_worth'), icon: GraduationCap },
    { text: t('chatbot.suggestions.high_growth'), icon: TrendingUp }
  ];

  // Fetch available roles on component mount
  useEffect(() => {
    fetchAvailableRoles();
  }, []);

  const fetchAvailableRoles = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/career-path/roles');
      const data = await response.json();
      if (data.success) {
        setAvailableRoles(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch available roles:', error);
    }
  };

  const generateCareerPath = async (role: string) => {
    try {
      const response = await fetch('http://localhost:3001/api/career-path/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          role: role,
          userProfile: userProfile 
        })
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to generate career path:', error);
      return null;
    }
  };

  const askCareerQuestion = async (question: string) => {
    try {
      const response = await fetch('http://localhost:3001/api/career-path/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          question: question,
          userProfile: userProfile,
          language: i18n.language
        })
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to ask career question:', error);
      return null;
    }
  };

  const compareCareerRoles = async (role1: string, role2: string) => {
    try {
      const response = await fetch('http://localhost:3001/api/career-path/compare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role1, role2 })
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to compare careers:', error);
      return null;
    }
  };

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsTyping(true);

    // Add a typing placeholder message
    const typingId = (Date.now() + 1).toString();
    setTypingMessageId(typingId);
    
    const typingMessage: Message = {
      id: typingId,
      text: '',
      sender: 'bot',
      timestamp: new Date(),
      isTyping: true
    };
    
    setMessages(prev => [...prev, typingMessage]);

    // Simulate some processing time
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    // Check if user is asking for a career path
    const careerPathRequest = detectCareerPathRequest(messageText);
    
    if (careerPathRequest) {
      try {
        const careerPathData = await generateCareerPath(careerPathRequest.role);
        
        if (careerPathData && careerPathData.success) {
          // Remove typing message and add real response
          setMessages(prev => prev.filter(m => m.id !== typingId));
          
          const botMessage: Message = {
            id: (Date.now() + 2).toString(),
            text: `Here's a comprehensive career analysis for **${careerPathRequest.role}**:

🎯 **Career Overview**
${careerPathData.data.role} is a dynamic field with excellent growth prospects. Let me break down the complete career path for you.`,
            sender: 'bot',
            timestamp: new Date(),
            careerPath: careerPathData.data,
            isCareerPath: true,
            rawContent: JSON.stringify(careerPathData.data, null, 2),
            suggestions: [
              `Compare ${careerPathRequest.role} with another role`,
              "What skills should I focus on first?",
              "Show me salary progression timeline",
              "What are the biggest challenges in this field?"
            ]
          };
          setMessages(prev => [...prev, botMessage]);
        } else {
          throw new Error('Failed to generate career path');
        }
      } catch (error) {
        // Remove typing message and add error response
        setMessages(prev => prev.filter(m => m.id !== typingId));
        
        const errorMessage: Message = {
          id: (Date.now() + 2).toString(),
          text: `I apologize, but I'm having trouble generating that career path right now. This could be due to high demand or a temporary service issue. 

**Here's what you can try:**
• Ask about general career advice
• Try a different career role
• Ask about education vs skills debate
• Inquire about salary comparisons

I'm still here to help with other career questions!`,
          sender: 'bot',
          timestamp: new Date(),
          suggestions: [
            t('chatbot.suggestions.graduation_worth'),
            t('chatbot.suggestions.show_roles'),
            t('chatbot.suggestions.alternative_paths'),
            t('chatbot.suggestions.choose_between')
          ]
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } else {
      // Handle all other questions using AI
      try {
        const aiQuestionResponse = await askCareerQuestion(messageText);
        
        if (aiQuestionResponse && aiQuestionResponse.success) {
          // Remove typing message and add AI response
          setMessages(prev => prev.filter(m => m.id !== typingId));
          
          const botMessage: Message = {
            id: (Date.now() + 2).toString(),
            text: aiQuestionResponse.data.answer,
            sender: 'bot',
            timestamp: new Date(),
            suggestions: generateSmartSuggestions(messageText)
          };
          setMessages(prev => [...prev, botMessage]);
        } else {
          throw new Error('Failed to get AI response');
        }
      } catch (error) {
        console.error('AI Question Error:', error);
        
        // Remove typing message and add fallback response
        setMessages(prev => prev.filter(m => m.id !== typingId));
        
        const fallbackMessage: Message = {
          id: (Date.now() + 2).toString(),
          text: generateFallbackForQuestion(messageText),
          sender: 'bot',
          timestamp: new Date(),
          suggestions: generateSmartSuggestions(messageText)
        };
        setMessages(prev => [...prev, fallbackMessage]);
      }
    }

    setIsTyping(false);
    setTypingMessageId(null);
  };

  const generateSmartSuggestions = (userQuestion: string): string[] => {
    const question = userQuestion.toLowerCase();
    
    if (question.includes('skill') || question.includes('pay')) {
      return [
        "What skills should I learn first?",
        "How long does it take to master these skills?",
        "Which skills have the best job security?",
        "Show me career paths using these skills"
      ];
    }
    
    if (question.includes('career') || question.includes('job')) {
      return [
        "Compare two career options",
        "What's the job market outlook?",
        "Show me salary progression",
        "What education do I need?"
      ];
    }
    
    if (question.includes('salary') || question.includes('money')) {
      return [
        "How can I negotiate better salary?",
        "What affects salary growth?",
        "Compare salaries across industries",
        "When should I expect a raise?"
      ];
    }
    
    return [
      "Tell me about high-growth careers",
      "What are alternative career paths?",
      "Help me plan my next career move",
      "Show me education vs skills comparison"
    ];
  };

  const generateFallbackForQuestion = (question: string): string => {
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes('skills') && lowerQuestion.includes('pay')) {
      return `# Skills That Pay the Most in 2025

Based on current market trends in India:

💻 **High-Demand Tech Skills:**
• **Cloud Computing** (AWS/Azure): ₹8-25 LPA
• **Data Science & Machine Learning**: ₹6-20 LPA
• **Cybersecurity**: ₹7-18 LPA
• **Full-Stack Development**: ₹5-15 LPA
• **DevOps Engineering**: ₹8-22 LPA

🎯 **Specialized Business Skills:**
• **Product Management**: ₹10-30 LPA
• **Digital Marketing Strategy**: ₹4-12 LPA
• **Sales & Business Development**: ₹5-20 LPA (with commissions)

📈 **Quick Tips:**
• Combine technical + business skills for maximum impact
• Focus on skills with growing demand (AI, cloud, cybersecurity)
• Get certified to validate your expertise
• Build a portfolio to showcase your abilities

The key is choosing skills that match both your interests and market demand!`;
    }
    
    return `I'm here to help with your career question: "${question}"

While I'm having some connectivity issues with my full AI system, I can still provide guidance on:

🎯 **Career Planning:**
• Role analysis and growth paths
• Skill development strategies
• Industry insights and trends

💰 **Compensation & Growth:**
• Salary benchmarking
• Negotiation strategies
• Performance improvement tips

🎓 **Education & Learning:**
• Degree vs certification decisions
• Online learning recommendations
• Skill gap analysis

Please try asking a more specific question, and I'll do my best to provide detailed, helpful advice!`;
  };

  const detectCareerPathRequest = (message: string) => {
    const lowerMessage = message.toLowerCase();
    
    // Check for career path keywords
    if (lowerMessage.includes('career path') || 
        lowerMessage.includes('show me career') ||
        lowerMessage.includes('path for')) {
      
      // Extract role name
      const availableRoleNames = availableRoles.map(role => role.role.toLowerCase());
      const foundRole = availableRoleNames.find(role => 
        lowerMessage.includes(role.toLowerCase())
      );
      
      if (foundRole) {
        return { role: availableRoles.find(r => r.role.toLowerCase() === foundRole)?.role };
      }
    }

    // Direct role mention (e.g., "UI/UX Designer career")
    const roleKeywords = ['designer', 'manager', 'analyst', 'developer', 'engineer', 'writer', 'marketer'];
    if (roleKeywords.some(keyword => lowerMessage.includes(keyword))) {
      const foundRole = availableRoles.find(role => 
        role.role.toLowerCase().split(' ').some((word: string) => 
          lowerMessage.includes(word.toLowerCase())
        )
      );
      
      if (foundRole) {
        return { role: foundRole.role };
      }
    }

    return null;
  };

  const generateBotResponse = (userMessage: string): { text: string; suggestions?: string[] } => {
    const message = userMessage.toLowerCase();

    // Rule-based responses for now (will be replaced with LLM)
    if (message.includes('graduation') || message.includes('degree') || message.includes('worth')) {
      return {
        text: `Great question! Whether graduation is worth it depends on several factors:

🎓 **Degree Benefits:**
• Higher average salaries (typically 40-60% more)
• Better job security and career growth
• Access to specialized roles and industries
• Networking opportunities

💼 **Alternative Paths:**
• Skill-based certifications (6 months - 2 years)
• Trade schools and vocational training
• Online bootcamps and courses
• Entrepreneurship

The decision depends on your career goals, financial situation, and personal preferences. Would you like me to show you specific salary comparisons for ${streamName || 'your field'}?`,
        suggestions: [
          "Show me salary data",
          "What about job security?",
          "Tell me about skill-based alternatives",
          "How long does it take to see ROI?"
        ]
      };
    }

    if (message.includes('salary') || message.includes('money') || message.includes('income')) {
      return {
        text: `Here's a salary comparison for different education paths:

📊 **Average Starting Salaries:**

**With Degree:**
• Engineering Graduate: ₹4-8 LPA
• Business Graduate: ₹3-6 LPA
• Science Graduate: ₹2.5-5 LPA

**Skill-Based Jobs:**
• Web Developer (self-taught): ₹2-4 LPA
• Digital Marketer: ₹2-3.5 LPA
• Graphic Designer: ₹1.5-3 LPA

**After 3-5 Years:**
• Degree holders: 60-100% salary increase
• Skill-based: 40-80% salary increase

However, top performers in skill-based roles can earn as much as degree holders. It's about dedication and continuous learning!`,
        suggestions: [
          "Show me growth trajectories",
          "What about job satisfaction?",
          "Which path has faster entry?",
          "Tell me about hybrid approaches"
        ]
      };
    }

    if (message.includes('alternative') || message.includes('option') || message.includes('path')) {
      return {
        text: `Here are some alternative career paths without traditional graduation:

🚀 **Tech & Digital:**
• Full-stack development (6-12 months training)
• Digital marketing specialist
• UI/UX design
• Data analysis and visualization

🛠️ **Skilled Trades:**
• Electrical work
• Plumbing and HVAC
• Automotive repair
• Construction management

💼 **Business & Services:**
• Real estate
• Insurance sales
• Event planning
• Content creation/YouTube

📈 **Growth Opportunities:**
Many of these paths offer entrepreneurship opportunities and can lead to higher earnings than traditional jobs!`,
        suggestions: [
          "Tell me about tech bootcamps",
          "What about starting a business?",
          "Which has the lowest entry barrier?",
          "Show me success stories"
        ]
      };
    }

    if (message.includes('short') || message.includes('quick') || message.includes('fast')) {
      return {
        text: `Here are some short-term job options you can start within 3-6 months:

⚡ **Immediate Opportunities (0-3 months):**
• Delivery services (Zomato, Swiggy)
• Ride-sharing (Uber, Ola)
• Customer service (call centers)
• Data entry and virtual assistance

🎯 **Quick Training Jobs (3-6 months):**
• Basic coding/web development
• Digital marketing assistant
• Graphic design basics
• Social media management

💰 **Earning Potential:**
• Entry: ₹15k-25k/month
• With experience: ₹25k-40k/month
• Freelancing: ₹30k-60k/month

These can be great stepping stones while you decide on long-term education!`,
        suggestions: [
          "How do I start freelancing?",
          "Which skills pay the most?",
          "Can I do this while studying?",
          "Tell me about online opportunities"
        ]
      };
    }

    // Default response
    return {
      text: `I understand you're looking for career guidance. I'm here to help you compare education paths, salary expectations, and career alternatives. 

Some popular topics I can help with:
• Graduation vs skill-based career paths
• Salary comparisons and ROI analysis  
• Short-term job opportunities
• Alternative career options
• Industry trends and growth prospects

What specific aspect would you like to explore?`,
      suggestions: [
        "Is graduation worth the investment?",
        "Show me salary data",
        "What are my alternatives?",
        "Quick earning opportunities"
      ]
    };
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(currentMessage);
    }
  };

  return (
    <Card className="h-full flex flex-col max-h-[600px]">
      <CardHeader className="flex-shrink-0 border-b">
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          {t('chatbot.title')}
          <Badge variant="secondary" className="ml-2">{t('chatbot.beta')}</Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {t('chatbot.subtitle')}
        </p>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        {/* Messages Area */}
        <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.sender === 'bot' && (
                  <Avatar className="w-8 h-8">
                    <AvatarFallback>
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.sender === 'user'
                      ? 'bg-primary text-primary-foreground ml-12'
                      : 'bg-muted'
                  }`}
                >
                  {/* Show typing indicator */}
                  {message.isTyping ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">
                        {t('chatbot.thinking')}
                      </span>
                    </div>
                  ) : (
                    <>
                      {/* Render message with markdown support and animation */}
                      {message.sender === 'bot' ? (
                        <MarkdownRenderer 
                          content={message.text}
                          isAnimated={message.id === messages[messages.length - 1]?.id && !message.isCareerPath}
                        />
                      ) : (
                        <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                      )}
                    </>
                  )}
                  
                  {/* Career Path Visualization */}
                  {message.isCareerPath && message.careerPath && (
                    <div className="mt-4 space-y-4">
                      <div className="bg-white rounded-lg p-4 shadow-sm border">
                        <h3 className="font-semibold text-base mb-3 text-gray-800">
                          {message.careerPath.role} Career Path
                        </h3>
                        
                        {/* Entry Level */}
                        {message.careerPath.career_path.entry_level && (
                          <div className="mb-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                            <div className="flex items-center gap-2 mb-2">
                              <Target className="h-4 w-4 text-blue-600" />
                              <h4 className="font-medium text-blue-900">
                                {message.careerPath.career_path.entry_level.title}
                              </h4>
                            </div>
                            <div className="text-sm text-gray-700 space-y-1">
                              <p><strong>Duration:</strong> {message.careerPath.career_path.entry_level.duration}</p>
                              <p><strong>Salary:</strong> {message.careerPath.career_path.entry_level.salary_range}</p>
                              <p><strong>Education:</strong> {message.careerPath.career_path.entry_level.required_education}</p>
                              {message.careerPath.career_path.entry_level.required_skills && (
                                <div>
                                  <strong>Key Skills:</strong>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {message.careerPath.career_path.entry_level.required_skills.slice(0, 3).map((skill: string, idx: number) => (
                                      <Badge key={idx} variant="secondary" className="text-xs">
                                        {skill}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {/* Mid Level */}
                        {message.careerPath.career_path.mid_level && (
                          <div className="mb-4 p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                            <div className="flex items-center gap-2 mb-2">
                              <TrendingUp className="h-4 w-4 text-yellow-600" />
                              <h4 className="font-medium text-yellow-900">
                                {message.careerPath.career_path.mid_level.title}
                              </h4>
                            </div>
                            <div className="text-sm text-gray-700 space-y-1">
                              <p><strong>Duration:</strong> {message.careerPath.career_path.mid_level.duration}</p>
                              <p><strong>Salary:</strong> {message.careerPath.career_path.mid_level.salary_range}</p>
                              {message.careerPath.career_path.mid_level.required_skills && (
                                <div>
                                  <strong>Key Skills:</strong>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {message.careerPath.career_path.mid_level.required_skills.slice(0, 3).map((skill: string, idx: number) => (
                                      <Badge key={idx} variant="secondary" className="text-xs">
                                        {skill}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {/* Senior Level */}
                        {message.careerPath.career_path.senior_level && (
                          <div className="mb-4 p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                            <div className="flex items-center gap-2 mb-2">
                              <BarChart3 className="h-4 w-4 text-green-600" />
                              <h4 className="font-medium text-green-900">
                                {message.careerPath.career_path.senior_level.title}
                              </h4>
                            </div>
                            <div className="text-sm text-gray-700 space-y-1">
                              <p><strong>Duration:</strong> {message.careerPath.career_path.senior_level.duration}</p>
                              <p><strong>Salary:</strong> {message.careerPath.career_path.senior_level.salary_range}</p>
                              {message.careerPath.career_path.senior_level.required_skills && (
                                <div>
                                  <strong>Key Skills:</strong>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {message.careerPath.career_path.senior_level.required_skills.slice(0, 3).map((skill: string, idx: number) => (
                                      <Badge key={idx} variant="secondary" className="text-xs">
                                        {skill}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {/* Growth Opportunities */}
                        {message.careerPath.growth_opportunities && (
                          <div className="p-3 bg-purple-50 rounded-lg border-l-4 border-purple-400">
                            <div className="flex items-center gap-2 mb-2">
                              <Lightbulb className="h-4 w-4 text-purple-600" />
                              <h4 className="font-medium text-purple-900">Growth Opportunities</h4>
                            </div>
                            <div className="text-sm text-gray-700 space-y-1">
                              <p><strong>Salary Growth:</strong> {message.careerPath.growth_opportunities.salary_growth}</p>
                              <p><strong>Promotion Timeline:</strong> {message.careerPath.growth_opportunities.promotion_timeline}</p>
                              {message.careerPath.growth_opportunities.industry_sectors && (
                                <p><strong>Industries:</strong> {message.careerPath.growth_opportunities.industry_sectors.slice(0, 3).join(', ')}</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                  
                  {/* Suggestion buttons for bot messages */}
                  {message.sender === 'bot' && message.suggestions && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {message.suggestions.map((suggestion, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="text-xs h-7"
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>

                {message.sender === 'user' && (
                  <Avatar className="w-8 h-8">
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Quick Suggestions */}
        {messages.length === 1 && (
          <div className="p-4 border-t bg-muted/20">
            <p className="text-xs text-muted-foreground mb-3">{t('chatbot.quick_suggestions')}</p>
            <div className="grid grid-cols-2 gap-2">
              {quickSuggestions.map((suggestion, index) => {
                const Icon = suggestion.icon;
                return (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="justify-start h-auto p-2 text-xs"
                    onClick={() => handleSuggestionClick(suggestion.text)}
                  >
                    <Icon className="h-3 w-3 mr-2" />
                    {suggestion.text}
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 border-t bg-background">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t('chatbot.placeholder')}
              disabled={isTyping}
              className="flex-1"
            />
            <Button
              onClick={() => sendMessage(currentMessage)}
              disabled={!currentMessage.trim() || isTyping}
              size="sm"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {t('chatbot.enter_to_send')}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CareerChatbot;