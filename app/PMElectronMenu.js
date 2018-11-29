const electron = require("electron");

const { Menu } = electron;

class PlayfieldMakerMenu {
  constructor(electronInstance) {
    this.electronInstance = electronInstance;
    this.menu = Menu.buildFromTemplate(this._generateMenuTemplate());
    Menu.setApplicationMenu(this.menu);
  }

  _generateMenuTemplate() {
    return [
      {
        label: process.platform === "darwin" ? this.electronInstance.app.getName() : "File",
        submenu: [
          { role: "about" },
          {
            label: "Settings...",
            click: (__e) => {
              this.electronInstance.sendToMainWindow("handle-event", { name: "openSettings" });
            },
          },
          { type: "separator" },
          { role: "services", submenu: [] },
          { type: "separator" },
          { role: "hide" },
          { role: "hideothers" },
          { role: "unhide" },
          { type: "separator" },
          { role: "quit" },
        ],
      },
      {
        label: "Edit",
        submenu: [
          { role: "cut"   },
          { role: "copy"  },
          { role: "paste" },
          { role: "selectall" },
          { type: "separator" },
          { role: "reload" },
        ],
      },
      {
        label: "Playfield",
        submenu: [
          {
            label: "Export SVG As...",
            click: (__e) => {
              this.electronInstance.sendToMainWindow("export-request", { format: "json" });
            }
          }
        ],
      },
      {
        label: "Tools",
        submenu: [
          {
            label: "Show Developer Tools",
            click: (__e) => { this.electronInstance.toggleDevTools(); },
            accelerator: "CommandOrControl+Alt+I",
          },
          {
            label: "Show Console",
            click: this.electronInstance._launchShellTerminal,
            accelerator: "CommandOrControl+Alt+J",
          },
          {
            label: "Check Environment Values",
            click: this.electronInstance._checkEnv,
          },
        ],
      },
    ];
  }
}

module.exports = PlayfieldMakerMenu;
