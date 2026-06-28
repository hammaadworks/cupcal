const fs = require('fs');

const sql = fs.readFileSync('update_r32.sql', 'utf8');
const valuesPart = sql.split('VALUES\n')[1].split('ON CONFLICT')[0].trim().replace(/;$/, '');
const rows = valuesPart.split('\n').filter(r => r.trim() && !r.startsWith('--'));

const matches = rows.map(r => {
    const match = r.match(/\((.*?)\)/);
    if (!match) return null;
    const parts = match[1].split(',').map(s => s.trim().replace(/^'|'$/g, ''));
    return {
        id: parts[0],
        matchNumber: parseInt(parts[0], 10),
        stage: parts[1],
        kickoffUtc: parts[2],
        stadiumId: parts[3],
        homeSource: parts[4],
        awaySource: parts[5],
        home: parts[6] === 'NULL' ? null : parts[6],
        away: parts[7] === 'NULL' ? null : parts[7],
        homeScore: null,
        awayScore: null,
        status: "SCHEDULED",
        highlightUrl: null
    };
}).filter(Boolean);

fs.writeFileSync('src/data/knockout_placeholders.json', JSON.stringify(matches, null, 2));
console.log('Saved knockout_placeholders.json with R32 teams!');
