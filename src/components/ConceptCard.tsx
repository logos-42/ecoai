
import React, { useState } from 'react';
import { EconomicConcept } from '../types';
import { cn } from '@/lib/utils';
import AnimatedTransition from './AnimatedTransition';

interface ConceptCardProps {
  concept: EconomicConcept;
  className?: string;
}

const ConceptCard: React.FC<ConceptCardProps> = ({ concept, className }) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  const getCategoryBadge = () => {
    switch (concept.category) {
      case 'basic':
        return <div className="pill bg-green-100 text-green-800">基础</div>;
      case 'intermediate':
        return <div className="pill bg-blue-100 text-blue-800">进阶</div>;
      case 'advanced':
        return <div className="pill bg-purple-100 text-purple-800">高级</div>;
      default:
        return null;
    }
  };

  return (
    <div 
      className={cn(
        'glass-card rounded-2xl overflow-hidden transition-all duration-300',
        expanded ? 'shadow-elevated' : 'shadow-glass hover:shadow-elevated',
        className
      )}
    >
      <div 
        className="p-6 cursor-pointer"
        onClick={toggleExpand}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center">
            {getCategoryBadge()}
          </div>
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 20 20" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className={cn("transition-transform duration-300", expanded ? "rotate-180" : "")}
          >
            <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        
        <h3 className="text-xl font-semibold mb-2">{concept.title}</h3>
        <p className="text-muted-foreground line-clamp-2">{concept.description}</p>
      </div>
      
      <AnimatedTransition show={expanded} variant="slide-down">
        <div className="px-6 pb-6 pt-0">
          <div className="h-px w-full bg-border mb-4" />
          
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">实例应用</h4>
            <ul className="space-y-2 ml-4">
              {concept.examples.map((example, idx) => (
                <li key={idx} className="list-disc text-sm text-muted-foreground">{example}</li>
              ))}
            </ul>
          </div>
        </div>
      </AnimatedTransition>
    </div>
  );
};

export default ConceptCard;
