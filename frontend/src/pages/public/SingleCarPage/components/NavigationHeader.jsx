import React from 'react';
import styles from './NavigationHeader.module.css';

/**
 * Breadcrumb + page title for the Single Car page.
 *
 * Pixel spec (May 2026):
 *   \u2022 52 px gap from header bottom \u2192 breadcrumb top
 *   \u2022 100 px left & right padding
 *   \u2022 72 px gap breadcrumb \u2192 title
 *   \u2022 80 px Mazzard title (line-height 99.9%)
 *   \u2022 Right side: 2 icons 24\u00d724, gap 24, right edge = padding-right
 *   \u2022 150 px gap from icon-row bottom \u2192 image-grid top (set as
 *     `padding-bottom` of <NavigationHeader>, see CSS module)
 */
const NavigationHeader = ({
  className = '',
  breadcrumb = ['home', 'Catalog'],
  title = '2025 Lucid Motors Air Pure',
}) => (
  <section className={[styles.navigationHeader, className].join(' ')}>
    <div className={styles.headerInner}>
      {/* Breadcrumb: home / Catalog / <car-title>
       *
       * NOTE: the URL bypasses /catalog (cards link to /cars/:vin), but the
       * breadcrumb still displays the "CATALOG" segment as a label per the
       * Figma reference (May 2026) — it's purely a visual breadcrumb, not a
       * link to the catalog listing page.
       */}
      <h3 className={styles.breadcrumb}>
        <span>{breadcrumb[0]} /</span>
        <span className={styles.span}>{` `}</span>
        <span>{`${breadcrumb[1]}/ `}</span>
        <span className={styles.lucidMotorsAir}>{title}</span>
      </h3>

      {/* Title + favorite/compare icons */}
      <div className={styles.titleRow}>
        <h1 className={styles.title}>{title}</h1>
        <div className={styles.iconRow}>
          <button type="button" className={styles.iconBtn} aria-label="Compare car">
            <img
              className={styles.iconImg}
              width={24}
              height={24}
              alt=""
              src="/single-car/Navigation-Spacing.svg"
            />
          </button>
          <button type="button" className={styles.iconBtn} aria-label="Add to favorites">
            <img
              className={styles.iconImg}
              width={24}
              height={24}
              alt=""
              src="/single-car/Navigation-Spacing.svg"
            />
          </button>
        </div>
      </div>
    </div>
  </section>
);

export default NavigationHeader;
