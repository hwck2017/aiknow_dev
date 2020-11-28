<template>
  <div>
    <div class="tool-bar">
      <el-row :gutter="4">
        <el-col :span="4">
          <el-popover placement="top-start" trigger="hover" content="选择编程语言">
            <el-select
              v-model="userOpt.languageOpt"
              size="small"
              slot="reference"
              @change="langChangeHandle"
            >
              <el-option v-for="(item, idx) in languageOpts" :key="idx" :label="item" :value="item"></el-option>
            </el-select>
          </el-popover>
        </el-col>
        <el-col :span="2">
          <el-popover placement="top-start" trigger="hover" content="调整字体大小">
            <el-select
              v-model="userOpt.fontSizeOpt"
              size="small"
              slot="reference"
              @change="fontSizeChangeHandle"
            >
              <el-option v-for="(item, idx) in fontSizeOpts" :key="idx" :label="item" :value="item"></el-option>
            </el-select>
          </el-popover>
        </el-col>
        <el-col :span="18">
          <el-dropdown size="small" @command="fileOperProc">
            <el-button size="small">
              <i class="el-icon-folder-opened"></i>
              文件
              <i class="el-icon-arrow-down el-icon--right"></i>
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="new">新建</el-dropdown-item>
              <el-dropdown-item command="open">打开</el-dropdown-item>
              <el-dropdown-item command="saveAs">另存为</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
          <el-button size="small" icon="el-icon-s-order" @click="saveFile(false)">保存</el-button>
          <el-dropdown size="small">
            <el-button size="small">
              <i class="el-icon-setting"></i>
              设置
              <i class="el-icon-arrow-down el-icon--right"></i>
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="theme">
                夜间模式
                <el-switch
                  v-model="userOpt.editorTheme"
                  active-color="#13ce66"
                  inactive-color="#eee"
                  active-value="monokai"
                  inactive-value="clouds"
                  @change="themeChangeHandle"
                ></el-switch>
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
          <el-button size="small" icon="el-icon-s-promotion" @click="run">运行</el-button>
          <el-button size="small" icon="el-icon-box" @click="libInstalling = true">Python库管理</el-button>
          <el-button size="small" icon="el-icon-question" @click="clickHelp = true">帮助</el-button>
        </el-col>
      </el-row>
    </div>
    <div>
      <el-tabs
        v-model="activeTab"
        type="card"
        editable
        @edit="handleTabsEdit"
        :before-leave="beforeLeaveHandle"
        @tab-click="clickTab"
      >
        <el-tab-pane
          v-for="(item, index) in editableTabs"
          :key="item.name"
          :label="item.title"
          :name="item.name"
        ></el-tab-pane>
      </el-tabs>
    </div>
    <el-dialog title="库管理" width="80%" :visible.sync="libInstalling">
      <el-table :data="libs">
        <el-table-column property="name" label="名称" width="150"></el-table-column>
        <el-table-column property="desc" label="描述" width="500"></el-table-column>
        <el-table-column property="status" label="状态">
          <template slot-scope="scope">
            <el-button
              type="primary"
              @click="libInstall(scope.row)"
              v-if="scope.row.status === false"
              size="small"
            >安装</el-button>
            <el-button
              type="info"
              @click="libUninstall(scope.row)"
              v-if="scope.row.status"
              size="small"
            >卸载</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
    <el-dialog title="帮助" width="80%" :visible.sync="clickHelp">
      <span>
        <h3>python第三方库自行安装方法</h3>
        <h4>windows版本</h4>
        <ol>
          <li>点击"跳转安装目录"跳转</li>
          <li>执行命令"pip3.exe install python库名称"自行安装python第三方库，例如需要安装pygame，则执行 pip3.exe install pygame</li>
          <li>执行命令"pip3.exe uninstall python库名称"卸载python第三方库</li>
          <el-button type="text" @click="directory">跳转安装目录</el-button>
        </ol>
        <h4>MAC版本</h4>
        <ol>
          <li>查看本地是否已安装python3。查看方法：打开终端窗口，执行python3，如果显示已经安装，请跳到第二步；否则复制链接下载安装包：http://aiknow.oss-cn-beijing.aliyuncs.com/download/python3/python-3.8.3-macosx10.9.pkg</li>
          <li>打开终端，执行命令"pip3 install python库名称"自行安装python第三方库，例如需要安装pyzero，则执行 pip3 install pyzero</li>
          <li>执行命令"pip3 uninstall python库名称"卸载python第三方库</li>
        </ol>
      </span>
    </el-dialog>
    <el-dialog title="温馨提示" width="80%" :visible.sync="prompt">
      <span>
        <h3>为保证使用体验，请检查本地是否已安装Python3，检查方法参考"帮助"。如果未安装请复制链接下载安装包并安装：http://aiknow.oss-cn-beijing.aliyuncs.com/download/python3/python-3.8.3-macosx10.9.pkg</h3>
      </span>
      <span slot="footer" class="dialog-footer">
        <el-checkbox v-model="checked" @change="promptChange">不再提示</el-checkbox>
      </span>
    </el-dialog>
    <div class="ace-editor" ref="ace"></div>
  </div>
</template>
 
<script>
var fs = require("fs");
var jschardet = require("jschardet");
var iconv = require("iconv-lite");
var { ipcRenderer } = require("electron");
const { dialog } = require("electron").remote;

var myEditor = require("../../../lib/editor/toolbar");
var myFile = require("../../../lib/file");
var myTab = require("../../../lib/editor/tab");
var myStorage = require("../../../lib/storage");

//编程语言选项
const languageOpts = ["PYTHON", "CPP", "C"];
//字体大小选项
const fontSizeOpts = ["超大", "大", "中", "小"];

const extensions = [
  [
    "CPP",
    [
      { name: "CPP", extensions: ["cpp"] },
      { name: "C", extensions: ["c"] },
      { name: "Python", extensions: ["py"] },
      { name: "All Files", extensions: ["*"] },
    ],
  ],
  [
    "C",
    [
      { name: "C", extensions: ["c"] },
      { name: "CPP", extensions: ["cpp"] },
      { name: "Python", extensions: ["py"] },
      { name: "All Files", extensions: ["*"] },
    ],
  ],
  [
    "PYTHON",
    [
      { name: "Python", extensions: ["py"] },
      { name: "CPP", extensions: ["cpp"] },
      { name: "C", extensions: ["c"] },
      { name: "All Files", extensions: ["*"] },
    ],
  ],
];

const extMap = new Map(extensions);

export default {
  data() {
    return {
      clickHelp: false,
      libInstalling: false,
      libs: [
        {
          name: "openpyxl",
          desc: "openpyxl是用于读写Excel 2010文档的Python库",
          status: false,
        },
        {
          name: "pygame",
          desc: "pygame是用于开发2D游戏的python库",
          status: false,
        },
        {
          name: "pgzero",
          desc: "pygame Zero是无需模板的游戏开发python库",
          status: false,
        },
        {
          name: "PyPDF2",
          desc:
            "PyPDF2是用于处理pdf文件的python库, 它提供了读、写、分割、合并、文件转换等多种操作",
          status: false,
        },
        {
          name: "python-docx",
          desc: "python-docx是用于操作word文档的python库",
          status: false,
        },
        {
          name: "matplotlib",
          desc: "matplotlib是基于python的图表绘图系统",
          status: false,
        },
        {
          name: "seaborn",
          desc: "seaborn是基于python且建立在matplotlib之上的制作统计图形的库",
          status: false,
        },
        {
          name: "pandas",
          desc:
            "pandas是用于数据挖掘和数据分析，同时也提供数据清洗功能的python库，它的使用基础是Numpy",
          status: false,
        },
        {
          name: "numpy",
          desc:
            "numpy是python的一个扩展程序库，支持大量的维度数组与矩阵运算，此外也针对数组运算提供大量的数学函数库",
          status: false,
        },
        {
          name: "wordcloud",
          desc: "wordcloud是基于python的词云展示第三方库",
          status: false,
        },
        {
          name: "jieba",
          desc: "jieba是一款优秀的Python第三方中文分词库",
          status: false,
        },
        {
          name: "pillow",
          desc:
            "pillow是基于Python的图像处理工具包，它提供了基本的图像处理功能",
          status: false,
        },
        {
          name: "pyautogui",
          desc:
            "pyautogui是纯Python的GUI自动化工具，使用pyautogui可以用程序自动控制鼠标和键盘操作",
          status: false,
        },
        {
          name: "pyperclip",
          desc: "基于python实现读写剪贴板",
          status: false,
        },
        {
          name: "pytesseract",
          desc:
            "tesseract是python的光学字符识别（OCR）工具，可识别并读取嵌入图像中的文本。",
          status: false,
        },
        {
          name: "shutil",
          desc:
            "shutil提供了许多关于文件和文件集合的高级操作，特别提供了支持文件复制和删除的功能",
          status: false,
        },
      ],
      userOpt: {
        languageOpt: "CPP",
        fontSizeOpt: "中",
        editorTheme: "monokai",
      },
      needRun: false,
      languageOpts: languageOpts,
      fontSizeOpts: fontSizeOpts,
      extensions: extMap,
      //激活的tab name
      activeTab: "0",
      oldActiveTab: "0",
      //创建的tab集合
      editableTabs: [],
      prompt: false,
      checked: false,
    };
  },
  methods: {
    promptUpdate() {
      if (process.platform === "darwin") {
        let prompt = myStorage.getFromLS("prompt");
        if (prompt != undefined) this.prompt = prompt;
        else this.prompt = true;
        console.log("prompt: ", this.prompt);
      }
    },
    promptChange() {
      this.prompt = !this.checked;
      myStorage.storeToLS("prompt", this.prompt);
    },
    directory() {
      ipcRenderer.send("direct");
    },
    libInstall(row) {
      row.status = true;
      myStorage.storeToLS("libs", this.libs);
      ipcRenderer.send("action", "install", row.name);
    },
    libUninstall(row) {
      row.status = false;
      myStorage.storeToLS("libs", this.libs);
      ipcRenderer.send("action", "uninstall", row.name);
    },
    themeChangeHandle() {
      myEditor.setTheme(this.userOpt.editorTheme);
      myStorage.storeToLS("userOpt", this.userOpt);
    },
    langChangeHandle() {
      myEditor.setMode(this.userOpt.languageOpt);
      myStorage.storeToLS("userOpt", this.userOpt);
    },
    setupProcess() {},
    fontSizeChangeHandle() {
      myEditor.setFontSize(this.userOpt.fontSizeOpt);
      myStorage.storeToLS("userOpt", this.userOpt);
    },
    addTab(tab) {
      myTab.addTab(tab);
      this.activeTab = tab.name;
    },
    handleTabsEdit(tagName, action) {
      if (action === "add") {
        console.log("bafore add tab, curr active: ", this.activeTab);
        let oldActive = this.activeTab;
        let tab = myTab.initTab();
        this.addTab(tab);
        //新增tab时，发生tab切换，需保存old tab数据
        let oldTab = myTab.findTabByName(oldActive);
        // console.log(oldtab)
        if (oldTab != undefined) {
          oldTab.content = myEditor.getSourceCode();
        }
        myEditor.setSourceCode(tab.content);
        console.log(
          "after add tab, old tab name: ",
          oldActive,
          ", new tab name: ",
          this.activeTab
        );
      } else {
        // remove
        console.log(tagName, this.activeTab);
        this.activeTab = myTab.removeTab(tagName, this.activeTab);
        let curTab = myTab.findTabByName(this.activeTab);
        if (curTab != undefined) {
          myEditor.setSourceCode(curTab.content);
        }

        this.editableTabs = myTab.getTabs();
        if (myTab.isEmpty()) {
          myEditor.setSourceCode("");
        }
      }
    },
    clickTab() {
      // tab切换时，保存原tab数据，获取新tab数据
      let oldTab, curTab;
      console.log("curr active tab", this.activeTab);
      console.log("old active tab:", this.oldActiveTab);

      oldTab = myTab.findTabByName(this.oldActiveTab);
      curTab = myTab.findTabByName(this.activeTab);
      console.log(curTab);
      console.log(oldTab);

      if (oldTab != undefined) {
        oldTab.content = myEditor.getSourceCode();
      }

      if (curTab != undefined) {
        myEditor.setSourceCode(curTab.content);
      }
    },
    beforeLeaveHandle(newName, oldName) {
      // console.log(newName, oldName);
      this.oldActiveTab = oldName;
      return true;
    },
    newFile() {
      this.handleTabsEdit("", "add");
    },
    openFile() {
      dialog.showOpenDialog(
        {
          properties: ["openFile"],
        },
        (dir) => {
          console.log("dir: ", dir);
          let path = dir[0];
          let tab = myTab.findTabByPath(path);
          if (tab !== undefined) {
            return this.$message.success("文件已经被打开");
          }

          let buff = fs.readFileSync(path);
          var info = jschardet.detect(buff);
          console.log(info.encoding)
          // var buff = new Buffer(fileStr, "binary"); //先用二进制的方式读入, 再转utf-8
          let data = iconv.decode(buff, info.encoding);
          console.log("data: ", data);
          let fileName = myFile.getFileName(path);
          tab = myTab.setTab(fileName, data, path, true);
          this.addTab(tab);
          myEditor.setSourceCode(data);
        }
      );
    },
    saveFile(saveAs) {
      let code = myEditor.getSourceCode();
      let tab = myTab.findTabByName(this.activeTab);
      if (tab === undefined) {
        // tab全部被删除
        console.log("tab noexist");
        tab = myTab.setTab("", code, "", false);
        this.addTab(tab);
      }

      // 非save_as情况下 如果已经保存 则直接保存 不需要询问保存路径
      console.log("tab is saved: ", tab.isSave);
      if (saveAs === false && tab.isSave) {
        fs.writeFileSync(tab.filePath, code);
        console.log("save as ok");
        if (this.needRun) {
          console.log("run: ", this.userOpt.languageOpt, "+", tab.filePath);
          ipcRenderer.send("run", this.userOpt.languageOpt, tab.filePath);
          this.needRun = false;
        }
        return;
      }

      // console.log("extensions: ", this.extensions, "lang: ", this.userOpt.languageOpt)
      // console.log("select extension: ", this.extensions.get(this.userOpt.languageOpt))

      var dir = dialog.showSaveDialog(
        {
          defaultPath: "main",
          filters: this.extensions.get(this.userOpt.languageOpt),
        },
        (rsp) => {
          if (rsp === undefined || rsp === null) {
            return this.$message.warning("请选择文件保存路径");
          }

          let tab = myTab.findTabByName(this.activeTab);
          if (tab === undefined) {
            tab = myTab.initTab();
            this.addTab(tab);
          }
          tab.isSave = true;
          tab.filePath = rsp;
          tab.title = myFile.getFileName(rsp);
          tab.content = myEditor.getSourceCode();
          fs.writeFileSync(tab.filePath, myEditor.getSourceCode());
          if (this.needRun) {
            ipcRenderer.send("run", this.userOpt.languageOpt, tab.filePath);
            this.needRun = false;
          }
        }
      );
    },
    fileOperProc(cmd) {
      console.log(cmd);
      switch (cmd) {
        case "new":
          this.newFile();
          break;
        case "open":
          this.openFile();
          break;
        case "save":
          this.saveFile(false);
          break;
        case "saveAs":
          this.saveFile(true);
          break;
      }
    },
    // 保存编辑器内容到本地
    storeData() {
      let code = myEditor.getSourceCode();
      //内容为空或者未发生改变则不保存
      if (code === "" || code === myStorage.getFromSS("codeEditor")) return;

      myStorage.storeToSS("codeEditor", code);
    },
    readFromStorage() {
      let code = myStorage.getFromSS("codeEditor");
      if (code) myEditor.setSourceCode(code);
    },
    // 本地测试运行
    run() {
      this.needRun = true;
      this.saveFile(false);
    },
    keyWatcher() {
      // js监听键盘ctrl + s快捷键保存;
      document.addEventListener("keydown", (e) => {
        if (
          e.keyCode == 83 &&
          (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)
        ) {
          e.preventDefault();
          console.log(e);
          this.saveFile(false);
        }
      });
    },
    init() {
      this.editableTabs = myTab.getTabs();
      myEditor.init(this.$refs.ace);
      this.readFromStorage();
      let userOpt = myStorage.getFromLS("userOpt");
      if (userOpt) {
        this.userOpt = userOpt;
        myEditor.setMode(this.userOpt.languageOpt);
        myEditor.setFontSize(this.userOpt.fontSizeOpt);
        myEditor.setTheme(this.userOpt.editorTheme);
      }
      console.log(this.userOpt);

      let libs = myStorage.getFromLS("libs");
      if (libs) {
        // 版本升级后lib增加时，需要将新增的和原来的融合起来
        console.log("libs status: ", libs);
        for (var i = 0; i < libs.length; i++) {
          console.log(
            "stored status of python lib ",
            libs[i].name,
            " is ",
            libs[i].status
          );
          for (var j = 0; j < this.libs.length; j++) {
            if (libs[i].name === this.libs[j].name) {
              console.log(
                "status of python lib ",
                libs[i].name,
                " change from ",
                this.libs[j].status,
                " to ",
                libs[i].status
              );
              this.libs[j].status = libs[i].status;
              break;
            }
          }
        }
      }

      this.keyWatcher();
    },
  },
  created() {
    setInterval(this.storeData, 1000);
  },
  mounted() {
    this.init();
    this.promptUpdate();
  },
};
</script>

<style scoped>
.ace-editor {
  width: 100%;
}

.tool-bar {
  margin: 10px 0;
  width: 99%;
  height: 30px;
  background-color: #eee;
  border: 1px solid #409eff;
  padding: 4px;
}
</style>
