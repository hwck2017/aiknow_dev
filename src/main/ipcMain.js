var { ipcMain, dialog, BrowserWindow, app } = require('electron');
var fs = require('fs');
var path = require("path");
const { spawn } = require('child_process')

var myFile = require("../../lib/file")

ipcMain.on('action', function (event, action, data) {
  console.log(action);
  switch (action) {
    case "close":
      askSaveDialog(data);
      break;

    case "open":
      openFile();
      break;

    case "save":
      saveFile(data);
      break;
  }
})

//判断文件是否需要保存, 保存则执行保存操作
function askSaveDialog(data) {
  var index = dialog.showMessageBox({
    type: "question",
    message: '是否要保存此文件?',
    buttons: ['Yes', 'No']
  })

  console.log(index);
  if (index == 0) {
    saveFile(data);
  }
}

function openFile() {
  var dir = dialog.showOpenDialog({
    properties: ['openFile']
  });

  if (dir) {
    //将文件路径发送至渲染进程
    console.log(dir)
    BrowserWindow.getFocusedWindow().webContents.send("open", dir[0]);
  }
}

// 执行保存
function saveFile(data) {
  var dir = dialog.showSaveDialog({
    defaultPath: 'main',
    filters: [
      { name: "CPP", extensions: ['cpp'] },
      { name: 'C', extensions: ['c'] },
      { name: "Python", extensions: ['py'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  }, res => {
    BrowserWindow.getFocusedWindow().webContents.send('save', res);
  });
}

// TODO: 需拿到运行结果
function runExec(lang, fullPath) {
  var exePath, dir, fileName;
  exePath = path.dirname(app.getAppPath());
  dir = myFile.getDir(fullPath);
  fileName = myFile.getFileName(fullPath);
  console.log("app path: %s, file dir: %s, file name: %s", exePath, dir, fileName);
  console.log("platform: %s", process.platform);

  var compiler, output, proc;
  if (process.platform === 'win32') {
    if (lang === "CPP") {
      compiler = exePath + "\\win32\\run_cpp.bat";
      output = dir + fileName.substring(0, fileName.indexOf(".")) + ".exe";
      console.log("output file name: %s", output);
      proc = spawn('cmd', ['/c', 'start', 'call', compiler, fullPath, output])
    } else if (lang === "C") {
      compiler = exePath + "\\win32\\run_c.bat";
      output = dir + fileName.substring(0, fileName.indexOf(".")) + ".exe";
      console.log("output file name: %s", output);
      proc = spawn('cmd', ['/c', 'start', 'call', compiler, fullPath, output])
    } else if (lang === "PYTHON") {
      compiler = exePath + "\\win32\\run_py.bat";
      proc = spawn('cmd', ['/c', 'start', 'call', compiler, fullPath])
    } else {
      // TODO
    }

  } else if (process.platform === 'darwin') {
    compiler = exePath + "/script/appscrpt.scpt"
    proc = spawn('osascript', [compiler, fullPath, lang]);
  } else {
    // TODO
  }

  proc.on('close', (code) => {
    console.log(`关闭cmd窗口, 返回码 ${code}`);
  });
}

ipcMain.on('run', function (event, lang, fullPath) {
  runExec(lang, fullPath)
})

