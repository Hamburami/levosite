(() => {
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  function yyyymmddToParts(n) {
    if (typeof n !== "number" || !Number.isInteger(n)) return null;
    const s = String(n).padStart(8, "0");
    const yyyy = Number(s.slice(0, 4));
    const mm = Number(s.slice(4, 6));
    const dd = Number(s.slice(6, 8));
    if (!yyyy || mm < 1 || mm > 12 || dd < 1 || dd > 31) return null;
    return { yyyy, mm, dd };
  }

  function toIsoDate({ yyyy, mm, dd }) {
    const m = String(mm).padStart(2, "0");
    const d = String(dd).padStart(2, "0");
    return `${yyyy}-${m}-${d}`;
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

  function makeEl(tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined && text !== null) el.textContent = text;
    return el;
  }

  function renderEventLi(event) {
    const li = makeEl("li", "otd-event");

    const timeInfo = makeEl("div", "otd-event__time-info");

    const parts = yyyymmddToParts(event.event_date);
    const monthText = parts ? MONTHS[parts.mm - 1] : "";
    const dayText = parts ? String(parts.dd) : "";

    const time = makeEl("time", "otd-event__date");
    if (parts) time.setAttribute("datetime", toIsoDate(parts));
    const monthSpan = makeEl("span", "otd-event__date--month", monthText);
    const daySpan = makeEl("span", "otd-event__date--day", dayText);
    time.appendChild(monthSpan);
    time.appendChild(document.createTextNode(" "));
    time.appendChild(daySpan);

    const startText = formatTimeLocal(event.start_time_utc);
    const endText = formatTimeLocal(event.end_time_utc);
    const doorsText = (startText && endText) ? `${startText} - ${endText}` : (startText ? `${startText}` : "time tba");
    const doors = makeEl("p", "otd-event__doors", doorsText);

    timeInfo.appendChild(time);
    timeInfo.appendChild(doors);

    const mainInfo = makeEl("div", "otd-event__main-info");
    mainInfo.appendChild(makeEl("h3", "otd-event__title", event.event_title || ""));

    if (event.event_lineup) {
      mainInfo.appendChild(makeEl("h4", "otd-event__lineup", event.event_lineup));
    }
    if (event.event_description) {
      mainInfo.appendChild(makeEl("p", "otd-event__description", event.event_description));
    }
    if (event.event_additional) {
      mainInfo.appendChild(makeEl("p", "otd-event__additional", event.event_additional));
    } else if (event.event_location) {
      // If they only filled location, show it as "additional" line to match the layout.
      mainInfo.appendChild(makeEl("p", "otd-event__additional", event.event_location));
    }

    // Match the existing hand-authored markup as closely as possible:
    // Always use the <a> wrapper so CSS that targets `.otd-event > a` applies consistently.
    // If there's no link, we simply omit `href`/`target` (so it's not a navigational link).
    const linkUrl =
      (typeof event.link_url === "string" && event.link_url.trim()) ? event.link_url.trim() :
      (typeof event.event_link === "string" && event.event_link.trim()) ? event.event_link.trim() :
      null;

    const a = makeEl("a");
    if (linkUrl) {
      a.setAttribute("href", linkUrl);
      a.setAttribute("target", "_blank");
      a.setAttribute("rel", "noopener noreferrer");
    }
    a.appendChild(timeInfo);
    a.appendChild(mainInfo);
    li.appendChild(a);
    return li;
  }

  async function loadEvents() {
    const list = document.getElementById("events-list");
    const status = document.getElementById("events-status");
    if (!list) {
      console.warn("[events.js] Missing #events-list element; nothing to render.");
      return;
    }

    const setStatus = (text) => {
      if (!status) return;
      status.textContent = text;
      status.style.display = text ? "" : "none";
    };

    setStatus("loading...");

    try {
      // Debug mode: render a fake event without touching the API.
      // Use: index.html?mock_events=1
      const params = new URLSearchParams(location.search);
      if (params.get("mock_events") === "1") {
        list.querySelectorAll("li.otd-event").forEach((n) => n.remove());
        setStatus("");
        list.appendChild(renderEventLi({
          event_id: 0,
          event_title: "Mock Event (no API call)",
          event_date: 20261231,
          start_time_utc: null,
          end_time_utc: null,
          event_location: "Somewhere",
          event_lineup: "On the Dot",
          event_description: "This is a locally-rendered test card.",
          event_additional: "mock_events=1"
        }));
        return;
      }

      // If this page is being served from somewhere other than https://onthe.band,
      // a relative "/api/events" would hit the wrong origin (often causing 404).
      const apiUrl = (location.hostname === "onthe.band")
        ? "/api/events"
        : "https://onthe.band/api/events";

      const res = await fetch(apiUrl, { headers: { Accept: "application/json" } });
      if (!res.ok) throw new Error(`GET /api/events failed (${res.status})`);
      const data = await res.json();
      const events = Array.isArray(data?.events) ? data.events : [];

      // Clear existing event <li>s (keep status node if present).
      list.querySelectorAll("li.otd-event").forEach((n) => n.remove());

      if (!events.length) {
        setStatus("No shows yet");
        return;
      }

      setStatus("");
      const frag = document.createDocumentFragment();
      for (const e of events) {
        frag.appendChild(renderEventLi(e));
      }
      list.appendChild(frag);
    } catch (err) {
      // Don't destroy any existing markup if the API fails.
      setStatus("No shows yet");
      console.error(err);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadEvents);
  } else {
    loadEvents();
  }
})();


