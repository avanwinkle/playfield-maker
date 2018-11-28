const electron = require("electron");
const path     = require("path");
const url      = require("url");

const { app, BrowserWindow, ipcMain } = electron;
const PMElectronMenu = require("./PMElectronMenu");

class PlayfieldMakerElectron {
  constructor() {
    this.app = app;
    this.app.on("ready", this._createApplication.bind(this));
  }

  receiveExport(__evt, data) {
    process.stdout.write("Receiving export!");
    process.stdout.write(data.format.toString());
    process.stdout.write(data.data.toString());
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

}

module.exports = PlayfieldMakerElectron;