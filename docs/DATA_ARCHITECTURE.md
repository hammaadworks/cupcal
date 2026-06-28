# FIFA World Cup 2026 Match Data Architecture

## The Split Architecture
The app uses a split architecture to optimize performance and simplify data management:

1. **Group Stage (`src/data/group_matches.json`)**: All 72 group stage matches are stored in static JSON. Since the teams, venues, and timings for group stage are completely known and mostly immutable, this reduces database calls and provides instant loading.
2. **Knockout Stage (Supabase `knockout_matches` table)**: Matches 73-104 (Round of 32 through Final) are stored in Supabase. Because the participating teams are dynamic and dependent on group stage results, this requires real-time database updates.

## Relational Meta Data
To avoid repeating strings, we use standardized codes in the match data:
- `src/data/teams.json` holds all 48 teams mapped by FIFA Alpha-3 codes (e.g. `MEX`, `USA`, `ARG`).
- `src/data/stadiums.json` holds all 16 stadiums mapped by string IDs (e.g. `estadio-azteca`).

When rendering, the components look up the team/stadium details using helper functions (e.g. `getTeamName('MEX')`, `getStadiumCity('estadio-azteca')`).

## The `knockout_matches` Schema

```sql
CREATE TABLE public.knockout_matches (
    match_number INTEGER PRIMARY KEY,      -- 73 to 104
    stage TEXT NOT NULL,                    -- 'R32' | 'R16' | 'QF' | 'SF' | 'THIRD' | 'FINAL'
    kickoff_utc TIMESTAMPTZ NOT NULL,
    stadium_id TEXT NOT NULL,
    home_team TEXT,                         -- Team code or NULL if TBD
    away_team TEXT,                         -- Team code or NULL if TBD  
    home_source TEXT,                       -- Source logic (e.g. 'W74', '1C')
    away_source TEXT,                       -- Source logic (e.g. 'W77', '2F')
    home_score INTEGER,                     -- NULL until played
    away_score INTEGER,
    home_penalties INTEGER,                 -- NULL unless penalties
    away_penalties INTEGER,
    status TEXT NOT NULL DEFAULT 'SCHEDULED',
    highlight_url TEXT,                     -- Full URL to FIFA highlights
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
```

## Deriving the Winner
We **DO NOT** store a `winner` column in the database. 
Instead, the winner is dynamically computed using the `getWinner(match)` utility function. 
This function checks:
1. If `home_score > away_score`, home wins.
2. If `home_score < away_score`, away wins.
3. If scores are tied, it checks `home_penalties` and `away_penalties`.

## How to Update Knockout Matches in Supabase

When the Round of 32 begins, you will need to update the Supabase table with the confirmed teams and live scores.

### 1. Updating Confirmed Teams (End of Group Stage)
When the group stage ends, update the knockout rows with the confirmed teams based on their group standings.

```sql
-- Example: 1st in Group A is Mexico (MEX), 2nd in Group B is Canada (CAN)
UPDATE public.knockout_matches
SET home_team = 'MEX', away_team = 'CAN'
WHERE match_number = 73;
```

### 2. Updating Live Scores
As matches are played, update the scores. When a match finishes, update the status.

```sql
UPDATE public.knockout_matches
SET 
    home_score = 2, 
    away_score = 1, 
    status = 'FINISHED'
WHERE match_number = 73;
```

### 3. Adding Penalties
If a knockout match goes to penalties, add the penalty scores.

```sql
UPDATE public.knockout_matches
SET 
    home_score = 1, 
    away_score = 1, 
    home_penalties = 5,
    away_penalties = 4,
    status = 'FINISHED'
WHERE match_number = 74;
```

### 4. Updating Highlight Links
Once the match is finished and FIFA uploads the highlights, paste the full URL into the DB.

```sql
UPDATE public.knockout_matches
SET highlight_url = 'https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/mexico-canada-highlights-match-report'
WHERE match_number = 73;
```

As soon as you execute these SQL updates in your Supabase SQL Editor (or via the Table Editor UI), the changes will instantly reflect across the entire app, including the Bracket visualization!
