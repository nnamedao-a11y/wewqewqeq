import styles from "./frame-component26.module.css";

const FrameComponent26 = ({
  className = "",
})=> {
  return (
    <section className={[styles.rectangleParent, className].join(" ")}>
      <div className={styles.frameChild} />
      <div className={styles.lessPayContainer}>
        <h1 className={styles.whyYouPayContainer}>
          <span>Why You Pay Less <br />— </span>
          <span className={styles.andGetMore}>And Get More</span>
        </h1>
      </div>
      <div className={styles.paylessReasons}>
        <h2 className={styles.advantages}>advantages</h2>
        <div className={styles.vehicleAdvantage}>
          <div className={styles.car}>car</div>
          <div className={styles.trimContainer}>
            <div className={styles.contentAdvantage}>
              <section className={styles.infoContainer}>
                <div className={styles.detailAdvantage}>
                  <div className={styles.titleAdvantage}>
                    <div className={styles.advantageFeatures}>
                      <h2 className={styles.largeSelection}>
                        / Large selection
                      </h2>
                    </div>
                    <h2 className={styles.moreTrimLevels}>
                      More trim levels, colors, rare models
                    </h2>
                  </div>
                  <div className={styles.trimFeatures}>
                    <h2 className={styles.largeSelection}>
                      / Better trim levels
                    </h2>
                  </div>
                </div>
                <div className={styles.cheaperAdvantage}>
                  <img                     className={styles.image79Icon}
                    loading="lazy"
                    width={390.8}
                    height={390.8}
                    sizes="100vw"
                    alt=""
                    src="/figma/image-79@2x.webp"
                  />
                  <div className={styles.descriptionContainer}>
                    <div className={styles.titleAdvantage}>
                      <h2 className={styles.muchCheaper}>/ Much cheaper</h2>
                      <h2 className={styles.evenTakingInto}>
                        Even taking into account delivery and customs clearance,{" "}
                        <br />
                        the car often comes out 20–50% cheaper
                      </h2>
                    </div>
                    <h2 className={styles.transparentHistory}>
                      / Transparent history
                    </h2>
                  </div>
                </div>
              </section>
              <section className={styles.multimediaFeatures}>
                <h2 className={styles.moreOptionsBetterMultimedia}>
                  More options
                  <br />
                  Better multimedia
                  <br />
                  Higher level of comfort
                </h2>
                <div className={styles.vINTool}>
                  <h2 className={styles.vinChecksCarfax}>
                    VIN checks (Carfax, AutoCheck)
                    <br />
                  </h2>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FrameComponent26;
