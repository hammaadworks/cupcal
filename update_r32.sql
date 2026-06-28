CREATE TABLE IF NOT EXISTS public.knockout_matches (
    match_number INTEGER PRIMARY KEY,      
    stage TEXT NOT NULL,                    
    kickoff_utc TIMESTAMPTZ NOT NULL,
    stadium_id TEXT NOT NULL,
    home_team TEXT,                         
    away_team TEXT,                           
    home_source TEXT,                       
    away_source TEXT,                       
    home_score INTEGER,                     
    away_score INTEGER,
    home_penalties INTEGER,                 
    away_penalties INTEGER,
    status TEXT NOT NULL DEFAULT 'SCHEDULED',
    highlight_url TEXT,                     
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.knockout_matches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Knockout matches are viewable by everyone." ON public.knockout_matches;
CREATE POLICY "Knockout matches are viewable by everyone."
ON public.knockout_matches FOR SELECT
USING (true);

INSERT INTO public.knockout_matches (match_number, stage, kickoff_utc, stadium_id, home_source, away_source, home_team, away_team) VALUES
(73, 'R32', '2026-06-29T00:30:00Z', 'sofi-stadium', '1A', '2B', 'RSA', 'CAN'),
(74, 'R32', '2026-06-30T02:00:00Z', 'nrg-stadium', '1C', '2F', 'GER', 'PAR'),
(75, 'R32', '2026-06-30T06:30:00Z', 'gillette-stadium', '1E', '3ABCDF', 'NED', 'MAR'),
(76, 'R32', '2026-06-29T22:30:00Z', 'estadio-bbva', '1F', '2C', 'BRA', 'JPN'),
(77, 'R32', '2026-07-01T02:30:00Z', 'att-stadium', '2E', '2I', 'FRA', 'SWE'),
(78, 'R32', '2026-06-30T22:30:00Z', 'metlife-stadium', '1I', '3CDFGH', 'CIV', 'NOR'),
(79, 'R32', '2026-07-01T06:30:00Z', 'estadio-azteca', '1A', '3CEFHI', 'MEX', 'ECU'),
(80, 'R32', '2026-07-01T21:30:00Z', 'mercedes-benz-stadium', '1L', '3EHIJK', 'ENG', 'COD'),
(81, 'R32', '2026-07-02T05:30:00Z', 'lumen-field', '1G', '3AEHIJ', 'USA', 'BIH'),
(82, 'R32', '2026-07-02T01:30:00Z', 'levis-stadium', '1D', '3BEFIJ', 'BEL', 'SEN'),
(83, 'R32', '2026-07-03T04:30:00Z', 'estadio-akron', '2K', '2L', 'POR', 'CRO'),
(84, 'R32', '2026-07-03T00:30:00Z', 'lincoln-financial-field', '2J', '2J', 'ESP', 'AUT'), 
(85, 'R32', '2026-07-03T08:30:00Z', 'sofi-stadium', '2H', '3EFGIJ', 'SUI', 'ALG'),
(86, 'R32', '2026-07-04T03:30:00Z', 'bmo-field', '2G', '2D', 'ARG', 'CPV'),
(87, 'R32', '2026-07-04T07:00:00Z', 'bc-place', '1K', '3DEIJL', 'COL', 'GHA'),
(88, 'R32', '2026-07-03T23:30:00Z', 'hard-rock-stadium', '1H', '3BCDFG', 'AUS', 'EGY'),

(89, 'R16', '2026-07-05T02:30:00Z', 'lincoln-financial-field', 'W74', 'W77', NULL, NULL),
(90, 'R16', '2026-07-04T22:30:00Z', 'nrg-stadium', 'W73', 'W75', NULL, NULL),
(91, 'R16', '2026-07-06T01:30:00Z', 'metlife-stadium', 'W76', 'W78', NULL, NULL),
(92, 'R16', '2026-07-06T05:30:00Z', 'estadio-azteca', 'W79', 'W80', NULL, NULL),
(93, 'R16', '2026-07-07T00:30:00Z', 'att-stadium', 'W83', 'W84', NULL, NULL),
(94, 'R16', '2026-07-07T05:30:00Z', 'lumen-field', 'W81', 'W82', NULL, NULL),
(95, 'R16', '2026-07-07T21:30:00Z', 'mercedes-benz-stadium', 'W86', 'W88', NULL, NULL),
(96, 'R16', '2026-07-08T01:30:00Z', 'bc-place', 'W85', 'W87', NULL, NULL),

(97, 'QF', '2026-07-10T01:30:00Z', 'gillette-stadium', 'W89', 'W90', NULL, NULL),
(98, 'QF', '2026-07-11T00:30:00Z', 'sofi-stadium', 'W93', 'W94', NULL, NULL),
(99, 'QF', '2026-07-12T02:30:00Z', 'hard-rock-stadium', 'W91', 'W92', NULL, NULL),
(100, 'QF', '2026-07-12T06:30:00Z', 'arrowhead-stadium', 'W95', 'W96', NULL, NULL),

(101, 'SF', '2026-07-15T00:30:00Z', 'att-stadium', 'W97', 'W98', NULL, NULL),
(102, 'SF', '2026-07-16T00:30:00Z', 'mercedes-benz-stadium', 'W99', 'W100', NULL, NULL),

(103, 'THIRD', '2026-07-19T02:30:00Z', 'hard-rock-stadium', 'RU101', 'RU102', NULL, NULL),

(104, 'FINAL', '2026-07-20T00:30:00Z', 'metlife-stadium', 'W101', 'W102', NULL, NULL)

ON CONFLICT (match_number) DO UPDATE SET 
    home_team = EXCLUDED.home_team,
    away_team = EXCLUDED.away_team;
