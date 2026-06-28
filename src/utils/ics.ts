export interface IcsEvent {
  id: string;
  title: string;
  description: string;
  location: string;
  startDate: Date;
  durationMinutes: number;
  alarms: number[];
}

export function generateICS(event: IcsEvent): Blob {
  const formatDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const start = formatDate(event.startDate);
  const endDate = new Date(event.startDate.getTime() + event.durationMinutes * 60000);
  const end = formatDate(endDate);
  
  let alarmsString = '';
  event.alarms.forEach(minutes => {
    alarmsString += `
BEGIN:VALARM
TRIGGER:-PT${minutes}M
ACTION:DISPLAY
DESCRIPTION:Reminder: ${event.title} starts in ${minutes} minutes!
END:VALARM`;
  });

  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//cupcal.online//EN
CALSCALE:GREGORIAN
BEGIN:VEVENT
UID:${event.id}@cupcal.online
DTSTAMP:${formatDate(new Date())}
DTSTART:${start}
DTEND:${end}
SUMMARY:${event.title}
DESCRIPTION:${event.description}
LOCATION:${event.location}${alarmsString}
END:VEVENT
END:VCALENDAR`;

  return new Blob([icsContent.trim()], { type: 'text/calendar;charset=utf-8' });
}

export function downloadIcsBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.ics') ? filename : `${filename}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
