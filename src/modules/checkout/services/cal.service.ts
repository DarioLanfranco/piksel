const CAL_LINK = 'dario-lanfranco-ruffener-ahd7km/muestra-de-equipo';
const FALLBACK_TIMEOUT = 2500;

function cleanupCalElements(): void {
  const els = document.querySelectorAll<HTMLElement>(
    '.cal-embed-modal, [data-cal-iframe], div[id^="cal-"]',
  );
  for (let i = 0; i < els.length; i++) {
    els[i].remove();
  }
}

function calModalRootExists(): boolean {
  return !!(
    document.querySelector('.cal-embed-modal') ||
    document.querySelector('[data-cal-iframe]') ||
    document.querySelector('div[id^="cal-"]')
  );
}

export function buildCalDirectUrl(notes: string): string {
  const base = 'https://cal.com/' + CAL_LINK;
  if (!notes) return base;
  return base + '?notes=' + encodeURIComponent(notes);
}

export function buildCalEmbedUrl(notes: string): string {
  const params: string[] = ['embed=true', 'theme=dark'];
  if (notes) params.push('notes=' + encodeURIComponent(notes));
  return 'https://cal.com/' + CAL_LINK + '?' + params.join('&');
}

export function openCalModalWithFallback(notes: string): void {
  const directUrl = buildCalDirectUrl(notes);
  let fallbackFired = false;
  let fallbackTimer: ReturnType<typeof setTimeout> | null = null;

  function fireFallback(): void {
    if (fallbackFired) return;
    fallbackFired = true;
    if (fallbackTimer !== null) clearTimeout(fallbackTimer);
    cleanupCalElements();
    window.open(directUrl, '_blank');
  }

  // --- Fallback timer ---
  fallbackTimer = setTimeout(fireFallback, FALLBACK_TIMEOUT);

  // --- Watch for Cal.com modal appearing in DOM ---
  let checkInterval: ReturnType<typeof setInterval> | null = null;

  function stopWatching(): void {
    if (checkInterval !== null) {
      clearInterval(checkInterval);
      checkInterval = null;
    }
  }

  checkInterval = setInterval(function () {
    if (calModalRootExists()) {
      // Modal appeared successfully — cancel the fallback
      if (fallbackTimer !== null) clearTimeout(fallbackTimer);
      fallbackTimer = null;
      fallbackFired = true; // prevent fallback
      stopWatching();
    }
  }, 200);

  // --- Try modal via Cal.com SDK ---
  if (typeof window.Cal === 'undefined') {
    console.warn('[CalService] window.Cal no está definido. Abriendo URL directa.');
    stopWatching();
    fireFallback();
    return;
  }

  try {
    window.Cal('modal', {
      calLink: CAL_LINK,
      config: { notes },
    });
  } catch (err) {
    console.error('[CalService] Error al llamar Cal("modal"), fallback a URL directa:', err);
    stopWatching();
    fireFallback();
  }
}

export function buildCartNotes(
  items: { marca: string; modelo: string; almacenamiento: string; color: string; quantity: number }[],
): string {
  if (items.length === 0) return '';

  const lines: string[] = [];
  for (const item of items) {
    lines.push(
      item.quantity + 'x ' + item.marca + ' ' + item.modelo + ' (' + item.almacenamiento + ' · ' + item.color + ')',
    );
  }

  return 'Productos en muestra:\n' + lines.join('\n');
}
