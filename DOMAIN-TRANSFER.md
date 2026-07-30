# Moving nicholaspjm.com from Cargo to Cloudflare

Checked against the registry on 30 July 2026.

## What the registry says

- **Registrar:** eNom (Cargo resells through them).
- **Status: `active`, with no transfer lock.** Nothing is holding the domain.
- **Registered 12 Jan 2026, expires 12 Jan 2027.** Well past the 60 day
  minimum age, so it is transferable now. A transfer adds a year, pushing
  expiry to Jan 2028.
- DNS is still on Cargo's nameservers (`NS1.CARGO.SITE`, `NS2.CARGO.SITE`),
  so the old Cargo site is still what loads at the domain.
- **Google Workspace email is on this domain** (MX points to
  `SMTP.GOOGLE.com`). This is the one real risk: move nameservers without
  recreating that record and `contact@nicholaspjm.com` stops receiving mail.

## Two separate jobs

Only one of them needs the auth code:

- **Pointing the domain** makes the new site live at nicholaspjm.com. Free,
  no auth code, minutes of work.
- **Transferring the registration** is what the auth code is for. Roughly
  US$11, moves billing off Cargo, can be done right after or weeks later.

So the site can go live first, and the transfer can be a separate errand.

## Part A: get the site live on the domain

1. Cloudflare dashboard, **Add a site**, enter `nicholaspjm.com`, choose the
   Free plan.
2. Cloudflare scans the existing DNS. **Stop here and check the imported list
   contains:**
   - `MX` record: `1 SMTP.GOOGLE.com` (the email, add manually if missing)
   - `TXT`: `google-site-verification=HrKANtZj7-GiQ1KadP9jU9iMQk_LLU5XpWQQN7tVynY`
   - The `cargo-domain=purchased` TXT and the two Cargo A records
     (`3.234.189.133`, `3.215.100.79`) can be deleted, since the Worker
     replaces them.
3. Copy the two Cloudflare nameservers it gives.
4. In **Cargo's domain settings**, replace `NS1.CARGO.SITE` and
   `NS2.CARGO.SITE` with those two.
5. Back in Cloudflare click **Check nameservers** and wait for the zone to
   read **Active** (usually minutes, up to 24 hours).
6. Open the **nicholaspjm-portfolio Worker**, then **Settings, Domains &
   Routes, Add, Custom domain**, and enter `nicholaspjm.com`. Add
   `www.nicholaspjm.com` too for both. Cloudflare creates the DNS record and
   the HTTPS certificate itself.
7. Load `https://nicholaspjm.com`. The new site should be there.

## Part B: move the registration (uses the auth code)

8. Only once the zone shows **Active**, go to **Domain Registration, Transfer
   Domains**. Cloudflare requires the domain to be on its DNS first, which is
   why Part A comes first.
9. Select `nicholaspjm.com`, paste the auth code from Cargo's email, and pay.
   Cloudflare charges at cost with no markup, and the year is added to the
   existing expiry.
10. Completion ranges from about five minutes to a few days. After that Cargo
    has no involvement at all.

## Cautions

- **Keep the Cargo plan active until Part A is confirmed live.** DNS is still
  managed there until the transfer completes, and the moment nameservers flip
  the old Cargo site goes dark at that address.
- **Test email** right after the nameserver switch by sending yourself a
  message. The MX record is the one thing that would cause real damage if it
  went missing.
- The auth code is a credential. It gets consumed by the transfer and becomes
  useless afterwards, but Cargo can regenerate it if you would rather not have
  the emailed one sitting around.
- If Cloudflare rejects the transfer citing a 60 day rule (the registry logged
  a change on 21 July, probably when the code was generated), Part A still
  works on its own. The site would be live on the domain and Part B can be
  retried later.

## Nothing to change in the code

The Cloudflare build already targets a root domain with no
`/nicholaspjm-portfolio` prefix, and `src/content/site.ts` already declares
`https://nicholaspjm.com`. Google Analytics is independent of all this: paste
the `G-XXXXXXXXXX` measurement ID into `gaId` in that same file whenever you
like, before or after the domain move.

## Reference

- <https://developers.cloudflare.com/registrar/get-started/transfer-domain-to-cloudflare/>
- <https://developers.cloudflare.com/registrar/faq/>
- <https://developers.cloudflare.com/dns/nameservers/update-nameservers/>
- <https://developers.cloudflare.com/registrar/troubleshooting/>
