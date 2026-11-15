/* Evendraft AU: event drafts. Everything runs in the browser; nothing is sent anywhere.
   Wall-clock maths uses UTC Date methods on purpose, so the viewer's own time zone never shifts a date or time. */
(() => {
  const $ = (id) => document.getElementById(id);
  const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  // [standard, daylight saving, IANA zone]. QLD, WA and NT don't move their clocks.
  const ZONES = {
    VIC: ["AEST", "AEDT", "Australia/Melbourne"],
    NSW: ["AEST", "AEDT", "Australia/Sydney"],
    ACT: ["AEST", "AEDT", "Australia/Sydney"],
    TAS: ["AEST", "AEDT", "Australia/Hobart"],
    SA: ["ACST", "ACDT", "Australia/Adelaide"],
    QLD: ["AEST", "AEST", "Australia/Brisbane"],
    NT: ["ACST", "ACST", "Australia/Darwin"],
    WA: ["AWST", "AWST", "Australia/Perth"],
  };

  const EVENTS = {
    bee: {
      name: "Working bee",
      length: 180,
      defaults: { group: "Banksia St Community Garden", place: "the garden on Banksia St", date: "2026-11-21", start: "09:00", people: "24" },
      invite: (f) =>
        `G'day neighbours,\n\n${f.group} is holding a working bee on ${f.date}, ${f.start} to ${f.end} ${f.tz}, at ${f.place}.\n\n` +
        `We'll be weeding, mulching and planting. Bring gloves, a hat and a water bottle. Morning tea is on us, and kids are welcome with an adult.\n\n` +
        `RSVP by ${f.rsvp} so we know how many to feed.`,
      run: [
        [0, "Arrive, sign in, sunscreen on"],
        [15, "Welcome, Acknowledgement of Country, safety briefing"],
        [30, "Weeding, mulching and planting in three teams"],
        [120, "Morning tea"],
        [150, "Pack up and count the tools"],
        [180, "Finish"],
      ],
      list: (n) => [
        `Spare gloves: ${Math.ceil(n / 3)} pairs`,
        `Drinking water: ${n} L`,
        `SPF 50+ sunscreen: ${Math.ceil(n / 10)} bottles`,
        `Scones for morning tea: ${n * 2}`,
      ],
    },
    sizzle: {
      name: "Sausage sizzle",
      length: 180,
      defaults: { group: "Banksia St Primary P&C", place: "the school gate on Banksia St", date: "2026-11-28", start: "09:00", people: "150" },
      invite: (f) =>
        `Sausage sizzle at ${f.place}\n${f.date}, ${f.start} to ${f.end} ${f.tz}\n\n` +
        `$3 a snag in bread, $2 a drink. Gluten-free bread and veggie snags on request.\n\n` +
        `Run by ${f.group}. Every dollar raised stays local.\n\n` +
        `Can you take a one-hour shift on the barbie? Reply by ${f.rsvp}.`,
      run: [
        [-45, "Set up gazebo, BBQ, fire blanket and hand-wash station"],
        [0, "Open, first snags on"],
        [165, "Last orders"],
        [180, "Close, clean down, count the float"],
      ],
      list: (n) => {
        const snags = Math.ceil(n * 1.2);
        return [
          `Sausages: ${snags}`,
          `Bread: ${snags} slices (${Math.ceil(snags / 18)} loaves)`,
          `Onions: ${Math.ceil(snags / 8)}`,
          `Tomato and BBQ sauce: ${Math.max(2, Math.ceil(n / 40))} bottles`,
          `Cash float: $100 in coins`,
        ];
      },
    },
    trivia: {
      name: "Trivia night",
      length: 210,
      defaults: { group: "Banksia St Primary P&C", place: "the school hall on Banksia St", date: "2026-11-27", start: "19:00", people: "80" },
      invite: (f) =>
        `Trivia night!\n\n${f.group} invite you to a trivia night on ${f.date}, ${f.start} to ${f.end} ${f.tz}, at ${f.place}.\n\n` +
        `Tables of 8, $20 a head. BYO drinks and nibbles. Prizes for the winners, the wooden spoon and the best-dressed table.\n\n` +
        `Book your table by ${f.rsvp}.`,
      run: [
        [-60, "Set up tables, answer sheets and the raffle"],
        [0, "Doors open, teams sign in"],
        [30, "Rounds 1 to 3"],
        [105, "Break and raffle draw"],
        [120, "Rounds 4 to 6"],
        [195, "Scores, prizes and thank-yous"],
        [210, "Close and pack up"],
      ],
      list: (n) => {
        const tables = Math.ceil(n / 8);
        return [
          `Tables of 8: ${tables}`,
          `Answer sheets: ${tables * 6} (6 rounds)`,
          `Pens: ${tables * 2}`,
          `Raffle tickets: ${Math.max(1, Math.ceil(n / 50))} books`,
          `Prizes: 3 (winners, wooden spoon, best dressed)`,
        ];
      },
    },
    xmas: {
      name: "Street Christmas party",
      length: 240,
      defaults: { group: "The Banksia St neighbours", place: "Banksia St, between the roundabout and the park", date: "2026-12-19", start: "16:00", people: "60" },
      invite: (f) =>
        `Christmas on the street!\n\n${f.group} invite you to a street party on ${f.date}, ${f.start} to ${f.end} ${f.tz}, on ${f.place}. The road will be closed to cars.\n\n` +
        `BYO drinks and a chair, and bring a plate to share. Santa arrives at ${f.santa}.\n\n` +
        `RSVP by ${f.rsvp} with how many are coming.`,
      run: [
        [-60, "Barriers up, council road-closure permit on hand"],
        [0, "Party starts, BBQ on"],
        [90, "Santa arrives"],
        [120, "Carols"],
        [210, "Clean-up"],
        [240, "Barriers down, road reopens"],
      ],
      list: (n) => [
        `Council road-closure permit: apply at least 6 weeks ahead`,
        `Ice: ${Math.ceil(n / 5)} bags`,
        `Shade: ${Math.ceil(n / 20)} gazebos`,
        `Bins: ${Math.ceil(n / 25)} general and ${Math.ceil(n / 25)} recycling`,
      ],
    },
  };

  /* ---------- dates and times (wall clock, held in UTC fields) ---------- */
  const parseDate = (v) => {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v || "");
    if (!m) return null;
    const t = Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    return Number.isNaN(t) ? null : t;
  };
  const parseTime = (v) => {
    const m = /^(\d{1,2}):(\d{2})/.exec(v || "");
    return m ? Number(m[1]) * 60 + Number(m[2]) : null;
  };
  const at = (day, mins) => new Date(day + mins * 60000);
  const fmtDate = (d) => `${DAYS[d.getUTCDay()]} ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;
  const fmtTime = (d) => {
    const h = d.getUTCHours();
    return `${h % 12 || 12}:${String(d.getUTCMinutes()).padStart(2, "0")} ${h < 12 ? "am" : "pm"}`;
  };
  const firstSunday = (year, month) => {
    const first = new Date(Date.UTC(year, month, 1));
    return Date.UTC(year, month, 1 + ((7 - first.getUTCDay()) % 7));
  };
  // Daylight saving runs from the first Sunday in October to the first Sunday in April.
  const zoneFor = (state, day) => {
    const z = ZONES[state] || ZONES.VIC;
    const y = new Date(day).getUTCFullYear();
    const summer = day >= firstSunday(y, 9) || day < firstSunday(y, 3);
    return { abbr: summer ? z[1] : z[0], iana: z[2] };
  };

  /* ---------- form defaults per event (fields the person typed in are kept) ---------- */
  const FIELDS = ["group", "place", "date", "start", "people"];
  const applyDefaults = (type) => {
    const defs = EVENTS[type].defaults;
    FIELDS.forEach((key) => {
      const el = $("f-" + key);
      if (el.dataset.edited !== "1") el.value = defs[key];
    });
  };

  const row = (parts) => {
    const li = document.createElement("li");
    parts.forEach(([cls, text]) => {
      const span = document.createElement("span");
      if (cls) span.className = cls;
      span.textContent = text;
      li.append(span);
    });
    return li;
  };

  let current = null;
  const render = () => {
    const ev = EVENTS[$("f-type").value] || EVENTS.bee;
    const defs = ev.defaults;
    const day = parseDate($("f-date").value) ?? parseDate(defs.date);
    const start = parseTime($("f-start").value) ?? parseTime(defs.start);
    const raw = parseInt($("f-people").value, 10);
    const people = Number.isNaN(raw) ? Number(defs.people) : Math.min(5000, Math.max(1, raw));
    const state = $("f-state").value;
    const zone = zoneFor(state, day);
    const startAt = at(day, start);
    const endAt = at(day, start + ev.length);
    const f = {
      group: $("f-group").value.trim() || defs.group,
      place: $("f-place").value.trim() || defs.place,
      date: fmtDate(startAt),
      start: fmtTime(startAt),
      end: fmtTime(endAt),
      santa: fmtTime(at(day, start + 90)),
      rsvp: fmtDate(at(day, -5 * 1440)),
      tz: zone.abbr,
    };
    const invite = ev.invite(f);
    $("invite-text").textContent = invite;
    $("run-list").replaceChildren(...ev.run.map(([off, label]) => row([["t", fmtTime(at(day, start + off))], ["", label]])));
    $("run-note").textContent = `Times in ${zone.abbr}, ${state}, on ${f.date}.`;
    $("buy-list").replaceChildren(...ev.list(people).map((line) => row([["", line]])));
    $("buy-note").textContent = `Sized for ${people} ${people === 1 ? "person" : "people"}.`;
    $("wa-link").href = "https://wa.me/?text=" + encodeURIComponent(invite);
    current = { ev, f, invite, startAt, endAt, zone };
  };

  /* ---------- tabs, with arrow keys ---------- */
  const tabs = Array.from(document.querySelectorAll('[role="tab"]'));
  const selectTab = (tab) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      $(t.getAttribute("aria-controls")).hidden = !on;
    });
  };
  tabs.forEach((t, i) => {
    t.addEventListener("click", () => selectTab(t));
    t.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      e.preventDefault();
      const next = tabs[(i + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length];
      selectTab(next);
      next.focus();
    });
  });

  /* ---------- copy ---------- */
  let statusTimer;
  const say = (msg) => {
    $("copy-status").textContent = msg;
    clearTimeout(statusTimer);
    statusTimer = setTimeout(() => { $("copy-status").textContent = ""; }, 3000);
  };
  const selectInvite = () => {
    const range = document.createRange();
    range.selectNodeContents($("invite-text"));
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    say("Selected. Press Ctrl+C or ⌘C to copy.");
  };
  $("copy-btn").addEventListener("click", () => {
    if (!navigator.clipboard) { selectInvite(); return; }
    navigator.clipboard.writeText($("invite-text").textContent).then(() => say("Invite copied."), selectInvite);
  });

  /* ---------- calendar file (.ics) ---------- */
  const pad = (n) => String(n).padStart(2, "0");
  const icsWall = (d) => `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00`;
  const icsNow = () => new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  const icsText = (s) => String(s).replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
  const fold = (line) => {
    const out = [];
    let s = line;
    while (s.length > 73) { out.push(s.slice(0, 73)); s = " " + s.slice(73); }
    out.push(s);
    return out.join("\r\n");
  };
  $("ics-btn").addEventListener("click", () => {
    if (!current) return;
    const { ev, f, invite, startAt, endAt, zone } = current;
    const uid = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}@evendraft-au`;
    const lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Evendraft AU//Event drafts//EN",
      "CALSCALE:GREGORIAN",
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTAMP:${icsNow()}`,
      `DTSTART;TZID=${zone.iana}:${icsWall(startAt)}`,
      `DTEND;TZID=${zone.iana}:${icsWall(endAt)}`,
      `SUMMARY:${icsText(ev.name)}`,
      `LOCATION:${icsText(f.place)}`,
      `DESCRIPTION:${icsText(invite)}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ];
    const blob = new Blob([lines.map(fold).join("\r\n") + "\r\n"], { type: "text/calendar;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${ev.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${startAt.toISOString().slice(0, 10)}.ics`;
    document.body.append(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
    say("Calendar file downloaded. Open it to add the event.");
  });

  /* ---------- wiring ---------- */
  const form = $("draft-form");
  form.addEventListener("submit", (e) => e.preventDefault());
  FIELDS.forEach((key) => $("f-" + key).addEventListener("input", (e) => { e.target.dataset.edited = "1"; }));
  $("f-type").addEventListener("change", () => applyDefaults($("f-type").value));
  form.addEventListener("input", render);
  form.addEventListener("change", render);

  applyDefaults("bee");
  render();
})();
