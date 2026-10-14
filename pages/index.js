import Head from 'next/head';

const WHATSAPP = 'https://wa.me/917902411421';

export default function Home() {
  return (
    <main className="bg-black text-white overflow-hidden">
      <Head>
        <title>FlashTrack — Branded order tracking for D2C brands</title>
        <meta name="description" content="Give every customer a professional, branded tracking page. Fewer 'where is my order' messages, faster action on RTO, more trust in your brand." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700&display=swap" rel="stylesheet" />
      </Head>
      {/* Page-level reset (Tailwind's global reset is off so other pages aren't affected) */}
      <style>{`
        *,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}
        body{background:#000;color:#fff;font-family:'DM Sans',system-ui,sans-serif;-webkit-font-smoothing:antialiased;}
        a{text-decoration:none;color:inherit;}
        h1,h2,h3{font-family:'Syne','DM Sans',sans-serif;}
        details>summary{list-style:none;cursor:pointer;}
        details>summary::-webkit-details-marker{display:none;}
      `}</style>
      <HeroSection />
      <TrustSection />
      <ProblemSection />
      <SolutionSection />
      <ResultsSection />
      <FounderSection />
      <PricingSection />
      <FaqSection />
      <FinalCtaSection />
    </main>
  );
}

function HeroSection() {
  return (
    <section className="relative min-h-screen bg-black overflow-hidden">

  {/* Background */}
  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#ff3b1f25,transparent_45%)]"></div>

  <div className="absolute inset-0 opacity-[0.03]"
    style={{
      backgroundImage:
        "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
      backgroundSize: "80px 80px",
    }}
  />

  {/* Navbar */}

  <nav className="relative z-20 max-w-7xl mx-auto px-8 py-8 flex items-center justify-between">

    {/* Text wordmark: /logo.png doesn't exist in the repo (no public/ folder) */}
    <div className="text-2xl md:text-3xl font-black tracking-tight" style={{ fontFamily: "'Syne',sans-serif" }}>
      ⚡ Flash<span className="bg-gradient-to-r from-red-500 to-yellow-400 bg-clip-text text-transparent">Track</span>
    </div>

    <a
      href="https://wa.me/917902411421"
      className="px-6 py-3 rounded-full bg-gradient-to-r from-red-600 to-yellow-500 text-black font-bold"
    >
      Start Free
    </a>

  </nav>

  {/* Hero */}

  <div className="relative z-10 max-w-7xl mx-auto px-8 pt-20 pb-32">

    <div className="grid lg:grid-cols-2 gap-20 items-center">

      {/* Left */}

      <div>

        <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full border border-red-500/30 bg-red-500/10 text-red-400 text-sm mb-8">
          Trusted Order Tracking For Growing Businesses
        </div>

        <h1 className="text-6xl md:text-8xl font-black leading-[0.95] tracking-tight text-white">

          Turn Order

          <span className="block bg-gradient-to-r from-red-500 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
            Tracking
          </span>

          Into Trust.

        </h1>

        <p className="mt-8 text-xl text-zinc-400 leading-relaxed max-w-xl">

          Give every customer a professional tracking experience.
          Reduce support messages, lower RTO losses and build
          confidence in your brand.

        </p>

        <div className="flex gap-4 mt-10">

          <a
            href="https://wa.me/917902411421"
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-red-600 to-yellow-500 text-black font-bold text-lg"
          >
            Start Free
          </a>

          <a
            href="#benefits"
            className="px-8 py-4 rounded-2xl border border-zinc-700 text-white"
          >
            Learn More
          </a>

        </div>

      </div>

      {/* Right */}

      <div className="relative">

        <div className="absolute inset-0 blur-3xl bg-red-500/20"></div>

        <div className="relative bg-zinc-950 border border-zinc-800 rounded-[32px] p-8">

          <div className="flex justify-between items-center mb-8">

            <h3 className="text-white font-bold text-xl">
              FlashTrack Dashboard
            </h3>

            <div className="h-3 w-3 rounded-full bg-green-500"></div>

          </div>

          <div className="grid grid-cols-2 gap-4">

            <div className="bg-zinc-900 rounded-2xl p-6">
              <div className="text-zinc-500 text-sm">
                Active Orders
              </div>

              <div className="text-white text-5xl font-black mt-2">
                127
              </div>
            </div>

            <div className="bg-zinc-900 rounded-2xl p-6">
              <div className="text-zinc-500 text-sm">
                Delivered
              </div>

              <div className="text-green-500 text-5xl font-black mt-2">
                91
              </div>
            </div>

            <div className="bg-zinc-900 rounded-2xl p-6">
              <div className="text-zinc-500 text-sm">
                Support Saved
              </div>

              <div className="text-yellow-400 text-5xl font-black mt-2">
                73%
              </div>
            </div>

            <div className="bg-zinc-900 rounded-2xl p-6">
              <div className="text-zinc-500 text-sm">
                RTO Alerts
              </div>

              <div className="text-red-500 text-5xl font-black mt-2">
                4
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>

  </div>

</section>
  );
}

function TrustSection() {
  return (
    <section className="bg-zinc-950 border-y border-zinc-800">

  <div className="max-w-7xl mx-auto px-8 py-10">

    <div className="grid md:grid-cols-4 gap-8 text-center">

      <div>
        <h3 className="text-red-500 text-4xl font-black">
          24h
        </h3>
        <p className="text-zinc-400 mt-2">
          Setup Time
        </p>
      </div>

      <div>
        <h3 className="text-yellow-400 text-4xl font-black">
          ₹750
        </h3>
        <p className="text-zinc-400 mt-2">
          Monthly Plan
        </p>
      </div>

      <div>
        <h3 className="text-red-500 text-4xl font-black">
          ∞
        </h3>
        <p className="text-zinc-400 mt-2">
          Unlimited Orders
        </p>
      </div>

      <div>
        <h3 className="text-yellow-400 text-4xl font-black">
          0
        </h3>
        <p className="text-zinc-400 mt-2">
          Technical Skills Needed
        </p>
      </div>

    </div>

  </div>

</section>
  );
}

function SectionTitle({ eyebrow, title, sub }) {
  return (
    <div className="max-w-3xl">
      <div className="text-sm font-bold tracking-widest text-red-500 uppercase">{eyebrow}</div>
      <h2 className="mt-3 text-4xl md:text-5xl font-black leading-tight">{title}</h2>
      {sub && <p className="mt-5 text-lg text-zinc-400 leading-relaxed">{sub}</p>}
    </div>
  );
}

function ProblemSection() {
  const problems = [
    ['💬', '"Where is my order?"', 'Your team spends hours every day answering the same tracking question on WhatsApp.'],
    ['🔗', 'Confusing courier pages', 'Customers get a raw tracking number and a courier website full of codes, captchas and ads.'],
    ['🏤', 'Parcels stuck on hold', "A parcel waits at the post office, the customer never finds out, and it comes back to you as RTO."],
    ['🤷', 'No brand, no trust', 'After payment, your customer never sees your brand again until the parcel arrives, if it arrives.'],
  ];
  return (
    <section className="bg-black border-b border-zinc-900">
      <div className="max-w-7xl mx-auto px-8 py-24">
        <SectionTitle eyebrow="The problem" title="Shipping ends. Customer anxiety doesn't." />
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-14">
          {problems.map(([icon, t, d]) => (
            <div key={t} className="bg-zinc-950 border border-zinc-800 rounded-3xl p-7">
              <div className="text-4xl">{icon}</div>
              <h3 className="mt-5 text-xl font-bold">{t}</h3>
              <p className="mt-3 text-zinc-400 leading-relaxed">{d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SolutionSection() {
  const steps = [
    ['1', 'Share your shipments', 'Send us your booking receipts or shipment list every day. No software to install.'],
    ['2', 'We set up your page', 'Your branded tracking page goes live within 24 hours, with your name on top.'],
    ['3', 'Customers tap one link', 'One link for all your customers. They find their order by name, pincode or order ID.'],
  ];
  return (
    <section id="benefits" className="bg-zinc-950 border-b border-zinc-900">
      <div className="max-w-7xl mx-auto px-8 py-24">
        <SectionTitle
          eyebrow="How it works"
          title="One branded link. Every order. Zero tech work."
          sub="FlashTrack gives your customers a clean tracking page in your brand's name, and keeps it updated for you."
        />
        <div className="grid md:grid-cols-3 gap-6 mt-14">
          {steps.map(([n, t, d]) => (
            <div key={n} className="relative bg-black border border-zinc-800 rounded-3xl p-8">
              <div className="h-12 w-12 rounded-full bg-gradient-to-r from-red-600 to-yellow-500 text-black font-black text-xl flex items-center justify-center">{n}</div>
              <h3 className="mt-6 text-2xl font-bold">{t}</h3>
              <p className="mt-3 text-zinc-400 leading-relaxed">{d}</p>
            </div>
          ))}
        </div>
        <a href="/demo" className="inline-flex mt-12 px-8 py-4 rounded-2xl border border-zinc-700 text-white font-bold hover:border-zinc-500">
          See a live demo →
        </a>
      </div>
    </section>
  );
}

function ResultsSection() {
  const features = [
    ['🏷️', 'Your brand, not ours', "Customers see your brand name and your WhatsApp button, not a courier's website."],
    ['🔍', 'Search by name or pincode', 'No need to remember a 13-character tracking number.'],
    ['🗺️', 'Full parcel timeline', 'Every scan from booking to delivery, with post office names and times.'],
    ['🏤', 'Held-at-post-office alerts', 'Customers are told to collect parcels kept on hold, before they turn into RTO.'],
    ['🌐', '6 languages', 'English, Malayalam, Tamil, Hindi, Kannada and Telugu.'],
    ['📲', 'Shareable links', 'Customers can save the link or forward it to family. No login, no app.'],
  ];
  return (
    <section className="bg-black border-b border-zinc-900">
      <div className="max-w-7xl mx-auto px-8 py-24">
        <SectionTitle eyebrow="What you get" title="Everything your customer wants to know, in one tap." />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-14">
          {features.map(([icon, t, d]) => (
            <div key={t} className="flex gap-5 bg-zinc-950 border border-zinc-800 rounded-3xl p-7">
              <div className="text-3xl">{icon}</div>
              <div>
                <h3 className="text-lg font-bold">{t}</h3>
                <p className="mt-2 text-zinc-400 leading-relaxed">{d}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FounderSection() {
  return (
    <section className="bg-zinc-950 border-b border-zinc-900">
      <div className="max-w-4xl mx-auto px-8 py-24 text-center">
        <div className="text-sm font-bold tracking-widest text-red-500 uppercase">Why we built this</div>
        <p className="mt-8 text-2xl md:text-3xl font-bold leading-snug">
          "We run a D2C brand ourselves and ship across India every day. We were answering
          'where is my order' all day and losing parcels to RTO. FlashTrack started as our own fix."
        </p>
        <div className="mt-8 text-zinc-400">Stebin, Founder</div>
      </div>
    </section>
  );
}

function PricingSection() {
  const included = [
    'Branded tracking page for all your orders',
    'Unlimited orders',
    'Daily updates by our team',
    'Search by name, pincode or order ID',
    '6 languages',
    'Your WhatsApp button on every page',
    'Setup within 24 hours',
  ];
  return (
    <section className="bg-black border-b border-zinc-900">
      <div className="max-w-7xl mx-auto px-8 py-24">
        <div className="text-center">
          <div className="text-sm font-bold tracking-widest text-red-500 uppercase">Pricing</div>
          <h2 className="mt-3 text-4xl md:text-5xl font-black">One simple plan.</h2>
        </div>
        <div className="max-w-md mx-auto mt-14 bg-zinc-950 border border-zinc-800 rounded-[32px] p-10">
          <div className="text-zinc-400">Monthly plan</div>
          <div className="mt-2 flex items-end gap-2">
            <span className="text-6xl font-black" style={{ fontFamily: "'Syne',sans-serif" }}>₹750</span>
            <span className="text-zinc-500 mb-2">/ month</span>
          </div>
          <ul className="mt-8 space-y-3">
            {included.map(x => (
              <li key={x} className="flex gap-3 text-zinc-300"><span className="text-green-500">✓</span>{x}</li>
            ))}
          </ul>
          <a href={WHATSAPP} className="block mt-10 text-center px-8 py-4 rounded-2xl bg-gradient-to-r from-red-600 to-yellow-500 text-black font-bold text-lg">
            Start Free
          </a>
        </div>
      </div>
    </section>
  );
}

function FaqSection() {
  const faqs = [
    ['Do my customers need to log in or install an app?', 'No. They open one link in any browser and search for their order.'],
    ['What do I need to do every day?', 'Just share your booking receipts or shipment list. Our team updates your tracking page.'],
    ['Which couriers do you support?', 'India Post (Speed Post) today. Message us if you use another courier.'],
    ['What customer details are shown on the page?', 'Only the customer name, pincode and order ID. No phone numbers or addresses.'],
    ['How long does setup take?', 'Your tracking page is ready within 24 hours.'],
    ['Can I see it before I sign up?', 'Yes. Open the live demo to see exactly what your customers will see.'],
  ];
  return (
    <section className="bg-zinc-950 border-b border-zinc-900">
      <div className="max-w-3xl mx-auto px-8 py-24">
        <div className="text-center">
          <div className="text-sm font-bold tracking-widest text-red-500 uppercase">FAQ</div>
          <h2 className="mt-3 text-4xl md:text-5xl font-black">Questions, answered.</h2>
        </div>
        <div className="mt-12 space-y-4">
          {faqs.map(([q, a]) => (
            <details key={q} className="bg-black border border-zinc-800 rounded-2xl p-6">
              <summary className="flex justify-between gap-4 text-lg font-bold">{q}<span className="text-zinc-500">+</span></summary>
              <p className="mt-4 text-zinc-400 leading-relaxed">
                {a}{q.startsWith('Can I see') && <> <a href="/demo" className="text-yellow-400 underline">Open the demo →</a></>}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCtaSection() {
  return (
    <section className="relative bg-black overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,#ff3b1f25,transparent_50%)]"></div>
      <div className="relative max-w-4xl mx-auto px-8 py-28 text-center">
        <h2 className="text-5xl md:text-6xl font-black leading-tight">
          Make tracking part of your <span className="bg-gradient-to-r from-red-500 via-orange-400 to-yellow-400 bg-clip-text text-transparent">brand.</span>
        </h2>
        <p className="mt-6 text-xl text-zinc-400">Live in 24 hours. No technical skills needed.</p>
        <div className="flex flex-wrap justify-center gap-4 mt-10">
          <a href={WHATSAPP} className="px-8 py-4 rounded-2xl bg-gradient-to-r from-red-600 to-yellow-500 text-black font-bold text-lg">Start Free on WhatsApp</a>
          <a href="/demo" className="px-8 py-4 rounded-2xl border border-zinc-700 text-white font-bold text-lg">See the demo</a>
        </div>
        <div className="mt-16 text-sm text-zinc-600">© FlashTrack</div>
      </div>
    </section>
  );
}
