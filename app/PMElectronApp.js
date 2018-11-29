const electron = require("electron");
const fs = require("fs");
const path     = require("path");
const url      = require("url");

const { app, BrowserWindow, ipcMain, dialog } = electron;
const PMElectronMenu = require("./PMElectronMenu");

const PlayfieldExporter = require("./PlayfieldExporter");

const userDir = __dirname + "/../user_data/";

class PlayfieldMakerElectron {
  constructor() {
    this.app = app;
    this.app.on("ready", this._createApplication.bind(this));
    this.exporter = new PlayfieldExporter();
    this.prefs = undefined;
  }

  makeDir(path) {
    return new Promise((resolve, reject) => {
      fs.stat(path, (err) => {
        if (err && err.code === "ENOENT") {
          fs.mkdir(path, (err) => {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          });
        } else if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  getPreferences() {
    const prefsPath = userDir + "prefs.json";
    const playfieldsDir = userDir + "playfields/";
    // If the user data path doesn't exist, create it
    return this.makeDir(userDir).then(() => {
      return new Promise((resolve, reject) => {
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
            this.makeDir(playfieldsDir).then(() => {
              fs.readFile(playfieldsDir + prefs.lastPlayfield + ".json", "utf8", (err, field) => {
                if (err) { reject(err); }
                prefs.playfield = JSON.parse(field);
                resolve(prefs);
              });
            });
          } else {
            resolve(prefs);
          }
        });
      });
    });
  }

  receiveExport(response) {
    let path, filename, format;
    switch (response.action) {
      case "SAVE":
      case "SAVEAS":
        format = "json";
        path = userDir + "/playfields/";
        filename = response.filename + ".json";
        if (response.filename !== this.prefs.lastPlayfield) {
          this.updatePrefs({ lastPlayfield: response.filename });
        }
        break;
      case "SVG":
        format = "svg";
        path = userDir + "/exports/";
        if (response.noDialog) {
          filename = response.filename + ".svg";
        }
        break;
      default:
        throw Error("Unknown export action '" + response.action + "'");
    }
    const output = this.exporter.exportPlayfield(format, response.data);
    this.makeDir(path).then(() => {
      return new Promise((resolve, reject) => {
        if (filename) {
          resolve(path + filename);
        } else {
          var opts = {
            title: "Choose SVG Destination",
            defaultPath: path + response.filename + ".svg",
          };
          dialog.showSaveDialog(this._mainWindow, opts, resolve);
        }
      });
    }).then((target) => {
      return new Promise((resolve, reject) => {
        fs.writeFile(target, output, (result) => {
          if (result) {
              reject(result);
          } else {
            resolve();
          }
        });
      });
    }).catch((err) => {
      process.stderr.write(err);
    });
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
  updatePrefs(obj) {
    Object.assign(this.prefs, obj);
    const prefsPath = userDir + "prefs.json";
    return new Promise((resolve, reject) => {
      fs.writeFile(prefsPath, JSON.stringify(this.prefs), (err) => {
        if (err) { reject(err); }
        else { resolve(); }
      });
    });
  }
  _createApplication() {
    this.menu = new PMElectronMenu(this);
    ipcMain.on("export", (_e, response) => { this.receiveExport(response); });
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
      this.prefs = prefs;
      this.sendToMainWindow("preferences", prefs);
    }).catch((reason) => {
      process.stderr.write("Unable to retrieve preferences");
      process.stderr.write(reason);
    });;
  }

}

module.exports = PlayfieldMakerElectron;
