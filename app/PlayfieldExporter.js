const fs = require("fs");
const path = require("path");
const xmldom = require("xmldom");

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

    fs.readFile(__dirname + "/../public/data/CutoutTypes.json", "utf8", (_err, data) => {
      this._CutoutTypes = JSON.parse(data);
    });
  }
  createPlayfieldSVG(playfield) {
    this._document = this._DOMImplementation.createDocument(null, "xml");
    let playfieldSVG = this._document.createElement("svg");
    playfieldSVG.setAttribute("height", "45in");
    playfieldSVG.setAttribute("width", "20.5in");
    playfieldSVG.setAttribute("xmlns", "http://www.w3.org/2000/svg");

    let style = this._document.createElement("style");
    style.setAttribute("type", "text/css");
    style.appendChild(this._document.createCDATASection(styleSheet));
    // style.innerHTML = styleSheet;
    playfieldSVG.appendChild(style);

    playfield.cutouts.forEach((cutout) => {
      let cutoutSVG = this.parseCutoutSVG(cutout);
      playfieldSVG.appendChild(cutoutSVG);
    });
    return playfieldSVG;  
  }
  exportPlayfieldJSONToFile(playfieldJSON) {
    const svg = this.createPlayfieldSVG(JSON.parse(playfieldJSON));
    const output = this._XMLSerializer.serializeToString(svg);
    fs.writeFile(__dirname + "/../exports/playfield_export.svg", output, (result) => {
      if (result) {
        process.stderr.write("Error saving file: " + result);
      } else {
        process.stdout.write("File export successful!");
      }
    });
  }
  parseCutoutSVG(cutout) {
    const cutoutSource = this._CutoutTypes[cutout.cutoutType]
    const offsetX = cutout.offsetX * cutoutSource.dpi;
    const offsetY = cutout.offsetY * cutoutSource.dpi;
    const cutoutGroup = this._document.createElement("g");
    cutoutGroup.setAttribute("id", cutout.id || cutout.name);
    cutoutGroup.setAttribute("name", cutout.name);
    // Shift the entire cutout group to the offset coordinates, so each path inside can be relative
    cutoutGroup.setAttribute("transform", "translate(" + offsetX + "," + offsetY + ")");
    
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
      let layer = g.getAttribute("inkscape:label")
      g.removeAttribute("inkscape:groupmode");
      g.removeAttribute("inkscape:label");
      g.setAttribute("class", layer);
      g.setAttribute("layer", layer);

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
          g.setAttribute("transform", );
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
            var nX = mX + transX;
            var nY = mY + transY;
            var nD = "m " + nX + "," + nY + " ";
            path.setAttribute("d", d.replace(pathReg, nD));
          }
        }
      }
      if (paths.length > 0) {
        // Ensure that the cuts go first
        if (layer === "Z0_CUT500" && cutoutGroup.childNodes.length) {
          cutoutGroup.insertBefore(g, cutoutGroup.firstChild);
        } else {
          cutoutGroup.appendChild(g);
        }
      }
    }
    return cutoutGroup;
  }
}

module.exports = PlayfieldExporter;
