import React from 'react';
import styles from './NavigationHeader.module.css';

/**
 * Breadcrumb + page title for the Single Car page.
 *
 * Pixel spec (May 2026):
 *   • 52 px gap from header bottom → breadcrumb top
 *   • 100 px left & right padding
 *   • 72 px gap breadcrumb → title
 *   • 80 px Mazzard title (line-height 99.9%)
 *   • Right side: 2 icons 24×24, gap 24, right edge = padding-right
 *   • 150 px gap from icon-row bottom → image-grid top
 *
 * NOTE: the URL bypasses /catalog (cards link to /cars/:vin), but the
 * breadcrumb still displays the "CATALOG" segment as a label per the
 * Figma reference — it's purely a visual breadcrumb, not a link.
 */
const NavigationHeader = ({
  className = '',
  breadcrumb = ['Home', 'Catalog'],
  title = '',
  vin = '',
  loading = false,
}) => {
  const displayTitle = loading ? 'Loading…' : (title || 'Vehicle');
  return (
    <section className={[styles.navigationHeader, className].join(' ')}>
      <div className={styles.headerInner}>
        <h3 className={styles.breadcrumb}>
          <span>{breadcrumb[0]} /</span>
          <span className={styles.span}>{' '}</span>
          <span>{`${breadcrumb[1]}/ `}</span>
          <span className={styles.lucidMotorsAir}>{displayTitle}</span>
        </h3>

        <div className={styles.titleRow}>
          <h1 className={styles.title}>{displayTitle}</h1>
          <div className={styles.iconRow}>
            <button type="button" className={styles.iconBtn} aria-label="Compare car" data-vin={vin}>
              <img
                className={styles.iconImg}
                width={24}
                height={24}
                alt=""
                src="/single-car/Navigation-Spacing.svg"
              />
            </button>
            <button type="button" className={styles.iconBtn} aria-label="Add to favorites" data-vin={vin}>
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
};

export default NavigationHeader;
