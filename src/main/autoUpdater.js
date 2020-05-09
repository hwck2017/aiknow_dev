import { ipcMain, dialog } from 'electron';
import { autoUpdater } from "electron-updater";
import * as os from 'os';
const log = require('electron-log');

const appVersion = require('../../package.json').version;

let updateFeed = ''
const nutsURL = 'https://electron-autoupdater-starter-server.now.sh';
const platform = `${os.platform()}_${os.arch()}`
if (os.platform() === 'darwin') {
    updateFeed = `${nutsURL}/update/${platform}/${appVersion}`
}
// } else if (os.platform() === 'win32') {
//     updateFeed = `${nutsURL}/update/win32/${appVersion}`
// } else {
//     // do nothing
// }

// 通过main进程发送事件给renderer进程，提示更新信息
function sendUpdateMessage(window, text) {
    window.webContents.send('message', text)
}
// 检测更新，在你想要检查更新的时候执行，renderer事件触发后的操作自行编写
export function updateHandle(window) {
    let message = {
        error: '检查更新出错',
        checking: '正在检查更新……',
        updateAva: '检测到新版本，正在下载……',
        updateNotAva: '现在使用的就是最新版本，不用更新',
    };

    log.transports.file.level = "debug"
    autoUpdater.logger = log;
    autoUpdater.currentVersion = appVersion;
    log.info("current version: " + appVersion);
    // autoUpdater.autoDownload = false;
    autoUpdater.on('error', function (error) {
        sendUpdateMessage(window, message.error);
        sendUpdateMessage(window, JSON.stringify(error));
    });
    autoUpdater.on('checking-for-update', function () {
        sendUpdateMessage(window, message.checking);
    });
    autoUpdater.on('update-available', function (info) {
        sendUpdateMessage(window, message.updateAva);
    });
    autoUpdater.on('update-not-available', function (info) {
        sendUpdateMessage(window, message.updateNotAva);
    });
    // 更新下载进度事件
    autoUpdater.on('download-progress', function (progressObj) {
        log.info("download-progress: " + JSON.stringify(progressObj));
        window.webContents.send('downloadProgress', progressObj);
    });
    autoUpdater.on('update-downloaded', function (event, releaseNotes, releaseName, releaseDate, updateUrl, quitAndUpdate) {
        log.info("============== 100% =================");
        const dialogOpts = {
            type: 'info',
            buttons: ['稍后', '更新'],
            defaultId: 1,
            title: '程序更新',
            message: process.platform === 'win32' ? releaseNotes : releaseName,
            detail: '检查到新版本，请选择是否立即更新'
        }
        dialog.showMessageBox(dialogOpts, (response, checkboxChecked) => {
            log.info('click number: ' + response);
            if (response === 1) autoUpdater.quitAndInstall();
        });
    });
    // ipcMain.on('isUpdateNow', (e, arg) => {
    //     log.info(arguments);
    //     log.info("开始更新");
    //     //some code here to handle event
    //     autoUpdater.quitAndInstall();
    // });
    ipcMain.on("checkForUpdate", () => {
        //执行自动更新检查
        log.info('check for update');
        autoUpdater.checkForUpdatesAndNotify();
    })
}