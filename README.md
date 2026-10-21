# Q's Archive

An interactive web exhibit by **Franchan** (Franziska Mack & Yichan Wang), 2020.

Artifacts and memories preserved by Q, a survivor of the Great Separation, drawn from
*The Distance to the Moon*. Scroll through six 3D artifacts with narration and animation.

## Structure

- `index.html`: landing page
- `main.html`: the exhibit
- `js/app.js`: 3D artifact rendering (three.js r102); models load as you approach them
- `js/ui.js`: entry screen, narration, Vimeo videos, navigation, quote reveal
- `js/sound.js`: background music, shared by both pages
- `assets/models/`: Draco-compressed glTF models (decoder in `js/vendor/three/draco/`)

## Run locally

Any static server works, e.g. `python3 -m http.server`, then open http://localhost:8000.

## Notes

- Fonts come from Adobe Fonts (kit `rvb0wap`). The site's domain must be listed in that
  kit's web project settings, or the fonts fall back to defaults.
- Animations are hosted on Vimeo.
