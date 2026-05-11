/**
 * VehicleDeals1 — header for the "Top vehicles deals of the week".
 *
 * Pixel-aligned to the Figma reference shared by the user
 * (Figma → Dev Mode inspection):
 *
 *   ┌──────────────────────────── full width ────────────────────────┐
 *   │                                                                  │
 *   │                        TOP VEHICLES DEALS                       │  ← centered
 *   │                                                                  │     (gap-28
 *   │                            OF THE WEEK                          │      between lines)
 *   │                                                                  │
 *   │                                                                  │  ← big gap
 *   │                                                                  │
 *   │                                ⌜ THOUSANDS OF LISTINGS.  ⌝     │
 *   │                                │ ONLY THE BEST MAKE THE   │     │  ← right-edge,
 *   │                                │ UPDATED WEEKLY           │     │     aligned with
 *   │                                ⌞                          ⌟     │     card grid
 *   └──────────────────────────────────────────────────────────────────┘
 *
 * Brackets: 3 px stroke, color **#555452** (Figma Vector layer),
 * 13 × 76 px native size; vertically stretched to wrap the tagline.
 */
import styles from "./vehicle-deals1.module.css";

const Bracket = ({ side = "left" }) => (
  <svg
    className={side === "left" ? styles.bracket : styles.bracketRight}
    viewBox="0 0 17 80"
    preserveAspectRatio="none"
    aria-hidden="true"
    focusable="false"
  >
    {/* "[" path — short top, long vertical, short bottom (Figma Vector.svg). */}
    <path
      d="M14.5264 1.5H1.5V77.5264H14.5264"
      stroke="#555452"
      strokeWidth="3"
      strokeLinecap="square"
      fill="none"
      vectorEffect="non-scaling-stroke"
    />
  </svg>
);

const VehicleDeals1 = ({ className = "" }) => {
  return (
    <section className={[styles.vehicleDeals, className].join(" ")}>
      {/* Centered title — both lines stacked with a tight 28 px gap */}
      <div className={styles.titleBlock}>
        <h2 className={styles.titleOrange}>Top vehicles deals</h2>
        <h2 className={styles.titleWhite}>of the week</h2>
      </div>

      {/* Bracketed tagline — right-aligned with the cards grid below.
          The amber accent rotates across the three lines on a 15s loop
          (5s per line) so the section feels "alive" without any layout
          jump — see vehicle-deals1.module.css `bibiAccentCycle`. */}
      <div className={styles.taglineWrap}>
        <div className={styles.tagline}>
          <Bracket side="left" />
          <p className={styles.taglineText}>
            <span className={`${styles.taglineLine} ${styles.taglineLine1}`}>Thousands of listings.</span>
            <span className={`${styles.taglineLine} ${styles.taglineLine2}`}>Only the best make the cut.</span>
            <span className={`${styles.taglineLine} ${styles.taglineLine3}`}>Updated weekly</span>
          </p>
          <Bracket side="right" />
        </div>
      </div>
    </section>
  );
};

export default VehicleDeals1;
