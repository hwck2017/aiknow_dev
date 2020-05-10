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
              <el-dropdown-item command="open">打开</el-dropdown-item>
              <!-- <el-dropdown-item command="save">保存</el-dropdown-item>
              <el-dropdown-item command="saveAs">另存为</el-dropdown-item> -->

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
    <div class="ace-editor" ref="ace"></div>
  </div>
</template>
 
<script>
var fs = require("fs");
var { ipcRenderer } = require("electron");

var myStudy = require("../../../../lib/study/study");
var myEditor = require("../../../../lib/editor/toolbar");

//编程语言选项
const languageOpts = ["PYTHON", "JAVA", "CPP", "C"];
//字体大小选项
const fontSizeOpts = ["超大", "大", "中", "小"];

export default {
  data() {
    return {
      problemInfo: {
        problemID: 0,
        code: "",
        path: "",
        lang: "CPP",
        nodeID: ""
      },
      languageOpts: languageOpts,
      languageOpt: "CPP",
      fontSizeOpts: fontSizeOpts,
      fontSizeOpt: "中",
      editorTheme: "monokai",
      needRun: false,
      fileInfo: {
        isSave: false,
        filePath: "",
        content: ""
      }
    };
  },
  methods: {
    themeChangeHandle() {
      myEditor.setTheme(this.editorTheme);
    },
    langChangeHandle() {
      myEditor.setMode(this.languageOpt);
    },
    fontSizeChangeHandle() {
      myEditor.setFontSize(this.fontSizeOpt);
    },
    openFile() {
      ipcRenderer.send("action", "open");
    },
    saveFile(saveAs) {
      let code = myEditor.getSourceCode();
      if (saveAs === false && this.fileInfo.isSave) {
        fs.writeFileSync(this.fileInfo.filePath, code);
        if (this.needRun) {
          ipcRenderer.send("run", this.languageOpt, this.fileInfo.filePath);
          this.needRun = false;
        }
        return;
      }

      ipcRenderer.send("action", "save");
    },
    fileOperProc(cmd) {
      console.log(cmd);
      switch (cmd) {
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
      if (
        code === "" ||
        code === window.sessionStorage.getItem("code" + this.problemInfo.problemID)
      )
        return;

      window.sessionStorage.setItem("code" + this.problemInfo.problemID, code);
    },
    readFromStorage() {
      let code = window.sessionStorage.getItem("code" + this.problemInfo.problemID);
      if (code) myEditor.setSourceCode(code);
    },
    // 本地测试运行
    run() {
      this.needRun = true;
      this.saveFile(false);
    },
    languageConverse() {
      if (this.languageOpt === "PYTHON") return "PYTHON35";
      else return this.languageOpt;
    },
    //提交代码到题库
    submit() {
      if (!this.$store.state.userInfo.isLogin) {
        return this.$message.warning("请先登入");
      }

      this.problemInfo.code = myEditor.getSourceCode();
      if (this.problemInfo.code.length == 0) {
        return this.$message.warning("请输入代码");
      }

      this.problemInfo.path = this.$route.fullPath;
      this.problemInfo.lang = this.languageConverse();

      this.$http
        .post("/code/user", {
          group_id: 0,
          problem_id: this.problemInfo.problemID,
          language: "",
          lang: this.problemInfo.lang,
          source_code: this.problemInfo.code,
          contest_id: 0
        })
        .then(res => {
          this.$store.commit("addSubmission", {
            title: this.problemInfo.problemID,
            url: this.problemInfo.path,
            id: res.data.data,
            nodeid: this.problemInfo.nodeID
          });
        })
        .catch(res => {});
    },
    keyWatcher() {
      // js监听键盘ctrl + s快捷键保存;
      document.addEventListener("keydown", function(e) {
        if (
          e.keyCode == 83 &&
          (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)
        ) {
          e.preventDefault();
          console.log(e);
          ipcRenderer.send("action", "save");
        }
      });
    },
    init() {
      this.keyWatcher();
      this.problemInfo.problemID = this.$route.params.pid;
      this.problemInfo.nodeID = myStudy.getNodeID(this.problemInfo.problemID);
      // 每10s保存一次编辑器中的内容
      setInterval(this.storeData, 10000);
      // 打开文件时获取到的文件内容
      ipcRenderer.on("open", (event, path) => {
        console.log(path);
        let data = fs.readFileSync(path);
        this.fileInfo = {
          isSave: true,
          filePath: path,
          content: data
        };
        myEditor.setSourceCode(data.toString());
      });
      ipcRenderer.on("save", (event, rsp) => {
        console.log(rsp);

        if (rsp === undefined || rsp === null) {
          return this.$message.warning("请选择文件保存路径");
        }

        this.fileInfo = {
          isSave: true,
          filePath: rsp,
          content: myEditor.getSourceCode()
        };
        fs.writeFileSync(this.fileInfo.filePath, myEditor.getSourceCode());

        // this.$message.success("保存文件成功");
        if (this.needRun) {
          // 编译运行
          ipcRenderer.send("run", this.languageOpt, this.fileInfo.filePath);
          this.needRun = false;
        }
      });
    }
  },
  created() {
    this.init();
  },
  mounted() {
    myEditor.init(this.$refs.ace);
    this.readFromStorage();
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
