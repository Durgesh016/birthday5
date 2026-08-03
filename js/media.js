/* ============================================================================
   ⚙️  EDIT THIS FILE — everything personal lives here.
   ----------------------------------------------------------------------------
   1. Drop your photos  into  assets/photos/
   2. Drop your videos  into  assets/videos/
   3. Drop a song       into  assets/music/
   4. Change the names / captions / letter text below.

   Any file that is missing simply shows a pretty placeholder instead of
   breaking the page, so you can preview the site before adding media.
   ========================================================================== */

window.BIRTHDAY_CONFIG = {

  /* ── Page 1 — Welcome ───────────────────────────────────────────────── */

  // The name shown under the big "Happy Birthday" heading.
  name: "Thanmayee...❣️❣️",

  // Small line above the name.
  nameIntro: "To",

  // These rotate automatically every few seconds.
  wishes: [
    "Another year of you lighting up every room you walk into. 🎂",
    "May this year bring you every single thing you quietly hope for.",
    "You make ordinary days feel like celebrations — today the world returns the favour.",
    "Here's to more laughter, more adventures, and more moments like these. ✨",
    "The world got a little brighter the day you were born. It still is.",
    "Wishing you a year as beautiful, warm and unforgettable as you are. 💖"
  ],

  // How long each wish stays on screen (milliseconds). 3000–5000 works nicely.
  wishInterval: 4200,

  // ── Hero background photo ──────────────────────────────────────────
  // Save any wide picture (the fox & bunny selfie, a photo of you two, …) into
  // assets/photos/ as hero.png or hero.jpg — either works, the first one that
  // exists is used. It becomes page 1's background automatically, with a warm
  // cedar/sage scrim over the left half so the message stays readable.
  // If neither is there, the drawn floral hero shows instead — nothing breaks.
  heroBackground: [
    "assets/photos/hero.png",
    "assets/photos/hero.jpg"
  ],

  // How the message sits on the picture:
  //   "center" — decorative picture, nothing important on either side.
  //              The message stays centred and the picture gets an even veil.
  //   "left"   — picture with its subject on the RIGHT (the fox & bunny still).
  //              The message moves left and a scrim clears space for it.
  // hero.jpg (fox & bunny) has its subject on the RIGHT, so the message moves
  // left. Switch back to "center" if you restore a decorative full-frame
  // picture like hero.png, which has nothing important to either side.
  heroBackgroundLayout: "left",

  // Which part of the picture to keep in frame. First value = horizontal.
  // For "left", nudge toward "85% center" to push the subject further right.
  heroBackgroundPosition: "72% center",
  heroBackgroundPositionMobile: "68% 28%",

  // ── Hero character art (a cut-out with a TRANSPARENT background) ────
  // Drop a PNG with a TRANSPARENT background into assets/photos/ and put the
  // path here. The hero then splits: message on the left, character on the
  // right with a warm glow behind it. Leave it null and the page stays
  // centred exactly as it is now.
  heroCharacter: null,          // e.g. "assets/photos/characters.png"
  heroCharacterAlt: "",         // leave blank — it's decorative

  // Page-1 decoration — all optional, flip any of these to taste.
  floralFrame: true,     // roses + petals framing the corners
  fallingPetals: true,   // rose petals drifting down the screen
  showBalloons: true,    // elegant balloons floating up the right side
  bokeh: true,           // golden/pink out-of-focus light orbs
  fairyLights: true,     // glowing garlands strung across the top
  ribbonCurls: true,     // gold and pink ribbon curls
  heartParticles: true,  // tiny hearts drifting upward

  // Background music. Drop the file in assets/music/ and set the path here.
  // It starts on page 1 and keeps playing across all three pages; the toggle
  // in the corner appears once the file is playable, and stays hidden if it
  // isn't. Set to null to leave it out entirely.
  // beta.mpeg is MP3 audio despite the extension — browsers sniff the stream,
  // so it plays. Renaming it to beta.mp3 (and updating this line) is the safer
  // bet if this ever gets served over a real web server.
  music: "assets/music/beta.mpeg",
  musicVolume: 0.35,


  /* ── Page 2 — Memory gallery ────────────────────────────────────────── */

  // ── Page-2 background photo ────────────────────────────────────────
  // A full-bleed picture behind the gallery. It gets the same cedar/sage wash
  // and a soft veil over it so the heading and cards stay readable, and it
  // holds still while the gallery scrolls. Set to null for the plain wash;
  // a missing file changes nothing either. One path or a list of candidates.
  galleryBackground: "assets/photos/thanu20.jpg",

  // Which part of the picture to keep in frame, e.g. "center", "50% 30%".
  // thanu20 is a tall portrait, so on a wide screen `cover` crops away most of
  // the top and bottom — this keeps the face in the visible band.
  galleryBackgroundPosition: "50% 42%",

  // type: "photo" or "video".  poster = optional thumbnail image for a video.
  //
  // The gallery is a 3×3 grid with the video in the middle, so THE ORDER BELOW
  // IS THE LAYOUT — nine entries, read left to right, top to bottom:
  //
  //        1   2   3      ← three photos above the video
  //        4  [▶]  6      ← one photo either side of it
  //        7   8   9      ← three photos below
  //
  // Keep the video 5th to keep it in the centre. Swapping two lines swaps two
  // tiles. Any entry whose file is missing is skipped, which shifts everything
  // after it up a cell — so if the video wanders off-centre, check the paths.
  // No `poster` on the video on purpose: without one the video supplies its own
  // thumbnail, whereas a poster pointing at a missing file shows a placeholder
  // even when the video itself is fine. Add it back once you have a real image.
  gallery: [
    /* above */
    { type: "photo", src: "assets/photos/thanu12.jpg", caption: "That laugh, right there",      date: "Unforgettable" },
    { type: "photo", src: "assets/photos/thanu1.jpg", caption: "Golden hour, golden you",      date: "Sunset" },
    { type: "photo", src: "assets/photos/thanu7.jpg", caption: "Wind, hills, and you",         date: "The hilltop" },

    /* left · THE VIDEO · right */
    { type: "photo", src: "assets/photos/thanu10.jpg", caption: "Even your quiet is pretty",    date: "That evening" },
    // Hosted on Cloudinary rather than in assets/videos/ — the file is too big
    // to keep in the repo.
    { type: "video", src: "https://res.cloudinary.com/zkrswrjt/video/upload/v1785738440/thanmayee2_mhzt63.mp4", caption: "You, being completely you", date: "Play me" },
    { type: "photo", src: "assets/photos/thanu2.jpg", caption: "Somewhere between two cities", date: "The train" },

    /* below */
    { type: "photo", src: "assets/photos/thanu.jpg",  caption: "Where it all began",           date: "The first one" },
    { type: "photo", src: "assets/photos/thanu8.jpg", caption: "smile lives in yours",     date: "Home" },
    { type: "photo", src: "assets/photos/thanu6.jpg", caption: "Quiet, and completely lovely", date: "Saree day" }
  ],


  /* ── Page 3 — Final surprise ────────────────────────────────────────── */

  // ── Page-3 background photo ────────────────────────────────────────
  // Same idea as galleryBackground, on its own layer so pages 2 and 3 can
  // carry different pictures and cross-fade between them. It sits a little
  // quieter than page 2's — the letter is the thing being read. Set to null
  // for the plain cedar/sage wash; a missing file changes nothing either.
  // A list, so whichever of the two you saved is the one that gets used.
  finalBackground: [
    "assets/photos/thanu10.png",
    "assets/photos/thanu10.jpg"
  ],

  // Which part of the picture to keep in frame. thanu20 is a tall portrait,
  // so on a wide screen `cover` crops away most of the top and bottom — this
  // keeps the face in the visible band, same as page 2.
  finalBackgroundPosition: "50% 42%",

  // The one special video. The letter stays hidden until it finishes.
  // Served from Cloudinary, same as the gallery video above. The local copy in
  // assets/videos/ is still there as the <source> fallback in index.html, but
  // this line is what actually plays.
  finalVideo: {
    src: "https://res.cloudinary.com/zkrswrjt/video/upload/v1785738355/thanmayee1_hkqlw1.mp4",
    poster: "assets/photos/thanu.jpg"
  },

  // Show an "open the letter" escape hatch after this many seconds,
  // so nobody is ever stuck (set to null to never show it).
  skipAfterSeconds: 1,

  letter: {
    title: "Who is she ????????",
    paragraphs: [
      "She's just an ordinary woman...",
      "Who loves Life........",
      "Sometimes She Cries,But She Never Forgets To laugh...",
      "She's not always okay,But She Never Gives Up...",
      "<h1>Thats Her........</h1>",
      "And Once Again...",
      "Happiee BDayyyy Thanmayee...🖤🖤",
    ],
    
    
  },

  // A few photos shown under the letter.
  letterPhotos: [
    { src: "assets/photos/thanu11.jpg", caption: "us" },
    { src: "assets/photos/thanu3.jpg", caption: "that day" },
    { src: "assets/photos/thanu9.jpg", caption: "always" },
    { src: "assets/photos/thanu4.jpg", caption: "forever" }
  ],

  // The closing line at the very bottom.
  finalWish: "Happy Birthday, once more — may this year be the most beautiful one yet. 🎂💫"
};
