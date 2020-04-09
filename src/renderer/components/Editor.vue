<template>
  <div>
    <div class="tool-bar">
      <el-row :gutter="6">
        <el-col :span="6">
          <!-- 编程语言: -->
          <el-popover placement="top-start" trigger="hover" content="选择编程语言">
            <el-select
              v-model="languageOpt"
              size="small"
              slot="reference"
              @change="langChangeHandle"
            >
              <el-option v-for="(item, idx) in languageOpts" :key="idx" :label="item" :value="item"></el-option>
            </el-select>
          </el-popover>
        </el-col>
        <el-col :span="4">
          <!-- 字体大小: -->
          <el-popover placement="top-start" trigger="hover" content="调整字体大小">
            <el-select
              v-model="fontSizeOpt"
              size="small"
              slot="reference"
              @change="fontSizeChangeHandle"
            >
              <el-option v-for="(item, idx) in fontSizeOpts" :key="idx" :label="item" :value="item"></el-option>
            </el-select>
          </el-popover>
        </el-col>
        <el-col :span="14">
          <el-dropdown size="small" @command="fileOperProc">
            <el-button size="small">
              <i class="el-icon-folder-opened"></i>
              <!-- 文件 -->
              <i class="el-icon-arrow-down el-icon--right"></i>
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="new">新建</el-dropdown-item>
              <el-dropdown-item command="open">打开</el-dropdown-item>
              <el-dropdown-item command="save">保存</el-dropdown-item>
              <el-dropdown-item command="saveAs">另存为</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
          <el-dropdown size="small">
            <el-button size="small">
              <i class="el-icon-setting"></i>
              <!-- 设置 -->
              <i class="el-icon-arrow-down el-icon--right"></i>
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="theme">
                夜间模式
                <el-switch
                  v-model="editorTheme"
                  active-color="#13ce66"
                  inactive-color="#eee"
                  active-value="monokai"
                  inactive-value="clouds"
                  @change="themeChangeHandle"
                ></el-switch>
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
          <el-popover placement="top-start" trigger="hover" content="本地测试运行">
            <el-button size="small" icon="el-icon-s-promotion" slot="reference" @click="run"></el-button>
          </el-popover>
          <el-popover placement="top-start" trigger="hover" content="上传题库判题">
            <el-button size="small" icon="el-icon-upload2" slot="reference" @click="submit"></el-button>
          </el-popover>
        </el-col>
      </el-row>
    </div>
    <div>
      <el-tabs
        v-model="editableTabsValue"
        type="card"
        closable
        :before-leave="beforeLeaveHandle"
        @tab-remove="removeTab"
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
    <div class="ace-editor" ref="ace"></div>
  </div>
</template>
 
<script>
import ace from "ace-builds";
import "ace-builds/src-noconflict/snippets/c_cpp";
import "ace-builds/src-noconflict/snippets/java";
import "ace-builds/src-noconflict/snippets/python";
import "ace-builds/webpack-resolver";
import "ace-builds/src-noconflict/ext-language_tools";
import "ace-builds/src-noconflict/theme-monokai";
import "ace-builds/src-noconflict/mode-c_cpp";

var { ipcRenderer } = require("electron");
var fs = require("fs");

//编程语言选项
const languageOpts = ["PYTHON", "JAVA", "CPP", "C"];
//字体大小选项
const fontSizeOpts = ["超大", "大", "中", "小"];
//语言模式选项
var mapMode = new Map([
  ["PYTHON", "ace/mode/python"],
  ["JAVA", "ace/mode/java"],
  ["CPP", "ace/mode/c_cpp"],
  ["C", "ace/mode/c_cpp"]
]);

var mapContents = new Map();

var mapFontSize = new Map([
  ["超大", 30],
  ["大", 22],
  ["中", 16],
  ["小", 12]
]);

export default {
  mounted() {
    this.aceEditor = ace.edit(this.$refs.ace, {
      maxLines: 100,
      minLines: 33,
      fontSize: 16,
      value: this.value ? this.value : "",
      tabSize: 4,
      theme: "ace/theme/monokai", //clouds
      mode: "ace/mode/c_cpp"
    });
    // 激活自动提示
    this.aceEditor.setOptions({
      enableSnippets: true,
      enableLiveAutocompletion: true,
      enableBasicAutocompletion: true
    });

    this.readFromStorage();
  },
  data() {
    return {
      problemID: 0,
      nodeID: "",
      compileok: false,
      aceEditor: null,
      languageOpts: languageOpts,
      languageOpt: "CPP",
      modes: mapMode,
      fontSizeOpts: fontSizeOpts,
      fontSizeOpt: "中",
      fontSizes: mapFontSize,
      editorTheme: "monokai",
      needRun: false,
      //激活的tab name
      editableTabsValue: "0",
      defaultTitle: "Untitled",
      //创建的tab集合
      editableTabs: [
        {
          title: "untitled",
          name: "0",
          content: "",
          filePath: "",
          isSave: false
        }
      ],
      //tab初始号
      tabIndex: 0,
      // tab_name->code
      contents: mapContents,
      oldActiveTab: "0",
      tempTab: {}
    };
  },
  methods: {
    themeChangeHandle() {
      this.aceEditor.setTheme("ace/theme/" + this.editorTheme);
    },
    addTab(title) {
      let newTabName = ++this.tabIndex + "";
      let tab = {
        title: title === "" ? this.defaultTitle + "-" + newTabName : title,
        name: newTabName,
        content: "",
        filePath: "",
        isSave: false
      };
      this.editableTabs.push(tab);
      this.editableTabsValue = newTabName;
      this.aceEditor
        .getSession()
        .getDocument()
        .setValue(tab.content);
    },
    removeTab(targetName) {
      let tabs = this.editableTabs;
      let activeName = this.editableTabsValue;
      if (activeName === targetName) {
        tabs.forEach((tab, index) => {
          if (tab.name === targetName) {
            let nextTab = tabs[index + 1] || tabs[index - 1];
            if (nextTab) {
              activeName = nextTab.name;
            }
          }
        });
      }

      this.editableTabsValue = activeName;
      this.editableTabs = tabs.filter(tab => tab.name !== targetName);
      // let tab = tabs.find(e => e.name === this.editableTabsValue);
      // if (tab.isSave === false) {
      //   ipcRenderer.send("action", "close");
      // }

      if (this.editableTabs.length === 0) {
        this.aceEditor
          .getSession()
          .getDocument()
          .setValue("");
      }
    },
    clickTab() {
      // tab切换时，保存原tab数据，获取新tab数据
      let oldTab, curTab;
      console.log("curr active tab", this.editableTabsValue);
      console.log("old active tab:", this.oldActiveTab);

      oldTab = this.editableTabs.find(e => e.name === this.oldActiveTab);
      curTab = this.editableTabs.find(e => e.name === this.editableTabsValue);
      console.log(curTab);
      console.log(oldTab);

      if (oldTab != undefined) {
        oldTab.content = this.aceEditor.getSession().getValue();
      }

      if (curTab != undefined) {
        this.aceEditor
          .getSession()
          .getDocument()
          .setValue(curTab.content);
      }
    },
    beforeLeaveHandle(newName, oldName) {
      console.log(newName, oldName);
      this.oldActiveTab = oldName;
      return true;
    },
    newFile() {
      this.addTab("");
    },
    langChangeHandle() {
      let m = this.modes.get(this.languageOpt);
      // 根据编程语言设置编辑器模式
      this.aceEditor.getSession().setMode(m);
      // this.$emit("languageChanged", this.languageOpt);
    },
    fontSizeChangeHandle() {
      let size = this.fontSizes.get(this.fontSizeOpt);
      this.aceEditor.setFontSize(size);
    },
    openFile() {
      ipcRenderer.send("action", "open");
    },
    saveFile(saveAs) {
      let tab = this.editableTabs.find(e => e.name === this.editableTabsValue);
      if (saveAs === false && tab.isSave) {
        fs.writeFileSync(tab.filePath, this.aceEditor.getSession().getValue());
        if (this.needRun) {
          ipcRenderer.send("run", this.languageOpt, tab.filePath);
          this.needRun = false;
        }
        return;
      }

      ipcRenderer.send("action", "save");
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
      let code = this.aceEditor.getSession().getValue();
      //内容为空或者未发生改变则不保存
      if (
        code === "" ||
        code === window.sessionStorage.getItem("code" + this.problemID)
      )
        return;

      window.sessionStorage.setItem("code" + this.problemID, code);
    },
    readFromStorage() {
      let code = window.sessionStorage.getItem("code" + this.problemID);
      if (code)
        this.aceEditor
          .getSession()
          .getDocument()
          .setValue(code);
    },
    getCompiler() {
      return this.compilers.get(this.languageOpt);
    },
    // 本地测试运行
    run() {
      this.needRun = true;
      this.saveFile(false);
    },
    // 获取题目对应课程节点ID
    async getNodeID() {
      if (this.problemID === undefined) {
        return;
      }
      const { data: res } = await this.$http.get(
        "http://study.aiknow.cn/study/api/studyCourseNode/" + this.problemID
      );

      if (res.errno !== 200) {
        return this.$message.warning("获取课程节点信息失败");
      }
      // console.log(res);
      this.nodeID = res.data;
    },
    languageConverse() {
      if (this.languageOpt === "PYTHON") return "PYTHON35";
      else return this.languageOpt;
    },
    //提交代码到题库
    submit() {
      if (this.problemID === undefined) {
        return this.$message.warning("编辑器模式下请勿提交");
      }
      if (!this.$store.state.userInfo.isLogin) {
        return this.$message.warning("请先登入");
      }
      // TODO: 需拿到运行结果
      // if (this.compileok !== true) {
      //   return this.$message.warning("请先做本地测试运行, 通过之后再提交");
      // }

      let code = this.aceEditor.getSession().getValue();
      if (code.length == 0) {
        return this.$message.warning("请输入代码");
      }

      let path = this.$route.fullPath;
      // let title = this.problem.title;
      this.isSubmit = true;
      this.$http
        .post("/code/user", {
          group_id: 0,
          problem_id: this.problemID,
          language: "",
          lang: this.languageConverse(),
          source_code: code,
          contest_id: 0
        })
        .then(res => {
          this.$store.commit("addSubmission", {
            title: this.problemID,
            url: path,
            id: res.data.data,
            nodeid: this.nodeID
          });
          this.isSubmit = false;
        })
        .catch(res => {
          this.isSubmit = false;
        });
    },
    getFileName(path) {
      let pos = path.lastIndexOf("\\");
      console.log(path.substr(pos + 1));
      return path.substr(pos + 1);
    },
    init() {
      this.problemID = this.$route.params.pid;
      this.getNodeID();
      // 每10s保存一次编辑器中的内容
      setInterval(this.storeData, 10000);
      // 打开文件时获取到的文件内容
      ipcRenderer.on("open", (event, path) => {
        console.log(path);
        let tab = this.editableTabs.find(e => e.filePath === path);

        if (tab != undefined) {
          return this.$message.success("文件已经被打开");
        }
        let data = fs.readFileSync(path);
        let fileName = this.getFileName(path);
        tab = this.editableTabs.find(e => e.name === this.editableTabsValue);
        if (tab === undefined) {
          this.addTab(fileName);
        }
        tab.filePath = path;
        tab.content = data.toString();
        tab.title = fileName;
        tab.isSave = true;
        this.aceEditor
          .getSession()
          .getDocument()
          .setValue(data.toString());
      });
      ipcRenderer.on("save", (event, rsp) => {
        console.log(rsp);

        if (rsp === undefined || rsp === null) {
          return this.$message.warning("请选择文件保存路径");
        }

        let tab = this.editableTabs.find(
          e => e.name === this.editableTabsValue
        );
        tab.isSave = true;
        tab.filePath = rsp;
        tab.title = this.getFileName(rsp);
        tab.content = this.aceEditor.getSession().getValue();
        fs.writeFileSync(tab.filePath, this.aceEditor.getSession().getValue());

        // this.$message.success("保存文件成功");
        if (this.needRun) {
          // 编译运行
          ipcRenderer.send("run", this.languageOpt, tab.filePath);
          this.needRun = false;
        }
      });
    }
  },
  created() {
    this.init();
  }
};
</script>

<style scoped>
/* .el-popover--plain {
  padding: 5px 10px !important;
}

.el-popover {
  min-width: 100px !important;
} */

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
  /* position: absolute; */
}
</style>
