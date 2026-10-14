# FlashTrack × India Post — Setup

Adds a branded, shareable tracking page for each parcel:
`flashtrack.io/<brand code>/<tracking number>` (e.g. `flashtrack.io/728192/EB123456789IN`).

No existing files change. The brand list page (`[code].js`), HQ script and customer sheets stay as they are.

```
Customer taps Track
  → flashtrack.io/728192/EB123456789IN      (pages/[code]/[id].js — new)
  → /api/track?code=728192&id=EB…           (pages/api/track.js — new, CDN cache 10 min)
  → https://proxy.flashtrack.io/track       (proxy/server.js — new, on the VPS with a fixed IP)
  → India Post: login (token cached ~14 min per brand) + /v1/tracking/bulk
```

## New files

| File | Goes where |
|---|---|
| `pages/[code]/[id].js` | FlashTrack repo → `pages/[code]/[id].js` (new folder next to `[code].js`) |
| `pages/api/track.js` | FlashTrack repo → `pages/api/track.js` |
| `proxy/server.js` | The VPS only (not the repo, or a separate private repo) |
| `proxy/brands.example.json` | The VPS, copied to `brands.json` with real logins |

---

## Step 1 — Rent the VPS

Any small Linux VPS in India works (1 vCPU / 1 GB is plenty). Pick one that gives a **static public IPv4**.
Ubuntu 22.04 or 24.04.

Note the IP address. This is the IP every brand whitelists in their India Post portal.

## Step 2 — Point a subdomain at it

In Hostinger DNS for flashtrack.io, add:

| Type | Name | Value |
|---|---|---|
| A | `proxy` | your VPS IP |

## Step 3 — Install Node and Caddy (HTTPS) on the VPS

```bash
# Node 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Caddy (gets a free HTTPS certificate automatically)
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update && sudo apt install -y caddy
```

`/etc/caddy/Caddyfile`:
```
proxy.flashtrack.io {
  reverse_proxy localhost:8080
}
```
Then `sudo systemctl reload caddy`.

## Step 4 — Run the proxy

```bash
sudo mkdir -p /opt/flashtrack-proxy
# copy server.js and brands.json into /opt/flashtrack-proxy
sudo chmod 600 /opt/flashtrack-proxy/brands.json
```

Generate a secret (keep it; Vercel needs the same value):
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

`/etc/systemd/system/flashtrack-proxy.service`:
```
[Unit]
Description=FlashTrack India Post proxy
After=network.target

[Service]
WorkingDirectory=/opt/flashtrack-proxy
ExecStart=/usr/bin/node server.js
Environment=PORT=8080
Environment=PROXY_SECRET=PASTE_SECRET_HERE
Environment=IP_BASE=https://test.cept.gov.in/beextcustomer
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now flashtrack-proxy
curl https://proxy.flashtrack.io/health      # → {"ok":true}
```

Logs: `journalctl -u flashtrack-proxy -f`

When India Post gives you production, change `IP_BASE` to the production URL and restart.
If login fails with 404, India Post's portal shows the path as `/v1/access/Login` (capital L) —
add `Environment=IP_LOGIN_PATH=/v1/access/Login`.

## Step 5 — Vercel environment variables

FlashTrack project → Settings → Environment Variables:

| Name | Value |
|---|---|
| `TRACK_PROXY_URL` | `https://proxy.flashtrack.io` |
| `TRACK_PROXY_SECRET` | same secret as the VPS |

Add the two new files to the repo, push, and Vercel deploys.

---

## Onboarding a brand (per brand)

1. The brand has an India Post customer ID and portal access.
2. In their India Post portal:
   - **Select Your APIs** → subscribe to **TNT02 (Track articles in bulk)**. Login APIs are auto-selected.
   - **Whitelist my IP Address** → the VPS IP.
   - Get production approval (sandbox first).
3. On the VPS, add them to `brands.json` (no restart needed):
   ```json
   { "728192": { "username": "...", "password": "..." } }
   ```
   The key is their FlashTrack code.
4. In their customer sheet → unhide `_config` → set:
   `tracking_base_url` = `https://flashtrack.io/728192/{id}`
   From now on, every new Tracking ID gets a FlashTrack link. Old rows keep their old link —
   re-enter the tracking ID on any row you want switched.
5. Test: open `https://flashtrack.io/728192/<a real tracking number>`.

## What customers see

- Status: Booked / In transit / Out for delivery / Held at post office / Delivered / Returning to sender
- "Held at post office" shows a warning to collect the parcel (RTO prevention)
- From / To post offices and pincodes, booked date, service type
- Full timeline, newest first, with remarks
- Share button, copy tracking number, link back to the brand's order list, the brand's bottom bar

## Things to check with real data

- India Post timestamps: their sample mixes `Z` (UTC) labels with what look like local times.
  The page shows them as-is. Compare one parcel against indiapost.gov.in and tell me if times are off by 5:30.
- Status words: the page detects "hold", "out for delivery", "booked", RTS flags and `del_status`.
  If real events use other wording, send me one response and I'll adjust.
- Tracking limits: the portal says bulk tracking takes up to 50 IDs; we only ever send 1.
