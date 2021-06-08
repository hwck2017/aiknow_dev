<template>
  <div class="warp">
    <div class="tool-bar">
      <el-row :gutter="10">
        <el-col>
          <el-dropdown size="medium" @command="fileOperProc">
            <el-button class="toolBtn" size="medium">
              <!-- <i class="el-icon-folder-opened"></i> -->
              文件
              <i class="el-icon-arrow-down el-icon--right"></i>
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="new">新建</el-dropdown-item>
              <el-dropdown-item command="open">打开</el-dropdown-item>
              <el-dropdown-item command="save">保存</el-dropdown-item>
              <el-dropdown-item command="saveAs">另存为</el-dropdown-item>
              <el-dropdown-item command="openCloudDisk"
                >打开云端</el-dropdown-item
              >
              <el-dropdown-item command="uploadCloudDisk"
                >上传到云端</el-dropdown-item
              >
            </el-dropdown-menu>
          </el-dropdown>
          <el-button class="toolBtn" size="medium" @click="run">运行</el-button>
          <el-dropdown size="medium" @command="setCmdHandle">
            <el-button class="toolBtn" size="medium">
              <!-- <i class="el-icon-setting"></i> -->
              设置
              <i class="el-icon-arrow-down el-icon--right"></i>
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="frontSize">
                字体大小
              </el-dropdown-item>
              <el-dropdown-item divided command="theme">
                夜间模式
                <el-switch
                  v-model="userOpt.editorTheme"
                  active-color="#eee"
                  inactive-color="#13ce66"
                  active-value="clouds"
                  inactive-value="monokai"
                  @change="themeChangeHandle"
                ></el-switch>
              </el-dropdown-item>
              <el-dropdown-item divided command="libs">
                Python库管理
              </el-dropdown-item>
              <el-dropdown-item divided command="help"> 帮助 </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </el-col>
      </el-row>
    </div>
    <div class="topTabDiv">
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
        <el-table-column
          property="name"
          label="名称"
          width="150"
        ></el-table-column>
        <el-table-column
          property="desc"
          label="描述"
          width="500"
        ></el-table-column>
        <el-table-column property="status" label="状态">
          <template slot-scope="scope">
            <el-button
              type="primary"
              @click="libInstall(scope.row)"
              v-if="scope.row.status === false"
              size="small"
              >安装</el-button
            >
            <el-button
              type="info"
              @click="libUninstall(scope.row)"
              v-if="scope.row.status"
              size="small"
              >卸载</el-button
            >
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
          <li>
            执行命令"pip3.exe install
            python库名称"自行安装python第三方库，例如需要安装pygame，则执行
            pip3.exe install pygame
          </li>
          <li>执行命令"pip3.exe uninstall python库名称"卸载python第三方库</li>
          <el-button type="text" @click="directory">跳转安装目录</el-button>
        </ol>
        <h4>MAC版本</h4>
        <ol>
          <li>
            查看本地是否已安装python3。查看方法：打开终端窗口，执行python3，如果显示已经安装，请跳到第二步；否则复制链接下载安装包：http://aiknow.oss-cn-beijing.aliyuncs.com/download/python3/python-3.8.3-macosx10.9.pkg
          </li>
          <li>
            打开终端，执行命令"pip3 install
            python库名称"自行安装python第三方库，例如需要安装pyzero，则执行 pip3
            install pyzero
          </li>
          <li>执行命令"pip3 uninstall python库名称"卸载python第三方库</li>
        </ol>
      </span>
    </el-dialog>
    <el-dialog title="温馨提示" width="80%" :visible.sync="prompt">
      <span>
        <h3>
          为保证使用体验，请检查本地是否已安装Python3，检查方法参考"帮助"。如果未安装请复制链接下载安装包并安装：http://aiknow.oss-cn-beijing.aliyuncs.com/download/python3/python-3.8.3-macosx10.9.pkg
        </h3>
      </span>
      <span slot="footer" class="dialog-footer">
        <el-checkbox v-model="checked" @change="promptChange"
          >不再提示</el-checkbox
        >
      </span>
    </el-dialog>
    <el-dialog
      title="请输入字体大小, 取值[10, 100]"
      width="30%"
      :visible.sync="setSize"
    >
      <el-input v-model="userOpt.fontSize"></el-input>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setSize = false">取 消</el-button>
        <el-button type="primary" @click="fontSizeChangeHandle"
          >确 定</el-button
        >
      </span>
    </el-dialog>
    <el-dialog title="请选择编程语言" width="40%" :visible.sync="selectLang">
      <el-radio-group v-model="userOpt.languageOpt">
        <el-radio label="cpp" border>CPP</el-radio>
        <el-radio label="c" border>C</el-radio>
        <el-radio label="py" border>PYTHON</el-radio>
      </el-radio-group>
      <span slot="footer" class="dialog-footer">
        <el-button @click="selectLang = false">取 消</el-button>
        <el-button type="primary" @click="addLangTab">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog title="打开文件" width="70%" :visible.sync="openCloudDisk">
      <el-row>
        <el-col :span="5">
          <el-card
            v-for="(item, index) in cloudFiles"
            :key="index"
            class="box-card"
          >
            <div @dblclick="downloadFile(item.sha1)">
              <div class="fileName">
                {{ item.name }}
              </div>
              <div class="time">上传时间: {{ item.upload_at }}</div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </el-dialog>
    <div class="editorDiv" v-bind:style="{ height: editorHeight + 'px' }">
      <div class="ace-editor" ref="ace" v-on:keyup.enter="checkHeight"></div>
      <div class="runBtn" @click="run">
        <i class="el-icon-caret-right"></i>
        运行
      </div>
    </div>
    <!-- for terminal -->
    <div
      class="terminalDiv"
      ref="terminalDiv"
      :style="{ height: terminalHeight + 'px' }"
    >
      <VueDragResize
        :isActive="true"
        :isDraggable="false"
        v-on:resizing="resizeHandle"
        v-on:resizestop="resizeOver"
        axis="x"
        :w="terminalWidth"
        :h="terminalHeight"
        :sticks="['tm']"
      >
        <div class="terminalTitle">
          控制台
          <i class="el-icon-close" @click="closeTerminal()"></i>
        </div>
        <div
          class="terminal"
          ref="terminal"
          :style="{
            height: terminalHeight - 30 + 'px',
            width: terminalWidth + 'px',
          }"
        ></div>
      </VueDragResize>
    </div>
  </div>
</template>
 
<script>
var fs = require("fs");
var jschardet = require("jschardet");
var iconv = require("iconv-lite");
var { ipcRenderer } = require("electron");
var path = require("path");
const { dialog, app } = require("electron").remote;

var myEditor = require("../../../lib/editor/toolbar");
var myFile = require("../../../lib/file");
var myTab = require("../../../lib/editor/tab");
var myStorage = require("../../../lib/storage");

const extensions = [
  ["cpp", [{ name: "CPP", extensions: ["cpp"] }]],
  ["c", [{ name: "C", extensions: ["c"] }]],
  ["py", [{ name: "Python", extensions: ["py"] }]],
];

// for terminal
import { Terminal } from "xterm";
import os from "os";
import "xterm/dist/xterm.css";
import * as fit from "xterm/lib/addons/fit/fit";
import * as attach from "xterm/lib/addons/attach/attach";
import VueDragResize from "vue-drag-resize";

const pty = require("node-pty");
Terminal.applyAddon(fit);
Terminal.applyAddon(attach);

const extMap = new Map(extensions);

export default {
  components: {
    VueDragResize,
  },

  data() {
    return {
      clickHelp: false,
      setSize: false,
      selectLang: false,

      openCloudDisk: false,
      cloudDiskDomain: "http://127.0.0.1:12345",
      cloudFiles: [
        // just for test
        {
          name: "test",
          sha1: "40bd001563085fc35165329ea1ff5c5ecbdbbeef",
          upload_at: "2021-06-06 08:40:11",
        },
        {
          name: "test1",
          sha1: "40bd001563085fc35165329ea1ff5c5ecbdbbeef",
          upload_at: "2021-06-06 09:40:11",
        },
        {
          name: "test2",
          sha1: "40bd001563085fc35165329ea1ff5c5ecbdbbeef",
          upload_at: "2021-06-06 10:40:11",
        },
      ],
      libInstalling: false,
      opencmd: false,
      libs: [
        {
          name: "openpyxl",
          desc: "openpyxl是用于读写Excel 2010文档的Python库",
          status: false,
        },
        // {
        //   name: "pygame",
        //   desc: "pygame是用于开发2D游戏的python库",
        //   status: false,
        // },
        // {
        //   name: "pgzero",
        //   desc: "pygame Zero是无需模板的游戏开发python库",
        //   status: false,
        // },
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
        // {
        //   name: "numpy",
        //   desc:
        //     "numpy是python的一个扩展程序库，支持大量的维度数组与矩阵运算，此外也针对数组运算提供大量的数学函数库",
        //   status: false,
        // },
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
        languageOpt: "cpp",
        fontSize: 20,
        editorTheme: "clouds",
      },
      needRun: false,
      extensions: extMap,
      //激活的tab name
      activeTab: "0",
      oldActiveTab: "0",
      //创建的tab集合
      editableTabs: [],
      prompt: false,
      checked: false,
      output: "",
      resultErr: "",
      resultOut: "",
      errno: 0,
      restoreTimer: 0,

      // for terminal
      xterm: null,
      ptyProcess: null,
      rows: 20,
      cols: 120,
      cwd: os.homedir(), // /var/root
      isInit: false,
      foreground: "#fff",
      background: "#414449",

      isShowTerminal: false,
      tempScreenWidth: 0,
      editorHeight:
        document.documentElement.clientHeight -
        0.03646 * document.documentElement.clientWidth -
        40,
      screenHeight: document.documentElement.clientHeight,
      screenWidth: document.documentElement.clientWidth,

      terminalWidth: document.documentElement.clientWidth,
      terminalHeight: 340,
      editorHeightVar:
        document.documentElement.clientHeight -
        0.03646 * document.documentElement.clientWidth -
        40 +
        "px",
      tempTop: 0,
      editorMaxHeight: 0,
      lineHeight: 0,
    };
  },
  methods: {
    changeFixed() {
      this.isShowTerminalHandle();
      this.checkHeight();
    },
    checkHeight() {
      let aceLines = document.getElementsByClassName("ace_line");
      this.lineHeight = aceLines.length * 27 + 200;

      let ace_gutter = document.getElementsByClassName("ace_gutter")[0];
      let ace_content = document.getElementsByClassName("ace_content")[0];
      var ace_scroller = document.getElementsByClassName("ace_scroller")[0];
      var ace_printmarginlayer = document.getElementsByClassName(
        "ace_print-margin-layer"
      )[0];
      var ace_markerlayerone = document.getElementsByClassName(
        "ace_marker-layer"
      )[0];
      var ace_markerlayertwo = document.getElementsByClassName(
        "ace_marker-layer"
      )[1];
      var ace_textlayer = document.getElementsByClassName("ace_text-layer")[0];
      var ace_cursorlayer = document.getElementsByClassName(
        "ace_cursor-layer"
      )[0];

      if (ace_gutter.clientHeight < this.lineHeight) {
        ace_gutter.style.height = this.lineHeight + "px";
        ace_content.style.height = this.lineHeight + "px";
        ace_scroller.style.height = this.lineHeight + "px";

        ace_printmarginlayer.style.height = this.lineHeight + "px";
        ace_markerlayerone.style.height = this.lineHeight + "px";
        ace_markerlayertwo.style.height = this.lineHeight + "px";
        ace_textlayer.style.height = this.lineHeight + "px";
        ace_cursorlayer.style.height = this.lineHeight + "px";
      } else {
        ace_gutter.style.height = ace_gutter.clientHeight + "px";
        ace_content.style.height = ace_gutter.clientHeight + "px !important";
        ace_scroller.style.height = ace_gutter.clientHeight + "px";

        ace_printmarginlayer.style.height = ace_gutter.clientHeight + "px";
        ace_markerlayerone.style.height = ace_gutter.clientHeight + "px";
        ace_markerlayertwo.style.height = ace_gutter.clientHeight + "px";
        ace_textlayer.style.height = ace_gutter.clientHeight + "px";
        ace_cursorlayer.style.height = ace_gutter.clientHeight + "px";
      }

      console.log("lineHeight: ", ace_gutter.style.height);
    },
    resizeHandle(newRect) {
      // console.log (newRect)
      // console.log (newRect);
      // this.vw = newRect.width;
      this.terminalHeight = newRect.height;
      this.terminalHeightVar = this.terminalHeight;

      if (this.tempTop > newRect.top) {
        this.editorHeight = this.editorHeight - (this.tempTop - newRect.top);
      } else {
        this.editorHeight = this.editorHeight + (newRect.top - this.tempTop);
      }
      this.editorHeightVar = this.editorHeight + "px";

      // console.log ('editorHeight:' , this.editorHeight)

      this.tempTop = newRect.top;
      // this.top = newRect.top;
      // this.left = newRect.left;
      // document.getElementsByClassName("xterm-screen")[0].style.height=this.terminalHeight+'px';
      this.xterm.fit();
      this.xterm.scrollToTop();
    },
    resizeOver(newRect) {},
    setCmdHandle(cmd) {
      console.log("set command: ", cmd);
      switch (cmd) {
        case "help":
          this.clickHelp = true;
          break;
        case "libs":
          this.libInstalling = true;
          break;
        case "frontSize":
          this.setSize = true;
          break;
      }
    },
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
    checkSuffixValid(suffix) {
      if (suffix == "cpp" || suffix == "c" || suffix == "py") {
        return true;
      } else {
        console.log("invalid file name suffix: ", suffix);
        return false;
      }
    },
    fontSizeChangeHandle() {
      console.log(this.userOpt.fontSize);
      if (this.userOpt.fontSize > 100) {
        this.userOpt.fontSize = 100;
      } else if (this.userOpt.fontSize < 10) {
        this.userOpt.fontSize = 10;
      }
      myEditor.setFontSize(this.userOpt.fontSize);
      myStorage.storeToLS("userOpt", this.userOpt);
      this.setSize = false;
    },
    addTab(tab) {
      myTab.addTab(tab);
      this.activeTab = tab.name;
    },
    handleTabsEdit(tagName, action) {
      if (action === "add") {
        console.log("bafore add tab, curr active: ", this.activeTab);
        let oldActive = this.activeTab;
        let tab = myTab.initTab(this.userOpt.languageOpt);
        this.addTab(tab);
        //新增tab时，发生tab切换，需保存old tab数据
        let oldTab = myTab.findTabByName(oldActive);
        // console.log(oldtab)
        // 旧tab存在则保存已有代码内容
        if (oldTab != undefined) {
          oldTab.content = myEditor.getSourceCode();
        }
        // 设置编辑器模式 c_cpp or python
        console.log(this.userOpt.languageOpt);
        myEditor.setMode(this.userOpt.languageOpt);
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
          myEditor.setMode(curTab.suffix);
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
        myEditor.setMode(curTab.suffix);
        myEditor.setSourceCode(curTab.content);
      }
    },
    beforeLeaveHandle(newName, oldName) {
      // console.log(newName, oldName);
      this.oldActiveTab = oldName;
      return true;
    },
    addLangTab() {
      this.selectLang = false;
      this.handleTabsEdit("", "add");
    },
    newFile() {
      this.selectLang = true;
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

          var buff = fs.readFileSync(path);
          var info = jschardet.detect(buff);
          console.log(info.encoding);
          // ISO-8859 -> GB2312 -> GBK -> GB18030 编码方式依次扩展, 而且符合向下兼容的规律
          if (
            info.encoding == "ISO-8859-2" ||
            info.encoding == "windows-1252"
          ) {
            info.encoding = "GB18030";
          }

          console.log(
            "encoding support? ",
            iconv.encodingExists(info.encoding)
          );
          var data = iconv.decode(buff, info.encoding);
          let fileName = myFile.getFileName(path);
          let suffix = myFile.getSuffix(fileName);
          if (!this.checkSuffixValid(suffix)) {
            this.$message.success("不支持该文件类型");
            suffix = "cpp";
          }
          tab = myTab.setTab(
            fileName,
            data,
            path,
            myTab.TAB_STATUS.SAVED,
            suffix,
            ""
          );
          this.addTab(tab);
          myEditor.setMode(suffix);
          myEditor.setSourceCode(data);
        }
      );
    },
    saveFile(saveAs) {
      let code = myEditor.getSourceCode();
      console.log("save --> active tab idx: ", this.activeTab);
      let tab = myTab.findTabByName(this.activeTab);
      console.log("save --> curr tab: ", tab);

      if (tab === undefined) {
        // tab全部被删除, 但编辑器中还有内容
        console.log("tab noexist");
        // TODO: 文件后缀填什么
        tab = myTab.setTab("", code, "", myTab.TAB_STATUS.NOT_SAVE, "cpp", "");
        this.addTab(tab);
      }

      // 非save_as情况下 如果已经保存 则直接保存 不需要询问保存路径
      console.log("tab save status: ", tab.isSave);
      if (saveAs === false && tab.isSave === myTab.TAB_STATUS.SAVED) {
        fs.writeFileSync(tab.filePath, code);
        if (this.needRun) {
          console.log("run: ", tab.suffix, "+", tab.filePath);
          this.execRun(tab.suffix, tab.filePath);
          this.needRun = false;
        }

        return;
      }

      // 防止重复保存触发多次弹框
      if (tab.isSave === myTab.TAB_STATUS.SAVING) {
        return;
      }

      var filter;
      //另存为 可改变文件格式, 需要支持全部文件类型选择
      if (saveAs) {
        filter = [
          { name: "CPP", extensions: ["cpp"] },
          { name: "C", extensions: ["c"] },
          { name: "Python", extensions: ["py"] },
          { name: "All Files", extensions: ["*"] },
        ];
      } else {
        if (tab.suffix.length === 0) {
          filter = [
            { name: "CPP", extensions: ["cpp"] },
            { name: "C", extensions: ["c"] },
            { name: "Python", extensions: ["py"] },
            { name: "All Files", extensions: ["*"] },
          ];
        } else {
          filter = this.extensions.get(tab.suffix);
        }
      }

      tab.isSave = myTab.TAB_STATUS.SAVING;

      dialog.showSaveDialog(
        {
          defaultPath: "main",
          filters: filter,
        },
        (rsp) => {
          // let tab = myTab.findTabByName(this.activeTab);
          // if (tab === undefined) {
          //   tab = myTab.initTab();
          //   this.addTab(tab);
          // }

          if (rsp === undefined || rsp === null) {
            tab.isSave = myTab.TAB_STATUS.NOT_SAVE;
            return this.$message.warning("请选择文件保存路径");
          }

          tab.isSave = myTab.TAB_STATUS.SAVED;
          tab.filePath = rsp;
          tab.title = myFile.getFileName(rsp);
          tab.content = myEditor.getSourceCode();
          //另存为可改变文件类型 如1.cpp -> 1.py
          tab.suffix = myFile.getSuffix(tab.title);
          myEditor.setMode(tab.suffix);
          fs.writeFileSync(tab.filePath, myEditor.getSourceCode());
          if (this.needRun) {
            this.execRun(tab.suffix, tab.filePath);
            this.needRun = false;
          }
        }
      );
    },
    ListFileMetadata() {
      if (!this.$store.state.userInfo.isLogin) {
        return this.$message.warning("请先登入");
      }

      let url = this.cloudDiskDomain + "/apis/aiknow/dev/files/meta";
      this.$http.get(url).then((res) => {
        if (res.data.err_code !== 0)
          return this.$message.error(res.data.err_msg);
        console.log("cloud files: ", res.data.data);
        this.cloudFiles = res.data.data;
      });

      this.openCloudDisk = true;
    },
    uploadFile() {
      let code = myEditor.getSourceCode();
      console.log("save --> active tab idx: ", this.activeTab);
      let tab = myTab.findTabByName(this.activeTab);
      console.log("save --> curr tab: ", tab);

      if (tab === undefined) {
        // tab全部被删除, 但编辑器中还有内容
        console.log("tab noexist");
        // TODO: 文件后缀填什么
        tab = myTab.setTab("", code, "", myTab.TAB_STATUS.NOT_SAVE, "cpp", "");
        this.addTab(tab);
      }

      if (!this.$store.state.userInfo.isLogin) {
        return this.$message.warning("请先登入");
      }

      var url = this.cloudDiskDomain + "/apis/aiknow/dev/files";
      var fileData = {
        name: tab.title,
        content: tab.content,
        type: this.userOpt.languageOpt,
      };

      this.$http.post(url, fileData).then((res) => {
        console.log("result of upload file ", fileData.name, " is ", res.data);
        if (res.data.err_code !== 0)
          return this.$message.error(res.data.err_msg);

        tab.title = res.data.data.name;
        tab.sha1 = res.data.data.sha1;
        return this.$message.success("上传成功");
      });
    },
    downloadFile(sha1) {
      console.log("sha1: ", sha1);
      let url = this.cloudDiskDomain + "/apis/aiknow/dev/files?sha1=" + sha1;
      this.$http.get(url).then((res) => {
        if (res.data.err_code !== 0)
          return this.$message.error(res.data.err_msg);
        let fileInfo = res.data.data;
        console.log("file info: ", fileInfo);
        let tab = myTab.setTab(
          fileInfo.name,
          fileInfo.content,
          "",
          myTab.TAB_STATUS.SAVE,
          fileInfo.type,
          fileInfo.sha1
        );
        this.addTab(tab);

        myEditor.setMode(fileInfo.type);
        myEditor.setSourceCode(fileInfo.content);

        this.openCloudDisk = false;
      });
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
        case "openCloudDisk":
          this.ListFileMetadata();
          break;
        case "uploadCloudDisk":
          this.uploadFile();
          break;
      }
    },
    // 保存编辑器内容到本地
    storeData() {
      var code = myEditor.getSourceCode();

      // console.log(this.activeTab);
      var curTab = myTab.findTabByName(this.activeTab);
      // console.log("curr tab: ", curTab);
      if (curTab == undefined) {
        console.log("curr tab undefined!");
        return;
      }

      //内容为空或者未发生改变则不保存
      if (code === "" || code === curTab.content) {
        return;
      }

      if (curTab.isSave !== myTab.TAB_STATUS.SAVED) {
        // console.log("save code to curr tab");
        curTab.content = code;
      }
    },
    readFromStorage() {
      // let code = myStorage.getFromSS("codeEditor");
      // console.log("code: ", code);
      var curTab = myTab.findTabByName(this.activeTab);
      if (curTab) myEditor.setSourceCode(curTab.content);
    },
    // 本地测试运行
    run() {
      this.isShowTerminal = true;
      this.isShowTerminalHandle();
      this.needRun = true;
      this.saveFile(false);
    },
    execRunPy(filePath) {
      let cmd;
      let appDir = path.dirname(app.getAppPath());

      if (process.platform === "darwin") {
        cmd = "python3 " + filePath;
        this.ptyProcess.write(cmd + "\n");
      } else if (process.platform === "win32") {
        // let compiler = appDir + "\\Python\\python.exe";
        // cmd = '"' + compiler + '" "' + filePath + '"';
        let compiler = appDir + "\\win32\\run_py.bat";
        cmd = '"' + compiler + '" "' + filePath + '"';
        this.ptyProcess.write(cmd + "\r\n");
      } else {
        // nothing to do
      }
    },
    execRunCpp(filePath) {
      let cmd;
      let appDir = path.dirname(app.getAppPath());

      if (process.platform === "darwin") {
        cmd = "g++ " + filePath + " -o ./a.out && ./a.out";
        this.ptyProcess.write(cmd + "\n");
      } else if (process.platform === "win32") {
        // appDir = "E:\\Program Files\\AiknowEditor\\resources";
        // let compiler = appDir + "\\MinGW64\\bin\\g++.exe";
        // cmd = '"' + compiler + '" "' + filePath + '"' + " -o a.out && a.out";

        let fileName = myFile.getFileName(filePath);
        let output = fileName.substring(0, fileName.indexOf(".")) + ".exe";
        let compiler = appDir + "\\win32\\run_cpp.bat";
        cmd = '"' + compiler + '" "' + filePath + '" ' + output;
        this.ptyProcess.write(cmd + "\r\n");
      } else {
        // nothing to do
      }
    },
    execRunC(filePath) {
      let cmd;
      let appDir = path.dirname(app.getAppPath());

      if (process.platform === "darwin") {
        cmd = "gcc " + filePath + " -o ./a.out && ./a.out";
        this.ptyProcess.write(cmd + "\n");
      } else if (process.platform === "win32") {
        // let compiler = appDir + "\\MinGW64\\bin\\gcc.exe";
        // cmd = '"' + compiler + '" "' + filePath + '"' + " -o a.out && a.out";

        let fileName = myFile.getFileName(filePath);
        let output = fileName.substring(0, fileName.indexOf(".")) + ".exe";
        let compiler = appDir + "\\win32\\run_c.bat";
        cmd = '"' + compiler + '" "' + filePath + '" ' + output;
        this.ptyProcess.write(cmd + "\r\n");
      } else {
        // nothing to do
      }
    },
    execRun(language, filePath) {
      this.xterm.clear();
      console.log("exec run, language: ", language, " file path: ", filePath);
      switch (language) {
        case "py":
          this.execRunPy(filePath);
          break;
        case "cpp":
          this.execRunCpp(filePath);
          break;
        case "c":
          this.execRunC(filePath);
          break;
        default:
          //nothing to do
          break;
      }
    },
    keyWatcher() {
      document.addEventListener("keydown", (e) => {
        if (
          (e.key === "s" || e.key === "S") &&
          (process.platform === "darwin" ? e.metaKey : e.ctrlKey)
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
        myEditor.setFontSize(this.userOpt.fontSize);
        myEditor.setTheme(this.userOpt.editorTheme);
        // myEditor.setSelectionStyle('text');
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
      // for terminal
      this.initTerminal();
    },
    // for terminal
    initTerminal() {
      if (!this.xterm || !this.ptyProcess) {
        this.isInit = true;
        const shell =
          process.env[
            os.platform() === "win32" ? process.env.COMSPEC : process.env.SHELL
          ];
        let env = process.env;
        env["LC_ALL"] = "zh_CN.UTF-8";
        env["LANG"] = "zh_CN.UTF-8";
        env["LC_CTYPE"] = "zh_CN.UTF-8";

        this.ptyProcess = pty.spawn(shell, [], {
          name: "Terminal",
          cols: this.cols,
          rows: this.rows,
          cwd: process.env.HOME,
          env: env,
          encoding: "utf8",
        });

        console.log("cwd: ", this.cwd);
        this.xterm = new Terminal({
          cols: this.cols,
          rows: this.rows,
          theme: {
            foreground: this.foreground,
            background: this.background,
            cursor: this.foreground,
          },
          cursorBlink: 5,
        });
        this.xterm.open(this.$refs.terminal);
        this.xterm.fit();
        this.xterm.onData((data) => {
          console.log("xterm:", JSON.stringify(data));
          this.ptyProcess.write(data);
        });
        this.ptyProcess.on("data", (data) => {
          console.log("ptyProcess:", JSON.stringify(data), typeof data);
          // let errMsg = "error: expected ';' before";
          // let newData = data.replace(errMsg, "错误：在下面语句之前缺少分号");
          // console.log(newData);
          this.xterm.write(data);
        });
      }

      this.isShowTerminalHandle();
    },
    isShowTerminalHandle() {
      if (this.isShowTerminal) {
        this.$refs.terminalDiv.style.display = "block";
        this.editorHeight =
          document.documentElement.clientHeight -
          0.03646 * document.documentElement.clientWidth -
          40 -
          this.terminalHeight;
        this.editorHeightVar = this.editorHeight + "px";
        this.terminalWidth = document.documentElement.clientWidth;
        this.xterm.fit();
        this.xterm.scrollToTop();
      } else {
        this.$refs.terminalDiv.style.display = "none";
        this.editorHeight =
          document.documentElement.clientHeight -
          0.03646 * document.documentElement.clientWidth -
          40;
        this.editorHeightVar = this.editorHeight + "px";
        this.terminalWidth = document.documentElement.clientWidth;
      }
    },
    closeTerminal() {
      this.isShowTerminal = false;
      this.isShowTerminalHandle();
    },
  },
  created() {
    this.restoreTimer = setInterval(this.storeData, 1000);
  },
  mounted() {
    this.init();
    this.promptUpdate();

    let _this = this;
    _this.changeFixed();
    window.onresize = () => {
      return (() => {
        _this.changeFixed();
      })();
    };

    // var agent = navigator.userAgent.toLowerCase();
    // var isMac = /macintosh|mac os x/i.test(navigator.userAgent);
    // if (agent.indexOf("win32") >= 0 || agent.indexOf("wow32") >= 0) {
    //   alert("这是windows32位系统");
    //   }
    // if (agent.indexOf("win64") >= 0 || agent.indexOf("wow64") >= 0) {
    //   alert("这是windows64位系统");
    // }
    // if (isMac) {
    //   alert("这是mac系统");
    //   let ace_cursor = document.getElementsByClassName("ace_cursor")[0];
    //   ace_cursor.style.marginLeft = "-4px";
    // }
  },

  destroyed() {
    window.onresize = null;
    // console.log("clear timer")
    clearInterval(this.restoreTimer);
  },

  computed: {
    width() {
      return this.cols * 9 + 20 + "px";
    },
    height() {
      return this.rows * 17 + "px";
    },
  },
};
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.editorDiv {
  position: relative;
}

.ace-editor {
  width: 100%;
  margin-top: 40px;
  /* height:  calc(100vh - 3.646vw - 40px - 40px)  !important; */
  overflow-y: visible;
  height: 100% !important;
}

.runBtn {
  position: absolute;
  bottom: 20px;
  right: 35px;
  background: #275ca7;
  color: #fff;
  width: 100px;
  height: 40px;
  border: none;
  border-radius: 22px;
  font-size: 16px;
  padding: 0;
  line-height: 40px;
  text-align: center;
  display: flex;
}

.el-icon-caret-right {
  color: #fff;
  font-size: 26px;
  margin-left: 12px;
  margin-right: 8px;
  margin-top: 7px;
}

/* .runBtn:hover {
  color: #275ca7;
  background: #fff;
}

.runBtn:hover .el-icon-caret-right {
  color: #275ca7;
} */

.topTabDiv {
  position: absolute;
  top: 3.646vw;
  left: 0;
}

.terminalDiv {
  position: absolute;
  /* bottom: 40px; */
  bottom: 0;
  left: 0;
  width: 100%;
  height: 340px;
  z-index: 9;
  background: #414449;
}

.terminalTitle {
  position: relative;
  width: 100%;
  height: 30px;
  line-height: 30px;
  background: #3a3c40;
  color: #fff;
  padding-left: 20px;
  font-size: 14px;
}

.terminal {
  position: relative;
  width: 100%;
  height: 320px;
  padding-left: 16px;
  box-sizing: border-box;
}

.el-icon-close {
  color: #fff;
  float: right;
  margin-right: 35px;
  line-height: 30px;
  font-size: 20px;
  cursor: pointer;
}

/* .tool-bar {
  margin: 10px 0;
  width: 99%;
  height: 37px;
  background-color: #eee;
  border: 1px solid #409eff;
  padding: 4px;
} */

.tool-bar {
  width: 400px;
  height: 2.5vw;
  line-height: 2.5vw;
  background-color: none;
  position: fixed;
  top: 0.7408vw;
  left: 15.625vw;
  z-index: 10;
}

.toolBtn {
  color: #fff;
  font-size: 1.354vw;
  font-weight: bold;
  margin-top: 0.3125;
  background: none;
  border: none;
}
</style>

<style>
.el-tabs__header {
  margin: 0 !important;
  z-index: 11;
  border-bottom: none !important;
}

.el-tabs--card > .el-tabs__header .el-tabs__nav {
  border: none !important;
}

.el-tabs--card > .el-tabs__header .el-tabs__item.is-active {
  border-bottom: none !important;
}

.el-tabs__nav-wrap {
  margin-bottom: 0 !important;
}

.el-tabs__new-tab {
  display: none;
}

.ace_hidpi .ace_gutter-layer,
.ace_hidpi .ace_gutter {
  /* height: var(--editorHeightVar) !important; */
  height: 120%;
}

.ace_hidpi .ace_text-layer,
.ace_hidpi .ace_content {
  /* height: var(--editorHeightVar) !important; */
  /* height: 100%; */
  /* display: contents; */
}

.ace_scroller {
  overflow: visible;
}

::-webkit-scrollbar-thumb {
  border-radius: 5px;
  background-color: #666;
}

.vdr,
.vdr.active:before {
  top: 0 !important;
}

.vdr.active:before {
  outline: 1px dashed #3a3c40;
}

.vdr-stick {
  background: #3a3c40;
  border: none;
  width: 100% !important;
  height: 2px !important;
  top: 0 !important;
  margin-left: 0 !important;
}

.vdr-stick-bm,
.vdr-stick-tm {
  left: 0;
}

.time {
  font-size: 13px;
  color: rgb(153, 153, 153);
}

.fileName {
  padding-bottom: 14px;
  font-size: 20px;
  color: rgb(17, 31, 226);
}
</style>