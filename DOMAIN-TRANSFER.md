# nicholaspjm.com: how the domain moved

Done. This is a record of what happened, not a plan. Verified against live DNS
and the registry on 3 September 2026.

## Where it ended up

- **Registrar: GoDaddy**, transferred 26 August 2026. Expiry moved from
  January 2027 to **12 January 2028**, since a transfer adds a year.
- **DNS: Cloudflare** (`ollie.ns.cloudflare.com`, `pablo.ns.cloudflare.com`).
- **The site** is served from Cloudflare at the domain root, and mirrored on
  GitHub Pages at `nicholaspjm.github.io/nicholaspjm-portfolio`. Every push to
  `main` deploys to both.
- **Mail survived.** The Google Workspace `MX` (`1 SMTP.GOOGLE.com`) and the
  `google-site-verification` TXT are both intact.
- The registry shows GoDaddy's usual locks (delete, renew, transfer and update
  prohibited). Normal after a transfer; they have to be lifted before the
  domain can move again.

## What the earlier plan got wrong

The original steps here said to point the nameservers at Cloudflare first and
transfer the registration afterwards, because Cloudflare Registrar will not
accept a domain that is not already on its DNS.

That was unworkable. Cargo issues an auth code and considers the domain
released, but it does not hand over DNS control, so the nameservers could not
be changed while the domain was still there. Cloudflare Registrar therefore
could not be the destination at all: it needs the nameservers moved first, and
they could not be moved first.

The way through was to ignore Cloudflare Registrar and transfer the
registration to a registrar that accepts an auth code regardless of where the
nameservers point, then set them to Cloudflare afterwards. GoDaddy took it.

## Worth remembering

- **The MX record is the only part that can cause real damage.** Everything
  else is a website being briefly wrong; that is mail not arriving. It is
  intact now, but any future nameserver change has to carry it across, and the
  check is simply to send yourself a message afterwards.
- **The auth code is spent.** It was consumed by the transfer and is useless
  now, so an old copy sitting in an inbox is not a live credential.
- **Do not build the `gh-pages` branch.** It holds the built output and has no
  `package.json`, so any build run against it fails on `npm run build`. This
  bit once: Cloudflare picked it up and the failure looked like a broken
  deploy. Branch control is set to production `main` with non-production
  builds disabled.

## Still outstanding

1. **Google Search Console.** Never set up. Add `nicholaspjm.com` and submit
   `https://nicholaspjm.com/sitemap.xml`. The verification TXT is already on
   the domain, so it should pass immediately. Until then nothing about the
   site's search performance can be measured.
2. **No SPF, DKIM or DMARC.** The domain has never had them, so this is not
   something the move broke, but the zone is on Cloudflare now and adding
   `v=spf1 include:_spf.google.com ~all` is a two-minute job that helps mail
   land where it should.
3. **Cloudflare Web Analytics**, which is why `gaId` in `src/content/site.ts`
   is deliberately empty: free, cookieless, and no consent banner.
