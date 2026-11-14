/**
 * Detects whether the current device is a mobile device or desktop/PC.
 * Combines navigator.userAgent mobile patterns, touch point capability, and viewport width.
 * Returns true if mobile device/tablet, false if desktop/PC.
 */
export function isMobileDevice() {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }

  const ua = navigator.userAgent || navigator.vendor || window.opera || '';

  // 1. User Agent mobile pattern check (iOS, Android, Windows Phone, Opera Mini, Mobile Safari, etc.)
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|Silk|Kindle/i;
  const isMobileUa = mobileRegex.test(ua);

  // 2. Touch capability check
  const hasTouchPoints = Boolean(
    (typeof navigator.maxTouchPoints === 'number' && navigator.maxTouchPoints > 0) ||
    (typeof navigator.msMaxTouchPoints === 'number' && navigator.msMaxTouchPoints > 0) ||
    'ontouchstart' in window
  );

  // 3. Viewport width check (typical mobile breakpoint <= 768px)
  const isMobileViewport = window.innerWidth <= 768;

  // A device is mobile if the UA matches mobile signatures, or if touch points exist with a mobile viewport
  if (isMobileUa) {
    return true;
  }

  if (hasTouchPoints && isMobileViewport) {
    return true;
  }

  return false;
}
