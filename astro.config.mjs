// @ts-check
import { defineConfig, envField } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://dariolanfranco.github.io',
  base: '/piksel',
  output: 'static',
  vite: {
    plugins: [tailwindcss()]
  },
  env: {
    schema: {
      SHEETS_CSV_URL: envField.string({ context: 'server', access: 'secret', optional: false }),
      PUBLIC_WHATSAPP_PHONE: envField.string({ context: 'client', access: 'public', optional: false }),
    },
  },
});