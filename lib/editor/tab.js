var tabs = [
    // tabs
    {
        title: "Untitled",
        name: "0",
        content: "",
        filePath: "",
        isSave: false,
        suffix: ""
    }
]

var tabIndex = 0

// var tab = {
//     title: "Untitled",
//     name: "0",
//     content: "",
//     filePath: "",
//     isSave: false 
// }

function getTabs() {
    return tabs
}

function initTab(lang) {
    let name = ++tabIndex + ""
    return {
        title: "Untitled-" + name,
        name: name,
        filePath: "",
        content: "",
        isSave: false,
        suffix: lang,
    }
}

function setTab(title, content, filePath, isSave, suffix) {
    let name = ++tabIndex + ""
    return {
        title: title === "" ? ("Untitled-" + name) : title,
        name: name,
        filePath: filePath,
        content: content,
        isSave: isSave,
        suffix: suffix
    }
}

function addTab(tab) {
    tabs.push(tab)
}

function removeTab(tagName, activeTab) {
    let tmpTabs = tabs
    let activeName = activeTab
    //关掉的tab正好是激活的tab
    if (activeName === tagName) {
        tmpTabs.forEach((tab, index) => {
            if (tab.name === tagName) {
                let nextTab = tmpTabs[index + 1] || tmpTabs[index - 1]
                if (nextTab) {
                    activeName = nextTab.name;
                }
            }
        });
    }

    // 如果关闭的不是当前tab 激活的tab保持不变
    tabs = tmpTabs.filter(tab => tab.name !== tagName)
    return activeName
}

function findTabByName(tagName) {
    let tab = tabs.find(
        e => e.name === tagName
    );

    return tab;
}

function findTabByPath(tagPath) {
    let tab = tabs.find(
        e => e.filePath === tagPath
    );

    return tab;
}

function isEmpty() {
    return (tabs.length === 0)
}

export {
    getTabs,
    initTab,
    setTab,
    addTab,
    removeTab,
    findTabByName,
    findTabByPath,
    isEmpty
}
