/* Evendraft AU: site.js. No trackers, no libraries.
   1. The header takes the colour of the chapter beneath it
   2. Entrances: each part rises once as its section arrives
   3. Live clocks: Canberra and Bengaluru, and the days left on the example tender
   4. The closing-time line: type a closing time, see it on every Australian clock, with a back-plan
   5. How it works: the accordion of stages
   6. Every line has a source: the reader panel follows the line you point at or scroll past
   7. The film: paused off screen and under reduced motion */
window.EVD_READY = true;

(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* ---------- 1. header colour by chapter ---------- */
  const top = $(".top");
  const chapters = $$("[data-chapter]");
  if (top && chapters.length && "IntersectionObserver" in window) {
    const tones = ["f-stone", "f-paper", "f-amber", "f-green", "f-dark"];
    const setTone = (tone) => {
      if (top.dataset.tone === tone) return;
      tones.forEach((t) => top.classList.remove(t));
      top.classList.add("f-" + tone);
      top.dataset.tone = tone;
    };
    const headerH = () => top.getBoundingClientRect().height || 56;
    let io;
    const watch = () => {
      if (io) io.disconnect();
      const h = Math.round(headerH());
      // A one-pixel line just under the header: whichever chapter crosses it sets the colour.
      io = new IntersectionObserver((entries) => {
        entries.forEach((e) => { if (e.isIntersecting) setTone(e.target.dataset.chapter); });
      }, { rootMargin: `-${h}px 0px -${Math.max(0, innerHeight - h - 1)}px 0px` });
      chapters.forEach((c) => io.observe(c));
    };
    watch();
    let rt;
    addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(watch, 200); });
  }

  /* ---------- 2. entrances ---------- */
  const risers = $$("[data-rise]");
  if (risers.length) {
    if (reduce.matches || !("IntersectionObserver" in window)) {
      risers.forEach((el) => el.classList.add("is-in"));
    } else {
      const rio = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.classList.add("is-in");
          rio.unobserve(e.target);
        });
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
      risers.forEach((el) => rio.observe(el));
      // Anything already on screen at load starts at once.
      requestAnimationFrame(() => {
        risers.forEach((el) => {
          const r = el.getBoundingClientRect();
          if (r.top < innerHeight && r.bottom > 0) { el.classList.add("is-in"); rio.unobserve(el); }
        });
      });
    }
  }

  /* ---------- time helpers (time zones through Intl) ---------- */
  const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const partsCache = new Map();
  const fmtParts = (tz) => {
    if (!partsCache.has(tz)) {
      partsCache.set(tz, new Intl.DateTimeFormat("en-US", {
        timeZone: tz, hourCycle: "h23", year: "numeric", month: "numeric", day: "numeric",
        hour: "numeric", minute: "numeric", second: "numeric", weekday: "short",
      }));
    }
    return partsCache.get(tz);
  };
  // The wall clock in a zone: { y, mo (0-11), d, h, mi, s, wd (0-6) }.
  const wall = (date, tz) => {
    const o = {};
    fmtParts(tz).formatToParts(date).forEach((p) => { o[p.type] = p.value; });
    return {
      y: Number(o.year), mo: Number(o.month) - 1, d: Number(o.day),
      h: Number(o.hour) % 24, mi: Number(o.minute), s: Number(o.second),
      wd: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(o.weekday),
    };
  };
  const offsetMin = (ts, tz) => {
    const w = wall(new Date(ts), tz);
    return Math.round((Date.UTC(w.y, w.mo, w.d, w.h, w.mi, w.s) - Math.floor(ts / 1000) * 1000) / 60000);
  };
  // A wall-clock time in a zone, as an instant.
  const zoned = (y, mo, d, h, mi, tz) => {
    const target = Date.UTC(y, mo, d, h, mi);
    let ts = target;
    for (let i = 0; i < 3; i++) {
      const next = target - offsetMin(ts, tz) * 60000;
      if (next === ts) break;
      ts = next;
    }
    return new Date(ts);
  };
  const zoneName = (date, tz) => {
    try {
      const p = new Intl.DateTimeFormat("en-AU", { timeZone: tz, timeZoneName: "short" }).formatToParts(date);
      const n = (p.find((x) => x.type === "timeZoneName") || {}).value || "";
      return /^[A-Z]{3,5}$/.test(n) ? n : n.replace("GMT", "UTC");
    } catch (e) { return ""; }
  };
  const clock = (w) => `${w.h % 12 || 12}:${String(w.mi).padStart(2, "0")} ${w.h < 12 ? "am" : "pm"}`;
  const dayLabel = (w) => `${DAYS[w.wd]} ${w.d} ${MONTHS[w.mo]}`;
  const CANBERRA = "Australia/Sydney"; // the ACT keeps Sydney's clock

  /* ---------- 3. live clocks and the example's countdown ---------- */
  const EXAMPLE_CLOSE = zoned(2026, 11, 3, 14, 0, CANBERRA);
  const tick = () => {
    const now = new Date();
    $$("[data-clock]").forEach((el) => {
      const w = wall(now, el.dataset.clock);
      const small = el.querySelector("small");
      el.firstChild.nodeValue = `${w.h % 12 || 12}:${String(w.mi).padStart(2, "0")}`;
      if (small) small.textContent = w.h < 12 ? "am" : "pm";
    });
    $$("[data-clock-inline]").forEach((el) => { el.textContent = clock(wall(now, el.dataset.clockInline)); });
    $$("[data-zone]").forEach((el) => { el.textContent = zoneName(now, el.dataset.zone) || el.textContent; });
    const days = $("[data-days-left]");
    if (days) {
      const left = EXAMPLE_CLOSE - now;
      const note = $("[data-days-note]");
      if (left > 0) {
        const n = Math.floor(left / 86400000);
        days.firstChild.nodeValue = n >= 1 ? String(n) : String(Math.max(1, Math.ceil(left / 3600000)));
        days.querySelector("small").textContent = n >= 1 ? (n === 1 ? "day" : "days") : "hrs";
      } else {
        days.firstChild.nodeValue = "0";
        days.querySelector("small").textContent = "days";
        if (note) note.textContent = "The example tender closed on Thu 3 Dec at 2:00 pm ACT local time.";
      }
    }
  };
  if ($("[data-clock], [data-clock-inline], [data-days-left]")) {
    tick();
    setInterval(tick, 15000);
  }

  /* ---------- 4. the closing-time line ---------- */
  const input = $("#close-at");
  if (input) {
    const out = (k) => $(`[data-out="${k}"]`);
    const CITIES = [
      ["Sydney", "Australia/Sydney"], ["Melbourne", "Australia/Melbourne"], ["Hobart", "Australia/Hobart"],
      ["Adelaide", "Australia/Adelaide"], ["Brisbane", "Australia/Brisbane"], ["Darwin", "Australia/Darwin"],
      ["Perth", "Australia/Perth"], ["Bengaluru, our desk", "Asia/Kolkata", true],
    ];
    const MONTH_RE = "(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\\.?";
    const WD = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
    const monthIndex = (s) => ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"].indexOf(s.slice(0, 3));

    // Reads closing times the way people and portals write them: "2:00 pm Thu 3 Dec", "3-Dec-2026 2:00 pm",
    // "12 noon Friday", "5pm 18/12", "2 pm tomorrow". Times are Canberra's.
    const parse = (raw) => {
      const s = ` ${raw.toLowerCase().replace(/[,]/g, " ").replace(/\s+/g, " ")} `;
      const now = wall(new Date(), CANBERRA);
      let h = null, mi = 0, timeGiven = true;
      let m;
      if (/\b(noon|midday)\b/.test(s)) { h = 12; mi = 0; }
      else if (/\bmidnight\b/.test(s)) { h = 23; mi = 59; }
      else if ((m = /\b(\d{1,2})(?:[:.](\d{2}))?\s*(a\.?m\.?|p\.?m\.?)(?=\s|$)/.exec(s))) {
        h = Number(m[1]) % 12 + (m[3][0] === "p" ? 12 : 0); mi = Number(m[2] || 0);
      } else if ((m = /\b([01]?\d|2[0-3])[:.]([0-5]\d)\b(?!\s*\/)/.exec(s))) {
        h = Number(m[1]); mi = Number(m[2]);
      }
      if (h === null) { h = 14; mi = 0; timeGiven = false; }
      if (h > 23 || mi > 59) return null;

      let y = null, mo = null, d = null, relDays = null, weekday = null;
      const yr = /\b(20\d{2})\b/.exec(s);
      if ((m = new RegExp(`\\b(\\d{1,2})(?:st|nd|rd|th)?[\\s\\-/]*${MONTH_RE}`).exec(s))) { d = Number(m[1]); mo = monthIndex(m[2]); }
      else if ((m = new RegExp(`\\b${MONTH_RE}\\s+(\\d{1,2})(?:st|nd|rd|th)?\\b`).exec(s))) { mo = monthIndex(m[1]); d = Number(m[2]); }
      else if ((m = /\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/.exec(s))) {
        d = Number(m[1]); mo = Number(m[2]) - 1;
        if (m[3]) y = Number(m[3].length === 2 ? "20" + m[3] : m[3]);
      }
      if (yr) y = Number(yr[1]);
      if (/\btoday\b/.test(s)) relDays = 0;
      else if (/\btomorrow\b/.test(s)) relDays = 1;
      if (d === null && relDays === null) {
        const wm = /\b(sun|mon|tue|wed|thu|fri|sat)[a-z]*\b/.exec(s);
        if (wm) weekday = WD.indexOf(wm[1]);
      }

      if (d !== null && mo !== null) {
        if (mo < 0 || mo > 11 || d < 1 || d > 31) return null;
        if (y === null) {
          y = now.y;
          // A date more than two days behind today means next year's.
          if (Date.UTC(y, mo, d) < Date.UTC(now.y, now.mo, now.d) - 2 * 86400000) y += 1;
        }
      } else if (relDays !== null) {
        const t = new Date(Date.UTC(now.y, now.mo, now.d + relDays));
        y = t.getUTCFullYear(); mo = t.getUTCMonth(); d = t.getUTCDate();
      } else if (weekday !== null) {
        let add = (weekday - now.wd + 7) % 7;
        if (add === 0 && (h < now.h || (h === now.h && mi <= now.mi))) add = 7;
        const t = new Date(Date.UTC(now.y, now.mo, now.d + add));
        y = t.getUTCFullYear(); mo = t.getUTCMonth(); d = t.getUTCDate();
      } else {
        const later = h > now.h || (h === now.h && mi > now.mi);
        const t = new Date(Date.UTC(now.y, now.mo, now.d + (later ? 0 : 1)));
        y = t.getUTCFullYear(); mo = t.getUTCMonth(); d = t.getUTCDate();
      }
      const check = new Date(Date.UTC(y, mo, d));
      if (check.getUTCMonth() !== mo) return null;
      return { at: zoned(y, mo, d, h, mi, CANBERRA), timeGiven };
    };

    const span = (cls, text) => { const e = document.createElement("span"); e.className = cls; e.textContent = text; return e; };
    const howLong = (ms) => {
      const abs = Math.abs(ms);
      const days = Math.floor(abs / 86400000);
      const hours = Math.floor((abs % 86400000) / 3600000);
      const mins = Math.floor((abs % 3600000) / 60000);
      let t;
      if (days >= 2) t = `${days} days${hours ? `, ${hours} hours` : ""}`;
      else if (days === 1) t = `1 day${hours ? `, ${hours} hours` : ""}`;
      else if (hours >= 1) t = `${hours} hour${hours === 1 ? "" : "s"}${mins ? `, ${mins} min` : ""}`;
      else t = `${mins} minute${mins === 1 ? "" : "s"}`;
      return ms >= 0 ? `${t} from now.` : `Closed ${t} ago.`;
    };

    const render = () => {
      const res = parse(input.value);
      if (!res) {
        out("left").textContent = "Try a time and a date, like 2:00 pm Thu 3 Dec.";
        return;
      }
      const at = res.at;
      const now = new Date();
      const cw = wall(at, CANBERRA);
      out("canberra").textContent = `${clock(cw)} ${dayLabel(cw)}, ${zoneName(at, CANBERRA)}`;
      out("left").textContent = howLong(at - now) + (res.timeGiven ? "" : " No time given, so 2:00 pm is assumed.");
      out("cities").replaceChildren(...CITIES.map(([name, tz, desk]) => {
        const w = wall(at, tz);
        const li = document.createElement("li");
        li.className = desk ? "city is-desk" : "city";
        li.append(span("city__name", name), span("city__time", clock(w)), span("city__day", dayLabel(w)));
        return li;
      }));
      const day = 86400000;
      const steps = [
        [new Date(at - 13 * day), false, "Decide with the memo in hand: bid, or let it go"],
        [new Date(at - 7 * day), false, "Questions to the buyer; check the ATM for its own cut-off"],
        [new Date(at - 3 * day), false, "Full draft to you, with every claim marked for approval"],
        [new Date(at - 1 * day), false, "Declarations signed, insurance letter and pricing ready"],
        [new Date(at - 2 * 3600000), true, "Lodge two hours early; late bids are generally refused"],
      ];
      out("plan").replaceChildren(...steps.map(([when, withTime, what]) => {
        const w = wall(when, CANBERRA);
        const li = document.createElement("li");
        const label = withTime ? `${dayLabel(w)}, ${clock(w)}` : dayLabel(w);
        li.append(span("", when < now ? `${label} (passed)` : label), span("", what));
        return li;
      }));
    };
    let rt;
    input.addEventListener("input", () => { clearTimeout(rt); rt = setTimeout(render, 120); });
    input.closest("h2").addEventListener("click", (e) => { if (e.target !== input) input.focus(); });
    $$("[data-try]").forEach((b) => b.addEventListener("click", () => {
      input.value = b.dataset.try;
      render();
      input.focus();
      input.setSelectionRange(input.value.length, input.value.length);
    }));
    render();
  }

  /* ---------- 5. how it works: the stages ---------- */
  const stages = $("[data-stages]");
  if (stages) {
    const items = $$(".stage", stages);
    const open = (stage) => {
      items.forEach((s) => {
        const on = s === stage;
        s.classList.toggle("is-open", on);
        $(".stage__tab", s).setAttribute("aria-expanded", String(on));
      });
    };
    items.forEach((s) => $(".stage__tab", s).addEventListener("click", () => open(s)));
  }

  /* ---------- 6. every line has a source ---------- */
  const lines = $$(".line[data-src]");
  if (lines.length) {
    const quote = $("[data-reader-quote]");
    const doc = $("[data-reader-doc]");
    const ref = $("[data-reader-ref]");
    const count = $("[data-reader-count]");
    const docs = $$("[data-doc]");
    const NAMES = {
      CoT: "Conditions of Tender", SoR: "Statement of Requirement", DC: "Draft Contract", PS: "Pricing Schedule",
      DoC: "Deed of Confidentiality", "Add 1": "Addendum 1", "RS A": "Response Schedule A", "RS B": "Response Schedule B",
      "RS C": "Response Schedule C", "RS D": "Response Schedule D", "RS E": "Response Schedule E",
    };
    const read = new Set();
    let current = null;
    const show = (line) => {
      if (!line || line === current) return;
      current = line;
      lines.forEach((l) => l.classList.toggle("is-read", l === line));
      read.add(line);
      quote.textContent = line.dataset.quote;
      doc.textContent = NAMES[line.dataset.src] || line.dataset.src;
      ref.textContent = line.dataset.ref;
      docs.forEach((d) => d.classList.toggle("is-on", d.dataset.doc === line.dataset.src));
      count.textContent = `${read.size} of ${lines.length} cited lines read`;
    };
    lines.forEach((l) => {
      l.addEventListener("mouseenter", () => show(l));
      l.addEventListener("focus", () => show(l));
      l.addEventListener("click", () => show(l));
    });
    // On wide screens the panel follows the line passing the middle of the screen.
    const wide = matchMedia("(min-width: 1081px)");
    if ("IntersectionObserver" in window) {
      const lio = new IntersectionObserver((entries) => {
        if (!wide.matches) return;
        entries.forEach((e) => { if (e.isIntersecting) show(e.target); });
      }, { rootMargin: "-48% 0px -48% 0px" });
      lines.forEach((l) => lio.observe(l));
    }
  }

  /* ---------- 7. the film ---------- */
  const film = $("[data-film]");
  if (film) {
    const sync = () => { if (reduce.matches) { film.pause(); film.removeAttribute("autoplay"); } };
    sync();
    reduce.addEventListener?.("change", sync);
    if ("IntersectionObserver" in window) {
      new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (reduce.matches) return;
          if (e.isIntersecting) { const p = film.play(); if (p && p.catch) p.catch(() => {}); }
          else film.pause();
        });
      }).observe(film);
    }
  }
})();
