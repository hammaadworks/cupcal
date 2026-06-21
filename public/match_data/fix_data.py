import csv
import os

replacements = {
    "Italy": ("Bosnia and Herzegovina", "BIH"),
    "Wales": ("Türkiye", "TUR"),
    "Nigeria": ("Congo DR", "COD"),
    "Saudi Arabia": ("Iraq", "IRQ"),
    "Chile": ("Costa Rica", "CRC"),
}

def update_csv(filepath, column_names):
    rows = []
    with open(filepath, 'r') as f:
        reader = csv.DictReader(f)
        fieldnames = reader.fieldnames
        for row in reader:
            for col in column_names:
                for old_name, (new_name, new_code) in replacements.items():
                    if row[col] == old_name:
                        row[col] = new_name
                        if 'fifa_code' in row:
                            row['fifa_code'] = new_code
            rows.append(row)
    
    with open(filepath, 'w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

teams_path = '/Users/alhamdulillah/codespace/wccal/public/match_data/teams.csv'
matches_path = '/Users/alhamdulillah/codespace/wccal/public/match_data/matches.csv'

update_csv(teams_path, ['team_name'])
update_csv(matches_path, ['home_team', 'away_team'])
