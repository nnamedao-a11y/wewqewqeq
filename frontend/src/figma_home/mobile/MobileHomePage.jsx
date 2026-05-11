import React, { useEffect, useState, useRef, useMemo } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Car, Bike } from 'lucide-react';
import { Clock, ArrowRight } from '@phosphor-icons/react';
import MobileHeader from './MobileHeader';
import MobileMenu from './MobileMenu';
import { CAR_BRANDS, MODELS_BY_BRAND } from '../../data/cars';
import { useGetInTouch } from '../../components/public/GetInTouchModal';
import { usePolicyModal } from '../../components/public/PolicyModal';

const API = process.env.REACT_APP_BACKEND_URL || '';

/**
 * MobileHomePage — mobile version of the BIBI Cars homepage matching the
 * Figma mobile design at the 360px breakpoint. Renders below 768px.
 *
 * Sections (per Figma "Home page" mobile mock):
 *  1. Header (logo + phones + hamburger)
 *  2. Hero (FROM AUCTION TO KEYS / IN YOUR HANDS) + KPI
 *  3. Search/filter form (Brand · Model · Year · Find a car)
 *  4. Application steps 1–5
 *  5. How to buy a turnkey car (USA/Korea brand grid)
 *  6. We have perfect service
 *  7. Why you pay less — and get more
 *  8. Before & after
 *  9. Our clients say (reviews)
 * 10. Want to drive your dream car? CTA
 * 11. FAQ
 * 12. Footer (viber community, contacts, socials)
 */

const FALLBACK_PHONES = ['+359 875 313 158', '+359 897 884 804'];

const FALLBACK_HERO = {
  eyebrow: 'america | Korea',
  title_line1: 'From auction',
  title_line2: 'to keys',
  title_line3: 'in your hands',
  kpi1: '/ Over 5,000 cars',
  kpi2: '/ Real-time bids',
  kpi3: '/ 500+ happy clients',
};

const FALLBACK_FAQ = [
  { question: 'How to choose and buy a car from America?' },
  { question: 'Where do you ship to?' },
  { question: 'How long will it take for my order to arrive?' },
  { question: 'How do I change or cancel my order?' },
  { question: 'How can I track my order?' },
];

const FALLBACK_REVIEWS = [
  { name: 'Georgi', rating: 5, text: 'Loved the approach — clear, transparent, no surprises. The car matched my budget and they were always in touch.' },
  { name: 'Dimitar', rating: 5, text: 'Bought a car from auction — they really know their stuff. Great value for money.' },
];

const fmtLang = (val, lang = 'en') => {
  if (val == null) return '';
  if (typeof val === 'string') return val;
  return val[lang] || val.en || val.bg || '';
};

export default function MobileHomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [siteInfo, setSiteInfo] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);
  const [filterBrand, setFilterBrand] = useState('');
  const [filterModel, setFilterModel] = useState('');
  const [yearFrom, setYearFrom] = useState('');
  const [yearTo, setYearTo] = useState('');
  const [reviewIdx, setReviewIdx] = useState(0);
  const [beforeAfterIdx, setBeforeAfterIdx] = useState(0);
  const [lang, setLang] = useState('en');
  const { open: openGetInTouch } = useGetInTouch();
  const { open: openPolicy } = usePolicyModal();

  useEffect(() => {
    let cancelled = false;
    axios
      .get(`${API}/api/site-info`)
      .then((r) => {
        if (!cancelled) setSiteInfo(r.data || null);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // Derived
  const phones = siteInfo?.header?.phones || siteInfo?.footer?.contacts?.phones || FALLBACK_PHONES;
  const addresses = siteInfo?.footer?.contacts?.addresses || [
    'Bulgaria, Sofia, Dragalevtsi, Vitosha Blvd. No. 230',
    'Bulgaria, Sofia, Bulgaria Blvd., No. 81',
  ];
  const socials = siteInfo?.footer?.socials || {};
  const langKey = (lang || 'en').toLowerCase().startsWith('bg') ? 'bg' : 'en';
  const hero = siteInfo?.hero || {};
  const heroEyebrow = fmtLang(hero[`eyebrow_${langKey}`] || hero.eyebrow, langKey) || FALLBACK_HERO.eyebrow;
  const heroL1 = fmtLang(hero[`title_line1_${langKey}`] || hero.title_line1, langKey) || FALLBACK_HERO.title_line1;
  const heroL2 = fmtLang(hero[`title_line2_${langKey}`] || hero.title_line2, langKey) || FALLBACK_HERO.title_line2;
  const heroL3 = fmtLang(hero[`title_line3_${langKey}`] || hero.title_line3, langKey) || FALLBACK_HERO.title_line3;
  const heroImageUrl = hero.image_url || '/mobile/image-103@2x.png';
  const kpi1 = fmtLang(hero[`kpi1_${langKey}`] || hero.kpi1, langKey) || FALLBACK_HERO.kpi1;
  const kpi2 = fmtLang(hero[`kpi2_${langKey}`] || hero.kpi2, langKey) || FALLBACK_HERO.kpi2;
  const kpi3 = fmtLang(hero[`kpi3_${langKey}`] || hero.kpi3, langKey) || FALLBACK_HERO.kpi3;

  // FAQ
  const faqEnabled = siteInfo?.faq?.enabled !== false;
  const faqItems = (siteInfo?.faq?.items || []).filter((i) => i?.enabled !== false);
  const faqList = faqItems.length
    ? faqItems.map((it, i) => ({
        id: it.id || `faq-${i}`,
        question: fmtLang(it[`question_${langKey}`] || it.question, langKey),
        answer: fmtLang(it[`answer_${langKey}`] || it.answer, langKey),
      }))
    : FALLBACK_FAQ.map((f, i) => ({ id: `f-${i}`, question: f.question, answer: '' }));

  // Reviews
  const reviewsEnabled = siteInfo?.reviews?.enabled !== false;
  const reviewItems = (siteInfo?.reviews?.items || []).filter((r) => r?.enabled !== false);
  const reviews = reviewItems.length
    ? reviewItems.map((r) => ({
        name: r.name,
        rating: r.rating || 5,
        text: fmtLang(r[`text_${langKey}`] || r.text, langKey),
        image_url: r.image_url || '',
      }))
    : FALLBACK_REVIEWS;

  // Before & after
  const baEnabled = siteInfo?.before_after?.enabled !== false;
  const baItems = (siteInfo?.before_after?.items || []).filter((i) => i?.enabled !== false);

  const googleRating = siteInfo?.reviews?.google_rating ?? 4.9;
  const googleReviewsCount = siteInfo?.reviews?.google_reviews_count ?? 31;

  const viberCommunity = siteInfo?.footer?.viber_community || {};
  const viberLabel = fmtLang(viberCommunity[`label_${langKey}`] || viberCommunity.label, langKey) || 'Join our group and get the hottest offers';
  const viberUrl = viberCommunity.url || 'viber://chat?number=%2B359875313158';

  // Helpers
  const onFindCar = () => {
    const params = new URLSearchParams();
    if (filterBrand) params.set('make', filterBrand);
    if (filterModel) params.set('model', filterModel);
    if (yearFrom) params.set('year_from', yearFrom);
    if (yearTo) params.set('year_to', yearTo);
    window.location.href = `/catalog${params.toString() ? `?${params}` : ''}`;
  };

  return (
    <div
      className="bg-black text-white min-h-screen"
      style={{
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
        overflowX: 'hidden',
        width: '100%',
        maxWidth: '100vw',
      }}
    >
      <MobileHeader phones={phones} onMenuOpen={() => setMenuOpen(true)} />
      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        phones={phones}
        addresses={addresses}
        socials={socials}
        lang={lang}
        onLangChange={setLang}
      />

      {/* ═════════ HERO ═════════ */}
      <section className="relative pt-6 overflow-hidden">
        {/* AMERICA | KOREA — 119×12 H Medium 12px, centered */}
        <div
          className="text-white text-center uppercase mx-auto"
          style={{
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
            fontWeight: 500,
            fontSize: 12,
            lineHeight: '12px',
            letterSpacing: '0.18em',
            width: 'fit-content',
            height: 12,
          }}
        >
          {heroEyebrow}
        </div>

        {/* Title block — three centered lines (40 / 32 / 40 px) */}
        <div className="mt-3 text-center">
          <div
            className="uppercase text-[#FEAE00]"
            style={{
              fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
              fontWeight: 700,
              fontSize: 40,
              lineHeight: '40px',
              letterSpacing: '0',
            }}
          >
            {heroL1}
          </div>
          <div
            className="uppercase text-white"
            style={{
              fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
              fontWeight: 700,
              fontSize: 32,
              lineHeight: '32px',
              marginTop: 4,
              letterSpacing: '0',
            }}
          >
            {heroL2}
          </div>
          <div
            className="uppercase text-[#FEAE00]"
            style={{
              fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
              fontWeight: 700,
              fontSize: 40,
              lineHeight: '40px',
              marginTop: 4,
              letterSpacing: '0',
            }}
          >
            {heroL3}
          </div>
        </div>

        {/* KPIs — 3 chips per row, exact Figma sizes 93×13, H Semibold 11px,
            text is sentence-case (NOT uppercase), middle one is centered. */}
        <div
          className="mt-6 px-4"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            alignItems: 'center',
            justifyItems: 'center',
            gap: 8,
          }}
        >
          {[
            { val: kpi1, align: 'flex-start' },
            { val: kpi2, align: 'center' },
            { val: kpi3, align: 'flex-end' },
          ].map((k, i) => (
            <div
              key={i}
              className="text-white whitespace-nowrap"
              style={{
                fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                fontWeight: 600,
                fontSize: 11,
                lineHeight: '13px',
                letterSpacing: 0,
                textTransform: 'none',
                width: '100%',
                textAlign: i === 0 ? 'left' : i === 1 ? 'center' : 'right',
              }}
            >
              {k.val}
            </div>
          ))}
        </div>

        {/* Hero image — FULL WIDTH within the viewport (no horizontal padding). */}
        <div className="mt-7 w-full" style={{ lineHeight: 0, overflow: 'hidden' }}>
          <img
            src={heroImageUrl}
            alt=""
            style={{
              width: '100%',
              maxWidth: '100%',
              aspectRatio: '361 / 326',
              objectFit: 'cover',
              display: 'block',
              border: 0,
              outline: 0,
              clipPath: 'inset(0 0 5px 0)',
              marginBottom: -5,
              backgroundColor: '#000',
            }}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = '/mobile/image-103@2x.png';
            }}
          />
        </div>
      </section>

      {/* ═════════ CAR SEARCH / FILTER ═════════ */}
      {/* Per Figma: section box is 360 × 621 — title + 4 fields + button +
         vertical breathing room top/bottom so the card never overlaps the
         hero image above. Brand is a real dropdown (click → searchable list);
         Model is disabled until a brand is picked; Year From/To are
         year selects with sane ranges. */}
      <MobileCarSearch
        filterBrand={filterBrand}
        setFilterBrand={setFilterBrand}
        filterModel={filterModel}
        setFilterModel={setFilterModel}
        yearFrom={yearFrom}
        setYearFrom={setYearFrom}
        yearTo={yearTo}
        setYearTo={setYearTo}
        onFindCar={onFindCar}
      />

      {/* ═════════ SEARCH FOR CARS FROM AMERICA AND KOREA ═════════ */}
      <MobileSearchFromAmericaKorea />
      {/* ═════════ END ═════════ */}

      {/* ═════════ TOP VEHICLES DEALS — placeholder (next iteration) ═════════ */}
      {/* The duplicate "How to buy a turnkey car / USA / Korea" block was
         removed: its functionality is already covered by the
         <MobileSearchFromAmericaKorea /> block above. The next block to
         implement here is "Top vehicles deals of the week". */}

      {/* ═════════ TOP VEHICLES DEALS OF THE WEEK ═════════ */}
      <MobileTopVehicleDeals />

      {/* ═════════ CALCULATE A CAR YOURSELF ═════════ */}
      <MobileCalculateCar />

      {/* ═════════ HOW WE WORK ═════════ */}
      <MobileHowWeWork />

      {/* ═════════ HOW TO BUY A TURNKEY CAR — replaces Before & After ═════════ */}
      <MobileHowToBuyTurnkey />

      {/* ═════════ WE HAVE PERFECT SERVICE — replaces former Reviews block ═════════ */}
      <MobileWeHavePerfectService />

      {/* ═════════ TURNKEY SERVICES — 8 yellow cards ═════════
           Per Figma DevMode (Frame 1707479342, 331 × 1142):
             • 8 cards, all 331 wide
             • Card heights: 151, 136, 153, 134, 117, 117, 134, 151 (Σ=1093 + 7×7=49 ⇒ 1142)
             • Inter-card gap: 7 px
             • Card padding (inner): 24 top, 24 bottom, 10 left, 10 right
             • Side margin from screen edge: 16 / 16 (same as other sections)
             • Card text: /N + TITLE on top row, body text below
             • Number "/N" — H Medium 24
             • Title — H Medium 16, uppercase
             • Body — H Regular 14
             • Colours: black text on #FEAE00 (yellow) cards, black gaps between cards
       ═════════════════════════════════ */}
      <MobileTurnkeyServices />

      {/* ═════════ BEFORE AND AFTER — horizontal-scroll carousel ═════════
           Per Figma mobile mock:
             • Title          "BEFORE AND AFTER"       — H Bold 24, #FEAE00
             • Subtitle       "OUR CLIENTS RECEIVE"    — H Medium 16, #FEAE00 (line 1)
                              "THE BEST SERVICE"       — H Medium 16, #FFFFFF (line 2)
             • Card           328 × 317, side margins 16/16
             • /before        H Medium 12, white,    inset-left 62.5 inside card
             • /after         H Medium 12, #FEAE00,  inset-right 61.5 inside card
             • Photos         150 × 144 each, side-by-side
             • BMV / model    H Bold 16,    white
             • Info rows      H Regular 12, gray label · white value · price #FEAE00
             • Pagination     ← 01/10 →   block side insets 116 / 115
       ═════════════════════════════════════════════════════════════════ */}
      <MobileBeforeAndAfter
        items={siteInfo?.before_after?.items}
        activeIdx={beforeAfterIdx}
        setActiveIdx={setBeforeAfterIdx}
      />

      {/* ═════════ OUR CLIENTS SAY — reviews carousel ═════════
           Per Figma mobile mock (361 × 815):
             • Title  "OUR CLIENTS SAY"           — H Bold   24, #FEAE00, centered (76 px side insets, top 73)
             • Subtitle line 1 "SATISFIED CLIENTS"— H Medium 16, #FEAE00, centered
             • Subtitle line 2 "ARE OUR PRIORITY" — H Medium 16, #FFFFFF, centered
             • Google row (logo left @ 17, rating right @ 17):
                 — Google logo
                 — "4.9"                           H Bold   14, #FFFFFF
                 — 5 yellow stars                  block 80 × 16
                 — "31 Google reviews"             H Medium 12, #FFFFFF, underline
             • Heading "What customers say…"      — H Bold   24, #FFFFFF, left @ 17
             • Card (review)                       — 330 × 324, side insets 16
                 — Avatar                          40 × 40
                 — Name                            H Bold   24, #FEAE00
                 — Avatar ↔ name gap               27 px
                 — Body text                       H Regular 16, #FFFFFF
             • Pagination                          identical to Before/After block
       ═════════════════════════════════════════════════════════════════════ */}
      <MobileOurClientsSay
        reviews={reviews}
        googleRating={googleRating}
        googleReviewsCount={googleReviewsCount}
        activeIdx={reviewIdx}
        setActiveIdx={setReviewIdx}
      />

      {/* ═════════ WHY YOU PAY LESS — AND GET MORE ═════════
           Per Figma mobile mock (359 × 834):
             • Title  "WHY YOU PAY LESS"  — H Bold 24, #FEAE00, centered (top 47, side insets 65)
             •         "— AND GET MORE"   — H Bold 24, dash yellow + words white
             • Car illustration            — 328 × 328, side insets 16 / 16
             • 4 benefit blocks (298 × 433 total):
                 / LARGE SELECTION        — H Bold    16, #FEAE00, uppercase
                 More trim levels...      — H Regular 16, #FFFFFF
                 (gap title→body = 8 px;   gap between blocks = 49 px)
             • Distance title → first block = 251 px (car image fits inside)
       ═════════════════════════════════════════════════════════════════════ */}
      <MobileWhyPayLess />

      {/* ═════════ DREAM CAR CTA ═════════
           Full‑bleed card 360 × 583 (per Figma DevMode), composed of:
             • Image area (top 0 → 334) — full‑bleed photo
             • Logo  77 × 26.25 px  →  left 139, right 144, top 203
             • Title frame 231 × 48 →  left 68, right 61, top ≈ 263 (was bottom 23 of the 334-px image)
             • Title H Bold Mazzard 24 px
             • CTA text "Fill out the application…"  → top 398, left 16, right 21 — H Bold 16px
             • CTA button "Contact us"                → 294 × 45, top 477, centred (≈33 / 33), H Medium 14px
       ═════════════════════════════════ */}
      <section>
        <div
          data-testid="mobile-dream-car-cta"
          style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '360 / 583',
            overflow: 'hidden',
            background: '#000',
          }}
        >
          {/* Background photo — sits in the top 334 px of the 583 px card */}
          <img
            src="/mobile/young-woman-with-salesman-carshowroom-1@2x.png"
            alt=""
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              // 334 / 583 of the card height → reproduces the original 360 × 334 photo
              height: 'calc(100% * (334 / 583))',
              objectFit: 'cover',
              display: 'block',
            }}
            loading="lazy"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />

          {/* BIBI logo — 77 × 26.25, top 203 of a 583‑px frame */}
          <img
            src="/mobile/BiBi-logo-02-1.svg"
            alt="BIBI"
            data-testid="mobile-dream-car-cta-logo"
            style={{
              position: 'absolute',
              top: 'calc(100% * (203 / 583))',
              left: 'calc(100% * (139 / 360))',
              width: 'calc(100% * (77 / 360))',
              height: 'auto',
              aspectRatio: '77 / 26.25',
              zIndex: 2,
            }}
          />

          {/* Headline "Want to drive / your dream car?" — frame 231 × 48,
              previously anchored to bottom 23 of the 334‑px image →
              top ≈ 263 of the 583‑px card. */}
          <h2
            data-testid="mobile-dream-car-cta-title"
            style={{
              position: 'absolute',
              top: 'calc(100% * (263 / 583))',
              left: 'calc(100% * (68 / 360))',
              right: 'calc(100% * (61 / 360))',
              margin: 0,
              fontFamily: "'Mazzard', 'Mazzard H', system-ui, -apple-system, sans-serif",
              fontWeight: 700,
              fontSize: 24,
              lineHeight: '24px',
              textTransform: 'uppercase',
              textAlign: 'center',
              letterSpacing: 0,
              zIndex: 2,
            }}
          >
            <span style={{ color: '#FEAE00', display: 'block', whiteSpace: 'nowrap' }}>Want to drive</span>
            <span style={{ color: '#FFFFFF', display: 'block', whiteSpace: 'nowrap' }}>your dream car?</span>
          </h2>

          {/* "Fill out the application and we will find the best offer for you"
              — H Bold 16 px, white, centred. Top 398 / 583.
              Per Figma side padding is 16 / 21 — we equalise to 18 / 18 so the
              block sits perfectly centred (within the 16…21 tolerance). */}
          <p
            data-testid="mobile-dream-car-cta-subtitle"
            style={{
              position: 'absolute',
              top: 'calc(100% * (398 / 583))',
              left: 'calc(100% * (18 / 360))',
              right: 'calc(100% * (18 / 360))',
              margin: 0,
              fontFamily: "'Mazzard', 'Mazzard H', system-ui, -apple-system, sans-serif",
              fontWeight: 700,
              fontSize: 16,
              lineHeight: '20px',
              letterSpacing: 0,
              color: '#FFFFFF',
              textAlign: 'center',
              zIndex: 2,
            }}
          >
            Fill out the application and we will find the best offer for you
          </p>

          {/* Contact us button — 294 × 45, top 477 / 583, horizontally centred
              (≈33 / 33 px → "выровнено по пикселям слева/справа для центровки"). */}
          <a
            href="/contacts"
            data-testid="mobile-dream-car-cta-button"
            style={{
              position: 'absolute',
              top: 'calc(100% * (477 / 583))',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 'calc(100% * (294 / 360))',
              maxWidth: 294,
              height: 45,
              background: '#FEAE00',
              color: '#000',
              borderRadius: 4,
              fontFamily: "'Mazzard', 'Mazzard H', system-ui, -apple-system, sans-serif",
              fontWeight: 500,
              fontSize: 14,
              lineHeight: '14px',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              textAlign: 'center',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2,
              boxSizing: 'border-box',
              transition: 'filter 150ms ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(1.1)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.filter = 'none'; }}
          >
            Contact us
          </a>
        </div>
      </section>

      {/* ═════════ FAQ ═════════
           Per Figma DevMode (Frame 1707479369):
             • Card 361 × 502, full‑width, black background
             • Title "FAQ" — H Bold Mazzard 24px, colour #FEAE00,
               horizontally centred (≈157 / 156 side padding), top 46
             • Gap title → first item: 54px
             • Items block 276 × 252 (5 items, hugging content)
             • Item text — H Medium Mazzard 14px, ALL WHITE (incl. "1/", "2/"…)
             • Vertical gap between items: 29px
             • Item starts at left 16, plus icon sits flush against right edge
             • Bottom space from item 5 baseline to card bottom (per Figma)
       ═════════════════════════════════ */}
      {faqEnabled ? (
        <section
          data-testid="mobile-faq"
          style={{
            position: 'relative',
            width: '100%',
            background: '#000',
            color: '#fff',
            overflow: 'visible',
          }}
        >
          {/* FAQ title — centred horizontally, top 46 */}
          <h2
            data-testid="mobile-faq-title"
            style={{
              position: 'absolute',
              top: 46,
              left: 0,
              right: 0,
              margin: 0,
              textAlign: 'center',
              fontFamily: "'Mazzard', 'Mazzard H', system-ui, -apple-system, sans-serif",
              fontWeight: 700,
              fontSize: 24,
              lineHeight: '24px',
              letterSpacing: 0,
              color: '#FEAE00',
              textTransform: 'uppercase',
            }}
          >
            FAQ
          </h2>

          {/* Items list — top 46 + 24 + 54 = 124, side 16 / 16.
              Bottom padding 69: total gap to footer LOGO becomes
              69 + 53 (logo top inside footer) = 122 — per Figma DevMode. */}
          <div
            data-testid="mobile-faq-list"
            style={{
              position: 'relative',
              paddingTop: 124,
              paddingLeft: 16,
              paddingRight: 16,
              paddingBottom: 69,
              boxSizing: 'border-box',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 29 }}>
              {faqList.map((it, i) => {
                const isOpen = openFaq === it.id;
                return (
                  <div key={it.id}>
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : it.id)}
                      data-testid={`mobile-faq-toggle-${i}`}
                      style={{
                        width: '100%',
                        background: 'transparent',
                        border: 'none',
                        padding: 0,
                        margin: 0,
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        gap: 12,
                      }}
                    >
                      <span
                        style={{
                          flex: '1 1 auto',
                          fontFamily: "'Mazzard', 'Mazzard H', system-ui, -apple-system, sans-serif",
                          fontWeight: 500,
                          fontSize: 14,
                          lineHeight: '17px',
                          letterSpacing: 0,
                          color: '#FFFFFF',
                        }}
                      >
                        {i + 1}/ {it.question}
                      </span>
                      <span
                        aria-hidden
                        style={{
                          flex: '0 0 auto',
                          width: 18,
                          height: 18,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#FFFFFF',
                          transform: isOpen ? 'rotate(45deg)' : 'none',
                          transition: 'transform 200ms ease',
                          marginTop: 0,
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                          <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                        </svg>
                      </span>
                    </button>
                    {isOpen && it.answer ? (
                      <div
                        style={{
                          marginTop: 10,
                          paddingRight: 30,
                          fontFamily: "'Mazzard', 'Mazzard H', system-ui, -apple-system, sans-serif",
                          fontWeight: 400,
                          fontSize: 13,
                          lineHeight: '20px',
                          color: 'rgba(255,255,255,0.8)',
                        }}
                        dangerouslySetInnerHTML={{ __html: it.answer }}
                      />
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      {/* ═════════ FOOTER ═════════
           Per Figma DevMode: card 360 × 1207, black background.
           Uses the SAME SVG iconography (viber/instagram/facebook/telegram/copyright)
           and copy strings as the desktop Footer1 component
           (see /app/frontend/src/figma_home/components/footer1.jsx).
           Layout matches the mobile Figma frame exactly:
             • Yellow #FEAE00 for primary values & icons
             • White for section labels & nav links
             • Muted gray for legal/copyright lines
             • Outline yellow "Get in touch" button (transparent fill)
       ═════════════════════════════════ */}
      <footer
        data-testid="mobile-footer"
        style={{
          position: 'relative',
          width: '100%',
          height: 1219,
          background: '#000',
          color: '#FFFFFF',
          fontFamily: "'Mazzard', 'Mazzard H', system-ui, -apple-system, sans-serif",
          overflow: 'hidden',
        }}
      >
        {/* 1 — LOGO BIBI — 133 × 46, left 16, top 53 */}
        <img
          src="/figma/BiBi-logo-02-1.svg"
          alt="BIBI Cars"
          data-testid="footer-logo"
          style={{
            position: 'absolute',
            left: 16,
            top: 53,
            width: 133,
            height: 46,
            objectFit: 'contain',
          }}
        />

        {/* 2 — PHONE NUMBER block — centred horizontally
              Label 12 H-Medium white, value 18 H-Medium yellow,
              gap label → number = 16. TOP = 141 (per Figma DevMode:
              card_height 1159 − 1018 distance-to-bottom = 141). */}
        <div
          data-testid="footer-phone-block"
          style={{
            position: 'absolute',
            top: 141,
            left: 0,
            right: 0,
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontWeight: 500,
              fontSize: 12,
              lineHeight: '14px',
              color: '#FFFFFF',
              letterSpacing: 0,
            }}
          >
            Phone number:
          </div>
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {phones.map((p, i) => (
              <a
                key={i}
                href={`tel:${p.replace(/\s+/g, '')}`}
                data-testid={`footer-phone-${i}`}
                style={{
                  fontWeight: 500,
                  fontSize: 18,
                  lineHeight: '22px',
                  color: '#FEAE00',
                  textDecoration: 'none',
                }}
              >
                {p}
              </a>
            ))}
          </div>
        </div>

        {/* 3 — GET IN TOUCH — outline yellow button, 328 × 45,
              top = phone block bottom (141+78=219) + 48 gap = 267.
              Opens the shared GetInTouchModal (same as desktop footer1). */}
        <button
          type="button"
          data-testid="footer-get-in-touch"
          onClick={() => openGetInTouch()}
          style={{
            position: 'absolute',
            top: 267,
            left: 16,
            right: 16,
            width: 'auto',
            height: 45,
            background: 'transparent',
            color: '#FEAE00',
            border: '1px solid #FEAE00',
            borderRadius: 4,
            padding: '10px 32px',
            boxSizing: 'border-box',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "'Mazzard', 'Mazzard H', system-ui, -apple-system, sans-serif",
            fontWeight: 500,
            fontSize: 14,
            lineHeight: '17px',
            letterSpacing: '0.02em',
            cursor: 'pointer',
            transition: 'background 150ms ease, color 150ms ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#FEAE00'; e.currentTarget.style.color = '#000'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#FEAE00'; }}
        >
          Get in touch
        </button>

        {/* 4 — ADDRESS — left 16, label 12 H-Medium white, value 18 H-Medium yellow.
              Gap label → address = 16. Top 386.6 (back-derived from divider 567.6
              with WH→divider gap 35, address→WH gap 18, address height ≈ 110). */}
        <div
          data-testid="footer-address-block"
          style={{
            position: 'absolute',
            top: 386.6,
            left: 16,
            right: 16,
          }}
        >
          <div
            style={{
              fontWeight: 500,
              fontSize: 12,
              lineHeight: '14px',
              color: '#FFFFFF',
            }}
          >
            Address:
          </div>
          <div
            style={{
              marginTop: 16,
              fontWeight: 500,
              fontSize: 18,
              lineHeight: '24px',
              color: '#FEAE00',
            }}
          >
            {addresses.map((a, i) => (
              <div key={i} style={{ marginTop: i === 0 ? 0 : 8 }}>{a}</div>
            ))}
          </div>
        </div>

        {/* 5 — WORKING HOURS — single line with parentheses, gray #949494,
              H-Medium 14. Address→WH gap = 18 → WH top = 514.6.
              WH bottom = 532.6. */}
        <div
          data-testid="footer-working-hours"
          style={{
            position: 'absolute',
            top: 514.6,
            left: 16,
            right: 16,
            fontWeight: 500,
            fontSize: 14,
            lineHeight: '18px',
            color: '#949494',
          }}
        >
          ( Working hours: {siteInfo?.footer?.contacts?.working_hours || 'Mon - Fri, 10.00 - 19.00'} )
        </div>

        {/* 5b — REGISTRATION ADDRESS — gray #949494, H-Medium 14, 2 logical
              lines (label + value). Symmetric vertical gap (~10 px) to the
              working hours above and to the divider below. */}
        <div
          data-testid="footer-registration-address"
          style={{
            position: 'absolute',
            top: 542.6,
            left: 16,
            right: 16,
            fontWeight: 500,
            fontSize: 14,
            lineHeight: '18px',
            color: '#949494',
          }}
        >
          <div>Registration address:</div>
          <div>
            {siteInfo?.footer?.contacts?.registration_address
              || 'Republic of Bulgaria, 1415, Sofia, Cherni Vrah Blvd., 230'}
          </div>
        </div>

        {/* 6 — DIVIDER — gray line. Shifted +60 from original 567.6 to make
              room for the registration-address block introduced above. */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            left: 16,
            right: 16,
            top: 627.6,
            height: 1,
            background: '#3a3a38',
          }}
        />

        {/* 7a — JOIN OUR GROUP — left 16, top 592.6 (sits below divider).
              Text 12 H-Medium white, gap 14 to Viber icon 42×42. */}
        <div
          data-testid="footer-join-our-group"
          style={{
            position: 'absolute',
            top: 652.6,
            left: 16,
            maxWidth: 196,
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
            alignItems: 'flex-start',
          }}
        >
          <span
            style={{
              fontWeight: 500,
              fontSize: 12,
              lineHeight: '15px',
              color: '#FFFFFF',
              letterSpacing: 0,
            }}
          >
            {viberLabel}
          </span>
          <a
            href={viberCommunity?.url || 'viber://chat?number=%2B359875313158'}
            target="_blank"
            rel="noreferrer noopener"
            aria-label="Viber community"
            data-testid="footer-viber-link"
            style={{ display: 'inline-flex' }}
          >
            <img
              src="/figma/basil-viber-outline.svg"
              alt=""
              width={42}
              height={42}
              style={{ display: 'block' }}
            />
          </a>
        </div>

        {/* 7b — SOCIAL MEDIA — same level (top 592.6), right 16.
              Label 12 H-Medium white, aligned LEFT (visually under Instagram).
              Gap 32 to icon row. Icons 32×32, gap 22 between. */}
        <div
          data-testid="footer-social-media"
          style={{
            position: 'absolute',
            top: 652.6,
            right: 16,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
          }}
        >
          <span
            style={{
              fontWeight: 500,
              fontSize: 12,
              lineHeight: '14px',
              color: '#FFFFFF',
              letterSpacing: 0,
            }}
          >
            Social media:
          </span>
          <div style={{ marginTop: 32, display: 'flex', alignItems: 'center', gap: 22 }}>
            <a
              href={socials?.instagram?.url || '#'}
              target="_blank"
              rel="noreferrer noopener"
              aria-label="Instagram"
              data-testid="footer-social-instagram"
              style={{ display: 'inline-flex' }}
            >
              <img src="/figma/ri-instagram-line.svg" alt="" width={32} height={32} style={{ display: 'block' }} />
            </a>
            <a
              href={socials?.facebook?.url || '#'}
              target="_blank"
              rel="noreferrer noopener"
              aria-label="Facebook"
              data-testid="footer-social-facebook"
              style={{ display: 'inline-flex' }}
            >
              <img src="/figma/ic-twotone-facebook.svg" alt="" width={32} height={32} style={{ display: 'block' }} />
            </a>
            <a
              href={socials?.telegram?.url || '#'}
              target="_blank"
              rel="noreferrer noopener"
              aria-label="Telegram"
              data-testid="footer-social-telegram"
              style={{ display: 'inline-flex' }}
            >
              <img src="/figma/ic-round-telegram.svg" alt="" width={32} height={32} style={{ display: 'block' }} />
            </a>
          </div>
        </div>

        {/* 8 — NAV (Catalog / Calculator / About Us / Blog) — top 732.6,
              left/right 41, items H-Regular 16, white, gap 24, centred. */}
        <nav
          data-testid="footer-nav"
          style={{
            position: 'absolute',
            top: 792.6,
            left: 41,
            right: 41,
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
            alignItems: 'center',
          }}
        >
          {[
            { label: 'CATALOG', href: '/catalog' },
            { label: 'CALCULATOR', href: '/calculator' },
            { label: 'ABOUT US', href: '/about' },
            { label: 'BLOG', href: '/blog' },
          ].map((it) => (
            <a
              key={it.label}
              href={it.href}
              data-testid={`footer-nav-${it.label.toLowerCase().replace(' ', '-')}`}
              style={{
                fontWeight: 400,
                fontSize: 16,
                lineHeight: '20px',
                letterSpacing: '0.04em',
                color: '#FFFFFF',
                textDecoration: 'none',
                transition: 'color 150ms ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#FEAE00'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#FFFFFF'; }}
            >
              {it.label}
            </a>
          ))}
        </nav>

        {/* 9 — LEGAL ROW (Conditions / Privacy Policy / Cookies) — top 946.48,
              left/right 16, 12 H-Medium white, justify between.
              Opens the shared PolicyModal (same as desktop footer1). */}
        <div
          data-testid="footer-legal-row"
          style={{
            position: 'absolute',
            top: 1006.48,
            left: 16,
            right: 16,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {[
            { label: 'CONDITIONS', key: 'conditions' },
            { label: 'PRIVACY POLICY', key: 'privacy' },
            { label: 'COOKIES', key: 'cookies' },
          ].map((it) => (
            <button
              key={it.key}
              type="button"
              data-testid={`footer-policy-${it.key}`}
              onClick={() => openPolicy(it.key)}
              style={{
                background: 'transparent',
                border: 'none',
                padding: 0,
                margin: 0,
                cursor: 'pointer',
                fontFamily: "'Mazzard', 'Mazzard H', system-ui, -apple-system, sans-serif",
                fontWeight: 500,
                fontSize: 12,
                lineHeight: '14px',
                letterSpacing: '0.04em',
                color: '#FFFFFF',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                transition: 'color 150ms ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#FEAE00'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#FFFFFF'; }}
            >
              {it.label}
            </button>
          ))}
        </div>

        {/* 10 — VAT / ID / COMPANY — top 981.601, left/right 16,
              10 H-Medium muted gray #5E5E5E, 3 columns justify-between. */}
        <div
          data-testid="footer-vat-id"
          style={{
            position: 'absolute',
            top: 1041.601,
            left: 16,
            right: 16,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontWeight: 500,
            fontSize: 10,
            lineHeight: '14px',
            letterSpacing: '0.04em',
            color: '#5E5E5E',
          }}
        >
          <span>VAT BG206637283</span>
          <span>ID 206637283</span>
          <span>PM AUTO GROUP LTD</span>
        </div>

        {/* 11 — WEBSITE CREDITS — top 1076.06.
              Two centred links: "/ Website design - O.la /" + "/ Website made with Eva-X /"
              both H-Medium 12, white, with hover to yellow.
              Same destinations as desktop footer1. */}
        <div
          data-testid="footer-website-credits"
          style={{
            position: 'absolute',
            top: 1136.06,
            left: 16,
            right: 16,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <a
            href="https://www.olhalazarieva.com"
            target="_blank"
            rel="noreferrer noopener"
            data-testid="footer-credit-design"
            style={{
              fontWeight: 500,
              fontSize: 12,
              lineHeight: '14px',
              letterSpacing: '0.04em',
              color: '#FFFFFF',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              transition: 'color 150ms ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#FEAE00'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#FFFFFF'; }}
          >
            / Website design - O.la /
          </a>
          <a
            href="https://www.eva-x.cx.com"
            target="_blank"
            rel="noreferrer noopener"
            data-testid="footer-credit-evax"
            style={{
              fontWeight: 500,
              fontSize: 12,
              lineHeight: '14px',
              letterSpacing: '0.04em',
              color: '#FFFFFF',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              transition: 'color 150ms ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#FEAE00'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#FFFFFF'; }}
          >
            / Website made with Eva-X /
          </a>
        </div>

        {/* 12 — © ALL RIGHT RESERVED — bottom 19, left/right 72.
              Copyright SVG 18×18 + gap 7 + H-Medium 10 WHITE text. */}
        <div
          data-testid="footer-copyright"
          style={{
            position: 'absolute',
            bottom: 19,
            left: 72,
            right: 72,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 7,
            color: '#FFFFFF',
          }}
        >
          <img
            src="/figma/ant-design-copyright-circle-outlined.svg"
            alt=""
            width={18}
            height={18}
            style={{ display: 'block' }}
            aria-hidden="true"
          />
          <span
            style={{
              fontWeight: 500,
              fontSize: 10,
              lineHeight: '14px',
              letterSpacing: '0.04em',
              color: '#FFFFFF',
              whiteSpace: 'nowrap',
            }}
          >
            {new Date().getFullYear()}. All right reserved. BIBI CARS
          </span>
        </div>
      </footer>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────── */
/* Reusable mobile field component                                         */
/* Typography (per Figma):                                                  */
/*   • label       → Helvetica Medium 14px                                  */
/*   • input value → Helvetica Regular 14px                                 */
/*   • chevron 12×12 right-aligned (dropdown-style affordance)              */
/* ─────────────────────────────────────────────────────────────────────── */

function Field({ label, value, onChange, placeholder, type = 'text', inputMode, maxLength }) {
  const FONT = "'Helvetica Neue', Helvetica, Arial, sans-serif";
  return (
    <label className="block">
      <span
        className="block"
        style={{
          fontFamily: FONT,
          fontSize: 14,
          fontWeight: 500,
          lineHeight: '18px',
          color: '#fff',
          marginBottom: 6,
        }}
      >
        {label}
      </span>
      <div className="relative">
        <input
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          type={type}
          inputMode={inputMode}
          maxLength={maxLength}
          className="w-full bg-transparent border border-[#555452] rounded text-white focus:outline-none focus:border-[#FEAE00]"
          style={{
            height: 45,
            paddingLeft: 16,
            paddingRight: 36,
            fontFamily: FONT,
            fontSize: 14,
            fontWeight: 400, // H Regular for the value/placeholder
            letterSpacing: 0,
          }}
        />
        <span
          aria-hidden
          className="absolute pointer-events-none text-white/80"
          style={{ right: 14, top: '50%', transform: 'translateY(-50%)' }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M2 4l4 4 4-4"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </div>
    </label>
  );
}

/* ─────────────────────────────────────────────────────────────────────── */
/* MobileSearchFromAmericaKorea                                            */
/* 1‑to‑1 port of the Figma mobile mock for the "Search for cars from      */
/* America and Korea / Most popular brands" block.                         */
/*                                                                         */
/* Layout:                                                                  */
/*   • Outer section uses GRAY (#1d1d1b) background — same as desktop      */
/*     catalog-header — so the inner BLACK card visibly separates.         */
/*   • No horizontal padding on the section: the heading is full-width,    */
/*     center-aligned, and spans across the screen (not a narrow column).  */
/*                                                                         */
/* Typography (Mazzard H — exact weights requested):                       */
/*   • "Search for cars / from America and Korea" → H Bold 24px, #FEAE00   */
/*   • "Most Popular Brands"                       → H Regular 14px, #fff  */
/*   • "Other Brands +"                            → H Medium 14px, #FEAE00*/
/*                                                                         */
/* Brand grid:                                                              */
/*   • 3 columns × N rows, 1px #1c1c1c dividers between every cell         */
/*     (top + left on the wrapper, bottom + right on each cell — same      */
/*     trick as desktop so internal lines never duplicate).                */
/*   • Featured 6 use the original Figma pngwing assets in /mobile/.       */
/*   • Additional brands (expanded) use /figma/brands/<slug>.webp.         */
/*                                                                         */
/* "Other brands +" toggle:                                                 */
/*   • Click reveals 6 more brands per click (same logic as desktop        */
/*     BrandLogos1).                                                       */
/*   • When the full list is visible the label switches to "Hide brands −".*/
/* ─────────────────────────────────────────────────────────────────────── */

const MOBILE_FEATURED_BRANDS = [
  { slug: 'audi',    name: 'Audi',    src: '/mobile/pngwing-com-4-1@2x.png' },
  { slug: 'bmw',     name: 'BMW',     src: '/mobile/pngwing-com-3-1@2x.png' },
  { slug: 'jeep',    name: 'Jeep',    src: '/mobile/pngwing-com-5-1@2x.png' },
  { slug: 'toyota',  name: 'Toyota',  src: '/mobile/pngwing-com-1-1@2x.png' },
  { slug: 'ford',    name: 'Ford',    src: '/mobile/pngwing-com-6-2@2x.png' },
  { slug: 'hyundai', name: 'Hyundai', src: '/mobile/pngwing-com-1@2x.png' },
];

const MOBILE_EXTRA_BRANDS = [
  'acura','alfa-romeo','aston-martin','bentley','buick','cadillac',
  'chevrolet','chrysler','dodge','ferrari','fiat','genesis','gmc',
  'honda','hummer','infiniti','international','isuzu','jaguar','kia',
  'lamborghini','land-rover','lexus','lincoln','lotus','maserati',
  'mazda','mercedes','mg','mini','mitsubishi','nissan','polestar',
  'pontiac','porsche','ram','rolls-royce','saab','smart','subaru',
  'suzuki','tesla','volkswagen','volvo','yamaha',
].map((slug) => ({
  slug,
  name: slug
    .split('-')
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' '),
  src: `/figma/brands/${slug}.webp`,
}));

const MOBILE_ALL_BRANDS = [...MOBILE_FEATURED_BRANDS, ...MOBILE_EXTRA_BRANDS];
const MOBILE_PAGE = 6;

function MobileSearchFromAmericaKorea() {
  const FONT = "'Mazzard', 'Mazzard H', system-ui, -apple-system, sans-serif";
  const [visible, setVisible] = useState(MOBILE_PAGE);
  const total = MOBILE_ALL_BRANDS.length;
  const showMore = visible < total;
  const expanded = visible > MOBILE_PAGE;

  const handleMore = () => setVisible((v) => Math.min(total, v + MOBILE_PAGE));
  const handleHide = () => setVisible(MOBILE_PAGE);

  return (
    <section
      data-testid="mobile-search-from-america-korea"
      style={{
        backgroundColor: '#1d1d1b',
        padding: '40px 20px 48px',
        boxSizing: 'border-box',
        width: '100%',
      }}
    >
      {/* Title — full‑width, centered, both lines amber */}
      <h2
        style={{
          margin: '0 0 28px 0',
          textAlign: 'center',
          fontFamily: FONT,
          fontWeight: 700,
          fontSize: 24,
          lineHeight: '100%',
          letterSpacing: 0,
          textTransform: 'uppercase',
          color: '#FEAE00',
          width: '100%',
        }}
      >
        Search for cars
        <br />
        from America and Korea
      </h2>

      {/* Black card */}
      <div
        style={{
          backgroundColor: '#000',
          border: '1px solid #1c1c1c',
          borderRadius: 6,
          padding: '26px 16px 24px',
        }}
      >
        {/* Subtitle — H Regular 14 */}
        <div
          style={{
            textAlign: 'center',
            fontFamily: FONT,
            fontWeight: 400,
            fontSize: 14,
            lineHeight: '99.9%',
            color: '#FFFFFF',
            textTransform: 'uppercase',
            marginBottom: 22,
          }}
        >
          Most popular brands
        </div>

        {/* Brand grid (3 cols, dividers via outer top+left and per-cell bottom+right) */}
        <div
          className="grid grid-cols-3"
          style={{
            borderTop: '1px solid #1c1c1c',
            borderLeft: '1px solid #1c1c1c',
          }}
        >
          {MOBILE_ALL_BRANDS.slice(0, visible).map((b) => (
            <a
              key={b.slug}
              href={`/catalog?make=${encodeURIComponent(b.slug)}`}
              data-testid={`mobile-brand-${b.slug}`}
              className="flex items-center justify-center"
              aria-label={b.name}
              style={{
                height: 78,
                borderRight: '1px solid #1c1c1c',
                borderBottom: '1px solid #1c1c1c',
                padding: 10,
                boxSizing: 'border-box',
              }}
            >
              <img
                src={b.src}
                alt={b.name}
                style={{
                  maxHeight: 44,
                  maxWidth: '100%',
                  width: 'auto',
                  height: 'auto',
                  objectFit: 'contain',
                }}
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  if (e.currentTarget.nextSibling) {
                    e.currentTarget.nextSibling.style.display = 'inline';
                  }
                }}
              />
              <span
                style={{
                  display: 'none',
                  fontFamily: FONT,
                  fontSize: 12,
                  color: '#fff',
                  textTransform: 'uppercase',
                }}
              >
                {b.name}
              </span>
            </a>
          ))}
        </div>
      </div>

      {/* Other brands + / Hide brands − */}
      <div style={{ marginTop: 22, display: 'flex', justifyContent: 'center' }}>
        {showMore ? (
          <button
            type="button"
            onClick={handleMore}
            data-testid="mobile-other-brands"
            style={{
              background: 'transparent',
              border: 'none',
              padding: '4px 8px',
              cursor: 'pointer',
              fontFamily: FONT,
              fontWeight: 500,
              fontSize: 14,
              lineHeight: '99.9%',
              color: '#FEAE00',
              textTransform: 'uppercase',
              textDecoration: 'underline',
              textUnderlineOffset: 3,
            }}
          >
            Other brands +
          </button>
        ) : expanded ? (
          <button
            type="button"
            onClick={handleHide}
            data-testid="mobile-hide-brands"
            style={{
              background: 'transparent',
              border: 'none',
              padding: '4px 8px',
              cursor: 'pointer',
              fontFamily: FONT,
              fontWeight: 500,
              fontSize: 14,
              lineHeight: '99.9%',
              color: '#FEAE00',
              textTransform: 'uppercase',
              textDecoration: 'underline',
              textUnderlineOffset: 3,
            }}
          >
            Hide brands −
          </button>
        ) : null}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────── */
/* MobileTopVehicleDeals                                                   */
/* 1‑to‑1 port of the Figma mobile mock — "Top vehicles deals of the week" */
/*                                                                         */
/* Section structure (top→bottom):                                          */
/*   1. Title (2 lines)         — "TOP VEHICLES DEALS" / "OF THE WEEK"     */
/*                                Mazzard H Bold 24, orange + white        */
/*   2. Subtitle (3 lines)      — Mazzard H Medium 16, 258×57              */
/*   3. Vehicle-type filter     — 4 icons (car/moto/truck/van), 294×24,    */
/*                                horizontal hairline above & below         */
/*   4. Price-range tabs        — 10-15K · 15-25K · 30-50K · PROPOSALS-46  */
/*                                Mazzard H Regular 12                     */
/*   5. Vehicle card            — image 336.5×… with "Trading date" strip, */
/*                                yellow timer chip, compare/favorite      */
/*                                round buttons, model title, purchase     */
/*                                price box, mileage/engine/drive grid,    */
/*                                estimated final cost, MORE DETAILS CTA   */
/*   6. Pager                   — ‹ 01/47 ›  (130×24)                      */
/*   7. MORE VEHICLES +         — Mazzard H Medium 14, 127×17, underlined  */
/* ─────────────────────────────────────────────────────────────────────── */

const TOP_DEALS_CARS = [
  {
    id: 1,
    name: '2025 Lucid Motors Air Pure',
    img: '/mobile/image-15@2x.png',
    tradingDate: '34.13.2027',
    timer: '1 d: 4h: 35m',
    purchasePrice: '20 000-30 000 EURO',
    mileage: '65 900 KM',
    engine: '4.6L / Patrol',
    drive: 'All-wheel',
    finalCost: '50 000 - 70 000 EURO',
  },
  {
    id: 2,
    name: '2024 BMW M5 Competition',
    img: '/mobile/image-93@2x.png',
    tradingDate: '12.04.2027',
    timer: '0 d: 12h: 02m',
    purchasePrice: '45 000-55 000 EURO',
    mileage: '12 400 KM',
    engine: '4.4L V8 Bi-Turbo',
    drive: 'All-wheel',
    finalCost: '78 000 - 92 000 EURO',
  },
  {
    id: 3,
    name: '2023 Mercedes-AMG GT 63',
    img: '/mobile/image-74@2x.png',
    tradingDate: '08.05.2027',
    timer: '2 d: 6h: 11m',
    purchasePrice: '60 000-72 000 EURO',
    mileage: '8 100 KM',
    engine: '4.0L V8 Bi-Turbo',
    drive: 'All-wheel',
    finalCost: '110 000 - 130 000 EURO',
  },
  {
    id: 4,
    name: '2024 Tesla Model S Plaid',
    img: '/mobile/image-76@2x.png',
    tradingDate: '21.06.2027',
    timer: '0 d: 4h: 50m',
    purchasePrice: '55 000-65 000 EURO',
    mileage: '4 200 KM',
    engine: 'Triple-Motor EV',
    drive: 'All-wheel',
    finalCost: '95 000 - 115 000 EURO',
  },
];

const VEHICLE_TYPES = [
  { id: 'car',   kind: 'lucide',  Icon: Car,  label: 'Cars' },
  { id: 'moto',  kind: 'lucide',  Icon: Bike, label: 'Motorbikes' },
  { id: 'truck', kind: 'mask',    src: '/figma/ph_truck.svg', label: 'Trucks' },
  { id: 'van',   kind: 'mask',    src: '/figma/ep_van.svg',   label: 'Vans' },
];

const PRICE_TABS = ['10-15K', '15-25K', '30-50K'];

function MobileTopVehicleDeals() {
  const FONT = "'Mazzard', 'Mazzard H', system-ui, -apple-system, sans-serif";
  const [vehicleType, setVehicleType] = useState('car');
  const [priceTab, setPriceTab] = useState('10-15K');
  const [idx, setIdx] = useState(0);
  const [favorited, setFavorited] = useState({});
  const [compared, setCompared] = useState({});

  // Real card list — pager and counter follow it 1:1.
  const visible = TOP_DEALS_CARS;
  const total = visible.length;
  const safeIdx = total ? ((idx % total) + total) % total : 0;
  const current = visible[safeIdx];
  const proposals = total; // "Proposals - N" mirrors the real number of offers
  const counter = `${String(safeIdx + 1).padStart(2, '0')}/${String(total).padStart(2, '0')}`;

  const goPrev = () => setIdx((v) => (total ? (v - 1 + total) % total : 0));
  const goNext = () => setIdx((v) => (total ? (v + 1) % total : 0));

  // Touch-swipe handlers (real horizontal pagination)
  const touchRef = useRef({ x: 0, y: 0, active: false });
  const onTouchStart = (e) => {
    const t = e.touches[0];
    touchRef.current = { x: t.clientX, y: t.clientY, active: true };
  };
  const onTouchEnd = (e) => {
    if (!touchRef.current.active) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchRef.current.x;
    const dy = t.clientY - touchRef.current.y;
    touchRef.current.active = false;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) goNext(); else goPrev();
    }
  };

  if (!total) return null;

  return (
    <section
      data-testid="mobile-top-vehicles-deals"
      style={{
        backgroundColor: '#000',
        padding: '40px 20px 48px',
        fontFamily: FONT,
        color: '#fff',
      }}
    >
      {/* 1 — Title */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <h2
          style={{
            margin: 0,
            fontFamily: FONT,
            fontWeight: 700,
            fontSize: 24,
            lineHeight: '100%',
            letterSpacing: 0,
            textTransform: 'uppercase',
          }}
        >
          <span style={{ color: '#FEAE00', display: 'block' }}>Top vehicles deals</span>
          <span style={{ color: '#FFFFFF', display: 'block', marginTop: 4 }}>of the week</span>
        </h2>
      </div>

      {/* 2 — Subtitle (Mazzard H Medium 16, 258×57) */}
      <div
        style={{
          textAlign: 'center',
          margin: '0 auto 28px',
          width: 258,
          maxWidth: '100%',
          fontFamily: FONT,
          fontWeight: 500,
          fontSize: 16,
          lineHeight: '20px',
          textTransform: 'uppercase',
          letterSpacing: 0,
        }}
      >
        <span style={{ color: '#FEAE00' }}>Thousands of listings.</span>
        <br />
        <span style={{ color: '#FFFFFF' }}>Only the best make the cut.</span>
        <br />
        <span style={{ color: '#FFFFFF' }}>Updated weekly</span>
      </div>

      {/* 3 — Vehicle-type filter row (294×24) — same icons as web (lucide-react) */}
      <div
        style={{
          borderTop: '1px solid #2a2a28',
          borderBottom: '1px solid #2a2a28',
          padding: '14px 0',
          marginBottom: 18,
        }}
      >
        <div
          role="tablist"
          aria-label="Vehicle type"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            maxWidth: 294,
            margin: '0 auto',
            height: 24,
          }}
        >
          {VEHICLE_TYPES.map((v) => {
            const active = vehicleType === v.id;
            const color = active ? '#FEAE00' : '#FFFFFF';
            return (
              <button
                key={v.id}
                type="button"
                role="tab"
                aria-selected={active}
                aria-label={v.label}
                onClick={() => setVehicleType(v.id)}
                data-testid={`mobile-deals-type-${v.id}`}
                style={{
                  background: 'transparent',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  width: 32,
                  height: 24,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color,
                  transition: 'color 150ms ease',
                }}
              >
                {v.kind === 'lucide' ? (
                  <v.Icon size={22} strokeWidth={1.6} />
                ) : (
                  <span
                    aria-hidden="true"
                    style={{
                      display: 'inline-block',
                      width: 22,
                      height: 22,
                      backgroundColor: color,
                      WebkitMaskImage: `url(${v.src})`,
                      maskImage: `url(${v.src})`,
                      WebkitMaskRepeat: 'no-repeat',
                      maskRepeat: 'no-repeat',
                      WebkitMaskPosition: 'center',
                      maskPosition: 'center',
                      WebkitMaskSize: 'contain',
                      maskSize: 'contain',
                      transition: 'background-color 150ms ease',
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4 — Price-range tabs + proposals counter (181×12 / 83×12) */}
      <div
        role="tablist"
        aria-label="Price range"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          marginBottom: 18,
          fontFamily: FONT,
          fontWeight: 400,
          fontSize: 12,
          lineHeight: '12px',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'nowrap' }}>
          {PRICE_TABS.map((t) => {
            const active = priceTab === t;
            return (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setPriceTab(t)}
                data-testid={`mobile-deals-price-${t}`}
                style={{
                  background: 'transparent',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  fontFamily: FONT,
                  fontWeight: active ? 500 : 400,
                  fontSize: 12,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  color: active ? '#FEAE00' : '#FFFFFF',
                  whiteSpace: 'nowrap',
                }}
              >
                {t}
              </button>
            );
          })}
        </div>
        <span style={{ color: '#FFFFFF', whiteSpace: 'nowrap' }}>Proposals - {proposals}</span>
      </div>

      {/* 5 — Vehicle card (with real touch swipe) */}
      <article
        data-testid={`mobile-deal-${current.id}`}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        style={{
          backgroundColor: '#1d1d1b',
          borderRadius: 8,
          overflow: 'hidden',
          padding: 12,
          width: '100%',
          maxWidth: 336.5,
          margin: '0 auto',
          touchAction: 'pan-y',
        }}
      >
        {/* Image with overlays */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '312 / 220',
            overflow: 'hidden',
            borderRadius: 6,
            backgroundColor: '#0a0a0a',
          }}
        >
          <img
            src={current.img}
            alt={current.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            loading="lazy"
            onError={(e) => { e.currentTarget.src = '/mobile/image-15@2x.png'; }}
          />

          {/* Trading date chip — aligned LEFT, parallel to the timer chip below.
              Both chips share the same `left: 12px` and width 160px, so they
              line up geometrically (one at top, one at bottom of the image). */}
          <div
            style={{
              position: 'absolute',
              top: 12,
              left: 12,
              width: 160,
              height: 20,
              padding: '0 8px',
              boxSizing: 'border-box',
              background: 'rgba(255,255,255,0.7)',
              backdropFilter: 'blur(2px)',
              WebkitBackdropFilter: 'blur(2px)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: FONT,
              fontWeight: 500,
              fontSize: 12,
              lineHeight: '14px',
              color: '#0B0B0B',
              whiteSpace: 'nowrap',
            }}
          >
            Trading date - {current.tradingDate}
          </div>

          {/* Timer chip — same `left: 12` as trading date for vertical parity */}
          <div
            style={{
              position: 'absolute',
              left: 12,
              bottom: 12,
              width: 160,
              height: 24,
              padding: '0 8px',
              boxSizing: 'border-box',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              background: '#FEAE00CC',
              color: '#000',
              fontFamily: FONT,
              fontWeight: 500,
              fontSize: 12,
              lineHeight: '14px',
              borderRadius: 2,
              whiteSpace: 'nowrap',
            }}
          >
            <Clock size={12} weight="regular" color="#000" />
            {current.timer}
          </div>

          {/* Round action buttons (bottom-right) — exact Figma SVGs.
              The SVGs themselves include the 24×24 white outline ring + a
              16×16 inner glyph, so the button has NO additional border. */}
          <div style={{ position: 'absolute', right: 12, bottom: 12, display: 'flex', gap: 8, alignItems: 'center', height: 24 }}>
            <button
              type="button"
              aria-label="Compare"
              onClick={() => setCompared((s) => ({ ...s, [current.id]: !s[current.id] }))}
              data-testid={`mobile-deal-compare-${current.id}`}
              style={{
                width: 24,
                height: 24,
                padding: 0,
                border: 'none',
                background: 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                opacity: compared[current.id] ? 1 : 0.95,
                filter: compared[current.id]
                  ? 'drop-shadow(0 0 4px rgba(254,174,0,0.9))'
                  : 'none',
              }}
            >
              <img src="/figma/Frame-1707479176.svg" alt="" width={24} height={24} style={{ display: 'block' }} />
            </button>
            <button
              type="button"
              aria-label="Favorite"
              onClick={() => setFavorited((s) => ({ ...s, [current.id]: !s[current.id] }))}
              data-testid={`mobile-deal-favorite-${current.id}`}
              style={{
                width: 24,
                height: 24,
                padding: 0,
                border: 'none',
                background: 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                opacity: favorited[current.id] ? 1 : 0.95,
                filter: favorited[current.id]
                  ? 'drop-shadow(0 0 4px rgba(254,174,0,0.9))'
                  : 'none',
              }}
            >
              <img src="/figma/Frame-1707479182.svg" alt="" width={24} height={24} style={{ display: 'block' }} />
            </button>
          </div>
        </div>

        {/* Title — Mazzard H Bold 14 (per Figma spec) */}
        <h3
          style={{
            margin: '16px 0 14px',
            fontFamily: FONT,
            fontWeight: 700,
            fontSize: 14,
            lineHeight: '18px',
            color: '#FFFFFF',
          }}
        >
          {current.name}
        </h3>

        {/* Spec block — Purchase price box (left) + spec rows (right).
            Typography per Figma:
              • "Purchase price" label    → H Medium 12px, white
              • Price value (orange)      → H Bold 12px
              • Spec keys (Mileage etc.)  → H Medium 12px, white
              • Spec values               → H Bold 12px, orange */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'stretch' }}>
          <div
            style={{
              flex: '1 1 0',
              backgroundColor: '#000',
              borderRadius: 4,
              padding: '12px 14px',
              minHeight: 88,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                fontFamily: FONT,
                fontWeight: 500,
                fontSize: 12,
                lineHeight: '14px',
                color: '#FFFFFF',
                marginBottom: 6,
              }}
            >
              Purchase price
            </div>
            <div
              style={{
                fontFamily: FONT,
                fontWeight: 700,
                fontSize: 12,
                lineHeight: '16px',
                color: '#FEAE00',
              }}
            >
              {current.purchasePrice}
            </div>
          </div>

          <dl
            style={{
              flex: '1 1 0',
              margin: 0,
              display: 'grid',
              gridTemplateColumns: 'auto 1fr',
              gap: '6px 12px',
              alignContent: 'center',
              fontFamily: FONT,
              fontSize: 12,
              lineHeight: '14px',
            }}
          >
            <dt style={{ color: '#FFFFFF', fontWeight: 500 }}>Mileage</dt>
            <dd style={{ margin: 0, color: '#FEAE00', fontWeight: 700, textAlign: 'right' }}>{current.mileage}</dd>
            <dt style={{ color: '#FFFFFF', fontWeight: 500 }}>Engine</dt>
            <dd style={{ margin: 0, color: '#FEAE00', fontWeight: 700, textAlign: 'right' }}>{current.engine}</dd>
            <dt style={{ color: '#FFFFFF', fontWeight: 500 }}>Drive</dt>
            <dd style={{ margin: 0, color: '#FEAE00', fontWeight: 700, textAlign: 'right' }}>{current.drive}</dd>
          </dl>
        </div>

        {/* Estimated final cost + MORE DETAILS button (162 × 45, H Medium 12px) */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', marginTop: 14 }}>
          <div style={{ flex: '1 1 0', minWidth: 0 }}>
            <div style={{ fontFamily: FONT, fontWeight: 500, fontSize: 12, lineHeight: '14px', color: '#949494' }}>
              Estimated final
            </div>
            <div style={{ fontFamily: FONT, fontWeight: 500, fontSize: 12, lineHeight: '14px', color: '#949494' }}>
              cost to Bulgaria:
            </div>
            <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 12, lineHeight: '16px', color: '#FEAE00', marginTop: 6 }}>
              {current.finalCost}
            </div>
          </div>
          <button
            type="button"
            data-testid={`mobile-deal-more-${current.id}`}
            onClick={() => { window.location.href = '/contacts'; }}
            style={{
              flex: '0 0 auto',
              width: 162,
              height: 45,
              padding: '0 16px',
              border: 'none',
              borderRadius: 4,
              background: '#FEAE00',
              color: '#000',
              fontFamily: FONT,
              fontWeight: 500,
              fontSize: 12,
              lineHeight: '14px',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            More details
            <ArrowRight size={14} weight="bold" />
          </button>
        </div>
      </article>

      {/* 6 — Pager (130×24) — counter follows real card count 1:1 */}
      <div
        style={{
          marginTop: 22,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          height: 24,
        }}
      >
        <button
          type="button"
          aria-label="Previous"
          onClick={goPrev}
          data-testid="mobile-deals-prev"
          disabled={total <= 1}
          style={{
            width: 32,
            height: 32,
            borderRadius: 999,
            border: '1.5px solid #FEAE00',
            background: 'transparent',
            color: '#FEAE00',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: total <= 1 ? 'default' : 'pointer',
            opacity: total <= 1 ? 0.4 : 1,
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div
          style={{
            fontFamily: FONT,
            fontWeight: 500,
            fontSize: 14,
            color: '#FFFFFF',
            tabSize: 2,
            minWidth: 56,
            textAlign: 'center',
          }}
        >
          {counter}
        </div>
        <button
          type="button"
          aria-label="Next"
          onClick={goNext}
          data-testid="mobile-deals-next"
          disabled={total <= 1}
          style={{
            width: 32,
            height: 32,
            borderRadius: 999,
            border: '1.5px solid #FEAE00',
            background: '#FEAE00',
            color: '#000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: total <= 1 ? 'default' : 'pointer',
            opacity: total <= 1 ? 0.4 : 1,
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* 7 — MORE VEHICLES + (Mazzard H Medium 14) */}
      <div style={{ marginTop: 26, display: 'flex', justifyContent: 'center' }}>
        <a
          href="/catalog"
          data-testid="mobile-deals-more-vehicles"
          style={{
            fontFamily: FONT,
            fontWeight: 500,
            fontSize: 14,
            lineHeight: '17px',
            letterSpacing: '0.04em',
            color: '#FEAE00',
            textTransform: 'uppercase',
            textDecoration: 'underline',
            textUnderlineOffset: 3,
          }}
        >
          More vehicles +
        </a>
      </div>
    </section>
  );
}


/* ─────────────────────────────────────────────────────────────────────── */
/* MobileCarSearch                                                         */
/* Real dropdown filter (mirrors the web HeroFilter behaviour):            */
/*   • Brand:  click → searchable list of CAR_BRANDS.                      */
/*   • Model:  DISABLED until brand is picked, then lists models for it.   */
/*   • Year From / Year To: native <select> 1990 → currentYear+1.          */
/*   • Section sized 360 × 621 (Figma): card never overlaps hero above.    */
/* ─────────────────────────────────────────────────────────────────────── */
function MobileCarSearch({
  filterBrand, setFilterBrand,
  filterModel, setFilterModel,
  yearFrom, setYearFrom,
  yearTo, setYearTo,
  onFindCar,
}) {
  const FONT = "'Helvetica Neue', Helvetica, Arial, sans-serif";
  const [openWhich, setOpenWhich] = useState(null);
  const [brandQuery, setBrandQuery] = useState('');
  const rootRef = useRef(null);

  const currentYear = new Date().getFullYear();
  const YEARS = useMemo(() => {
    const out = [];
    for (let y = currentYear + 1; y >= 1990; y--) out.push(String(y));
    return out;
  }, [currentYear]);

  const brandOptions = useMemo(() => {
    const q = brandQuery.trim().toLowerCase();
    const list = q ? CAR_BRANDS.filter((b) => b.toLowerCase().includes(q)) : CAR_BRANDS;
    return ['Any Brand', ...list];
  }, [brandQuery]);

  const modelOptions = useMemo(() => {
    if (!filterBrand) return [];
    return ['Any model', ...(MODELS_BY_BRAND[filterBrand] || [])];
  }, [filterBrand]);

  useEffect(() => {
    const onDoc = (e) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target)) setOpenWhich(null);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('touchstart', onDoc);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('touchstart', onDoc);
    };
  }, []);

  const pickBrand = (b) => {
    setFilterBrand(b === 'Any Brand' ? '' : b);
    setFilterModel('');
    setOpenWhich(null);
    setBrandQuery('');
  };
  const pickModel = (m) => {
    setFilterModel(m === 'Any model' ? '' : m);
    setOpenWhich(null);
  };

  const fieldStyleBase = {
    width: '100%',
    height: 48,
    background: '#000',
    border: '1px solid #2a2a28',
    borderRadius: 6,
    color: '#fff',
    fontFamily: FONT,
    fontSize: 14,
    padding: '0 14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'pointer',
    boxSizing: 'border-box',
  };

  return (
    <section
      ref={rootRef}
      data-testid="mobile-car-search"
      className="flex justify-center"
      style={{ minHeight: 621, paddingTop: 56, paddingBottom: 56, boxSizing: 'border-box' }}
    >
      <div style={{ width: 328, maxWidth: '100%' }}>
        <h3
          className="text-center uppercase"
          style={{
            color: '#FEAE00',
            fontFamily: FONT,
            fontWeight: 700,
            fontSize: 24,
            lineHeight: '28px',
            letterSpacing: '0.04em',
            marginBottom: 28,
          }}
        >
          Car Search
        </h3>

        {/* BRAND */}
        <label style={{ display: 'block', color: '#fff', fontFamily: FONT, fontSize: 14, fontWeight: 500, marginBottom: 8 }}>
          Brand
        </label>
        <div style={{ position: 'relative', marginBottom: 16 }}>
          <button
            type="button"
            data-testid="mobile-brand-trigger"
            onClick={() => setOpenWhich(openWhich === 'brand' ? null : 'brand')}
            style={{ ...fieldStyleBase, borderColor: openWhich === 'brand' ? '#FEAE00' : '#2a2a28' }}
          >
            <span style={{ color: filterBrand ? '#fff' : '#7a7a78' }}>{filterBrand || 'All brands'}</span>
            <Caret open={openWhich === 'brand'} />
          </button>

          {openWhich === 'brand' && (
            <div
              data-testid="mobile-brand-panel"
              style={{
                position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
                background: '#0a0a0a', border: '1px solid #FEAE00', borderRadius: 6,
                zIndex: 60, maxHeight: 280, display: 'flex', flexDirection: 'column', overflow: 'hidden',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderBottom: '1px solid #2a2a28' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="11" cy="11" r="7" stroke="#7a7a78" strokeWidth="1.6" />
                  <path d="M20 20l-3.5-3.5" stroke="#7a7a78" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
                <input
                  data-testid="mobile-brand-search"
                  type="text"
                  autoFocus
                  value={brandQuery}
                  onChange={(e) => setBrandQuery(e.target.value)}
                  placeholder="Search brand..."
                  style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontFamily: FONT, fontSize: 14 }}
                />
              </div>
              <div style={{ overflowY: 'auto', maxHeight: 230 }}>
                {brandOptions.map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => pickBrand(b)}
                    data-testid={`mobile-brand-option-${b}`}
                    style={{ display: 'block', width: '100%', textAlign: 'left', padding: '12px 16px', background: 'transparent', border: 'none', color: '#fff', fontFamily: FONT, fontSize: 14, cursor: 'pointer' }}
                  >
                    {b}
                  </button>
                ))}
                {brandOptions.length === 1 && (
                  <div style={{ padding: '12px 16px', color: '#7a7a78', fontFamily: FONT, fontSize: 13 }}>No brands found</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* MODEL (locked until brand selected) */}
        <label style={{ display: 'block', color: filterBrand ? '#fff' : '#5a5a58', fontFamily: FONT, fontSize: 14, fontWeight: 500, marginBottom: 8 }}>
          Model
        </label>
        <div style={{ position: 'relative', marginBottom: 16 }}>
          <button
            type="button"
            data-testid="mobile-model-trigger"
            disabled={!filterBrand}
            onClick={() => filterBrand && setOpenWhich(openWhich === 'model' ? null : 'model')}
            style={{
              ...fieldStyleBase,
              cursor: filterBrand ? 'pointer' : 'not-allowed',
              opacity: filterBrand ? 1 : 0.5,
              borderColor: openWhich === 'model' ? '#FEAE00' : '#2a2a28',
            }}
          >
            <span style={{ color: filterModel ? '#fff' : '#7a7a78' }}>{filterModel || 'All models'}</span>
            <Caret open={openWhich === 'model'} />
          </button>

          {openWhich === 'model' && filterBrand && (
            <div
              data-testid="mobile-model-panel"
              style={{
                position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
                background: '#0a0a0a', border: '1px solid #FEAE00', borderRadius: 6,
                zIndex: 60, maxHeight: 260, overflowY: 'auto',
              }}
            >
              {modelOptions.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => pickModel(m)}
                  data-testid={`mobile-model-option-${m}`}
                  style={{ display: 'block', width: '100%', textAlign: 'left', padding: '12px 16px', background: 'transparent', border: 'none', color: '#fff', fontFamily: FONT, fontSize: 14, cursor: 'pointer' }}
                >
                  {m}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* YEAR FROM */}
        <label style={{ display: 'block', color: '#fff', fontFamily: FONT, fontSize: 14, fontWeight: 500, marginBottom: 8 }}>Year</label>
        <YearSelect value={yearFrom} onChange={setYearFrom} placeholder="From" years={YEARS} testid="mobile-year-from" />

        {/* YEAR TO */}
        <label style={{ display: 'block', color: '#fff', fontFamily: FONT, fontSize: 14, fontWeight: 500, marginBottom: 8, marginTop: 16 }}>Year</label>
        <YearSelect value={yearTo} onChange={setYearTo} placeholder="To" years={YEARS} testid="mobile-year-to" />

        {/* FIND A CAR */}
        <button
          type="button"
          onClick={onFindCar}
          data-testid="mobile-find-car"
          style={{
            display: 'block', width: '100%', height: 45, marginTop: 28,
            background: '#FEAE00', color: '#000', border: 'none', borderRadius: 4,
            fontFamily: FONT, fontWeight: 600, fontSize: 14, letterSpacing: '0.06em',
            textTransform: 'uppercase', cursor: 'pointer',
          }}
        >
          Find a car
        </button>
      </div>
    </section>
  );
}

function Caret({ open }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"
         style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 150ms' }}>
      <path d="M6 9l6 6 6-6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function YearSelect({ value, onChange, placeholder, years, testid }) {
  const FONT = "'Helvetica Neue', Helvetica, Arial, sans-serif";
  return (
    <div style={{ position: 'relative' }}>
      <select
        data-testid={testid}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%', height: 48, background: '#000', border: '1px solid #2a2a28',
          borderRadius: 6, color: value ? '#fff' : '#7a7a78',
          fontFamily: FONT, fontSize: 14, padding: '0 36px 0 14px',
          appearance: 'none', WebkitAppearance: 'none', MozAppearance: 'none',
          cursor: 'pointer', boxSizing: 'border-box',
        }}
      >
        <option value="">{placeholder}</option>
        {years.map((y) => (<option key={y} value={y}>{y}</option>))}
      </select>
      <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
        <Caret open={false} />
      </span>
    </div>
  );
}


/* ─────────────────────────────────────────────────────────────────────── */
/* MobileCalculateCar — "Calculate a car yourself / with a price guarantee" */
/*                                                                         */
/* Layout (1-to-1 with Figma mobile mock):                                  */
/*   • Outer frame: solid #FEAE00 background, rounded card.                */
/*   • Inner card:  #000 with image at top (Ford F-150, ratio 334.92/188). */
/*   • Title:       "Calculate a car yourself" (orange) +                  */
/*                  "with a price guarantee" (white), Mazzard H Bold 24px. */
/*   • Subtitle:    "From the USA and Korea", H Medium 14px, white.        */
/*   • VIN input:   294 wide, "Search by VIN or lot number", H Medium 14.  */
/*   • CALCULATE:   #FEAE00 button, Helvetica Now Display 14, black text.  */
/*   • ALL CATALOG +: orange underlined link, H Medium 14.                 */
/* ─────────────────────────────────────────────────────────────────────── */
function MobileCalculateCar() {
  const FONT = "'Mazzard', 'Mazzard H', system-ui, -apple-system, sans-serif";
  const FONT_BTN = "'Helvetica Now Display', 'Helvetica Neue', Helvetica, Arial, sans-serif";
  const [vin, setVin] = useState('');

  const submit = (e) => {
    e?.preventDefault?.();
    const q = vin.trim();
    if (q) {
      window.location.href = `/calculator?vin=${encodeURIComponent(q)}`;
    } else {
      window.location.href = '/calculator';
    }
  };

  return (
    <section
      data-testid="mobile-calculate-car"
      style={{
        padding: 0,
        margin: 0,
        boxSizing: 'border-box',
        background: '#000',
        width: '100%',
      }}
    >
      {/* ── Yellow outer frame — FULL VIEWPORT WIDTH (no black side margins)
       *
       *   Padding: 13 px (left) | 13 px (right) | 55 px (top) | 55 px (bottom)
       *
       *   Inside (top → bottom):
       *     • Image            full inner width × aspect 335 / 188
       *     • Black card       full inner width, content below:
       *         – 39 px top padding to title
       *         – Title (2 lines) Mazzard H Bold 24 px (yellow + white)
       *         – 19 px gap to subtitle
       *         – Subtitle "From the USA and Korea" 14 px white
       *         – flex spacer (lots of black breathing room)
       *         – Search input 317 × 40 (centered, icon 24×24, font 14)
       *         – 42 px gap
       *         – CALCULATE button 294 × 45 (centered, yellow CTA)
       *         – flex spacer
       *         – ALL CATALOG + (centered, underlined yellow)
       *         – 30 px bottom padding
       * ──────────────────────────────────────────────────────────────── */}
      <div
        style={{
          backgroundColor: '#FEAE00',
          width: '100%',
          boxSizing: 'border-box',
          padding: '55px 13px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Hero image — full inner width, aspect 335 / 188 */}
        <div
          style={{
            width: '100%',
            aspectRatio: '335 / 188',
            overflow: 'hidden',
            lineHeight: 0,
            flexShrink: 0,
          }}
        >
          <img
            src="/mobile/image-93@2x.png"
            alt="Ford pickup ready for delivery"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
              display: 'block',
            }}
            loading="lazy"
          />
        </div>

        {/* Black inner card — full inner width, holds all calculator content */}
        <div
          style={{
            backgroundColor: '#000',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            minHeight: 409,
          }}
        >
          {/* Title block — 39 px top padding, 30 px sides */}
          <div
            style={{
              padding: '39px 30px 0',
              textAlign: 'center',
              width: '100%',
              boxSizing: 'border-box',
              flexShrink: 0,
            }}
          >
            <h2
              style={{
                margin: 0,
                fontFamily: FONT,
                fontWeight: 700,
                fontSize: 24,
                lineHeight: '28px',
                letterSpacing: '-0.005em',
              }}
            >
              <span style={{ color: '#FEAE00', display: 'block' }}>
                Calculate a car yourself
              </span>
              <span
                style={{
                  color: '#FFFFFF',
                  display: 'block',
                  marginTop: 4,
                }}
              >
                with a price guarantee
              </span>
            </h2>

            {/* Subtitle — 19 px gap from title */}
            <p
              style={{
                margin: '19px 0 0',
                fontFamily: FONT,
                fontWeight: 500,
                fontSize: 14,
                lineHeight: '18px',
                color: '#FFFFFF',
              }}
            >
              From the USA and Korea
            </p>
          </div>

          {/* spacer — lots of black breathing room above the form */}
          <div style={{ flex: 1, minHeight: 60 }} />

          {/* Search input — 317 × 40, centered */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              width: 317,
              height: 40,
              padding: '0 12px',
              background: 'transparent',
              border: '1px solid #3a3a36',
              borderRadius: 6,
              boxSizing: 'border-box',
              flexShrink: 0,
              maxWidth: 'calc(100% - 18px)',
            }}
          >
            {/* Icon — exact 24 × 24 */}
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
              style={{ flexShrink: 0 }}
            >
              <circle cx="11" cy="11" r="7" stroke="#9a9a96" strokeWidth="1.7" />
              <path
                d="M20 20l-3.5-3.5"
                stroke="#9a9a96"
                strokeWidth="1.7"
                strokeLinecap="round"
              />
            </svg>
            <input
              data-testid="mobile-calc-vin"
              type="text"
              value={vin}
              onChange={(e) => setVin(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submit(e)}
              placeholder="Search by VIN or lot number"
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#FFFFFF',
                /* Helvetica Now Display Regular 14 px (placeholder spec) */
                fontFamily: FONT_BTN,
                fontWeight: 400,
                fontSize: 14,
                lineHeight: '21px',
                minWidth: 0,
              }}
            />
          </div>

          {/* 42 px gap between input and CALCULATE button */}
          <div style={{ height: 42, flexShrink: 0 }} />

          {/* CALCULATE button — 294 × 45, centered yellow CTA */}
          <button
            type="button"
            onClick={submit}
            data-testid="mobile-calc-submit"
            style={{
              display: 'block',
              width: 294,
              height: 45,
              maxWidth: 'calc(100% - 41px)',
              background: '#FEAE00',
              color: '#000',
              border: 'none',
              borderRadius: 6,
              fontFamily: FONT_BTN,
              fontWeight: 600,
              fontSize: 14,
              lineHeight: '18px',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            Calculate
          </button>

          {/* spacer — pushes ALL CATALOG towards the bottom */}
          <div style={{ flex: 1, minHeight: 60 }} />

          {/* ALL CATALOG + — centered, 30 px bottom padding */}
          <div
            style={{
              padding: '0 0 30px',
              textAlign: 'center',
              width: '100%',
              boxSizing: 'border-box',
              flexShrink: 0,
            }}
          >
            <a
              href="/catalog"
              data-testid="mobile-calc-all-catalog"
              style={{
                fontFamily: FONT,
                fontWeight: 500,
                fontSize: 14,
                lineHeight: '18px',
                color: '#FEAE00',
                textTransform: 'uppercase',
                textDecoration: 'underline',
                textUnderlineOffset: 4,
                textDecorationThickness: '1px',
                letterSpacing: '0.06em',
              }}
            >
              All catalog +
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}



/* ─────────────────────────────────────────────────────────────────────── */
/* MobileHowWeWork — "HOW WE WORK / WE WORK FOR EACH CLIENT" mobile section
 *
 * Geometry (per Figma DevMode):
 *   • 62 px  top padding (gap from end of Calculator block)
 *   • 63.5 px side padding around the centered title block
 *   • 24 px  gap between "HOW WE WORK" (24 px) and "WE WORK FOR EACH CLIENT
 *            / DEPENDING ON THE BUDGET" (16 px) sub-title
 *   • 17 px  side padding around cards
 *   • 17 px  vertical gap between cards
 *   • 43 px  bottom padding (gap to next section)
 *
 * Cards (3 plans, stacked vertically on mobile):
 *   1. Standard               328 × 279  black bg, yellow border
 *   2. Turnkey [popular]      327 × 274  yellow bg, black text
 *   3. Sourcing + Delivery
 *      + Support              335 × 283  black bg, yellow border, gray desc
 *
 * Description text in cards 2 & 3 uses the gray color #555452.
 * ─────────────────────────────────────────────────────────────────────── */
function MobileHowWeWork() {
  const FONT = "'Mazzard', 'Mazzard H', system-ui, -apple-system, sans-serif";
  // Helvetica Now / New Display — corporate body font for cards.
  // Local face is not bundled, so we fall back to Helvetica Neue / Helvetica /
  // Arial which match the metrics closely on iOS/macOS/Android.
  const HELV =
    "'Helvetica Now Display', 'Helvetica Neue', Helvetica, Arial, sans-serif";

  const PLANS = [
    {
      key: 'standard',
      num: 1,
      tag: 'Standard',
      desc: 'Sourcing, inspection, bidding, purchase,\nand delivery to Bulgaria.',
      accent: 'From there, you handle\neverything yourself.',
      popular: false,
      yellow: false,
    },
    {
      key: 'turnkey',
      num: 2,
      tag: 'Turnkey',
      desc:
        'Full-service with zero involvement\nrequired: sourcing, inspection,\npurchase, delivery, adaptation,\ntechnical inspection, and registration.',
      accent: 'You simply pick up\na ready-to-drive car.',
      popular: true,
      yellow: true,
    },
    {
      key: 'sourcing',
      num: 3,
      tag: 'Sourcing + Delivery\n+ Support',
      desc: 'Sourcing, inspection, purchase, and\ndelivery.',
      accent:
        'You handle registration - we\nconnect you with trusted service\npartners.',
      popular: false,
      yellow: false,
    },
  ];

  return (
    <section
      data-testid="mobile-how-we-work"
      style={{
        padding: '62px 0 0',
        background: '#000',
        boxSizing: 'border-box',
        width: '100%',
      }}
    >
      {/* ── Title block — 63.5 px side padding, centered ─────────────── */}
      <div
        style={{
          padding: '0 63.5px',
          textAlign: 'center',
          boxSizing: 'border-box',
        }}
      >
        <h2
          style={{
            margin: 0,
            fontFamily: FONT,
            fontWeight: 700,
            fontSize: 24,
            lineHeight: '28px',
            color: '#FEAE00',
            textTransform: 'uppercase',
            letterSpacing: '0.02em',
          }}
        >
          How we work
        </h2>

        <p
          style={{
            margin: '24px 0 0',
            fontFamily: FONT,
            fontWeight: 500,
            fontSize: 16,
            lineHeight: '20px',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          <span style={{ color: '#FEAE00', display: 'block' }}>
            We work for each client
          </span>
          <span style={{ color: '#FFFFFF', display: 'block', marginTop: 2 }}>
            depending on the budget
          </span>
        </p>
      </div>

      {/* ── Cards — 17 px sides, 17 px gap between (symmetric), 91 px gap from sub-title ─ */}
      <div
        style={{
          marginTop: 91,
          padding: '0 17px',
          display: 'flex',
          flexDirection: 'column',
          gap: 17,
          boxSizing: 'border-box',
        }}
      >
        {PLANS.map((p) => {
          const bg = p.yellow ? '#FEAE00' : '#0E0E0E';
          const border = p.yellow ? 'none' : '1px solid #FEAE00';
          const numColor = p.yellow ? 'rgba(0,0,0,0.55)' : '#FEAE00';
          const titleColor = p.yellow ? '#000000' : '#FEAE00';
          const descColor = p.yellow
            ? '#000000'
            : p.key === 'sourcing'
              ? '#FFFFFF'
              : '#FFFFFF';
          const accentColor = p.yellow ? '#000000' : '#FEAE00';

          return (
            <div
              key={p.key}
              data-testid={`mobile-plan-card-${p.key}`}
              style={{
                background: bg,
                border,
                borderRadius: 0,
                padding: '24px 24px 26px',
                position: 'relative',
                boxSizing: 'border-box',
                fontFamily: FONT,
                /* leather-like noise on dark cards (subtle) */
                backgroundImage: p.yellow
                  ? undefined
                  : 'radial-gradient(circle at 30% 0%, rgba(254,174,0,0.04), transparent 50%)',
              }}
            >
              {/* Top row: [N] number + optional [popular] pill */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 20,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                  }}
                >
                  <span
                    style={{
                      width: 39,
                      height: 25,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      color: numColor,
                      fontFamily: FONT,
                      lineHeight: 1,
                      flexShrink: 0,
                      letterSpacing: 0,
                    }}
                  >
                    <span style={{ fontWeight: 400, fontSize: 25, lineHeight: 1 }}>[</span>
                    <span style={{ fontWeight: 600, fontSize: 13, lineHeight: 1 }}>{p.num}</span>
                    <span style={{ fontWeight: 400, fontSize: 25, lineHeight: 1 }}>]</span>
                  </span>
                  <h3
                    style={{
                      margin: 0,
                      fontFamily: FONT,
                      fontWeight: 700,
                      fontSize: 24,
                      lineHeight: '28px',
                      color: titleColor,
                      whiteSpace: 'pre-line',
                      letterSpacing: '-0.005em',
                    }}
                  >
                    {p.tag}
                  </h3>
                </div>

                {p.popular && (
                  <span
                    style={{
                      width: 64,
                      height: 32,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid rgba(0,0,0,0.85)',
                      borderRadius: 16,
                      color: '#000000',
                      fontFamily: FONT,
                      fontWeight: 500,
                      fontSize: 12,
                      lineHeight: '14px',
                      textTransform: 'lowercase',
                      letterSpacing: '0.02em',
                      flexShrink: 0,
                      boxSizing: 'border-box',
                    }}
                  >
                    popular
                  </span>
                )}
              </div>

              {/* Description (Helvetica Now/New Display Regular 18) */}
              <p
                style={{
                  margin: '0 0 22px',
                  fontFamily: HELV,
                  fontWeight: 400,
                  fontSize: 18,
                  lineHeight: '24px',
                  color: descColor,
                  whiteSpace: 'pre-line',
                }}
              >
                {p.desc}
              </p>

              {/* Accent highlight (Helvetica Now/New Display Bold 18) */}
              <p
                style={{
                  margin: 0,
                  fontFamily: HELV,
                  fontWeight: 700,
                  fontSize: 18,
                  lineHeight: '24px',
                  color: accentColor,
                  whiteSpace: 'pre-line',
                }}
              >
                {p.accent}
              </p>
            </div>
          );
        })}

        {/* ── "Have a question? / Contact us" card ───────────────────────
         * Black bg, yellow border, large rounded corners.
         * Centered: title + sub + two phone numbers (yellow).
         * ──────────────────────────────────────────────────────────── */}
        {/* ── "Have a question? / Contact us" card ───────────────────────
         * Rounded corners (8 px) — the ONLY card with rounding.
         * Spec (Figma DevMode):
         *   • borderRadius 8
         *   • padding: 35 top | 97 sides | 42 bottom
         *   • Have a question?  → Mazzard H Bold 16  (white)
         *   • 22 px gap
         *   • Contact us        → Mazzard H Bold 16  (white)
         *   • 11 px gap
         *   • Phone #1          → Mazzard H Bold 16  (yellow)
         *   • 8 px gap
         *   • Phone #2          → Mazzard H Bold 16  (yellow)
         * ──────────────────────────────────────────────────────────── */}
        <div
          data-testid="mobile-have-a-question"
          style={{
            marginTop: 57, /* 17 (gap) + 57 = 74 px from end of last plan card */
            marginBottom: 43, /* bottom padding to next section */
            background: '#000000',
            border: '1px solid #FEAE00',
            borderRadius: 8,
            padding: '35px 97px 42px',
            textAlign: 'center',
            fontFamily: FONT,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              fontFamily: FONT,
              fontWeight: 700,
              fontSize: 16,
              lineHeight: '20px',
              color: '#FFFFFF',
            }}
          >
            Have a question?
          </div>

          <div
            style={{
              marginTop: 22,
              fontFamily: FONT,
              fontWeight: 700,
              fontSize: 16,
              lineHeight: '20px',
              color: '#FFFFFF',
            }}
          >
            Contact us
          </div>

          <a
            href="tel:+359875313158"
            style={{
              marginTop: 11,
              fontFamily: FONT,
              fontWeight: 700,
              fontSize: 16,
              lineHeight: '20px',
              color: '#FEAE00',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            +359 875 313 158
          </a>

          <a
            href="tel:+359897884804"
            style={{
              marginTop: 8,
              fontFamily: FONT,
              fontWeight: 700,
              fontSize: 16,
              lineHeight: '20px',
              color: '#FEAE00',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            +359 897 884 804
          </a>
        </div>
      </div>
    </section>
  );
}


/* ─────────────────────────────────────────────────────────────────────── */
/* MobileHowToBuyTurnkey — "How to buy a turnkey car" mobile adaptation
 * of the desktop section (`figma_home/components/turnkey-banner1.jsx`).
 * Uses the SAME assets as the web version:
 *   • /figma/image-57@2x.webp  — aerial road background
 *   • /figma/image-65@2x.webp  — Copart logo (94 × 40)
 *   • /figma/image-71@2x.webp  — CARFAX logo (93 × 17)
 *   • /figma/image-73@2x.webp  — IAA logo (51 × 29)
 *   • /figma/image-76@2x.webp  — Manheim logo (118 × 29)
 *   • /figma/image-81@2x.webp  — Encar logo (73 × 24)
 *   • /figma/basil-viber-outline.svg — Viber icon (42 × 42)
 *
 * Mobile geometry (per Figma DevMode @ 368 × 1256):
 *   • 28 px  top padding
 *   • 82 px  side padding around the title (Mazzard H Bold 32)
 *   • Title "How to buy / a turnkey car"
 *   • Aerial photo of a car driving down the road shows through the bg
 *   • "from"          — Mazzard H Bold 14, yellow
 *   • "USA/Korea"     — Mazzard H Bold 32, white
 *   • Auction logos: 2 rows centred on the road
 *   • 5 numbered steps (block 328 × 276):
 *       — yellow numerals "1/" — Mazzard H ExtraBold 20
 *       — white step text      — Mazzard H Bold 20
 *       — 40 px left, 13 px gap, 18 px between items
 *   • "Pick up the car" CTA — 294 × 45, Mazzard H Medium 14, 34/33 pads
 *   • "Join our group and get the hottest offers" — Bold 16, 57/55 pads
 *   • Viber icon 42 × 42, 16 px after caption
 *   • 39 px bottom padding
 * ─────────────────────────────────────────────────────────────────────── */
function MobileHowToBuyTurnkey() {
  const FONT = "'Mazzard', 'Mazzard H', system-ui, -apple-system, sans-serif";

  const STEPS = [
    'We send an application',
    'We discuss the details',
    'We look for a car',
    'We buy and deliver to a\nEuropean port',
    'We clear customs and\ndeliver the car to Bulgaria',
  ];

  // Figma DevMode geometry (card 368 × 1256):
  //   • Title padding-top                = 28
  //   • Title side padding (left/right)  = 82
  //   • Title font-size                  = 32
  //   • USA/Korea: top=412, left=94, width=180 (right edge = 87 from card edge)
  //   • Steps inter-item gap             = 18
  //   • "Join our group" caption — comes AFTER steps
  //   • Viber icon gap from caption      = 16
  //   • "Pick up the car" button gap from caption/icon block = 53
  //   • Pick up the car BUTTON absolute top from card start  = 1023
  //   • Bottom padding                   = 39
  return (
    <section
      data-testid="mobile-how-to-buy-turnkey"
      style={{
        position: 'relative',
        background: '#0A0A0A',
        padding: '28px 0 39px',
        overflow: 'hidden',
        boxSizing: 'border-box',
        width: '100%',
        // Total card height per Figma = 1262 px:
        //   button top 1023 + 45 + 53 (gap) + 44 (2-line caption) + 16 (gap)
        //   + 42 (viber) + 39 (bottom padding) = 1262
        minHeight: 1262,
      }}
    >
      {/* ── Aerial road photo as full-bleed background ───────────────── */}
      <img
        src="/figma/image-57@2x.webp"
        alt=""
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          height: '100%',
          width: 'auto',
          minWidth: '100%',
          objectFit: 'cover',
          objectPosition: 'center top',
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      />
      {/* Top fade so the title remains legible on light asphalt */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 220,
          background:
            'linear-gradient(180deg, rgba(10,10,10,0.85) 0%, rgba(10,10,10,0.55) 60%, rgba(10,10,10,0) 100%)',
          pointerEvents: 'none',
        }}
      />
      {/* Bottom fade for the CTA / Join card legibility */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: 320,
          background:
            'linear-gradient(0deg, rgba(10,10,10,0.92) 0%, rgba(10,10,10,0.65) 55%, rgba(10,10,10,0) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* ── Content (above bg) ───────────────────────────────────────── */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Title */}
        <h2
          style={{
            margin: 0,
            padding: '0 82px',
            textAlign: 'center',
            fontFamily: FONT,
            fontWeight: 700,
            fontSize: 32,
            lineHeight: '36px',
            color: '#FEAE00',
            letterSpacing: '-0.005em',
          }}
        >
          How to buy
          <br />a turnkey car
        </h2>

        {/* Spacer where the car photo of the bg image sits.
           Figma: "from"/USA/Korea block is absolutely positioned at top:412
           from section start (rendered as a direct child of the relative
           section — see below). The flow spacer reserves the same vertical
           space so that the auction-logos row stays at its Figma offset.
           +60 px additional drop so the bottom of step 5 lands exactly 77 px
           above the "Pick up the car" button (1023 − 77 = 946 px). */}
        <div aria-hidden style={{ height: 345 + 60 }} />

        {/* ── Auction logos — real SVG assets, exact Figma positioning ─
             Row 1 (Copart 94×40 · IAAI 51×29 · CARFAX 93×17):
               • Copart  → padding-left  35 px from section edge
               • CARFAX  → padding-right 31 px from section edge
               • IAAI    → centred between (159 / 151), vertically centred
                            with Copart (40 px tall row baseline)
             Row 2 (Manheim 118×30 · Encar 74×22), 33 px below row 1:
               • Manheim → padding-left  43 px
               • Encar   → padding-right 60 px
             Vertical position from section start: 493 px (Figma).
          ────────────────────────────────────────────────────────────── */}
        <div style={{ marginTop: 38 }}>
          {/* Row 1 — fixed 40 px height so all three are vertically centred */}
          <div
            style={{
              padding: '0 31px 0 35px',
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxSizing: 'border-box',
            }}
          >
            <img
              src="/figma/copart-logo.svg"
              alt="Copart"
              width={94}
              height={40}
              style={{ width: 94, height: 40, display: 'block', flexShrink: 0 }}
            />
            <img
              src="/figma/iaai-logo.svg"
              alt="IAA — Insurance Auto Auctions"
              width={51}
              height={29}
              style={{ width: 51, height: 29, display: 'block', flexShrink: 0 }}
            />
            <img
              src="/figma/carfax-logo.svg"
              alt="CARFAX"
              width={93}
              height={17}
              style={{ width: 93, height: 17, display: 'block', flexShrink: 0 }}
            />
          </div>
          {/* Row 2 — 33 px gap from row 1, fixed 30 px height */}
          <div
            style={{
              marginTop: 33,
              padding: '0 60px 0 43px',
              height: 30,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxSizing: 'border-box',
            }}
          >
            <img
              src="/figma/manheim-logo.svg"
              alt="Manheim"
              width={118}
              height={30}
              style={{ width: 118, height: 30, display: 'block', flexShrink: 0 }}
            />
            <img
              src="/figma/encar-logo.svg"
              alt="Encar"
              width={74}
              height={22}
              style={{ width: 74, height: 22, display: 'block', flexShrink: 0 }}
            />
          </div>
        </div>

        {/* ── Steps block — 328 × 276 (40 left, 18 gap, 13 num↔text) ── */}
        <div
          style={{
            marginTop: 60,
            padding: '0 20px 0 40px',
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
            boxSizing: 'border-box',
          }}
        >
          {STEPS.map((s, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 13,
              }}
            >
              <span
                style={{
                  fontFamily: FONT,
                  fontWeight: 800,
                  fontSize: 20,
                  lineHeight: '24px',
                  color: '#FEAE00',
                  flexShrink: 0,
                  minWidth: 22,
                }}
              >
                {i + 1}/
              </span>
              <span
                style={{
                  fontFamily: FONT,
                  fontWeight: 700,
                  fontSize: 20,
                  lineHeight: '24px',
                  color: '#FFFFFF',
                  whiteSpace: 'pre-line',
                }}
              >
                {s}
              </span>
            </div>
          ))}
        </div>

      </div>

      {/* ── "Pick up the car" CTA — absolutely positioned per Figma spec
           Layout (Figma DevMode):
             • Top:    1023 px from card start
             • Left:   34 px
             • Width:  fixed 294 px
             • Height: fixed 45 px
             • Radius: 6 px
           Typography: Mazzard H Medium 14, uppercase, amber bg. ── */}
      <div
        style={{
          position: 'absolute',
          top: 1023,
          left: 34,
          width: 294,
          height: 45,
          zIndex: 3,
        }}
      >
        <Link
          to="/calculator"
          data-testid="mobile-pick-up-the-car"
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#FEAE00',
            border: 'none',
            borderRadius: 6,
            color: '#000000',
            fontFamily: FONT,
            fontWeight: 500,
            fontSize: 14,
            lineHeight: '17px',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            textDecoration: 'none',
            boxSizing: 'border-box',
          }}
        >
          Pick up the car
        </Link>
      </div>

      {/* ── "Join our group" caption — 53 px BELOW the Pick-up-the-car
           button (button top = 1023, height 45 → text top = 1023+45+53 = 1121).
           Absolutely positioned so it sits AFTER the button per Figma. ── */}
      <div
        data-testid="mobile-join-our-group"
        style={{
          position: 'absolute',
          top: 1023 + 45 + 53,
          left: 0,
          right: 0,
          padding: '0 55px 0 57px',
          textAlign: 'center',
          fontFamily: FONT,
          fontWeight: 700,
          fontSize: 16,
          lineHeight: '22px',
          color: '#FFFFFF',
          zIndex: 3,
          boxSizing: 'border-box',
        }}
      >
        Join our group and get the hottest offers
      </div>

      {/* ── Viber icon — 42 × 42, exactly 16 px BELOW the caption.
           Caption (2 lines × 22 px = 44 px) → icon top = 1121 + 44 + 16 = 1181.
           After icon (42 px) → bottom of icon at 1181 + 42 = 1223.
           Section bottom = 1223 + 39 (bottom padding) = 1262 (matches Figma). ── */}
      <div
        data-testid="mobile-viber-icon"
        style={{
          position: 'absolute',
          top: 1023 + 45 + 53 + 44 + 16, // 1181
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 3,
        }}
      >
        <a
          href="viber://chat?number=%2B359875313158"
          aria-label="Join our Viber group"
          style={{
            width: 42,
            height: 42,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            textDecoration: 'none',
          }}
        >
          <img
            src="/figma/basil-viber-outline.svg"
            alt=""
            width={42}
            height={42}
            style={{ display: 'block' }}
          />
        </a>
      </div>

      {/* ── "from / USA/Korea" — absolutely positioned per Figma ──
           • USA/Korea text frame: 180 × 38 px.
           • Top:    412 px from card (section) start — where the car image
                      conceptually begins (per Figma DevMode).
           • Left:    94 px from section edge.
           • Right:   87 px (94 + 180 + 87 = 361 px card content width).
           • "from"   Mazzard H Bold 14 px, #FEAE00, centered, sits directly
                      above USA/Korea.
           • "USA/Korea" Mazzard H Bold 32 px, #FFFFFF, centered, 180 × 38.
           Rendered as a DIRECT child of the relative <section>, therefore
           `top` is measured from the section's padding-box top (= card top).
         ─────────────────────────────────────────────────────────── */}
      <div
        data-testid="mobile-from-usa-korea"
        style={{
          position: 'absolute',
          top: 412 + 60,
          left: 94,
          width: 180,
          zIndex: 2,
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: '100%',
            marginBottom: 2,
            fontFamily: FONT,
            fontWeight: 700,
            fontSize: 14,
            lineHeight: '17px',
            color: '#FEAE00',
            letterSpacing: '0.04em',
            textAlign: 'center',
          }}
        >
          from
        </div>
        <h3
          style={{
            margin: 0,
            width: 180,
            height: 38,
            fontFamily: FONT,
            fontWeight: 700,
            fontSize: 32,
            lineHeight: '38px',
            color: '#FFFFFF',
            letterSpacing: '-0.005em',
            textAlign: 'center',
            whiteSpace: 'nowrap',
          }}
        >
          USA/Korea
        </h3>
      </div>
    </section>
  );
}


/* ─────────────────────────────────────────────────────────────────────── */
/* MobileWeHavePerfectService                                              */
/*                                                                         */
/* Mobile adaptation of FrameComponent24 ("WE HAVE PERFECT SERVICE").      */
/* Reuses the exact same content (titles, subtitles, map-pin icon) and     */
/* typography family as the desktop version, but with the mobile geometry  */
/* given by Figma DevMode (card 360 × 901):                                */
/*                                                                         */
/*   • Card                       360 × 901, padding-top 59                */
/*   • Title block "We have perfect / service"                             */
/*       - 274 × 109, centred                                              */
/*       - "WE HAVE PERFECT SERVICE" — H Bold 24 px, #FEAE00, uppercase    */
/*       - "JUST A FEW STEPS / TO YOUR DREAM CAR" — H Medium 16 px, white  */
/*       - Side padding 43 / 43                                            */
/*   • 4 step blocks                                                       */
/*       - Each block 328 × 114.47                                         */
/*       - Map-pin icon (28 × 28, #FEAE00), centred above an orange        */
/*         hairline that spans the full width of the block                 */
/*       - Title text — H Bold 16 px, uppercase, white                     */
/*       - Subtitle  — H Medium 14 px, #FEAE00                             */
/*       - 16 px gap between map-pin/line and title                        */
/*       - 16 px gap between title and subtitle                            */
/*       - 48 px gap between each step block                               */
/* ─────────────────────────────────────────────────────────────────────── */

const PERFECT_SERVICE_STEPS = [
  {
    title: 'Choose your perfect car',
    subtitle: 'Find a vehicle that matches your style and budget',
  },
  {
    title: 'Pay quickly and effortlessly',
    subtitle: 'A simple, transparent process with no complications',
  },
  {
    title: 'Track your car\nin real time',
    subtitle: 'Stay updated on every step of the journey in your personal account',
  },
  {
    title: 'Get the keys and enjoy your new car',
    subtitle: 'Our manager will hand over the vehicle and take care of every detail',
  },
];

function MobileWeHavePerfectService() {
  const FONT = "'Mazzard', 'Mazzard H', system-ui, -apple-system, sans-serif";

  return (
    <section
      data-testid="mobile-perfect-service"
      style={{
        position: 'relative',
        background: '#000000',
        width: '100%',
        minHeight: 901,
        paddingTop: 59,
        paddingBottom: 48,
        boxSizing: 'border-box',
        color: '#FFFFFF',
        fontFamily: FONT,
      }}
    >
      {/* ── Title block — 274 × 109, centred, 43 px side padding ── */}
      <div
        data-testid="mobile-perfect-service-title-block"
        style={{
          width: '100%',
          padding: '0 43px',
          boxSizing: 'border-box',
          textAlign: 'center',
        }}
      >
        <h2
          style={{
            margin: 0,
            fontFamily: FONT,
            fontWeight: 700,
            fontSize: 24,
            lineHeight: '28px',
            letterSpacing: 0,
            textTransform: 'uppercase',
            color: '#FEAE00',
          }}
        >
          We have perfect service
        </h2>
        <div
          style={{
            marginTop: 16,
            fontFamily: FONT,
            fontWeight: 500,
            fontSize: 16,
            lineHeight: '20px',
            letterSpacing: 0,
            textTransform: 'uppercase',
            color: '#FFFFFF',
          }}
        >
          Just a few steps
          <br />
          to your dream car
        </div>
      </div>

      {/* ── 4 step blocks — 328 × 114.47, 48 px gap between ── */}
      <div
        data-testid="mobile-perfect-service-steps"
        style={{
          marginTop: 59,
          display: 'flex',
          flexDirection: 'column',
          gap: 48,
          alignItems: 'center',
        }}
      >
        {PERFECT_SERVICE_STEPS.map((step, i) => (
          <div
            key={i}
            data-testid={`mobile-perfect-service-step-${i + 1}`}
            style={{
              width: 328,
              maxWidth: 'calc(100% - 32px)',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
            {/* Map-pin — exact Figma asset (Vector.svg) with native dimensions
                18.27 × 23.31 px. The cut-out hole is already baked into the
                SVG (fill-rule="evenodd"), so it stays the proper Figma size
                without any additional overlay. */}
            <img
              src="/figma/pin-vector.svg"
              alt=""
              width={18.27}
              height={23.31}
              style={{
                display: 'block',
                width: 18.27,
                height: 23.31,
                marginBottom: 4,
                flexShrink: 0,
              }}
              aria-hidden="true"
            />

            {/* Horizontal hairline — full width of the 328-px block */}
            <div
              aria-hidden="true"
              style={{
                width: '100%',
                height: 1,
                background: '#FEAE00',
              }}
            />

            {/* Title — Bold 16, white, uppercase. 16 px below the hairline. */}
            <h3
              style={{
                margin: '16px 0 0 0',
                fontFamily: FONT,
                fontWeight: 700,
                fontSize: 16,
                lineHeight: '20px',
                letterSpacing: 0,
                textTransform: 'uppercase',
                color: '#FFFFFF',
                whiteSpace: 'pre-line',
              }}
            >
              {step.title}
            </h3>

            {/* Subtitle — Medium 14, amber. 16 px below the title. */}
            <p
              style={{
                margin: '16px 0 0 0',
                fontFamily: FONT,
                fontWeight: 500,
                fontSize: 14,
                lineHeight: '18px',
                letterSpacing: 0,
                color: '#FEAE00',
              }}
            >
              {step.subtitle}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}


/* ─────────────────────────────────────────────────────────────────────── */
/* MobileTurnkeyServices                                                   */
/*                                                                         */
/* Yellow 8-card services list — sits AFTER MobileWeHavePerfectService     */
/* (after the "GET THE KEYS AND ENJOY YOUR NEW CAR" map-pin step) and      */
/* BEFORE the "Want to drive your dream car?" CTA.                         */
/*                                                                         */
/* Per Figma DevMode (Frame 1707479342) — yellow block 331 × 1142:         */
/*   • 8 cards, all 331 wide (we render full-width inside 16 px side pads) */
/*   • Card heights are content-driven (Hug):                              */
/*       151 / 136 / 153 / 134 / 117 / 117 / 134 / 151                     */
/*   • Inter-card gap:           7 px                                      */
/*   • Internal card padding:    24 (top) / 24 (bottom) / 10 (left) / 10 (right) */
/*   • Numerals "/N"             — Mazzard H Medium 24, black              */
/*   • Section title             — Mazzard H Medium 16, black, uppercase   */
/*   • Body                      — Mazzard H Regular 14, black             */
/* ─────────────────────────────────────────────────────────────────────── */
function MobileTurnkeyServices() {
  const FONT = "'Mazzard H', 'Mazzard', system-ui, -apple-system, sans-serif";

  const CARDS = [
    {
      num: '1',
      title: 'IMPORT',
      body:
        'We help you find the right car based on your budget, style, and needs - handling the inspection, purchase, and delivery from the USA to Bulgaria.',
    },
    {
      num: '2',
      title: 'ADAPTATION TO EUROPEAN STANDARDST',
      body:
        "We adapt the vehicle to EU standards and ensure it's ready for smooth registration.",
    },
    {
      num: '3',
      title: 'REGISTRATION AND CERTIFICATION',
      body:
        'We handle full registration in Bulgaria, including KAT, documents, and transit plates - supporting you every step.',
    },
    {
      num: '4',
      title: 'FINANCING',
      body:
        'We connect you with TBI Bank and UniCredit Bulbank and guide you through the financing process.',
    },
    {
      num: '5',
      title: 'PARTS SOURCING AND DELIVERY',
      body:
        'We source and order quality parts from the USA, helping you save without compromise.',
    },
    {
      num: '6',
      title: 'AUTO SERVICE',
      body:
        'We handle all repairs and technical work through a trusted partner service.',
    },
    {
      num: '7',
      title: 'DETAILING AND CLEANING',
      body:
        'We provide professional cleaning and restoration of both exterior and interior. We make your car look and feel like new..',
    },
    {
      num: '8',
      title: 'HOME DELIVERY',
      body:
        'We arrange delivery of your vehicle to any city in Bulgaria. You receive a ready-to-drive car right at your doorstep — no hassle, no extra trips.',
    },
  ];

  return (
    <section
      data-testid="mobile-turnkey-services"
      style={{
        width: '100%',
        background: '#000000',
        padding: '0 16px',
        boxSizing: 'border-box',
        fontFamily: FONT,
      }}
    >
      <div
        data-testid="mobile-turnkey-services-list"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 7,
        }}
      >
        {CARDS.map((c, i) => (
          <div
            key={c.num}
            data-testid={`mobile-turnkey-service-card-${c.num}`}
            style={{
              background: '#FEAE00',
              padding: '24px 10px',
              boxSizing: 'border-box',
              color: '#000000',
            }}
          >
            {/* Header row: "/N" + TITLE */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 16,
              }}
            >
              <span
                style={{
                  flex: '0 0 auto',
                  fontFamily: "'Mazzard H', 'Mazzard', system-ui, sans-serif",
                  fontWeight: 500,
                  fontSize: 24,
                  lineHeight: '28px',
                  height: 28,
                  display: 'inline-flex',
                  alignItems: 'center',
                  letterSpacing: 0,
                  color: '#000000',
                  whiteSpace: 'nowrap',
                }}
              >
                /{c.num}
              </span>
              <h3
                style={{
                  flex: '1 1 auto',
                  margin: 0,
                  alignSelf: 'center',
                  fontFamily: "'Mazzard H', 'Mazzard', system-ui, sans-serif",
                  fontWeight: 500,
                  fontSize: 16,
                  lineHeight: '20px',
                  letterSpacing: 0,
                  textTransform: 'uppercase',
                  color: '#000000',
                }}
              >
                {c.title}
              </h3>
            </div>

            {/* Body */}
            <p
              data-testid={`mobile-turnkey-service-body-${c.num}`}
              style={{
                margin: '16px 0 0 0',
                fontFamily: "'Mazzard H', 'Mazzard', system-ui, sans-serif",
                fontWeight: 400,
                fontSize: 14,
                lineHeight: '18px',
                letterSpacing: 0,
                color: '#000000',
              }}
            >
              {c.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}


/* ─────────────────────────────────────────────────────────────────────── */
/* MobileBeforeAndAfter                                                    */
/*                                                                         */
/* Horizontal-scroll carousel that replaces the old "Before & After" block */
/* on the mobile homepage. Sits AFTER `MobileTurnkeyServices` (8 yellow    */
/* service cards) and BEFORE the "Want to drive your dream car?" CTA.      */
/*                                                                         */
/* Figma DevMode (mobile, 360 wide):                                       */
/*   • Section background           — #000000                              */
/*   • Title "BEFORE AND AFTER"     — Mazzard H Bold 24, #FEAE00           */
/*   • Subtitle line 1 "OUR ..."    — Mazzard H Medium 16, #FEAE00         */
/*   • Subtitle line 2 "THE BEST .."— Mazzard H Medium 16, #FFFFFF         */
/*   • Title → subtitle gap         — 24 px                                */
/*   • Subtitle → card gap          — 32 px                                */
/*   • Card                         — 328 × 317, #1A1A1A, side insets 16 px*/
/*       — /before                  — H Medium 12, white  , inset-L 62.5  */
/*       — /after                   — H Medium 12, #FEAE00, inset-R 61.5  */
/*       — Photos (before / after)  — 150 × 144 each, 8 px gap            */
/*       — Model "BMV 328"          — H Bold 16, white                    */
/*       — Order date / finished / Turnkey price — H Regular 12          */
/*       — Price value              — H Regular 12 #FEAE00                */
/*   • Card → pagination gap        — 24 px                                */
/*   • Pagination row               — insets 116 (left) / 115 (right)      */
/*       — Arrow circle             — 36 × 36                              */
/*       — "01/10" counter          — H Medium 12, white                   */
/*       — Arrows ↔ counter gap     — 24 px                                */
/* ─────────────────────────────────────────────────────────────────────── */
function MobileBeforeAndAfter({ items, activeIdx, setActiveIdx }) {
  const FONT = "'Mazzard H', 'Mazzard', system-ui, -apple-system, sans-serif";

  // Real data ONLY — fed straight from /api/site-info → before_after.items.
  // No demo fallbacks: the section won't render until the API responds with
  // at least one card, which keeps the carousel's count honest.
  const list = Array.isArray(items)
    ? items.filter((c) => c && c.enabled !== false)
    : [];
  const total = list.length;

  // Active index is clamped to the real list length so the counter (e.g.
  // 03/03) always matches what's actually scrollable.
  const idx = total > 0 ? Math.min(Math.max(0, activeIdx || 0), total - 1) : 0;
  const counter =
    total > 0
      ? `${String(idx + 1).padStart(2, '0')}/${String(total).padStart(2, '0')}`
      : '00/00';

  const trackRef = useRef(null);

  // Programmatic scroll to the active card — done on the carousel container
  // directly (not via `scrollIntoView`, which would scroll the WHOLE page in
  // mobile browsers). Smooth-scrolls the track so the chosen card is centered.
  const scrollToIdx = (targetIdx) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.children[targetIdx];
    if (!card) return;
    const left = card.offsetLeft - (track.clientWidth - card.offsetWidth) / 2;
    track.scrollTo({ left, behavior: 'smooth' });
  };

  // Sync scroll position when an external state change (arrows, init) bumps
  // the active index. We skip the very first run so the page doesn't jump on
  // mount — the natural snap will keep card #1 centered automatically.
  const firstRunRef = useRef(true);
  useEffect(() => {
    if (firstRunRef.current) {
      firstRunRef.current = false;
      return;
    }
    if (total > 0) scrollToIdx(idx);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, total]);

  // ── Active-card detection: "STICKY 70 %"
  //
  // Rule (as agreed with the client):
  //   • While the currently-active card is still ≥ 70 % visible → counter
  //     stays the same. This guarantees that while two cards are partially
  //     visible mid-swipe the number does NOT flicker.
  //   • Only when the active card drops below 70 % AND a different card has
  //     reached ≥ 70 % visibility, the counter flips to that other card.
  //
  // We keep `idxRef` so the IO callback always reads the *latest* active
  // index instead of the stale value captured in closure.
  const idxRef = useRef(idx);
  useEffect(() => { idxRef.current = idx; }, [idx]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || total === 0) return;
    if (typeof IntersectionObserver === 'undefined') return;

    const ratios = new Map();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          const cardIdx = Number(e.target.getAttribute('data-card-idx'));
          ratios.set(cardIdx, e.intersectionRatio);
        });

        const cur = idxRef.current;
        // Sticky: if current card is still ≥ 70 % visible — don't switch.
        if ((ratios.get(cur) || 0) >= 0.7) return;

        // Otherwise pick the most visible card — but only if it crosses
        // the 70 % threshold (else stay put).
        let bestI = -1;
        let bestR = 0.7;
        ratios.forEach((r, i) => {
          if (r > bestR) { bestR = r; bestI = i; }
        });
        if (bestI >= 0 && bestI !== cur) setActiveIdx(bestI);
      },
      {
        root: track,
        threshold: [0, 0.3, 0.5, 0.7, 0.85, 1],
      },
    );

    const cards = Array.from(track.children).filter(
      (n) => n.nodeType === 1 && n.hasAttribute && n.hasAttribute('data-card-idx'),
    );
    cards.forEach((c) => observer.observe(c));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total]);

  const prev = () => total > 0 && setActiveIdx((idx - 1 + total) % total);
  const next = () => total > 0 && setActiveIdx((idx + 1) % total);

  // Resolve a media URL coming from the backend payload.
  //   • absolute http(s)     → use as-is
  //   • /figma/*  /mobile/*  → frontend public asset (served by CRA)
  //   • other /api or relative paths → prefix the backend API origin
  //
  // We also rewrite the legacy `.png` extension used in old seeds to `.webp`
  // because the actual files shipped under /public/figma are webp-encoded.
  // This keeps any historical/in-flight data working without a DB migration.
  const fullMediaUrl = (u) => {
    if (!u) return '';
    let v = u;
    if (v.startsWith('/figma/') && v.toLowerCase().endsWith('.png')) {
      v = v.slice(0, -4) + '.webp';
    }
    if (/^https?:\/\//i.test(v)) return v;
    if (v.startsWith('/figma/') || v.startsWith('/mobile/')) return v;
    if (v.startsWith('/')) return `${API}${v}`;
    return `${API}/${v}`;
  };

  // Don't render the section at all when there's no data — better UX than
  // showing an empty carousel with broken counter.
  if (total === 0) return null;

  return (
    <section
      data-testid="mobile-before-and-after"
      style={{
        width: '100%',
        background: '#000000',
        fontFamily: FONT,
        // Top spacing keeps a clean 40 px breathing room from the last Turnkey
        // card (#8 HOME DELIVERY) and a 40 px gap to the Dream-car CTA below.
        padding: '40px 0',
        boxSizing: 'border-box',
      }}
    >
      {/* ── Section title ───────────────────────────────────────────────── */}
      <h2
        data-testid="mobile-before-and-after-title"
        style={{
          margin: '0 16px',
          fontFamily: FONT,
          fontWeight: 700,
          fontSize: 24,
          lineHeight: '28px',
          textAlign: 'center',
          textTransform: 'uppercase',
          color: '#FEAE00',
          letterSpacing: 0,
        }}
      >
        Before and after
      </h2>

      {/* ── Subtitle (orange + white) ───────────────────────────────────── */}
      <div
        data-testid="mobile-before-and-after-subtitle"
        style={{
          margin: '24px 16px 0',
          fontFamily: FONT,
          fontWeight: 500,
          fontSize: 16,
          lineHeight: '20px',
          textAlign: 'center',
          textTransform: 'uppercase',
          letterSpacing: 0,
        }}
      >
        <span style={{ color: '#FEAE00' }}>Our clients receive</span>
        <br />
        <span style={{ color: '#FFFFFF' }}>the best service</span>
      </div>

      {/* ── Cards track (horizontal scroll + snap) ──────────────────────── */}
      <div
        ref={trackRef}
        data-testid="mobile-before-and-after-track"
        style={{
          marginTop: 32,
          display: 'flex',
          gap: 16,
          overflowX: 'auto',
          overflowY: 'hidden',
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
          // Tiny peek of the next/previous card so users notice the carousel
          // (16 px outer pad + 16 px peek = standard mobile gutter).
          paddingLeft: 16,
          paddingRight: 16,
          scrollbarWidth: 'none',
        }}
      >
        <style>{`
          [data-testid="mobile-before-and-after-track"]::-webkit-scrollbar { display: none; }
        `}</style>

        {list.map((c, i) => (
          <article
            key={c.id || i}
            data-card-idx={i}
            data-testid={`mobile-before-and-after-card-${i + 1}`}
            style={{
              flex: '0 0 auto',
              width: 328,
              height: 317,
              boxSizing: 'border-box',
              background: '#1A1A1A',
              scrollSnapAlign: 'center',
              position: 'relative',
              padding: '16px 10px 18px',
              display: 'flex',
              flexDirection: 'column',
              color: '#FFFFFF',
            }}
          >
            {/* /before /after labels — absolute, exact insets per Figma */}
            <span
              style={{
                position: 'absolute',
                top: 16,
                left: 62.5,
                fontFamily: FONT,
                fontWeight: 500,
                fontSize: 12,
                lineHeight: '14px',
                color: '#FFFFFF',
                whiteSpace: 'nowrap',
              }}
            >
              / before
            </span>
            <span
              style={{
                position: 'absolute',
                top: 16,
                right: 61.5,
                fontFamily: FONT,
                fontWeight: 500,
                fontSize: 12,
                lineHeight: '14px',
                color: '#FEAE00',
                whiteSpace: 'nowrap',
              }}
            >
              / after
            </span>

            {/* Photos row — 150 × 144 each */}
            <div
              style={{
                marginTop: 22, // 16 (top inset) + 14 (label line) − ~8 visual
                display: 'flex',
                gap: 8,
                justifyContent: 'center',
              }}
            >
              <img
                src={fullMediaUrl(c.before_image_url)}
                alt="before"
                data-testid={`mobile-before-img-${i + 1}`}
                style={{
                  width: 150,
                  height: 144,
                  objectFit: 'cover',
                  filter: 'grayscale(1)',
                  display: 'block',
                }}
                loading="lazy"
                onError={(e) => { e.currentTarget.style.opacity = 0.3; }}
              />
              <img
                src={fullMediaUrl(c.after_image_url)}
                alt="after"
                data-testid={`mobile-after-img-${i + 1}`}
                style={{
                  width: 150,
                  height: 144,
                  objectFit: 'cover',
                  display: 'block',
                }}
                loading="lazy"
                onError={(e) => { e.currentTarget.style.opacity = 0.3; }}
              />
            </div>

            {/* Model title (BMV 328) */}
            <h3
              data-testid={`mobile-before-and-after-model-${i + 1}`}
              style={{
                margin: '14px 10px 0',
                fontFamily: FONT,
                fontWeight: 700,
                fontSize: 16,
                lineHeight: '20px',
                color: '#FFFFFF',
                letterSpacing: 0,
              }}
            >
              {c.model || 'BMV 328'}
            </h3>

            {/* Info rows — labels: H Regular 12 / gray;  values: H Medium 14 / white */}
            <dl
              style={{
                margin: '12px 10px 0',
                padding: 0,
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                rowGap: 8,
                columnGap: 12,
                fontFamily: FONT,
                letterSpacing: 0,
              }}
            >
              <dt
                style={{
                  margin: 0,
                  fontFamily: FONT,
                  fontWeight: 400,
                  fontSize: 12,
                  lineHeight: '16px',
                  color: '#9B9B9B',
                }}
              >
                Order date
              </dt>
              <dd
                data-testid={`mobile-before-and-after-order-${i + 1}`}
                style={{
                  margin: 0,
                  textAlign: 'right',
                  fontFamily: FONT,
                  fontWeight: 500,
                  fontSize: 14,
                  lineHeight: '18px',
                  color: '#FFFFFF',
                }}
              >
                {c.order_date || ''}
              </dd>

              <dt
                style={{
                  margin: 0,
                  fontFamily: FONT,
                  fontWeight: 400,
                  fontSize: 12,
                  lineHeight: '16px',
                  color: '#9B9B9B',
                }}
              >
                The date of the finished car
              </dt>
              <dd
                data-testid={`mobile-before-and-after-finished-${i + 1}`}
                style={{
                  margin: 0,
                  textAlign: 'right',
                  fontFamily: FONT,
                  fontWeight: 500,
                  fontSize: 14,
                  lineHeight: '18px',
                  color: '#FFFFFF',
                }}
              >
                {c.finished_date || ''}
              </dd>

              <dt
                style={{
                  margin: 0,
                  fontFamily: FONT,
                  fontWeight: 400,
                  fontSize: 12,
                  lineHeight: '16px',
                  color: '#9B9B9B',
                }}
              >
                Turnkey price in Bulgaria
              </dt>
              <dd
                data-testid={`mobile-before-and-after-price-${i + 1}`}
                style={{
                  margin: 0,
                  textAlign: 'right',
                  fontFamily: FONT,
                  fontWeight: 500,
                  fontSize: 14,
                  lineHeight: '18px',
                  color: '#FFFFFF',
                }}
              >
                {c.price || ''}
              </dd>
            </dl>
          </article>
        ))}
      </div>

      {/* ── Pagination row: ← 01/10 → ──────────────────────────────────── */}
      <div
        data-testid="mobile-before-and-after-pagination"
        style={{
          marginTop: 24,
          // Side insets 116 / 115 centre the 36 + 24 + ~44 + 24 + 36 = 164 px
          // pagination block inside a 396 px target row. On a 360-wide screen
          // we clamp this to a sensible 0-edge fallback so it stays visible.
          padding: '0 max(0px, calc((100% - 360px) / 2))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 24,
        }}
      >
        <button
          type="button"
          aria-label="Previous"
          onClick={prev}
          data-testid="mobile-before-and-after-prev"
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            border: '1.5px solid #FEAE00',
            background: 'transparent',
            color: '#FEAE00',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
            lineHeight: 1,
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M15 4l-8 8 8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <span
          data-testid="mobile-before-and-after-counter"
          style={{
            fontFamily: FONT,
            fontWeight: 500,
            fontSize: 12,
            lineHeight: '16px',
            color: '#FFFFFF',
            letterSpacing: 0,
            minWidth: 44,
            textAlign: 'center',
          }}
        >
          {counter}
        </span>

        <button
          type="button"
          aria-label="Next"
          onClick={next}
          data-testid="mobile-before-and-after-next"
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            border: 'none',
            background: '#FEAE00',
            color: '#000000',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
            lineHeight: 1,
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M9 4l8 8-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────── */
/* MobileOurClientsSay                                                     */
/*                                                                         */
/* Reviews block on the mobile homepage. Sits AFTER `MobileBeforeAndAfter` */
/* and BEFORE the "Want to drive your dream car?" CTA. Built from the      */
/* same `/api/site-info` payload that drives the desktop block:            */
/*   • reviews.items[]   — list of customer reviews                        */
/*   • reviews.google_rating         — e.g. 4.9                            */
/*   • reviews.google_reviews_count  — e.g. 31                             */
/*                                                                         */
/* Section frame: 361 × 815 (mobile Figma).                                */
/* Carousel uses the SAME IntersectionObserver + dominance ≥ 55% logic     */
/* as the Before / After block so the counter is honest and stable.        */
/* ─────────────────────────────────────────────────────────────────────── */
function MobileOurClientsSay({ reviews, googleRating, googleReviewsCount, activeIdx, setActiveIdx }) {
  const FONT = "'Mazzard H', 'Mazzard', system-ui, -apple-system, sans-serif";

  const list = Array.isArray(reviews) ? reviews : [];
  const total = list.length;
  const idx = total > 0 ? Math.min(Math.max(0, activeIdx || 0), total - 1) : 0;
  const counter =
    total > 0
      ? `${String(idx + 1).padStart(2, '0')}/${String(total).padStart(2, '0')}`
      : '00/00';

  const trackRef = useRef(null);

  const scrollToIdx = (targetIdx) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.children[targetIdx];
    if (!card) return;
    const left = card.offsetLeft - (track.clientWidth - card.offsetWidth) / 2;
    track.scrollTo({ left, behavior: 'smooth' });
  };

  const firstRunRef = useRef(true);
  useEffect(() => {
    if (firstRunRef.current) {
      firstRunRef.current = false;
      return;
    }
    if (total > 0) scrollToIdx(idx);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, total]);

  // Dominant-card detection — STICKY 70 %: counter stays on the current
  // card while it's ≥ 70 % visible, and only flips when a DIFFERENT card
  // crosses ≥ 70 % visibility (identical rule to the Before / After block).
  const idxRef = useRef(idx);
  useEffect(() => { idxRef.current = idx; }, [idx]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || total === 0) return;
    if (typeof IntersectionObserver === 'undefined') return;

    const ratios = new Map();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          const ci = Number(e.target.getAttribute('data-card-idx'));
          ratios.set(ci, e.intersectionRatio);
        });
        const cur = idxRef.current;
        if ((ratios.get(cur) || 0) >= 0.7) return;
        let bestI = -1;
        let bestR = 0.7;
        ratios.forEach((r, i) => { if (r > bestR) { bestR = r; bestI = i; } });
        if (bestI >= 0 && bestI !== cur) setActiveIdx(bestI);
      },
      { root: track, threshold: [0, 0.3, 0.5, 0.7, 0.85, 1] },
    );

    const cards = Array.from(track.children).filter(
      (n) => n.nodeType === 1 && n.hasAttribute && n.hasAttribute('data-card-idx'),
    );
    cards.forEach((c) => observer.observe(c));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total]);

  const prev = () => total > 0 && setActiveIdx((idx - 1 + total) % total);
  const next = () => total > 0 && setActiveIdx((idx + 1) % total);

  // ── 5 yellow stars used in the Google rating block (80 × 16 block) ───
  const Star = ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="M8 1.2l2.06 4.18 4.61.67-3.34 3.26.79 4.6L8 11.74l-4.12 2.17.79-4.6L1.33 6.05l4.61-.67L8 1.2z"
        fill="#FEAE00"
      />
    </svg>
  );

  // Resolve avatar image (backend-served / public / absolute http(s) URLs).
  const fullMediaUrl = (u) => {
    if (!u) return '';
    if (/^https?:\/\//i.test(u)) return u;
    if (u.startsWith('/figma/') || u.startsWith('/mobile/')) return u;
    if (u.startsWith('/')) return `${API}${u}`;
    return `${API}/${u}`;
  };

  return (
    <section
      data-testid="mobile-our-clients-say"
      style={{
        width: '100%',
        background: '#000000',
        fontFamily: FONT,
        padding: '73px 0 40px',
        boxSizing: 'border-box',
      }}
    >
      {/* ── Section title "OUR CLIENTS SAY" (centered, 76 px side insets) */}
      <h2
        data-testid="mobile-our-clients-say-title"
        style={{
          margin: '0 76px',
          fontFamily: FONT,
          fontWeight: 700,
          fontSize: 24,
          lineHeight: '28px',
          textAlign: 'center',
          textTransform: 'uppercase',
          color: '#FEAE00',
          letterSpacing: 0,
        }}
      >
        Our clients say
      </h2>

      {/* ── Subtitle (yellow + white), 24 px below title */}
      <div
        data-testid="mobile-our-clients-say-subtitle"
        style={{
          margin: '24px 76px 0',
          fontFamily: FONT,
          fontWeight: 500,
          fontSize: 16,
          lineHeight: '20px',
          textAlign: 'center',
          textTransform: 'uppercase',
          letterSpacing: 0,
        }}
      >
        <span style={{ color: '#FEAE00' }}>Satisfied clients</span>
        <br />
        <span style={{ color: '#FFFFFF' }}>are our priority</span>
      </div>

      {/* ── Google trust row — logo left @17, rating block right @17 */}
      <div
        data-testid="mobile-our-clients-say-google"
        style={{
          marginTop: 44,
          padding: '0 17px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <img
          src="/figma/google-logo.svg"
          alt="Google"
          style={{ height: 26, width: 'auto', display: 'block' }}
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              data-testid="mobile-our-clients-say-rating"
              style={{
                fontFamily: FONT,
                fontWeight: 700,
                fontSize: 14,
                lineHeight: '16px',
                color: '#FFFFFF',
              }}
            >
              {googleRating ?? 4.9}
            </span>
            <span
              aria-label={`${googleRating ?? 4.9} out of 5 stars`}
              style={{
                width: 80,
                height: 16,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Star /><Star /><Star /><Star /><Star />
            </span>
          </div>
          <a
            href="https://g.page/r/bibicars/review"
            target="_blank"
            rel="noopener noreferrer"
            data-testid="mobile-our-clients-say-reviews-link"
            style={{
              fontFamily: FONT,
              fontWeight: 500,
              fontSize: 12,
              lineHeight: '14px',
              color: '#FFFFFF',
              textDecoration: 'underline',
              textUnderlineOffset: '2px',
            }}
          >
            {googleReviewsCount ?? 31} Google reviews
          </a>
        </div>
      </div>

      {/* ── "What customers say when they work with us" heading (left @17) */}
      <h3
        data-testid="mobile-our-clients-say-heading"
        style={{
          margin: '47px 17px 0',
          fontFamily: FONT,
          fontWeight: 700,
          fontSize: 24,
          lineHeight: '28px',
          color: '#FFFFFF',
          letterSpacing: 0,
        }}
      >
        What customers say
        <br />
        when they work with us
      </h3>

      {/* ── Reviews track (horizontal scroll + snap) ────────────────────── */}
      <div
        ref={trackRef}
        data-testid="mobile-our-clients-say-track"
        style={{
          marginTop: 24,
          display: 'flex',
          gap: 16,
          overflowX: 'auto',
          overflowY: 'hidden',
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
          paddingLeft: 16,
          paddingRight: 16,
          scrollbarWidth: 'none',
        }}
      >
        <style>{`
          [data-testid="mobile-our-clients-say-track"]::-webkit-scrollbar { display: none; }
        `}</style>

        {total === 0 ? (
          <div
            style={{
              width: '100%',
              padding: '40px 16px',
              textAlign: 'center',
              color: '#9B9B9B',
              fontFamily: FONT,
              fontWeight: 400,
              fontSize: 14,
            }}
          >
            No reviews yet.
          </div>
        ) : (
          list.map((r, i) => (
            <article
              key={r.id || `${r.name}-${i}`}
              data-card-idx={i}
              data-testid={`mobile-our-clients-say-card-${i + 1}`}
              style={{
                flex: '0 0 auto',
                width: 330,
                height: 324,
                boxSizing: 'border-box',
                background: '#1A1A1A',
                scrollSnapAlign: 'center',
                padding: '24px 20px',
                display: 'flex',
                flexDirection: 'column',
                color: '#FFFFFF',
              }}
            >
              {/* Header: avatar + name (gap 27) */}
              <header style={{ display: 'flex', alignItems: 'center', gap: 27 }}>
                {r.image_url ? (
                  <img
                    src={fullMediaUrl(r.image_url)}
                    alt={r.name || ''}
                    width={40}
                    height={40}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      objectFit: 'cover',
                      display: 'block',
                      flex: '0 0 auto',
                    }}
                    loading="lazy"
                    onError={(e) => {
                      // Fall back to a neutral initial-avatar circle
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <div
                    aria-hidden="true"
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      background: '#3A3A3A',
                      flex: '0 0 auto',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFFFFF',
                      fontFamily: FONT,
                      fontWeight: 700,
                      fontSize: 16,
                    }}
                  >
                    {(r.name || '?').slice(0, 1).toUpperCase()}
                  </div>
                )}
                <h4
                  data-testid={`mobile-our-clients-say-name-${i + 1}`}
                  style={{
                    margin: 0,
                    fontFamily: FONT,
                    fontWeight: 700,
                    fontSize: 24,
                    lineHeight: '28px',
                    color: '#FEAE00',
                    letterSpacing: 0,
                  }}
                >
                  {r.name || ''}
                </h4>
              </header>

              {/* Review body */}
              <p
                data-testid={`mobile-our-clients-say-text-${i + 1}`}
                style={{
                  margin: '16px 0 0 0',
                  fontFamily: FONT,
                  fontWeight: 400,
                  fontSize: 16,
                  lineHeight: '22px',
                  color: '#FFFFFF',
                  letterSpacing: 0,
                  overflow: 'hidden',
                }}
              >
                {r.text || ''}
              </p>
            </article>
          ))
        )}
      </div>

      {/* ── Pagination ← 01/10 → ─────────────────────────────────────────── */}
      {total > 0 && (
        <div
          data-testid="mobile-our-clients-say-pagination"
          style={{
            marginTop: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 24,
          }}
        >
          <button
            type="button"
            aria-label="Previous"
            onClick={prev}
            data-testid="mobile-our-clients-say-prev"
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              border: '1.5px solid #FEAE00',
              background: 'transparent',
              color: '#FEAE00',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
              lineHeight: 1,
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M15 4l-8 8 8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <span
            data-testid="mobile-our-clients-say-counter"
            style={{
              fontFamily: FONT,
              fontWeight: 500,
              fontSize: 12,
              lineHeight: '16px',
              color: '#FFFFFF',
              letterSpacing: 0,
              minWidth: 44,
              textAlign: 'center',
            }}
          >
            {counter}
          </span>

          <button
            type="button"
            aria-label="Next"
            onClick={next}
            data-testid="mobile-our-clients-say-next"
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              border: 'none',
              background: '#FEAE00',
              color: '#000000',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
              lineHeight: 1,
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M9 4l8 8-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      )}
    </section>
  );
}


/* ─────────────────────────────────────────────────────────────────────── */
/* MobileWhyPayLess                                                        */
/*                                                                         */
/* "Why you pay less — and get more" benefits block, sits between the      */
/* `MobileOurClientsSay` reviews carousel and the Dream-car CTA.           */
/*                                                                         */
/* Figma mobile mock (frame 359 × 834):                                    */
/*   • Section bg                       — #000000                          */
/*   • Title (centered, side insets 65, top 47):                           */
/*       "WHY YOU PAY LESS"             — H Bold 24, #FEAE00               */
/*       "— AND GET MORE"               — H Bold 24, dash yellow + words   */
/*                                        white. Rendered as two coloured  */
/*                                        spans on one line.               */
/*   • Hero illustration                 — /figma/why-pay-less-car.svg     */
/*                                        (328 × 328, side insets 16 / 16) */
/*   • Benefit list (4 items, total 298 × 433):                            */
/*       Header  /TEXT                   — H Bold    16, #FEAE00, upper    */
/*       Body                            — H Regular 16, #FFFFFF           */
/*       Header → body gap               — 8 px                            */
/*       Block-to-block gap              — 49 px                           */
/* ─────────────────────────────────────────────────────────────────────── */
function MobileWhyPayLess() {
  const FONT = "'Mazzard H', 'Mazzard', system-ui, -apple-system, sans-serif";

  const ITEMS = [
    {
      title: 'Large selection',
      body: 'More trim levels, colors, rare models',
    },
    {
      title: 'Better trim levels',
      body: 'More options\nBetter multimedia\nHigher level of comfort',
    },
    {
      title: 'Much cheaper',
      body:
        'Even taking into account delivery and customs clearance,\nthe car often comes out 20–50% cheaper',
    },
    {
      title: 'Transparent history',
      body: 'VIN checks (Carfax, AutoCheck)',
    },
  ];

  return (
    <section
      data-testid="mobile-why-pay-less"
      style={{
        width: '100%',
        background: '#000000',
        fontFamily: FONT,
        // Top inset 47 per Figma. Bottom inset 100 keeps a clear breathing
        // gap between the last benefit ("/ TRANSPARENT HISTORY · VIN checks")
        // and the Dream-car CTA image below — analysed from the Figma mock.
        padding: '47px 0 100px',
        boxSizing: 'border-box',
      }}
    >
      {/* ── Title: two-tone "WHY YOU PAY LESS — AND GET MORE" ──────────── */}
      <h2
        data-testid="mobile-why-pay-less-title"
        style={{
          margin: '0 65px',
          fontFamily: FONT,
          fontWeight: 700,
          fontSize: 24,
          lineHeight: '28px',
          textAlign: 'center',
          textTransform: 'uppercase',
          letterSpacing: 0,
        }}
      >
        <span style={{ color: '#FEAE00' }}>Why you pay less</span>
        <br />
        <span style={{ color: '#FEAE00' }}>— </span>
        <span style={{ color: '#FFFFFF' }}>and get more</span>
      </h2>

      {/* ── Hero illustration — 328 × 328, side insets 16 / 16 ─────────── */}
      <div
        data-testid="mobile-why-pay-less-hero"
        style={{
          margin: '24px 16px 0',
          width: 'calc(100% - 32px)',
          maxWidth: 328,
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      >
        <img
          src="/figma/why-pay-less-car.png"
          alt="Audi"
          width={328}
          height={328}
          style={{
            display: 'block',
            width: '100%',
            height: 'auto',
            aspectRatio: '328 / 328',
            objectFit: 'contain',
          }}
          loading="lazy"
          onError={(e) => {
            // Hard fallback to the bundled SVG illustration if PNG missing.
            const t = e.currentTarget;
            if (t && !t.dataset.fallback) {
              t.dataset.fallback = '1';
              t.src = '/figma/why-pay-less-car.svg';
            } else {
              t.style.display = 'none';
            }
          }}
        />
      </div>

      {/* ── Benefits list ──────────────────────────────────────────────── */}
      <div
        data-testid="mobile-why-pay-less-list"
        style={{
          // Block width 298 inside a 360-wide screen → side insets ≈ 31 / 31
          // ("Подпись внизу" lives in the same 298-wide column as the title)
          margin: '24px auto 0',
          width: 298,
          maxWidth: 'calc(100% - 32px)',
          display: 'flex',
          flexDirection: 'column',
          // Block-to-block gap per Figma — 49 px between the bottoms of one
          // benefit's body and the next benefit's yellow header.
          rowGap: 49,
        }}
      >
        {ITEMS.map((it, i) => (
          <div
            key={it.title}
            data-testid={`mobile-why-pay-less-item-${i + 1}`}
            style={{ display: 'flex', flexDirection: 'column' }}
          >
            <h3
              data-testid={`mobile-why-pay-less-item-title-${i + 1}`}
              style={{
                margin: 0,
                fontFamily: FONT,
                fontWeight: 700,
                fontSize: 16,
                lineHeight: '20px',
                color: '#FEAE00',
                textTransform: 'uppercase',
                letterSpacing: 0,
              }}
            >
              / {it.title}
            </h3>
            <p
              data-testid={`mobile-why-pay-less-item-body-${i + 1}`}
              style={{
                // 8 px between yellow header and white body, per Figma.
                margin: '8px 0 0 0',
                fontFamily: FONT,
                fontWeight: 400,
                fontSize: 16,
                lineHeight: '22px',
                color: '#FFFFFF',
                whiteSpace: 'pre-line',
                letterSpacing: 0,
              }}
            >
              {it.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

