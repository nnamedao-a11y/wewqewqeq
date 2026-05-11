import { useState, useRef, useEffect, useMemo } from "react";
import axios from "axios";
import styles from "./frame-component18.module.css";
import { CAR_BRANDS, MODELS_BY_BRAND, GENERIC_MODELS, YEARS } from "../../data/cars";
import { useLang } from "../../i18n";

const API_URL = process.env.REACT_APP_BACKEND_URL || "";

// Original hardcoded copy + image — kept verbatim as the visual fallback
// so the site looks IDENTICAL to the Figma design until the admin
// changes anything in /admin/info → Hero Banner.
const ORIGINAL_HERO = {
  enabled: true,
  eyebrow_en: "america | Korea",
  eyebrow_bg: "америка | Корея",
  title_line1_en: "From auction",
  title_line1_bg: "От търг",
  title_line2_en: "to keys",
  title_line2_bg: "до ключове",
  title_line3_en: "in your hands",
  title_line3_bg: "във Вашите ръце",
  kpi1_en: "/ Over 5,000 cars",
  kpi1_bg: "/ Над 5,000 автомобила",
  kpi2_en: "/ Real-time bids",
  kpi2_bg: "/ Наддавания на живо",
  kpi3_en: "/ 500+ happy clients",
  kpi3_bg: "/ 500+ доволни клиенти",
  image_url: "/figma/image-60@2x.webp",
};

// Resolve relative `/api/static/...` paths to an absolute URL
const resolveImageUrl = (raw) => {
  if (!raw) return ORIGINAL_HERO.image_url;
  if (/^https?:\/\//i.test(raw)) return raw;
  if (raw.startsWith("/api/")) return `${API_URL}${raw}`;
  return raw; // relative `/figma/...` etc — served by the SPA itself
};

const Dropdown = ({ label, value, options, onSelect, isOpen, onToggle, searchable = true }) => {
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      // small timeout so DOM mounts before we focus
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [isOpen]);

  const filtered = useMemo(() => {
    if (!query.trim()) return options;
    const q = query.trim().toLowerCase();
    return options.filter((o) => o.toLowerCase().includes(q));
  }, [query, options]);

  return (
    <div className={styles.filterCellWrap}>
      <button
        type="button"
        className={`${styles.filterCell} ${isOpen ? styles.filterCellOpen : ""}`}
        onClick={onToggle}
      >
        <span className={styles.filterLabel}>{value || label}</span>
        <img
          className={`${styles.filterCaret} ${isOpen ? styles.filterCaretOpen : ""}`}
          alt=""
          src="/figma/lsicon-down-filled.svg"
        />
      </button>
      {isOpen && (
        <div className={styles.dropdownPanel} role="listbox">
          {searchable && (
            <div className={styles.dropdownSearchBox}>
              <img
                className={styles.dropdownSearchIcon}
                src="/figma/boxicons-search.svg"
                alt=""
              />
              <input
                ref={inputRef}
                className={styles.dropdownSearchInput}
                placeholder={`Search ${label.toLowerCase()}...`}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
          <div className={styles.dropdownList}>
            {filtered.length === 0 ? (
              <div className={styles.dropdownEmpty}>No matches</div>
            ) : (
              filtered.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  className={`${styles.dropdownItem} ${value === opt ? styles.dropdownItemActive : ""}`}
                  onClick={() => onSelect(opt)}
                >
                  {opt}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const FrameComponent18 = ({ className = "" }) => {
  const { lang } = useLang();
  const isBg = lang === "bg";

  const [openMenu, setOpenMenu] = useState(null);
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [hero, setHero] = useState(ORIGINAL_HERO);
  const filterRef = useRef(null);

  // Pull admin-configured hero copy + image (silently falls back to ORIGINAL_HERO)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await axios.get(`${API_URL}/api/site-info`);
        if (cancelled) return;
        const h = r?.data?.hero;
        if (h && typeof h === "object") {
          setHero({ ...ORIGINAL_HERO, ...h });
        }
      } catch {
        /* keep defaults */
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Pick a field with graceful fallback: current lang → other lang → original
  const pick = (key) => {
    const cur = hero[`${key}${isBg ? "_bg" : "_en"}`];
    const alt = hero[`${key}${isBg ? "_en" : "_bg"}`];
    return (cur && cur.trim()) || (alt && alt.trim()) || ORIGINAL_HERO[`${key}_en`] || "";
  };

  const eyebrow = pick("eyebrow");
  const t1 = pick("title_line1");
  const t2 = pick("title_line2");
  const t3 = pick("title_line3");
  const k1 = pick("kpi1");
  const k2 = pick("kpi2");
  const k3 = pick("kpi3");
  const heroImage = resolveImageUrl(hero.image_url);

  useEffect(() => {
    const onDocClick = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setOpenMenu(null);
      }
    };
    const onEsc = (e) => { if (e.key === "Escape") setOpenMenu(null); };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  const toggle = (name) => setOpenMenu((cur) => (cur === name ? null : name));

  const brandOptions = useMemo(() => ["Any Brand", ...CAR_BRANDS], []);
  const modelOptions = useMemo(() => {
    if (brand && MODELS_BY_BRAND[brand]) {
      return ["Any Model", ...MODELS_BY_BRAND[brand]];
    }
    return ["Any Model", ...GENERIC_MODELS];
  }, [brand]);
  const yearOptions = useMemo(() => ["Any Year", ...YEARS], []);

  const onFind = () => {
    const params = new URLSearchParams();
    if (brand) params.set("brand", brand);
    if (model && model !== "Any Model") params.set("model", model);
    if (year && year !== "Any Year") params.set("year", year);
    const qs = params.toString();
    window.location.href = `/catalog${qs ? "?" + qs : ""}`;
  };

  return (
    <section className={[styles.heroContentWrapper, className].join(" ")}>
      <div className={styles.heroContent}>
        <div className={styles.image60Parent}>
          <img
            className={styles.image60Icon}
            alt=""
            src={heroImage}
            onError={(e) => {
              if (e.currentTarget.src !== window.location.origin + ORIGINAL_HERO.image_url) {
                e.currentTarget.src = ORIGINAL_HERO.image_url;
              }
            }}
          />
        </div>

        <div className={styles.heroInner}>
          <div className={styles.heroTextStack}>
            <h3 className={styles.americaKorea}>{eyebrow}</h3>
            <div className={styles.heroHeadline}>
              <h2 className={styles.fromAuction}>{t1}</h2>
              <h2 className={styles.toKeys}>{t2}</h2>
              <h2 className={styles.inYourHands}>{t3}</h2>
            </div>
            <div className={styles.clientStats}>
              <h3 className={styles.statItem}>{k1}</h3>
              <h3 className={styles.statItem}>{k2}</h3>
              <h3 className={styles.statItem}>{k3}</h3>
            </div>
          </div>

          <div className={styles.filterControlsWrapper}>
            <div className={styles.filterControls} ref={filterRef}>
              <Dropdown
                label="Brand"
                value={brand}
                options={brandOptions}
                isOpen={openMenu === "brand"}
                onToggle={() => toggle("brand")}
                onSelect={(v) => {
                  setBrand(v === "Any Brand" ? "" : v);
                  setModel("");
                  setOpenMenu(null);
                }}
              />
              <div className={styles.filterDivider} />
              <Dropdown
                label="Model"
                value={model}
                options={modelOptions}
                isOpen={openMenu === "model"}
                onToggle={() => toggle("model")}
                onSelect={(v) => {
                  setModel(v === "Any Model" ? "" : v);
                  setOpenMenu(null);
                }}
              />
              <div className={styles.filterDivider} />
              <Dropdown
                label="Any year"
                value={year}
                options={yearOptions}
                isOpen={openMenu === "year"}
                onToggle={() => toggle("year")}
                onSelect={(v) => {
                  setYear(v === "Any Year" ? "" : v);
                  setOpenMenu(null);
                }}
              />
              <button type="button" className={styles.findBtn} onClick={onFind}>
                FIND A CAR
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FrameComponent18;
