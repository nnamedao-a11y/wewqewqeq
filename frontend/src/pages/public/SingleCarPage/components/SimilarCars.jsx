import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import CarCard from './CarCard';
import styles from './SimilarCars.module.css';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';
const PAGE_SIZE = 3;

/**
 * "Similar Cars" carousel at the bottom of SingleCarPage.
 *
 * Fully wired to real BidMotors data via `GET /api/public/featured?limit=18`.
 *  • Excludes the current VIN so the user doesn't see the same car they're already on.
 *  • Slices 3 cards per page, with prev/next pagination over the remaining results.
 *  • Each CarCard is a real `<Link to="/cars/<VIN>">` — clicking it opens the
 *    canonical SingleCarPage with live data, so users never land on the old
 *    static Lucid placeholder again.
 *  • Loading shows skeleton placeholders. Empty / error degrade quietly
 *    (hides the block) so a non-critical fetch failure doesn't break the page.
 */
const SimilarCars = ({ className = '' }) => {
  const params = useParams();
  const currentVin = useMemo(
    () => (params.slug || params.query || params.vin || '').toUpperCase(),
    [params],
  );

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const { data } = await axios.get(`${API_URL}/api/public/featured`, {
          params: { limit: 18 },
          timeout: 15000,
        });
        if (cancelled) return;
        const arr = Array.isArray(data?.items) ? data.items : [];
        const filtered = arr.filter((x) => (x?.vin || '').toUpperCase() !== currentVin);
        setItems(filtered);
      } catch {
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [currentVin]);

  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const slice = items.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  // If no items and not loading, hide the entire block — better than showing
  // the old hardcoded "Lucid" placeholder.
  if (!loading && items.length === 0) return null;

  return (
    <section className={[styles.similarCarsContainerWrapper, className].join(' ')}>
      <div className={styles.similarCarsContainer}>
        <h2 className={styles.similarCars}>
          <span>{`Similar `}</span>
          <span className={styles.cars}>Cars</span>
        </h2>
        <div className={styles.carCards}>
          {loading
            ? Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <CarCardSkeleton key={`sk-${i}`} />
              ))
            : slice.map((item) => (
                <CarCard key={item.vin} data={item} />
              ))}
        </div>
        {!loading && totalPages > 1 && (
          <div className={styles.pagination}>
            <button
              type="button"
              className={styles.pageBtn}
              aria-label="Previous"
              disabled={safePage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <img
                className={styles.lsiconleftFilled}
                width={40}
                height={40}
                alt=""
                src="/single-car/lsicon-left-filled.svg"
              />
            </button>
            <div className={styles.pageNum}>
              {String(safePage).padStart(2, '0')}/{String(totalPages).padStart(2, '0')}
            </div>
            <button
              type="button"
              className={styles.pageBtn}
              aria-label="Next"
              disabled={safePage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              <img
                className={styles.lsiconleftFilled2}
                width={40}
                height={40}
                alt=""
                src="/single-car/lsicon-left-filled.svg"
              />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

const CarCardSkeleton = () => (
  <div className={styles.skeletonCard} aria-hidden="true">
    <div className={styles.skeletonImage} />
    <div className={styles.skeletonLines}>
      <div className={styles.skeletonLine} />
      <div className={styles.skeletonLine} style={{ width: '60%' }} />
      <div className={styles.skeletonLine} style={{ width: '40%' }} />
    </div>
  </div>
);

export default SimilarCars;
