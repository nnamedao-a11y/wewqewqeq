/**
 * FrameComponent21 — "Top vehicles deals of the week" cards grid.
 *
 * Loads in parallel:
 *   • GET /api/public/featured?limit=12   → real BidMotors lots
 *   • GET /api/favorites/me               → user favorites (silent if guest)
 *   • GET /api/compare/me                 → user compare list
 *
 * Renders 6 cards by default and toggles to 12 when the user clicks
 * "MORE VEHICLES +". Each card receives the favorite / compare Sets so
 * heart & scales icons reflect server state immediately.
 */
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import Card1 from "./card1";
import { userEngagementApi } from "../../lib/api";
import styles from "./frame-component21.module.css";

const API = process.env.REACT_APP_BACKEND_URL || "";

const PLACEHOLDER_IMGS = [
  "/figma/image-15@2x.webp",
  "/figma/image-151@2x.webp",
  "/figma/image-152@2x.webp",
  "/figma/image-153@2x.webp",
  "/figma/image-154@2x.webp",
  "/figma/image-155@2x.webp",
];

const FrameComponent21 = ({ className = "" }) => {
  const [items, setItems] = useState(null); // null = loading
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState(null);

  // Selection sets propagated to Card1
  const [favSet, setFavSet] = useState(new Set());
  const [cmpSet, setCmpSet] = useState(new Set());
  const [cmpCount, setCmpCount] = useState(0);

  /* ── Load real lots ─────────────────────────────────────────────── */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await axios.get(`${API}/api/public/featured`, {
          params: { limit: 12 },
          timeout: 18000,
        });
        if (!cancelled) {
          const arr = Array.isArray(data?.items) ? data.items : [];
          setItems(arr);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e?.message || "fetch failed");
          setItems([]);
        }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  /* ── Load favorites + compare once (silent on guest) ─────────────── */
  const loadEngagement = useCallback(async () => {
    try {
      const favs = await userEngagementApi.favorites.getMine();
      if (Array.isArray(favs)) {
        setFavSet(new Set(favs.map((f) => (f.vin || f.vehicleId || "").toUpperCase()).filter(Boolean)));
      }
    } catch {/* unauth or API down → leave empty */}
    try {
      const cmp = await userEngagementApi.compare.getMine();
      const list = Array.isArray(cmp) ? cmp : (cmp?.items || []);
      const ids = list.map((c) => (c.vin || c.vehicleId || "").toUpperCase()).filter(Boolean);
      setCmpSet(new Set(ids));
      setCmpCount(ids.length);
    } catch {/* leave empty */}
  }, []);

  useEffect(() => { loadEngagement(); }, [loadEngagement]);

  /* ── Optimistic toggles propagated from Card1 ─────────────────────── */
  const handleToggleFavorite = useCallback((vin, next) => {
    if (!vin) return;
    const v = vin.toUpperCase();
    setFavSet((prev) => {
      const ns = new Set(prev);
      if (next) ns.add(v); else ns.delete(v);
      return ns;
    });
  }, []);

  const handleToggleCompare = useCallback((vin, next) => {
    if (!vin) return;
    const v = vin.toUpperCase();
    setCmpSet((prev) => {
      const ns = new Set(prev);
      if (next) ns.add(v); else ns.delete(v);
      return ns;
    });
    setCmpCount((c) => Math.max(0, c + (next ? 1 : -1)));
  }, []);

  const toggleExpand = useCallback(() => setExpanded((v) => !v), []);

  /* ── Build rows ───────────────────────────────────────────────────── */
  const live = items && items.length > 0 ? items : null;
  const visibleCount = expanded ? 12 : 6;
  const rows = [];
  if (live) {
    const slice = live.slice(0, visibleCount);
    for (let i = 0; i < slice.length; i += 3) rows.push(slice.slice(i, i + 3));
  } else {
    rows.push([0, 1, 2]);
    rows.push([3, 4, 5]);
  }
  const hasMoreToShow = live ? live.length > 6 : false;

  return (
    <div className={[styles.cardsBlockWrapper, className].join(" ")}>
      <div className={styles.cardsBlock}>
        {rows.map((row, ri) => (
          <div className={styles.cardsParent} key={`row-${ri}`}>
            {row.map((cell, ci) => {
              if (live) {
                const v = cell;
                return (
                  <section className={styles.carBlock} key={v.vin || `${ri}-${ci}`}>
                    <Card1
                      data={v}
                      favoriteSet={favSet}
                      compareSet={cmpSet}
                      compareCount={cmpCount}
                      onToggleFavoriteLocal={handleToggleFavorite}
                      onToggleCompareLocal={handleToggleCompare}
                    />
                  </section>
                );
              }
              const idx = typeof cell === "number" ? cell : ri * 3 + ci;
              return (
                <section className={styles.carBlock} key={`ph-${idx}`}>
                  <Card1 image15={PLACEHOLDER_IMGS[idx % PLACEHOLDER_IMGS.length]} />
                </section>
              );
            })}
          </div>
        ))}

        {hasMoreToShow && (
          <div style={{ display: "flex", justifyContent: "center", padding: "32px 0 0" }}>
            <button
              type="button"
              onClick={toggleExpand}
              data-testid="top-deals-more-toggle"
              style={{
                background: "transparent", border: 0, color: "#FEAE00",
                fontFamily: "var(--font-mazzard)", fontSize: 18, fontWeight: 500,
                letterSpacing: "0.06em", textTransform: "uppercase",
                textDecoration: "underline", cursor: "pointer", padding: "8px 12px",
              }}
            >
              {expanded ? "less vehicles −" : "more vehicles +"}
            </button>
          </div>
        )}

        {error && items && items.length === 0 && (
          <div style={{
            textAlign: "center", color: "#9a9a98", fontFamily: "var(--font-mazzard)",
            fontSize: 13, padding: "16px 0",
          }}>
            Live BidMotors feed temporarily unavailable — showing previews.
          </div>
        )}
      </div>
    </div>
  );
};

export default FrameComponent21;
