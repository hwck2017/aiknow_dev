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
        <el-col :span="5">
          <el-popover placement="top-start" trigger="hover" content="打开本地文件">
            <el-button size="small" icon="el-icon-folder-opened" slot="reference" @click="openFile"></el-button>
          </el-popover>
          <el-popover placement="top-start" trigger="hover" content="保存至本地文件">
            <el-button size="small" icon="el-icon-collection" slot="reference" @click="store"></el-button>
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

var { ipcRenderer } = require("electron");

const languageOpts = ["PYTHON", "PYTHON3", "JAVA", "CPP", "C"];
const fontSizeOpts = ["超大", "大", "中", "小"];

var mapMode = new Map([
  ["PYTHON", "ace/mode/python"],
  ["PYTHON3", "ace/mode/python"],
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
  props: ["value", "language"],
  mounted() {
    this.aceEditor = ace.edit(this.$refs.ace, {
      maxLines: 100,
      minLines: 32,
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
    this.aceEditor.getSession().on("change", this.inputChange);
    this.aceEditor.selectAll();
    this.aceEditor.undo();
  },
  data() {
    return {
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
    inputChange() {
      this.$emit("input", this.aceEditor.getSession().getValue());
    },
    langChangeHandle() {
      let m = this.modes.get(this.languageOpt);
      this.aceEditor.getSession().setMode(m);
      this.$emit("languageChanged", this.languageOpt);
    },
    fontSizeChangeHandle() {
      let size = this.fontSizes.get(this.fontSizeOpt);
      this.aceEditor.setFontSize(size);
    },
    openFile() {
      ipcRenderer.send("action", "open");
    },
    store() {
      ipcRenderer.send(
        "action",
        "save",
        this.aceEditor.getSession().getValue()
      );
    },
    init() {
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