<template>
  <!-- document.getElementById('editor').style.fontSize='12px'; 设置字体
  editor.setFontSize(18)-->
  <div>
    <div class="tool-bar">
      <el-row :gutter="6">
        <el-col :span="5">
          <!-- 编程语言: -->
          <el-popover placement="top-start" trigger="hover" content="选择编程语言">
            <el-select v-model="lang" size="small" slot="reference" @change="handleLangSwitch">
              <el-option v-for="(item, idx) in langs" :key="idx" :label="item" :value="item"></el-option>
            </el-select>
          </el-popover>
        </el-col>
        <el-col :span="4">
          <!-- 字体大小: -->
          <el-popover placement="top-start" trigger="hover" content="调整字体大小">
            <el-select v-model="fontSize" size="small" slot="reference" @change="handleChangeSize">
              <el-option v-for="(item, idx) in sizes" :key="idx" :label="item" :value="item"></el-option>
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

var { ipcRenderer, remote } = require("electron");

const modeArray = [
  {
    name: "PYTHON",
    path: "ace/mode/python"
  },
  {
    name: "PYTHON3",
    path: "ace/mode/python"
  },
  {
    name: "JAVA",
    path: "ace/mode/java"
  },
  {
    name: "CPP",
    path: "ace/mode/c_cpp"
  },
  {
    name: "C",
    path: "ace/mode/c_cpp"
  }
];

const sizeArr = [
  {
    name: "超大",
    size: 30
  },
  {
    name: "大",
    size: 22
  },
  {
    name: "中",
    size: 16
  },
  {
    name: "小",
    size: 12
  }
];

const langs = ["PYTHON", "PYTHON3", "JAVA", "CPP", "C"];
const sizes = ["超大", "大", "中", "小"];
// const themeArray = [
//   {
//     name: "monokai",
//     path: "ace/theme/monokai"
//   }
// ];
export default {
  props: ["value", "language"],
  mounted() {
    this.aceEditor = ace.edit(this.$refs.ace, {
      maxLines: 100,
      minLines: 32,
      fontSize: 16,
      value: this.value ? this.value : "",
      tabSize: 4,
      theme: this.themePath,
      mode: this.modePath
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
    this.aceEditor.getSession().on("change", this.change);
    this.aceEditor.selectAll();
    this.aceEditor.undo();
  },
  data() {
    return {
      aceEditor: null,
      themePath: "ace/theme/monokai",
      modePath: "ace/mode/c_cpp",
      langs: langs,
      lang: "CPP",
      modeArray: modeArray,
      fontSize: "中",
      sizes: sizes,
      sizeArr: sizeArr
    };
  },
  methods: {
    change() {
      this.$emit("input", this.aceEditor.getSession().getValue());
    },
    handleLangSwitch(newLang) {
      for (var i = 0; i < this.modeArray.length; i++) {
        if (this.modeArray[i].name === newLang) {
          this.aceEditor.getSession().setMode(this.modeArray[i].path);
          this.$emit("switchLanguage", newLang);
          break;
        }
      }
    },
    handleChangeSize(newSize) {
      for (var i = 0; i < this.sizeArr.length; i++) {
        if (this.sizeArr[i].name === newSize) {
          this.aceEditor.setFontSize(this.sizeArr[i].size);
          break;
        }
      }
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
    }
  },
  created() {
    ipcRenderer.on("data", (event, data) => {
      this.aceEditor
        .getSession()
        .getDocument()
        .setValue(data.toString());
    });
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