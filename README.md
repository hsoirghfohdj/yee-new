# Class Games — host this folder

This folder is your games library. Upload it once to a free host and it works on
any device — school laptop, home computer, phone — just by opening the link.

## Easiest way: Netlify Drop (no setup, ~1 minute)

1. Go to **https://app.netlify.com/drop**
2. Drag this whole **host** folder onto the page.
3. It gives you a link like `https://something-random.netlify.app`. That's your library.
   (Free Netlify account lets you rename it to something nicer.)

## Or: GitHub Pages (a permanent, free link)

1. Make a free account at github.com and create a new **public** repository, e.g. `class-games`.
2. On the repo page: **Add file → Upload files**, drag everything **inside** this host
   folder in (the `index.html`, the `games` folder, etc.), and commit.
3. Go to **Settings → Pages**, set **Branch: main / root**, Save.
4. After a minute your link is `https://YOUR-USERNAME.github.io/class-games/`.

## Point the dashboard at it

Open the Canvas dashboard bookmark, go to the **Games** tab, click **Set up library**,
and paste your link. It's remembered after that. (Do this once per device, or tell me
the final link and I'll bake it into the bookmark so every device just works.)

## Add more games

These must be **single-file** HTML games (everything inlined — no separate folders of
images/scripts), and only ones whose license allows sharing.

1. Put the game file in the `games` folder, e.g. `games/mygame.html`.
2. Open `index.html`, find the `GAMES` list near the bottom, and add a line:
   `{ id:'mygame', name:'My Game', icon:'🎲', bg:'rgba(124,156,255,.16)', desc:'What it is.', author:'Who made it', license:'MIT' },`
   (The `id` must match the file name without `.html`.)
3. Optional: put the game's license text at `games/mygame.LICENSE.txt` so the License button works.
4. Re-upload.

## What's here

| File | What it is |
| --- | --- |
| `index.html` | the games launcher (the page people open) |
| `games/*.html` | each game, packed into one file |
| `games/*.LICENSE.txt` | each game's license |
| `get-dashboard.html` | install page for the Canvas grades bookmark |

The included games are open source: A Dark Room (MPL-2.0), 2048 (MIT), Hextris (GPL-3.0),
T-Rex Runner (BSD), Tetris (MIT), Clumsy Bird (GPL-3.0).
