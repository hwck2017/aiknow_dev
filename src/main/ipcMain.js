var { ipcMain, dialog, BrowserWindow } = require('electron');
var fs = require('fs');

// document.title = '无标题'

/*
问题：
    1、新建 打开 保存的问题
    2、如果已经保存 第二次保存的时候不提示直接保存
    3、判断文件是否已经保存  改变软件左上角的内容
*/
var isSave = true;   //判断文件是否保存
var currentFile = '';   //保存当前文件的路径

//监听主进程的操作
ipcMain.on('action', function (event, action, data) {
    // console.log(action);
    switch (action) {
        case "new":
            //判断文件是否保存  如果没有保存提示   并保存
            askSaveDialog();
            break;

        case "open":
            //通过dialog打开文件
            var dir = dialog.showOpenDialog({
                properties: ['openFile']
            });

            if (dir) {
                //获取文件内容
                var fsData = fs.readFileSync(dir[0]);
                //将文件内容发送至渲染进程
                BrowserWindow.getFocusedWindow().webContents.send("data", fsData);
            }
            break;

        case "save":
            saveCurrentDoc(data);
            break;
    }
})

//判断文件师傅保存并执行保存功能
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

// 执行保存的方法
function saveCurrentDoc(data) {
    // 当前文件路径不存在
    if (!currentFile) {
        var dir = dialog.showSaveDialog({
            defaultPath: 'a.cpp',
            filters: [
                { name: 'All Files', extensions: ['*'] }
            ]
        });

        if (dir) {
            currentFile = dir;
            fs.writeFileSync(currentFile, data);
            isSave = true;
            //改变软件的标题
            // document.title = currentFile;
        }
    } else {
        fs.writeFileSync(currentFile, data);
        isSave = true;
        // document.title = currentFile;
    }
}
