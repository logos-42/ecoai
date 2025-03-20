import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import AnimatedTransition from './AnimatedTransition';
interface HeaderProps {
  className?: string;
}
const Header: React.FC<HeaderProps> = ({
  className
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [currentSection, setCurrentSection] = useState('home');
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setScrolled(scrollPosition > 10);

      // Simple section detection
      const sections = ['home', 'features', 'simulator', 'visualization'];
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            setCurrentSection(section);
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({
        behavior: 'smooth'
      });

      // If navigating to chat section, focus the input field
      if (sectionId === 'chat') {
        setTimeout(() => {
          const chatSection = document.getElementById('chat');
          const chatInterface = chatSection?.querySelector('.glass-card');
          if (chatInterface) {
            const inputField = chatInterface.querySelector('input');
            inputField?.focus();
          }
        }, 800);
      }
    }
  };
  return <header className={cn("fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-4", scrolled ? "bg-white/80 backdrop-blur shadow-subtle" : "bg-transparent", className)}>
      <div className="container-lg flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Updated logo path */}
          <div className="w-8 h-8 relative">
            <img alt="经济小白AI" src="/lovable-uploads/ba42c879-b699-40e5-b65e-8f918f29f387.png" className="w-full h-full object-cover" />
          </div>
          <div className="font-semibold text-lg">经济小白AI</div>
        </div>
        
        <nav className="hidden md:block">
          <ul className="flex items-center gap-6">
            {[{
            id: 'home',
            label: '首页'
          }, {
            id: 'features',
            label: '功能'
          }, {
            id: 'simulator',
            label: '政策模拟'
          }, {
            id: 'visualization',
            label: '数据图表'
          }].map(item => <li key={item.id}>
                <button onClick={() => scrollToSection(item.id)} className={cn("relative px-1 py-2 font-medium text-sm transition-colors", currentSection === item.id ? "text-foreground" : "text-muted-foreground hover:text-foreground")}>
                  {item.label}
                  <AnimatedTransition show={currentSection === item.id} variant="fade" className="absolute bottom-0 left-0 right-0 h-0.5 bg-econoBlue rounded-full">
                    <div></div>
                  </AnimatedTransition>
                </button>
              </li>)}
          </ul>
        </nav>
        
        <div>
          <Button className="glass-button text-foreground border" onClick={() => scrollToSection('chat')}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
              <path d="M8 1V15M1 8H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            开始使用
          </Button>
        </div>
      </div>
    </header>;
};
export default Header;