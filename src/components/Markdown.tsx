
import React from 'react';
import { cn } from '@/lib/utils';

interface MarkdownProps {
  content: string;
  className?: string;
}

const Markdown: React.FC<MarkdownProps> = ({ content, className }) => {
  // Process the content for markdown
  const processedContent = React.useMemo(() => {
    let html = content
      // Handle headers
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mt-5 mb-3">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-6 mb-4">$1</h1>')
      
      // Handle bold and italic
      .replace(/\*\*(.*?)\*\*/gim, '<span class="font-bold">$1</span>')
      .replace(/\*(.*?)\*/gim, '<span class="italic">$1</span>')
      
      // Handle lists
      .replace(/^\s*\n\* (.*)/gim, '<ul class="list-disc pl-5 my-3"><li>$1</li></ul>')
      .replace(/^\s*\n- (.*)/gim, '<ul class="list-disc pl-5 my-3"><li>$1</li></ul>')
      .replace(/^\s*\n\d\. (.*)/gim, '<ol class="list-decimal pl-5 my-3"><li>$1</li></ol>')
      
      // Handle paragraphs
      .replace(/^\s*\n\n/gim, '</p><p class="my-3">')
      
      // Handle code blocks
      .replace(/```([\s\S]*?)```/gim, '<pre class="bg-gray-100 p-3 rounded-md overflow-x-auto my-4 text-sm">$1</pre>')
      .replace(/`(.*?)`/gim, '<code class="bg-gray-100 px-1 rounded text-sm">$1</code>')
      
      // Handle blockquotes
      .replace(/^\> (.*$)/gim, '<blockquote class="border-l-4 border-econoBlue-light pl-4 py-2 my-4 text-gray-600 bg-econoBlue-light/10 rounded-r">$1</blockquote>')
      
      // Handle horizontal rules
      .replace(/^\-\-\-$/gim, '<hr class="my-6 border-t border-gray-300">')
      
      // Convert consecutive lists into single lists with multiple items
      .replace(/<\/ul><ul class="list-disc pl-5 my-3">/gim, '')
      .replace(/<\/ol><ol class="list-decimal pl-5 my-3">/gim, '')
      
      // Handle tables (simplified)
      .replace(/\n\|(.*)\|\n\|([-:\|\s]+)\|\n/g, '<table class="w-full my-4 border-collapse"><thead><tr>$1</tr></thead><tbody>')
      .replace(/\|(.*)\|/g, (match) => {
        const cells = match.split('|').filter(cell => cell !== '');
        if (cells.length) {
          return '<tr>' + cells.map(cell => `<td class="border p-2">${cell.trim()}</td>`).join('') + '</tr>';
        }
        return match;
      });

    // Add final touches
    html = '<p class="my-3">' + html + '</p>';
    
    // Clean up any extra paragraph tags
    html = html
      .replace(/<p><\/p>/gim, '')
      .replace(/<p><ul/gim, '<ul')
      .replace(/<p><ol/gim, '<ol')
      .replace(/<\/ul><\/p>/gim, '</ul>')
      .replace(/<\/ol><\/p>/gim, '</ol>')
      .replace(/<p><h/gim, '<h')
      .replace(/<\/h\d><\/p>/gim, '</h>');

    return html;
  }, [content]);

  return (
    <div 
      className={cn("markdown prose prose-econoBlue max-w-none", className)} 
      dangerouslySetInnerHTML={{ __html: processedContent }} 
    />
  );
};

export default Markdown;
