import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Button1 from './Button1';
import styles from './CarCard.module.css';

/**
 * "Similar car" carousel card. Now fully wired to real BidMotors data via
 * the `data` prop (passed from <SimilarCars />), and clickable: each card
 * — including its photo, title and "More details" CTA — links to
 * `/cars/<VIN>`, the canonical SingleCarPage. No more dead onClicks, no
 * more hard-coded "Lucid Motors Air Pure" placeholders.
 */

const FALLBACK_IMG = '/single-car/image-151@2x.png';

const titleCase = (s) =>
  String(s || '')
    .toLowerCase()
    .replace(/\b([a-z])/g, (m) => m.toUpperCase())
    .replace(/\bUsa\b/g, 'USA');

const fmtTitle = (it) => {
  if (it?.title) {
    const parts = it.title.split(/\s+/);
    const y = /^\d{4}$/.test(parts[0]) ? parts[0] : null;
    const rest = y ? parts.slice(1).join(' ') : it.title;
    return y ? `${y} ${titleCase(rest)}` : titleCase(rest);
  }
  return [it?.year, titleCase(it?.make || ''), titleCase(it?.model || '')].filter(Boolean).join(' ');
};

const fmtKm = (n, unit) => {
  if (!n) return '—';
  const num = typeof n === 'number' ? n : parseInt(String(n).replace(/[^\d]/g, ''), 10);
  if (!Number.isFinite(num) || num <= 0) return '—';
  const u = (unit || 'km').toLowerCase() === 'mi' ? 'mi' : 'km';
  return `${num.toLocaleString('en-US')} ${u}`;
};

const fmtEngine = (it) => {
  const e = it?.engine;
  if (!e) return it?.fuel_type ? titleCase(it.fuel_type) : '—';
  const m = String(e).match(/(\d+(?:[.,]\d+)?)\s*l/i);
  const base = m ? `${m[1].replace(',', '.')}L` : String(e);
  const fuel = it?.fuel_type ? titleCase(it.fuel_type) : '';
  return fuel ? `${base} / ${fuel}` : base;
};

const fmtDrive = (it) => {
  const d = it?.drivetrain || '';
  const s = String(d).toLowerCase();
  if (s.includes('front')) return 'FWD';
  if (s.includes('rear')) return 'RWD';
  if (s.includes('all-wheel') || s.includes('all wheel')) return 'AWD';
  if (s.includes('4')) return '4WD';
  return d || '—';
};

const fmtPriceRange = (it) => {
  const num =
    typeof it?.price === 'number'
      ? it.price
      : parseFloat(String(it?.price || '').replace(/[^\d.]/g, ''));
  if (!Number.isFinite(num) || num <= 0) return 'On request';
  const cur = (it?.currency || 'EUR').toUpperCase();
  const sym = cur === 'EUR' ? '€' : cur === 'USD' ? '$' : `${cur} `;
  return `${sym}${Math.round(num).toLocaleString('en-US')}`;
};

const fmtFinalRange = (it) => {
  const num =
    typeof it?.price === 'number'
      ? it.price
      : parseFloat(String(it?.price || '').replace(/[^\d.]/g, ''));
  if (!Number.isFinite(num) || num <= 0) return 'Get a quote';
  // Rough turn-key estimate: vehicle + ~€2,700 logistics & customs floor (typical sedan
  // import to Bulgaria) + 20 % VAT. Same heuristic shows on the main car page when the
  // calculator's exact value hasn't loaded yet — keeps the UX consistent.
  const low = Math.round(num + 2700 + num * 0.2);
  const high = Math.round(low * 1.18);
  return `€${low.toLocaleString('en-US')}-${high.toLocaleString('en-US')}`;
};

const parseSaleDate = (s) => {
  if (!s) return null;
  const str = String(s).trim();
  const iso = Date.parse(str);
  if (!Number.isNaN(iso) && /\d{4}-\d{2}-\d{2}/.test(str)) return new Date(iso);
  const m = str.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})(?:\s+(\d{1,2}):(\d{2}))?/);
  if (m) {
    const [, d, mo, y, hh, mm] = m;
    return new Date(Date.UTC(+y, +mo - 1, +d, hh ? +hh - 2 : 21, mm ? +mm : 59));
  }
  return null;
};

const fmtRemaining = (ms) => {
  if (ms <= 0) return 'Closed';
  const totalSec = Math.floor(ms / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h ${mins}m`;
  return `${hours}h ${mins}m ${totalSec % 60}s`;
};

const CarCard = ({ className = '', data }) => {
  const vin = data?.vin;
  const detailHref = vin ? `/cars/${encodeURIComponent(vin)}` : null;

  const title = useMemo(() => fmtTitle(data), [data]);
  const image = data?.image || FALLBACK_IMG;
  const mileage = fmtKm(data?.odometer, data?.odometer_unit);
  const engine = fmtEngine(data);
  const drive = fmtDrive(data);
  const purchasePrice = fmtPriceRange(data);
  const estimatedFinalCost = fmtFinalRange(data);
  const tradingDate = data?.sale_date
    ? `Trading date - ${data.sale_date}`
    : data?.auction_name
      ? `Auction - ${data.auction_name}`
      : 'Auction TBA';

  // Live countdown derived from sale_date.
  const saleAt = useMemo(() => parseSaleDate(data?.sale_date), [data?.sale_date]);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!saleAt) return undefined;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [saleAt]);
  const timer = saleAt ? fmtRemaining(saleAt.getTime() - now) : 'TBA';

  const inner = (
    <div className={styles.buttonParent}>
      {/* Top: image + Trading date strip */}
      <div className={styles.imageWrapper}>
        <div className={styles.imageInner}>
          <img
            className={styles.image15Icon}
            width={517}
            height={388}
            alt={title}
            src={image}
            loading="lazy"
            onError={(e) => { e.currentTarget.src = FALLBACK_IMG; }}
          />
          <div className={styles.tradingDetails}>
            <div className={styles.tradingDate}>{tradingDate}</div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className={styles.body}>
        {/* Timer + frame icons */}
        <div className={styles.timerRow}>
          <div className={styles.iconoirclockParent}>
            <img
              className={styles.iconoirclock}
              width={24}
              height={24}
              alt=""
              src="/single-car/iconoir-clock.svg"
            />
            <div className={styles.d4h35m}>{timer}</div>
          </div>
          <div className={styles.frameIcons}>
            <img
              className={styles.frameIcon}
              width={32}
              height={32}
              alt=""
              src="/single-car/Frame-1707479182.svg"
            />
            <img
              className={styles.frameIcon}
              width={32}
              height={32}
              alt=""
              src="/single-car/Frame-1707479176.svg"
            />
          </div>
        </div>

        {/* Title + details */}
        <div className={styles.titleBlock}>
          <h3 className={styles.lucidMotorsAir}>{title}</h3>
          <div className={styles.detailsBlock}>
            <div className={styles.row1}>
              <div className={styles.purchasePriceParent}>
                <div className={styles.purchasePrice}>Purchase price</div>
                <div className={styles.priceSquaresParent}>
                  <div className={styles.priceSquares} />
                  <h3 className={styles.h3}>{purchasePrice}</h3>
                </div>
              </div>
              <div className={styles.mileageEngineBlock}>
                <div className={styles.labelsCol}>
                  <div className={styles.mileage}>Mileage</div>
                  <div className={styles.engine}>engine</div>
                </div>
                <div className={styles.valuesCol}>
                  <div className={styles.km}>{mileage}</div>
                  <div className={styles.lPetrol}>{engine}</div>
                </div>
              </div>
            </div>
            <div className={styles.row2}>
              <div className={styles.driveParent}>
                <div className={styles.drive}>drive</div>
                <div className={styles.allWheel}>{drive}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom: Estimated final cost + CTA */}
        <div className={styles.footerRow}>
          <div className={styles.estimatedFinalCostToBulgarParent}>
            <div className={styles.estimatedFinalCost}>Estimated final cost to Bulgaria:</div>
            <div className={styles.divFinalCost}>{estimatedFinalCost}</div>
          </div>
          <Button1
            property1="Default"
            cONTACTUS="More details"
            showBUTTON
            bUTTONWidth="171px"
            bUTTONBorder="unset"
          />
        </div>
      </div>
    </div>
  );

  if (!detailHref) {
    return <section className={[styles.card, className].join(' ')}>{inner}</section>;
  }

  return (
    <Link
      to={detailHref}
      className={[styles.card, className].join(' ')}
      style={{ color: 'inherit', textDecoration: 'none', cursor: 'pointer' }}
      data-testid={`similar-card-${vin}`}
    >
      {inner}
    </Link>
  );
};

export default CarCard;
