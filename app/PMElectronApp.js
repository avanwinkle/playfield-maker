const electron = require("electron");
const fs = require("fs");
const path     = require("path");
const url      = require("url");

const { app, BrowserWindow, ipcMain } = electron;
const PMElectronMenu = require("./PMElectronMenu");

const PlayfieldExporter = require("./PlayfieldExporter");

class PlayfieldMakerElectron {
  constructor() {
    this.app = app;
    this.app.on("ready", this._createApplication.bind(this));
    this.exporter = new PlayfieldExporter();
  }

  getPreferences() {
    const prefsPath = __dirname + "/../user_data/prefs.json";
    var p = new Promise((resolve, reject) => {
      fs.readFile(prefsPath, "utf8", (err, response) => {
        // If no prefs file exists, create one
        if (err) { 
          if (err.code === "ENOENT") {
            prefs = {};
            fs.writeFile(prefsPath, JSON.stringify(prefs), (_err) => {
              resolve(prefs);
            })
          } else {
            reject(err); 
          }
          return;
        }
        var prefs = JSON.parse(response);
        if (prefs.lastPlayfield) {
          fs.readFile(__dirname + "/../user_data/playfields/" + prefs.lastPlayfield + ".json", "utf8", (err, field) => {
            if (err) { reject(err); }
            prefs.playfield = JSON.parse(field);
            resolve(prefs);
          });
        } else {
          resolve(prefs);
        }
      });
    });
    return p;
  }

  receiveExport(__evt, data) {
    this.exporter.exportPlayfieldJSONToFile(data.data);
  }

  sendToMainWindow(event, data) {
    if (this._mainWindow && this._mainWindow.webContents) {
      this._mainWindow.webContents.send(event, data);
    }
  }
  toggleDevTools(__evt) {
    if (this._mainWindow && this._mainWindow.webContents) {
      this._mainWindow.webContents.toggleDevTools();
    }
  }
  _createApplication() {
    this.menu = new PMElectronMenu(this);
    ipcMain.on("export-ready", this.receiveExport.bind(this));
    ipcMain.on("get-preferences", this.getPreferences.bind(this));
    ipcMain.on("window-ready", this._onWindowReady.bind(this));

    // Create the browser window.
    this._mainWindow = new BrowserWindow({
      width:  920,
      height: 690,
      title:  "Playfield Maker",
    });

    const startUrl = process.env.ELECTRON_START_URL || url.format({
      pathname: path.join(__dirname, "/../build/index.html"),
      protocol: "file:",
      slashes: true,
    });
    this._mainWindow.loadURL(startUrl);
  }
  _onWindowReady() {
    this.getPreferences().then((prefs) => {
      this.sendToMainWindow("preferences", prefs);
    }).catch((reason) => {
      process.stderr.write("Unable to retrieve preferences");
      process.stderr.write(reason);
    });;
  }

}

module.exports = PlayfieldMakerElectron;