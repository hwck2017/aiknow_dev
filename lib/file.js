function getFileName(path) {
    var pos;
    if (process.platform === "win32") pos = path.lastIndexOf("\\");
    else pos = path.lastIndexOf("/");

    return path.substring(pos + 1);
}

function getDir(path) {
    var pos;
    if (process.platform === 'win32')
        pos = path.lastIndexOf("\\")
    else
        pos = path.lastIndexOf('/')

    return path.substring(0, pos + 1);
}

export {
    getFileName,
    getDir
}