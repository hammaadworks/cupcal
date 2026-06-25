import React, { useState, useEffect } from 'react';

const logos = [
  '/fifa_logo/canada.png',
  '/fifa_logo/usa.png',
  '/fifa_logo/mexico.png'
];

export default function MorphingLogo({ className = "h-12 w-12" }: { className?: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % logos.length);
    }, 3000); // Rotate every 3 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`relative ${className}`}>
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
  );
}
