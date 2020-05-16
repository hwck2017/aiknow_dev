<template>
  <div>
    <div class="tool-bar">
      <el-row :gutter="6">
        <el-col :span="5">
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
        <el-col :span="15">
          <el-popover placement="top-start" trigger="hover" content="打开本地文件">
            <el-button size="small" icon="el-icon-folder-opened" slot="reference" @click="openFile"></el-button>
          </el-popover>
          <el-popover placement="top-start" trigger="hover" content="保存至本地文件">
            <el-button size="small" icon="el-icon-collection" slot="reference" @click="save"></el-button>
          </el-popover>
          <el-popover placement="top-start" trigger="hover" content="测试运行">
            <el-button size="small" icon="el-icon-s-promotion" slot="reference" @click="run"></el-button>
          </el-popover>
          <el-popover placement="top-start" trigger="hover" content="提交至题库判题">
            <el-button size="small" icon="el-icon-upload2" slot="reference" @click="submit"></el-button>
          </el-popover>
        </el-col>
      </el-row>
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

var fs = require("fs");
var iconv = require("iconv-lite");
var { ipcRenderer } = require("electron");

const languageOpts = ["PYTHON", "JAVA", "CPP", "C"];
const fontSizeOpts = ["超大", "大", "中", "小"];
var mapMode = new Map([
  ["PYTHON", "ace/mode/python"],
  ["JAVA", "ace/mode/java"],
  ["CPP", "ace/mode/c_cpp"],
  ["C", "ace/mode/c_cpp"]
]);

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
      theme: "ace/theme/monokai",
      mode: "ace/mode/c_cpp"
    });
    // 激活自动提示
    this.aceEditor.setOptions({
      enableSnippets: true,
      enableLiveAutocompletion: true,
      enableBasicAutocompletion: true
    });
    this.aceEditor.on("copy", () => {
      this.$message.success("复制成功");
    });
    // this.aceEditor.getSession().on("change", this.inputChange);
    this.aceEditor.selectAll();
    this.aceEditor.undo();
    this.readFromStorage();
  },
  data() {
    return {
      needRun: false,
      problemID: 0,
      nodeID: "",
      // compileok: false,
      aceEditor: null,
      languageOpts: languageOpts,
      languageOpt: "CPP",
      modes: mapMode,
      fontSizeOpts: fontSizeOpts,
      fontSizeOpt: "中",
      fontSizes: mapFontSize
    };
  },
  methods: {
    langChangeHandle() {
      let m = this.modes.get(this.languageOpt);
      // 根据编程语言设置编辑器模式
      this.aceEditor.getSession().setMode(m);
    },
    fontSizeChangeHandle() {
      let size = this.fontSizes.get(this.fontSizeOpt);
      this.aceEditor.setFontSize(size);
    },
    openFile() {
      ipcRenderer.send("action", "open", "", "problem");
    },
    save() {
      ipcRenderer.send(
        "action",
        "save",
        this.aceEditor.getSession().getValue(),
        "problem"
      );
    },
    store() {
      let code = this.aceEditor.getSession().getValue();
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
    // 本地编译+运行
    run() {
      this.needRun = true;
      this.save();
    },
    // 获取题目对应课程节点
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
      if (!this.$store.state.userInfo.isLogin) {
        return this.$message.warning("请先登入");
      }
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
    saveWatcher() {
      ipcRenderer.on("save", (event, from, rsp) => {
        console.log("prob-save: ", rsp, from);
        if (from == "editor") return;

        if (rsp === undefined || rsp === null) {
          return this.$message.warning("请选择文件保存路径");
        }

        fs.writeFileSync(rsp, this.aceEditor.getSession().getValue());
        if (this.needRun) {
          // 编译运行
          ipcRenderer.send("run", this.userOpt.languageOpt, rsp);
          this.needRun = false;
        }
      });
    },
    openWatcher() {
      // 打开文件时获取到的文件内容
      ipcRenderer.on("open", (event, path, from) => {
        console.log("prob-open: ", path, from);
        if (from == "editor") return;

        let fileStr = fs.readFileSync(path, { encoding: "binary" });
        //先用二进制的方式读入
        var buf = Buffer.alloc(4096, fileStr, "binary");
        //存为Buffer
        var code = iconv.decode(buf, "gbk");
        this.aceEditor
          .getSession()
          .getDocument()
          .setValue(code);
      });
    },
    init() {
      this.problemID = this.$route.params.pid;
      this.getNodeID();
      this.saveWatcher();
      this.openWatcher();
      setInterval(this.store, 10000);
      ipcRenderer.on("data", (event, data) => {
        this.aceEditor
          .getSession()
          .getDocument()
          .setValue(data.toString());
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
  border: 1px solid #eee;
  padding: 4px;
  /* position: absolute; */
}
</style>