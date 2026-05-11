import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import styles from "./reviews-area1.module.css";

/**
 * ReviewsArea1 — admin-managed "OUR CLIENTS SAY" block.
 *
 * Reviews, headings, the Google rating badge and the 460+ counter are now
 * fully driven by `GET /api/site-info` (`reviews` payload). The site
 * administrator can add / edit / disable / reorder testimonials from the
 * Admin → Info → Content → Reviews tab.
 *
 * Public payload shape:
 *   reviews: {
 *     enabled, title_en/bg, subtitle_en/bg,
 *     google_rating, google_reviews_count, google_reviews_url,
 *     baseline_happy_customers,
 *     items: [{
 *       id, enabled, name, image_url, rating, text_en, text_bg
 *     }]
 *   }
 *
 * If the API is unreachable the component falls back to a small set of
 * locally-bundled demo reviews so the page never renders empty.
 */

const API_URL = process.env.REACT_APP_BACKEND_URL || "";

const FALLBACK_REVIEWS = [
  {
    id: "fallback-1",
    enabled: true,
    name: "Georgi",
    rating: 5,
    image_url: "",
    text_en:
      "I really liked the approach — everything was clear, transparent, and without \u201Csurprises.\u201D The car was chosen to fit my budget and wishes, and they were constantly in touch. I\u2019m already recommending it to my friends!",
    text_bg:
      "Хареса ми подходът — всичко беше ясно, прозрачно и без \u201Eизненади\u201C. Колата беше избрана според бюджета и желанията ми. Препоръчвам на приятели!",
  },
  {
    id: "fallback-2",
    enabled: true,
    name: "Dimitar",
    rating: 5,
    image_url: "",
    text_en:
      "I bought a car from an auction — the team really knows their stuff. They explained all the nuances, helped me win the bid, and organized delivery. The result — top value for money.",
    text_bg:
      "Купих кола от търг — екипът наистина знае работата си. Обясниха всички нюанси, помогнаха да спечеля наддаването и организираха доставката.",
  },
];

const FALLBACK_CFG = {
  enabled: true,
  title_en: "Our Clients Say",
  title_bg: "Какво казват нашите клиенти",
  subtitle_en: "What customers say when they work with us",
  subtitle_bg: "Какво казват клиентите след работа с нас",
  google_rating: 4.9,
  google_reviews_count: 31,
  google_reviews_url: "",
  baseline_happy_customers: 455,
  items: FALLBACK_REVIEWS,
};

function fullMediaUrl(u) {
  if (!u) return "";
  if (/^https?:\/\//i.test(u)) return u;
  return `${API_URL}${u}`;
}

function getActiveLang() {
  // The site exposes a global lang via document.documentElement.lang or
  // localStorage 'lang'. Default to EN.
  if (typeof window === "undefined") return "en";
  const saved = (localStorage.getItem("lang") || "").toLowerCase();
  if (saved === "bg" || saved === "en") return saved;
  const docLang = (document?.documentElement?.lang || "").toLowerCase();
  if (docLang.startsWith("bg")) return "bg";
  return "en";
}

const ReviewsArea1 = ({ className = "" }) => {
  const trackRef = useRef(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [cfg, setCfg] = useState(FALLBACK_CFG);
  const [lang, setLang] = useState(getActiveLang());

  // Fetch admin-managed reviews on mount.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await axios.get(`${API_URL}/api/site-info`);
        if (cancelled) return;
        const reviews = r?.data?.reviews;
        if (reviews && typeof reviews === "object") {
          setCfg({ ...FALLBACK_CFG, ...reviews, items: Array.isArray(reviews.items) ? reviews.items : [] });
        }
      } catch {
        /* keep fallback */
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // React to language changes (custom event fired by the language switcher).
  useEffect(() => {
    const onLang = () => setLang(getActiveLang());
    window.addEventListener("storage", onLang);
    window.addEventListener("bibi:lang-change", onLang);
    return () => {
      window.removeEventListener("storage", onLang);
      window.removeEventListener("bibi:lang-change", onLang);
    };
  }, []);

  const visibleReviews = useMemo(
    () => (cfg.items || []).filter((r) => r && r.enabled !== false),
    [cfg.items],
  );

  const happyCustomers =
    (Number(cfg.baseline_happy_customers) || 0) + visibleReviews.length;

  const handleScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector(`.${styles.card}`);
    if (!card) return;
    const cardWidth = card.getBoundingClientRect().width + 15;
    const idx = Math.round(el.scrollLeft / cardWidth);
    setActiveIdx(Math.max(0, Math.min(visibleReviews.length - 1, idx)));
  }, [visibleReviews.length]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Reset slider to first card when items list changes.
  useEffect(() => {
    setActiveIdx(0);
    if (trackRef.current) trackRef.current.scrollTo({ left: 0 });
  }, [visibleReviews.length]);

  const scrollToIdx = (i) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector(`.${styles.card}`);
    if (!card) return;
    const cardWidth = card.getBoundingClientRect().width + 15;
    el.scrollTo({ left: cardWidth * i, behavior: "smooth" });
  };

  const prev = () => scrollToIdx(Math.max(0, activeIdx - 1));
  const next = () =>
    scrollToIdx(Math.min(visibleReviews.length - 1, activeIdx + 1));

  if (cfg.enabled === false) return null;

  const subtitle =
    lang === "bg"
      ? cfg.subtitle_bg || cfg.subtitle_en || ""
      : cfg.subtitle_en || cfg.subtitle_bg || "";

  return (
    <div
      className={[styles.reviewsArea, className].join(" ")}
      data-testid="our-clients-say-section"
    >
      <div className={styles.layout}>
        {/* ── LEFT column ───────────────────────────────────────────── */}
        <aside className={styles.leftColumn}>
          <div className={styles.googleBlock}>
            <img
              className={styles.googleLogo}
              loading="lazy"
              width={259}
              height={87}
              alt="Google"
              src="/figma/image-34@2x.webp"
            />
            <div className={styles.googleMeta}>
              <div className={styles.googleRatingRow}>
                <span className={styles.googleScore}>
                  {(Number(cfg.google_rating) || 0).toFixed(1)}
                </span>
                <span className={styles.googleStars} aria-hidden="true">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <img
                      key={i}
                      className={styles.googleStar}
                      width={24}
                      height={24}
                      alt=""
                      src="/figma/material-symbols-star.svg"
                    />
                  ))}
                </span>
              </div>
              {cfg.google_reviews_url ? (
                <a
                  className={styles.googleReviewsLink}
                  href={cfg.google_reviews_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {cfg.google_reviews_count} Google reviews
                </a>
              ) : (
                <span className={styles.googleReviewsLink}>
                  {cfg.google_reviews_count} Google reviews
                </span>
              )}
            </div>
          </div>

          {subtitle && <h1 className={styles.whatCustomersSay}>{subtitle}</h1>}
        </aside>

        {visibleReviews.length > 0 && (
          <img
            className={styles.fontistoarrowUpIcon}
            loading="lazy"
            width={215}
            height={215}
            alt=""
            src="/figma/fontisto_arrow-up.svg"
          />
        )}

        {/* ── RIGHT column ──────────────────────────────────────────── */}
        <div className={styles.rightColumn}>
          <div className={styles.bigNumberBlock} aria-hidden="true">
            <h1 className={styles.bigNumber}>{happyCustomers}&nbsp;+</h1>

            <div className={styles.satisfiedBlock}>
              <img
                className={styles.bracketLeft}
                src="/figma/Vector.svg"
                width={13}
                height={76}
                alt=""
              />
              <h2 className={styles.satisfiedLabel}>
                <span className={styles.satisfiedYellow}>Satisfied clients</span>
                <br />
                <span className={styles.satisfiedWhite}>are our priority</span>
              </h2>
              <img
                className={styles.bracketRight}
                src="/figma/Vector.svg"
                width={13}
                height={76}
                alt=""
              />
            </div>
          </div>

          {visibleReviews.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No reviews yet.</p>
            </div>
          ) : (
            <div className={styles.sliderWrap}>
              <div className={styles.track} ref={trackRef}>
                {visibleReviews.map((r, i) => {
                  const text =
                    lang === "bg"
                      ? r.text_bg || r.text_en || ""
                      : r.text_en || r.text_bg || "";
                  const img = fullMediaUrl(r.image_url);
                  return (
                    <article className={styles.card} key={r.id || i}>
                      <div className={styles.avatarRow}>
                        {img ? (
                          <img
                            className={styles.avatarImg}
                            src={img}
                            alt={r.name || "Reviewer"}
                            loading="lazy"
                          />
                        ) : (
                          <div className={styles.avatar} aria-hidden="true">
                            <span className={styles.avatarInitial}>
                              {(r.name || "?").trim().charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <h3 className={styles.cardName}>{r.name || "—"}</h3>
                      </div>
                      <p className={styles.cardText}>{text}</p>
                    </article>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom navigation ──────────────────────────────────────── */}
      {visibleReviews.length > 1 && (
        <div className={styles.nav}>
          <button
            className={styles.navBtn}
            onClick={prev}
            aria-label="Previous review"
            disabled={activeIdx === 0}
            data-testid="review-prev"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M9 1L3 7L9 13"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <div className={styles.dots}>
            {visibleReviews.map((_, i) => (
              <button
                key={i}
                className={`${styles.dot} ${i === activeIdx ? styles.dotActive : ""}`}
                onClick={() => scrollToIdx(i)}
                aria-label={`Go to review ${i + 1}`}
                data-testid={`review-dot-${i}`}
              />
            ))}
          </div>

          <button
            className={styles.navBtn}
            onClick={next}
            aria-label="Next review"
            disabled={activeIdx === visibleReviews.length - 1}
            data-testid="review-next"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M5 1L11 7L5 13"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewsArea1;
