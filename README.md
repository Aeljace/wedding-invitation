# Wedding Invitation Website — GitHub + Cloudflare Pages

A polished, responsive wedding invitation template built with plain HTML, CSS and JavaScript. It is intentionally framework-free so each client site is easy to customize and inexpensive to host.

## What is included

- Mobile-responsive wedding landing page
- Couple names, wedding date, city and invitation copy
- Live countdown
- Ceremony and reception cards
- Wedding-day timeline
- Dress-code palette
- Photo gallery
- Wedding party section
- FAQ accordion
- RSVP form
- Optional Cloudflare D1 RSVP storage
- Cloudflare security headers
- No build system or npm dependencies required

## Fastest customization

Open `config.js` and change the couple names, wedding date, venue, story, gallery image URLs, wedding party, dress code, FAQs and RSVP deadline.

For each new client, duplicate this repository and only edit `config.js` plus any visual styling you want to personalize.

## Preview locally

Static preview only:

```bash
python -m http.server 8080
```

Then open `http://localhost:8080`.

The RSVP form will use demo/local storage until Cloudflare D1 is connected.

## Put it on GitHub

Create a new empty GitHub repository, for example:

`wedding-invitation-demo`

Then from this project folder:

```bash
git init
git add .
git commit -m "Initial wedding invitation template"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/wedding-invitation-demo.git
git push -u origin main
```

## Deploy free with Cloudflare Pages

1. Sign in to Cloudflare.
2. Go to **Workers & Pages**.
3. Choose **Create application** > **Pages** > **Import an existing Git repository**.
4. Connect GitHub and select the wedding repository.
5. Production branch: `main`.
6. Build command: `exit 0`.
7. Build output directory: `.`
8. Deploy.

Cloudflare will give you a free `*.pages.dev` website address and automatically redeploy after future pushes to GitHub.

## Enable live RSVP storage with Cloudflare D1

The site already includes `functions/api/rsvp.js` and `schema.sql`.

### 1. Create a D1 database

In Cloudflare, create a D1 database named something like:

`wedding-rsvp`

### 2. Run the schema

Use the D1 console in Cloudflare and run the contents of `schema.sql`, or use Wrangler:

```bash
npx wrangler d1 execute wedding-rsvp --remote --file=./schema.sql
```

### 3. Bind the database to the Pages project

In your Pages project:

**Settings > Bindings > Add > D1 database binding**

Use this variable name exactly:

`DB`

Select the `wedding-rsvp` database and redeploy the project.

After that, RSVP submissions will be written to the `rsvps` table.

## View RSVP responses

Open the D1 database in Cloudflare and run:

```sql
SELECT * FROM rsvps ORDER BY created_at DESC;
```

Or get a quick attendance summary:

```sql
SELECT attendance, COUNT(*) AS responses, SUM(guests) AS guests
FROM rsvps
GROUP BY attendance;
```

## Recommended workflow for a wedding invitation service

- Keep this repository as the master template.
- Create one new repository per couple.
- Replace the sample content in `config.js`.
- Connect that repository to a new Cloudflare Pages project.
- Add a custom domain only if the client purchases one.
- Use a separate D1 database per client if RSVP privacy and clean reporting are important.

## Notes

- The sample gallery uses remote Unsplash image URLs. Replace them with the couple's own optimized WebP/AVIF photos for production.
- The Cloudflare Pages Function gracefully falls back to demo mode until a D1 binding named `DB` exists.
- Keep personal guest information private and only collect fields the couple actually needs.
