import Head from 'next/head';

// FlashTrack homepage. Bright, postal-themed (India Post red + yellow on white).
// Styling: Tailwind utility classes + a small <style> block for the postal pieces
// (perforated stamp, postmark, shipping label). Tailwind's global reset is off,
// so the page sets its own reset below.

const WHATSAPP = 'https://wa.me/917902411421';

export default function Home() {
  return (
    <div className="ft-page">
      <Head>
        <title>FlashTrack · Branded parcel tracking for India Post shipments</title>
        <meta name="description" content="One branded tracking link for every order you ship with India Post. Customers search their name, see every scan, and stop asking 'where is my order?'." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#FFFFFF" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..900&family=Instrument+Sans:wght@400;500;600;700&family=Libre+Barcode+128&family=Caveat:wght@600&display=swap" rel="stylesheet" />
      </Head>
      <style>{CSS}</style>

      <Nav />
      <main>
        <Hero />
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
      className={`ft-btn inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-[15px] font-semibold ${dark ? 'bg-[#14213D] text-white hover:bg-[#0d1730]' : 'bg-[#D7262E] text-white hover:bg-[#b81f26]'} ${className}`}>
      <WaIcon /> {children}
    </a>
  );
}

function DemoButton({ className = '' }) {
  return (
    <a href="/demo"
      className={`ft-btn inline-flex items-center justify-center rounded-full border-2 border-[#14213D] px-6 py-3 text-[15px] font-semibold text-[#14213D] hover:bg-[#14213D] hover:text-white ${className}`}>
      Open the live demo
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
    : <span aria-label="No" className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#E9ECF2] text-[15px] font-bold text-[#8A93A6]">✕</span>;
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

// These mirror the live tracking pages (components/ParcelView.js and
// components/OrderListView.js), scaled down to fit the phone frame.

const TIMELINE = [
  ['Taken out for delivery', 'Kakkanad SO', 'Today, 9:42 AM', true],
  ['Item received at destination', 'Kakkanad SO', 'Today, 6:10 AM'],
  ['Item dispatched', 'Ernakulam HO', 'Yesterday, 8:55 PM'],
  ['Item booked', 'Ernakulam HO', 'Yesterday, 4:12 PM'],
];

function ParcelScreen() {
  return (
    <div className="flex h-full flex-col bg-[#F3F5F9] text-[#14213D]">
      <div className="flex items-center justify-between border-b border-[#E3E7EF] bg-white px-4 pb-2.5 pt-9">
        <div>
          <div className="ft-display text-[13px] leading-tight">Your Brand</div>
          <div className="text-[9.5px] font-semibold text-[#D7262E]">← All orders</div>
        </div>
        <div className="rounded-full border-[1.5px] border-[#14213D] px-2.5 py-0.5 text-[9.5px] font-semibold">Share</div>
      </div>

      <div className="mx-3 mr-4 mt-3 overflow-hidden rounded-lg border-2 border-[#14213D] bg-white shadow-[4px_4px_0_#FFC72C]">
        <div className="flex items-center justify-between bg-[#D7262E] px-2.5 py-1.5 text-white">
          <span className="ft-display text-[8.5px]">SPEED POST</span>
          <span className="rounded border border-white/50 bg-white/15 px-1.5 py-px text-[8px] font-bold tracking-wide">EL695415965IN ⧉</span>
        </div>
        <div className="p-2.5">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FFF4D1] text-[15px]">🛵</span>
            <div>
              <div className="text-[8px] font-semibold text-[#8A93A6]">Current status</div>
              <div className="ft-display text-[15px] leading-tight text-[#B45309]">Out for delivery</div>
            </div>
          </div>
          <div className="mt-1.5 text-[9.5px]">Taken out for delivery, Kakkanad SO</div>
          <div className="mt-2.5 flex items-center">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className={`flex items-center ${i < 3 ? 'flex-1' : ''}`}>
                <span className={`h-2 w-2 rounded-full border-[1.5px] ${i <= 2 ? 'border-[#B45309] bg-[#B45309]' : 'border-[#CBD2DE] bg-white'}`} />
                {i < 3 && <span className={`mx-0.5 h-[2px] flex-1 rounded ${i < 2 ? 'bg-[#B45309]' : 'bg-[#E3E7EF]'}`} />}
              </div>
            ))}
          </div>
          <div className="mt-1 grid grid-cols-4 text-[7px] font-medium text-[#5A6480]">
            <span>Booked</span><span className="text-center">In transit</span>
            <span className="text-center font-bold text-[#14213D]">Out for delivery</span><span className="text-right text-[#8A93A6]">Delivered</span>
          </div>
        </div>
      </div>

      <div className="mx-3 mt-2.5 rounded-xl border border-[#E3E7EF] bg-white p-2.5">
        {[['From', 'Ernakulam HO', '#14213D'], ['To', 'Kakkanad SO', '#D7262E']].map(([l, v, c], i) => (
          <div key={l} className="flex gap-2">
            <div className="flex w-2 flex-col items-center">
              <span className="mt-0.5 h-2 w-2 rounded-full" style={{ background: c }} />
              {i === 0 && <span className="my-0.5 flex-1 border-l-[1.5px] border-dashed border-[#8A93A6]" />}
            </div>
            <div className={i === 0 ? 'pb-1.5' : ''}>
              <div className="text-[7.5px] font-semibold text-[#8A93A6]">{l}</div>
              <div className="text-[10px] font-bold">{v}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mx-3 mt-2.5 rounded-xl border border-[#E3E7EF] bg-white p-2.5">
        <div className="ft-display text-[11px]">Journey</div>
        <div className="mt-2 space-y-2">
          {TIMELINE.map(([e, o, t, first]) => (
            <div key={e} className="flex gap-2">
              <span className={`mt-0.5 shrink-0 rounded-full ${first ? 'h-2.5 w-2.5 bg-[#B45309] ring-[3px] ring-[#B45309]/20' : 'ml-[1px] h-2 w-2 bg-[#CBD2DE]'}`} />
              <div className="min-w-0">
                <div className={`text-[9.5px] ${first ? 'font-bold' : 'font-semibold text-[#2B3550]'}`}>{e}</div>
                <div className="text-[8px] text-[#8A93A6]">{o}, {t}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-3 mb-3 mt-auto rounded-full bg-[#1FA855] py-2 text-center text-[9.5px] font-semibold text-white">
        Questions? Chat with us on WhatsApp
      </div>
    </div>
  );
}

const ORDERS = [
  ['Anjali Menon', '695010', 'Delivered', '#16884F', '#E7F6EE', '#16884F'],
  ['Rahul Krishnan', '682030', 'Out for delivery', '#B45309', '#FFF4D1', '#1D4ED8'],
  ['Fathima Shirin', '680001', 'Held at post office', '#B45309', '#FFF4D1', '#D7262E'],
  ['Karthik S', '641002', 'In transit', '#1D4ED8', '#E8EFFE', '#7C3AED'],
];

function ListScreen() {
  return (
    <div className="flex h-full flex-col bg-[#F3F5F9] text-[#14213D]">
      <div className="flex items-center justify-between border-b border-[#E3E7EF] bg-white px-4 pb-2.5 pt-9">
        <div>
          <div className="ft-display text-[13px] leading-tight">Your Brand</div>
          <div className="flex items-center gap-1 text-[9px] text-[#5A6480]"><span className="h-1.5 w-1.5 rounded-full bg-[#16884F]" />Order tracking</div>
        </div>
        <div className="rounded-full bg-[#14213D] px-2.5 py-1 text-[9px] font-semibold text-white">↻ Refresh</div>
      </div>
      <div className="border-b border-[#EBB51F] bg-[#FFC72C] px-3 py-2.5">
        <div className="rounded-lg border-[1.5px] border-[#14213D] bg-white px-2.5 py-1.5 text-[9px] text-[#8A93A6] shadow-[2px_2px_0_#14213D]">🔍 Search by name, pincode or order ID</div>
      </div>
      <div className="px-3 pt-2 text-[9px] font-bold text-[#5A6480]">Live orders (4)</div>
      <div className="mt-1.5 space-y-2 px-3">
        {ORDERS.map(([n, p, s, c, bg, av]) => (
          <div key={n} className="rounded-xl border border-[#E3E7EF] bg-white p-2" style={{ borderLeft: `3px solid ${c}` }}>
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[8.5px] font-bold text-white" style={{ background: av }}>
                {n.split(' ').map(w => w[0]).join('')}
              </span>
              <div className="min-w-0 flex-1">
                <div className="ft-display truncate text-[10.5px]">{n}</div>
                <div className="text-[8px] text-[#5A6480]">📍 {p}</div>
              </div>
              <span className="shrink-0 rounded-full px-1.5 py-0.5 text-[7.5px] font-bold" style={{ color: c, background: bg }}>{s}</span>
            </div>
            <div className="mt-1.5 flex items-center justify-between border-t border-dashed border-[#E3E7EF] pt-1.5">
              <span className="rounded-md border border-[#E3E7EF] bg-[#F3F5F9] px-1.5 py-0.5 text-[7.5px] font-bold">EL6954159{60 + n.length}IN</span>
              <span className="rounded-full bg-[#D7262E] px-2 py-0.5 text-[8px] font-bold text-white">Track parcel</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Sections ──────────────────────────────────────────────────────

function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#E3E7EF] bg-white/90 backdrop-blur">
      <Wrap className="flex h-16 items-center justify-between gap-4">
        <a href="/" className="ft-display flex items-center gap-2 text-[20px] text-[#14213D]">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#D7262E] text-[16px] text-white">⚡</span>
          FlashTrack
        </a>
        <nav className="hidden items-center gap-8 text-[15px] font-medium text-[#3B4560] md:flex">
          <a href="#how" className="hover:text-[#D7262E]">How it works</a>
          <a href="/demo" className="hover:text-[#D7262E]">Demo</a>
          <a href="#pricing" className="hover:text-[#D7262E]">Pricing</a>
          <a href="#faq" className="hover:text-[#D7262E]">FAQ</a>
        </nav>
        <a href={WHATSAPP} target="_blank" rel="noreferrer"
          className="ft-btn rounded-full bg-[#14213D] px-4 py-2 text-[14px] font-semibold text-white hover:bg-[#0d1730] md:px-5">
          Start free
        </a>
      </Wrap>
    </header>
  );
}

function Hero() {
  return (
    <section className="overflow-hidden bg-white">
      <Wrap className="grid items-center gap-12 pb-16 pt-12 md:pb-24 md:pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#FFF4D1] px-3.5 py-1.5 text-[13px] font-semibold text-[#7A5600]">
            <span className="h-2 w-2 rounded-full bg-[#D7262E]" /> For brands shipping with India Post
          </div>
          <h1 className="ft-display mt-6 text-[40px] leading-[1.02] text-[#14213D] sm:text-[52px] lg:text-[64px]">
            Parcel tracking that carries your brand.
          </h1>
          <p className="mt-6 max-w-[34rem] text-[18px] leading-[1.6] text-[#3B4560]">
            One link for every order you ship. Customers search their name, see every scan from
            booking to delivery, and stop messaging you “where is my order?”.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <WhatsAppButton />
            <DemoButton />
          </div>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-[14px] font-medium text-[#3B4560]">
            <span>✓ ₹750 a month</span>
            <span>✓ Live in 24 hours</span>
            <span>✓ No app, no login for customers</span>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[460px]">
          <div className="absolute inset-x-4 bottom-0 top-10 rounded-[36px] bg-[#FFC72C] md:inset-x-0" />
          <Stamp className="absolute -left-3 top-[38%] z-20 origin-top-left -rotate-[8deg] scale-[0.72] sm:-left-1 sm:top-2 sm:scale-100 md:-left-6">
            <div className="ft-display text-[13px] leading-none text-[#14213D]">INDIA</div>
            <div className="mt-1 text-[22px]">📦</div>
            <div className="ft-display mt-1 text-[15px] leading-none text-[#D7262E]">₹750</div>
          </Stamp>
          <Phone className="relative z-10 mx-auto mt-4"><ParcelScreen /></Phone>
          <Postmark className="ft-postmark-anim absolute -bottom-[72px] -right-1 z-20 w-[140px] text-[#D7262E] sm:-bottom-20 sm:-right-6 sm:w-[160px] md:-bottom-16 md:-right-14 md:w-[190px]" />
        </div>
      </Wrap>
    </section>
  );
}

const JOURNEY = ['Item booked', 'Bag dispatched', 'Received at hub', 'Out for delivery', 'Delivered'];

function Journey() {
  return (
    <section className="border-y border-[#E3E7EF] bg-[#F3F5F9]">
      <Wrap className="py-8">
        <p className="text-[14px] font-semibold text-[#3B4560]">Every India Post scan, shown to your customer as it happens</p>
        <ol className="mt-5 grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3 lg:grid-cols-5">
          {JOURNEY.map((j, i) => (
            <li key={j} className="flex items-center gap-3">
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[14px] font-bold ${i === JOURNEY.length - 1 ? 'bg-[#16884F] text-white' : 'bg-white text-[#14213D] ring-1 ring-[#D5DBE6]'}`}>
                {i === JOURNEY.length - 1 ? '✓' : i + 1}
              </span>
              <span className="text-[15px] font-semibold text-[#14213D]">{j}</span>
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
          <H2 className="text-[#14213D]">The same question, all day, on WhatsApp.</H2>
          <p className="mt-5 max-w-[32rem] text-[17px] leading-[1.65] text-[#3B4560]">
            After a customer pays, your brand goes quiet until the parcel arrives. So they ask.
            Again and again.
          </p>
          <ul className="mt-8 space-y-6">
            {[
              ['💬', 'Your team answers tracking questions instead of selling', 'Every “where is my order?” is a chat someone has to stop and answer.'],
              ['🏤', 'Held parcels quietly turn into returns', 'When India Post keeps a parcel on hold, the customer often never finds out. It comes back to you.'],
              ['🔗', 'Courier pages don’t look like you', 'A tracking number and a captcha page is the last thing your customer sees of your brand.'],
            ].map(([icon, t, d]) => (
              <li key={t} className="flex gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FFF4D1] text-[20px]">{icon}</span>
                <div>
                  <h3 className="text-[17px] font-bold text-[#14213D]">{t}</h3>
                  <p className="mt-1 text-[15.5px] leading-[1.6] text-[#5A6480]">{d}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="mx-auto w-full max-w-[440px] overflow-hidden rounded-[28px] border border-[#E3E7EF] bg-white shadow-[0_24px_60px_-20px_rgba(20,33,61,0.25)]">
          <div className="flex items-center justify-between bg-[#075E54] px-5 py-4 text-white">
            <div className="text-[16px] font-semibold">Chats</div>
            <div className="rounded-full bg-[#25D366] px-2.5 py-0.5 text-[12px] font-bold text-[#073B33]">12 unread</div>
          </div>
          <ul>
            {CHATS.map(([n, m, t, u]) => (
              <li key={n} className="flex items-center gap-3 border-b border-[#EEF1F5] px-5 py-3.5 last:border-b-0">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#DFE5EE] text-[14px] font-bold text-[#3B4560]">
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
  ['Send your daily shipments', 'Share yesterday’s India Post booking receipts or your shipment sheet. No software to install.'],
  ['We build your tracking page', 'Your page goes live within 24 hours, with your brand name and your WhatsApp button.'],
  ['Share one link with everyone', 'Put the link in your order message. Customers find their parcel by name, pincode or order ID.'],
];

function HowItWorks() {
  return (
    <section id="how" className="bg-[#14213D] text-white">
      <Wrap className="py-20 md:py-28">
        <H2 className="max-w-[40rem]">Live in a day. Nothing for you to set up.</H2>
        <ol className="relative mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
          <span className="ft-route absolute left-[22px] top-[22px] hidden h-0.5 w-[calc(100%-44px)] md:block" aria-hidden="true" />
          {STEPS.map(([t, d], i) => (
            <li key={t} className="relative flex gap-5 md:block">
              <span className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#FFC72C] text-[18px] font-extrabold text-[#14213D]">
                {i + 1}
              </span>
              <div className="md:mt-6">
                <h3 className="text-[20px] font-bold">{t}</h3>
                <p className="mt-2 max-w-[22rem] text-[16px] leading-[1.6] text-[#C4CBDA]">{d}</p>
              </div>
            </li>
          ))}
        </ol>
      </Wrap>
    </section>
  );
}

const FEATURES_L = [
  ['Search by name', 'No need to remember a 13-character tracking number.'],
  ['Every order, one link', 'One page lists all your shipped orders.'],
  ['6 languages', 'English, Malayalam, Tamil, Hindi, Kannada, Telugu.'],
];
const FEATURES_R = [
  ['Full scan history', 'Every India Post scan with office name and time.'],
  ['Held-parcel warning', 'Tells customers to collect a parcel before it’s returned.'],
  ['Your WhatsApp button', 'Customers reach you, not a courier helpline.'],
];

function Feature({ t, d, align = 'left' }) {
  return (
    <div className={align === 'right' ? 'lg:text-right' : ''}>
      <h3 className="text-[17px] font-bold text-[#14213D]">{t}</h3>
      <p className="mt-1 text-[15px] leading-[1.55] text-[#5A6480]">{d}</p>
    </div>
  );
}

function Tour() {
  return (
    <section className="bg-[#F3F5F9]">
      <Wrap className="py-20 md:py-28">
        <div className="max-w-[40rem]">
          <H2 className="text-[#14213D]">What your customer sees when they tap the link.</H2>
          <p className="mt-5 text-[17px] leading-[1.65] text-[#3B4560]">
            A clean page in your brand’s name. Built for phones, because that’s where your customers open it.
          </p>
        </div>

        <div className="mt-14 grid items-center gap-10 lg:grid-cols-[1fr_auto_1fr] lg:gap-12">
          <div className="order-2 grid gap-8 sm:grid-cols-2 lg:order-1 lg:grid-cols-1">
            {FEATURES_L.map(([t, d]) => <Feature key={t} t={t} d={d} align="right" />)}
          </div>
          <div className="order-1 flex justify-center gap-5 lg:order-2">
            <Phone className="hidden sm:block"><ListScreen /></Phone>
            <Phone className="sm:mt-12"><ParcelScreen /></Phone>
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
  ['Warns customers when a parcel is on hold', false],
  ['Your WhatsApp button for questions', false],
];

function Compare() {
  return (
    <section className="bg-white">
      <Wrap className="py-20 md:py-28">
        <H2 className="max-w-[40rem] text-[#14213D]">Third-party tracking sites vs your FlashTrack page.</H2>
        <div className="mt-12 overflow-hidden rounded-[24px] border border-[#E3E7EF]">
          <div className="grid grid-cols-[1fr_84px_84px] items-center bg-[#F3F5F9] px-5 py-4 text-[13px] font-bold text-[#3B4560] sm:grid-cols-[1fr_160px_160px] sm:px-8 sm:text-[14px]">
            <span>Feature</span>
            <span className="text-center">Tracking sites</span>
            <span className="text-center text-[#D7262E]">FlashTrack</span>
          </div>
          {ROWS.map(([r, them]) => (
            <div key={r} className="grid grid-cols-[1fr_84px_84px] items-center border-t border-[#E3E7EF] px-5 py-4 sm:grid-cols-[1fr_160px_160px] sm:px-8">
              <span className="pr-3 text-[15px] font-medium text-[#14213D] sm:text-[16px]">{r}</span>
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
    <section className="bg-[#F3F5F9]">
      <Wrap className="py-20 md:py-28">
        <div className="ft-postcard relative mx-auto grid max-w-[980px] overflow-hidden rounded-[6px] bg-white md:grid-cols-[1.4fr_1fr]">
          <div className="p-7 md:border-r md:border-dashed md:border-[#C9D1DE] md:p-12">
            <p className="ft-display text-[22px] leading-[1.3] text-[#14213D] md:text-[26px]">
              “We run a D2C brand ourselves and ship across India with India Post every day.
              We were answering ‘where is my order?’ all day and losing parcels to returns.
              FlashTrack started as our own fix.”
            </p>
            <div className="ft-hand mt-6 text-[34px] leading-none text-[#D7262E]">Stebin</div>
            <div className="mt-1 text-[14px] text-[#5A6480]">Founder, FlashTrack</div>
          </div>
          <div className="relative border-t border-dashed border-[#C9D1DE] p-7 md:border-t-0 md:p-12">
            <Stamp className="ml-auto w-fit rotate-[4deg]">
              <div className="ft-display text-[12px] leading-none text-[#14213D]">KERALA</div>
              <div className="mt-1 text-[22px]">🌴</div>
              <div className="ft-display mt-1 text-[13px] leading-none text-[#D7262E]">₹5</div>
            </Stamp>
            <Postmark className="absolute right-20 top-8 w-[150px] text-[#14213D]/70" top="KOCHI" bottom="KERALA" mid="2026" />
            <div className="mt-10 space-y-4 text-[16px] text-[#14213D] md:mt-16">
              <div className="border-b border-[#C9D1DE] pb-2"><span className="text-[#8A93A6]">To </span>Every D2C founder</div>
              <div className="border-b border-[#C9D1DE] pb-2">shipping with India Post</div>
              <div className="border-b border-[#C9D1DE] pb-2">Anywhere in India</div>
            </div>
          </div>
        </div>
      </Wrap>
    </section>
  );
}

const CONTENTS = [
  'Branded tracking page for all your orders',
  'Unlimited orders',
  'Daily updates by our team',
  'Search by name, pincode or order ID',
  '6 languages for your customers',
  'Your WhatsApp button on every page',
  'Setup within 24 hours',
];

function Pricing() {
  return (
    <section id="pricing" className="bg-white">
      <Wrap className="grid items-center gap-12 py-20 md:py-28 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
        <div>
          <H2 className="text-[#14213D]">One plan. Less than a day of support calls.</H2>
          <p className="mt-5 max-w-[30rem] text-[17px] leading-[1.65] text-[#3B4560]">
            Everything included, no setup fee. Message us on WhatsApp and your tracking page
            can be live tomorrow.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <WhatsAppButton />
            <DemoButton />
          </div>
        </div>

        <div className="ft-label mx-auto w-full max-w-[480px] rotate-[-1.2deg] bg-white">
          <div className="flex items-stretch border-b-[3px] border-[#14213D]">
            <div className="flex-1 p-5">
              <div className="text-[12px] font-bold text-[#5A6480]">Service</div>
              <div className="ft-display mt-0.5 text-[22px] text-[#14213D]">FlashTrack Monthly</div>
            </div>
            <div className="flex w-[92px] items-center justify-center border-l-[3px] border-[#14213D] bg-[#D7262E] text-center font-extrabold leading-tight text-white">
              <span className="ft-display text-[13px]">SPEED<br />POST</span>
            </div>
          </div>
          <div className="grid grid-cols-2 border-b-[3px] border-[#14213D] text-[14px]">
            <div className="border-r-[3px] border-[#14213D] p-4">
              <div className="text-[12px] font-bold text-[#5A6480]">From</div>
              <div className="mt-0.5 font-semibold text-[#14213D]">FlashTrack, Kochi</div>
            </div>
            <div className="p-4">
              <div className="text-[12px] font-bold text-[#5A6480]">To</div>
              <div className="mt-0.5 font-semibold text-[#14213D]">Your brand</div>
            </div>
          </div>
          <div className="border-b-[3px] border-[#14213D] p-5">
            <div className="text-[12px] font-bold text-[#5A6480]">Contents</div>
            <ul className="mt-3 space-y-2">
              {CONTENTS.map(c => (
                <li key={c} className="flex gap-3 text-[15px] text-[#14213D]">
                  <span className="font-bold text-[#16884F]">✓</span>{c}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex items-end justify-between gap-4 p-5">
            <div>
              <div className="text-[12px] font-bold text-[#5A6480]">Postage</div>
              <div className="flex items-baseline gap-1.5">
                <span className="ft-display text-[48px] leading-none text-[#14213D]">₹750</span>
                <span className="text-[15px] text-[#5A6480]">/ month</span>
              </div>
            </div>
            <div className="ft-barcode text-[44px] leading-none text-[#14213D]" aria-hidden="true">FT750IN</div>
          </div>
        </div>
      </Wrap>
    </section>
  );
}

const FAQS = [
  ['Do my customers need to log in or install an app?', 'No. They open your link in any browser, search their name, pincode or order ID, and tap their order.'],
  ['What do I need to do every day?', 'Share your India Post booking receipts or shipment list. Our team updates your tracking page from there.'],
  ['Which couriers do you support?', 'India Post Speed Post. If you use another courier, message us and we’ll tell you what’s possible.'],
  ['What customer details are shown on the page?', 'Only the customer’s name, pincode and order ID. No phone numbers and no addresses.'],
  ['How long does setup take?', 'Your tracking page is ready within 24 hours of sharing your first shipment list.'],
  ['Can I put my own WhatsApp number on the page?', 'Yes. Every tracking page shows a button that opens a chat with your business.'],
  ['Can I see it before I pay?', 'Yes. The live demo shows exactly what your customers will see.'],
];

function Faq() {
  return (
    <section id="faq" className="bg-[#F3F5F9]">
      <Wrap className="grid gap-10 py-20 md:py-28 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div>
          <H2 className="text-[#14213D]">Questions brands ask us.</H2>
          <p className="mt-5 max-w-[24rem] text-[17px] leading-[1.65] text-[#3B4560]">
            Can’t find your answer? Ask us on WhatsApp. A real person replies.
          </p>
          <WhatsAppButton className="mt-6">Ask on WhatsApp</WhatsAppButton>
        </div>
        <div className="divide-y divide-[#D5DBE6] border-y border-[#D5DBE6]">
          {FAQS.map(([q, a]) => (
            <details key={q} className="ft-faq group py-5">
              <summary className="flex items-start justify-between gap-6 text-[17px] font-semibold text-[#14213D]">
                {q}
                <span className="ft-plus mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-[18px] text-[#D7262E] ring-1 ring-[#D5DBE6]">+</span>
              </summary>
              <p className="mt-3 max-w-[40rem] pr-12 text-[16px] leading-[1.65] text-[#5A6480]">
                {a}{q.startsWith('Can I see') && <> <a href="/demo" className="font-semibold text-[#D7262E] underline underline-offset-4">Open the demo</a></>}
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
    <section className="relative overflow-hidden bg-[#FFC72C]">
      <Postmark className="absolute -right-10 -top-6 hidden w-[320px] text-[#14213D]/15 md:block" />
      <Wrap className="relative py-20 md:py-24">
        <h2 className="ft-display max-w-[44rem] text-[36px] leading-[1.05] text-[#14213D] md:text-[56px]">
          Put your brand on every tracking page.
        </h2>
        <p className="mt-5 max-w-[34rem] text-[18px] leading-[1.6] text-[#3B3000]">
          ₹750 a month. Live within 24 hours. Your customers stop asking where their order is.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <WhatsAppButton dark />
          <DemoButton className="bg-transparent" />
        </div>
      </Wrap>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-white">
      <Wrap className="flex flex-col gap-6 py-10 text-[14px] text-[#5A6480] md:flex-row md:items-center md:justify-between">
        <div className="ft-display flex items-center gap-2 text-[18px] text-[#14213D]">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#D7262E] text-[14px] text-white">⚡</span>
          FlashTrack
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2">
          <a href="#how" className="hover:text-[#14213D]">How it works</a>
          <a href="/demo" className="hover:text-[#14213D]">Demo</a>
          <a href="#pricing" className="hover:text-[#14213D]">Pricing</a>
          <a href="#faq" className="hover:text-[#14213D]">FAQ</a>
          <a href={WHATSAPP} target="_blank" rel="noreferrer" className="hover:text-[#14213D]">WhatsApp</a>
        </nav>
        <div>Made in Kochi, Kerala. © {new Date().getFullYear()} FlashTrack</div>
      </Wrap>
    </footer>
  );
}

// ─── Page CSS (postal pieces, reset, accessibility) ─────────────────

const CSS = `
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box;border-width:0;border-style:solid;border-color:#E3E7EF;}
html{scroll-behavior:smooth;scroll-padding-top:72px;}
body{background:#fff;color:#14213D;font-family:'Instrument Sans',system-ui,sans-serif;-webkit-font-smoothing:antialiased;}
a{text-decoration:none;color:inherit;}
ul,ol{list-style:none;}
.ft-display{font-family:'Archivo',system-ui,sans-serif;font-weight:800;font-stretch:112%;letter-spacing:-0.02em;}
.ft-hand{font-family:'Caveat',cursive;font-weight:600;}
.ft-barcode{font-family:'Libre Barcode 128',monospace;font-weight:400;}
.ft-btn{transition:background-color .15s,color .15s;}
a:focus-visible,summary:focus-visible{outline:3px solid #FFC72C;outline-offset:3px;border-radius:12px;}

/* Phone mockup */
.ft-phone{width:250px;height:520px;border-radius:42px;background:#14213D;padding:9px;position:relative;
  box-shadow:0 30px 60px -20px rgba(20,33,61,.45),inset 0 0 0 2px #2a3a5e;flex-shrink:0;}
.ft-phone-screen{width:100%;height:100%;border-radius:34px;overflow:hidden;font-family:'Instrument Sans',system-ui,sans-serif;}
.ft-phone-notch{position:absolute;top:16px;left:50%;transform:translateX(-50%);width:76px;height:20px;border-radius:12px;background:#14213D;z-index:2;}
@media (min-width:768px){.ft-phone{width:270px;height:560px;}}

/* Perforated postage stamp: holes are page-white dots around the edge */
.ft-stamp{padding:7px;background-color:#FFC72C;
  background-image:radial-gradient(circle,#fff 3.2px,transparent 3.6px);
  background-size:12px 12px;background-position:-6px -6px;
  filter:drop-shadow(0 6px 10px rgba(20,33,61,.18));width:fit-content;}
.ft-stamp-face{background:#FFF8E1;border:2px solid #14213D;padding:10px 14px;text-align:center;min-width:74px;}

/* Postmark */
.ft-postmark text{font-family:'Archivo',system-ui,sans-serif;}
@keyframes ft-cancel{0%{opacity:0;transform:scale(1.25) rotate(-14deg);}60%{opacity:1;}100%{opacity:.9;transform:scale(1) rotate(-6deg);}}
.ft-postmark-anim{transform:rotate(-6deg);opacity:.9;animation:ft-cancel .7s cubic-bezier(.2,.8,.2,1) .5s both;}

/* Dashed route line between steps */
.ft-route{background-image:linear-gradient(90deg,#FFC72C 50%,transparent 50%);background-size:14px 2px;}

/* Postcard */
.ft-postcard{box-shadow:0 2px 0 #E3E7EF,0 30px 60px -30px rgba(20,33,61,.35);
  background-image:linear-gradient(90deg,#D7262E 0 12px,#fff 12px 24px,#14213D 24px 36px,#fff 36px 48px);
  background-size:48px 6px;background-repeat:repeat-x;background-position:top left;padding-top:6px;}

/* Shipping label */
.ft-label{border:3px solid #14213D;border-radius:6px;box-shadow:10px 10px 0 #FFC72C;}

/* FAQ */
.ft-faq summary{list-style:none;cursor:pointer;}
.ft-faq summary::-webkit-details-marker{display:none;}
.ft-plus{transition:transform .2s;}
.ft-faq[open] .ft-plus{transform:rotate(45deg);}

@media (prefers-reduced-motion:reduce){
  html{scroll-behavior:auto;}
  .ft-postmark-anim{animation:none;}
  .ft-plus{transition:none;}
}
`;
