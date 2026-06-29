import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '@nanostores/react';
import { selectedTeamStore } from '../store';
import { getAllTeams, getTeamName, getTeamFlag } from '../utils/teams';
import { getTeamLogo } from '../utils/logos';

export default function GlobalCountryPicker({ compact = false }: { compact?: boolean }) {
  const selectedTeamCode = useStore(selectedTeamStore);
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('wccal_team');
    if (saved) {
      selectedTeamStore.set(saved);
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (code: string | null) => {
    selectedTeamStore.set(code);
    if (code) {
      localStorage.setItem('wccal_team', code);
    } else {
      localStorage.removeItem('wccal_team');
    }
    setIsOpen(false);
  };

  const teams = getAllTeams().sort((a, b) => a.name.localeCompare(b.name));
  
  if (!mounted) return <div className={`bg-slate-100 rounded-xl animate-pulse border-[3px] border-black shadow-[4px_4px_0px_#2E0D23] ${compact ? 'h-8 w-24' : 'h-12 w-48'}`}></div>;

  const currentTeam = teams.find(t => t.code === selectedTeamCode);
  const label = currentTeam ? currentTeam.name : 'ALL SQUADS';
  const logo = currentTeam ? getTeamLogo(currentTeam.code) : null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between bg-yellow-300 border-[3px] md:border-[4px] border-black rounded-2xl shadow-[2px_2px_0px_#2E0D23] md:shadow-[4px_4px_0px_#2E0D23] hover:-translate-y-1 hover:shadow-[4px_4px_0px_#2E0D23] md:hover:shadow-[6px_6px_0px_#2E0D23] transition-all overflow-hidden ${compact ? 'p-1 gap-1 px-2' : 'p-1.5 px-3 gap-2'}`}
      >
        <div className="flex items-center gap-2">
          {logo ? (
            <img src={logo} alt={label} className="w-5 h-5 md:w-6 md:h-6 object-contain" />
          ) : (
             <span className="text-sm md:text-base">🌍</span>
          )}
          <span className={`text-black font-outfit uppercase tracking-widest font-bold whitespace-nowrap truncate max-w-[100px] md:max-w-[150px] ${compact ? 'text-xs md:text-sm' : 'text-sm md:text-base'}`}>
            {label}
          </span>
        </div>
        <span className="text-black text-xs md:text-sm">▼</span>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-white border-[4px] border-black rounded-xl shadow-[8px_8px_0px_#2E0D23] z-[100] max-h-96 overflow-y-auto custom-scrollbar">
          <div className="p-2 border-b-[2px] border-black bg-gray-100">
             <span className="text-xs font-outfit font-bold uppercase tracking-widest">Select your squad</span>
          </div>
          <button
            onClick={() => handleSelect(null)}
            className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-yellow-300 transition-colors border-b-[2px] border-gray-200 ${!selectedTeamCode ? 'bg-black text-white hover:bg-black hover:text-white' : 'text-black'}`}
          >
            <span className="text-xl">🌍</span>
            <span className="font-outfit uppercase tracking-widest font-bold">ALL SQUADS</span>
          </button>
          
          {teams.map(team => {
            const isSelected = selectedTeamCode === team.code;
            const tLogo = getTeamLogo(team.code);
            return (
              <button
                key={team.code}
                onClick={() => handleSelect(team.code)}
                className={`w-full text-left px-4 py-2 flex items-center gap-3 hover:bg-yellow-300 transition-colors border-b-[1px] border-gray-100 ${isSelected ? 'bg-blue-600 text-white hover:bg-blue-700' : 'text-black'}`}
              >
                {tLogo ? (
                  <img src={tLogo} alt={team.name} className="w-6 h-6 object-contain" />
                ) : (
                  <span className="text-xl">{team.flag || '🏳️'}</span>
                )}
                <span className="font-outfit uppercase tracking-widest text-sm">{team.name}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
