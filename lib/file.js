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

function getFileNameWithoutSuffix(fileName) {
    var strs = fileName.split(".")
    var len = strs.length
    if (len <= 1) {
        return fileName
    }

    if (len <= 2) {
        return strs[0]
    }

    let name;
    for (var i = 0; i < len - 2; i++) {
        name += strs[i] + "."
    }
    name += strs[len - 1]
    return name
}

export {
    getFileName,
    getDir,
    getSuffix,
    getFileNameWithoutSuffix
}