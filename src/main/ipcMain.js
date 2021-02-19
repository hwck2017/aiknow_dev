var { ipcMain, dialog, app } = require('electron');
var path = require("path");
const { spawn } = require('child_process');
const ChildProcess = require('child_process');

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

// ipcMain.on('run', (event, lang, fullPath) => {
//   console.log("compile and run: ", fullPath)
//   runExec(lang, fullPath)
// })

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

    spawn('cmd', ['/c', 'start', 'call', manager, lib], (err, stdout) => {
      console.log(err, stdout)
    })
  } else if (process.platform === 'darwin') {
    if (action == "install") {
      manager = exePath + "/darwin/install.scpt"
    } else if (action == "uninstall") {
      manager = exePath + "/darwin/uninstall.scpt"
    } else {
      //nothing to do
    }

    spawn('osascript', [manager, lib], (err, stdout) => {
      console.log(err, stdout)
    });
  }
}

// TODO: 需拿到运行结果
// function runExec(lang, fullPath) {
//   var exePath, fileName;
//   exePath = path.dirname(app.getAppPath()); ///Applications/AiknowEditor.app/Contents/Resources
//   // dir = myFile.getDir(fullPath);
//   fileName = myFile.getFileName(fullPath);
//   console.log("app path: %s, file name: %s", exePath, fileName);
//   console.log("platform: %s", process.platform);

//   var compiler, output, proc;
//   if (process.platform === 'win32') {
//     if (lang === "cpp") {
//       compiler = exePath + "\\win32\\run_cpp.bat";
//       output = fileName.substring(0, fileName.indexOf(".")) + ".exe";
//       console.log("output file name: %s", output);
//       spawn('cmd', ['/c', 'start', 'call', compiler, fullPath, output], (err, stdout) => {
//         console.log(err, stdout)
//       })
//     } else if (lang === "c") {
//       compiler = exePath + "\\win32\\run_c.bat";
//       output = fileName.substring(0, fileName.indexOf(".")) + ".exe";
//       console.log("output file name: %s", output);
//       spawn('cmd', ['/c', 'start', 'call', compiler, fullPath, output], (err, stdout) => {
//         console.log(err, stdout)
//       })
//     } else if (lang === "py") {
//       compiler = exePath + "\\win32\\run_py.bat";
//       spawn('cmd', ['/c', 'start', 'call', compiler, fullPath], (err, stdout) => {
//         console.log(err, stdout)
//       })
//     } else {
//       // TODO
//     }
//   } else if (process.platform === 'darwin') {
//     console.log("compile: ", fullPath)
//     compiler = exePath + "/darwin/run.scpt"
//     spawn('osascript', [compiler, fullPath, lang], (err, stdout) => {
//       console.log(err, stdout)
//     });
//     // spawn('python', [fullPath], (err, stdout, stderr) => {
//     //     console.log("err: ", err, "stdout123: ", stdout, "stderr123: ", stderr)
//     //   })
//   } else {
//     // TODO
//   }
// }

ipcMain.on('direct', () => {
  if (process.platform === 'win32') {
    let exePath = path.dirname(app.getAppPath());
    let dir = exePath + "\\Python\\Scripts"
    let script = exePath + "\\win32\\direct.bat"
    console.log("direct to pip3, path: ", dir);
    spawn('cmd', ['/c', 'start', 'call', script, dir], (err, stdout) => {
      console.log(err, stdout)
    })
  }
})

ipcMain.on('common', () => {
  if (process.platform === 'darwin') {
    let exePath = path.dirname(app.getAppPath());
    let script = exePath + "/darwin/init.scpt"
    console.log("install common")
    spawn('osascript', [script], (err, stdout) => {
      console.log(err, stdout)
    });
  }
})

// function spawn(command, args, callback) {
//   let error;
//   let spawnedProcess;
//   let stdout = '';
//   let stderr = '';

//   try {
//     spawnedProcess = ChildProcess.spawn(command, args);
//   } catch (error) {
//     process.nextTick(() => callback && callback(error, stdout));
//     return;
//   }

//   spawnedProcess.stdout.on('data', data => {
//     stdout += data;
//   });
//   spawnedProcess.stderr.on('data', data=> {
//     stderr += data;
//   });
//   spawnedProcess.on('error', processError => {
//     error = processError;
//   });
//   spawnedProcess.on('close', (code, signal) => {
//     if (!error && code !== 0) {
//       error = new Error(`Command failed: ${signal != null ? signal : code}`);
//     }

//     if (error) {
//       if (error.code == null) error.code = code;
//       if (error.stdout == null) error.stdout = stdout;
//     }

//     callback && callback(error, stdout, stderr);
//   });

//   // This is necessary if using Powershell 2 on Windows 7 to get the events to raise
//   // http://stackoverflow.com/questions/9155289/calling-powershell-from-nodejs
//   return spawnedProcess.stdin.end();
// }
