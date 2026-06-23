export interface OrderMessageItem {
  quantity: number;
  productName: string;
  productSpec: string;
  subtotal: number;
}

export interface BuildOrderMessageParams {
  customerNombre: string;
  customerApellido: string;
  customerTelefono: string;
  metodoEntrega: string;
  metodoPago: string;
  items: OrderMessageItem[];
  totalUSD: number;
}

const ENTREGA_LABELS: Record<string, string> = {
  retiro: 'Retiro en local',
  envio: 'Envío a domicilio',
};

const PAGO_LABELS: Record<string, string> = {
  efectivo_usd: 'Efectivo USD (5% descuento)',
  transferencia_ars: 'Transferencia ARS (sin interés)',
  financiado: 'Financiado (3 a 12 cuotas)',
};

function formatDate(): string {
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date());
}

function formatCurrency(n: number): string {
  if (!Number.isFinite(n)) return '$0 USD';
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

function metodoEntregaText(key: string): string {
  return ENTREGA_LABELS[key] ?? key;
}

function metodoPagoText(key: string): string {
  return PAGO_LABELS[key] ?? key;
}

export function buildOrderMessage(params: BuildOrderMessageParams): string {
  const lines: string[] = [];

  lines.push('🛸 *Nuevo Pedido en piksel*');
  lines.push('📅 ' + formatDate());
  lines.push('');
  lines.push('━━━━━━━━━━━━━');
  lines.push('👤 *Datos del Cliente*');
  lines.push('Nombre: ' + params.customerNombre + ' ' + params.customerApellido);
  lines.push('Teléfono: +54 9 ' + params.customerTelefono);
  lines.push('');
  lines.push('📍 *Método de Entrega*');
  lines.push(metodoEntregaText(params.metodoEntrega));
  lines.push('');
  lines.push('💳 *Método de Pago*');
  lines.push(metodoPagoText(params.metodoPago));
  lines.push('');
  lines.push('📦 *Detalle del Pedido*');

  for (const item of params.items) {
    const subtotal = formatCurrency(item.subtotal);
    lines.push(
      item.quantity + 'x ' + item.productName + ' (' + item.productSpec + ') → ' + subtotal,
    );
  }

  lines.push('');
  lines.push('━━━━━━━━━━━━━');
  lines.push('💰 *Total: ' + formatCurrency(params.totalUSD) + '*');
  lines.push('');

  return lines.join('\n');
}
