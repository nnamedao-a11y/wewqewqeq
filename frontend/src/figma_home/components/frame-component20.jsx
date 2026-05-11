/**
 * FrameComponent20 — "Top vehicles deals" filter row.
 *
 *   [🚗][🏍][🚐][🚛]   |  [10-15K] [15-25K] [30-50K]              PROPOSALS - 46
 *
 * Two segmented controls (vehicle type and price tier) and a
 * right-aligned proposals counter.  Active state is filled amber.
 */
import { useState } from "react";
import { Car, Motorcycle, Van, Truck } from "@phosphor-icons/react";
import styles from "./frame-component20.module.css";

const VEHICLE_TYPES = [
  { id: "car",   Icon: Car,        alt: "Car" },
  { id: "bike",  Icon: Motorcycle, alt: "Motorbike" },
  { id: "van",   Icon: Van,        alt: "Van" },
  { id: "truck", Icon: Truck,      alt: "Truck" },
];
const PRICE_TIERS = ["10-15K", "15-25K", "30-50K"];

const FrameComponent20 = ({ className = "" }) => {
  const [vehicle, setVehicle] = useState("car");
  const [tier, setTier] = useState("10-15K");

  return (
    <section className={[styles.frameWrapper, className].join(" ")}>
      <div className={styles.frameParent}>
        <div className={styles.frameGroup}>
          {/* Vehicle type segmented control */}
          <div className={styles.segment} role="tablist" aria-label="Vehicle type">
            {VEHICLE_TYPES.map(({ id, Icon, alt }) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={vehicle === id}
                aria-label={alt}
                className={`${styles.segmentBtn} ${vehicle === id ? styles.segmentBtnActive : ""}`}
                onClick={() => setVehicle(id)}
              >
                <Icon size={24} weight="regular" className={styles.segmentIcon} />
              </button>
            ))}
          </div>

          {/* Price tier segmented control */}
          <div className={styles.segment} role="tablist" aria-label="Price range">
            {PRICE_TIERS.map((p) => (
              <button
                key={p}
                type="button"
                role="tab"
                aria-selected={tier === p}
                className={`${styles.tierBtn} ${tier === p ? styles.tierBtnActive : ""}`}
                onClick={() => setTier(p)}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.proposalsBlock}>
          <div className={styles.proposals}>proposals - 46</div>
        </div>
      </div>
    </section>
  );
};

export default FrameComponent20;
