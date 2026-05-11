import { Link } from "react-router-dom";
import styles from "./frame-component22.module.css";

const FrameComponent22 = ({ className = "" }) => {
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
              onSubmit={(e) => {
                e.preventDefault();
                const v = (e.currentTarget.querySelector("input")?.value || "").trim();
                if (v) {
                  const clean = v.toUpperCase().replace(/[\s-]/g, "");
                  window.location.href = `/vin/${encodeURIComponent(clean)}`;
                } else {
                  window.location.href = "/calculator";
                }
              }}
            >
              <div className={styles.inputWrapper}>
                <img
                  className={styles.boxiconssearch}
                  alt=""
                  src="/figma/boxicons-search.svg"
                />
                <input
                  className={styles.searchByVin}
                  placeholder="Search by VIN or lot number"
                  type="text"
                  aria-label="Search by VIN or lot number"
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
