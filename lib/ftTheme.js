// Shared look for the customer-facing tracking pages (brand order list,
// parcel page, demo). Matches the homepage: white + India Post red/yellow,
// navy ink, Archivo headlines, Instrument Sans body.

export const C = {
  ink:    '#14213D',
  red:    '#D7262E',
  yellow: '#FFC72C',
  paper:  '#FFFFFF',
  mist:   '#F3F5F9',
  line:   '#E3E7EF',
  muted:  '#5A6480',
  soft:   '#8A93A6',
  green:  '#16884F',
  wa:     '#1FA855',
};

export const FONT_HREF =
  'https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..900&family=Instrument+Sans:wght@400;500;600;700&display=swap';

export const DISPLAY = { fontFamily: "'Archivo',system-ui,sans-serif", fontWeight: 800, fontStretch: '112%', letterSpacing: '-0.02em' };

// Every status the pages can show. Sheet values ("Transit") are mapped below.
export const STATUS = {
  'Delivered':           { color: '#16884F', bg: '#E7F6EE', icon: '✅' },
  'Out for delivery':    { color: '#B45309', bg: '#FFF4D1', icon: '🛵' },
  'Held at post office': { color: '#B45309', bg: '#FFF4D1', icon: '🏤' },
  'In transit':          { color: '#1D4ED8', bg: '#E8EFFE', icon: '🚚' },
  'Returning to sender': { color: '#D7262E', bg: '#FDECEC', icon: '↩️' },
  'Booked':              { color: '#5A6480', bg: '#EEF1F5', icon: '📦' },
};

export function statusOf(s) {
  const v = String(s || '').trim();
  if (!v || /^transit$/i.test(v)) return 'In transit';
  return v;
}

export function statusStyle(s) {
  return STATUS[statusOf(s)] || STATUS['In transit'];
}

export const BASE_CSS = `
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}
body{background:${C.mist};color:${C.ink};font-family:'Instrument Sans',system-ui,sans-serif;min-height:100vh;-webkit-font-smoothing:antialiased;}
a{color:inherit;text-decoration:none;}
button,input{font-family:inherit;}
input::placeholder{color:${C.soft};}
.ft-display{font-family:'Archivo',system-ui,sans-serif;font-weight:800;font-stretch:112%;letter-spacing:-0.02em;}
.ft-skel{background:linear-gradient(90deg,#E9ECF2 25%,#F5F7FA 50%,#E9ECF2 75%);background-size:200% 100%;animation:ftShimmer 1.4s infinite;border-radius:18px;}
@keyframes ftShimmer{0%{background-position:-200% 0;}100%{background-position:200% 0;}}
@keyframes ftSpin{to{transform:rotate(360deg);}}
@keyframes ftPing{75%,100%{transform:scale(2.2);opacity:0;}}
a:focus-visible,button:focus-visible,input:focus-visible{outline:3px solid ${C.yellow};outline-offset:2px;}
.ft-sm-hide{display:none;}
@media (min-width:440px){.ft-sm-hide{display:inline;}}
.ft-clamp2{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}
@media (prefers-reduced-motion:reduce){.ft-skel,.ft-spin,.ft-ping{animation:none!important;}}
`;
