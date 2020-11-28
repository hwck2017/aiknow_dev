// /1/2.cpp -> 2.cpp
function getFileName(path) {
    var pos;
    if (process.platform === "win32") pos = path.lastIndexOf("\\");
    else pos = path.lastIndexOf("/");

    return path.substring(pos + 1);
}

// /1/2.cpp -> 1
function getDir(path) {
    var pos;
    if (process.platform === 'win32')
        pos = path.lastIndexOf("\\")
    else
        pos = path.lastIndexOf('/')

    return path.substring(0, pos + 1);
}

// 1.cpp -> cpp
function getSuffix(fileName) {
    var strs = fileName.split(".")
    var len = strs.length
    if (len <= 1) {
        return ""
    }

    return strs[len - 1]
}

export {
    getFileName,
    getDir,
    getSuffix
}