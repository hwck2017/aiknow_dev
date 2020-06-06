<template>
  <div>
    <div class="tool-bar">
      <el-row>
        <el-col :span="24">
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
          <el-dropdown size="small" @command="fileOperProc">
            <el-button size="small">
              <i class="el-icon-folder-opened"></i>
              文件
              <i class="el-icon-arrow-down el-icon--right"></i>
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="new">新建</el-dropdown-item>
              <el-dropdown-item command="open">打开</el-dropdown-item>
              <!-- <el-dropdown-item command="save">保存</el-dropdown-item> -->
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
    <div class="ace-editor" ref="ace"></div>
  </div>
</template>
 
<script>
var fs = require("fs");
var iconv = require("iconv-lite");
var { ipcRenderer } = require("electron");
const { dialog } = require("electron").remote;

var myEditor = require("../../../lib/editor/toolbar");
var myFile = require("../../../lib/file");
var myTab = require("../../../lib/editor/tab");
var myStorage = require("../../../lib/storage");

//编程语言选项
const languageOpts = ["PYTHON", "JAVA", "CPP", "C"];
//字体大小选项
const fontSizeOpts = ["超大", "大", "中", "小"];

export default {
  data() {
    return {
      libInstalling: false,
      libs: [
        {
          name: "openpyxl",
          desc: "openpyxl是用于读写Excel 2010文档的Python库",
          status: false
        },
        {
          name: "pygame",
          desc: "pygame是用于开发2D游戏的python库",
          status: false
        },
        {
          name: "PyPDF2",
          desc:
            "PyPDF2是用于处理pdf文件的python库, 它提供了读、写、分割、合并、文件转换等多种操作",
          status: false
        },
        {
          name: "python-docx",
          desc: "python-docx是用于操作word文档的python库",
          status: false
        },
        {
          name: "matplotlib",
          desc: "matplotlib是基于python的图表绘图系统",
          status: false
        },
        {
          name: "seaborn",
          desc: "seaborn是基于python且建立在matplotlib之上的制作统计图形的库",
          status: false
        },
        {
          name: "pandas",
          desc: "pandas是用于数据挖掘和数据分析，同时也提供数据清洗功能的python库，它的使用基础是Numpy",
          status: false
        },
        {
          name: "numpy",
          desc: "numpy是python的一个扩展程序库，支持大量的维度数组与矩阵运算，此外也针对数组运算提供大量的数学函数库",
          status: false
        }
      ],
      problemInfo: {
        code: "",
        path: "",
        lang: "CPP"
      },
      userOpt: {
        languageOpt: "CPP",
        fontSizeOpt: "中",
        editorTheme: "monokai"
      },
      needRun: false,
      languageOpts: languageOpts,
      fontSizeOpts: fontSizeOpts,
      //激活的tab name
      activeTab: "0",
      oldActiveTab: "0",
      //创建的tab集合
      editableTabs: []
    };
  },
  methods: {
    libInstall(row) {
      row.status = true;
      ipcRenderer.send("action", "install", row.name);
    },
    libUninstall(row) {
      row.status = false;
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
        let tab = myTab.initTab();
        this.addTab(tab);
        // myEditor.setSourceCode(tab.content);
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
      // console.log(curTab);
      // console.log(oldTab);

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
      var dir = dialog.showOpenDialog({
        properties: ["openFile"]
      });

      if (dir) {
        let path = dir[0];
        let tab = myTab.findTabByPath(path);
        if (tab !== undefined) {
          return this.$message.success("文件已经被打开");
        }

        let data = fs.readFileSync(path);
        let fileStr = fs.readFileSync(path, { encoding: "binary" });
        var buf = new Buffer(fileStr, "binary"); //先用二进制的方式读入, 再转utf-8
        var data = iconv.decode(buf, "utf-8");
        let fileName = myFile.getFileName(path);
        tab = myTab.setTab(fileName, data, path, true);
        this.addTab(tab);
        myEditor.setSourceCode(data);
      }
    },
    saveFile(saveAs) {
      let code = myEditor.getSourceCode();
      let tab = myTab.findTabByName(this.activeTab);
      if (tab === undefined) {
        // tab全部被删除
        tab = myTab.setTab("", code, "", false);
        this.addTab(tab);
      }

      // 非save_as情况下 如果已经保存 则直接保存 不需要询问保存路径
      if (saveAs === false && tab.isSave) {
        fs.writeFileSync(tab.filePath, code);
        if (this.needRun) {
          ipcRenderer.send("run", this.userOpt.languageOpt, tab.filePath);
          this.needRun = false;
        }
        return;
      }

      var dir = dialog.showSaveDialog(
        {
          defaultPath: "main",
          filters: [
            { name: "CPP", extensions: ["cpp"] },
            { name: "C", extensions: ["c"] },
            { name: "Python", extensions: ["py"] },
            { name: "All Files", extensions: ["*"] }
          ]
        },
        rsp => {
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
      document.addEventListener("keydown", e => {
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
      this.keyWatcher();
    }
  },
  created() {
    setInterval(this.storeData, 1000);
  },
  mounted() {
    this.init();
  }
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
