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
- Every meal should carry `carbs`, `fiber` and `sugar` (grams), plus `calories` and
  `protein`. For chain/packaged food, look up the published nutrition and use it. For
  home cooking or anything without published numbers, give a reasonable estimate and
  set `"estimated": true`; ask about portion size if it changes the carbs a lot.
  The site shows net carbs (carbs − fiber) automatically — always record `fiber`.
- Keep health details out of the repo (it's public): no conditions, medications,
  glucose readings or personal context about family in any file or commit message.
- Keep the files valid JSON (2-space indent), sorted by date ascending.
- Commit message: `Log: <date> <short summary>`.
- Every entry (workout, cardio item, meal, weight) may have an optional `"time": "HH:MM"`
  (24-hour, local). Record it whenever William gives or implies one ("around 7",
  "after work" → ask or use his stated time); it's how we find his real time windows.
- Water: log as `"meal": "snack"` with zero macros and `"waterOz"`. His usual
  large tumbler is ~40 oz but he packs it with ice, so count ~30 oz of water per cup.
- Snacks and drinks count as meals (`"meal": "snack"`). Put context William mentions
  (hunger, mood, eating out, skipped meal, why a workout was skipped) in `notes`.

## Discovery week (started 2026-11-21)
William is spending the first week just logging honestly — no plan yet — to learn his
habits and available time windows. Don't push a routine or menu during this week; at
the end, review the data with him (meal timing, gaps, snacking, when he actually had
time to move) and then build the routine and meal plan from it.

Context William gave: he works from home. Low-step days (~1–2k) are WFH days;
high days (7–10k) are when he's out — shopping, or the weekend of Nov 14–15 (Chiefs
game and a craft show). Add `"notes"` to an activity entry when he says what the
day was (e.g. "WFH", "shopping").

Pattern William named (2026-11-21): opportunity eating — extra food happens when he's
picking up or around food for other people (hash browns on a breakfast run, fries
from someone else's order). Mark these meals with `"notes": "opportunity"` so the
end-of-week review can count them.
Second pattern he named (2026-11-22): "no-reason food" — eating something just because
it's in the fridge (a random pepperoni pack). Tag with `"notes": "no-reason"`.
Third pattern (seen 2026-11-22 and 11-23): skipped dinner, then an evening snack instead —
long gaps after a midday meal. Note skipped meals in `notes`.

William flagged 2026-11-21 (game day) as not a normal eating day — two orders of fries.
Weigh it accordingly in the review; he wants to cut back on fries.
At games he usually walks the concourse between periods — an easy built-in walk.
Football days are his grazing/salty days (he expects it). Thanksgiving (Thu 2026-11-26)
is his big holiday: he's cooking smoked turkey, spiral ham, pickles, olives, radishes,
potatoes, corn, stuffing, fruit salad, and eats leftovers all week. Log it anyway with
rough portions; turkey leftovers are a good lean-protein option for the review.
Equipment: he has an elliptical in the garage. Daily Move ring has been ~20-40 cal short
(about 10 min of activity); he wants to add ~10 min walks or elliptical. Log as cardio.
His own swap idea: on an opportunity breakfast run, get a side of scrambled eggs instead
of hash browns.

## Saved foods (from labels William sent)
- Carl Buddig ham, 2 oz pack: 90 cal, 1 g carbs, 0 g fiber, 1 g sugar, 9 g protein
- Carl Buddig chicken, 2 oz pack: 90 cal, 2 g carbs, 0 g fiber, 1 g sugar, 9 g protein
- Hickory Farms Farmhouse summer sausage (7 oz stick), per 2 oz: 190 cal, 1 g carbs, 0 g fiber, 1 g sugar, 10 g protein (580 mg sodium)
- Hickory Farms Jalapeño Cheddar Blend (7 oz bar, 7 servings), per 1 oz: 100 cal, 1 g carbs, 0 g fiber, 0 g sugar, 6 g protein (360 mg sodium) — from label
- Swiss Miss milk chocolate, 30-ct box (1.38 oz envelope): 160 cal, ~34 g carbs, ~0.5 g fiber, ~24 g sugar (23 g added), 1 g protein
- Homemade Chex mix (box recipe, no rye chips), per cup: ~260 cal, ~36 g carbs, ~2 g fiber, ~4 g sugar, ~5 g protein (estimate)
- Mtn Dew Baja Blast Zero Sugar, 12 oz can: 0 cal, 0 g carbs, 0 g sugar (68 mg caffeine) — count waterOz 12
- Ruffles Original, 1 oz (~12 chips): 160 cal, 15 g carbs, 1 g fiber, ~0.5 g sugar, 2 g protein
- Cottage cheese, 1 cup (generic 4%, estimate): 220 cal, 10 g carbs, 0 g fiber, 8 g sugar, 25 g protein
- WinCo spaghetti, 2 oz dry: 200 cal, 42 g carbs, 2 g fiber, 2 g sugar, 7 g protein
- Jar pasta sauce (Prego-style), 1/2 cup: 70 cal, 10 g carbs, 2 g fiber, 10 g sugar (4 g added), 2 g protein, 470 mg sodium
- WinCo Garlic Texas Toast, 1 slice: 140 cal, 15 g carbs, <1 g fiber, <1 g sugar, 3 g protein
- 81% lean ground beef, 1/2 lb raw (drained, estimate): ~520 cal, 0 g carbs, ~40 g protein
- Grated parmesan (shaker), 2 tsp (5 g): 20 cal, 0 g carbs, 0 g sugar, 2 g protein, 100 mg sodium
- Armour pepperoni, per 16 slices (30 g): 140 cal, 1 g carbs, 0 g fiber, <1 g sugar, 6 g protein

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
  { "date": "2026-11-21", "time": "12:15", "meal": "lunch", "items": "Chicken burrito bowl", "calories": 650, "carbs": 70, "fiber": 9, "sugar": 4, "protein": 40, "estimated": true, "notes": "" }
]
```
`meal` is one of: breakfast, lunch, dinner, snack.

`data/activity.json` — one entry per day for walking stats from William's phone
(he reports them; Claude can't read phone health data here). If he sends an updated
number for a day that already has an entry, replace that day's values.
```json
[ { "date": "2026-11-21", "steps": 8200, "distance": 3.6, "moveCalories": 204, "moveGoal": 180, "flights": 2, "notes": "WFH" } ]
```
Only `date` is required; include the Move ring numbers and flights when a screenshot shows them.

`data/body.json`
```json
[ { "date": "2026-11-21", "weight": 210.4 } ]
```

## Logging from screenshots
William may send Apple Fitness "Steps" screenshots. Exact numbers shown (the big Count
on the D view) are logged as-is. Values read off bar heights are approximate — round
to the nearest 100 steps / 0.05 mi and set `"estimated": true`. Don't log a partial
day as final; the day's total comes from the next morning's D view of the prior day.
Baseline noted 2026-11-21: ~3,800 steps/day yearly average, ~4,300 this month.
