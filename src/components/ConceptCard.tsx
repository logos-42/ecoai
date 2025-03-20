
import React from 'react';
import { Card } from '@/components/ui/card';
import { EconomicConcept } from '@/types';
import { cn } from '@/lib/utils';

interface ConceptCardProps {
  concept: EconomicConcept;
  className?: string;
  onClick?: () => void;
}

const ConceptCard: React.FC<ConceptCardProps> = ({ concept, className, onClick }) => {
  // Category badge colors
  const categoryColors = {
    basic: 'bg-econoGreen-light text-econoGreen',
    intermediate: 'bg-econoBlue-light text-econoBlue',
    advanced: 'bg-econoPurple-light text-econoPurple',
  };
  
  const categoryName = {
    basic: '基础',
    intermediate: '进阶',
    advanced: '高级',
  };

  return (
    <Card 
      className={cn(
        "overflow-hidden border shadow-subtle hover:shadow-elevated transition-all duration-300 h-full cursor-pointer", 
        className
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
    >
      <div className="p-5 h-full flex flex-col">
        <div className={cn(
          "text-xs font-medium rounded-full px-2 py-0.5 inline-flex items-center w-fit mb-3",
          concept.category in categoryColors ? categoryColors[concept.category as keyof typeof categoryColors] : 'bg-gray-100 text-gray-500'
        )}>
          {concept.category in categoryName ? categoryName[concept.category as keyof typeof categoryName] : concept.category}
        </div>
        
        <h3 className="text-lg font-semibold mb-2">{concept.title}</h3>
        <p className="text-muted-foreground text-sm mb-4 flex-1">{concept.description}</p>
        
        {concept.examples && concept.examples.length > 0 && (
          <div className="mt-auto">
            <div className="text-xs uppercase tracking-wide font-medium text-muted-foreground mb-2">实例应用</div>
            <ul className="space-y-1">
              {concept.examples.map((example, i) => (
                <li key={i} className="text-xs flex items-start gap-2">
                  <span className="inline-block w-1 h-1 rounded-full bg-primary mt-1.5" />
                  <span>{example}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ConceptCard;
