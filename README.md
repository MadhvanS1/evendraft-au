# Evendraft AU

The Australian desk of [Evendraft](https://evendraft.pages.dev). Live at **https://evendraft-au.pages.dev**.

Two things, both free to use:

- **Tender memos.** Australian businesses send any federal, state or territory tender and get a free bid/no-bid memo:
  the conditions for participation checked, the criteria and their weights, the closing time on their own clock, and a
  plain call. Run from Bengaluru by Madhvan Sharma; drafting uses AI tools and the client approves every claim.
- **Event drafts.** Community groups pick an event (working bee, sausage sizzle, P&C trivia night, street Christmas
  party) and get the invite, the run sheet, the shopping list and a calendar file, timed on their state's clock.

## What's here

| Path | What it is |
| --- | --- |
| `site/index.html` | Home |
| `site/tenders.html` | The official tender portals for every jurisdiction, the notice types, and the free-memo form |
| `site/events.html`, `site/assets/events.js` | Event drafts. Runs in the browser; nothing is sent or stored |
| `site/assets/memo.js` | The memo form. Posts to the Evendraft CRM web app; the message starts with `[Evendraft AU]` |
| `site/_headers` | Security headers for Cloudflare Pages |
| `deploy.sh` | Publishes `site/` to the Cloudflare Pages project `evendraft-au` |

Static HTML, CSS and JavaScript. No build step, no frameworks, no trackers.

## Why there is no list of open tenders

AusTender's terms of use (clauses 5.4 and 5.5) forbid reproducing approach-to-market material, or using it to sell a
service or drive traffic, without written approval from the Commonwealth. NSW's buy.nsw terms also bar commercial
reproduction without permission. So the site links to the official portals instead of copying their notices.

## Deploy

```sh
sh deploy.sh
```
