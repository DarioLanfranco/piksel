const CAL_LINK = 'dario-lanfranco-ruffener-ahd7km/muestra-de-equipo';

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

export function buildCartNotes(
  items: { marca: string; modelo: string; almacenamiento: string; color: string; quantity: number }[],
): string {
  if (items.length === 0) return '';

  const lines: string[] = [];
  for (const item of items) {
    lines.push(
      item.quantity + 'x ' + item.marca + ' ' + item.modelo + ' (' + item.almacenamiento + ' \u00b7 ' + item.color + ')',
    );
  }

  return 'Productos en muestra:\n' + lines.join('\n');
}
