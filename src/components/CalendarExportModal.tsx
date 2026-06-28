import React, { useState, useEffect } from 'react';
import type { Match } from '../types/match';
import { getTeamName } from '../utils/teams';
import { getStadiumFullName } from '../utils/stadiums';
import { getSourceText } from '../utils/bracket';
import { downloadIcsBlob } from '../utils/ics';
import { parseUTCDate } from '../utils/date';

interface ExportMetadata {
  summary: string;
  description: string;
  alarmMinutes: number;
}

interface Props {
  matches: Match[];
  onClose: () => void;
}

export default function CalendarExportModal({ matches, onClose }: Props) {
  const [metadata, setMetadata] = useState<Record<string, ExportMetadata>>({});
  
  // Initialize metadata
  useEffect(() => {
    const initial: Record<string, ExportMetadata> = {};
    matches.forEach(m => {
      const homeName = m.home ? getTeamName(m.home) : getSourceText(m.homeSource);
      const awayName = m.away ? getTeamName(m.away) : getSourceText(m.awaySource);
      const venueName = getStadiumFullName(m.stadiumId);
      
      initial[m.id] = {
        summary: `⚽ ${homeName} vs ${awayName}`,
        description: `${m.stage} Match\\nVenue: ${venueName}`,
        alarmMinutes: 15
      };
    });
    setMetadata(initial);
  }, [matches]);

  const handleDownload = () => {
    let icsContent = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//cupcal.online//EN\nCALSCALE:GREGORIAN\n`;
    
    matches.forEach(m => {
      const d = parseUTCDate(m.kickoffUtc);
      const start = d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      const end = new Date(d.getTime() + 120 * 60000).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      const meta = metadata[m.id];
      if (!meta) return;
      
      const venueName = getStadiumFullName(m.stadiumId);
      
      icsContent += `BEGIN:VEVENT\nUID:${m.id}@cupcal.online\nDTSTAMP:${start}\nDTSTART:${start}\nDTEND:${end}\nSUMMARY:${meta.summary}\nDESCRIPTION:${meta.description}\nLOCATION:${venueName}\nBEGIN:VALARM\nTRIGGER:-PT${meta.alarmMinutes}M\nACTION:DISPLAY\nDESCRIPTION:Match starts in ${meta.alarmMinutes}m!\nEND:VALARM\nEND:VEVENT\n`;
    });
    
    icsContent += `END:VCALENDAR`;
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    
    const firstHome = matches.length === 1 ? (matches[0].home ? getTeamName(matches[0].home) : getSourceText(matches[0].homeSource)) : '';
    const firstAway = matches.length === 1 ? (matches[0].away ? getTeamName(matches[0].away) : getSourceText(matches[0].awaySource)) : '';
    const filename = matches.length === 1 ? `Match_${firstHome}_vs_${firstAway}.ics` : `cupcal_schedule.ics`;

    downloadIcsBlob(blob, filename);
    onClose();
  };

  const updateMeta = (id: string, key: keyof ExportMetadata, value: any) => {
    setMetadata(prev => ({
      ...prev,
      [id]: { ...prev[id], [key]: value }
    }));
  };

  const applyGlobalAlarm = (minutes: number) => {
    setMetadata(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(k => {
        next[k] = { ...next[k], alarmMinutes: minutes };
      });
      return next;
    });
  };

  if (Object.keys(metadata).length === 0) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-white border-[4px] border-black shadow-[8px_8px_0px_#f472b6] rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-yellow-300 border-b-[4px] border-black p-4 flex justify-between items-center shrink-0">
          <h2 className="text-3xl font-black uppercase tracking-tighter text-black" style={{ fontFamily: 'Anton' }}>Export to Calendar</h2>
          <button onClick={onClose} className="w-10 h-10 bg-white border-[3px] border-black rounded-full text-black hover:bg-pink-400 font-bold hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[4px_4px_0px_#000] transition-all flex items-center justify-center text-xl pb-1">
            &times;
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {matches.length > 1 && (
             <div className="bg-pink-100 border-[3px] border-black p-4 shadow-[4px_4px_0px_#000]">
                <h3 className="font-black uppercase tracking-widest text-black mb-3">Global Reminder (For all {matches.length} matches)</h3>
                <div className="flex items-center gap-2">
                   <select onChange={(e) => applyGlobalAlarm(parseInt(e.target.value))} className="bg-white border-[2px] border-black px-4 py-2 font-bold uppercase cursor-pointer appearance-none">
                     <option value={-60}>60 mins after</option>
                     <option value={-30}>30 mins after</option>
                     <option value={-15}>15 mins after</option>
                     <option value={0}>At kickoff</option>
                     <option value={5}>5 mins before</option>
                     <option value={15} selected>15 mins before</option>
                     <option value={30}>30 mins before</option>
                     <option value={60}>1 hour before</option>
                     <option value={1440}>1 day before</option>
                   </select>
                </div>
             </div>
          )}

          {matches.map(m => {
            const meta = metadata[m.id];
            if (!meta) return null;
            
            const homeName = m.home ? getTeamName(m.home) : getSourceText(m.homeSource);
            const awayName = m.away ? getTeamName(m.away) : getSourceText(m.awaySource);

            return (
              <div key={m.id} className="bg-white border-[3px] border-black p-4 hover:bg-gray-50">
                <div className="text-xs font-black bg-black text-white px-2 py-1 inline-block uppercase tracking-widest mb-3">
                  Match {m.matchNumber} &bull; {homeName} vs {awayName}
                </div>
                
                <div className="space-y-4">
                  {/* Timer Picker on Top */}
                  <div className="bg-yellow-50 p-4 border-[3px] border-black text-center shadow-[4px_4px_0px_#000]">
                    <label className="block text-sm font-black uppercase tracking-widest text-black mb-2">Reminder Alert (Scroll to select)</label>
                    <select 
                      size={3}
                      value={meta.alarmMinutes} 
                      onChange={(e) => updateMeta(m.id, 'alarmMinutes', parseInt(e.target.value))}
                      className="w-full max-w-[250px] mx-auto bg-white border-[3px] border-black text-center text-lg font-bold uppercase cursor-pointer no-scrollbar focus:outline-none focus:border-pink-500 shadow-inner"
                      style={{ height: '100px' }}
                    >
                      <option value={-60}>60 mins after</option>
                      <option value={-30}>30 mins after</option>
                      <option value={-15}>15 mins after</option>
                      <option value={0}>At kickoff</option>
                      <option value={5}>5 mins before</option>
                      <option value={15}>15 mins before</option>
                      <option value={30}>30 mins before</option>
                      <option value={60}>1 hour before</option>
                      <option value={1440}>1 day before</option>
                    </select>
                  </div>

                  {/* Collapsible Metadata */}
                  <details className="group border-[3px] border-black bg-white shadow-[4px_4px_0px_#000]">
                    <summary className="p-4 font-black uppercase text-sm cursor-pointer hover:bg-pink-100 list-none flex justify-between items-center transition-colors">
                      Edit Meta Data (Optional)
                      <span className="group-open:rotate-180 transition-transform text-xl leading-none">▼</span>
                    </summary>
                    <div className="p-4 space-y-4 border-t-[3px] border-black bg-gray-50">
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Event Title</label>
                        <input 
                          type="text" 
                          value={meta.summary} 
                          onChange={(e) => updateMeta(m.id, 'summary', e.target.value)}
                          className="w-full bg-white border-[2px] border-black px-3 py-2 font-bold text-black focus:outline-none focus:bg-pink-50"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Description</label>
                        <textarea 
                          value={meta.description} 
                          onChange={(e) => updateMeta(m.id, 'description', e.target.value)}
                          className="w-full bg-white border-[2px] border-black px-3 py-2 font-bold text-black focus:outline-none focus:bg-pink-50 min-h-[60px]"
                        />
                      </div>
                    </div>
                  </details>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-white border-t-[4px] border-black p-4 shrink-0">
          <button 
            onClick={handleDownload}
            data-umami-event={matches.length === 1 ? "calendar_export_single" : "calendar_export_bulk"}
            data-umami-event-match={matches.length === 1 ? `${matches[0].home} vs ${matches[0].away}` : undefined}
            data-umami-event-stage={matches.length === 1 ? matches[0].stage : undefined}
            data-umami-event-count={matches.length > 1 ? matches.length : undefined}
            className="w-full bg-black text-white font-black text-xl uppercase tracking-widest py-4 border-[3px] border-black shadow-[4px_4px_0px_#f472b6] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[6px_6px_0px_#f472b6] transition-all"
            style={{ fontFamily: 'Anton' }}
          >
            Export ICS
          </button>
        </div>
      </div>
    </div>
  );
}
