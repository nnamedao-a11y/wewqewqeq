/**
 * Card1 — "Top vehicles deals" card (homepage).
 *
 * Now fully wired to real data:
 *   • Real BidMotors lot — `vin`, `lot_number`, photo, mileage, condition…
 *   • Real countdown timer — derived from the parsed `sale_date` (DD.MM.YYYY).
 *     Bulgarian time is used to align with bidmotors.bg auction schedule.
 *     If `sale_date` is missing we fall back to a neutral "Auction TBA" chip.
 *   • Heart  → toggles `favorites` (auth-aware via existing FavoriteButton flow)
 *   • Scales → toggles `compare` (uses `userEngagementApi.compare`)
 *   • "More details" / photo / title → existing `/vin/<VIN>` page.
 *
 * The parent `FrameComponent21` loads the user's favorites & compare lists
 * ONCE and passes Sets here, so we don't fan-out 12 GETs per card.
 */
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { userEngagementApi, getCustomerToken } from "../../lib/api";
import styles from "./card1.module.css";

const FALLBACK_IMG = "/figma/image-15@2x.webp";

/* ────────── helpers ────────── */
const fmtKm = (n, unit) => {
  if (n == null || n === "") return "—";
  try {
    const num = typeof n === "number" ? n : parseInt(String(n).replace(/[^\d]/g, ""), 10);
    if (!num || isNaN(num)) return String(n);
    return `${num.toLocaleString("en-US").replace(/,/g, " ")} ${(unit || "km").toUpperCase()}`;
  } catch {
    return String(n);
  }
};

const fmtPrice = (p) => {
  if (!p) return "On request";
  if (typeof p === "object") {
    const amount = p.amount || p.value || p.usd || p.eur;
    const cur = (p.currency || p.cur || "EUR").toUpperCase();
    if (amount) return `${Number(amount).toLocaleString("en-US")} ${cur}`;
  }
  return String(p);
};

/**
 * Parse a BidMotors `sale_date` string ("DD.MM.YYYY" or "DD.MM.YYYY HH:MM"
 * or ISO) and return a JS Date in Europe/Sofia (UTC+2). When only a date is
 * provided, we point to the end of that auction day (23:59 local).
 */
function parseSaleDate(s) {
  if (!s) return null;
  if (s instanceof Date) return s;
  const str = String(s).trim();
  // Try ISO first
  const iso = Date.parse(str);
  if (!isNaN(iso) && /\d{4}-\d{2}-\d{2}/.test(str)) return new Date(iso);
  // DD.MM.YYYY[ HH:MM]
  const m = str.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})(?:\s+(\d{1,2}):(\d{2}))?/);
  if (m) {
    const [, d, mo, y, hh, mm] = m;
    // Approximate Bulgaria UTC+2 offset (DST not strictly tracked — close enough
    // for a marketing countdown; live status is anchored to backend "live" flag).
    const utcMs = Date.UTC(
      parseInt(y, 10),
      parseInt(mo, 10) - 1,
      parseInt(d, 10),
      hh ? parseInt(hh, 10) - 2 : 21, // 23:59 Sofia ≈ 21:59 UTC if no time given
      mm ? parseInt(mm, 10) : 59,
      0
    );
    return new Date(utcMs);
  }
  return null;
}

function formatRemaining(ms) {
  if (ms <= 0) return "Closed";
  const totalSec = Math.floor(ms / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h ${mins}m`;
  return `${hours}h ${mins}m ${totalSec % 60}s`;
}

/* ────────── component ────────── */
const Card1 = ({
  className = "",
  data,
  // legacy Figma props (used as fallback)
  image15,
  iconoirclock = "/figma/iconoir-clock.svg",
  title: titleProp,
  tradingDate: tradingDateProp,
  timer: timerProp,
  purchasePrice: purchasePriceProp,
  mileage: mileageProp,
  engine: engineProp,
  drive: driveProp,
  finalCost: finalCostProp,
  ctaLabel = "More details",
  // shared selection state
  favoriteSet,
  compareSet,
  compareCount = 0,
  onToggleFavoriteLocal, // (vin, next) — optimistic update from parent
  onToggleCompareLocal,  // (vin, next)
}) => {
  const navigate = useNavigate();
  const [busyFav, setBusyFav] = useState(false);
  const [busyCmp, setBusyCmp] = useState(false);

  // Resolve display values
  const vin = data?.vin || null;
  const title = data?.title || titleProp || "2025 Lucid Motors Air Pure";
  const image = data?.image || image15 || FALLBACK_IMG;
  const auctionName = data?.auction_name || "IAAI";
  const lotNumber = data?.lot_number;
  const purchasePrice = fmtPrice(data?.price ?? purchasePriceProp ?? "20,000-30,000 EURO");
  const mileage = data ? fmtKm(data.odometer, data.odometer_unit) : (mileageProp || "65 900 KM");
  const engine = data?.engine || engineProp || (data?.fuel_type ? data.fuel_type : "—");
  const drive = data?.drivetrain || driveProp || data?.condition || "—";
  const finalCost = finalCostProp || "50,000-70,000 EURO";
  const tradingDate = tradingDateProp || (lotNumber ? `Lot - ${lotNumber}` : `Auction - ${auctionName}`);

  /* ── real-time countdown ── */
  const saleAt = useMemo(() => parseSaleDate(data?.sale_date), [data?.sale_date]);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!saleAt) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [saleAt]);
  const timerLabel = saleAt ? formatRemaining(saleAt.getTime() - now) : (timerProp || "Auction TBA");

  /* Single canonical detail path: /cars/:vin
   * Every welcome-page card (figma_home card1, CarRowCard, CarCardVertical) and
   * the header VIN search submit to the same SingleCarPage via this route. The
   * old `/catalog/:id` and `/vin/:query` shortcuts have been retired to avoid
   * any stale layout flashing during navigation (see App.js routes). */
  const detailHref = vin ? `/cars/${encodeURIComponent(vin)}` : null;
  const isFav = vin && favoriteSet ? favoriteSet.has(vin) : false;
  const isCmp = vin && compareSet ? compareSet.has(vin) : false;
  const cmpFull = compareCount >= 3 && !isCmp;

  /* ── handlers ── */
  const requireAuth = () => {
    if (getCustomerToken()) return true;
    toast.info("Please log in to save favorites", { duration: 2400 });
    setTimeout(() => {
      const redirect = encodeURIComponent(window.location.pathname);
      navigate(`/cabinet/login?redirect=${redirect}`);
    }, 700);
    return false;
  };

  const handleFav = async (e) => {
    e.preventDefault(); e.stopPropagation();
    if (!vin || busyFav) return;
    if (!requireAuth()) return;
    const next = !isFav;
    onToggleFavoriteLocal?.(vin, next); // optimistic in parent
    setBusyFav(true);
    try {
      const snapshot = {
        title, vin, vehicleId: vin, year: data?.year, make: data?.make,
        model: data?.model, trim: data?.trim, image,
        lot_number: lotNumber, auction_name: auctionName,
        odometer: data?.odometer, odometer_unit: data?.odometer_unit,
        price: data?.price,
      };
      if (next) {
        await userEngagementApi.favorites.add({
          vin, vehicleId: vin, sourcePage: window.location.pathname, ...snapshot,
        });
        toast.success("Added to favorites", { description: title, duration: 2200 });
      } else {
        await userEngagementApi.favorites.remove(vin);
        toast("Removed from favorites", { description: title, duration: 1800 });
      }
    } catch (err) {
      onToggleFavoriteLocal?.(vin, !next); // rollback
      if (err?.status === 401) requireAuth();
      else toast.error(err?.message || "Could not update favorites");
    } finally {
      setBusyFav(false);
    }
  };

  const handleCmp = async (e) => {
    e.preventDefault(); e.stopPropagation();
    if (!vin || busyCmp) return;
    if (cmpFull) {
      toast.info("Compare list is full (max 3). Remove one first.", { duration: 2200 });
      return;
    }
    const next = !isCmp;
    onToggleCompareLocal?.(vin, next);
    setBusyCmp(true);
    try {
      if (next) {
        await userEngagementApi.compare.add({
          vehicleId: vin, vin, snapshot: {
            title, image, year: data?.year, make: data?.make, model: data?.model,
            lot_number: lotNumber, auction_name: auctionName,
            odometer: data?.odometer, odometer_unit: data?.odometer_unit,
          },
        });
        toast.success("Added to compare", { description: title, duration: 2000 });
      } else {
        await userEngagementApi.compare.remove(vin);
        toast("Removed from compare", { description: title, duration: 1600 });
      }
    } catch (err) {
      onToggleCompareLocal?.(vin, !next);
      toast.error(err?.message || "Could not update compare");
    } finally {
      setBusyCmp(false);
    }
  };

  const PhotoOverlays = () => (
    <>
      <img className={styles.image} src={image} alt={title} loading="lazy"
           onError={(e) => { e.currentTarget.src = FALLBACK_IMG; }} />
      <div className={styles.tradingDate}>{tradingDate}</div>
      <div className={styles.timerChip} title={saleAt ? saleAt.toLocaleString() : ""}>
        <img className={styles.clockIcon} src={iconoirclock} width={20} height={20} alt="" />
        <span className={styles.timerText}>{timerLabel}</span>
      </div>
      <div className={styles.actions}>
        <button
          type="button"
          onClick={handleCmp}
          disabled={busyCmp}
          className={`${styles.iconBtn} ${isCmp ? styles.iconBtnActive : ""}`}
          aria-label={isCmp ? "Remove from compare" : "Add to compare"}
          aria-pressed={isCmp}
          data-testid={`compare-btn-${vin || "card"}`}
        >
          <img
            src={isCmp ? "/figma/card-compare-active.svg" : "/figma/card-compare.svg"}
            alt="" width={32} height={32}
          />
        </button>
        <button
          type="button"
          onClick={handleFav}
          disabled={busyFav}
          className={`${styles.iconBtn} ${isFav ? styles.iconBtnActive : ""}`}
          aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
          aria-pressed={isFav}
          data-testid={`fav-btn-${vin || "card"}`}
        >
          <img
            src={isFav ? "/figma/card-heart-active.svg" : "/figma/card-heart.svg"}
            alt="" width={32} height={32}
          />
        </button>
      </div>
    </>
  );

  return (
    <article className={[styles.card, className].join(" ")} data-testid={vin ? `deal-card-${vin}` : "deal-card"}>
      <div className={styles.imageBox}>
        {detailHref ? (
          <Link to={detailHref} aria-label={title} style={{ display: "block", width: "100%", height: "100%" }}>
            <PhotoOverlays />
          </Link>
        ) : (
          <PhotoOverlays />
        )}
      </div>

      <h3 className={styles.title}>
        {detailHref ? (
          <Link to={detailHref} style={{ color: "inherit", textDecoration: "none" }}>{title}</Link>
        ) : title}
      </h3>

      <div className={styles.specs}>
        <div className={styles.priceBox}>
          <span className={styles.priceLabel}>Purchase price</span>
          <span className={styles.priceValue}>{purchasePrice}</span>
        </div>

        <dl className={styles.techList}>
          <div className={styles.techRow}>
            <dt className={styles.techLabel}>Mileage</dt>
            <dd className={styles.techValue}>{mileage}</dd>
          </div>
          <div className={styles.techRow}>
            <dt className={styles.techLabel}>Engine</dt>
            <dd className={styles.techValue}>{engine}</dd>
          </div>
          <div className={styles.techRow}>
            <dt className={styles.techLabel}>Drive</dt>
            <dd className={styles.techValue}>{drive}</dd>
          </div>
        </dl>
      </div>

      <div className={styles.footer}>
        <div className={styles.finalCostBlock}>
          <span className={styles.finalCostLabel}>Estimated final cost to Bulgaria:</span>
          <span className={styles.finalCostValue}>{finalCost}</span>
        </div>
        {detailHref ? (
          <Link to={detailHref} className={styles.ctaBtn} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}>
            {ctaLabel}
          </Link>
        ) : (
          <button type="button" className={styles.ctaBtn}>{ctaLabel}</button>
        )}
      </div>
    </article>
  );
};

export default Card1;
