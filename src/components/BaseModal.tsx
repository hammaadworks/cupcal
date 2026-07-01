import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxWidthClass?: string;
  className?: string;
}

export const BaseModal = ({ isOpen, onClose, children, maxWidthClass = "max-w-md sm:max-w-lg md:max-w-xl", className = "" }: BaseModalProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock background scroll when modal is open
  useEffect(() => {
    if (!isOpen || !mounted) return;

    const originalOverflow = document.body.style.overflow;
    const originalTouchAction = document.body.style.touchAction;
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';
    
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.touchAction = originalTouchAction;
    };
  }, [isOpen, mounted]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-6 pt-[4.5rem] sm:p-6 sm:pt-[4.5rem] bg-black/60 backdrop-blur-md transition-opacity overscroll-none" onClick={onClose}>
      <div 
        className={`bg-[#f0f0f0] border-[3px] sm:border-[4px] border-black w-full ${maxWidthClass} max-h-[85vh] md:max-h-[90vh] overflow-y-auto overscroll-contain rounded-2xl sm:rounded-[2rem] shadow-[6px_6px_0px_#2E0D23] sm:shadow-[12px_12px_0px_#2E0D23] p-4 sm:p-5 md:p-6 relative no-scrollbar flex flex-col gap-2.5 sm:gap-4 ${className}`} 
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-black hover:bg-blue-600 text-white rounded-full p-1.5 sm:p-2 transition-transform hover:scale-110 border-[2px] border-black shadow-[2px_2px_0px_#2E0D23] z-20"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        {children}
      </div>
    </div>,
    document.body
  );
};

export default BaseModal;
