import { buildCalEmbedUrl } from '../../checkout/services/cal.service';

export interface CalBookingModal {
  open: (notes: string) => void;
  close: () => void;
  overlay: HTMLElement | null;
}

export function createCalBookingModal(onSuccess?: () => void): CalBookingModal {
  const overlay = document.getElementById('cal-booking-overlay');
  const card = document.getElementById('cal-booking-card');
  const iframe = document.getElementById('cal-booking-iframe');
  const closeBtn = document.getElementById('cal-booking-close');

  function open(notes: string): void {
    const url = buildCalEmbedUrl(notes);
    if (iframe instanceof HTMLIFrameElement) iframe.setAttribute('src', url);
    overlay?.classList.remove('opacity-0', 'pointer-events-none');
    if (card) requestAnimationFrame(function () { card.classList.remove('scale-95'); });
    document.body.style.overflow = 'hidden';
  }

  function close(): void {
    card?.classList.add('scale-95');
    overlay?.classList.add('opacity-0', 'pointer-events-none');
    document.body.style.overflow = '';
    setTimeout(function () {
      if (iframe instanceof HTMLIFrameElement) iframe.removeAttribute('src');
    }, 350);
  }

  function handleSuccess(): void {
    close();
    onSuccess?.();
  }

  closeBtn?.addEventListener('click', close);
  overlay?.addEventListener('click', function (e: Event) {
    if (e.target === overlay) close();
  });

  /* ── Cal.com iframe → parent postMessage ──
   * El iframe (cal.com) envía mensajes con originator:"CAL", fullType:"CAL:{ns}:bookingSuccessful[V2]"
   * Ver: packages/embeds/embed-core/src/embed-iframe.ts → messageParent()
   */
  window.addEventListener('message', function (e: MessageEvent) {
    const d = e.data;
    if (!d) return;
    if (d.originator !== 'CAL') return;

    const type = d.type;
    if (type === 'bookingSuccessful' || type === 'bookingSuccessfulV2') {
      handleSuccess();
    }
  });

  return { open, close, overlay };
}
