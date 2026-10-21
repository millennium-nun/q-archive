// Exhibit page behaviour: entry screen, narration audio, Vimeo videos,
// sidebar navigation, hint icons and the word-by-word quote reveal.
(function () {
  const $id = (id) => document.getElementById(id);
  const isDesktopLayout = () => window.innerWidth > 768 || window.innerHeight <= 550;

  // Returns true when the element is outside the band [above, below]
  // (pixels from the top of the viewport).
  function isOutside(el, above, below) {
    const { top, bottom } = el.getBoundingClientRect();
    return bottom < above || top > below;
  }

  // ---- Sound -------------------------------------------------------------
  const narrations = [0, 1, 2, 3, 4, 5, 6].map((i) => ({
    text: $id("Nar" + i),
    audio: new Audio("assets/audios/Nar" + i + ".mp3"),
  }));

  QSound.bindButton($id("main-btn"));
  QSound.onChange((on) => {
    if (!on) narrations.forEach((n) => n.audio.pause());
  });

  // A narration plays while its quote is on screen (and replays if you linger).
  function updateNarration({ text, audio }) {
    if (isOutside(text, -50, 400) || !QSound.isOn()) {
      if (!audio.paused) audio.pause();
    } else if (audio.paused) {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    }
  }

  // Called from a click/tap so mobile browsers allow the narrations to play later.
  function unlockNarrations() {
    narrations.forEach(({ audio }) => {
      audio.muted = true;
      audio.play().then(
        () => { audio.pause(); audio.currentTime = 0; audio.muted = false; },
        () => { audio.muted = false; }
      );
    });
  }

  // ---- Entry screen ------------------------------------------------------
  // If the browser lets the music start on its own, go straight in (as before).
  // Otherwise show an "Enter" button: the click is what allows sound to play.
  function reveal() {
    $id("loading").style.display = "none";
    $id("mainDisplay").style.display = "block";
    onScroll();
  }

  window.addEventListener("load", () => {
    QSound.tryPlay().then((ok) => {
      if (ok || !QSound.wanted()) return reveal();
      $id("loadingText").hidden = true;
      $id("enterPrompt").hidden = false;
    });
  });

  $id("enterBtn").addEventListener("click", () => {
    unlockNarrations();
    QSound.setOn(true);
    reveal();
  });
  $id("enterSilent").addEventListener("click", () => {
    QSound.setOn(false);
    reveal();
  });

  // ---- Videos ------------------------------------------------------------
  // (If Vimeo's script can't load, the videos still show; they just won't
  // auto-play on scroll.)
  const videos = window.Vimeo
    ? [0, 1, 2, 3, 4, 5, 6].map((i) => {
        const el = $id("Vid" + i);
        return { el, player: new Vimeo.Player(el), playing: false };
      })
    : [];

  // Desktop: play while in view, and enlarge once it fills the screen.
  function updateVideo(v) {
    if (!isDesktopLayout()) return;
    if (isOutside(v.el, -100, 600)) {
      if (v.playing) {
        v.playing = false;
        v.player.pause().catch(() => {});
      }
      return;
    }
    if (!v.playing) {
      v.playing = true;
      v.player.play().catch(() => { v.playing = false; });
    }
    v.el.classList.toggle("enlarge", !isOutside(v.el, 0.7 * window.innerHeight, -20));
  }

  // ---- Navigation & hints ------------------------------------------------
  const sections = ["intro", "one", "two", "three", "four", "five", "six", "about"].map($id);
  const links = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => $id("link" + i));

  function updateNav(link, section) {
    const active = !isOutside(section, 0, 10);
    link.querySelector("hr").style.width = active ? "30px" : "9.6px";
    link.querySelector("span").style.visibility = active ? "visible" : "hidden";
    if (active) link.setAttribute("aria-current", "true");
    else link.removeAttribute("aria-current");
  }

  const scrollIcon = $id("scrollIcon");
  const holdIcon = $id("holdIcon");
  const synopsis1 = $id("synopsis1");
  const label1 = $id("label1");

  function updateHints() {
    scrollIcon.style.opacity = synopsis1.getBoundingClientRect().top > window.innerHeight ? 1 : 0;
    const t = label1.getBoundingClientRect().top;
    holdIcon.style.opacity = t > 0.2 * window.innerHeight && t < 0.7 * window.innerHeight ? 1 : 0;
  }

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      links.forEach((link, i) => updateNav(link, sections[i]));
      narrations.forEach(updateNarration);
      videos.forEach(updateVideo);
      updateHints();
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);

  // ---- Quotes appear phrase by phrase as you scroll ----------------------
  $(function () {
    $.jScrollability([
      {
        selector: ".text-wrapper",
        start: (el) => el.offset().top + el.height(),
        end: "parent",
        fn: (el, progress) => {
          const spans = el.find("span");
          const shown = Math.floor((spans.length + 1) * progress);
          spans.each((i, span) => $(span).toggleClass("visible", i < shown));
        },
      },
    ]);
  });
})();
