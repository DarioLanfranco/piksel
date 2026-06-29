const theme = typeof localStorage !== 'undefined' && localStorage.getItem('theme')
  ? localStorage.getItem('theme')
  : window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';

document.documentElement.classList.toggle('dark', theme === 'dark');
try { localStorage.setItem('theme', theme); } catch (e) {}
