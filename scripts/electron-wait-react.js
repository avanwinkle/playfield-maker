const net = require("net");
const Spawn = require("./spawn");

(function () {
  "use strict";
  const port = process.env.PORT ? (process.env.PORT - 100) : 13020;
  // Module to spawn child process

  process.env.ELECTRON_START_URL = `http://localhost:${port}`;

  const client = new net.Socket();

  let startedElectron = false;
  const tryConnection = () => client.connect({ port: port }, () => {
    client.end();
    if (!startedElectron) {
      startedElectron = true;
      const exec = Spawn.spawn("npm", ["run", "electron-dev"]);
      exec.stdout.on("data", (data) => { process.stdout.write(trimOutput(data)); });
      exec.stderr.on("data", (data) => { process.stderr.write(trimOutput(data)); });
    }
  });

  const trimOutput = (data) => {
    // Strip out the date, it's already posted
    return data.toString().replace(/\[\d{4}-\d{2}-\d{2} \d\d:\d\d:\d\d\.\d{3}\] /, "");
  };

  tryConnection();

  client.on("error", (__error) => {
    setTimeout(tryConnection, 1000);
  });
})();
