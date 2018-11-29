# playfield-maker
A GUI for designing pinball playfields for DXF export

This is an (early) draft of an automated playfield design GUI. Parts and cutous provided by @brian90254 (https://github.com/brian90254/Playfields)

WORKING:
- [x] Standalone [electron](https://electronjs.org/) app
- [x] Dynamically scale playfield by window size and table dimensions
- [x] Add parts to playfield
- [x] Customize name, position, anchor, and alignment of parts
- [x] Automatic saving and restoring of playfield
- [x] Export playfield to SVG

TODO:
- [ ] Rotate and mirror parts
- [ ] Drag-and-drop parts
- [ ] Load playfield designs and switch active playfields
- [ ] Import custom part SVGs
- [ ] Export designs to DXF

### Usage

**INSTALLATION:**
```
git clone https://github.com/avanwinkle/playfield-maker/
cd playfield-maker
npm install
```

**RUNNING:**
From an install, the transpiled application can be run via
```
npm start
```

For development, the app can be run in realtime via
```
npm run dev
```
