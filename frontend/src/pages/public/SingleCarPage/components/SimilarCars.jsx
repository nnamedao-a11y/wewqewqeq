import React, { useState } from 'react';
import CarCard from './CarCard';
import styles from './SimilarCars.module.css';

const DEFAULT_CARS = [
  { image: '/single-car/image-151@2x.png' },
  { image: '/single-car/image-152@2x.png' },
  { image: '/single-car/image-153@2x.png' },
  { image: '/single-car/image-154@2x.png' },
];

const SimilarCars = ({ className = '', items = DEFAULT_CARS, totalPages = 10 }) => {
  const [page, setPage] = useState(1);
  return (
    <section className={[styles.similarCarsContainerWrapper, className].join(' ')}>
      <div className={styles.similarCarsContainer}>
        <h2 className={styles.similarCars}>
          <span>{`Similar `}</span>
          <span className={styles.cars}>Cars</span>
        </h2>
        <div className={styles.carCards}>
          {items.slice(0, 3).map((item, i) => (
            <CarCard key={i} image={item.image} />
          ))}
        </div>
        <div className={styles.pagination}>
          <button
            type="button"
            className={styles.pageBtn}
            aria-label="Previous"
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
          <div className={styles.pageNum}>{String(page).padStart(2, '0')}/{String(totalPages).padStart(2, '0')}</div>
          <button
            type="button"
            className={styles.pageBtn}
            aria-label="Next"
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
      </div>
    </section>
  );
};

export default SimilarCars;
