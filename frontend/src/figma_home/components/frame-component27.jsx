import { useNavigate } from "react-router-dom";
import BUTTON1 from "./b-u-t-t-o-n1";
import styles from "./frame-component27.module.css";

/**
 * FrameComponent27 — "Want to drive your dream car?" hero block.
 *
 * Figma layout panel (audited):
 *   • Section size:  1921 × 1041 px (Top: 16709, Left: -3.61)
 *   • Background:    /figma/young-woman-with-salesman-carshowroom-1@2x.png
 *                    (CLEAN photo of couple in car interior, full-bleed).
 *                    NOTE: do NOT use dream-car-bg.png — it is a flattened
 *                    Figma render that already contains the BIBI logo,
 *                    heading, sub-copy and CONTACT US button baked into
 *                    the bitmap.  Using it produced visible duplicates
 *                    of every text element + the CTA button because the
 *                    React tree below also renders them.
 *   • BIBI logo:     top-left corner (small overlay)
 *   • Heading:       "WANT TO DRIVE / YOUR DREAM CAR?"   H Bold 100 px
 *                    line 1 → orange #FEAE00, line 2 → white
 *   • Right copy:    "Fill out the application / and we will find /
 *                     the best offer for you"           H Bold 32 px white
 *   • Button:        CONTACT US — H Medium 14 px, bg #FEAE00
 *                    Mirrors header "CONTACT US" behaviour:
 *                    navigates to /contacts#phone so the page scrolls
 *                    to the contact phone block.
 *
 * The image is rendered as a CSS `background-image` on the section so the
 * heading + form content sits ON TOP of it (z-index stacking).
 */
const FrameComponent27 = ({ className = "" }) => {
  const navigate = useNavigate();

  // Same logic as Header1 → handleContactClick.
  // Goes to /contacts and scrolls to id="phone" inside ContactsPage.
  const handleContactClick = () => navigate("/contacts#phone");

  return (
    <section
      className={[styles.heroSection, className].join(" ")}
      style={{ backgroundImage: "url(/figma/young-woman-with-salesman-carshowroom-1@2x.webp)" }}
    >
      {/* Top-left BIBI logo overlay */}
      <img
        className={styles.logo}
        loading="lazy"
        width={264}
        height={90}
        alt="BIBI Cars"
        src="/figma/BiBi-logo-02-1.svg"
      />

      {/* Bottom row: heading (left) + form (right) */}
      <div className={styles.bottomRow}>
        <h1 className={styles.heading}>
          <span className={styles.headingOrange}>Want to drive</span>
          <br />
          <span className={styles.headingWhite}>your dream car?</span>
        </h1>

        <div className={styles.formColumn}>
          <h2 className={styles.subcopy}>
            Fill out the application
            <br />
            and we will find
            <br />
            the best offer for you
          </h2>

          <BUTTON1
            property1="Default"
            cONTACTUS="CONTACT US"
            showBUTTON
            bUTTONBackgroundColor="#FEAE00"
            bUTTONWidth="380px"
            bUTTONBorder="none"
            bUTTONAlignSelf="unset"
            cONTACTUSColor="#000"
            cONTACTUSTextTransform="uppercase"
            onClick={handleContactClick}
            data-testid="dream-car-contact-us"
          />
        </div>
      </div>
    </section>
  );
};

export default FrameComponent27;
