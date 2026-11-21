# Deployment

This project should be deployed as one Cloudflare Worker with Static Assets.

Do not deploy this repository as a Cloudflare Pages project. The contact form
uses Cloudflare's `send_email` binding, and that binding belongs to Workers, not
Pages Functions.

## How It Works

1. Astro builds the static site into `dist`.
2. `worker/index.js` handles `/api/contact`.
3. The same Worker serves all static assets from `dist` through the `ASSETS`
   binding.
4. The contact form sends email through Cloudflare Email Routing's `EMAIL`
   binding.
5. The scheduled Google Sheets integration is disabled. Deployments use
   `src/data/offerings.json` as the local offerings source.

## Cloudflare Worker Settings

The source of truth is `wrangler.toml`.

- Worker name: `eko-ciscenje`
- Build command: `npm run build`
- Deploy command: `npx wrangler deploy`
- Static assets directory: `dist`
- Worker entrypoint: `worker/index.js`

The Worker needs these environment variables:

- `CONTACT_TO_EMAIL` - the verified inbox that receives contact messages.
- `CONTACT_FROM_EMAIL` - the sender on your Email Routing domain, for example
  `kontakt@eko-ciscenje.com`.
- `TURNSTILE_HOSTNAMES` - comma-separated allowed hostnames returned by
  Turnstile Siteverify. The current Wrangler value covers `eko-ciscenje.com`
  and `eko-ciscenje.com`; update it if the Worker serves other hostnames.
- `TURNSTILE_SECRET` - the private Turnstile secret, configured as a Worker
  secret (not in `wrangler.toml` or source control).

The contact pages currently use Cloudflare's public Turnstile test sitekey.
Replace the `data-sitekey` value in `src/pages/contact.astro` and
`src/pages/en/contact.astro` with the production sitekey when ready. The browser
posts the widget token to `/api/contact`; the Worker verifies it with Siteverify
and only accepts responses whose hostname exactly matches
`TURNSTILE_HOSTNAMES`. Missing configuration, rejected tokens, and verification
failures all stop form processing.

Set the secret in each Cloudflare environment that runs the Worker:

```sh
npx wrangler secret put TURNSTILE_SECRET
```

Set `TURNSTILE_HOSTNAMES` in `[vars]` in `wrangler.toml` or as a Worker
environment variable in the Cloudflare dashboard. These must be runtime Worker
settings; GitHub Actions secrets and variables only provide deployment-time
credentials unless the workflow explicitly passes them to the Worker.

## Contact Form Email

Enable Cloudflare Email Routing for the domain first. The recipient in
`CONTACT_TO_EMAIL` must be a verified Email Routing destination. The sender in
`CONTACT_FROM_EMAIL` must be an address on the domain where Email Routing is
active.

`wrangler.toml` defines:

```toml
[[send_email]]
name = "EMAIL"
```

The binding is intentionally unrestricted in config so the recipient can be set
with `CONTACT_TO_EMAIL` per environment. Cloudflare still only allows delivery to
verified Email Routing destinations.

## GitHub Settings

Set these repository variables or secrets:

- `CLOUDFLARE_API_TOKEN` as a secret
- `CLOUDFLARE_ACCOUNT_ID` as a secret

These deploy credentials do not configure `TURNSTILE_SECRET` or
`TURNSTILE_HOSTNAMES` on the running Worker.

## Pricing and Google Sheets (disabled)

Pricing display and Google Sheets synchronization are intentionally disabled.
The active implementation reads `src/data/offerings.json`, ignores all sheet
and environment configuration, and has no price markup in the catalog.

To re-enable Google Sheets:

1. Set `GOOGLE_SHEETS_ENABLED = true` in `src/googleSheets.ts`.
2. Restore the CSV fetch/parser and set `SPREADSHEET_ID` and optionally
   `GOOGLE_SHEETS_GID` in the deployment environment.
3. Restore the Google Sheet change check in `scripts/deploy-check.mjs`.
4. Add and review the required sheet columns and fallback behavior.

To re-enable prices, do it as a separate change:

1. Set `PRICE_DISPLAY_ENABLED = true` in `src/googleSheets.ts`.
2. Restore price fields in `src/schemas.ts`, `src/data/offerings.json`,
   `public/admin/config.yml`, and `src/components/Catalog/CatalogSection.astro`.
3. Re-enable deployment validation and change hashing only after the schema,
   CMS, and UI are consistent.

The API token must be able to deploy Workers.

## Local Commands

```sh
npm run build
npx wrangler dev
npm run cf:deploy
```

`npm run cf:deploy` builds Astro and deploys the Worker with static assets.
