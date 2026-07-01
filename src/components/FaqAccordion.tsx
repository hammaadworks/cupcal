import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FaqItem {
  slug: string;
  question: string;
  answer: string;
}

interface FaqAccordionProps {
  items: FaqItem[];
}

export default function FaqAccordion({ items }: FaqAccordionProps) {
  const [openSlug, setOpenSlug] = useState<string | null>(null);

  const toggle = (slug: string) => {
    setOpenSlug(openSlug === slug ? null : slug);
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-4">
      {items.slice(0, 8).map((item) => {
        const isOpen = openSlug === item.slug;
        return (
          <div 
            key={item.slug}
            className={`border-[4px] border-black transition-all ${
              isOpen ? 'bg-white shadow-[6px_6px_0px_#0A3161] -translate-y-1 -translate-x-1' : 'bg-gray-100 hover:bg-white hover:-translate-y-0.5 hover:-translate-x-0.5 hover:shadow-[4px_4px_0px_#00A859]'
            }`}
          >
            <button
              onClick={() => toggle(item.slug)}
              className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
              aria-expanded={isOpen}
            >
              <span className="font-display text-xl md:text-2xl font-bold uppercase tracking-widest text-black pr-4 leading-tight">
                {item.question}
              </span>
              <div className={`shrink-0 flex items-center justify-center w-10 h-10 border-[3px] border-black rounded-full transition-transform duration-300 ${isOpen ? 'bg-[#E51921] text-white rotate-180' : 'bg-white text-black'}`}>
                <ChevronDown size={24} strokeWidth={3} />
              </div>
            </button>
            <div 
              className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[500px] border-t-[4px] border-black' : 'max-h-0'}`}
            >
              <div className="p-6 font-body text-lg md:text-xl text-black bg-white">
                {item.answer}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
