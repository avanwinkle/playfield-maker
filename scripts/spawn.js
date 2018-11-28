var spawn = require("child_process").spawn;

/* This is a wrapper around the NPM child_process.spawn to 
   prevent ENOENT errors when the node module is packaged into
   an OSX application.
*/
(function () {
  var oldSpawn = spawn;
  function mySpawn() {
    var result = oldSpawn.apply(this, arguments);
    return result;
  }
  spawn = mySpawn;
})();

module.exports = { spawn: spawn };
