var TAB_STATUS = {
  "NOT_SAVE": 0,
  "SAVING": 1,
  "SAVED": 2
};

var tabs = [
  // tabs
  {
    title: "Welcome",
    name: "0", //tabIndex
    fullName: "welcome",
    content: "",
    filePath: "",
    isSave: TAB_STATUS.NOT_SAVE,
    suffix: "",

    cloudTitle: "Welcome",
    cloudName: "Welcome",
    cloudIsSave: TAB_STATUS.NOT_SAVE,
    sha1: "",
  }
]

var tabIndex = 0

function getTabs() {
  return tabs
}

function genFullName(title, suffix) {
  return title + "." + suffix
}

function initTab(lang) {
  let name = ++tabIndex + ""
  let newTitle = "Untitled-" + name
  let newFullName = genFullName(newTitle, lang)

  return {
    name: name,

    title: newTitle,
    fullName: newFullName,
    filePath: "",
    content: "",
    isSave: TAB_STATUS.NOT_SAVE,
    suffix: lang,

    cloudTitle: newTitle,
    cloudName: newFullName,
    cloudIsSave: TAB_STATUS.NOT_SAVE,
    sha1: "",
  }
}

function setTab(title, content, filePath, isSave, suffix, cloudTitle, cloudIsSave, sha1) {
  let name = ++tabIndex + ""
  let newLocalTitle = (title === "") ? ("Untitled-" + name) : title
  let newCloudTitle = (cloudTitle === "") ? ("Untitled-" + name) : cloudTitle
  let newLocalFullName = genFullName(newLocalTitle, suffix)
  let newCloudFullName = genFullName(newCloudTitle, suffix);
  // 未保存到云端, 则云端名称与本地文件名称保持一致
  if (cloudIsSave != TAB_STATUS.SAVED) {
    newCloudTitle = newLocalTitle
    newCloudFullName = newLocalFullName
  }

  return {
    name: name,

    title: newLocalTitle,
    fullName: newLocalFullName,
    filePath: filePath,
    content: content,
    isSave: isSave,
    suffix: suffix,

    cloudTitle: newCloudTitle,
    cloudName: newCloudFullName,
    cloudIsSave: cloudIsSave,
    sha1: sha1
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
  TAB_STATUS,
  getTabs,
  initTab,
  setTab,
  addTab,
  removeTab,
  findTabByName,
  findTabByPath,
  isEmpty
}
