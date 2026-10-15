import { useState, useEffect } from 'react';
import Head from 'next/head';
import OrderListView from '../components/OrderListView';
import { demoCards } from '../lib/demoData';
import { parseGrid, parseCsv, normalizeRows } from '../lib/shipmentParse';
import { shrinkImage } from '../components/console/ui';

// FlashTrack homepage. Bright, postal-themed. Colours come from the FlashTrack
// logo (bolt yellow, flash red, black), which sit close to India Post's own.
// Styling: Tailwind utility classes + a small <style> block for the postal pieces
// (perforated stamp, postmark, shipping label). Tailwind's global reset is off,
// so the page sets its own reset below.

const WHATSAPP = 'https://wa.me/917902411421';

export default function Home() {
  return (
    <div className="ft-page">
      <Head>
        <title>FlashTrack · Branded parcel tracking for India Post shipments</title>
        <meta name="description" content="One link where your customers track their India Post parcels. They type their name and tap Track. No app, no login." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#FFFFFF" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Archivo:ital,wdth,wght@0,62..125,400..900;1,62..125,400..900&family=Instrument+Sans:wght@400;500;600;700&family=Libre+Barcode+128&family=Caveat:wght@600&display=swap" rel="stylesheet" />
      </Head>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <Nav />
      <main>
        <Hero />
        <TryIt />
        <Journey />
        <Problem />
        <HowItWorks />
        <Tour />
        <Compare />
        <Postcard />
        <Pricing />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}

// ─── Shared bits ───────────────────────────────────────────────────

function Wrap({ children, className = '' }) {
  return <div className={`mx-auto w-full max-w-[1180px] px-5 md:px-8 ${className}`}>{children}</div>;
}

function H2({ children, className = '' }) {
  return <h2 className={`ft-display text-[32px] leading-[1.08] md:text-[44px] ${className}`}>{children}</h2>;
}

function WhatsAppButton({ children = 'Start free on WhatsApp', dark = false, className = '' }) {
  return (
    <a href={WHATSAPP} target="_blank" rel="noreferrer"
      className={`ft-btn inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-[15px] font-semibold ${dark ? 'bg-[#121212] text-white hover:bg-[#000000]' : 'bg-[#DF1515] text-white hover:bg-[#C4050A]'} ${className}`}>
      <WaIcon /> {children}
    </a>
  );
}

function SignupButton({ children = 'Start free · 14 days', dark = false, className = '' }) {
  return (
    <a href="/signup"
      className={`ft-btn inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-[15px] font-semibold ${dark ? 'bg-[#121212] text-white hover:bg-[#000000]' : 'bg-[#DF1515] text-white hover:bg-[#C4050A]'} ${className}`}>
      {children}
    </a>
  );
}

function DemoButton({ className = '' }) {
  return (
    <a href="/demo"
      className={`ft-btn inline-flex items-center justify-center rounded-full border-2 border-[#121212] px-6 py-3 text-[15px] font-semibold text-[#121212] hover:bg-[#121212] hover:text-white ${className}`}>
      See the demo
    </a>
  );
}

function WaIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3Z"/>
    </svg>
  );
}

function Check({ ok = true }) {
  return ok
    ? <span aria-label="Yes" className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#16884F] text-[15px] font-bold text-white">✓</span>
    : <span aria-label="No" className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#EBEBEE] text-[15px] font-bold text-[#8E8E98]">✕</span>;
}

// Perforated postage stamp
function Stamp({ className = '', children }) {
  return (
    <div className={`ft-stamp ${className}`}>
      <div className="ft-stamp-face">{children}</div>
    </div>
  );
}

// Circular postmark with wavy cancellation lines
function Postmark({ className = '', top = 'SPEED POST', bottom = 'FLASHTRACK', mid = 'KOCHI' }) {
  return (
    <svg className={`ft-postmark ${className}`} viewBox="0 0 220 120" aria-hidden="true">
      <defs>
        <path id="pm-top" d="M 20 60 A 40 40 0 0 1 100 60" />
        <path id="pm-bot" d="M 16 60 A 44 44 0 0 0 104 60" />
      </defs>
      <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" strokeWidth="3" />
      <circle cx="60" cy="60" r="36" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <text fontSize="11" fontWeight="700" letterSpacing="2" fill="currentColor"><textPath href="#pm-top" startOffset="50%" textAnchor="middle">{top}</textPath></text>
      <text fontSize="11" fontWeight="700" letterSpacing="2" fill="currentColor"><textPath href="#pm-bot" startOffset="50%" textAnchor="middle" dominantBaseline="hanging">{bottom}</textPath></text>
      <text x="60" y="64" fontSize="13" fontWeight="800" textAnchor="middle" fill="currentColor">{mid}</text>
      {[44, 56, 68, 80].map(y => (
        <path key={y} d={`M118 ${y} q 12 -8 24 0 t 24 0 t 24 0 t 24 0`} fill="none" stroke="currentColor" strokeWidth="3" />
      ))}
    </svg>
  );
}

// ─── Phone mockups (mirror the real product UI) ────────────────────

function Phone({ children, className = '' }) {
  return (
    <div className={`ft-phone ${className}`}>
      <div className="ft-phone-notch" />
      <div className="ft-phone-screen">{children}</div>
    </div>
  );
}

// The phone screens render the real tracking page component with sample
// data, scaled down. What visitors see here is exactly what customers get.
const DEMO_BAR = { mode: 'button', text: 'Questions? Chat with us on WhatsApp', link: WHATSAPP, active: true };

function LiveScreen({ query = '' }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { setOrders(demoCards()); setLoading(false); }, []);
  return (
    <div className="ft-embed">
      <div className="ft-statusbar"><span>9:41</span><span aria-hidden="true">▂▄▆ ▮</span></div>
      <div className="ft-embed-scroll">
        <OrderListView embedded brandName="Your Brand" orders={orders} loading={loading}
          bottomBar={DEMO_BAR} initialQuery={query} />
      </div>
    </div>
  );
}

// ─── Sections ──────────────────────────────────────────────────────

function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#E4E4E7] bg-white md:bg-white/90 md:backdrop-blur">
      <Wrap className="flex h-16 items-center justify-between gap-4">
        <a href="/" aria-label="FlashTrack home" className="ft-logo flex items-center gap-2">
          <img src="/brand/flashtrack-mark.png" alt="" width="46" height="31" className="ft-logo-mark block h-[31px] w-auto" />
          <img src="/brand/flashtrack-wordmark-dark.png" alt="FlashTrack" width="124" height="19" className="block h-[19px] w-auto" />
        </a>
        <nav className="hidden items-center gap-8 text-[15px] font-medium text-[#3F3F46] md:flex">
          <a href="#how" className="hover:text-[#DF1515]">How it works</a>
          <a href="/demo" className="hover:text-[#DF1515]">Demo</a>
          <a href="#pricing" className="hover:text-[#DF1515]">Pricing</a>
          <a href="#faq" className="hover:text-[#DF1515]">FAQ</a>
        </nav>
        <div className="flex items-center gap-4">
          <a href="/login" className="text-[14px] font-semibold text-[#3F3F46] hover:text-[#DF1515]">Log in</a>
          <a href="/signup"
            className="ft-btn rounded-full bg-[#121212] px-4 py-2 text-[14px] font-semibold text-white hover:bg-[#000000] md:px-5">
            Start free
          </a>
        </div>
      </Wrap>
    </header>
  );
}

function Hero() {
  return (
    <section className="overflow-hidden bg-white">
      <Wrap className="grid items-center gap-14 pb-20 pt-12 md:pb-24 md:pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
        <div>
          <div className="ft-h-in inline-flex items-center gap-2 rounded-full bg-[#FFF3C4] px-3.5 py-1.5 text-[13px] font-semibold text-[#7A5600]" style={{ animationDelay: '.05s' }}>
            <span className="h-2 w-2 rounded-full bg-[#DF1515]" />For brands that ship with India Post
          </div>
          <h1 className="ft-display ft-h-in mt-6 text-[42px] leading-[1.0] text-[#121212] sm:text-[54px] lg:text-[66px]" style={{ animationDelay: '.12s' }}>
            One link where your customers track their parcels.
          </h1>
          <p className="ft-h-in mt-6 max-w-[34rem] text-[18px] leading-[1.6] text-[#3F3F46]" style={{ animationDelay: '.22s' }}>
            Send one link to all your customers. They type their name, tap Track, and see where
            their parcel is. No more “where is my order?” messages.
          </p>
          <div className="ft-h-in mt-8 flex flex-col gap-3 sm:flex-row" style={{ animationDelay: '.3s' }}>
            <SignupButton />
            <DemoButton />
          </div>
          <a href="#try" className="ft-h-in mt-4 inline-block text-[15px] font-semibold text-[#DF1515] underline decoration-2 underline-offset-4" style={{ animationDelay: '.34s' }}>
            Or see it with your own India Post file ↓
          </a>
          <div className="ft-h-in mt-8 flex flex-wrap gap-x-6 gap-y-2 text-[14px] font-medium text-[#3F3F46]" style={{ animationDelay: '.38s' }}>
            <span>✓ ₹750 a month</span>
            <span>✓ 14 days free</span>
            <span>✓ No app needed</span>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[460px]">
          <div className="ft-hero-block absolute inset-x-6 bottom-14 top-14 rounded-[36px] bg-[#FEC200] md:inset-x-2 lg:bottom-6" />
          <Streaks className="absolute -left-10 top-0 z-0 w-[78%] sm:-left-16" />
          <Streaks className="absolute -right-8 bottom-24 z-0 w-[48%] rotate-180 sm:-right-14 lg:bottom-16" late />
          <div className="ft-hand ft-hint absolute -right-24 top-2 z-20 hidden w-[170px] rotate-[5deg] text-[25px] leading-[1.05] text-[#DF1515] xl:block">
            this is the real page, try it
            <svg width="70" height="50" viewBox="0 0 70 50" className="mt-1 block" aria-hidden="true"><path d="M60 4C46 10 30 24 16 44m0 0 1-12m-1 12 11-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          <Phone className="ft-rise relative z-10 mx-auto mt-4"><LiveScreen /></Phone>
          <Postmark className="ft-postmark-anim absolute -right-1 bottom-6 z-20 hidden w-[120px] sm:block text-[#DF1515] sm:-right-6 sm:w-[150px] md:-right-12 md:w-[170px] lg:-bottom-14" />
          <p className="ft-hand mt-5 text-center text-[24px] text-[#DF1515] xl:hidden">this is the real page, try it</p>
        </div>
      </Wrap>
    </section>
  );
}

// ─── Try it with your own file ─────────────────────────────────────
// The visitor drops their India Post Excel and sees their own page at once.
// The file is read in the browser; nothing is sent anywhere until they sign up.
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const dayLabel = ymd => `${Number(ymd.slice(8, 10))} ${MON[Number(ymd.slice(5, 7)) - 1]}`;

function TryIt() {
  const [rows, setRows] = useState(null);
  const [brand, setBrand] = useState('');
  const [logo, setLogo] = useState('');
  const [problem, setProblem] = useState('');
  const [over, setOver] = useState(false);
  const [busy, setBusy] = useState(false);

  async function read(file) {
    setProblem(''); setRows(null);
    if (!file) return;
    const name = file.name.toLowerCase();
    setBusy(true);
    try {
      let grid;
      if (name.endsWith('.csv') || name.endsWith('.txt')) grid = parseCsv(await file.text());
      else if (name.endsWith('.xlsx')) { const { default: readXlsxFile } = await import('read-excel-file'); grid = await readXlsxFile(file); }
      else if (name.endsWith('.xls')) { setProblem('This is an old Excel file (.xls). Open it and save it as .xlsx, then try again.'); return; }
      else { setProblem('Choose an Excel (.xlsx) or CSV file.'); return; }
      const out = parseGrid(grid);
      if (out.error) { setProblem(out.error); return; }
      const today = new Date(Date.now() + 5.5 * 3600 * 1000).toISOString().slice(0, 10);
      const ok = normalizeRows(out.rows, today).ok;
      if (!ok.length) { setProblem('We couldn’t find any tracking numbers in that file.'); return; }
      setRows(ok);
    } catch {
      setProblem('We couldn’t read that file. If it opens in Excel, save it as .xlsx and try again.');
    } finally { setBusy(false); }
  }

  async function pickLogo(file) {
    if (!file) return;
    try { setLogo(await shrinkImage(file, 256, 'image/png')); } catch { setProblem('Could not open that image. Try a PNG or JPG.'); }
  }

  function start() {
    try { sessionStorage.setItem('ft_try', JSON.stringify({ brandName: brand.trim(), logo, rows })); } catch { /* still sign up */ }
    window.location.href = '/signup?try=1';
  }

  const orders = (rows || []).slice().sort((a, b) => (a.shippedOn < b.shippedOn ? 1 : -1)).map(r => ({
    name: r.name || '—', orderId: r.orderRef, pincode: r.pincode, trackingId: r.trackingId,
    trackingLink: '', shippedOn: dayLabel(r.shippedOn), isNew: false,
  }));

  return (
    <section id="try" className="border-t border-[#E4E4E7] bg-[#FFF8DB]">
      <Wrap className="grid items-center gap-10 py-16 md:py-20 lg:grid-cols-[1fr_auto] lg:gap-16">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#121212] px-3.5 py-1.5 text-[13px] font-semibold text-white">Try it now · 10 seconds</div>
          <H2 className="mt-5 max-w-[34rem]">See your own tracking page with your real parcels.</H2>
          {!rows ? (
            <>
              <p className="mt-4 max-w-[32rem] text-[17px] leading-[1.6] text-[#3F3F46]">
                Drop the Excel file you download from India Post. Your customers’ parcels appear on the phone straight away.
              </p>
              <label
                onDragOver={e => { e.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)}
                onDrop={e => { e.preventDefault(); setOver(false); read(e.dataTransfer.files[0]); }}
                className={`mt-7 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-colors ${over ? 'border-[#DF1515] bg-white' : 'border-[#121212]/40 bg-white/70 hover:border-[#121212]'}`}>
                <input type="file" accept=".xlsx,.csv,.xls,.txt" className="sr-only" onChange={e => { read(e.target.files[0]); e.target.value = ''; }} />
                <span className="text-[36px]" aria-hidden="true">{busy ? '⏳' : '📄'}</span>
                <span className="mt-2 text-[17px] font-bold text-[#121212]">{busy ? 'Reading your file…' : 'Drop your India Post Excel here, or tap to choose'}</span>
                <span className="mt-1 text-[14px] text-[#5C5C66]">.xlsx or .csv</span>
              </label>
              {problem && <p className="mt-4 rounded-xl bg-[#FDECEC] px-4 py-3 text-[14px] text-[#8E1A20]">⚠ {problem}</p>}
              <p className="mt-4 text-[14px] text-[#5C5C66]">🔒 Your file stays on your device. Nothing is uploaded unless you sign up.</p>
            </>
          ) : (
            <>
              <p className="mt-4 max-w-[32rem] text-[17px] leading-[1.6] text-[#3F3F46]">
                <b className="text-[#121212]">Found {rows.length} parcel{rows.length > 1 ? 's' : ''}.</b> This is the page your customers would get. Try searching a name or pincode on the phone.
              </p>
              <label className="mt-6 block max-w-[24rem]">
                <span className="text-[14px] font-semibold text-[#3F3F46]">Your brand name</span>
                <input value={brand} onChange={e => setBrand(e.target.value)} maxLength={80} placeholder="e.g. WT Frames"
                  className="mt-1.5 block w-full rounded-xl border-2 border-[#121212] bg-white px-4 py-3 text-[16px] outline-none focus:border-[#DF1515]" />
              </label>
              <div className="mt-4">
                <span className="text-[14px] font-semibold text-[#3F3F46]">Your logo <span className="font-normal text-[#5C5C66]">(optional)</span></span>
                <div className="mt-1.5 flex items-center gap-3">
                  {logo && <img src={logo} alt="Your logo" className="h-12 w-12 rounded-xl border border-[#E4E4E7] bg-white object-contain" />}
                  <label className="ft-btn cursor-pointer rounded-full border-2 border-[#121212] bg-white px-4 py-2 text-[14px] font-semibold text-[#121212] hover:bg-[#121212] hover:text-white">
                    <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={e => { pickLogo(e.target.files[0]); e.target.value = ''; }} />
                    {logo ? 'Change logo' : 'Add your logo'}
                  </label>
                  {logo && <button onClick={() => setLogo('')} className="text-[14px] font-semibold text-[#5C5C66] underline">Remove</button>}
                </div>
              </div>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button onClick={start} className="ft-btn rounded-full bg-[#DF1515] px-6 py-3.5 text-[15px] font-semibold text-white hover:bg-[#C4050A]">
                  Make this my page · 14 days free
                </button>
                <button onClick={() => { setRows(null); setProblem(''); }} className="ft-btn rounded-full border-2 border-[#121212] px-6 py-3 text-[15px] font-semibold text-[#121212] hover:bg-[#121212] hover:text-white">
                  Try another file
                </button>
              </div>
              <p className="mt-4 text-[14px] text-[#5C5C66]">After you sign up, we’ll ask before adding these {rows.length} parcels to your page. No card needed.</p>
            </>
          )}
        </div>
        <div className="mx-auto">
          <Phone>
            {rows ? (
              <div className="ft-embed">
                <div className="ft-statusbar"><span>9:41</span><span aria-hidden="true">▂▄▆ ▮</span></div>
                <div className="ft-embed-scroll">
                  <OrderListView embedded brandName={brand.trim() || 'Your Brand'} logo={logo} orders={orders} loading={false} bottomBar={DEMO_BAR} />
                </div>
              </div>
            ) : <LiveScreen />}
          </Phone>
        </div>
      </Wrap>
    </section>
  );
}

// Speed streaks, drawn in the style of the logo
function Streaks({ className = '', late = false }) {
  return (
    <svg className={`ft-streaks ${late ? 'is-late' : ''} ${className}`} viewBox="0 0 400 300" aria-hidden="true">
      <polygon className="s1" points="6,288 396,58 330,128" fill="#DF1515" />
      <polygon className="s2" points="70,300 380,150 344,196" fill="#C4050A" />
      <polygon className="s3" points="0,190 300,20 262,66" fill="#FEC200" />
    </svg>
  );
}

const FLOW = [
  ['🔍', 'Type your name', 'Or your pincode, or tracking number.'],
  ['⚡', 'Tap Track parcel', 'No long number to copy or remember.'],
  ['📮', 'See where your parcel is', 'Every India Post update, from booking to delivery.'],
];

function Journey() {
  return (
    <section className="border-y border-[#E4E4E7] bg-[#F4F4F5]">
      <Wrap className="py-10">
        <ol className="grid gap-6 md:grid-cols-3 md:gap-0">
          {FLOW.map(([icon, t, d], i) => (
            <li key={t} className="relative flex items-start gap-4 md:pr-10">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-[22px] ring-1 ring-[#D9D9DE]">{icon}</span>
              <div>
                <div className="text-[13px] font-bold text-[#DF1515]">Step {i + 1}</div>
                <div className="ft-display text-[19px] leading-tight text-[#121212]">{t}</div>
                <p className="mt-1 text-[15px] text-[#5C5C66]">{d}</p>
              </div>
              {i < FLOW.length - 1 && <span aria-hidden="true" className="absolute right-4 top-2 hidden text-[30px] font-bold leading-none text-[#DF1515] md:block">›</span>}
            </li>
          ))}
        </ol>
      </Wrap>
    </section>
  );
}

const CHATS = [
  ['Asha', 'Where is my order? 😟', '2 min', 3],
  ['Vishnu K', 'Parcel evide ethi?', '6 min', 2],
  ['Meera', 'Tracking link kittiyilla', '11 min', 1],
  ['Arjun', 'Order status please', '18 min', 2],
  ['Divya R', 'It says item on hold. What to do?', '25 min', 4],
];

function Problem() {
  return (
    <section className="bg-white">
      <Wrap className="grid items-center gap-12 py-20 md:py-28 lg:grid-cols-2 lg:gap-16">
        <div>
          <H2 className="text-[#121212]">The same question, all day, on WhatsApp.</H2>
          <p className="mt-5 max-w-[32rem] text-[17px] leading-[1.65] text-[#3F3F46]">
            Once a customer pays, they wait. They don’t know where their parcel is, so they
            message you. Again and again.
          </p>
          <ul className="mt-8 space-y-6">
            {[
              ['💬', 'Your team replies all day', 'Time that should go into selling goes into answering “where is my order?”.'],
              ['🔢', 'Tracking numbers get lost', 'Customers can’t find the long number you sent them, so they ask you again.'],
              ['🔗', 'Your brand disappears after the sale', 'Courier pages don’t show your name. Your page does.'],
            ].map(([icon, t, d]) => (
              <li key={t} className="flex gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FFF3C4] text-[20px]">{icon}</span>
                <div>
                  <h3 className="text-[17px] font-bold text-[#121212]">{t}</h3>
                  <p className="mt-1 text-[15.5px] leading-[1.6] text-[#5C5C66]">{d}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="mx-auto w-full max-w-[440px] overflow-hidden rounded-[28px] border border-[#E4E4E7] bg-white shadow-[0_24px_60px_-20px_rgba(0,0,0,0.25)]">
          <div className="flex items-center justify-between bg-[#075E54] px-5 py-4 text-white">
            <div className="text-[16px] font-semibold">Chats</div>
            <div className="rounded-full bg-[#25D366] px-2.5 py-0.5 text-[12px] font-bold text-[#073B33]">12 unread</div>
          </div>
          <ul>
            {CHATS.map(([n, m, t, u]) => (
              <li key={n} className="flex items-center gap-3 border-b border-[#EFEFF1] px-5 py-3.5 last:border-b-0">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#E4E4E7] text-[14px] font-bold text-[#3F3F46]">
                  {n[0]}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="truncate text-[15px] font-semibold text-[#111B21]">{n}</span>
                    <span className="shrink-0 text-[12px] font-medium text-[#25D366]">{t}</span>
                  </div>
                  <div className="mt-0.5 flex items-center justify-between gap-2">
                    <span className="truncate text-[14px] text-[#54656F]">{m}</span>
                    <span className="flex h-5 min-w-[20px] shrink-0 items-center justify-center rounded-full bg-[#25D366] px-1.5 text-[11px] font-bold text-white">{u}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </Wrap>
    </section>
  );
}

const STEPS = [
  ['Sign up', 'Your tracking page is ready in 2 minutes, with your brand name and your WhatsApp button.'],
  ['Add the day’s parcels', 'Upload India Post’s Excel file, take a photo of the receipt, or type them in. Takes a minute.'],
  ['Share the link', 'Add the link to your order message. Customers find their parcel by name, pincode or order number.'],
];

function HowItWorks() {
  return (
    <section id="how" className="bg-[#121212] text-white">
      <Wrap className="py-20 md:py-28">
        <H2 className="max-w-[40rem]">Ready in 2 minutes. Nothing to install.</H2>
        <ol className="relative mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
          <span className="ft-route absolute left-[22px] top-[22px] hidden h-0.5 w-[calc(100%-44px)] md:block" aria-hidden="true" />
          {STEPS.map(([t, d], i) => (
            <li key={t} className="relative flex gap-5 md:block">
              <span className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#FEC200] text-[18px] font-extrabold text-[#121212]">
                {i + 1}
              </span>
              <div className="md:mt-6">
                <h3 className="text-[20px] font-bold">{t}</h3>
                <p className="mt-2 max-w-[22rem] text-[16px] leading-[1.6] text-[#C9C9D1]">{d}</p>
              </div>
            </li>
          ))}
        </ol>
      </Wrap>
    </section>
  );
}

const FEATURES_L = [
  ['Search by name', 'No need to remember a long tracking number.'],
  ['All orders, one link', 'One page for every order you ship.'],
  ['9 languages', 'Hindi, Bengali, Marathi, Gujarati, Tamil, Telugu, Kannada, Malayalam and English.'],
];
const FEATURES_R = [
  ['Track in one tap', 'Track parcel shows every India Post update for that order.'],
  ['Copy in one tap', 'Tap the tracking number to copy it.'],
  ['Your WhatsApp button', 'Customers reach you, not a courier helpline.'],
];

function Feature({ t, d, align = 'left' }) {
  return (
    <div className={align === 'right' ? 'lg:text-right' : ''}>
      <h3 className="text-[17px] font-bold text-[#121212]">{t}</h3>
      <p className="mt-1 text-[15px] leading-[1.55] text-[#5C5C66]">{d}</p>
    </div>
  );
}

function Tour() {
  return (
    <section className="bg-[#F4F4F5]">
      <Wrap className="py-20 md:py-28">
        <div className="max-w-[40rem]">
          <H2 className="text-[#121212]">What your customer sees when they tap the link.</H2>
          <p className="mt-5 text-[17px] leading-[1.65] text-[#3F3F46]">
            A simple page with your brand’s name. Made for phones.
          </p>
        </div>

        <div className="mt-14 grid items-center gap-10 lg:grid-cols-[1fr_auto_1fr] lg:gap-12">
          <div className="order-2 grid gap-8 sm:grid-cols-2 lg:order-1 lg:grid-cols-1">
            {FEATURES_L.map(([t, d]) => <Feature key={t} t={t} d={d} align="right" />)}
          </div>
          <div className="order-1 flex justify-center gap-5 lg:order-2">
            <Phone className="hidden sm:block"><LiveScreen /></Phone>
            <Phone className="sm:mt-12"><LiveScreen query="Rahul" /></Phone>
          </div>
          <div className="order-3 grid gap-8 sm:grid-cols-2 lg:grid-cols-1">
            {FEATURES_R.map(([t, d]) => <Feature key={t} t={t} d={d} />)}
          </div>
        </div>

        <div className="mt-14 flex justify-center">
          <DemoButton />
        </div>
      </Wrap>
    </section>
  );
}

const ROWS = [
  ['Your brand name on the page', false],
  ['One link for all your orders', false],
  ['Customers search by their name', false],
  ['In 9 Indian languages', false],
  ['Your WhatsApp button on the page', false],
];

function Compare() {
  return (
    <section className="bg-white">
      <Wrap className="py-20 md:py-28">
        <H2 className="max-w-[40rem] text-[#121212]">Other tracking sites vs your FlashTrack page.</H2>
        <div className="mt-12 overflow-hidden rounded-[24px] border border-[#E4E4E7]">
          <div className="grid grid-cols-[1fr_84px_84px] items-center bg-[#F4F4F5] px-5 py-4 text-[13px] font-bold text-[#3F3F46] sm:grid-cols-[1fr_160px_160px] sm:px-8 sm:text-[14px]">
            <span>Feature</span>
            <span className="text-center">Other sites</span>
            <span className="text-center text-[#DF1515]">FlashTrack</span>
          </div>
          {ROWS.map(([r, them]) => (
            <div key={r} className="grid grid-cols-[1fr_84px_84px] items-center border-t border-[#E4E4E7] px-5 py-4 sm:grid-cols-[1fr_160px_160px] sm:px-8">
              <span className="pr-3 text-[15px] font-medium text-[#121212] sm:text-[16px]">{r}</span>
              <span className="flex justify-center"><Check ok={them} /></span>
              <span className="flex justify-center"><Check /></span>
            </div>
          ))}
        </div>
      </Wrap>
    </section>
  );
}

function Postcard() {
  return (
    <section className="bg-[#F4F4F5]">
      <Wrap className="py-20 md:py-28">
        <div className="ft-postcard relative mx-auto grid max-w-[980px] overflow-hidden rounded-[6px] bg-white md:grid-cols-[1.4fr_1fr]">
          <div className="p-7 md:border-r md:border-dashed md:border-[#D4D4D8] md:p-12">
            <p className="ft-display text-[22px] leading-[1.3] text-[#121212] md:text-[26px]">
              “We run our own online brand and ship with India Post every day.
              We were answering ‘where is my order?’ all day long.
              FlashTrack started as our own fix.”
            </p>
            <div className="ft-hand mt-6 text-[34px] leading-none text-[#DF1515]">Stebin</div>
            <div className="mt-1 text-[14px] text-[#5C5C66]">Founder, FlashTrack</div>
          </div>
          <div className="relative border-t border-dashed border-[#D4D4D8] p-7 md:border-t-0 md:p-12">
            <Stamp className="ml-auto w-fit rotate-[4deg]">
              <div className="ft-display text-[12px] leading-none text-[#121212]">KERALA</div>
              <div className="mt-1 text-[22px]">🌴</div>
              <div className="ft-display mt-1 text-[13px] leading-none text-[#DF1515]">₹5</div>
            </Stamp>
            <Postmark className="absolute right-20 top-8 w-[150px] text-[#121212]/70" top="KOCHI" bottom="KERALA" mid="2026" />
            <div className="mt-10 space-y-4 text-[16px] text-[#121212] md:mt-16">
              <div className="border-b border-[#D4D4D8] pb-2"><span className="text-[#8E8E98]">To </span>Every online brand</div>
              <div className="border-b border-[#D4D4D8] pb-2">shipping with India Post</div>
              <div className="border-b border-[#D4D4D8] pb-2">Anywhere in India</div>
            </div>
          </div>
        </div>
      </Wrap>
    </section>
  );
}

const CONTENTS = [
  'Your own tracking page',
  'Unlimited orders',
  'Add parcels by Excel, photo or typing',
  'Search by name, pincode or order number',
  '9 languages',
  'Your WhatsApp button on the page',
  '14 days free, no card needed',
];

function Pricing() {
  return (
    <section id="pricing" className="bg-white">
      <Wrap className="grid items-center gap-12 py-20 md:py-28 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
        <div>
          <H2 className="text-[#121212]">One simple plan. Everything included.</H2>
          <p className="mt-5 max-w-[30rem] text-[17px] leading-[1.65] text-[#3F3F46]">
            No setup fee. Sign up and your page is ready in 2 minutes. Try it free for 14 days.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <SignupButton />
            <DemoButton />
          </div>
        </div>

        <div className="ft-label mx-auto w-full max-w-[480px] rotate-[-1.2deg] bg-white">
          <div className="flex items-stretch border-b-[3px] border-[#121212]">
            <div className="flex-1 p-5">
              <div className="text-[12px] font-bold text-[#5C5C66]">Service</div>
              <div className="ft-display mt-0.5 text-[22px] text-[#121212]">FlashTrack Monthly</div>
            </div>
            <div className="flex w-[92px] items-center justify-center border-l-[3px] border-[#121212] bg-[#DF1515] text-center font-extrabold leading-tight text-white">
              <span className="ft-display text-[13px]">SPEED<br />POST</span>
            </div>
          </div>
          <div className="grid grid-cols-2 border-b-[3px] border-[#121212] text-[14px]">
            <div className="border-r-[3px] border-[#121212] p-4">
              <div className="text-[12px] font-bold text-[#5C5C66]">From</div>
              <div className="mt-0.5 font-semibold text-[#121212]">FlashTrack, Kochi</div>
            </div>
            <div className="p-4">
              <div className="text-[12px] font-bold text-[#5C5C66]">To</div>
              <div className="mt-0.5 font-semibold text-[#121212]">Your brand</div>
            </div>
          </div>
          <div className="border-b-[3px] border-[#121212] p-5">
            <div className="text-[12px] font-bold text-[#5C5C66]">Contents</div>
            <ul className="mt-3 space-y-2">
              {CONTENTS.map(c => (
                <li key={c} className="flex gap-3 text-[15px] text-[#121212]">
                  <span className="font-bold text-[#16884F]">✓</span>{c}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex items-end justify-between gap-4 p-5">
            <div>
              <div className="text-[12px] font-bold text-[#5C5C66]">Postage</div>
              <div className="flex items-baseline gap-1.5">
                <span className="ft-display text-[48px] leading-none text-[#121212]">₹750</span>
                <span className="text-[15px] text-[#5C5C66]">/ month</span>
              </div>
            </div>
            <div className="ft-barcode text-[44px] leading-none text-[#121212]" aria-hidden="true">FT750IN</div>
          </div>
        </div>
      </Wrap>
    </section>
  );
}

const FAQS = [
  ['Do customers need an app or a login?', 'No. They open the link in any browser, type their name and tap Track parcel.'],
  ['What do I need to do every day?', 'Add the day’s parcels: upload India Post’s Excel file, take a photo of the receipt, or type them in. It takes a minute.'],
  ['Which couriers do you support?', 'India Post Speed Post. Using another courier? Message us and we’ll tell you what’s possible.'],
  ['What customer details are shown on the page?', 'Only name, pincode and order number. No phone numbers. No addresses.'],
  ['Which languages does the page support?', 'English, Hindi, Bengali, Marathi, Gujarati, Tamil, Telugu, Kannada and Malayalam. The page picks the customer’s phone language, and they can change it at the top.'],
  ['How long does setup take?', 'About 2 minutes. Sign up, add your first parcels, and share the link.'],
  ['Can I put my own WhatsApp number on the page?', 'Yes. Every page has a button that opens a chat with you.'],
  ['Can I see it before I pay?', 'Yes. Every new account gets 14 days free, no card needed. You can also drop your India Post file on this page to see your own page first.'],
];

function Faq() {
  return (
    <section id="faq" className="bg-[#F4F4F5]">
      <Wrap className="grid gap-10 py-20 md:py-28 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div>
          <H2 className="text-[#121212]">Common questions.</H2>
          <p className="mt-5 max-w-[24rem] text-[17px] leading-[1.65] text-[#3F3F46]">
            Can’t find your answer? Ask us on WhatsApp. A real person replies.
          </p>
          <WhatsAppButton className="mt-6">Ask on WhatsApp</WhatsAppButton>
        </div>
        <div className="divide-y divide-[#D9D9DE] border-y border-[#D9D9DE]">
          {FAQS.map(([q, a]) => (
            <details key={q} className="ft-faq group py-5">
              <summary className="flex items-start justify-between gap-6 text-[17px] font-semibold text-[#121212]">
                {q}
                <span className="ft-plus mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-[18px] text-[#DF1515] ring-1 ring-[#D9D9DE]">+</span>
              </summary>
              <p className="mt-3 max-w-[40rem] pr-12 text-[16px] leading-[1.65] text-[#5C5C66]">
                {a}{q.startsWith('Can I see') && <> <a href="/demo" className="font-semibold text-[#DF1515] underline underline-offset-4">Open the demo</a></>}
              </p>
            </details>
          ))}
        </div>
      </Wrap>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="relative overflow-hidden bg-[#FEC200]">
      <Postmark className="absolute -right-10 -top-6 hidden w-[320px] text-[#121212]/15 md:block" />
      <Wrap className="relative py-20 md:py-24">
        <h2 className="ft-display max-w-[44rem] text-[36px] leading-[1.05] text-[#121212] md:text-[56px]">
          Give your customers one link to track every order.
        </h2>
        <p className="mt-5 max-w-[34rem] text-[18px] leading-[1.6] text-[#3B3000]">
          ₹750 a month. 14 days free. Fewer “where is my order?” messages.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <SignupButton dark />
          <DemoButton className="bg-transparent" />
        </div>
      </Wrap>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-black text-[#BDBDC4]">
      <Wrap className="flex flex-col gap-8 py-12 text-[14px] md:flex-row md:items-center md:justify-between">
        <img src="/brand/flashtrack-logo.png" alt="FlashTrack" width="160" height="131" className="block h-auto w-[140px]" />
        <nav className="flex flex-wrap gap-x-6 gap-y-2 font-medium">
          <a href="#how" className="hover:text-[#FEC200]">How it works</a>
          <a href="/demo" className="hover:text-[#FEC200]">Demo</a>
          <a href="#pricing" className="hover:text-[#FEC200]">Pricing</a>
          <a href="#faq" className="hover:text-[#FEC200]">FAQ</a>
          <a href={WHATSAPP} target="_blank" rel="noreferrer" className="hover:text-[#FEC200]">WhatsApp</a>
        </nav>
        <div>Made in Kochi, Kerala. © {new Date().getFullYear()} FlashTrack</div>
      </Wrap>
    </footer>
  );
}

// ─── Page CSS (postal pieces, reset, accessibility) ─────────────────

const CSS = `
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box;border-width:0;border-style:solid;border-color:#E4E4E7;}
html{scroll-behavior:smooth;scroll-padding-top:72px;}
html,body{overflow-x:clip;}
body{background:#fff;color:#121212;font-family:'Instrument Sans',system-ui,sans-serif;-webkit-font-smoothing:antialiased;-webkit-tap-highlight-color:transparent;-webkit-text-size-adjust:100%;}
a{text-decoration:none;color:inherit;}
ul,ol{list-style:none;}
.ft-display{font-family:'Archivo',system-ui,sans-serif;font-weight:800;font-style:italic;font-stretch:112%;letter-spacing:-0.02em;}
.ft-hand{font-family:'Caveat',cursive;font-weight:600;}
.ft-barcode{font-family:'Libre Barcode 128',monospace;font-weight:400;}
.ft-btn{transition:background-color .15s,color .15s,transform .12s;}
.ft-btn:active{transform:scale(.97);}
a:focus-visible,summary:focus-visible{outline:3px solid #FEC200;outline-offset:3px;border-radius:12px;}

/* Phone mockup */
.ft-phone{width:250px;height:520px;border-radius:42px;background:#121212;padding:9px;position:relative;
  box-shadow:0 30px 60px -20px rgba(0,0,0,.45),inset 0 0 0 2px #2A2A2E;flex-shrink:0;}
.ft-phone-screen{width:100%;height:100%;border-radius:34px;overflow:hidden;font-family:'Instrument Sans',system-ui,sans-serif;}
.ft-phone-notch{position:absolute;top:16px;left:50%;transform:translateX(-50%);width:76px;height:20px;border-radius:12px;background:#121212;z-index:2;}
@media (min-width:768px){.ft-phone{width:270px;height:560px;}}

/* Live tracking page inside the phone: real component at 390x844, scaled */
.ft-embed{position:relative;width:390px;height:844px;transform:scale(.5949);transform-origin:top left;background:#fff;overflow:hidden;}
@media (min-width:768px){.ft-embed{transform:scale(.6462);}}
.ft-statusbar{height:44px;padding:14px 28px 0 30px;display:flex;justify-content:space-between;font-size:15px;font-weight:700;color:#121212;background:#fff;}
.ft-embed-scroll{height:800px;overflow-y:auto;overscroll-behavior:contain;scrollbar-width:none;}
.ft-embed-scroll::-webkit-scrollbar{display:none;}

/* Logo */
.ft-logo{transition:transform .15s ease;}
.ft-logo:hover .ft-logo-mark{animation:ftZap .5s ease;}
@keyframes ftZap{0%,100%{transform:none;}30%{transform:translateX(3px) skewX(-8deg);}60%{transform:translateX(-1px);}}

/* Hero load: one sequence. Copy leans in, streaks fly in, phone rises, postmark stamps */
@keyframes ftHeroIn{from{opacity:0;transform:translateX(-28px) skewX(-8deg);}to{opacity:1;transform:none;}}
.ft-h-in{animation:ftHeroIn .7s cubic-bezier(.2,.8,.2,1) both;}
@keyframes ftStreak{from{opacity:0;transform:translate(-90px,50px);}to{opacity:1;transform:none;}}
.ft-streaks polygon{animation:ftStreak .55s cubic-bezier(.2,.8,.2,1) both;}
.ft-streaks .s1{animation-delay:.25s;}.ft-streaks .s2{animation-delay:.33s;}.ft-streaks .s3{animation-delay:.4s;}
.ft-streaks.is-late .s1{animation-delay:.45s;}.ft-streaks.is-late .s2{animation-delay:.52s;}.ft-streaks.is-late .s3{animation-delay:.6s;}
@keyframes ftRise{from{opacity:0;transform:translateY(36px);}to{opacity:1;transform:none;}}
.ft-rise{animation:ftRise .8s cubic-bezier(.2,.8,.2,1) .2s both;}
@keyframes ftBlock{from{transform:scale(.9);opacity:0;}to{transform:none;opacity:1;}}
.ft-hero-block{animation:ftBlock .6s cubic-bezier(.2,.8,.2,1) .1s both;}
.ft-hint{animation:ftHeroIn .6s cubic-bezier(.2,.8,.2,1) 1.2s both;}

/* Perforated postage stamp: holes are page-white dots around the edge */
.ft-stamp{padding:7px;background-color:#FEC200;
  background-image:radial-gradient(circle,#fff 3.2px,transparent 3.6px);
  background-size:12px 12px;background-position:-6px -6px;
  filter:drop-shadow(0 6px 10px rgba(0,0,0,.18));width:fit-content;}
.ft-stamp-face{background:#FFF8E1;border:2px solid #121212;padding:10px 14px;text-align:center;min-width:74px;}

/* Postmark */
.ft-postmark text{font-family:'Archivo',system-ui,sans-serif;}
@keyframes ft-cancel{0%{opacity:0;transform:scale(1.25) rotate(-14deg);}60%{opacity:1;}100%{opacity:.9;transform:scale(1) rotate(-6deg);}}
.ft-postmark-anim{transform:rotate(-6deg);opacity:.9;animation:ft-cancel .7s cubic-bezier(.2,.8,.2,1) 1s both;}

/* Dashed route line between steps */
.ft-route{background-image:linear-gradient(90deg,#FEC200 50%,transparent 50%);background-size:14px 2px;}

/* Postcard */
.ft-postcard{box-shadow:0 2px 0 #E4E4E7,0 30px 60px -30px rgba(0,0,0,.35);
  background-image:linear-gradient(90deg,#DF1515 0 12px,#fff 12px 24px,#121212 24px 36px,#fff 36px 48px);
  background-size:48px 6px;background-repeat:repeat-x;background-position:top left;padding-top:6px;}

/* Shipping label */
.ft-label{border:3px solid #121212;border-radius:6px;box-shadow:10px 10px 0 #FEC200;}

/* FAQ */
.ft-faq summary{list-style:none;cursor:pointer;}
.ft-faq summary::-webkit-details-marker{display:none;}
.ft-plus{transition:transform .2s;}
.ft-faq[open] .ft-plus{transform:rotate(45deg);}

/* Phones: motion is a simple fade, nothing slides sideways */
@keyframes ftFadeUp{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:none;}}
@media (max-width:767px){
  .ft-h-in,.ft-hint{animation-name:ftFadeUp;animation-duration:.45s;}
  .ft-streaks polygon{animation-name:ftFade;}
  .ft-rise{animation-duration:.5s;}
}
@keyframes ftFade{from{opacity:0;}to{opacity:1;}}

@media (prefers-reduced-motion:reduce){
  html{scroll-behavior:auto;}
  .ft-postmark-anim,.ft-h-in,.ft-streaks polygon,.ft-rise,.ft-hero-block,.ft-hint,.ft-logo-mark{animation:none!important;}
  .ft-plus{transition:none;}
}
`;
