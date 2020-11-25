import {
    app,
    protocol,
    BrowserWindow,
    Menu,
    ipcMain,
    Tray,
    nativeImage,
} from 'electron';
import {
    createProtocol,
    installVueDevtools,
} from 'vue-cli-plugin-electron-builder/lib';
import path from 'path';
import Datastore from 'nedb';
import { getDate, formateFileSize } from './utils';

const basepath = app.getAppPath();
const dataStorePath = process.env.NODE_ENV === 'development' ? basepath : app.getPath('userData');
// process.resourcesPath
// Type 4: Persistent datastore for a Node Webkit app called 'nwtest'
// For example on Linux, the datafile will be ~/.config/nwtest/nedb-data/something.db
const db = {};
function initDB(fileName) {
    console.log('*** db path ***', process.env.NODE_ENV);

    console.log(`${dataStorePath}/data/${fileName}`);
    return new Datastore({
        filename: `${dataStorePath}/data/${fileName}`,
        autoload: true,
    });
}

db.textbook = initDB('textbook.db');
db.completeItem = initDB('completeItem.db');
db.appConfig = initDB('appConfig.db');
db.userAccount = initDB('account.db');

const globalAny = global;
globalAny.db = db;

const isDevelopment = process.env.NODE_ENV !== 'production';
/* eslint-disable */
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;
let tray = null;
const downloadItems = [];
// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
    { scheme: "app", privileges: { secure: true, standard: true } }
]);
// 设置菜单栏
function createMenu() {
    // darwin表示macOS，针对macOS的设置
    if (process.platform === "darwin") {
        const template = [
            {
                label: "App Demo",
                submenu: [
                    {
                        role: "about"
                    },
                    {
                        role: "quit"
                    }
                ]
            }
        ];
        const menu = Menu.buildFromTemplate(template);
        Menu.setApplicationMenu(menu);
    } else {
        // windows及linux系统
        Menu.setApplicationMenu(null);
    }
}

// create window
function createWindowFactory(options = {}, url = "") {
    const defaultOptions = {
        width: 1200,
        height: 600,
        // minWidth: 1200,
        webPreferences: {
            nodeIntegration: true,
            webSecurity: false
        },
        frame: false,
        resizable: true,
        icon: "../app.ico",
        alwaysOnTop: false,
        ...options
    };
    win = new BrowserWindow(defaultOptions);
    if (process.env.WEBPACK_DEV_SERVER_URL) {
        // Load the url of the dev server if in development mode
        win.loadURL(`${process.env.WEBPACK_DEV_SERVER_URL}#${url}`);
        if (!process.env.IS_TEST) win.webContents.openDevTools();
    } else {
        createProtocol("app");
        // Load the index.html when not in development
        win.loadURL(`app://./index.html#${url}`);
    }
    win.webContents.on("will-redirect", (event, url) => {
        event.preventDefault();
        console.log("redirect");
        win.webContents.send("weixin-login", url);
    });

    win.on("closed", event => {
        win = null;
    });
    createMenu();
}
ipcMain.on("create-console", () => {
    win.webContents.openDevTools();
});

// pc login window
function createLoginWindow() {
    createWindowFactory(
        {
            width: 720,
            height: 480
        },
        "login"
    );
}

// tray
function handleTray() {
    let icon = path.join(__dirname, "../app.png");

    if (process.env.NODE_ENV != "development") {
        icon = `${process.resourcesPath}/icons/app.png`;
    }
    tray = new Tray(nativeImage.createFromPath(icon));
    const contextMenu = Menu.buildFromTemplate([
        {
            label: "退出",
            type: "radio",
            click: () => {
                tray.destroy();
                win.close();
            }
        }
    ]);
    tray.setToolTip("云教助手");
    tray.setContextMenu(contextMenu);

    tray.on("click", () => {
        win.show();
    });
}

// auto start
function appAutoStart(isAppAutoStart = true) {
    if (!app.isPackaged) {
        app.setLoginItemSettings({
            openAtLogin: isAppAutoStart,
            path: process.execPath,
            args: [path.resolve(process.argv[1])]
        });
    } else {
        app.setLoginItemSettings({
            openAtLogin: isAppAutoStart
        });
    }
}

// init download events
function bindDownloadEvent() {
    win.webContents.session.on("will-download", (event, item, webContents) => {
        const url = item.getURL();
        console.log(url, "url");
        if (!url) {
            return;
        }
        const obj = downloadItems.find(
            elem => elem.url === url && elem.status === "pending"
        );
        obj.body = item;
        obj.totalM = formateFileSize(item.getTotalBytes());
        item.setSavePath(`${obj.userDownloadPath}\\${obj.filename}`);
        item.on("updated", (event, state) => {
            if (state === "interrupted") {
                console.log("Download is interrupted but can be resumed");
                obj.status = "failed";
                obj.time = getDate();
            } else if (state === "progressing") {
                if (item.isPaused()) {
                    obj.status = "pause";
                    console.log("Download is paused");
                } else {
                    obj.status = "downloading";
                    obj.progress = parseFloat(
                        (
                            (item.getReceivedBytes() / item.getTotalBytes()) *
                            100
                        ).toFixed(2)
                    );
                    obj.receivedBytes = item.getReceivedBytes();
                    obj.totalBytes = item.getTotalBytes();
                    obj.receivedM = formateFileSize(item.getReceivedBytes());
                }
            }
            webContents.send("updateDownload", obj);
        });
        item.once("done", (event, state) => {
            if (state === "completed") {
                obj.status = "completed";

                console.log("Download successfully");
            } else {
                if (state === "cancelled") {
                    obj.status = "canceled";
                } else {
                    obj.status = "failed";
                }
                console.log(`Download failed: ${state}`);
            }
            obj.time = getDate();
            db.completeItem.insert(
                [
                    {
                        ...obj,
                        body: ""
                    }
                ],
                err => {
                    if (err) {
                        return console.error(err);
                    }
                    return true;
                }
            );
            webContents.send("updateDownload", obj);
        });
    });
}

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    app.quit();
} else {
    app.on("second-instance", (event, commandLine, workingDirectory) => {
        if (win) {
            win.show();
            win.focus();
        }
    });
}

// Quit when all windows are closed.
app.on("window-all-closed", () => {
    console.log("close");
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== "darwin") {
        tray.destroy();
        app.quit();
    }
});

app.on("activate", () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
        createLoginWindow();
    }
});
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async () => {
    if (isDevelopment && !process.env.IS_TEST && null) {
        // Install Vue Devtools
        try {
            await installVueDevtools();
        } catch (e) {
            console.error("Vue Devtools failed to install:", e.toString());
        }
    }

    createLoginWindow();
    bindDownloadEvent();
    handleTray();
    appAutoStart();
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
    if (process.platform === "win32") {
        process.on("message", data => {
            if (data === "graceful-exit") {
                app.quit();
            }
        });
    } else {
        process.on("SIGTERM", () => {
            app.quit();
        });
    }
}

ipcMain.on("pause", (evt, args) => {
    downloadItems.find(item => {
        if (item.downloadTimestamp === args) {
            item.body.pause();
            return true;
        }
        return "";
    });
});
ipcMain.on("continue", (evt, args) => {
    downloadItems.find(item => {
        if (item.downloadTimestamp === args) {
            item.body.resume();
            return true;
        }
    });
});
ipcMain.on("cancel", (evt, args) => {
    downloadItems.find((item, index) => {
        if (item.downloadTimestamp === args) {
            item.body.cancel();
            return true;
        }
        return "";
    });
});
ipcMain.on("allPause", () => {
    downloadItems.forEach(item => {
        item.body.pause();
    });
});
ipcMain.on("allStart", () => {
    downloadItems.forEach(item => {
        item.body.resume();
    });
});

ipcMain.on("allCancel", () => {
    for (let i = 0; i < downloadItems.length; i += 1) {
        downloadItems.splice(i, 1)[0].body.pause();
        i -= 1;
    }
});

ipcMain.on("custom-download", (evt, args) => {
    const obj = {
        ...args
    };
    // console.log(args, "args");
    downloadItems.push(obj);
    win.webContents.downloadURL(args.url);
});

ipcMain.on("win-close", (evt, args) => {
    win.hide();
});

ipcMain.on("app-auto-start", (event, params) => {
    appAutoStart(params);
});
