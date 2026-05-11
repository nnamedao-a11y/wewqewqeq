import React, { useState } from 'react';
import Button1 from './Button1';
import styles from './CostCalculator.module.css';

/**
 * FrameComponent4 — "Cost calculator for this car" block.
 */
const CostCalculator = ({
  className = '',
  preFilled = {
    auction: 'COPART',
    car: 'LUcid air pure 2025',
    fuelType: 'Electric (EV)',
    mileage: '23,840 km',
  },
  costs = {
    carAuction: '€4,868',
    portLoadingHandling: '€280',
    oceanFreight: '€0',
    marineInsurance: '€0',
    portHandlingBg: '€0',
    logisticsTotal: '€3,549',
    customsDuty: '€0',
    vat: '€583',
    bibiServiceFee: '€940',
    transportBg: '€1,000',
    technotest: '€0',
    customsTotal: '€1,127',
    totalApproximate: '€9,544',
  },
  onFullCalculationClick = () => {},
}) => {
  const [purchasePrice, setPurchasePrice] = useState('');
  return (
    <main className={[styles.calculatorContainerWrapper, className].join(' ')}>
      <div className={styles.calculatorContainer}>
        {/* Header */}
        <div className={styles.calculatorHeader}>
          <h1 className={styles.costCalculatorForContainer}>
            <span>{`Cost `}</span>
            <span className={styles.calculator}>
              calculator
              <br />
            </span>
            <span>FOR THIS CAR</span>
          </h1>
          <div className={styles.allKeyParameters}>
            All key parameters are pre-filled from the auction listing. Adjust if needed and get your total import cost to Bulgaria.
          </div>
        </div>

        <div className={styles.auctionParameters}>
          {/* LEFT — Pre-filled from auction */}
          <section className={styles.frameParent}>
            <div className={styles.preFilledFromAuctionWrapper}>
              <div className={styles.preFilledFromAuction}>PRE-FILLED FROM AUCTION</div>
            </div>
            <div className={styles.frameGroup}>
              <Pair label="Auction" value={preFilled.auction} />
              <Pair label="Car" value={preFilled.car} />
              <Pair label="Fuel type" value={preFilled.fuelType} />
              <Pair label="Mileage" value={preFilled.mileage} />
            </div>
          </section>

          {/* RIGHT — Cost estimate */}
          <div className={styles.estimationHeaderParent}>
            <div className={styles.preFilledFromAuctionWrapper}>
              <div className={styles.preFilledFromAuction}>Cost Estimate</div>
            </div>
            <div className={styles.costBreakdown}>
              {/* CAR & AUCTION subtotal block */}
              <section className={styles.frameContainer}>
                <div className={styles.vehiclePurchasePriceParent}>
                  <div className={styles.vehiclePurchasePriceContainer}>
                    <span>{`Vehicle purchase price `}</span>
                    <span className={styles.calculator}>*</span>
                  </div>
                  <div className={styles.priceEntry}>
                    <div className={styles.priceCurrency}>€</div>
                    <input
                      className={styles.fillTheSumm}
                      placeholder="Fill the summ"
                      type="text"
                      value={purchasePrice}
                      onChange={(e) => setPurchasePrice(e.target.value)}
                    />
                  </div>
                </div>
                <div className={styles.frameWrapper}>
                  <div className={styles.auctionFeeWrapper}>
                    <div className={styles.auctionFee}>Auction fee</div>
                  </div>
                </div>
                <div className={styles.frameDiv}>
                  <div className={styles.carAuctionWrapper}>
                    <div className={styles.auctionFee}>{`CAR & AUCTION`}</div>
                  </div>
                  <div className={styles.subTotal}>{costs.carAuction}</div>
                </div>
              </section>

              {/* LOGISTICS subtotal block */}
              <section className={styles.frameContainer}>
                <Line label="Port loading & handling (USA)" value={costs.portLoadingHandling} />
                <Line label="Ocean freight (vessel)" value={costs.oceanFreight} />
                <Line label="Marine insurance" value={costs.marineInsurance} />
                <Line label="Port handling in Bulgaria" value={costs.portHandlingBg} />
                <div className={styles.frameDiv}>
                  <div className={styles.logisticsToBulgariaWrapper}>
                    <div className={styles.auctionFee}>LOGISTICS TO BULGARIA</div>
                  </div>
                  <div className={styles.subTotal}>{costs.logisticsTotal}</div>
                </div>
              </section>

              {/* CUSTOMS subtotal block */}
              <section className={styles.frameContainer}>
                <Line label="Customs duty (import tax)" value={costs.customsDuty} />
                <Line label="VAT Bulgaria (20%)" value={costs.vat} />
                <Line label="BIBI service fee" value={costs.bibiServiceFee} />
                <Line label="Transport to Bulgaria" value={costs.transportBg} />
                <Line label="Technotest (BG registration)" value={costs.technotest} />
                <div className={styles.frameParent4}>
                  <div className={styles.customsFinalFeesWrapper}>
                    <div className={styles.auctionFee}>{`CUSTOMS & FINAL FEES`}</div>
                  </div>
                  <div className={styles.subTotal}>{costs.customsTotal}</div>
                </div>
              </section>

              {/* TOTAL */}
              <div className={styles.totalCost}>
                <h3 className={styles.totalApproximateCost}>TOTAL approximate cOST</h3>
                <h3 className={styles.totalApproximateCost}>{costs.totalApproximate}</h3>
              </div>

              {/* Disclaimer */}
              <div className={styles.estimateDisclaimer}>
                <div className={styles.approximateEstimateFinalContainer}>
                  <span className={styles.approximateEstimateFinalCo}>
                    <span className={styles.approximateEstimate}>Approximate estimate</span>
                    <span>
                      . Final cost depends on actual auction result, current freight rates and individual customs assessment. Contact BIBI for a precise binding quote.
                    </span>
                  </span>
                </div>
              </div>
            </div>

            <Button1
              property1="Default"
              cONTACTUS="I want a complete calculation"
              showBUTTON
              bUTTONWidth="327px"
              bUTTONBorder="none"
              cONTACTUSHeight="unset"
              cONTACTUSDisplay="unset"
              cONTACTUSAlignItems="unset"
              cONTACTUSJustifyContent="unset"
              cONTACTUSTextTransform="uppercase"
              onClick={onFullCalculationClick}
            />
          </div>
        </div>
      </div>
    </main>
  );
};

const Pair = ({ label, value }) => (
  <div className={styles.auctionParent}>
    <div className={styles.auction}>{label}</div>
    <div className={styles.copart}>{value}</div>
  </div>
);

const Line = ({ label, value }) => (
  <div className={styles.portLoadingHandlingUsaParent}>
    <div className={styles.auctionFee}>{label}</div>
    <div className={styles.lineValue}>{value}</div>
  </div>
);

export default CostCalculator;
