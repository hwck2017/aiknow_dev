var { ipcMain, dialog, BrowserWindow } = require('electron');
var fs = require('fs');
var path = require("path");

/*
问题：
    1、新建 打开 保存的问题
    2、如果已经保存 第二次保存的时候不提示，且直接保存
*/
var isSave = true;   //判断文件是否保存
var currentFile = '';   //保存当前文件的路径

ipcMain.on('action', function (event, action, data) {
    // console.log(action);
    switch (action) {
        case "new":
            askSaveDialog();
            break;

        case "open":
            dialog.showOpenDialog({ properties: ['openFile'] })
                .then(result => {
                    // console.log(result.filePaths)
                    if (result.filePaths) {
                        var fsData = fs.readFileSync(result.filePaths[0]);
                        //将文件内容发送至渲染进程
                        BrowserWindow.getFocusedWindow().webContents.send("data", fsData.toString());
                    }
                })
                // .catch(err => { console.log(err) })
            break;

        case "save":
            saveCurrentDoc(data);
            break;
    }
})

//判断文件是否需要保存, 保存则执行保存操作
function askSaveDialog() {
    if (!isSave) {
        var index = dialog.showMessageBox({
            type: "question",
            message: '是否要保存此文件?',
            buttons: ['Yes', 'No']
        })

        if (index == 0) {
            saveCurrentDoc();
        }
    }
}

// 执行保存
function saveCurrentDoc(data) {
    // 当前文件路径不存在
    if (!currentFile) {
        dialog.showSaveDialog({
            defaultPath: '1.cpp',
            filters: [
                { name: 'All Files', extensions: ['*'] }
            ]
        }).then(result => {
            console.log(result)
            if (result.filePath) {
                currentFile = result.filePath;
                fs.writeFileSync(currentFile, data, 'utf-8');
                isSave = true;
            }
        });
    } else {
        fs.writeFileSync(currentFile, data, 'utf-8');
        isSave = true;
    }
}

// let win
// ipcMain.on('newWin', () => {
//     console.log("new window")
//     win = new BrowserWindow({ width: 800, height: 600 });
//     // win.loadFile(path.join('file:', __dirname, 'new.html'));
//     win.loadFile('new.html');
//     win.on("close", function () {
//         win = null;
//     });
// })