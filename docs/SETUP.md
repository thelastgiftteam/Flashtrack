# FlashTrack: going live with the database

Everything runs on Vercel (website, brand dashboard, admin console). Data lives
in a free Supabase Postgres database. Brands still on Google Sheets keep working
until you move them.

## 1. Create the database (5 minutes, free)

1. Sign up at supabase.com with the FlashTrack email. New project, region **Mumbai (ap-south-1)**.
   Save the database password it shows you.
2. Left menu → **SQL Editor** → New query. Paste everything in `db/schema.sql` → **Run**.
   It's safe to run again later.
3. Top of the page → **Connect** → **Transaction pooler** → copy the URI
   (it ends in `:6543/postgres`). Put your database password in place of `[YOUR-PASSWORD]`.

Free plan notes: 500 MB (about 2–3 million shipments). A free project is paused
after 7 days with no activity. Before launch, either open it once a week or move
to the paid plan.

## 2. Add settings in Vercel

Vercel → project → Settings → Environment Variables. Add:

| Name | Value |
|---|---|
| `DATABASE_URL` | the URI from step 1.3 |
| `SESSION_SECRET` | any long random text (keeps logins safe) |
| `SECRETS_KEY` | another long random text. **Never change or lose it**: saved India Post logins can't be read without it |
| `ADMIN_EMAIL` | your email, for the first admin login |
| `ADMIN_PASSWORD` | a strong password, for the first admin login |
| `NEXT_PUBLIC_SITE_URL` | `https://flashtrack.io` |
| `GEMINI_API_KEY` | already set if `/ocr` works. Needed for photo uploads |
| `NEXT_PUBLIC_PAY_LINK` | optional: your Razorpay Payment Page link. Brands see a “Pay now” button on their Plan page |

Make random text on any computer: open a terminal and run `openssl rand -hex 32`.

Then Deployments → latest → **Redeploy**.

## 3. First login

- Team: open `flashtrack.io/admin`, log in with `ADMIN_EMAIL` / `ADMIN_PASSWORD`.
  That creates you as the first admin. Add your team under **Team**.
- Brands sign up themselves at `flashtrack.io/signup` (14-day free trial),
  or you add them under **Brands → Add brand** and send them the login.

## Updating the database later

When an update says "run the schema again", open Supabase → SQL Editor → paste
`db/schema.sql` → Run. It only adds what's missing; existing data is untouched.

Logins lock for 15 minutes after 8 wrong passwords for a brand (5 for the team),
and one network can create at most 5 brands an hour.

## 4. Move WT Frames off Google Sheets

1. Admin → Brands → Add brand. Name: WT Frames. Link code: `247235` (keeps the same link).
2. Open the brand → **Add shipments** → upload the latest India Post Excel file.
3. Open `flashtrack.io/247235`. It reads from the database.

The Google Sheets system has been removed. You can delete the HQ sheet, the brand
sheets, their Apps Scripts, and the `HQ_ENDPOINT`, `CSM_*`, `REVALIDATE_SECRET`,
`TRACK_PROXY_*` settings in Vercel.

## How it fits together

- `flashtrack.io/<code>`: customer page, read from the database.
- `flashtrack.io/app`: brand dashboard (home, add shipments, shipments, page, plan, account).
- `flashtrack.io/admin`: team console (today, brands, payments, team).
- The customer page is cached and refreshed the moment a brand uploads or changes settings.
- Customer pages show the last 30 days. Older shipments move to **Past shipments** (admin and brand dashboard), are never sent to customers, and are deleted after 180 days. Change `SHOW_DAYS` / `KEEP_DAYS` in `lib/brands.js`.
- Pages turn off by themselves 3 days after the paid-until date (or the 14-day trial).
  Customers then see "this store's tracking page is paused".

## Payments and renewals

Payments are collected and recorded in Razorpay only. FlashTrack just keeps each
brand's paid-until date:

1. The 🔔 bell in the admin console lists, for each manager's brands: renewals in
   the next 7 days, overdue payments, pages that turned off, trials ending, and
   Pro uploads not done today. Admins see every brand.
2. When a brand pays in Razorpay, open the brand → **Renewal** → tap **+1 month**
   (or 3, 6, 12). The page stays on and the renewal is logged on the brand.

## Not needed any more

The DigitalOcean droplet (`proxy.flashtrack.io`) only existed for India Post's API.
Nothing in this system uses it. Delete it to stop the ~$4/month charge, unless
India Post approves the API later.
