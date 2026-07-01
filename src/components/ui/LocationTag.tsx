import React from 'react';
import { motion } from 'framer-motion';

export const LocationTag = ({ city, country }: { city: string, country: string }) => {
  return (
    <motion.div 
      className="inline-flex items-center gap-2 bg-[var(--color-white-smoke)] border-[3px] border-[var(--color-gunmetal)] rounded-full pl-2 pr-4 py-1.5 shadow-[4px_4px_0px_var(--color-gunmetal)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_var(--color-gunmetal)] transition-all cursor-pointer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="relative flex items-center justify-center w-6 h-6 bg-[var(--color-gunmetal)] rounded-full">
        <motion.div 
          className="absolute w-full h-full bg-[var(--color-almond-silk)] rounded-full"
          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="w-2 h-2 bg-[var(--color-almond-silk)] rounded-full z-10" />
      </div>
      <div className="flex flex-col leading-none">
        <span className="text-[10px] font-display uppercase tracking-widest text-gray-500">{country}</span>
        <span className="text-sm font-bold font-heading text-[var(--color-gunmetal)] tracking-wide">{city}</span>
      </div>
    </motion.div>
  );
};
