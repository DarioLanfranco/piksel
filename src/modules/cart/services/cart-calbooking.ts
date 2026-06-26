import { buildCalEmbedUrl } from '../../checkout/services/cal.service';

export interface CalBookingModal {
  open: (notes: string) => void;
  close: () => void;
  overlay: HTMLElement | null;
}

export function createCalBookingModal(): CalBookingModal {
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

  closeBtn?.addEventListener('click', close);
  overlay?.addEventListener('click', function (e: Event) {
    if (e.target === overlay) close();
  });

  return { open, close, overlay };
}
