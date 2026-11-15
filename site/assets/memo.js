/* Evendraft AU: the free-memo form.
   Posts to the Evendraft CRM web app (ops/crm/Code.gs doPost in the Evendraft repo), which writes a row to the
   "Website requests" tab and alerts the owner. Same fields as the UK site; the message starts with [Evendraft AU]
   so Australian requests stand out. The web app answers with a redirect the page can't read (no-cors), so only a
   network failure or the 15-second timeout counts as "not sent". */
(() => {
  const ENDPOINT = "https://script.google.com/macros/s/AKfycbwwciBbpLG4CifyLpfpGeUEzqxINCwrtjVKvsLA6YWdw-IRokHhfwfi7HKMLlEZ_Bbq/exec";
  const form = document.getElementById("memo-form");
  if (!form || typeof fetch !== "function") return;
  const status = document.getElementById("m-status");
  const button = document.getElementById("m-send");
  const val = (name) => (form.elements[name] ? String(form.elements[name].value || "").trim() : "");
  const say = (msg, good) => {
    status.textContent = msg;
    status.classList.toggle("good", Boolean(good));
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = form.elements.email;
    const url = form.elements.tender_url;
    if (!val("tender_url") && !val("tender_title")) {
      say("Add the link to the tender, or its name.");
      url.focus();
      return;
    }
    if (val("tender_url") && !url.checkValidity()) {
      say("That link doesn't look complete. It should start with https://");
      url.focus();
      return;
    }
    if (!val("email") || !email.checkValidity()) {
      say("Add your work email so we can reply.");
      email.focus();
      return;
    }

    const body = new URLSearchParams();
    const put = (k, v) => { if (v) body.append(k, v); };
    put("type", "memo");
    put("tender_url", val("tender_url"));
    put("tender_title", val("tender_title"));
    put("company", val("company"));
    put("name", val("name"));
    put("email", val("email"));
    put("message", ("[Evendraft AU] " + val("message")).trim());
    put("page", location.href);
    put("sent_at", new Date().toISOString());
    put("website", val("evd_extra"));

    button.disabled = true;
    say("Sending…");
    const ctrl = typeof AbortController === "function" ? new AbortController() : null;
    const timer = ctrl ? setTimeout(() => ctrl.abort(), 15000) : null;
    try {
      await fetch(ENDPOINT, { method: "POST", mode: "no-cors", body, signal: ctrl ? ctrl.signal : undefined });
      form.reset();
      say("Received. You'll get a reply by email.", true);
    } catch (err) {
      say("That didn't go through. Check your connection and press the button again.");
    } finally {
      if (timer) clearTimeout(timer);
      button.disabled = false;
    }
  });
})();
