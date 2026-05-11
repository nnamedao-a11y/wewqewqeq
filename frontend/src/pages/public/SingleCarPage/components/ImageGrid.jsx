import React from 'react';
import Button1 from './Button1';
import styles from './ImageGrid.module.css';

/**
 * Single Car page \u2014 photo grid (LEFT) + info card (RIGHT).
 *
 * Pixel & typography spec (May 2026):
 *   \u2022 LEFT  \u2014 hero 848\u00d7636 + 2 rows of 4 thumbs (203\u00d7152, gap 12)
 *   \u2022 RIGHT \u2014 info card 848\u00d7964
 *   \u2022 TRADED button     : 156\u00d734, Mazzard 14 SemiBold
 *   \u2022 Section titles    : Mazzard 18 SemiBold
 *   \u2022 Field labels      : Mazzard 14 Medium  white
 *   \u2022 Field values      : Mazzard 14 Bold    orange
 *   \u2022 Description text  : Mazzard 14 Regular #949494
 *   \u2022 CTA button        : 327\u00d745, Mazzard 14 Medium
 */
const ImageGrid = ({
  className = '',
  hero = '/single-car/image-15@2x.png',
  thumbsRow1 = [
    '/single-car/image-16@2x.png',
    '/single-car/image-17@2x.png',
    '/single-car/image-18@2x.png',
    '/single-car/image-19@2x.png',
  ],
  thumbsRow2 = [
    '/single-car/image-161@2x.png',
    '/single-car/image-171@2x.png',
    '/single-car/image-181@2x.png',
  ],
  car = {
    status: 'Traded',
    vehicle: {
      brand: 'Lucid motors',
      model: 'Air Pure',
      year: '2025',
      mileage: '302,595 km',
      damage: 'Left side',
      location: 'Uxbridge, Massachusetts, Usa',
      fuel: 'gasoline',
      transmission: 'Manual',
      bodyType: 'Sedan',
      driveType: 'FWD',
      engineVolume: '2,5 L',
    },
    auction: {
      lot: '89862655',
      vin: '4S4BSACC6G3265993',
      auction: 'COPART',
      updated: '5/26/2026, 7:00:00 PM',
      bidPrice: '\u20ac700',
      estimatedTotalPrice: '\u20ac2,550',
    },
    description:
      'Vehicle starts and drives. Minor front damage, airbags intact. Suitable for quick repair and resale.',
  },
  onExactCostClick = () => {},
}) => {
  const { vehicle, auction } = car;
  return (
    <section className={[styles.imageGridWrapper, className].join(' ')}>
      <div className={styles.imageGrid}>
        {/* ── LEFT: photos ─────────────────────────────────────────────── */}
        <div className={styles.imageColumn}>
          <img
            className={styles.image15Icon}
            loading="lazy"
            width={848}
            height={636}
            alt=""
            src={hero}
          />
          <div className={styles.thumbRow}>
            {thumbsRow1.map((src, i) => (
              <img
                key={`r1-${i}`}
                className={styles.image16Icon}
                loading="lazy"
                width={203}
                height={152}
                alt=""
                src={src}
              />
            ))}
          </div>
          <div className={styles.thumbRow}>
            {thumbsRow2.map((src, i) => (
              <img
                key={`r2-${i}`}
                className={styles.image16Icon}
                width={203}
                height={152}
                alt=""
                src={src}
              />
            ))}
            <button type="button" className={styles.allImagesCard}>
              <span className={styles.allImagesInner}>
                <img
                  className={styles.wordpressimageIcon}
                  width={24}
                  height={24}
                  alt=""
                  src="/single-car/wordpress-image.svg"
                />
                <span className={styles.allImages}>{` all images `}</span>
              </span>
            </button>
          </div>
        </div>

        {/* ── RIGHT: info card 848 × 964 ──────────────────────────────── */}
        <div className={styles.infoCard}>
          <div className={styles.infoCardInner}>
            <div className={styles.infoBlocks}>
              {/* TRADED chip */}
              <div className={styles.tradedRow}>
                <button type="button" className={styles.tradedButton}>
                  <span className={styles.tradedText}>{car.status}</span>
                </button>
              </div>

              {/* VEHICLE INFORMATION */}
              <section className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h3 className={styles.sectionTitle}>Vehicle information</h3>
                </div>
                <div className={styles.detailsGrid}>
                  <div className={styles.detailsCol}>
                    <Row label="Brand"    value={vehicle.brand} />
                    <Row label="Model"    value={vehicle.model} />
                    <Row label="Year"     value={vehicle.year} />
                    <Row label="Mileage"  value={vehicle.mileage} />
                    <Row label="Damage"   value={vehicle.damage} />
                    <Row label="Location" value={vehicle.location} />
                  </div>
                  <div className={styles.detailsCol}>
                    <Row label="Fuel"          value={vehicle.fuel} />
                    <Row label="Transmission"  value={vehicle.transmission} />
                    <Row label="Body type"     value={vehicle.bodyType} />
                    <Row label="Drive type"    value={vehicle.driveType} />
                    <Row label="Engine volume" value={vehicle.engineVolume} />
                  </div>
                </div>
              </section>

              {/* AUCTION DETAILS */}
              <section className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h3 className={styles.sectionTitle}>Auction details</h3>
                </div>
                <div className={styles.detailsGrid}>
                  <div className={styles.detailsCol}>
                    <Row label="LOT"     value={auction.lot} />
                    <Row label="VIN"     value={auction.vin} />
                    <Row label="Auction" value={auction.auction} />
                    <Row label="Updated" value={auction.updated} />
                  </div>
                  <div className={styles.detailsCol}>
                    <div className={styles.detailRow}>
                      <div className={styles.detailLabel}>Bid price</div>
                      <h3 className={styles.detailValueLg}>{auction.bidPrice}</h3>
                    </div>
                    <div className={styles.detailRow}>
                      <div className={styles.detailLabel}>Estimated total price</div>
                      <h3 className={styles.detailValueLg}>{auction.estimatedTotalPrice}</h3>
                    </div>
                  </div>
                </div>
              </section>

              {/* DESCRIPTION */}
              <section className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h3 className={styles.sectionTitle}>Description</h3>
                </div>
                <div className={styles.description}>{car.description}</div>
              </section>
            </div>

            {/* CTA */}
            <div className={styles.ctaSlot}>
              <Button1
                property1="Default"
                cONTACTUS="exact cost in Bulgaria"
                showBUTTON
                bUTTONWidth="327px"
                bUTTONBorder="none"
                cONTACTUSTextTransform="uppercase"
                onClick={onExactCostClick}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

/** Label + value row. Label = 14 Medium white, value = 14 Bold orange. */
const Row = ({ label, value }) => (
  <div className={styles.detailRow}>
    <div className={styles.detailLabel}>{label}</div>
    <div className={styles.detailValue}>{value}</div>
  </div>
);

export default ImageGrid;
