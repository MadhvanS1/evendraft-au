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
| `site/index.html` | Home: the example memo as a mosaic with live Canberra and Bengaluru clocks, the closing-time line (type any AusTender closing time, see it on every Australian clock with a back-plan), how it works, "every line has a source", who runs it, the price, questions and the memo form |
| `site/tenders.html` | The nine official tender portals, the words in the notices, and the memo form |
| `site/events.html` | Event drafts: invite, run sheet, shopping list and calendar file, on each state's clock. Runs in the browser; nothing is sent or stored |
| `site/assets/site.css` | The Evendraft design system (Newsreader and Source Sans 3; stone, paper, ink, deep green) set as colour chapters |
| `site/assets/site.js` | Header colour by chapter, entrances, live clocks, the closing-time line, the stages, the memo reader, the film |
| `site/assets/memo.js` | The memo form. Posts to the Evendraft CRM web app; the message starts with `[Evendraft AU]` |
| `site/assets/events.js` | The event-drafts tool |
| `site/assets/fonts`, `img`, `media` | Self-hosted fonts, resized pictures and the Parliament House time-lapse |
| `site/_headers` | Security headers for Cloudflare Pages |
| `deploy.sh` | Publishes `site/` to the Cloudflare Pages project `evendraft-au` |
| `.taste-skill/` | Design notes and the dealt direction |

Static HTML, CSS and JavaScript. No build step, no frameworks, no trackers.

## Pictures

Found in open collections, credited in each page's footer and listed in `assets/credits.json`: Griffin's 1911–12 Canberra
panorama (public domain), photographs of Parliament House and Old Parliament House by Dietmar Rabich (CC BY-SA 4.0),
democracy sausages by Democracysausage and Aliceinthealice (CC BY-SA 4.0), a time-lapse of Parliament House by Jared
Drennan (CC BY 3.0), and a plate from von Mueller's Eucalyptographia (1879, no known copyright restrictions). The example
memo's tender, buyer and supplier are invented.

## Why there is no list of open tenders

AusTender's terms of use (clauses 5.4 and 5.5) forbid reproducing approach-to-market material, or using it to sell a
service or drive traffic, without written approval from the Commonwealth. NSW's buy.nsw terms also bar commercial
reproduction without permission. So the site links to the official portals instead of copying their notices.

## Deploy

```sh
sh deploy.sh
```
