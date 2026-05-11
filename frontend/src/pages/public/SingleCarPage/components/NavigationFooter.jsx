import React from 'react';
import { Link } from 'react-router-dom';
import styles from './NavigationFooter.module.css';

/**
 * "Go back to catalog" link + "Have a question? Contact us" card. Port of
 * `components/navigation-footer1.tsx`.
 */
const NavigationFooter = ({
  className = '',
  phones = ['+359 875 313 158', '+359 897 884 804'],
  catalogPath = '/catalog',
}) => (
  <section className={[styles.navigationFooter, className].join(' ')}>
    <div className={styles.navigationContainer}>
      <div className={styles.navigationLinks}>
        <Link to={catalogPath} className={styles.goBackTo}>
          go back to catalog
        </Link>
      </div>
      <div className={styles.contactQuestion}>
        <div className={styles.navigation}>
          <h2 className={styles.haveAQuestion}>Have a question?</h2>
          <h2 className={styles.haveAQuestion}>Contact us</h2>
        </div>
        <div className={styles.navigation2}>
          {phones.map((p) => (
            <h3 className={styles.h3} key={p}>
              <a href={`tel:${p.replace(/\s+/g, '')}`} className={styles.phoneLink}>
                {p}
              </a>
            </h3>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default NavigationFooter;
