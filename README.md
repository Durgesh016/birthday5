# 🎂 A Birthday Surprise

A three-page birthday website — animated welcome, memory gallery, and a video-gated
final letter. No build step, no internet required (except web fonts), no dependencies.

**To see it:** double-click `index.html`.

---

## Add your own stuff — 3 steps

### 1. Drop your files in

| Put here | What goes in it |
|---|---|
| `assets/photos/` | Your photos — `photo-1.jpg`, `photo-2.jpg`, … |
| `assets/videos/` | Your videos — `video-1.mp4`, and `surprise.mp4` for the final page |
| `assets/music/`  | One background song — `song.mp3` |

Use **.jpg / .png / .webp** for photos and **.mp4 (H.264)** for videos — those play
everywhere. A `.mov` from an iPhone often won't play in Chrome; convert it to `.mp4` first.

### 2. Edit `js/media.js`

That one file holds everything personal:

* `name` — the name under the big heading
* `wishes` — the lines that rotate on page 1 (add as many as you want)
* `gallery` — every photo/video card on page 2
* `finalVideo` — the special video that unlocks page 3
* `letter` — the birthday letter text
* `letterPhotos` — the polaroids under the letter
* `music` — path to your song (set to `null` to remove the music button)
* `heroCharacter` — path to a character cut-out for the hero (see below)
* `floralFrame` / `fallingPetals` / `showBalloons` / `bokeh` / `fairyLights` /
  `ribbonCurls` / `heartParticles` — page-1 decoration toggles

Adding a photo is just one more line:

```js
{ type: "photo", src: "assets/photos/photo-10.jpg", caption: "That night", date: "December" },
```

And a video:

```js
{ type: "video", src: "assets/videos/video-4.mp4", poster: "assets/photos/photo-10.jpg",
  caption: "Watch this one", date: "Play me" },
```

`poster` is optional — without it the video's own first frame is used as the thumbnail.

### 3. Refresh the page

Any file you haven't added yet shows a soft gradient placeholder with its filename,
so the site never looks broken while you're still collecting photos.

---

## How it behaves

**Page 1 — Welcome**
Letter-by-letter "Happy Birthday" animation, wishes that cross-fade every ~4 s,
a rose-and-petal border framing the corners, rose petals drifting down the screen,
confetti, sparkles, drifting gradient background, and a music toggle (top-left).
Browsers block autoplay, so the song starts on the first click or key press.

### Using a picture as the page-1 background

Save any wide picture as **`assets/photos/hero.jpg`** and it becomes the hero
background automatically — that path is already set in `js/media.js`. If the file
isn't there, the drawn floral hero shows instead; nothing breaks either way.

The picture gets three passes so it fits the palette instead of fighting it: a
hue nudge on the image, a soft-light colour wash, then a gradient scrim that
turns the left ~40% into a clean pink field for the message. A loud background —
a solid orange promo still, say — comes out rosy, and the subject stays sharp on
the right.

Two knobs in `js/media.js` if the crop isn't landing well:

```js
heroBackgroundPosition: "72% center",      // desktop — first value is horizontal
heroBackgroundPositionMobile: "68% 28%",   // phones show it as a band up top
```

Higher first value keeps more of the picture's right side in frame. If the
subject still sits too far left and collides with the headline, nudge
`--shift` / `--zoom` on `.hero-photo__img` in `css/styles.css` (they slide and
scale the image; a 16:9 picture on a 16:10 screen barely crops on its own).

Portrait phones show the picture as a band across the top with the message
underneath, since a 16:9 still cropped to a phone screen loses the subject.

### Putting a cut-out character in the hero

This is the alternative to the background photo above — use one or the other.
If `heroBackground` is set, it wins and this is skipped.

Save your character art as a **PNG with a transparent background** into
`assets/photos/`, then point `heroCharacter` at it in `js/media.js`:

```js
heroCharacter: "assets/photos/characters.png",
```

The hero then splits — message and button on the left, characters on the right
with a warm glow behind them and a slow float. On phones it stacks: art on top,
message underneath. Leave it `null` (the default) and the page stays centred.

Two things matter for it to look right: the background must be **transparent**
(a JPG will show as a rectangle), and the art should be **cropped tight** to the
characters, with no large empty margin baked in.

The flowers are drawn as SVG in `index.html` (`art-rose`, `art-petal`,
`art-sprig`, `art-heart`, `art-curl`) — no image files, so nothing to download
and nothing to go missing.
Their placement is the `GARDEN` list near the top of `js/main.js`: each entry is
`{x, y, size, rot, tone, blur, op}` where `x`/`y` are percentages of the screen,
`size` is in `vmin` (so it scales with the display), and `tone` is `Pink`,
`Lilac` or `Cream`. Entries marked `minor: 1` are dropped on phones to keep the
text clear. Petal count and speed live in `buildPetals()` just below it.

**Page 2 — Gallery**
Photos and videos in one responsive grid. Click, tap, or press Enter on any card to
open **only that item** in a full-screen lightbox with a blurred, darkened backdrop.
Close with the ✕, the Esc key, or by clicking outside. Arrow keys — and swipes on
phones — move between items. Music ducks automatically while a video plays.

**Page 3 — Final surprise**
Only the special video is visible. When it *finishes*, the letter, polaroids and
floating hearts fade in and the page scrolls to them, with a confetti burst.
If the video is missing or can't play, an "Open the letter" link appears instead
(and after `skipAfterSeconds`, set in `media.js`) so nobody ever gets stuck.

The dots on the right (bottom on mobile) jump between pages at any time.

---

## Good to know

* **Fonts** come from Google Fonts, so the first load needs internet. Offline it
  falls back to Georgia / Segoe UI and still looks fine.
* **Reduced motion** — if the device asks for less animation, confetti, balloons and
  hearts switch off automatically and everything still works.
* **Responsive** — tested layouts for desktop, tablet, phone, and short landscape screens.
* **Sharing it** — the whole folder is static. Drag it onto
  [Netlify Drop](https://app.netlify.com/drop), or push it to GitHub Pages, and it
  works as-is. Keep the folder structure intact.
* **Big videos** — keep the final video under ~50 MB if you're hosting it, or it'll
  take a while to start.

## Files

```
index.html          markup for all three pages
css/styles.css      all styling and animation
js/media.js         ← the only file you need to edit
js/main.js          router, confetti, gallery, lightbox, reveal logic
assets/             your photos, videos, music
```
