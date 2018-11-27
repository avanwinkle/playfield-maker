(function() {

const fs = require("fs");
const path = require("path");
const xmldom = require("xmldom");

const parser = new xmldom.DOMParser();
const domImpl = new xmldom.DOMImplementation();
const xmlToString = new xmldom.XMLSerializer();

var testFile = __dirname + "/post.svg"

fs.readFile(testFile, "utf8", (__err, result) => {
  var dom = parser.parseFromString(result, "text/xml");
  var svg;
  for (var i=0; i<dom.childNodes.length; i++) {
    if (dom.childNodes[i].tagName === "svg") {
      svg = dom.childNodes[i];
    }
  }

  let document = domImpl.createDocument(null, "xml");
  let svgParent = document.createElement("svg");
  svgParent.setAttribute("height", "45in");
  svgParent.setAttribute("width", "20.5in");
  svgParent.setAttribute("xmlns", "http://www.w3.org/2000/svg");

  let post = document.createElement("g");
  post.setAttribute("id", "somePost");
  svgParent.appendChild(post);

  var groups = svg.getElementsByTagName("g");
  for (var i=groups.length-1; i>=0; i--) {
    var g = groups[i];
    var name = g.getAttribute("inkscape:label")
    g.removeAttribute("inkscape:groupmode");
    g.removeAttribute("inkscape:label");
    g.setAttribute("name", name);

    var trans = g.getAttribute("transform");
    var match = trans.match(/translate\(([0-9.,-]+)\);?/)
    if (match && match.length > 0) {
      var t = match[1].split(",");
      var transX = parseFloat(t[0]);
      var transY = parseFloat(t[1]);
    }
    g.setAttribute("transform", trans.replace(/translate\(([0-9.,-]+)\);?/, ""));

    var paths = g.getElementsByTagName("path");
    for (var j=0; j<paths.length; j++) {
      var path = paths[j];
      path.removeAttribute("inkscape:connector-curvature");
      var d = path.getAttribute("d");
      var match = d.match(/^m ([0-9.,-]+) /);
      if (match && match.length > 0) {
        var m = match[1].split(",");
        var mX = parseFloat(m[0]);
        var mY = parseFloat(m[1]);
        var nX = mX + transX;
        var nY = mY + transY;
        nD = "m " + nX + "," + nY + " ";
        path.setAttribute("d", d.replace(/^m ([0-9.,-]+) /, nD));
      }
    }

    post.appendChild(g);
  }

  var output = xmlToString.serializeToString(svgParent);
  fs.writeFile(__dirname + "/test_output.svg", output);

});
  
})();