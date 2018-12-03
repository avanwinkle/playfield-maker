const fs = require("fs");
const path = require("path");
const xmldom = require("xmldom");
const makerjs = require("makerjs");

const DPI = 90;
const GROUP_CUTOUTS = false;

const styleSheet =
"    path { stroke: none; fill: none; } " +
"    g.Z0_TOPCOMP   path { stroke: #FF00FF; } " +
"    g.Z0_BOTCOMP   path { stroke: #00FFFF; } " +
"    g.Z0_RUBBER    path { stroke: #FFFF00; } " +
"    g.Z0_PLASTICS  path { stroke: #666666; } " +
"    g.Z0_CUT500    path { stroke: #FF0000; } " +
"    g.Z0_CUT250    path { stroke: #0000FF; } ";

class PlayfieldExporter {
  constructor() {
    this._DOMParser = new xmldom.DOMParser();
    this._DOMImplementation = new xmldom.DOMImplementation();
    this._XMLSerializer = new xmldom.XMLSerializer();
    this._document = undefined;
    this._inkscape = true;

    var data = fs.readFileSync(__dirname + "/../public/data/CutoutTypes.json", "utf8");
    this._CutoutTypes = JSON.parse(data);
  }
  createPlayfieldSVG(playfield) {
    this._document = this._DOMImplementation.createDocument(null, "xml");
    let playfieldSVG = this._document.createElement("svg");
    let playfieldLayers = {};

    playfieldSVG.setAttribute("height", playfield.height + "in");
    playfieldSVG.setAttribute("width", playfield.width + "in");
    playfieldSVG.setAttribute("viewBox", "0 0 " + (playfield.width * DPI) + " " + (playfield.height * DPI));
    playfieldSVG.setAttribute("xmlns", "http://www.w3.org/2000/svg");

    if (this._inkscape) {
      playfieldSVG.setAttribute("xmlns:inkscape", "http://www.inkscape.org/namespaces/inkscape");
    }

    let style = this._document.createElement("style");
    style.setAttribute("type", "text/css");
    style.appendChild(this._document.createCDATASection(styleSheet));
    playfieldSVG.appendChild(style);

    playfield.cutouts.forEach((cutout) => {
      let cutoutGroups = this.parseCutoutSVG(cutout);
      if (GROUP_CUTOUTS) {
        playfieldSVG.appendChild(cutoutGroups);
      } else {
        Object.keys(cutoutGroups).forEach((groupLayerName) => {
          if (!playfieldLayers[groupLayerName]) {
            playfieldLayers[groupLayerName] = this.createLayerGroup(groupLayerName, true);
          }
          playfieldLayers[groupLayerName].appendChild(cutoutGroups[groupLayerName]);
        });
      }
    });

    if (!GROUP_CUTOUTS) {
      Object.keys(playfieldLayers).forEach((layer) => {
        playfieldSVG.appendChild(playfieldLayers[layer]);
      });
    }

    return playfieldSVG;
  }
  exportPlayfield(format, playfieldJSON) {
    let output;
    if (format === "svg") {
      const svg = this.createPlayfieldSVG(JSON.parse(playfieldJSON));
      output = this._XMLSerializer.serializeToString(svg);
    } else if (format === "json") {
      output = JSON.stringify(JSON.parse(playfieldJSON), null, 2);
    } else {
      process.stderr.write("Unknown export format '" + format +"'");
      return;
    }
    return output;
  }
  createLayerGroup(layerName, isInkscapeLayer) {
    var group = this._document.createElement("g");
    group.setAttribute("class", layerName);
    group.setAttribute("name", layerName);
    if (this._inkscape && isInkscapeLayer) {
      group.setAttribute("inkscape:groupmode", "layer");
      group.setAttribute("inkscape:label", layerName)
    }
    return group;
  }
  convertSVGToModel(cutoutType) {
    const cutoutSource = this._CutoutTypes[cutoutType]
    let cutoutModel = { models: {} };

    const result = fs.readFileSync(__dirname + "/../public/cutouts/" + cutoutSource.vector, "utf8");
    const rawDom = this._DOMParser.parseFromString(result, "text/xml");
    let svg;
    for (var i=0; i<rawDom.childNodes.length; i++) {
      if (rawDom.childNodes[i].tagName === "svg") {
        svg = rawDom.childNodes[i];
      }
    }

    var groups = svg.getElementsByTagName("g");
    for (var i=groups.length-1; i>=0; i--) {
      let transX = 0;
      let transY = 0;
      let g = groups[i];
      // Remove the inkscape-specific tags and add common ones
      let layer = g.getAttribute("inkscape:label") || "UNKNOWN_LAYER";
      // Get any group-wide transformation values
      var transf = g.getAttribute("transform");
      if (transf) {
        const transfReg = /translate\(([0-9.,-]+)\);?/;
        var match = transf.match(transfReg)
        if (match && match.length > 0) {
          var t = match[1].split(",");
          transX = parseFloat(t[0]);
          transY = parseFloat(t[1]);
        }
        if (transf.replace(transfReg, "") === "") {
          g.removeAttribute("transform");
        } else {
          g.setAttribute("transform", transf.replace(transfReg, ""));
        }
      }

      cutoutModel.models[layer] = { 
        models: {},
        // origin: [transX, transY],
      }

      // Traverse the paths to strip styles and map transformations
      var paths = g.getElementsByTagName("path");
      for (var j=0; j<paths.length; j++) {
        var path = paths[j];
        // Remove explicit path styles
        path.setAttribute("style", path.getAttribute("style").replace(/((fill|stroke):[^;]+;?)/g,""))

        var d = path.getAttribute("d");
        if (d && (transX || transY)) {
          const pathReg = /^m ([0-9.,-]+) /;
          var match = d.match(pathReg);
          if (match && match.length > 0) {
            var m = match[1].split(",");
            var mX = parseFloat(m[0]);
            var mY = parseFloat(m[1]);
            var nX = mX + transX;
            var nY = mY + transY;
            var nD = "M " + nX + "," + nY + " ";
            var newPath = d.replace(pathReg, nD);
            path.setAttribute("d", newPath);
            var pathData = makerjs.importer.fromSVGPathData(newPath);
            if (!pathData || Object.keys(pathData).length==0) {
              console.log("Unable to fetch pathData from path " + newPath);
              const lineReg = /^M [0-9.,-]+ ([0-9.,-]+)$/
              var lmatch = newPath.match(lineReg);
              if (lmatch && match.length > 0) {
                newPath = newPath.replace(lmatch[1], " L " + lmatch[1]);
                console.log(newPath);
                pathData = makerjs.importer.fromSVGPathData(newPath);
              }
            }
            cutoutModel.models[layer].models["path_" + j] = pathData;
          }
        }
      }
    }
    return cutoutModel;
  }
  parseCutoutSVG(cutout) {
    const cutoutSource = this._CutoutTypes[cutout.cutoutType]
    const offsetX = cutout.offsetX * cutoutSource.dpi;
    const offsetY = cutout.offsetY * cutoutSource.dpi;
    let cutoutGroup;

    const result = fs.readFileSync(__dirname + "/../public/cutouts/" + cutoutSource.vector, "utf8");
    const rawDom = this._DOMParser.parseFromString(result, "text/xml");
    let svg;
    for (var i=0; i<rawDom.childNodes.length; i++) {
      if (rawDom.childNodes[i].tagName === "svg") {
        svg = rawDom.childNodes[i];
      }
    }

    if (GROUP_CUTOUTS) {
      cutoutGroup = this.createLayerGroup(cutout.name, false);
      // Shift the entire cutout group to the offset coordinates, so each path inside can be relative
      cutoutGroup.setAttribute("transform", "translate(" + offsetX + "," + offsetY + ")");
    } else {
      cutoutGroup = {};
    }

    var groups = svg.getElementsByTagName("g");
    for (var i=groups.length-1; i>=0; i--) {
      let transX = 0;
      let transY = 0;
      let g = groups[i];
      // Remove the inkscape-specific tags and add common ones
      let layer = g.getAttribute("inkscape:label")
      if (!this._inkscape || !GROUP_CUTOUTS) {
        g.removeAttribute("inkscape:groupmode");
        g.removeAttribute("inkscape:label");
      } else {
        g.setAttribute("class", layer);
      }
      // g.setAttribute("layer", layer);

      // Remove the group-wide transformation and stash the values
      var transf = g.getAttribute("transform");
      if (transf) {
        const transfReg = /translate\(([0-9.,-]+)\);?/;
        var match = transf.match(transfReg)
        if (match && match.length > 0) {
          var t = match[1].split(",");
          transX = parseFloat(t[0]);
          transY = parseFloat(t[1]);
        }
        if (transf.replace(transfReg, "") === "") {
          g.removeAttribute("transform");
        } else {
          g.setAttribute("transform", transf.replace(transfReg, ""));
        }
      }

      // Traverse the paths to strip styles and map transformations
      var paths = g.getElementsByTagName("path");
      for (var j=0; j<paths.length; j++) {
        var path = paths[j];
        // Remove the inkscape-specific tags
        path.removeAttribute("inkscape:connector-curvature");
        // Remove explicit path styles
        path.setAttribute("style", path.getAttribute("style").replace(/((fill|stroke):[^;]+;?)/g,""))

        var d = path.getAttribute("d");
        if (d && (transX || transY)) {
          const pathReg = /^m ([0-9.,-]+) /;
          var match = d.match(pathReg);
          if (match && match.length > 0) {
            var m = match[1].split(",");
            var mX = parseFloat(m[0]);
            var mY = parseFloat(m[1]);
            var nX = mX + transX + (GROUP_CUTOUTS ? 0 : offsetX);
            var nY = mY + transY + (GROUP_CUTOUTS ? 0 : offsetY);
            var nD = "m " + nX + "," + nY + " ";
            path.setAttribute("d", d.replace(pathReg, nD));
          }
        }
      }

      if (paths.length > 0) {
        // GROUP CUTOUTS AND RETURN A SINGLE SVG
        if (GROUP_CUTOUTS) {
          // Ensure that the cuts go first
          if (layer === "Z0_CUT500" && cutoutGroup.childNodes.length) {
            cutoutGroup.insertBefore(g, cutoutGroup.firstChild);
          } else {
            cutoutGroup.appendChild(g);
          }
        }
        // GROUP LAYERS AND RETURN A MAPPING
        else {
          g.setAttribute("inkscape:label", layer + "_" + cutout.name);
          cutoutGroup[layer] = g;
        }
      }
    }
    return cutoutGroup;
  }
}

module.exports = PlayfieldExporter;
