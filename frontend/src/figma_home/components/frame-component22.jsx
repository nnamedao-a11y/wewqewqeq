import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import VinSearchDropdown from "../../components/public/VinSearchDropdown";
import styles from "./frame-component22.module.css";

/**
 * "Calculate a car yourself" welcome-page block.
 *
 * The VIN/lot search input now has a typeahead dropdown identical to the one
 * in the public header: as the user types ≥ 2 chars, we hit
 * `/api/public/search/suggest` (BidMotors live + stale fallback) and render
 * mini-cards. Clicking any card navigates straight to /cars/<VIN> — the
 * canonical SingleCarPage. Submitting the form without picking a suggestion
 * falls back to /vin/<query> for the full lookup chain. Empty input still
 * routes to /calculator as before.
 */
const FrameComponent22 = ({ className = "" }) => {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const v = q.trim();
    if (!v) {
      navigate("/calculator");
      return;
    }
    const clean = v.toUpperCase().replace(/[\s-]/g, "");
    setOpen(false);
    navigate(`/vin/${encodeURIComponent(clean)}`);
  };

  return (
    <section className={[styles.rectangleParent, className].join(" ")}>
      <div className={styles.calculate}>
        <h2 className={styles.calculateACar}>
          Calculate a car yourself
          <br />
          <span className={styles.withAPrice}>with a price guarantee</span>
        </h2>

        <div className={styles.calcGrid}>
          <div className={styles.imageBox}>
            <img
              className={styles.image93Icon}
              loading="lazy"
              alt="Ford pickup truck"
              src="/figma/image-93@2x.webp"
            />
          </div>

          <div className={styles.calcRight}>
            <h3 className={styles.fromTheUsaContainer}>
              From the USA and Korea
            </h3>

            <form
              className={styles.searchForm}
              onSubmit={handleSubmit}
              role="search"
              data-testid="welcome-vin-search"
            >
              <div className={styles.inputWrapper} style={{ position: "relative" }}>
                <img
                  className={styles.boxiconssearch}
                  alt=""
                  src="/figma/boxicons-search.svg"
                />
                <input
                  className={styles.searchByVin}
                  placeholder="Search by VIN or lot number"
                  type="text"
                  value={q}
                  onChange={(e) => { setQ(e.target.value); setOpen(true); }}
                  onFocus={() => setOpen(true)}
                  autoComplete="off"
                  aria-label="Search by VIN or lot number"
                  data-testid="welcome-vin-input"
                />
                <VinSearchDropdown
                  query={q}
                  open={open}
                  onClose={() => setOpen(false)}
                  align="left"
                  variant="dark"
                />
              </div>

              <button type="submit" className={styles.calcCta}>
                CALCULATE
              </button>
            </form>

            <Link to="/catalog" className={styles.allCatalog}>
              all catalog +
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FrameComponent22;
