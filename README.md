# playfield-maker
A GUI for designing pinball playfields for DXF export

This is an (early) draft of an automated playfield design GUI. Parts and cutous provided by @brian90254 (https://github.com/brian90254/Playfields)

WORKING:
- [x] Dynamically scale playfield by window size and table dimensions
- [x] Add parts to playfield
- [x] Customize name, position, anchor, and alignment of parts

TODO:
- [ ] Rotate and mirror parts
- [ ] Drag-and-drop parts
- [ ] Save and load playfield designs
- [ ] Wrap as a standalone [electron](https://electronjs.org/) app
- [ ] Export designs to DXF

### Usage
Currently only the web-based GUI is up and running. 

**INSTALLATION:**
```
git clone https://github.com/avanwinkle/playfield-maker/
cd playfield-maker
npm install
```

**RUNNING:**
```
npm start
```
