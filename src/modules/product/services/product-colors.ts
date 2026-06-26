const COLOR_MAP: Record<string, string> = {
  black: '#1d1d1f', white: '#f5f5f7', silver: '#c0c0c0', gold: '#f5d78e',
  'space black': '#1d1d1f', 'space gray': '#4a4a4a', midnight: '#1a1a2e',
  starlight: '#f5f0e8', blue: '#007aff', green: '#34c759', purple: '#af52de',
  red: '#ff3b30', yellow: '#ffcc00', pink: '#ff2d55', titanio: '#8a8a8f',
  negro: '#1d1d1f', blanco: '#f5f5f7', verde: '#34c759',
};

export function getColorHex(colorName: string): string {
  return COLOR_MAP[colorName.toLowerCase()] ?? '#aeaeb2';
}
