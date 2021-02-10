const { app } = require('electron');
const path = require("path");
const ChildProcess = require("child_process");
const myFile = require("../lib/file");
const { SingleEntryPlugin } = require('webpack');

module.exports = {
    compile(language, filePath, callback) {
        switch (language) {
            case 'c':
                return this.compileC(filePath, callback);
            case 'cpp':
                return this.compileCpp(filePath, callback);
            case 'py':
                return filePath;
            default:
                console.log("invalid language: ", language);
                break
        }
    },

    run(language, execFile, callback) {
        switch (language) {
            case 'c':
            case "cpp":
                this.runc(execFile, callback);
                break;
            case 'py':
                this.runPython(execFile, callback);
                break;
            default:
                console.log("invalid language: ", language);
                break;
        }
    },

    compileCpp(filePath, callback) {
        let appPath, compiler, fileName, output;
        ///Applications/AiknowEditor.app/Contents/Resources
        // appPath = path.dirname(app.getAppPath());
        fileName = myFile.getFileName(filePath);
        if (process.platform === 'win32') {
            output = fileName.substring(0, fileName.indexOf(".")) + ".exe";
            compiler = appPath + "\\resources\\MinGW64\\bin\\g++.exe";
            output = "C:\\Users\\Administrator\\AppData\\Local\\Programs\\" + output;
            console.log("output file name: %s", output);
            this.spawn(compiler, [filePath, "-o", output], callback);
            return output;
        } else if (process.platform === 'darwin') {
            output = filePath.substring(0, filePath.indexOf("."))
            // console.log("compile cpp output: ", output)
            this.spawn("g++", [filePath, "-o", output], callback);
            return output;
        } else {
            // nothing to do
        }
    },

    compileC(filePath) {
        let appPath, compiler, fileName, output;
        // appPath = path.dirname(app.getAppPath()); ///Applications/AiknowEditor.app/Contents/Resources
        fileName = myFile.getFileName(filePath);
        if (process.platform === 'win32') {
            output = fileName.substring(0, fileName.indexOf(".")) + ".exe";
            compiler = appPath + "\\resources\\MinGW64\\bin\\gcc.exe";
            output = "C:\\Users\\Administrator\\AppData\\Local\\Programs\\" + output;
            // console.log("output file name: %s", output);
            this.spawn(compiler, [filePath, "-o", output], callback);
            return output;
        } else if (process.platform === 'darwin') {
            output = filePath.substring(0, filePath.indexOf("."));
            this.spawn("gcc", [filePath, "-o", output], callback);
            return output;
        } else {
            // nothing to do
        }
    },

    runc(execFile, callback) {
        console.log(execFile);
        this.spawn(execFile, [], callback);
    },

    runPython(execFile, callback) {
        let runner;
        // appPath = path.dirname(app.getAppPath());
        if (process.platform === 'win32') {
            runner = appPath + "\\resources\\Python\\python.exe"
            this.spawn(runner, [execFile], callback);
        } else if (process.platform === 'darwin') {
            this.spawn("python3", [execFile], callback);
            // setTimeout(function () { console.log("Hello"); }, 3000);
        } else {

        }
    },

    spawn(command, args, callback) {
        let error;
        let spawnedProcess;
        let stdout = "";
        let stderr = "";
        let stdin = "";

        try {
            spawnedProcess = ChildProcess.spawn(command, args, {
                // stdio: 'inherit',
                detached: true,
            });
        } catch (error) {
            process.nextTick(() => callback && callback(error, stdout, stderr));
            return;
        }

        // console.log("spawnedProcess: ", spawnedProcess)
        spawnedProcess.stdout.on("data", (data) => {
            stdout += data;
            // console.log("stdout: ", stdout)
        });
        spawnedProcess.stdin.on("data", (data) => {
            stdin += data;
            // console.log("stdin: ", stdout)
        });
        spawnedProcess.stderr.on("data", (data) => {
            stderr += data;
            // console.log("stderr: ", stderr)
        });
        spawnedProcess.on("error", (processError) => {
            error = processError;
            // console.log("error: ", error)
        });
        spawnedProcess.on("close", (code, signal) => {
            if (!error && code !== 0) {
                error = new Error(
                    `Command failed: ${signal != null ? signal : code}`
                );
            }

            if (error) {
                if (error.code == null) error.code = code;
                if (error.stdout == null) error.stdout = stdout;
            }

            callback && callback(error, stdout, stderr);
        });

        // This is necessary if using Powershell 2 on Windows 7 to get the events to raise
        // http://stackoverflow.com/questions/9155289/calling-powershell-from-nodejs
        return spawnedProcess.stdin.end();
    }
}
