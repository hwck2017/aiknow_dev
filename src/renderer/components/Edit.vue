<template>
  <!-- document.getElementById('editor').style.fontSize='12px'; 设置字体
  editor.setFontSize(18)-->
  <div class="ace-container">
    <div style="margin: 20px 0 10px 0;">
      <el-row :gutter="10">
        <el-col :span="6">
          编程语言:
          <el-select v-model="lang" size="mini" @change="handleLangSwitch">
            <el-option v-for="(item, idx) in langs" :key="idx" :label="item" :value="item"></el-option>
          </el-select>
        </el-col>
        <el-col :span="6">
          字体大小: 
          <el-select v-model="fontSize" size="mini" @change="handleChangeSize">
            <el-option v-for="(item, idx) in sizes" :key="idx" :label="item" :value="item"></el-option>
          </el-select>
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

const modeArray = [
  {
    name: "PYTHON27",
    path: "ace/mode/python"
  },
  {
    name: "PYTHON35",
    path: "ace/mode/python"
  },
  {
    name: "JAVA8",
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

const langs = ["PYTHON27", "PYTHON35", "JAVA8", "CPP", "C"];
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
      minLines: 20,
      fontSize: 14,
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
    this.aceEditor.getSession().on("change", this.change);
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
          // console.log("size: " + this.sizeArr[i].size);
          this.aceEditor.setFontSize(this.sizeArr[i].size);
          break;
        }
      }
    }
  }
};
</script>

<style scoped>
/* .ace-container {
  position: relative;
} */

.ace-editor {
  width: 100%;
}
</style>