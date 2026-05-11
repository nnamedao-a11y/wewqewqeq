import React from 'react';
import Button1 from './Button1';
import styles from './CarCard.module.css';

/**
 * "Similar car" carousel card. Port of `components/card1.tsx` from the
 * Figma export, simplified — the original `Card2` had a duplicate layout
 * with awkward absolute positioning; since the design shows three
 * visually-identical cards we use a single component.
 */
const CarCard = ({
  className = '',
  image = '/single-car/image-151@2x.png',
  tradingDate = 'Trading date - 34.13.2027',
  timer = '1 d: 4h: 35m',
  title = '2025 Lucid Motors Air Pure',
  purchasePriceRange = '€20,000-30,000',
  mileage = '65 900 km',
  engine = '4.6l / petrol',
  drive = 'all-wheel',
  estimatedFinalCost = '€50,000-70,000',
  onMoreDetailsClick = () => {},
}) => {
  return (
    <section className={[styles.card, className].join(' ')}>
      <div className={styles.buttonParent}>
        {/* Top: image + Trading date strip */}
        <div className={styles.imageWrapper}>
          <div className={styles.imageInner}>
            <img
              className={styles.image15Icon}
              width={517}
              height={388}
              alt=""
              src={image}
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
              {/* Row 1: Purchase price + Mileage/Engine */}
              <div className={styles.row1}>
                <div className={styles.purchasePriceParent}>
                  <div className={styles.purchasePrice}>Purchase price</div>
                  <div className={styles.priceSquaresParent}>
                    <div className={styles.priceSquares} />
                    <h3 className={styles.h3}>{purchasePriceRange}</h3>
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
              {/* Row 2: Drive */}
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
              onClick={onMoreDetailsClick}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default CarCard;
