/**
 * Formatters for Single Car page payloads.
 *
 * Backend (`/api/vin/<VIN>`) returns auction-source data verbatim
 * (UPPERCASE model, "Front-wheel Drive", "2.5l 4", numeric odometer, …).
 * The Figma design demands proper Title Case, "FWD", "2.5 L", thousand
 * separators and so on — so we centralise that here instead of inline.
 */

const titleCase = (s) => {
  if (!s) return "";
  return String(s)
    .toLowerCase()
    .replace(/\b([a-z])/g, (m) => m.toUpperCase())
    .replace(/\bUsa\b/g, "USA")
    .replace(/\bU\.s\.a\.?/gi, "USA");
};

export const formatTitle = (d) => {
  const fromApi = d?.title && String(d.title).trim();
  if (fromApi) {
    const parts = fromApi.split(/\s+/);
    if (parts.length >= 2) {
      const year = /^\d{4}$/.test(parts[0]) ? parts[0] : null;
      const rest = year ? parts.slice(1).join(" ") : fromApi;
      return year ? `${year} ${titleCase(rest)}` : titleCase(rest);
    }
    return titleCase(fromApi);
  }
  const y = d?.year ? String(d.year) : "";
  const mk = titleCase(d?.make || "");
  const md = titleCase(d?.model || "");
  return [y, mk, md].filter(Boolean).join(" ");
};

export const formatMileage = (odo, unit) => {
  if (odo == null || odo === "") return "—";
  const n = typeof odo === "number" ? odo : parseInt(String(odo).replace(/[^\d]/g, ""), 10);
  if (!Number.isFinite(n) || n <= 0) return "—";
  const u = (unit || "km").toString().toLowerCase();
  return `${n.toLocaleString("en-US")} ${u === "mi" ? "mi" : "km"}`;
};

export const formatDrivetrain = (v) => {
  if (!v) return "—";
  const s = String(v).toLowerCase();
  if (s.includes("front")) return "FWD";
  if (s.includes("rear")) return "RWD";
  if (s.includes("all-wheel") || s.includes("all wheel") || s === "awd") return "AWD";
  if (s.includes("4-wheel") || s.includes("4wd") || s.includes("four-wheel")) return "4WD";
  return String(v).toUpperCase();
};

export const formatEngine = (v) => {
  if (!v) return "—";
  const m = String(v).match(/(\d+(?:[.,]\d+)?)\s*l/i);
  if (m) {
    const num = m[1].replace(",", ".");
    return `${num} L`;
  }
  return String(v);
};

export const formatBodyStyle = (style, d) => {
  if (style) return titleCase(style);
  // Heuristic from model if style missing
  const m = (d?.model || "").toLowerCase();
  if (/sedan|altima|camry|accord|fusion|civic/.test(m)) return "Sedan";
  if (/suv|rav4|crv|rogue|escape|forester|outlander/.test(m)) return "SUV";
  if (/pickup|f-150|f150|silverado|tundra|ram/.test(m)) return "Pickup";
  return "—";
};

export const formatLocation = (loc) => {
  if (!loc) return "—";
  return titleCase(loc);
};

export const formatPrice = (val, d) => {
  if (val == null || val === "") return "—";
  const num = typeof val === "number" ? val : parseFloat(String(val).replace(/[^\d.]/g, ""));
  if (!Number.isFinite(num) || num <= 0) return "—";
  // Backend `price` for bidmotors lots is already EUR; current_bid same currency.
  return `€${Math.round(num).toLocaleString("en-US")}`;
};

export const formatStatus = (d, h) => {
  if (d?.is_live) return "Live";
  if (d?._history_only || h?.sale_date) return "Sold";
  if (d?.sale_date) return "Traded";
  return "Available";
};

export const formatUpdated = (saleDate) => {
  if (!saleDate) return "—";
  // Accept DD.MM.YYYY[ HH:MM] or ISO
  const s = String(saleDate);
  const m = s.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})(?:\s+(\d{1,2}):(\d{2}))?/);
  let dt;
  if (m) {
    const [, dd, mm, yyyy, hh, mi] = m;
    dt = new Date(Number(yyyy), Number(mm) - 1, Number(dd), Number(hh || 0), Number(mi || 0));
  } else {
    const t = Date.parse(s);
    if (!Number.isFinite(t)) return s;
    dt = new Date(t);
  }
  return dt.toLocaleString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

export const buildDescription = (d, h) => {
  const bits = [];
  const cond = (d?.condition || "").toString();
  const dmg = d?.damage_primary || h?.damage_primary;
  const keys = d?.keys;
  const titleStatus = d?.title_status;

  if (/run.*drive/i.test(cond)) bits.push("Vehicle starts and drives.");
  else if (/start/i.test(cond)) bits.push("Vehicle starts.");
  else if (cond) bits.push(`Condition: ${cond}.`);

  if (dmg) {
    const lc = String(dmg).toLowerCase();
    bits.push(`Primary damage: ${lc}.`);
  }
  if (keys && /yes|y/i.test(String(keys))) bits.push("Keys present.");
  if (titleStatus) bits.push(`Title: ${titleStatus.toLowerCase().replace(/^./, (c) => c.toUpperCase())}.`);

  if (!bits.length) return "Detailed condition report available on request. Contact BIBI for inspection photos and binding quote.";
  bits.push("Suitable for purchase, import to Bulgaria and resale or personal use.");
  return bits.join(" ");
};

/**
 * Pick a sensible photo set: prefer live `images`, fall back to history.
 * Single Car page wants: 1 hero + 4 thumbs (row 1) + 3 thumbs (row 2) + ALL-IMAGES tile.
 */
export const pickImages = (d, h) => {
  const live = Array.isArray(d?.images) ? d.images : [];
  const hist = Array.isArray(h?.image_urls) ? h.image_urls : [];
  const merged = (live.length ? live : hist).filter(Boolean);
  // Deduplicate while preserving order.
  const seen = new Set();
  const out = [];
  for (const u of merged) {
    if (!u || seen.has(u)) continue;
    seen.add(u);
    out.push(u);
  }
  return out;
};
