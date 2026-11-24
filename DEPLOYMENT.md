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
5. Catalog data comes from `src/data/offerings.json`. Google Sheets is not used
   to load or refresh offerings; it may be considered as a future integration.

Catalog project routes are generated from the unique values in `page` across
`src/data/offerings.json` items. Each item's `categoryId` groups it under
Included or Optional on every project selected by its `page` value. Page IDs
map to localized URL segments in `src/config/routeTranslations.ts`. The first
Included item supplies that project's localized title and description.

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
- `TURNSTILE_SECRET` - the Turnstile widget secret. Add it as a Worker secret
  in the Cloudflare dashboard; never put it in `wrangler.toml` or client code.

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

## Catalog Data and Pricing

The catalog is built from `src/data/offerings.json`. The site does not fetch or
refresh offerings from Google Sheets, and no Sheets credentials or scheduled
checks are used. A Sheets integration may be considered in the future, but it
would require a separate implementation and deployment workflow.

Prices are also not displayed. Restoring price support is a separate change
that must update the schema, local data, CMS, catalog UI, and deployment checks
together.

The API token must be able to deploy Workers.

## Local Commands

```sh
npm run build
npx wrangler dev
npm run cf:deploy
```

`npm run cf:deploy` builds Astro and deploys the Worker with static assets.
