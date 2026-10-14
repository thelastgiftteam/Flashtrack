/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./pages/index.js'],
  // Preflight (Tailwind's global CSS reset) is off so the tracking pages,
  // OCR tool and demo, which use their own inline styles, are not affected.
  corePlugins: { preflight: false },
  theme: { extend: {} },
  plugins: [],
};
