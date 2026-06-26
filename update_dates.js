const fs = require('fs');

let content = fs.readFileSync('src/components/ScheduleFilter.tsx', 'utf-8');

const targetStr = `      if (nextMatch) {
          setSelectedDate(getLocalDateString(nextMatch.date, $timezone));
      } else {
          setSelectedDate(sorted[0]);
      }`;

const replacementStr = `      const todayDate = getLocalDateString(new Date().toISOString(), $timezone);
      if (sorted.includes(todayDate)) {
          setSelectedDate(todayDate);
      } else if (nextMatch) {
          setSelectedDate(getLocalDateString(nextMatch.date, $timezone));
      } else {
          setSelectedDate(sorted[0]);
      }`;

content = content.replace(targetStr, replacementStr);
fs.writeFileSync('src/components/ScheduleFilter.tsx', content);
console.log("Updated ScheduleFilter.tsx successfully");
