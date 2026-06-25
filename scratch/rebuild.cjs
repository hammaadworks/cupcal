const fs = require('fs');

const truth1 = [
  { "date": "2026-06-11", "group": "A", "homeTeam": "Mexico", "awayTeam": "South Africa", "homeScore": 2, "awayScore": 0 },
  { "date": "2026-06-11", "group": "A", "homeTeam": "South Korea", "awayTeam": "Czechia", "homeScore": 2, "awayScore": 1 },
  { "date": "2026-06-12", "group": "B", "homeTeam": "Canada", "awayTeam": "Bosnia and Herzegovina", "homeScore": 1, "awayScore": 1 },
  { "date": "2026-06-12", "group": "D", "homeTeam": "United States", "awayTeam": "Paraguay", "homeScore": 4, "awayScore": 1 },
  { "date": "2026-06-13", "group": "B", "homeTeam": "Qatar", "awayTeam": "Switzerland", "homeScore": 1, "awayScore": 1 },
  { "date": "2026-06-13", "group": "C", "homeTeam": "Brazil", "awayTeam": "Morocco", "homeScore": 1, "awayScore": 1 },
  { "date": "2026-06-13", "group": "C", "homeTeam": "Haiti", "awayTeam": "Scotland", "homeScore": 0, "awayScore": 1 },
  { "date": "2026-06-13", "group": "D", "homeTeam": "Australia", "awayTeam": "Türkiye", "homeScore": 2, "awayScore": 0 },
  { "date": "2026-06-14", "group": "E", "homeTeam": "Germany", "awayTeam": "Curacao", "homeScore": 7, "awayScore": 1 },
  { "date": "2026-06-14", "group": "F", "homeTeam": "Netherlands", "awayTeam": "Japan", "homeScore": 2, "awayScore": 2 },
  { "date": "2026-06-14", "group": "E", "homeTeam": "Ivory Coast", "awayTeam": "Ecuador", "homeScore": 1, "awayScore": 0 },
  { "date": "2026-06-14", "group": "F", "homeTeam": "Sweden", "awayTeam": "Tunisia", "homeScore": 5, "awayScore": 1 },
  { "date": "2026-06-15", "group": "H", "homeTeam": "Spain", "awayTeam": "Cape Verde", "homeScore": 0, "awayScore": 0 },
  { "date": "2026-06-15", "group": "G", "homeTeam": "Belgium", "awayTeam": "Egypt", "homeScore": 1, "awayScore": 1 },
  { "date": "2026-06-15", "group": "H", "homeTeam": "Saudi Arabia", "awayTeam": "Uruguay", "homeScore": 1, "awayScore": 1 },
  { "date": "2026-06-15", "group": "G", "homeTeam": "Iran", "awayTeam": "New Zealand", "homeScore": 2, "awayScore": 2 },
  { "date": "2026-06-16", "group": "I", "homeTeam": "France", "awayTeam": "Senegal", "homeScore": 3, "awayScore": 1 },
  { "date": "2026-06-16", "group": "I", "homeTeam": "Iraq", "awayTeam": "Norway", "homeScore": 1, "awayScore": 4 },
  { "date": "2026-06-16", "group": "J", "homeTeam": "Argentina", "awayTeam": "Algeria", "homeScore": 3, "awayScore": 0 },
  { "date": "2026-06-16", "group": "J", "homeTeam": "Austria", "awayTeam": "Jordan", "homeScore": 3, "awayScore": 1 },
  { "date": "2026-06-17", "group": "K", "homeTeam": "Portugal", "awayTeam": "DR Congo", "homeScore": 1, "awayScore": 1 },
  { "date": "2026-06-17", "group": "L", "homeTeam": "England", "awayTeam": "Croatia", "homeScore": 4, "awayScore": 2 },
  { "date": "2026-06-17", "group": "L", "homeTeam": "Ghana", "awayTeam": "Panama", "homeScore": 1, "awayScore": 0 },
  { "date": "2026-06-17", "group": "K", "homeTeam": "Uzbekistan", "awayTeam": "Colombia", "homeScore": 1, "awayScore": 3 }
];

const truth2 = [
  { "date": "2026-06-18", "group": "A", "homeTeam": "Czechia", "awayTeam": "South Africa", "homeScore": 1, "awayScore": 1 },
  { "date": "2026-06-18", "group": "B", "homeTeam": "Switzerland", "awayTeam": "Bosnia and Herzegovina", "homeScore": 4, "awayScore": 1 },
  { "date": "2026-06-18", "group": "B", "homeTeam": "Canada", "awayTeam": "Qatar", "homeScore": 6, "awayScore": 0 },
  { "date": "2026-06-18", "group": "A", "homeTeam": "Mexico", "awayTeam": "South Korea", "homeScore": 1, "awayScore": 0 },
  { "date": "2026-06-19", "group": "D", "homeTeam": "United States", "awayTeam": "Australia", "homeScore": 2, "awayScore": 0 },
  { "date": "2026-06-19", "group": "C", "homeTeam": "Scotland", "awayTeam": "Morocco", "homeScore": 0, "awayScore": 1 },
  { "date": "2026-06-19", "group": "C", "homeTeam": "Brazil", "awayTeam": "Haiti", "homeScore": 3, "awayScore": 0 },
  { "date": "2026-06-19", "group": "D", "homeTeam": "Türkiye", "awayTeam": "Paraguay", "homeScore": 0, "awayScore": 1 },
  { "date": "2026-06-20", "group": "F", "homeTeam": "Netherlands", "awayTeam": "Sweden", "homeScore": 5, "awayScore": 1 },
  { "date": "2026-06-20", "group": "E", "homeTeam": "Germany", "awayTeam": "Ivory Coast", "homeScore": 2, "awayScore": 1 },
  { "date": "2026-06-20", "group": "E", "homeTeam": "Ecuador", "awayTeam": "Curacao", "homeScore": 0, "awayScore": 0 },
  { "date": "2026-06-20", "group": "F", "homeTeam": "Tunisia", "awayTeam": "Japan", "homeScore": 0, "awayScore": 4 },
  { "date": "2026-06-21", "group": "H", "homeTeam": "Spain", "awayTeam": "Saudi Arabia", "homeScore": 4, "awayScore": 0 },
  { "date": "2026-06-21", "group": "G", "homeTeam": "Belgium", "awayTeam": "Iran", "homeScore": 0, "awayScore": 0 },
  { "date": "2026-06-21", "group": "H", "homeTeam": "Uruguay", "awayTeam": "Cape Verde", "homeScore": 2, "awayScore": 2 },
  { "date": "2026-06-21", "group": "G", "homeTeam": "New Zealand", "awayTeam": "Egypt", "homeScore": 1, "awayScore": 3 },
  { "date": "2026-06-22", "group": "J", "homeTeam": "Argentina", "awayTeam": "Austria", "homeScore": 2, "awayScore": 0 },
  { "date": "2026-06-22", "group": "I", "homeTeam": "France", "awayTeam": "Iraq", "homeScore": 3, "awayScore": 0 },
  { "date": "2026-06-22", "group": "I", "homeTeam": "Norway", "awayTeam": "Senegal", "homeScore": 3, "awayScore": 2 },
  { "date": "2026-06-22", "group": "J", "homeTeam": "Jordan", "awayTeam": "Algeria", "homeScore": 1, "awayScore": 2 },
  { "date": "2026-06-23", "group": "K", "homeTeam": "Portugal", "awayTeam": "Uzbekistan", "homeScore": 5, "awayScore": 0 },
  { "date": "2026-06-23", "group": "L", "homeTeam": "England", "awayTeam": "Ghana", "homeScore": 0, "awayScore": 0 },
  { "date": "2026-06-23", "group": "L", "homeTeam": "Panama", "awayTeam": "Croatia", "homeScore": 0, "awayScore": 1 },
  { "date": "2026-06-23", "group": "K", "homeTeam": "Colombia", "awayTeam": "DR Congo", "homeScore": 1, "awayScore": 0 }
];

const truth3 = [
  { "date": "2026-06-24", "homeTeam": "Switzerland", "awayTeam": "Canada", "homeScore": 2, "awayScore": 1 },
  { "date": "2026-06-24", "homeTeam": "Bosnia and Herzegovina", "awayTeam": "Qatar", "homeScore": 3, "awayScore": 1 },
  { "date": "2026-06-24", "homeTeam": "Scotland", "awayTeam": "Brazil", "homeScore": 0, "awayScore": 3 },
  { "date": "2026-06-24", "homeTeam": "Morocco", "awayTeam": "Haiti", "homeScore": 4, "awayScore": 2 },
  { "date": "2026-06-25", "homeTeam": "Czechia", "awayTeam": "Mexico", "homeScore": 0, "awayScore": 3 },
  { "date": "2026-06-25", "homeTeam": "South Africa", "awayTeam": "South Korea", "homeScore": 1, "awayScore": 0 },
  { "date": "2026-06-25", "homeTeam": "Ecuador", "awayTeam": "Germany", "homeScore": null, "awayScore": null },
  { "date": "2026-06-25", "homeTeam": "Curacao", "awayTeam": "Ivory Coast", "homeScore": null, "awayScore": null },
  { "date": "2026-06-26", "homeTeam": "Tunisia", "awayTeam": "Netherlands", "homeScore": null, "awayScore": null },
  { "date": "2026-06-26", "homeTeam": "Japan", "awayTeam": "Sweden", "homeScore": null, "awayScore": null },
  { "date": "2026-06-26", "homeTeam": "Türkiye", "awayTeam": "United States", "homeScore": null, "awayScore": null },
  { "date": "2026-06-26", "homeTeam": "Paraguay", "awayTeam": "Australia", "homeScore": null, "awayScore": null },
  { "date": "2026-06-26", "homeTeam": "Norway", "awayTeam": "France", "homeScore": null, "awayScore": null },
  { "date": "2026-06-26", "homeTeam": "Senegal", "awayTeam": "Iraq", "homeScore": null, "awayScore": null },
  { "date": "2026-06-27", "homeTeam": "Uruguay", "awayTeam": "Spain", "homeScore": null, "awayScore": null },
  { "date": "2026-06-27", "homeTeam": "Cape Verde", "awayTeam": "Saudi Arabia", "homeScore": null, "awayScore": null },
  { "date": "2026-06-27", "homeTeam": "New Zealand", "awayTeam": "Belgium", "homeScore": null, "awayScore": null },
  { "date": "2026-06-27", "homeTeam": "Egypt", "awayTeam": "Iran", "homeScore": null, "awayScore": null },
  { "date": "2026-06-27", "homeTeam": "Panama", "awayTeam": "England", "homeScore": null, "awayScore": null },
  { "date": "2026-06-27", "homeTeam": "Croatia", "awayTeam": "Ghana", "homeScore": null, "awayScore": null },
  { "date": "2026-06-27", "homeTeam": "Colombia", "awayTeam": "Portugal", "homeScore": null, "awayScore": null },
  { "date": "2026-06-27", "homeTeam": "DR Congo", "awayTeam": "Uzbekistan", "homeScore": null, "awayScore": null },
  { "date": "2026-06-27", "homeTeam": "Jordan", "awayTeam": "Argentina", "homeScore": null, "awayScore": null },
  { "date": "2026-06-27", "homeTeam": "Algeria", "awayTeam": "Austria", "homeScore": null, "awayScore": null }
];

const allTruth = [...truth1, ...truth2, ...truth3];
const matches = JSON.parse(fs.readFileSync('src/data/matches.json', 'utf8'));

const sqlStatements = [];

allTruth.forEach((t, i) => {
  const match = matches[i];
  if (match) {
    if (t.group) match.group = t.group;
    match.homeTeam = t.homeTeam;
    match.awayTeam = t.awayTeam;
    
    // Clear bloat but KEEP original exact UTC date
    delete match.result;

    if (t.homeScore !== null && t.awayScore !== null) {
      sqlStatements.push(`INSERT INTO public.match_results (match_id, home_score, away_score) VALUES ('${match.id}', ${t.homeScore}, ${t.awayScore}) ON CONFLICT (match_id) DO UPDATE SET home_score = EXCLUDED.home_score, away_score = EXCLUDED.away_score, updated_at = now();`);
    }
  }
});

// For remaining matches, delete .result
for (let i = 72; i < matches.length; i++) {
  delete matches[i].result;
}

fs.writeFileSync('src/data/matches.json', JSON.stringify(matches, null, 2));
fs.writeFileSync('insert_all_scores.sql', sqlStatements.join('\n'));
console.log("Rebuilt matches.json (dates intact) and generated insert_all_scores.sql");
