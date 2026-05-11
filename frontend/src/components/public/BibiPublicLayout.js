/**
 * BIBI Cars — shared public-page Layout (Header + Footer).
 *
 * V5 (May 2026) — Header / Footer UNIFICATION (cleanup pass).
 *
 * Single source of truth for the public site chrome: we render the same
 * Figma `Header1` / `Footer1` on EVERY public route, scaled responsively via
 * `<ScaledChrome />`. There used to be a parallel "legacy" Bibi header/footer
 * that diverged visually from the Figma design — it has been deleted.
 *
 * All admin-managed data (phones, addresses, socials, viber community,
 * CTA labels, working hours) is consumed by `Header1` / `Footer1` themselves
 * via `/api/site-info`.
 *
 *   • Logo → `/`
 *   • CATALOG / CALCULATOR / ABOUT US / CONTACTS → React Router links
 *   • Search → `/vin/<query>`
 *   • Phones → `tel:` links (admin-controlled)
 *   • ENG / BG dropdown → LanguageContext
 *   • Profile icon → `/cabinet/login` (or active customer cabinet)
 *   • CONTACT US → `/contacts#phone`
 *   • Footer "Get in touch" → opens shared modal
 */

import React from 'react';
import { useLocation } from 'react-router-dom';
import Header1 from '../../figma_home/components/header1';
import Footer1 from '../../figma_home/components/footer1';
import useIsMobile from '../../figma_home/mobile/useIsMobile';
import ScaledChrome from './ScaledChrome';
import './BibiPublicLayout.css';

export function BibiHeader() {
  const isMobile = useIsMobile(768);
  const { pathname } = useLocation();
  // On mobile homepage the dedicated <MobileHeader /> is rendered inside
  // <MobileHomePage />, so the scaled desktop header would create a thin
  // strip artefact above it. Hide it for `/` on small screens.
  if (isMobile && pathname === '/') return null;
  return (
    <ScaledChrome>
      <Header1 />
    </ScaledChrome>
  );
}

export function BibiFooter() {
  const isMobile = useIsMobile(768);
  const { pathname } = useLocation();
  // Same rationale as BibiHeader: on mobile homepage the MobileHomePage
  // renders its own footer, so skip the scaled desktop one.
  if (isMobile && pathname === '/') return null;
  return (
    <ScaledChrome>
      <Footer1 />
    </ScaledChrome>
  );
}

export default { BibiHeader, BibiFooter };
