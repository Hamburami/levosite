const $ = (id) => document.getElementById(id);

let editingEventId = null;

function yyyyMmDdToInt(dateStr) {
  // dateStr: "YYYY-MM-DD"
  if (!dateStr || typeof dateStr !== "string") return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if (!m) return null;
  return Number(`${m[1]}${m[2]}${m[3]}`);
}

function localDateTimeToUtcEpochSeconds(dateStr, timeStr) {
  // dateStr: "YYYY-MM-DD", timeStr: "HH:MM"
  if (!dateStr || !timeStr) return null;
  const d = new Date(`${dateStr}T${timeStr}`);
  if (Number.isNaN(d.getTime())) return null;
  return Math.floor(d.getTime() / 1000);
}

function cleanOptionalString(v) {
  if (typeof v !== "string") return null;
  const s = v.trim();
  return s ? s : null;
}

function setOutput(objOrText) {
  const out = $("output");
  if (typeof objOrText === "string") {
    out.textContent = objOrText;
  } else {
    out.textContent = JSON.stringify(objOrText, null, 2);
  }
}

function setPreviewOutput(objOrText) {
  const out = $("previewOutput");
  if (!out) return;
  if (typeof objOrText === "string") out.textContent = objOrText;
  else out.textContent = JSON.stringify(objOrText, null, 2);
}

function setLoginOutput(objOrText) {
  const out = $("loginOutput");
  if (!out) return;
  if (typeof objOrText === "string") out.textContent = objOrText;
  else out.textContent = JSON.stringify(objOrText, null, 2);
}

function getApiBase() {
  const el = $("apiBase");
  const configured = (el?.value || "").trim();

  // If you're viewing this page on the live site, use same-origin "/api".
  // If you're viewing it locally (e.g. Live Server on 127.0.0.1), default to the live API.
  const fallback = (location.hostname === "onthe.band") ? "/api" : "https://onthe.band/api";

  const base = (configured || fallback).trim();
  return base.endsWith("/") ? base.slice(0, -1) : base;
}

function getPassphrase() {
  const t = ($("token").value || "").trim();
  return t || null;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function utcTodayYYYYMMDD() {
  const d = new Date();
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return Number(`${y}${m}${day}`);
}

function yyyymmddToParts(n) {
  if (typeof n !== "number" || !Number.isInteger(n)) return null;
  const s = String(n).padStart(8, "0");
  const yyyy = Number(s.slice(0, 4));
  const mm = Number(s.slice(4, 6));
  const dd = Number(s.slice(6, 8));
  if (!yyyy || mm < 1 || mm > 12 || dd < 1 || dd > 31) return null;
  return { yyyy, mm, dd };
}

function toIsoDate(parts) {
  const m = String(parts.mm).padStart(2, "0");
  const d = String(parts.dd).padStart(2, "0");
  return `${parts.yyyy}-${m}-${d}`;
}

function formatTimeLocal(epochSeconds) {
  if (epochSeconds === null || epochSeconds === undefined) return null;
  if (!Number.isInteger(epochSeconds)) return null;
  const d = new Date(epochSeconds * 1000);
  if (Number.isNaN(d.getTime())) return null;
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12;
  if (hours === 0) hours = 12;
  return `${hours}:${minutes}${ampm}`;
}

function epochSecondsToLocalTimeInput(epochSeconds) {
  if (epochSeconds === null || epochSeconds === undefined) return "";
  if (!Number.isInteger(epochSeconds)) return "";
  const d = new Date(epochSeconds * 1000);
  if (Number.isNaN(d.getTime())) return "";
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

function makeEl(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text !== undefined && text !== null) el.textContent = text;
  return el;
}

function renderPreviewEventRow(ev, { isPast }) {
  // Match public event markup (li.otd-event > a > [time-info + main-info]) and add admin controls beside it.
  const li = makeEl("li", `otd-event butt-event-row${isPast ? " butt-event-row--past" : ""}`);

  const a = makeEl("a");
  if (ev.link_url) {
    a.setAttribute("href", ev.link_url);
    a.setAttribute("target", "_blank");
    a.setAttribute("rel", "noopener noreferrer");
  }

  const timeInfo = makeEl("div", "otd-event__time-info");
  const parts = yyyymmddToParts(ev.event_date);
  const monthText = parts ? MONTHS[parts.mm - 1] : "";
  const dayText = parts ? String(parts.dd) : "";
  const time = makeEl("time", "otd-event__date");
  if (parts) time.setAttribute("datetime", toIsoDate(parts));
  time.appendChild(makeEl("span", "otd-event__date--month", monthText));
  time.appendChild(document.createTextNode(" "));
  time.appendChild(makeEl("span", "otd-event__date--day", dayText));

  const startText = formatTimeLocal(ev.start_time_utc);
  const endText = formatTimeLocal(ev.end_time_utc);
  const doorsText = (startText && endText) ? `${startText} - ${endText}` : (startText ? `${startText}` : "time tba");
  timeInfo.appendChild(time);
  timeInfo.appendChild(makeEl("p", "otd-event__doors", doorsText));

  const mainInfo = makeEl("div", "otd-event__main-info");
  mainInfo.appendChild(makeEl("h3", "otd-event__title", ev.event_title || ""));
  if (ev.event_lineup) mainInfo.appendChild(makeEl("h4", "otd-event__lineup", ev.event_lineup));
  if (ev.event_description) mainInfo.appendChild(makeEl("p", "otd-event__description", ev.event_description));
  // Display address (location) with additional info afterwards when both exist.
  // Previously, additional "won" and location disappeared.
  const loc = (typeof ev.event_location === "string" && ev.event_location.trim())
    ? ev.event_location.trim()
    : "";
  const add = (typeof ev.event_additional === "string" && ev.event_additional.trim())
    ? ev.event_additional.trim()
    : "";
  const metaText = (loc && add) ? `${loc} · ${add}` : (loc || add);
  if (metaText) {
    mainInfo.appendChild(makeEl("p", "otd-event__additional", metaText));
  }

  a.appendChild(timeInfo);
  a.appendChild(mainInfo);

  const controls = makeEl("div", "butt-controls");

  const btnEdit = makeEl("button", "rect-button butt-edit", "Edit");
  btnEdit.type = "button";
  btnEdit.addEventListener("click", () => {
    startEdit(ev);
  });

  const btnDelete = makeEl("button", "rect-button butt-delete", "Delete");
  btnDelete.type = "button";
  btnDelete.addEventListener("click", async () => {
    if (!confirm(`Delete "${ev.event_title}"?`)) return;
    setOutput(`Deleting ${ev.event_id}...`);
    const del = await apiFetch(`/butt/events/${ev.event_id}`, { method: "DELETE" });
    setOutput(del);
    await refreshEvents();
  });

  li.appendChild(a);
  controls.appendChild(btnEdit);
  controls.appendChild(btnDelete);
  li.appendChild(controls);
  return li;
}

function getFormPrefixForPreview() {
  return editingEventId ? "edit_" : "";
}

function buildPayload(prefix = "") {
  const link_url = cleanOptionalString($(prefix + "link_url")?.value || "");
  const event_title = (($(prefix + "event_title")?.value || "") + "").trim();
  const dateStr = $(prefix + "event_date")?.value || "";
  const event_date = yyyyMmDdToInt(dateStr);

  const start_local = (($(prefix + "start_local")?.value || "") + "").trim();
  const end_local = (($(prefix + "end_local")?.value || "") + "").trim();

  const start_time_utc = start_local ? localDateTimeToUtcEpochSeconds(dateStr, start_local) : null;
  const end_time_utc = end_local ? localDateTimeToUtcEpochSeconds(dateStr, end_local) : null;

  const payload = {
    link_url,
    event_title,
    event_date,
    start_time_utc,
    end_time_utc,
    event_location: cleanOptionalString($(prefix + "event_location")?.value || ""),
    event_lineup: cleanOptionalString($(prefix + "event_lineup")?.value || ""),
    event_description: cleanOptionalString($(prefix + "event_description")?.value || ""),
    event_additional: cleanOptionalString($(prefix + "event_additional")?.value || ""),
  };

  return payload;
}

function validatePayload(payload) {
  if (!payload.event_title) return "Title is required.";
  if (!Number.isInteger(payload.event_date)) return "Date is required.";

  if (payload.start_time_utc !== null && !Number.isInteger(payload.start_time_utc)) {
    return "Start time failed to convert to UTC epoch seconds.";
  }
  if (payload.end_time_utc !== null && !Number.isInteger(payload.end_time_utc)) {
    return "End time failed to convert to UTC epoch seconds.";
  }
  if (
    payload.start_time_utc !== null &&
    payload.end_time_utc !== null &&
    payload.end_time_utc < payload.start_time_utc
  ) {
    return "End time must be after start time.";
  }
  return null;
}

async function apiFetch(path, options = {}) {
  const base = getApiBase();
  const url = `${base}${path}`;

  const headers = new Headers(options.headers || {});
  headers.set("Accept", "application/json");
  if (options.body) headers.set("Content-Type", "application/json");

  // Always include cookies for the butt admin session.
  const res = await fetch(url, { ...options, headers, credentials: "include" });
  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const body = isJson ? await res.json() : await res.text();
  return { ok: res.ok, status: res.status, headers: Object.fromEntries(res.headers.entries()), body };
}

function loadToken() {
  // No token storage anymore; cookie session handles it.
}

function saveToken() {
  // No-op; cookie session handles it.
}

async function testApi() {
  saveToken();
  setOutput("Testing /api/test ...");
  try {
    const r = await apiFetch("/test", { method: "GET" });
    setOutput(r);
  } catch (e) {
    setOutput({ ok: false, error: e?.message || String(e) });
  }
}

function setLoggedIn(isLoggedIn) {
  const loginCard = $("loginCard");
  const portalCard = $("portalCard");
  if (!loginCard || !portalCard) return;
  loginCard.classList.toggle("is-hidden", isLoggedIn);
  portalCard.classList.toggle("is-hidden", !isLoggedIn);
}

async function login() {
  setLoginOutput("Logging in...");
  try {
    const passphrase = getPassphrase();
    if (!passphrase) return setLoginOutput("Passphrase required");

    const r = await apiFetch("/butt/login", { method: "POST", body: JSON.stringify({ passphrase }) });
    if (!r.ok) {
      setLoggedIn(false);
      if (r.status === 401) return setLoginOutput("Incorrect passphrase");
      return setLoginOutput("Login failed");
    }
    setLoggedIn(true);
    setLoginOutput("");
    await refreshEvents();
  } catch (e) {
    setLoggedIn(false);
    setLoginOutput("Login failed");
  }
}

function logout() {
  $("token").value = "";
  setLoggedIn(false);
  setLoginOutput("Logged out.");
  apiFetch("/butt/logout", { method: "POST", body: "{}" }).catch(() => {});
}

function formatEventRow(e) {
  const start = e.start_time_utc ? ` start:${e.start_time_utc}` : "";
  const end = e.end_time_utc ? ` end:${e.end_time_utc}` : "";
  const loc = e.event_location ? ` · ${e.event_location}` : "";
  const add = e.event_additional ? ` · ${e.event_additional}` : "";
  const link = e.link_url ? ` · ${e.link_url}` : "";
  return `${e.event_id} · ${e.event_date} · ${e.event_title}${loc}${add}${link}${start}${end}`;
}

async function refreshEvents() {
  setOutput("Loading events...");
  try {
    const r = await apiFetch("/butt/events?limit=500", { method: "GET" });
    if (!r.ok) {
      setOutput(r);
      const curStatus = $("currentEventsStatus");
      const pastStatus = $("pastEventsStatus");
      if (curStatus) curStatus.textContent = "Failed to load events";
      if (pastStatus) pastStatus.textContent = "";
      return;
    }
    const events = Array.isArray(r.body?.events) ? r.body.events : [];

    const today = utcTodayYYYYMMDD();
    const current = events.filter((e) => Number.isInteger(e.event_date) && e.event_date >= today);
    const past = events.filter((e) => Number.isInteger(e.event_date) && e.event_date < today);

    const currentList = $("currentEventsList");
    const pastList = $("pastEventsList");
    const curStatus = $("currentEventsStatus");
    const pastStatus = $("pastEventsStatus");

    const clearList = (list) => {
      if (!list) return;
      list.querySelectorAll("li.otd-event").forEach((n) => n.remove());
    };

    clearList(currentList);
    clearList(pastList);

    if (curStatus) {
      curStatus.textContent = current.length ? "" : "No current events";
      curStatus.style.display = current.length ? "none" : "";
    }
    if (pastStatus) {
      pastStatus.textContent = past.length ? "" : "No past events";
      pastStatus.style.display = past.length ? "none" : "";
    }

    if (currentList && current.length) {
      const frag = document.createDocumentFragment();
      for (const ev of current) frag.appendChild(renderPreviewEventRow(ev, { isPast: false }));
      currentList.appendChild(frag);
    }

    if (pastList && past.length) {
      const frag = document.createDocumentFragment();
      for (const ev of past) frag.appendChild(renderPreviewEventRow(ev, { isPast: true }));
      pastList.appendChild(frag);
    }

    setOutput({ ok: true, total: events.length, current: current.length, past: past.length });
  } catch (e) {
    setOutput({ ok: false, error: e?.message || String(e) });
  }
}

async function previewJson() {
  const payload = buildPayload(getFormPrefixForPreview());
  const err = validatePayload(payload);
  if (err) return setPreviewOutput(err);
  setPreviewOutput(payload);
}

async function submitEvent() {
  const payload = buildPayload("");
  const err = validatePayload(payload);
  if (err) return setOutput(err);

  setOutput("Creating event...");
  try {
    const r = await apiFetch("/butt/events", { method: "POST", body: JSON.stringify(payload) });
    setOutput(r);
    if (r.ok) {
      clearAddForm({ keepDate: true });
      if ($("jsonFooter")?.open) previewJson();
      await refreshEvents();
      scrollToEvents();
    }
  } catch (e) {
    setOutput({ ok: false, error: e?.message || String(e) });
  }
}

function setEditMode(isEditing) {
  const add = $("addEventSection");
  const edit = $("editEventSection");
  if (add) add.classList.toggle("is-hidden", isEditing);
  if (edit) edit.classList.toggle("is-hidden", !isEditing);
}

function clearAddForm({ keepDate } = { keepDate: true }) {
  const ids = [
    "event_title",
    "event_date",
    "link_url",
    "event_location",
    "event_lineup",
    "start_local",
    "end_local",
    "event_description",
    "event_additional",
  ];
  for (const id of ids) {
    const el = $(id);
    if (!el) continue;
    if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) el.value = "";
  }

  if (keepDate && $("event_date")) {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    $("event_date").value = `${yyyy}-${mm}-${dd}`;
  }
}

function scrollToEvents() {
  const target = $("currentEventsList") || $("btnRefresh") || $("portalCard");
  if (!target) return;
  target.scrollIntoView({ behavior: "smooth", block: "start" });
}

function clearEditForm() {
  const ids = [
    "edit_event_title",
    "edit_event_date",
    "edit_link_url",
    "edit_event_location",
    "edit_event_lineup",
    "edit_start_local",
    "edit_end_local",
    "edit_event_description",
    "edit_event_additional",
  ];
  for (const id of ids) {
    const el = $(id);
    if (!el) continue;
    if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) el.value = "";
  }
}

function startEdit(ev) {
  const eventId = ev?.event_id;
  if (!Number.isInteger(eventId)) {
    setOutput("Edit failed: event_id missing.");
    return;
  }

  editingEventId = eventId;

  const parts = yyyymmddToParts(ev.event_date);
  const isoDate = parts ? toIsoDate(parts) : "";

  if ($("editEventMeta")) {
    $("editEventMeta").textContent = `Editing event #${eventId}`;
  }

  $("edit_event_title").value = ev.event_title || "";
  $("edit_event_date").value = isoDate;
  $("edit_link_url").value = ev.link_url || "";
  $("edit_event_location").value = ev.event_location || "";
  $("edit_event_lineup").value = ev.event_lineup || "";
  $("edit_start_local").value = epochSecondsToLocalTimeInput(ev.start_time_utc);
  $("edit_end_local").value = epochSecondsToLocalTimeInput(ev.end_time_utc);
  $("edit_event_description").value = ev.event_description || "";
  $("edit_event_additional").value = ev.event_additional || "";

  setEditMode(true);
  setOutput(`Editing ${eventId}...`);
  if ($("jsonFooter")?.open) previewJson();
}

function cancelEdit() {
  editingEventId = null;
  clearEditForm();
  setEditMode(false);
  setOutput("Edit cancelled.");
  if ($("jsonFooter")?.open) previewJson();
}

async function updateEvent() {
  if (!Number.isInteger(editingEventId)) return setOutput("No event selected for editing.");

  const payload = buildPayload("edit_");
  const err = validatePayload(payload);
  if (err) return setOutput(err);

  setOutput(`Updating event ${editingEventId}...`);
  try {
    const r = await apiFetch(`/butt/events/${editingEventId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    setOutput(r);
    if (r.ok) {
      editingEventId = null;
      clearEditForm();
      setEditMode(false);
      await refreshEvents();
    }
  } catch (e) {
    setOutput({ ok: false, error: e?.message || String(e) });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadToken();

  // Ensure the hidden apiBase is set sensibly depending on where this page is hosted.
  if ($("apiBase") && !$("apiBase").value) {
    $("apiBase").value = (location.hostname === "onthe.band") ? "/api" : "https://onthe.band/api";
  }

  // Login flow
  if ($("btnLogin")) $("btnLogin").addEventListener("click", login);
  if ($("btnLogout")) $("btnLogout").addEventListener("click", logout);
  if ($("btnRefresh")) $("btnRefresh").addEventListener("click", refreshEvents);

  // Past events toggle (hidden by default)
  const btnTogglePast = $("btnTogglePast");
  const pastList = $("pastEventsList");
  if (btnTogglePast && pastList) {
    const sync = () => {
      const isOpen = !pastList.classList.contains("is-hidden");
      btnTogglePast.classList.toggle("is-open", isOpen);
      btnTogglePast.setAttribute("aria-expanded", isOpen ? "true" : "false");
      pastList.setAttribute("aria-hidden", isOpen ? "false" : "true");
    };
    sync();
    btnTogglePast.addEventListener("click", () => {
      pastList.classList.toggle("is-hidden");
      sync();
    });
  }

  // If you hit Enter in the token field, attempt login.
  if ($("token")) {
    $("token").addEventListener("keydown", (e) => {
      if (e.key === "Enter") login();
    });
  }

  // Still keep /api/test handy if you want to debug.
  if ($("btnTest")) $("btnTest").addEventListener("click", testApi);

  if ($("btnSubmit")) $("btnSubmit").addEventListener("click", submitEvent);
  if ($("btnUpdate")) $("btnUpdate").addEventListener("click", updateEvent);
  if ($("btnCancelEdit")) $("btnCancelEdit").addEventListener("click", cancelEdit);

  // JSON footer: when opened, show a preview of the payload. While open, keep it up to date.
  const jsonFooter = $("jsonFooter");
  if (jsonFooter) {
    const maybeUpdatePreview = () => {
      if (jsonFooter.open) previewJson();
    };
    jsonFooter.addEventListener("toggle", maybeUpdatePreview);
    document.addEventListener("input", (e) => {
      const t = e.target;
      if (!(t instanceof HTMLElement)) return;
      if (!jsonFooter.open) return;
      if (t.closest && t.closest("#portalCard")) previewJson();
    });
  }

  // Auto-fill today's date for convenience.
  if (!$("event_date").value) {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    $("event_date").value = `${yyyy}-${mm}-${dd}`;
  }

  setLoggedIn(false);
  setEditMode(false);
  setLoginOutput("");
});


