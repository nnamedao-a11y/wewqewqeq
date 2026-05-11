import React, { useMemo, useState } from 'react';
import Button1 from './Button1';
import styles from './ImageGrid.module.css';

/**
 * Single Car page — photo grid (LEFT) + info card (RIGHT).
 *
 * Pixel & typography spec (May 2026):
 *   • LEFT  — hero 848×636 + 2 rows of 4 thumbs (203×152, gap 12)
 *   • RIGHT — info card 848×964
 *   • TRADED button     : 156×34, Mazzard 14 SemiBold
 *   • Section titles    : Mazzard 18 SemiBold
 *   • Field labels      : Mazzard 14 Medium  white
 *   • Field values      : Mazzard 14 Bold    orange
 *   • Description text  : Mazzard 14 Regular #949494
 *   • CTA button        : 327×45, Mazzard 14 Medium
 *
 * Data is supplied by <SingleCarPage> from `/api/vin/<VIN>` via the
 * `useCarByVin` hook (see ../useCarByVin.js + ../formatters.js).
 */

const PLACEHOLDER = '/single-car/image-15@2x.png';

const ImageGrid = ({ className = '', car, onExactCostClick = () => {} }) => {
  const { vehicle, auction, status, images = [], imageCount, description, auctionUrl } = car || {};

  // Lay out 1 hero + 2 rows × 4 thumbs (row 2's last cell = "ALL IMAGES" tile).
  const hero = images[0] || PLACEHOLDER;
  const thumbsRow1 = useMemo(() => {
    const slice = images.slice(1, 5);
    while (slice.length < 4) slice.push(PLACEHOLDER);
    return slice;
  }, [images]);
  const thumbsRow2 = useMemo(() => {
    const slice = images.slice(5, 8);
    while (slice.length < 3) slice.push(PLACEHOLDER);
    return slice;
  }, [images]);

  const [galleryOpen, setGalleryOpen] = useState(false);

  return (
    <section className={[styles.imageGridWrapper, className].join(' ')}>
      <div className={styles.imageGrid}>
        {/* ── LEFT: photos ─────────────────────────────────────────────── */}
        <div className={styles.imageColumn}>
          <button
            type="button"
            className={styles.heroButton}
            onClick={() => setGalleryOpen(true)}
            aria-label="Open photo gallery"
          >
            <img
              className={styles.image15Icon}
              loading="lazy"
              width={848}
              height={636}
              alt={car?.title || ''}
              src={hero}
              onError={(e) => { e.currentTarget.src = PLACEHOLDER; }}
            />
          </button>
          <div className={styles.thumbRow}>
            {thumbsRow1.map((src, i) => (
              <button
                type="button"
                key={`r1-${i}`}
                className={styles.thumbButton}
                onClick={() => setGalleryOpen(true)}
                aria-label={`Photo ${i + 2}`}
              >
                <img
                  className={styles.image16Icon}
                  loading="lazy"
                  width={203}
                  height={152}
                  alt=""
                  src={src}
                  onError={(e) => { e.currentTarget.src = PLACEHOLDER; }}
                />
              </button>
            ))}
          </div>
          <div className={styles.thumbRow}>
            {thumbsRow2.map((src, i) => (
              <button
                type="button"
                key={`r2-${i}`}
                className={styles.thumbButton}
                onClick={() => setGalleryOpen(true)}
                aria-label={`Photo ${i + 6}`}
              >
                <img
                  className={styles.image16Icon}
                  loading="lazy"
                  width={203}
                  height={152}
                  alt=""
                  src={src}
                  onError={(e) => { e.currentTarget.src = PLACEHOLDER; }}
                />
              </button>
            ))}
            <button
              type="button"
              className={styles.allImagesCard}
              onClick={() => setGalleryOpen(true)}
              aria-label={`Show all ${imageCount || images.length} photos`}
            >
              <span className={styles.allImagesInner}>
                <img
                  className={styles.wordpressimageIcon}
                  width={24}
                  height={24}
                  alt=""
                  src="/single-car/wordpress-image.svg"
                />
                <span className={styles.allImages}>
                  {imageCount ? ` all images (${imageCount}) ` : ' all images '}
                </span>
              </span>
            </button>
          </div>
        </div>

        {/* ── RIGHT: info card ────────────────────────────────────────── */}
        <div className={styles.infoCard}>
          <div className={styles.infoCardInner}>
            <div className={styles.infoBlocks}>
              {/* STATUS chip */}
              <div className={styles.tradedRow}>
                <button type="button" className={styles.tradedButton}>
                  <span className={styles.tradedText}>{(status || 'Traded').toUpperCase()}</span>
                </button>
              </div>

              {/* VEHICLE INFORMATION */}
              <section className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h3 className={styles.sectionTitle}>Vehicle information</h3>
                </div>
                <div className={styles.detailsGrid}>
                  <div className={styles.detailsCol}>
                    <Row label="Brand"    value={vehicle?.brand} />
                    <Row label="Model"    value={vehicle?.model} />
                    <Row label="Year"     value={vehicle?.year} />
                    <Row label="Mileage"  value={vehicle?.mileage} />
                    <Row label="Damage"   value={vehicle?.damage} />
                    <Row label="Location" value={vehicle?.location} />
                  </div>
                  <div className={styles.detailsCol}>
                    <Row label="Fuel"          value={vehicle?.fuel} />
                    <Row label="Transmission"  value={vehicle?.transmission} />
                    <Row label="Body type"     value={vehicle?.bodyType} />
                    <Row label="Drive type"    value={vehicle?.driveType} />
                    <Row label="Engine volume" value={vehicle?.engineVolume} />
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
                    <Row label="LOT"     value={auction?.lot} />
                    <Row label="VIN"     value={auction?.vin} />
                    <Row label="Auction" value={auction?.auction} />
                    <Row label="Updated" value={auction?.updated} />
                  </div>
                  <div className={styles.detailsCol}>
                    <div className={styles.detailRow}>
                      <div className={styles.detailLabel}>Bid price</div>
                      <h3 className={styles.detailValueLg}>{auction?.bidPrice || '—'}</h3>
                    </div>
                    <div className={styles.detailRow}>
                      <div className={styles.detailLabel}>Estimated total price</div>
                      <h3 className={styles.detailValueLg}>{auction?.estimatedTotalPrice || '—'}</h3>
                    </div>
                  </div>
                </div>
              </section>

              {/* DESCRIPTION */}
              <section className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h3 className={styles.sectionTitle}>Description</h3>
                </div>
                <div className={styles.description}>{description}</div>
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
              {auctionUrl && (
                <a
                  className={styles.sourceLink}
                  href={auctionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View on source auction →
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {galleryOpen && <Lightbox images={images} onClose={() => setGalleryOpen(false)} />}
    </section>
  );
};

/** Label + value row. Label = 14 Medium white, value = 14 Bold orange. */
const Row = ({ label, value }) => (
  <div className={styles.detailRow}>
    <div className={styles.detailLabel}>{label}</div>
    <div className={styles.detailValue}>{value || '—'}</div>
  </div>
);

/** Minimal full-screen image lightbox (keyboard navigable). */
const Lightbox = ({ images = [], onClose }) => {
  const [idx, setIdx] = useState(0);
  const total = images.length;
  React.useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setIdx((i) => (i + 1) % total);
      if (e.key === 'ArrowLeft') setIdx((i) => (i - 1 + total) % total);
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [total, onClose]);

  if (!total) return null;
  return (
    <div className={styles.lightbox} role="dialog" aria-modal="true">
      <button type="button" className={styles.lightboxClose} onClick={onClose} aria-label="Close gallery">
        ×
      </button>
      <button
        type="button"
        className={`${styles.lightboxNav} ${styles.lightboxPrev}`}
        onClick={() => setIdx((i) => (i - 1 + total) % total)}
        aria-label="Previous photo"
      >
        ‹
      </button>
      <img className={styles.lightboxImg} src={images[idx]} alt="" />
      <button
        type="button"
        className={`${styles.lightboxNav} ${styles.lightboxNext}`}
        onClick={() => setIdx((i) => (i + 1) % total)}
        aria-label="Next photo"
      >
        ›
      </button>
      <div className={styles.lightboxCount}>{idx + 1} / {total}</div>
    </div>
  );
};

export default ImageGrid;
