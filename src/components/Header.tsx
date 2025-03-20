
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import AnimatedTransition from './AnimatedTransition';
import { useIsMobile } from '@/hooks/use-mobile';
import { Menu, X } from 'lucide-react';

interface HeaderProps {
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ className }) => {
  const [scrolled, setScrolled] = useState(false);
  const [currentSection, setCurrentSection] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();

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

  // Close mobile menu when switching to desktop view
  useEffect(() => {
    if (!isMobile && mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  }, [isMobile, mobileMenuOpen]);

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
      
      // Close mobile menu after navigation
      if (isMobile) {
        setMobileMenuOpen(false);
      }
    }
  };

  const navItems = [
    { id: 'home', label: '首页' },
    { id: 'features', label: '功能' },
    { id: 'simulator', label: '政策模拟' },
    { id: 'visualization', label: '数据图表' }
  ];

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-3 md:py-4",
      scrolled ? "bg-white/80 backdrop-blur shadow-subtle" : "bg-transparent",
      className
    )}>
      <div className="container-lg flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 md:w-8 md:h-8 relative">
            <img 
              alt="经济小白AI" 
              src="/lovable-uploads/ba42c879-b699-40e5-b65e-8f918f29f387.png" 
              className="w-full h-full object-cover" 
            />
          </div>
          <div className="font-semibold text-base md:text-lg">经济小白AI</div>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:block">
          <ul className="flex items-center gap-6">
            {navItems.map(item => (
              <li key={item.id}>
                <button 
                  onClick={() => scrollToSection(item.id)} 
                  className={cn(
                    "relative px-1 py-2 font-medium text-sm transition-colors",
                    currentSection === item.id ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {item.label}
                  <AnimatedTransition 
                    show={currentSection === item.id} 
                    variant="fade" 
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-econoBlue rounded-full"
                  >
                    <div></div>
                  </AnimatedTransition>
                </button>
              </li>
            ))}
          </ul>
        </nav>
        
        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "关闭菜单" : "打开菜单"}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>
        </div>
        
        {/* Desktop CTA Button */}
        <div className="hidden md:block">
          <Button className="glass-button text-foreground border" onClick={() => scrollToSection('chat')}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
              <path d="M8 1V15M1 8H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            开始使用
          </Button>
        </div>
      </div>
      
      {/* Mobile Navigation Menu */}
      <AnimatedTransition 
        show={mobileMenuOpen} 
        variant="slide-down" 
        className="md:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur shadow-md"
      >
        <div className="py-3 px-4">
          <ul className="flex flex-col gap-3">
            {navItems.map(item => (
              <li key={item.id}>
                <button 
                  onClick={() => scrollToSection(item.id)} 
                  className={cn(
                    "block w-full text-left px-2 py-2 rounded-md font-medium transition-colors",
                    currentSection === item.id 
                      ? "text-foreground bg-econoGray-light" 
                      : "text-muted-foreground hover:bg-econoGray-light/50"
                  )}
                >
                  {item.label}
                </button>
              </li>
            ))}
            <li>
              <Button 
                className="w-full mt-2" 
                onClick={() => scrollToSection('chat')}
              >
                开始使用
              </Button>
            </li>
          </ul>
        </div>
      </AnimatedTransition>
    </header>
  );
};

export default Header;
