
import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { sendChatMessage } from '../utils/api';
import AnimatedTransition from './AnimatedTransition';
import { toast } from '@/components/ui/use-toast';

interface ChatInterfaceProps {
  className?: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ className }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: '欢迎使用经济学AI助手！您可以向我询问任何经济学概念、政策影响或请求数据可视化。试试问我："什么是供需平衡？"',
      role: 'assistant',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      role: 'user',
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    
    try {
      const response = await sendChatMessage(inputValue);
      
      if (response.error) {
        toast({
          title: "发送消息失败",
          description: response.error,
          variant: "destructive",
        });
      } else {
        setMessages((prev) => [...prev, response.data]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "发送消息失败",
        description: "无法连接到服务器，请稍后再试",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = (message: Message, index: number) => {
    const isUser = message.role === 'user';
    const bubbleClass = isUser ? 'chat-bubble-user' : 'chat-bubble-ai';
    const animationDelay = index * 100;
    
    return (
      <AnimatedTransition 
        key={message.id} 
        show={true} 
        variant={isUser ? 'slide-up' : 'scale'} 
        delay={animationDelay}
        className="w-full"
      >
        <div className={cn("chat-bubble", bubbleClass, "mb-4")}>
          {message.content}
        </div>
      </AnimatedTransition>
    );
  };

  return (
    <div className={cn("flex flex-col h-full rounded-2xl overflow-hidden glass-card", className)}>
      <div className="px-6 py-4 border-b">
        <h2 className="text-xl font-semibold">经济学AI助手</h2>
        <p className="text-sm text-muted-foreground">基于DeepSeek大语言模型</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map(renderMessage)}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="px-6 py-4 border-t">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="输入您的问题..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading || !inputValue.trim()}>
            {isLoading ? (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : '发送'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
