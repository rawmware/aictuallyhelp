# aictuallyhelp

AI ACTUALLY HELP IS A PASSION PROJECT I CREATED WITH HOPES OF IT BEING A PLATFORM TO CONNECT WITH HOMELESS SHELTERS, YOUTH DETENTION CENTERS, ETC. PEOPLE WHO HAVE COMPLICATED BACKGROUNDS AND STORIES, AND GIVE THEM A CHANCE TO USE AI TO RETELL THEIR STORIES, THEIR WAY.

## What's on the site

| Page | What it does |
| --- | --- |
| `index.html` | Home: a rotating flip book of prompts, six starter prompts, the full 100+ prompt library (use case → copyable prompt), plain-English explainers with "ask your AI" prompts, source reading list, who's behind this |
| `start.html` | Start from zero: get online, make a free email, open an AI app, first message, save your stuff, stay safe. Progress is saved on the device |
| `prompts.html` | The prompt library plus a fill-in-the-blanks prompt builder |
| `lab.html` | Hands-on demos: live markdown editor, files & folders explorer, the markdown handoff, code blocks, "what am I missing?" |
| `cheatsheets.html` | Printable one-page sheets (letter size) and a fill-in workshop flyer |
| `workshops.html` | For nonprofits: session agenda, FAQ, about, and a request form that writes the email for you |

## Run it

Plain static HTML, CSS and JS. No build step. Open `index.html`, or serve the folder:

```
python3 -m http.server 8000
```

Shared code lives in `assets/` (`site.css`, `site.js`, `prompts.js` = prompt library data, `library.js` = library + flip book, `lab.js` = demos).
To add a prompt, add one line to `assets/prompts.js`: `[category, use case, prompt, optional tip]`.
The contact address is set in one place: the `CONTACT` constant at the bottom of `workshops.html`.
