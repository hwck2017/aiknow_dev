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
        <el-col :span="6">
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
        <el-col :span="12">
          <el-popover placement="top-start" trigger="hover" content="打开本地文件">
            <el-button size="small" icon="el-icon-folder-opened" slot="reference" @click="openFile"></el-button>
          </el-popover>
          <el-popover placement="top-start" trigger="hover" content="保存至本地文件">
            <el-button size="small" icon="el-icon-collection" slot="reference" @click="save"></el-button>
          </el-popover>
          <el-popover placement="top-start" trigger="hover" content="测试运行">
            <el-button
              size="small"
              icon="el-icon-s-promotion"
              slot="reference"
              @click="isRunning = true"
            ></el-button>
          </el-popover>
          <el-popover placement="top-start" trigger="hover" content="提交至题库判题">
            <el-button size="small" icon="el-icon-upload2" slot="reference" @click="submit"></el-button>
          </el-popover>
        </el-col>
      </el-row>
    </div>

    <el-dialog title="请输入测试数据" :visible.sync="isRunning">
      <el-input type="textarea" :autosize="{ minRows: 10, maxRows: 50}" v-model="stdin"></el-input>
      <span slot="footer" class="dialog-footer">
        <el-button @click="isRunning = false">取 消</el-button>
        <el-button type="primary" @click="run">运 行</el-button>
      </span>
    </el-dialog>
    <el-dialog title="运行结果" :visible.sync="ran">
      <el-input
        type="textarea"
        style="background-color: #000"
        :autosize="{ minRows: 10, maxRows: 50}"
        v-model="runResult"
      ></el-input>
    </el-dialog>
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

//编程语言选项
const languageOpts = ["PYTHON", "PYTHON3", "JAVA", "CPP", "C"];
//字体大小选项
const fontSizeOpts = ["超大", "大", "中", "小"];
//语言模式选项
var mapMode = new Map([
  ["PYTHON", "ace/mode/python"],
  ["PYTHON3", "ace/mode/python"],
  ["JAVA", "ace/mode/java"],
  ["CPP", "ace/mode/c_cpp"],
  ["C", "ace/mode/c_cpp"]
]);

// curl https://wandbox.org/api/list.json 获取编译器选项
const mapCompiler = new Map([
  ["PYTHON", "cpython-2.7-head"],
  ["PYTHON3", "cpython-head"],
  ["JAVA", "openjdk-head"],
  ["CPP", "gcc-head"],
  ["C", "gcc-head-c"]
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
    // this.aceEditor.on("copy", () => {
    //   this.$message.success("复制成功");
    // });
    // // this.aceEditor.getSession().on("change", this.inputChange);
    // this.aceEditor.selectAll();
    // this.aceEditor.undo();

    this.readFromStorage();
  },
  data() {
    return {
      isRunning: false,
      ran: false, //运行完成展示结果
      stdin: "",
      runResult: "",
      problemID: 0,
      nodeID: "",
      compileok: false,
      isSubmit: false,
      compilers: mapCompiler,
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
    // inputChange() {
    //   this.$emit("input", this.aceEditor.getSession().getValue());
    // },
    // showRunResult() {
    //   this.$emit("results", this.runResult);
    // },
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
    save() {
      ipcRenderer.send(
        "action",
        "save",
        this.aceEditor.getSession().getValue()
      );
    },
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
    // 本地编译+运行
    run() {
      // 关闭测试数据输入窗口
      ipcRenderer.send("run");
      return;
      // this.isRunning = false;
      // var runWandbox = require("wandbox-api");
      // let compiler = this.getCompiler();
      // let code = this.aceEditor.getSession().getValue();
      // if (code === "") {
      //   return this.$message.warning("请先输入代码");
      // }

      // // 打开运行结果展示窗口
      // this.ran = true;
      // this.runResult = "运行中...";
      // runWandbox.fromString(
      //   code,
      //   { compiler: compiler, stdin: this.stdin },
      //   (error, results) => {
      //     if (error) {
      //       throw new Error(error.message);
      //     }

      //     this.stdin = "";
      //     if (results.status !== "0") {
      //       if (results.compiler_message === undefined)
      //         this.runResult = results.program_error;
      //       else this.runResult = results.compiler_message;
      //     } else {
      //       this.runResult = results.program_message;
      //       this.compileok = true;
      //     }
      //   }
      // );
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
      if (this.languageOpt === "PYTHON") return "PYTHON27";
      else if (this.languageOpt === "PYTHON3") return "PYTHON35";
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
      if (this.compileok !== true) {
        return this.$message.warning("请先做本地测试运行, 通过之后再提交");
      }

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
    init() {
      this.problemID = this.$route.params.pid;
      this.getNodeID();
      // 每10s保存一次编辑器中的内容
      setInterval(this.storeData, 10000);
      // 打开文件时获取到的文件内容
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
  border: 1px solid #409eff;
  padding: 4px;
  /* position: absolute; */
}
</style>