import React from 'react';
import NavigationHeader from './components/NavigationHeader';
import ImageGrid from './components/ImageGrid';
import CostCalculator from './components/CostCalculator';
import NavigationFooter from './components/NavigationFooter';
import SimilarCars from './components/SimilarCars';
import './single-car.tokens.css';
import styles from './SingleCarPage.module.css';

/**
 * BIBI Cars — Single Car page (formerly /catalog placeholder).
 *
 * Pixel-perfect port of the Anima/Figma export from
 * `BIBICARS (Origine).zip` (May 2026). Anchored to the design spec exactly
 * — content widths and typography taken from the source SVG / TS / CSS.
 *
 * Sections (top to bottom):
 *   1. NavigationHeader  — breadcrumb + huge 80px title
 *   2. ImageGrid         — photos (1 hero + 2×4 thumbs) + info card
 *   3. CostCalculator    — pre-filled auction params + cost estimate
 *   4. NavigationFooter  — "go back to catalog" + contact card
 *   5. SimilarCars       — horizontal carousel of 3 cars + pagination
 *
 * The public site Header / Footer come from <PublicLayout> (parent route),
 * so this page never renders its own chrome.
 */
const SingleCarPage = () => {
  return (
    <div className={`singleCarRoot ${styles.singleCar}`}>
      <NavigationHeader />
      <ImageGrid />
      <CostCalculator />
      <NavigationFooter />
      <SimilarCars />
    </div>
  );
};

export default SingleCarPage;
