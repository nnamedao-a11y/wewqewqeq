import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import NavigationHeader from './components/NavigationHeader';
import ImageGrid from './components/ImageGrid';
import CostCalculator from './components/CostCalculator';
import NavigationFooter from './components/NavigationFooter';
import SimilarCars from './components/SimilarCars';
import useCarByVin from './useCarByVin';
import './single-car.tokens.css';
import styles from './SingleCarPage.module.css';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

/**
 * BIBI Cars — Single Car page.
 *
 * URL → data:
 *   • /cars/:slug         — slug = VIN (homepage cards always pass VIN)
 *   • /vin/:query         — header VIN search submit
 *   • /search/:query      — header free-text search submit (passes through VIN endpoint)
 *
 * The page is the SINGLE source of truth for car detail rendering. Data is
 * pulled from `/api/vin/<VIN>` (LIVE-FIRST chain in backend `vin_service`),
 * then transformed by `useCarByVin` into UI-ready props for the dumb
 * presentational children. There is no hard-coded "Lucid Motors" fallback
 * any more — if the VIN does not resolve we render an honest "not found"
 * state so users immediately understand the situation and can fall back
 * to header search.
 */
const SingleCarPage = () => {
  const params = useParams();
  const vinOrSlug = params.slug || params.query || params.vin;
  const navigate = useNavigate();
  const { loading, error, car } = useCarByVin(vinOrSlug);

  /* ── Cost calculator state — derived from the car's auction price ── */
  const [calc, setCalc] = useState(null);
  const [calcLoading, setCalcLoading] = useState(false);

  // Vehicle classification → calculator `vehicleType`
  const vehicleType = useMemo(() => {
    const body = (car?.vehicle?.bodyType || '').toLowerCase();
    if (body.includes('suv') && /(big|full)/i.test(car?.vehicle?.bodyType || '')) return 'bigSUV';
    if (body.includes('suv')) return 'suv';
    if (body.includes('pickup')) return 'pickup';
    return 'sedan';
  }, [car]);

  const runCalc = useCallback(async (priceUsd, auction) => {
    if (!priceUsd || priceUsd <= 0) {
      setCalc(null);
      return;
    }
    setCalcLoading(true);
    try {
      const res = await axios.post(
        `${API_URL}/api/calculator/calculate`,
        {
          origin: 'usa',
          price: priceUsd,
          port: 'burgas',
          auction: (auction || 'copart').toLowerCase(),
          vehicleType,
        },
        { timeout: 12000 },
      );
      setCalc(res.data);
    } catch {
      setCalc(null);
    } finally {
      setCalcLoading(false);
    }
  }, [vehicleType]);

  // Auto-run calculator with parsed bid price on car load.
  useEffect(() => {
    if (!car) return;
    runCalc(car.auction.bidPriceRaw || 0, car.auction.auction);
  }, [car, runCalc]);

  /* ── handlers ── */
  const handleExactCost = () => {
    if (typeof window !== 'undefined') {
      const el = document.getElementById('cost-calculator');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
  const handleBackToCatalog = () => navigate('/catalog');

  /* ── derived view-model ── */
  const title = car?.title || (loading ? 'Loading vehicle…' : (error === 'not_found' ? 'Vehicle not found' : 'Vehicle'));
  const breadcrumb = ['Home', 'Catalog'];

  const preFilled = car
    ? {
        auction: car.auction.auction,
        car: `${(car.vehicle.brand || '').toUpperCase()} ${(car.vehicle.model || '').toUpperCase()} ${car.vehicle.year || ''}`.trim(),
        fuelType: car.vehicle.fuel,
        mileage: car.vehicle.mileage,
      }
    : undefined;

  const fmt = (v) => (v == null ? '€0' : `€${Math.round(Number(v) || 0).toLocaleString('en-US')}`);
  // Calculator response shape: { calculation: { total, vehiclePrice, auctionFees, ... }, formattedBreakdown: [{key,label,value}, ...] }
  const breakdown = Array.isArray(calc?.formattedBreakdown) ? calc.formattedBreakdown : (calc?.calculation?.breakdown || []);
  const pick = (k) => {
    const item = breakdown.find((b) => b.key === k);
    return Number(item?.value || 0);
  };
  const calculation = calc?.calculation || {};
  const vehiclePrice = Number(calculation.vehiclePrice || 0);
  const auctionFeesTotal = pick('auctionBuyerFee') + pick('auctionGateFee') + pick('auctionTitleFee');
  const logisticsTotal = pick('usaInland') + pick('ocean') + pick('portForwarding') + pick('portParking') + pick('parkingBG');
  const vat = Math.round(vehiclePrice * 0.20);             // 20 % VAT on vehicle value
  const customsTotalDisplay = pick('customs') + vat;
  const costs = calc
    ? {
        carAuction: fmt(vehiclePrice + auctionFeesTotal),
        portLoadingHandling: fmt(pick('usaInland')),
        oceanFreight: fmt(pick('ocean')),
        marineInsurance: fmt(pick('insurance')),
        portHandlingBg: fmt(pick('portForwarding') + pick('portParking') + pick('parkingBG')),
        logisticsTotal: fmt(logisticsTotal),
        customsDuty: fmt(pick('customs')),
        vat: fmt(vat),
        bibiServiceFee: fmt(pick('companyServices')),
        transportBg: fmt(pick('euDelivery')),
        technotest: fmt(0),
        customsTotal: fmt(customsTotalDisplay),
        totalApproximate: fmt((calculation.total || 0) + vat),
      }
    : undefined;

  return (
    <div className={`singleCarRoot ${styles.singleCar}`}>
      <NavigationHeader
        breadcrumb={breadcrumb}
        title={title}
        vin={car?.vin}
        loading={loading}
      />

      {loading && (
        <div className={styles.stateBox}>
          <div className={styles.spinner} />
          <div className={styles.stateText}>
            Loading vehicle data for <code>{String(vinOrSlug || '').toUpperCase()}</code>…
          </div>
        </div>
      )}

      {!loading && error === 'not_found' && (
        <div className={styles.stateBox}>
          <div className={styles.stateTitle}>VIN not found</div>
          <div className={styles.stateText}>
            We couldn’t locate <code>{String(vinOrSlug || '').toUpperCase()}</code> in any of the
            connected auctions. Please double-check the VIN or try a lot number from the header search.
          </div>
          <button type="button" className={styles.stateBtn} onClick={handleBackToCatalog}>
            Browse catalog
          </button>
        </div>
      )}

      {!loading && error && error !== 'not_found' && (
        <div className={styles.stateBox}>
          <div className={styles.stateTitle}>Couldn’t load this vehicle</div>
          <div className={styles.stateText}>{typeof error === 'string' ? error : 'Unexpected error format.'}</div>
          <button type="button" className={styles.stateBtn} onClick={() => window.location.reload()}>
            Try again
          </button>
        </div>
      )}

      {!loading && car && (() => {
        const grand = Math.round((calc?.calculation?.total || 0) + (calc?.calculation?.vehiclePrice ? calc.calculation.vehiclePrice * 0.2 : 0));
        const carWithTotal = grand > 0
          ? { ...car, auction: { ...car.auction, estimatedTotalPrice: `€${grand.toLocaleString('en-US')}` } }
          : car;
        return (
          <>
            <ImageGrid car={carWithTotal} onExactCostClick={handleExactCost} />
            <div id="cost-calculator">
              <CostCalculator
                preFilled={preFilled}
                costs={costs}
                loading={calcLoading}
                onFullCalculationClick={handleExactCost}
              />
            </div>
            <NavigationFooter />
            <SimilarCars />
          </>
        );
      })()}
    </div>
  );
};

export default SingleCarPage;
