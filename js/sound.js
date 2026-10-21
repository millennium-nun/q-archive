// Background music ("Brambles"), shared by both pages.
// Remembers whether sound is on and where the track was, so the music
// carries on from the home page into the exhibit instead of restarting.
window.QSound = (function () {
  const ICON_ON = "assets/icons/sound-icon-full.svg";
  const ICON_OFF = "assets/icons/sound-icon-empty.svg";

  const store = {
    get(k) {
      try { return sessionStorage.getItem(k); } catch (e) { return null; }
    },
    set(k, v) {
      try { sessionStorage.setItem(k, v); } catch (e) {}
    },
  };

  const bg = new Audio("assets/audios/Brambles.mp3");
  bg.loop = true;
  bg.volume = 0.1;
  bg.preload = "auto";

  // Resume where the previous page left off.
  const savedTime = parseFloat(store.get("qa-time"));
  if (savedTime > 0) {
    bg.addEventListener(
      "loadedmetadata",
      () => { if (savedTime < bg.duration) bg.currentTime = savedTime; },
      { once: true }
    );
  }
  const saveTime = () => { if (!bg.paused) store.set("qa-time", String(bg.currentTime)); };
  setInterval(saveTime, 1000);
  window.addEventListener("pagehide", saveTime);

  let wanted = store.get("qa-sound") !== "off"; // the visitor's choice
  let playing = false; // whether the browser actually let us play
  const listeners = [];
  const emit = () => listeners.forEach((fn) => fn(isOn()));

  function isOn() {
    return wanted && playing;
  }

  // Browsers block sound until the visitor clicks or taps. Resolves true if
  // the music is now playing.
  function tryPlay() {
    if (!wanted) return Promise.resolve(false);
    return bg.play().then(
      () => { playing = true; emit(); return true; },
      () => { playing = false; emit(); return false; }
    );
  }

  function setOn(on) {
    wanted = on;
    store.set("qa-sound", on ? "on" : "off");
    if (on) return tryPlay();
    bg.pause();
    playing = false;
    emit();
    return Promise.resolve(false);
  }

  function bindButton(btn) {
    const img = btn.querySelector("img");
    const render = () => {
      const on = isOn();
      img.src = on ? ICON_ON : ICON_OFF;
      btn.setAttribute("aria-pressed", String(on));
      btn.setAttribute("aria-label", on ? "Mute sound" : "Turn sound on");
    };
    listeners.push(render);
    render();
    btn.addEventListener("click", () => setOn(!isOn()));
  }

  return {
    isOn,
    tryPlay,
    setOn,
    bindButton,
    wanted: () => wanted,
    onChange: (fn) => listeners.push(fn),
  };
})();
