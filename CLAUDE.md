# Fitness Tracker — instructions for Claude

William logs workouts, meals and body weight by messaging Claude in plain language
(e.g. "bench 3x8 at 135, ran 20 min, burrito bowl for lunch"). Claude turns that into
entries in the JSON files under `data/`, commits, and pushes to `main`. The GitHub
Pages site (`index.html`) reads those files and renders the log and charts.

## Rules
- Append entries; never rewrite or delete existing ones unless William asks.
- Dates are `YYYY-MM-DD` in William's local time (America/Los_Angeles). If he doesn't
  give a date, use today.
- Weights are in pounds, distances in miles, durations in minutes.
- Use consistent exercise names (Title Case, e.g. "Bench Press", "Back Squat") so the
  progress chart groups them. Check existing names in `data/workouts.json` first.
- If William logs several things for the same day, add to that day's existing workout
  entry rather than creating a duplicate.
- Leave `calories`/`protein` out of meals unless he gives them or asks for estimates;
  if estimated, set `"estimated": true`.
- Keep the files valid JSON (2-space indent), sorted by date ascending.
- Commit message: `Log: <date> <short summary>`.

## Schemas

`data/workouts.json`
```json
[
  {
    "date": "2026-11-21",
    "exercises": [
      { "name": "Bench Press", "sets": [ { "reps": 8, "weight": 135 }, { "reps": 8, "weight": 135 } ] },
      { "name": "Push-up", "sets": [ { "reps": 15 } ] }
    ],
    "cardio": [ { "name": "Run", "minutes": 20, "distance": 2.0 } ],
    "notes": "Felt good"
  }
]
```

`data/meals.json`
```json
[
  { "date": "2026-11-21", "meal": "lunch", "items": "Chicken burrito bowl", "calories": 650, "protein": 40, "estimated": true, "notes": "" }
]
```
`meal` is one of: breakfast, lunch, dinner, snack.

`data/body.json`
```json
[ { "date": "2026-11-21", "weight": 210.4 } ]
```
