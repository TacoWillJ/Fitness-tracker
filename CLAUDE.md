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
- Every entry (workout, cardio item, meal, weight) may have an optional `"time": "HH:MM"`
  (24-hour, local). Record it whenever William gives or implies one ("around 7",
  "after work" → ask or use his stated time); it's how we find his real time windows.
- Snacks and drinks count as meals (`"meal": "snack"`). Put context William mentions
  (hunger, mood, eating out, skipped meal, why a workout was skipped) in `notes`.

## Discovery week (started 2026-11-21)
William is spending the first week just logging honestly — no plan yet — to learn his
habits and available time windows. Don't push a routine or menu during this week; at
the end, review the data with him (meal timing, gaps, snacking, when he actually had
time to move) and then build the routine and meal plan from it.

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
  { "date": "2026-11-21", "time": "12:15", "meal": "lunch", "items": "Chicken burrito bowl", "calories": 650, "protein": 40, "estimated": true, "notes": "" }
]
```
`meal` is one of: breakfast, lunch, dinner, snack.

`data/activity.json` — one entry per day for walking stats from William's phone
(he reports them; Claude can't read phone health data here). If he sends an updated
number for a day that already has an entry, replace that day's values.
```json
[ { "date": "2026-11-21", "steps": 8200, "distance": 3.6 } ]
```

`data/body.json`
```json
[ { "date": "2026-11-21", "weight": 210.4 } ]
```
