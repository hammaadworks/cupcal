import React from 'react';

interface FilterScrollerProps {
  title: string;
  items: string[];
  selectedItems: string[];
  toggleSelection: (setter: React.Dispatch<React.SetStateAction<string[]>>, item: string) => void;
  setter: React.Dispatch<React.SetStateAction<string[]>>;
}

export const FilterScroller = ({ title, items, selectedItems, toggleSelection, setter }: FilterScrollerProps) => {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center px-2">
        <h3 className="text-lg font-anton text-black tracking-widest uppercase bg-yellow-300 px-4 py-1 border-[2px] border-black shadow-[2px_2px_0px_#000] inline-block">{title}</h3>
      </div>
      <div className="flex overflow-x-auto no-scrollbar gap-3 pb-3 px-2 snap-x" style={{ maskImage: 'linear-gradient(to right, transparent, black 15px, black calc(100% - 15px), transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 15px, black calc(100% - 15px), transparent)' }}>
        {items.map(item => {
          const isActive = selectedItems.includes(item);
          return (
            <button 
              key={item} 
              onClick={() => toggleSelection(setter, item)}
              className={`snap-center flex-shrink-0 px-6 py-3 font-anton uppercase tracking-wide text-sm md:text-base border-[3px] border-black shadow-[4px_4px_0px_#000] hover:-translate-y-1 transition-all ${isActive ? 'bg-black text-white shadow-[4px_4px_0px_#f9a8d4] scale-105' : 'bg-white text-black hover:bg-gray-100'}`}
            >
              {item}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default FilterScroller;
