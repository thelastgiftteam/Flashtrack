// Shared look for the customer-facing tracking pages (brand order list,
// parcel page, demo) and the homepage phone mockups.
// Colours are sampled from the FlashTrack logo: bolt yellow, flash red,
// black ground. Red + yellow also sit right next to India Post's own colours.
// Headlines use Archivo italic, heavy and wide, like the logo wordmark.

export const C = {
  ink:     '#121212',
  black:   '#000000',
  red:     '#DF1515',
  redDeep: '#C4050A',
  yellow:  '#FEC200',
  yellowDeep: '#E0AC00',
  cream:   '#FFF3C4',
  paper:   '#FFFFFF',
  mist:    '#F4F4F5',
  line:    '#E4E4E7',
  muted:   '#5C5C66',
  soft:    '#8E8E98',
  green:   '#16884F',
  wa:      '#1FA855',
};

export const FONT_HREF =
  'https://fonts.googleapis.com/css2?family=Archivo:ital,wdth,wght@0,62..125,400..900;1,62..125,400..900&family=Instrument+Sans:wght@400;500;600;700&display=swap';

export const DISPLAY = { fontFamily: "'Archivo',system-ui,sans-serif", fontWeight: 800, fontStyle: 'italic', fontStretch: '112%', letterSpacing: '-0.02em' };

// Statuses are only used by the parcel detail page now (cards show no status).
export const STATUS = {
  'Delivered':           { color: '#16884F', bg: '#E7F6EE', icon: '✅' },
  'Out for delivery':    { color: '#A16207', bg: '#FFF3C4', icon: '🛵' },
  'Held at post office': { color: '#A16207', bg: '#FFF3C4', icon: '🏤' },
  'In transit':          { color: '#121212', bg: '#EDEDEF', icon: '🚚' },
  'Returning to sender': { color: '#C4050A', bg: '#FDECEC', icon: '↩️' },
  'Booked':              { color: '#5C5C66', bg: '#EDEDEF', icon: '📦' },
};

export function statusOf(s) {
  const v = String(s || '').trim();
  if (!v || /^transit$/i.test(v)) return 'In transit';
  return v;
}

export function statusStyle(s) {
  return STATUS[statusOf(s)] || STATUS['In transit'];
}

// Page-level reset. Not used when the UI is embedded in the homepage.
export const GLOBAL_CSS = `
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}
body{background:${C.mist};color:${C.ink};font-family:'Instrument Sans',system-ui,sans-serif;min-height:100vh;-webkit-font-smoothing:antialiased;}
a{color:inherit;text-decoration:none;}
button,input{font-family:inherit;}
input::placeholder{color:${C.soft};}
a:focus-visible,button:focus-visible,input:focus-visible{outline:3px solid ${C.ink};outline-offset:2px;}
`;

// Classes and motion used by the tracking UI (safe to embed anywhere).
export const UI_CSS = `
.ft-display{font-family:'Archivo',system-ui,sans-serif;font-weight:800;font-style:italic;font-stretch:112%;letter-spacing:-0.02em;}
.ft-skel{background:linear-gradient(90deg,#EBEBEE 25%,#F7F7F8 50%,#EBEBEE 75%);background-size:200% 100%;animation:ftShimmer 1.4s infinite;border-radius:16px;}
@keyframes ftShimmer{0%{background-position:-200% 0;}100%{background-position:200% 0;}}
@keyframes ftSpin{to{transform:rotate(360deg);}}
@keyframes ftPing{75%,100%{transform:scale(2.2);opacity:0;}}
.ft-ui a:focus-visible,.ft-ui button:focus-visible,.ft-ui input:focus-visible{outline:3px solid ${C.ink};outline-offset:2px;}
.ft-sm-hide{display:none;}
@media (min-width:440px){.ft-sm-hide{display:inline;}}
.ft-clamp2{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}

/* Speed stripe across the top, drawn like the logo's streaks */
.ft-stripe{height:5px;transform-origin:left;animation:ftStripe .7s cubic-bezier(.2,.8,.2,1) both;
  background:linear-gradient(105deg,${C.red} 0 64%,${C.yellow} 64% 70%,${C.red} 70% 76%,${C.yellow} 76% 100%);}
@keyframes ftStripe{from{transform:scaleX(0);}to{transform:scaleX(1);}}

/* Cards arrive with a short forward lean, like they were thrown in */
@keyframes ftIn{from{opacity:0;transform:translateX(-18px) skewX(-6deg);}to{opacity:1;transform:none;}}
.ft-card{transition:transform .18s ease,box-shadow .18s ease;}
@media (hover:hover){.ft-card:hover{transform:translateY(-2px);box-shadow:0 14px 30px -18px rgba(0,0,0,.35);}}

/* Track button: press + a light sweep, like a flash going past */
.ft-track{position:relative;overflow:hidden;transition:transform .12s ease,background-color .15s;}
.ft-track:active{transform:scale(.95);}
.ft-track::after{content:'';position:absolute;top:0;bottom:0;left:-60%;width:40%;
  background:linear-gradient(105deg,transparent,rgba(255,255,255,.55),transparent);transform:skewX(-20deg);}
.ft-track.is-flash::after{animation:ftSweep .45s ease-out;}
@media (hover:hover){.ft-track:hover{background:${C.redDeep};}.ft-track:hover::after{animation:ftSweep .6s ease-out;}}
@keyframes ftSweep{from{left:-60%;}to{left:130%;}}

/* Indian scripts have no italic: keep translated headings upright */
html:not([lang="en"]) .ft-tr,.ft-ui[lang]:not([lang="en"]) .ft-tr{font-style:normal;letter-spacing:0;font-stretch:100%;}
.ft-ui[lang="en"] .ft-tr{font-style:italic;letter-spacing:-0.02em;font-stretch:112%;}

/* Typing hint in the search box */
.ft-caret{display:inline-block;width:2px;height:1.15em;margin-left:2px;background:${C.red};animation:ftBlink 1s steps(1) infinite;}
@keyframes ftBlink{50%{opacity:0;}}

/* India Post sheet */
@keyframes ftUp{from{transform:translateY(100%);}to{transform:translateY(0);}}
@keyframes ftFade{from{opacity:0;}to{opacity:1;}}
@keyframes ftPop{0%{transform:scale(.5);opacity:0;}60%{transform:scale(1.15);opacity:1;}100%{transform:scale(1);}}
.ft-pop{display:inline-block;animation:ftPop .35s cubic-bezier(.2,.9,.3,1.3) both;}
.ft-chip{transition:background-color .2s,border-color .2s,color .2s;}
.ft-go{transition:transform .12s ease,background-color .15s;}
.ft-go:active{transform:scale(.97);}
@media (hover:hover){.ft-go:hover{background:#2A2A2E;}}

@media (prefers-reduced-motion:reduce){
  .ft-skel,.ft-spin,.ft-ping,.ft-stripe,.ft-anim,.ft-pop,.ft-caret,.ft-track::after{animation:none!important;}
  .ft-card,.ft-track,.ft-go{transition:none!important;}
}
`;

// Full stylesheet for standalone tracking pages.
export const BASE_CSS = GLOBAL_CSS + UI_CSS;
