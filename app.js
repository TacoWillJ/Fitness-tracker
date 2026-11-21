(async function () {
  const DAYS_PER_PAGE = 14;

  // ---------- helpers ----------
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const parseDate = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
  const fmtDate = (s) => parseDate(s).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
  const shortDate = (d) => d.toLocaleDateString(undefined, { month: "numeric", day: "numeric" });
  const weekStart = (d) => { const x = new Date(d); const dow = (x.getDay() + 6) % 7; x.setDate(x.getDate() - dow); x.setHours(0, 0, 0, 0); return x; };
  const sameDay = (a, b) => a.getTime() === b.getTime();

  async function load(name) {
    try {
      const res = await fetch(`data/${name}.json?v=${Date.now()}`);
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch { return []; }
  }

  const [workouts, meals, body, activity] = await Promise.all([load("workouts"), load("meals"), load("body"), load("activity")]);

  // ---------- summary ----------
  const thisWeek = weekStart(new Date());
  const inWeek = (e) => sameDay(weekStart(parseDate(e.date)), thisWeek);
  const wkWorkouts = workouts.filter(inWeek);
  const wkMeals = meals.filter(inWeek);
  const wkSets = wkWorkouts.reduce((n, w) => n + (w.exercises || []).reduce((m, ex) => m + (ex.sets || []).length, 0), 0);
  const wkCardio = wkWorkouts.reduce((n, w) => n + (w.cardio || []).reduce((m, c) => m + (Number(c.minutes) || 0), 0), 0);
  const sortedBody = [...body].filter((b) => b.weight).sort((a, b) => a.date.localeCompare(b.date));
  const lastWeight = sortedBody.length ? sortedBody[sortedBody.length - 1].weight : null;

  const tiles = [
    [wkWorkouts.length, "workouts"],
    [wkSets, "sets"],
    [wkCardio, "cardio minutes"],
    [wkMeals.length, "meals logged"],
  ];
  const wkActivity = activity.filter(inWeek).filter((a) => a.steps);
  if (wkActivity.length) tiles.push([Math.round(wkActivity.reduce((n, a) => n + Number(a.steps), 0) / wkActivity.length).toLocaleString(), "avg daily steps"]);
  if (lastWeight != null) tiles.push([lastWeight, "latest weight (lb)"]);
  document.getElementById("summary").innerHTML = tiles
    .map(([v, l]) => `<div class="tile"><div class="value">${esc(v)}</div><div class="label">${esc(l)}</div></div>`)
    .join("");

  const allDates = [...workouts, ...meals, ...body, ...activity].map((e) => e.date).filter(Boolean).sort();
  document.getElementById("updated").textContent = allDates.length
    ? `Last entry: ${fmtDate(allDates[allDates.length - 1])}`
    : "No entries yet. Tell Claude what you did or ate to get started.";

  // ---------- SVG charts ----------
  const W = 420, H = 200, P = { l: 40, r: 10, t: 12, b: 28 };

  function axes(min, max) {
    const ticks = 4, out = [];
    for (let i = 0; i <= ticks; i++) {
      const v = min + ((max - min) * i) / ticks;
      const y = P.t + (H - P.t - P.b) * (1 - i / ticks);
      out.push(`<line class="grid" x1="${P.l}" x2="${W - P.r}" y1="${y}" y2="${y}"/>`);
      out.push(`<text x="${P.l - 6}" y="${y + 4}" text-anchor="end">${max >= 1000 ? (Math.round(v / 100) / 10) + "k" : Math.round(v * 10) / 10}</text>`);
    }
    return out.join("");
  }

  function lineChart(el, points, emptyMsg) {
    if (!points.length) { el.innerHTML = `<p class="empty">${esc(emptyMsg)}</p>`; return; }
    let min = Math.min(...points.map((p) => p.y)), max = Math.max(...points.map((p) => p.y));
    const pad = Math.max((max - min) * 0.15, 5);
    min = Math.max(0, min - pad); max = max + pad;
    const t0 = points[0].x.getTime(), t1 = points[points.length - 1].x.getTime();
    const sx = (t) => t1 === t0 ? (P.l + W - P.r) / 2 : P.l + ((t - t0) / (t1 - t0)) * (W - P.l - P.r);
    const sy = (v) => P.t + (1 - (v - min) / (max - min)) * (H - P.t - P.b);
    const path = points.map((p, i) => `${i ? "L" : "M"}${sx(p.x.getTime()).toFixed(1)},${sy(p.y).toFixed(1)}`).join(" ");
    const dots = points.map((p) => `<circle class="dot" r="3.5" cx="${sx(p.x.getTime())}" cy="${sy(p.y)}"><title>${shortDate(p.x)}: ${p.y}</title></circle>`).join("");
    const labelIdx = [...new Set([0, Math.floor((points.length - 1) / 2), points.length - 1])];
    const labels = labelIdx.map((i) => `<text x="${sx(points[i].x.getTime())}" y="${H - 8}" text-anchor="${points.length === 1 ? "middle" : i === 0 ? "start" : i === points.length - 1 ? "end" : "middle"}">${shortDate(points[i].x)}</text>`).join("");
    el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img">${axes(min, max)}<path class="line" d="${path}"/>${dots}${labels}</svg>`;
  }

  function barChart(el, bars, emptyMsg) {
    if (!bars.some((b) => b.y > 0)) { el.innerHTML = `<p class="empty">${esc(emptyMsg)}</p>`; return; }
    const max = Math.max(4, ...bars.map((b) => b.y));
    const slot = (W - P.l - P.r) / bars.length, bw = slot * 0.6;
    const sy = (v) => P.t + (1 - v / max) * (H - P.t - P.b);
    const rects = bars.map((b, i) => {
      const x = P.l + i * slot + (slot - bw) / 2, y = sy(b.y);
      const every = Math.ceil(bars.length / 6);
      const label = (bars.length - 1 - i) % every ? "" :`<text x="${x + bw / 2}" y="${H - 8}" text-anchor="middle">${b.label}</text>`;
      return `<rect class="bar" rx="3" x="${x}" y="${y}" width="${bw}" height="${H - P.b - y}"><title>Week of ${b.label}: ${b.y}</title></rect>${label}`;
    }).join("");
    el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img">${axes(0, max)}${rects}</svg>`;
  }

  // Lift progress: heaviest set per day for the chosen exercise
  const byExercise = {};
  for (const w of workouts) for (const ex of w.exercises || []) {
    const top = Math.max(0, ...(ex.sets || []).map((s) => Number(s.weight) || 0));
    if (!top) continue;
    const list = (byExercise[ex.name] ||= {});
    list[w.date] = Math.max(list[w.date] || 0, top);
  }
  const exNames = Object.keys(byExercise).sort((a, b) => Object.keys(byExercise[b]).length - Object.keys(byExercise[a]).length);
  const select = document.getElementById("exercise-select");
  const liftEl = document.getElementById("lift-chart");
  const drawLift = () => {
    const d = byExercise[select.value] || {};
    const pts = Object.keys(d).sort().map((k) => ({ x: parseDate(k), y: d[k] }));
    lineChart(liftEl, pts, "Log a weighted lift to see progress here.");
  };
  if (exNames.length) {
    select.innerHTML = exNames.map((n) => `<option>${esc(n)}</option>`).join("");
    select.addEventListener("change", drawLift);
  } else select.hidden = true;
  drawLift();

  // Workouts per week, last 12 weeks
  const weeks = [];
  for (let i = 11; i >= 0; i--) { const d = new Date(thisWeek); d.setDate(d.getDate() - i * 7); weeks.push(d); }
  barChart(document.getElementById("weekly-chart"),
    weeks.map((wk) => ({ label: shortDate(wk), y: workouts.filter((w) => sameDay(weekStart(parseDate(w.date)), wk)).length })),
    "No workouts logged in the last 12 weeks yet.");

  // Steps, last 30 days
  const stepDays = [...activity].filter((a) => a.steps).sort((a, b) => a.date.localeCompare(b.date)).slice(-30);
  if (stepDays.length) barChart(document.getElementById("steps-chart"),
    stepDays.map((a) => ({ label: shortDate(parseDate(a.date)), y: Number(a.steps) })), "");
  else document.getElementById("steps-section").hidden = true;

  // Body weight
  if (sortedBody.length) lineChart(document.getElementById("weight-chart"), sortedBody.map((b) => ({ x: parseDate(b.date), y: Number(b.weight) })), "");
  else document.getElementById("weight-section").hidden = true;

  // ---------- log ----------
  const days = {};
  const day = (d) => (days[d] ||= { workouts: [], meals: [], body: [] });
  workouts.forEach((w) => day(w.date).workouts.push(w));
  meals.forEach((m) => day(m.date).meals.push(m));
  body.forEach((b) => day(b.date).body.push(b));
  activity.forEach((a) => day(a.date).activity = a);
  const dayKeys = Object.keys(days).sort().reverse();
  const mealSlot = { breakfast: "08:00", lunch: "12:30", dinner: "18:30", snack: "15:00" };
  const fmtTime = (hm) => {
    const [h, m] = hm.split(":").map(Number);
    return `${((h + 11) % 12) + 1}:${String(m || 0).padStart(2, "0")}${h < 12 ? "a" : "p"}`;
  };

  function setText(sets) {
    // Collapse identical sets: 3×8 @ 135
    const groups = [];
    for (const s of sets || []) {
      const key = `${s.reps ?? ""}|${s.weight ?? ""}`;
      const last = groups[groups.length - 1];
      if (last && last.key === key) last.n++; else groups.push({ key, n: 1, s });
    }
    return groups.map(({ n, s }) => `${n > 1 ? n + "×" : ""}${s.reps ?? "?"}${s.weight ? " @ " + s.weight : ""}`).join(", ");
  }

  function renderDay(k) {
    // Each item gets a sort key: its time ("HH:MM") if given, else a rough slot.
    const d = days[k], items = [];
    const t = (time) => time ? `<span class="time">${esc(fmtTime(time))}</span>` : "";
    for (const w of d.workouts) {
      const key = w.time || "12:00", parts = [];
      for (const ex of w.exercises || []) parts.push(`<li>${t(w.time)}<span class="tag">lift</span>${esc(ex.name)}: ${esc(setText(ex.sets))}</li>`);
      for (const c of w.cardio || []) parts.push(`<li>${t(c.time || w.time)}<span class="tag">cardio</span>${esc(c.name)}${c.minutes ? ` ${esc(c.minutes)} min` : ""}${c.distance ? `, ${esc(c.distance)} mi` : ""}</li>`);
      if (w.notes) parts.push(`<li class="note">${esc(w.notes)}</li>`);
      items.push({ key, html: parts.join("") });
    }
    for (const m of d.meals) {
      const macros = [m.calories && `${m.calories} cal`, m.protein && `${m.protein}g protein`].filter(Boolean).join(", ");
      items.push({
        key: m.time || mealSlot[m.meal] || "23:59",
        html: `<li>${t(m.time)}<span class="tag">${esc(m.meal || "food")}</span>${esc(m.items)}${macros ? ` <span class="note">(${esc(macros)}${m.estimated ? ", est." : ""})</span>` : ""}${m.notes ? ` <span class="note">— ${esc(m.notes)}</span>` : ""}</li>`,
      });
    }
    for (const b of d.body) items.push({ key: b.time || "00:00", html: `<li>${t(b.time)}<span class="tag">weight</span>${esc(b.weight)} lb</li>` });
    if (d.activity && (d.activity.steps || d.activity.distance)) {
      const a = d.activity;
      items.push({ key: "99:99", html: `<li><span class="tag">walking</span>${a.steps ? `${esc(Number(a.steps).toLocaleString())} steps` : ""}${a.distance ? `${a.steps ? ", " : ""}${esc(a.distance)} mi` : ""}${a.estimated ? ` <span class="note">(est. from chart)</span>` : ""}</li>` });
    }
    items.sort((a, b) => a.key.localeCompare(b.key));
    return `<div class="day"><h3>${esc(fmtDate(k))}</h3><ul>${items.map((i) => i.html).join("")}</ul></div>`;
  }

  const logEl = document.getElementById("log"), moreBtn = document.getElementById("more");
  let shown = 0;
  function showMore() {
    const next = dayKeys.slice(shown, shown + DAYS_PER_PAGE);
    logEl.insertAdjacentHTML("beforeend", next.map(renderDay).join(""));
    shown += next.length;
    moreBtn.hidden = shown >= dayKeys.length;
  }
  if (dayKeys.length) { showMore(); moreBtn.addEventListener("click", showMore); }
  else logEl.innerHTML = `<p class="empty">Nothing logged yet.</p>`;
})();
