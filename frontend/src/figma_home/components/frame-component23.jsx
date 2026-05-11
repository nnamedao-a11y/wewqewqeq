import { Link } from "react-router-dom";
import styles from "./frame-component23.module.css";

/**
 * "HOW WE WORK" section — pixel-perfect rebuild of the Figma frame.
 *
 *   ┌─────────────── #000 black background ────────────────┐
 *   │                                                       │
 *   │       HOW WE WORK              [ WE WORK FOR EACH    │
 *   │       (orange, H Bold)            CLIENT             │
 *   │                                   DEPENDING ON THE   │
 *   │                                   BUDGET ]           │
 *   │                                                       │
 *   │  ┌─[1]──────┐  ┌─[2] popular ─┐  ┌─[3]──────────┐  │
 *   │  │ Standard │  │ Turnkey      │  │ Sourcing +   │  │
 *   │  │  …       │  │ (yellow bg)  │  │ Delivery +   │  │
 *   │  │          │  │  …           │  │ Support      │  │
 *   │  └──────────┘  └──────────────┘  └──────────────┘  │
 *   │                                                       │
 *   │              [ Have a question?                       │
 *   │                 Contact us                            │
 *   │                 +359 875 313 158                      │
 *   │                 +359 897 884 804 ]                    │
 *   └───────────────────────────────────────────────────────┘
 */

// Square-bracket label `[ … ]` with 3px #555452 brackets — used for
// the [1] [2] [3] tile counters and the "WE WORK FOR EACH CLIENT" title.
const BracketLabel = ({ children, color = "var(--color-dimgray-200)", className = "" }) => (
  <span
    className={[styles.bracketLabel, className].join(" ")}
    style={{ "--bracket-color": color }}
  >
    <span className={styles.bracketChild}>{children}</span>
  </span>
);

const FrameComponent23 = ({ className = "" }) => {
  return (
    <section className={[styles.howWeWorkSection, className].join(" ")}>
      <div className={styles.inner}>
        {/* ── Top: title + tag ───────────────────────────────────────── */}
        <header className={styles.topRow}>
          <h2 className={styles.howWeWork}>How we work</h2>

          <div className={styles.eachClientTag}>
            <BracketLabel className={styles.eachClientBrackets}>
              <span className={styles.eachClientStack}>
                <span className={styles.eachClientYellow}>
                  WE WORK FOR EACH CLIENT
                </span>
                <span className={styles.eachClientWhite}>
                  DEPENDING ON THE BUDGET
                </span>
              </span>
            </BracketLabel>
          </div>
        </header>

        {/* ── Cards row ──────────────────────────────────────────────── */}
        <div className={styles.cardsRow}>
          {/* ── Card 1 — Standard ───────────────────────────────────── */}
          <article className={[styles.card, styles.cardDark].join(" ")}>
            <div className={styles.cardTop}>
              <BracketLabel>
                <span className={styles.tileNum}>1</span>
              </BracketLabel>
            </div>

            <h3 className={[styles.cardTitle, styles.titleOrange].join(" ")}>
              Standard
            </h3>

            <p className={[styles.cardDesc, styles.descWhite].join(" ")}>
              Sourcing, inspection, bidding, purchase, and delivery to Bulgaria.
            </p>

            <p className={[styles.cardCta, styles.ctaOrange].join(" ")}>
              From there, you handle
              <br />
              everything yourself.
            </p>
          </article>

          {/* ── Card 2 — Turnkey (yellow / popular) ─────────────────── */}
          <article className={[styles.card, styles.cardYellow].join(" ")}>
            <div className={styles.cardTop}>
              <BracketLabel color="#040103">
                <span className={styles.tileNum}>2</span>
              </BracketLabel>
              <button type="button" className={styles.popularPill}>
                popular
              </button>
            </div>

            <h3 className={[styles.cardTitle, styles.titleBlack].join(" ")}>
              Turnkey
            </h3>

            <p className={[styles.cardDesc, styles.descBlack].join(" ")}>
              Full-service with zero involvement required: sourcing, inspection,
              purchase, delivery, adaptation, technical inspection, and
              registration.
            </p>

            <p className={[styles.cardCta, styles.ctaBlack].join(" ")}>
              You simply pick up
              <br />
              a ready-to-drive car.
            </p>
          </article>

          {/* ── Card 3 — Sourcing + Delivery + Support ──────────────── */}
          <article className={[styles.card, styles.cardDark].join(" ")}>
            <div className={styles.cardTop}>
              <BracketLabel>
                <span className={styles.tileNum}>3</span>
              </BracketLabel>
            </div>

            <h3 className={[styles.cardTitle, styles.titleOrange].join(" ")}>
              Sourcing + Delivery
              <br />
              + Support
            </h3>

            <p className={[styles.cardDesc, styles.descWhite].join(" ")}>
              Sourcing, inspection, purchase, and delivery.
            </p>

            <p className={[styles.cardCta, styles.ctaOrange].join(" ")}>
              You handle registration - we
              <br />
              connect you with trusted
              <br />
              service partners.
            </p>
          </article>
        </div>

        {/* ── Bottom: Have a question card ───────────────────────────── */}
        <div className={styles.questionWrap}>
          <div className={styles.questionCard}>
            <h3 className={styles.questionTitle}>
              Have a question?
              <br />
              Contact us
            </h3>

            <div className={styles.questionPhones}>
              <a href="tel:+359875313158" className={styles.questionPhone}>
                +359 875 313 158
              </a>
              <a href="tel:+359897884804" className={styles.questionPhone}>
                +359 897 884 804
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FrameComponent23;
