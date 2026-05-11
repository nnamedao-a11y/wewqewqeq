import styles from "./frame-component24.module.css";

/**
 * FrameComponent24 — "WE HAVE PERFECT SERVICE" section.
 * Direct port of the canonical Figma export from `BIBICARS 5.zip`,
 * adapted from Next.js (<Image>) to plain React (<img>) and using
 * paths under /figma/.
 */
const FrameComponent24 = ({ className = "" }) => {
  return (
    <section
      className={[styles.weHavePerfectServiceWrapper, className].join(" ")}
      data-testid="perfect-service-section"
    >
      <div className={styles.weHavePerfectService}>
        <section className={styles.serviceContent}>
          <div className={styles.weHavePerfectServiceParent}>
            <h2 className={styles.weHavePerfect}>we have perfect service</h2>
            <div className={styles.dreamCar}>
              <div className={styles.frameParent}>
                <div className={styles.vectorWrapper}>
                  <img
                    className={styles.vectorIcon}
                    width={13}
                    height={76}
                    sizes="100vw"
                    alt=""
                    src="/figma/Vector.svg"
                  />
                </div>
                <h2 className={styles.justAFewContainer}>
                  <span>
                    Just a few steps <br />
                  </span>
                  <span className={styles.toYourDream}>to your dream car</span>
                </h2>
                <div className={styles.vectorContainer}>
                  <img
                    className={styles.vectorIcon2}
                    width={13}
                    height={76}
                    sizes="100vw"
                    alt=""
                    src="/figma/Vector.svg"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className={styles.locationSet}>
          <div className={styles.locationService}>
            <div className={styles.locationIcon}>
              <div className={styles.locationSolo}>
                <div className={styles.weuilocationFilledParent}>
                  <img
                    className={styles.weuilocationFilledIcon}
                    width={44.2}
                    height={44.2}
                    sizes="100vw"
                    alt=""
                    src="/figma/weui-location-filled.svg"
                  />
                  <div className={styles.frameChild} />
                </div>
              </div>
              <div className={styles.iconPairs}>
                <img
                  className={styles.weuilocationFilledIcon}
                  width={44.2}
                  height={44.2}
                  sizes="100vw"
                  alt=""
                  src="/figma/weui-location-filled.svg"
                />
                <div className={styles.frameChild} />
              </div>
              <div className={styles.locationOverlap}>
                <div className={styles.locationOverlapChild} />
                <div className={styles.weuilocationFilledGroup}>
                  <img
                    className={styles.weuilocationFilledIcon}
                    width={44.2}
                    height={44.2}
                    sizes="100vw"
                    alt=""
                    src="/figma/weui-location-filled.svg"
                  />
                  <div className={styles.frameChild} />
                </div>
              </div>
              <div className={styles.iconPairs2}>
                <img
                  className={styles.weuilocationFilledIcon}
                  width={44.2}
                  height={44.2}
                  sizes="100vw"
                  alt=""
                  src="/figma/weui-location-filled.svg"
                />
                <div className={styles.frameChild} />
              </div>
            </div>
          </div>
          <div className={styles.serviceClaims}>
            <h1 className={styles.chooseYourPerfect}>
              {" "}
              Choose your perfect car
            </h1>
            <h1 className={styles.chooseYourPerfect}>
              Pay quickly and effortlessly
            </h1>
            <h1 className={styles.chooseYourPerfect}>
              Track your car <br />
              in real time
            </h1>
            <h1 className={styles.chooseYourPerfect}>
              Get the keys and enjoy your new car
            </h1>
          </div>
          <div className={styles.findVehicleProcess}>
            <div className={styles.findAVehicleThatMatchesYoParent}>
              <div className={styles.findAVehicle}>
                Find a vehicle that matches your style and budget
              </div>
              <div className={styles.processStatement}>
                <div className={styles.aSimpleTransparent}>
                  A simple, transparent process with no complications
                </div>
              </div>
              <div className={styles.processStep}>
                <div className={styles.aSimpleTransparent}>
                  Stay updated on every step of the journey in your personal
                  account
                </div>
              </div>
              <div className={styles.ourManagerWill}>
                Our manager will hand over the vehicle and take care of every
                detail
              </div>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
};

export default FrameComponent24;
