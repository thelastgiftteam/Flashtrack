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

Make random text on any computer: open a terminal and run `openssl rand -hex 32`.

Then Deployments → latest → **Redeploy**.

## 3. First login

- Team: open `flashtrack.io/admin`, log in with `ADMIN_EMAIL` / `ADMIN_PASSWORD`.
  That creates you as the first admin. Add your team under **Team**.
- Brands sign up themselves at `flashtrack.io/signup` (14-day free trial),
  or you add them under **Brands → Add brand** and send them the login.

## 4. Move WT Frames off Google Sheets

1. Admin → Brands → Add brand. Name: WT Frames. Link code: `247235` (keeps the same link).
2. Open the brand → **Add shipments** → upload the latest India Post Excel file.
3. Open `flashtrack.io/247235`. It now reads from the database.
   The Google Sheet is no longer used for this brand.

## How it fits together

- `flashtrack.io/<code>`: customer page. Reads the database; falls back to the
  Google Sheets HQ for brands not in the database yet.
- `flashtrack.io/app`: brand dashboard (home, add shipments, shipments, page, plan, account).
- `flashtrack.io/admin`: team console (today, brands, payments, team).
- The customer page is cached and refreshed the moment a brand uploads or changes settings.
- Shipments older than 60 days are deleted automatically. Pages show the last 30 days.
- Pages turn off by themselves 3 days after the paid-until date (or the 14-day trial).
  Customers then see "this store's tracking page is paused".

## Not needed any more

The DigitalOcean droplet (`proxy.flashtrack.io`) only existed for India Post's API.
Nothing in this system uses it. Delete it to stop the ~$4/month charge, unless
India Post approves the API later.
