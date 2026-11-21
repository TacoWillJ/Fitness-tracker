# Fitness Tracker

A simple, free workout / meal / weight tracker hosted on GitHub Pages.

- **Data** lives in `data/workouts.json`, `data/meals.json`, and `data/body.json`.
- **Site** (`index.html`) shows this week's summary, a day-by-day log, lift progress,
  workouts per week, and body weight.
- **Logging:** tell Claude what you did or ate and it commits the entry, or edit the
  JSON files directly (formats are in `CLAUDE.md`).

Pages caches for a few minutes, so a new entry can take a minute or two to show up.
