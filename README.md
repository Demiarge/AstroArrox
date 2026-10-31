# AstroArrox

Online store for drones, RC planes, robotics and electronics in Bangladesh. Customer accounts with Cash on Delivery checkout, plus a multi-admin panel for orders, products and content with an activity log.

**Stack:** Next.js 16 (App Router, TypeScript) · Tailwind CSS 4 · PostgreSQL + Prisma 7 · zod · zustand · next-themes · lucide-react · react-markdown

---

## Run it locally

**Requirements:** Node.js 24+, PostgreSQL 16+ (developed on 18).

```powershell
# 1. Install dependencies (also generates the Prisma client)
npm install

# 2. Configure environment
Copy-Item .env.example .env
#    then edit .env: DATABASE_URL, ADMIN_EMAIL, ADMIN_PASSWORD, SITE_URL

# 3. Create the database (once). psql isn't on PATH on Windows, so use the full path:
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -c "CREATE DATABASE astroarrox"

# 4. Create the tables and load the starting data
npm run db:migrate
npm run db:seed

# 5. Start the dev server
npm run dev
```

- Storefront: http://localhost:3000 (anyone can browse and fill a cart; placing an order needs an account from `/signup` or `/login`)
- Admin: http://localhost:3000/admin, log in with `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `.env` (the super admin that `db:seed` created)

To try the production build locally: `npm run build` then `npm start`.

### Environment variables

| Variable | What it's for |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string. URL-encode special characters in the password. |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | The super admin, created by `npm run db:seed` or `npm run admin:seed` only while no super admin exists. Logins only ever check the database, so once it exists you can remove these two lines. |
| `SITE_URL` | Public URL (no trailing slash). Used for the sitemap, Open Graph tags and structured data. |
| `TRUSTED_PROXY_HOPS` | Number of reverse proxies in front of the app (default `0`, for your own PC only). Rate limits read the client IP your own proxy appended to `X-Forwarded-For`. Online, the app must run behind a proxy (nginx, a load balancer, your host's edge) with this set, usually to `1`: exposing `next start` directly lets visitors fake their IP with that header and dodge every IP limit. In production with `0`, the app logs a warning. |

### Useful scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development server with hot reload |
| `npm run build` / `npm start` | Production build / serve it |
| `npm run typecheck` / `npm run lint` | TypeScript and ESLint checks |
| `npm run db:migrate` | Apply schema changes (creates a migration when `schema.prisma` changed) |
| `npm run db:seed` | Load starting data (safe to re-run: only adds what's missing) |
| `npm run db:studio` | Browse and edit data in Prisma Studio |
| `npm run db:reset` | ⚠️ Wipe the database and re-apply migrations (then run `db:seed`) |
| `npm run admin:seed` | Create the super admin from `.env` if there isn't one yet (touches nothing else) |
| `npm run admin:create -- email` | Add an admin, or reset an admin's password, from the command line |

---

## Admins

- **Adding and removing admins:** in the panel at **Admin → Admins**. Any admin can add an admin (name, email, password) or delete another admin. Deleting someone signs them out immediately.
- **The super admin** has the same permissions as everyone else, with two differences: nobody can delete it, and the app has no way to make or unmake a super admin. Both rules are checked on the server. It's created from `ADMIN_EMAIL` / `ADMIN_PASSWORD` by `npm run admin:seed` (or `db:seed`).
- **Passwords:** each admin changes their own at **Admin → Change password**. A forgotten password is reset from the command line, since the site doesn't send emails yet:

  ```powershell
  npm run admin:create -- friend@example.com
  ```

  You'll be asked for a password (at least 10 characters). If the email already exists, its password is replaced, all of its sessions are signed out and login lockouts are lifted. If it doesn't exist, you're also asked for a name and a regular admin is created.

## Activity log

**Admin → Activity log** (`/admin/logs`) lists every change made in the admin panel, newest first, and can be filtered by admin. That covers order status changes, notes, products, categories, pages, FAQ, messages, subscribers, settings, and adding or deleting admins. Logins and logouts aren't logged.

Entries are permanent. There is no way to edit or delete them in the app, and a PostgreSQL trigger rejects `UPDATE`, `DELETE` and `TRUNCATE` on the `AdminLog` table whatever tool you connect with. Deleting an admin keeps their entries, because the log stores their id and email as plain values.

To log a new admin feature, add its action name to `ADMIN_ACTIONS` in `src/lib/admin-log.ts` and call `logAdminAction(...)` inside the same `db.$transaction` as the change (instructions at the top of that file).

---

## Backing up

Two things hold data: the **PostgreSQL database** and the **`uploads/` folder** (product, category and logo images).

```powershell
# Database → a single compressed file
& "C:\Program Files\PostgreSQL\18\bin\pg_dump.exe" -U postgres -h localhost -d astroarrox -F c -f "astroarrox-$(Get-Date -Format yyyy-MM-dd).dump"

# Images
Compress-Archive -Path uploads -DestinationPath "uploads-$(Get-Date -Format yyyy-MM-dd).zip"
```

**Restore** (this overwrites the current data):

```powershell
& "C:\Program Files\PostgreSQL\18\bin\pg_restore.exe" -U postgres -h localhost -d astroarrox --clean --if-exists "astroarrox-2026-10-22.dump"
Expand-Archive "uploads-2026-10-22.zip" -DestinationPath . -Force
```

Keep backups somewhere other than this computer (cloud drive, external disk). A daily database dump is a sensible minimum once the store is live.

---

## Project structure

```
prisma/
  schema.prisma        Data model (≈ Django models.py)
  migrations/          SQL history, applied by `db:migrate`
  seed.ts              Starting catalogue, settings, FAQ and pages
  super-admin.ts       Creates the super admin from .env (used by both seed commands)
scripts/
  create-admin.ts      Add an admin / reset a password
  seed-super-admin.ts  `npm run admin:seed`
uploads/               Uploaded images (git-ignored; back this up)
src/
  app/
    (store)/           Storefront pages (the group name doesn't appear in URLs)
    admin/             Admin panel: login + (panel)/ pages behind the session check
    uploads/[...path]/ Serves files from uploads/
    sitemap.ts, robots.ts, opengraph-image.tsx, icon.png
  components/          UI: ui/ (buttons, badges…), layout/, product/, cart/, admin/…
  lib/
    data/              Cached read queries (catalog, settings, content, orders)
    actions/           Server Actions (checkout, tracking, contact, newsletter, admin/*)
    auth.ts            Admin sessions + requireAdmin()
    user-auth.ts       Customer sessions + requireUser() (separate cookie and table)
    admin-log.ts       logAdminAction() and the list of logged actions
    storage.ts         The only file that touches image storage
    rate-limit.ts      Database-backed rate limiting
  proxy.ts             Refuses posts over 1 MB (except from signed-in admins); redirects /admin/*, /account and /checkout to their login pages when there's no session cookie, and /shop?category=3d-printing to /3d-printing
docs/
  PROJECT_BRIEF.md     Original specification
  TODO-confirm.md      Business facts still to confirm with the owner
```

## How things work (short version)

- **Caching.** Storefront data (products, categories, settings, pages) is cached with `"use cache"` and tagged. Admin saves call `updateTag(...)`, so changes appear on the site immediately. Orders and admin pages are never cached.
- **Prices are never trusted from the browser.** The cart lives in localStorage for convenience, but checkout re-reads every price and stock level inside a database transaction. Stock is decremented with a guard so two simultaneous orders can't oversell.
- **Stock held by unconfirmed orders is capped.** Pending orders keep their stock until an admin confirms or cancels them, so one account can have at most 3 pending orders with 20 items between them, and at most 20 of one product per order (`src/lib/cart/limits.ts`). Fake cash-on-delivery orders can't tie up the whole stock from one account.
- **Editing a product never undoes sales.** The edit form remembers the stock it was opened with: Stock is only written if you changed it, and the save is refused if orders changed it while the page was open.
- **Order privacy.** `/order/AA-XXXXXX` shows the full order (items, address, phone, totals, status notes) only to the logged-in customer account that placed it. Anyone else, whether logged out or on another account, sees nothing about the order (not even whether it exists), just links to log in or to `/track-order`. The track form shows the status timeline to anyone who enters the reference plus the order's phone number or email.
- **Admin security.** bcrypt password hashes, random session tokens stored only as SHA-256 hashes, 7-day httpOnly cookies, and login limits of 5 attempts per 15 minutes per email + IP and 20 per email overall (`npm run admin:create` lifts a lockout). Attempts already refused by the per-IP limit don't count toward the per-email one, so a single connection can't lock the real admin out. Every admin page, Server Action and Route Handler calls `requireAdmin()` itself; the proxy redirect is only a convenience.
- **Customer accounts are fully separate from admins.** They have their own `User` and `UserSession` tables, their own `aa_user` cookie (30 days) and their own login limits. `requireAdmin()` only looks in the admin `Session` table, so a customer session can never open `/admin`.
- **Orders need an account.** `/checkout` redirects to `/login` (and back), and `placeOrder` itself refuses requests without a valid customer session, so the rule can't be skipped. Each order stores its `userId`. Customers see their orders at `/account` and can open them on any device while logged in. Orders placed before this rule have no account and show as "guest" in the admin. Customers change their password at `/account`, admins at **Admin → Change password**.
- **Rate limits** (checkout, tracking, contact, newsletter, login) are stored in the `RateLimit` table, so they survive restarts and work across several server instances.
- **3D Printing has its own page.** `/3d-printing` lists the active products of the 3D Printing category (12 per page) and explains custom prints, which are quoted on WhatsApp. That category is left out of every customer-facing category list, `/shop?category=3d-printing` redirects to the page, and its products still appear in All Products and search. Admins add ready-made prints as normal products in that category. The category can't be deleted and its slug can't be changed, because the page finds its products by that slug (`src/lib/3d-printing.ts`). The custom-print materials, turnaround and price note are placeholders until the owner confirms them (`docs/TODO-confirm.md`, items 15–17).
- **Text placeholders.** In policy pages, FAQ answers and the promo bar, `{{deliveryTime}}`, `{{insideDhakaFee}}`, `{{outsideDhakaFee}}` and `{{freeShippingThreshold}}` are filled in from Settings, so fees are only ever set in one place.
- **Images.** Uploads are checked by their actual bytes (JPG/PNG/WebP only, max 5 MB) and saved with random names in `uploads/`. To move to S3/R2, rewrite `src/lib/storage.ts` and add the bucket to `images.remotePatterns` in `next.config.ts`.

## Before going live

- Set `SITE_URL` to the real domain, and use a strong super-admin password.
- Run the app behind a reverse proxy and set `TRUSTED_PROXY_HOPS` (see the table above).
- Prefer an admin login email that isn't shown publicly on the site (the store contact email in Settings is in the footer).
- Move images to cloud storage, because most hosts have no persistent disk (see above).
- Set up automatic database backups.
- Go through `docs/TODO-confirm.md` with the store owner.
