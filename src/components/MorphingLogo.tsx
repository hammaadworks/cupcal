import React, { useState, useEffect } from 'react';
import BaseModal from './BaseModal';

const logos = [
  '/favicon.jpg',
  '/fifa_logo/canada.jpg',
  '/fifa_logo/usa.jpg',
  '/fifa_logo/mexico.jpg'
];

const carouselLogos = [
  '/fifa_logo/canada.jpg',
  '/fifa_logo/usa.jpg',
  '/fifa_logo/mexico.jpg'
];

function LogoCarousel() {
  const [index, setIndex] = useState(0);

  const next = () => setIndex((i) => (i + 1) % carouselLogos.length);
  const prev = () => setIndex((i) => (i - 1 + carouselLogos.length) % carouselLogos.length);

  return (
    <div className="relative w-full sm:max-w-xs mx-auto mb-6 aspect-square bg-white rounded-2xl border-[3px] border-black shadow-[4px_4px_0px_#2E0D23] overflow-hidden flex items-center justify-center">
      <img src={carouselLogos[index]} alt="Fan Made Logo" className="w-full h-full object-contain p-4" />
      
      <button onClick={prev} aria-label="Previous image" className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-black text-white rounded-full border-2 border-white hover:scale-110 transition-transform cursor-pointer shadow-md">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
      </button>
      <button onClick={next} aria-label="Next image" className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-black text-white rounded-full border-2 border-white hover:scale-110 transition-transform cursor-pointer shadow-md">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
      </button>

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
        {carouselLogos.map((_, i) => (
          <div key={i} className={`w-2.5 h-2.5 rounded-full border border-black transition-colors ${i === index ? 'bg-black' : 'bg-white'}`} />
        ))}
      </div>
    </div>
  );
}

export default function MorphingLogo({ className = "h-12 w-12" }: { className?: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % logos.length);
    }, 3000); // Rotate every 3 seconds
    return () => clearInterval(interval);
  }, []);

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <div className={`relative cursor-pointer ${className}`} onClick={handleLogoClick}>
        {logos.map((logo, index) => (
          <img
            key={logo}
            src={logo}
            alt="Host Country Fan Logo"
            className={`absolute top-0 left-0 w-full h-full object-contain transition-opacity duration-1000 ease-in-out ${
              index === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}
      </div>

      <BaseModal isOpen={isModalOpen} onClose={closeModal}>
        <div className="flex flex-col items-center text-center mt-2 w-full">
          <h2 className="text-xl sm:text-2xl font-outfit font-black uppercase mb-4 tracking-tight leading-none text-black max-w-full">
            Fan-Made Logos by <br className="hidden sm:block" /><span className="text-blue-600 break-words break-all">@mr.brandstormer</span>
          </h2>
          
          <LogoCarousel />
          
          <p className="text-sm sm:text-base font-medium mb-6 text-gray-800">
            These incredible, culturally rich fan-made logos for the host nations were created by the talented designer <strong>@mr.brandstormer</strong>.
          </p>
          
          <div className="bg-yellow-300 p-4 border-[3px] border-black rounded-xl sm:rounded-2xl mb-6 shadow-[4px_4px_0px_#2E0D23] transform -rotate-1 w-full">
            <p className="font-outfit font-black text-[11px] sm:text-sm uppercase tracking-widest text-black m-0 leading-tight">
              OUR PLEDGE: We are pledging 10% of our first sponsorship revenue directly to @mr.brandstormer to honor their work.
            </p>
          </div>
          
          <div className="flex flex-col gap-2.5 sm:gap-4 w-full">
            <a 
              href="https://www.instagram.com/mr.brandstormer" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-black text-white font-outfit font-bold text-sm sm:text-base uppercase tracking-widest py-3 rounded-xl border-[3px] border-black hover:bg-gray-800 hover:-translate-y-1 transition-all shadow-[4px_4px_0px_#2E0D23]"
            >
              Follow on Instagram
            </a>
            <a 
              href="https://www.instagram.com/reel/DaBXS6sMBP-" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-white text-black font-outfit font-bold text-sm sm:text-base uppercase tracking-widest py-3 rounded-xl border-[3px] border-black hover:bg-gray-100 hover:-translate-y-1 transition-all shadow-[4px_4px_0px_#2E0D23]"
            >
              Watch the Design Reel
            </a>
            <a 
              href="/blog/stunning-fan-made-logos-mr-brandstormer" 
              className="text-blue-600 font-outfit font-bold uppercase tracking-widest py-2 hover:text-black transition-colors mt-1 text-xs sm:text-sm"
            >
              Read the Full Story
            </a>
          </div>
        </div>
      </BaseModal>
    </>
  );
}
