const makerjs = require("makerjs");
const PlayfieldExporter = require("./PlayfieldExporter");

var cutoutTest = {
  offsetX: 0,
  offsetY: 0,
  name: "Test Cutout",
  cutoutType: "dropbank3",
};

let exporter = new PlayfieldExporter();
let test = exporter.convertSVGToModel(cutoutTest.cutoutType);

console.log(JSON.stringify(test));
