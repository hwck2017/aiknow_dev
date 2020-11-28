var { ipcMain, dialog, app } = require('electron');
var path = require("path");
const { spawn } = require('child_process')

var myFile = require("../../lib/file")

ipcMain.on('action', (event, action, data) => {
  console.log(action, data);
  switch (action) {
    case "close":
      askSaveDialog();
      break;

    case "install":
      libManage("install", data);
      break;

    case "uninstall":
      libManage("uninstall", data);
      break;
  }
})

ipcMain.on('run', (event, lang, fullPath) => {
  console.log("compile and run: ", fullPath)
  runExec(lang, fullPath)
})

//判断文件是否需要保存, 保存则执行保存操作
function askSaveDialog() {
  var index = dialog.showMessageBox({
    type: "question",
    message: '是否要保存此文件?',
    buttons: ['Yes', 'No']
  })

  console.log(index);
  if (index == 0) {
    saveFile();
  }
}

function libManage(action, lib) {
  exePath = path.dirname(app.getAppPath());

  if (process.platform === 'win32') {
    if (action == "install") {
      manager = exePath + "\\win32\\install.bat";
    } else if (action == "uninstall") {
      manager = exePath + "\\win32\\uninstall.bat";
    } else {
      //nothing to do
    }

    proc = spawn('cmd', ['/c', 'start', 'call', manager, lib])
    proc.on('close', (code) => {
      console.log(`关闭cmd窗口, 返回码 ${code}`);
    });
  } else if (process.platform === 'darwin') {
    if (action == "install") {
      manager = exePath + "/darwin/install.scpt"
    } else if (action == "uninstall") {
      manager = exePath + "/darwin/uninstall.scpt"
    } else {
      //nothing to do
    }

    proc = spawn('osascript', [manager, lib]);
  }
}

// TODO: 需拿到运行结果
function runExec(lang, fullPath) {
  var exePath, fileName;
  exePath = path.dirname(app.getAppPath()); ///Applications/AiknowEditor.app/Contents/Resources
  // dir = myFile.getDir(fullPath);
  fileName = myFile.getFileName(fullPath);
  console.log("app path: %s, file name: %s", exePath, fileName);
  console.log("platform: %s", process.platform);

  var compiler, output, proc;
  if (process.platform === 'win32') {
    if (lang === "cpp") {
      compiler = exePath + "\\win32\\run_cpp.bat";
      output = fileName.substring(0, fileName.indexOf(".")) + ".exe";
      console.log("output file name: %s", output);
      proc = spawn('cmd', ['/c', 'start', 'call', compiler, fullPath, output])
    } else if (lang === "c") {
      compiler = exePath + "\\win32\\run_c.bat";
      output = fileName.substring(0, fileName.indexOf(".")) + ".exe";
      console.log("output file name: %s", output);
      proc = spawn('cmd', ['/c', 'start', 'call', compiler, fullPath, output])
    } else if (lang === "py") {
      compiler = exePath + "\\win32\\run_py.bat";
      proc = spawn('cmd', ['/c', 'start', 'call', compiler, fullPath])
    } else {
      // TODO
    }
  } else if (process.platform === 'darwin') {
    console.log("compile: ", fullPath)
    compiler = exePath + "/darwin/run.scpt"
    proc = spawn('osascript', [compiler, fullPath, lang]);
  } else {
    // TODO
  }

  proc.on('close', (code) => {
    console.log(`关闭cmd窗口, 返回码 ${code}`);
  });
}

ipcMain.on('direct', () => {
  if (process.platform === 'win32') {
    let exePath = path.dirname(app.getAppPath());
    let dir = exePath + "\\Python\\Scripts"
    let script = exePath + "\\win32\\direct.bat"
    console.log("direct to pip3, path: ", dir);
    proc = spawn('cmd', ['/c', 'start', 'call', script, dir])
  }
})

ipcMain.on('common', () => {
  if (process.platform === 'darwin') {
    let exePath = path.dirname(app.getAppPath());
    let script = exePath + "/darwin/init.scpt"
    console.log("install common")
    proc = spawn('osascript', [script]);
  }
})
