import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import styles from "./turnkey-banner1.module.css";

const API_URL = process.env.REACT_APP_BACKEND_URL || "";
const SITE_INFO_CACHE = "__bibi_site_info_promise__";

function fetchSiteInfo() {
  if (typeof window === "undefined") return Promise.resolve(null);
  if (!window[SITE_INFO_CACHE]) {
    window[SITE_INFO_CACHE] = axios
      .get(`${API_URL}/api/site-info`)
      .then((r) => r.data)
      .catch(() => null);
  }
  return window[SITE_INFO_CACHE];
}

const DEFAULT_VIBER_URL = "viber://chat?number=%2B359875313158";

/**
 * "How to buy a turnkey car" — pixel-perfect Figma rebuild.
 *
 *   Background : aerial road photo (image-57@2x, 1918 × 2379)
 *   Layout     : every element is absolutely positioned over the photo
 *                so the title sits over the car's trunk, the USA / Korea
 *                labels flank the car body, the partner logos sit below
 *                the car on the road, the steps are arranged in a
 *                zig-zag in the lower half, and the CTA + Viber pill are
 *                at the very bottom under the linear-gradient fade.
 *
 *   Sizes (Figma):
 *     PICK UP A CAR  → 380 × 45
 *     Join card      → 394 × 118  (clickable → Viber URL from admin)
 */
const TurnkeyBanner1 = ({ className = "" }) => {
  const [viberUrl, setViberUrl] = useState(DEFAULT_VIBER_URL);

  useEffect(() => {
    let cancelled = false;
    fetchSiteInfo().then((info) => {
      if (cancelled || !info) return;
      const url = info?.footer?.viber_community?.url;
      if (url && typeof url === "string") setViberUrl(url);
    });
    return () => { cancelled = true; };
  }, []);

  return (
    <section className={[styles.section, className].join(" ")}>
      {/* Aerial road background — full-bleed, native orientation */}
      <img
        className={styles.bgRoad}
        src="/figma/image-57@2x.webp"
        alt=""
        aria-hidden="true"
      />
      <div className={styles.bgTop}    aria-hidden="true" />
      <div className={styles.bgScrim}  aria-hidden="true" />

      <div className={styles.inner}>
        {/* ── Title ─────────────────────────────────────────────────── */}
        <h1 className={styles.title}>
          How to buy
          <br />
          a turnkey car
        </h1>

        {/* ── USA · Korea source labels ─────────────────────────────── */}
        <div className={[styles.source, styles.sourceUSA].join(" ")}>
          <span className={styles.sourceFrom}>from</span>
          <div className={styles.sourceRow}>
            <span className={styles.dot} />
            <span className={styles.sourceName}>the USA</span>
          </div>
        </div>

        <div className={[styles.source, styles.sourceKorea].join(" ")}>
          <span className={styles.sourceFrom}>from</span>
          <div className={styles.sourceRow}>
            <span className={styles.dot} />
            <span className={styles.sourceName}>Korea</span>
          </div>
        </div>

        {/* ── Partner logos ─────────────────────────────────────────── */}
        <div className={styles.logos}>
          <div className={styles.logosRow}>
            <img
              src="/figma/image-65@2x.webp"
              alt="Copart"
              className={styles.logoCopart}
            />
            <img
              src="/figma/image-71@2x.webp"
              alt="CARFAX"
              className={styles.logoCarfax}
            />
            <img
              src="/figma/image-76@2x.webp"
              alt="Manheim"
              className={styles.logoManheim}
            />
          </div>
          <div className={styles.logosRow}>
            <img
              src="/figma/image-73@2x.webp"
              alt="IAA — Insurance Auto Auctions"
              className={styles.logoIaa}
            />
            <img
              src="/figma/image-81@2x.webp"
              alt="Encar"
              className={styles.logoEncar}
            />
          </div>
        </div>

        {/* ── Steps (1-5) zig-zag ───────────────────────────────────── */}
        <div className={[styles.step, styles.step1].join(" ")}>
          <span className={styles.stepNum}>1/</span>
          <p className={styles.stepText}>We send an application</p>
        </div>

        <div className={[styles.step, styles.step2].join(" ")}>
          <span className={styles.stepNum}>2/</span>
          <p className={styles.stepText}>We discuss the details</p>
        </div>

        <div className={[styles.step, styles.step3].join(" ")}>
          <span className={styles.stepNum}>3/</span>
          <p className={styles.stepText}>We look for a car</p>
        </div>

        <div className={[styles.step, styles.step4].join(" ")}>
          <span className={styles.stepNum}>4/</span>
          <p className={styles.stepText}>
            We buy and deliver to
            <br />a European port
          </p>
        </div>

        <div className={[styles.step, styles.step5].join(" ")}>
          <span className={styles.stepNum}>5/</span>
          <p className={styles.stepText}>
            We clear customs and
            <br />deliver the car to Bulgaria
          </p>
        </div>

        {/* ── PICK UP A CAR button ──────────────────────────────────── */}
        <Link to="/calculator" className={styles.pickup}>
          PICK UP A CAR
        </Link>

        {/* ── Join our group / Viber pill ───────────────────────────── */}
        <a
          href={viberUrl}
          className={styles.joinCard}
          target="_blank"
          rel="noopener noreferrer"
          data-testid="turnkey-join-viber"
        >
          <span className={styles.joinText}>
            Join our group and
            <br />
            get the hottest offers
          </span>
          <img
            className={styles.joinIcon}
            src="/figma/basil-viber-outline.svg"
            alt=""
            aria-hidden="true"
          />
        </a>
      </div>
    </section>
  );
};

export default TurnkeyBanner1;
