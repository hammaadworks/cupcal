const fs = require('fs');

let content = fs.readFileSync('src/components/ScheduleFilter.tsx', 'utf-8');

// Replace dates logic
content = content.replace(
  `    if (sorted.length > 0 && !selectedDate) {\n      setSelectedDate(sorted[0]);\n    }`,
  `    if (sorted.length > 0 && !selectedDate) {
      const now = new Date().getTime();
      const sortedMatches = [...matches].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      let nextMatch = null;
      for (const m of sortedMatches) {
          if (now - new Date(m.date).getTime() <= 120 * 60000) {
              nextMatch = m;
              break;
          }
      }
      if (!nextMatch && sortedMatches.length > 0) nextMatch = sortedMatches[sortedMatches.length - 1];
      
      if (nextMatch) {
          setSelectedDate(getLocalDateString(nextMatch.date, $timezone));
      } else {
          setSelectedDate(sorted[0]);
      }
    }`
);

// Add initialScrolled state and effect
content = content.replace(
  `  useEffect(() => {\n    if (selectedDate && !hasAdvancedFilters) {`,
  `  const [initialScrolled, setInitialScrolled] = useState(false);

  useEffect(() => {
    if (isMounted && !hasAdvancedFilters && !initialScrolled && selectedDate) {
      const el = document.getElementById(\`group-\${selectedDate}\`);
      if (el) {
        setTimeout(() => {
          const elAgain = document.getElementById(\`group-\${selectedDate}\`);
          if (elAgain) {
            const y = elAgain.getBoundingClientRect().top + window.scrollY - 180;
            window.scrollTo({ top: y, behavior: 'auto' });
            setInitialScrolled(true);
          }
        }, 100);
      }
    }
  }, [isMounted, hasAdvancedFilters, initialScrolled, selectedDate]);

  useEffect(() => {
    if (selectedDate && !hasAdvancedFilters) {`
);

// Replace scrollToUpcoming
content = content.replace(
  `  const scrollToUpcoming = () => {
    if (upcomingMatchRef.current) {
        const y = upcomingMatchRef.current.getBoundingClientRect().top + window.scrollY - 100;
        window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };`,
  `  const scrollToUpcoming = () => {
    if (upcomingMatch) {
        const dateKey = getLocalDateString(upcomingMatch.date, $timezone);
        const el = document.getElementById(\`group-\${dateKey}\`);
        if (el) {
            const y = el.getBoundingClientRect().top + window.scrollY - 180;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    }
  };`
);

// Replace no-scrollbar
content = content.replace(
  `<div className="flex overflow-x-auto no-scrollbar gap-4 pb-4 px-2 snap-x" style={{ maskImage:`,
  `<div className="flex overflow-x-auto custom-scrollbar gap-4 pb-4 px-2 snap-x" style={{ maskImage:`
);
content = content.replace(
  `<div className="flex overflow-x-auto no-scrollbar gap-3 pb-4 pt-4 px-2 snap-x bg-transparent mb-2" id="date-scroll-container" style={{ maskImage:`,
  `<div className="flex overflow-x-auto custom-scrollbar gap-3 pb-4 pt-4 px-2 snap-x bg-transparent mb-2" id="date-scroll-container" style={{ maskImage:`
);

// Move Featured Match Card inside groupedMatches
// First find the block between `{/* Featured / Live Match Card */}` and `{/* Grouped Fixtures List */}`
const startMarker = `        {/* Featured / Live Match Card */}`;
const endMarker = `        {/* Grouped Fixtures List */}`;

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1) {
    const featuredBlock = content.substring(startIndex, endIndex);
    
    // The featuredBlock is:
    /*
        {/* Featured / Live Match Card * /}
        {upcomingMatch && !hasAdvancedFilters && (() => {
          const colorsMap = teamColors as Record<string, string[]>;
          ...
          return (
          <div className="space-y-4 px-2">
            ...
          </div>
          );
        })()}
  
    */
    
    // We want to remove it
    content = content.substring(0, startIndex) + content.substring(endIndex);
    
    // Extract the inner part of the IIFE:
    let innerContent = featuredBlock;
    // Replace the outer IIFE wrapper
    innerContent = innerContent.replace(/\{\/\* Featured \/ Live Match Card \*\/\}/, '');
    innerContent = innerContent.replace(/\{upcomingMatch && !hasAdvancedFilters && \(\(\) => \{/, '');
    
    // find the end of the IIFE
    const lastParen = innerContent.lastIndexOf(`})()}`);
    if (lastParen !== -1) {
        innerContent = innerContent.substring(0, lastParen) + innerContent.substring(lastParen + 5);
    }
    
    // Modify it to use col-span-2
    innerContent = innerContent.replace(`<div className="space-y-4 px-2">`, `<div className="md:col-span-2 space-y-4 mb-4">`);
    
    // Now replace the grid part in groupedMatches:
    const gridStart = `<div className="grid md:grid-cols-2 gap-8 px-2">`;
    const newGrid = `${gridStart}
                  {isUpcomingGroup && (() => {
${innerContent}
                  })()}`;
                  
    content = content.replace(gridStart, newGrid);
    
    // Update displayMatches condition and isUpcomingGroup
    const displayMatchesOriginal = `            const displayMatches = group.matches.filter(m => !(upcomingMatch && !hasAdvancedFilters && m.id === upcomingMatch.id));
  
            if (displayMatches.length === 0) return null;`;
            
    const newDisplayMatches = `            const isUpcomingGroup = upcomingMatch && !hasAdvancedFilters && getLocalDateString(upcomingMatch.date, $timezone) === group.date;
            const displayMatches = group.matches.filter(m => !(upcomingMatch && !hasAdvancedFilters && m.id === upcomingMatch.id));
  
            if (displayMatches.length === 0 && !isUpcomingGroup) return null;`;
            
    content = content.replace(displayMatchesOriginal, newDisplayMatches);
} else {
    console.log("Could not find markers for Featured Card.");
}

fs.writeFileSync('src/components/ScheduleFilter.tsx', content);
console.log("Updated ScheduleFilter.tsx successfully");
