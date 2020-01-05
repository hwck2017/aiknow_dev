<template>
  <div>
    <aceEditor @input="getSourceCode" @switchLanguage="getLang"></aceEditor>
    <div style="margin: 20px 0;">
      <el-button @click="compile">点击编译</el-button>
      <el-button @click="run">点击运行</el-button>
      <el-input placeholder="标准输入(stdin)" v-model="my_stdin" style="width: 40%"></el-input>
    </div>编译结果
    <el-input type="textarea" :autosize="{ minRows: 1, maxRows: 10}" v-model="compileResult"></el-input>运行结果
    <el-input type="textarea" :autosize="{ minRows: 1, maxRows: 10}" v-model="runResult"></el-input>
  </div>
</template>

<script>
import aceEditor from "./Edit.vue";
const compilerArray = [
  {
    name: "PYTHON27",
    compiler: "python-2.7.0"
  },
  {
    name: "PYTHON35",
    compiler: "python-3.5.0"
  },
  {
    name: "JAVA8",
    compiler: ""
  },
  {
    name: "CPP",
    compiler: "gcc-head"
  },
  {
    name: "C",
    compiler: "gcc-head"
  }
];

export default {
  data() {
    return {
      source_code: "",
      lang: "",
      compileResult: "",
      runResult: "",
      my_stdin: "",
      compilerArray: compilerArray
    };
  },
  components: {
    aceEditor
  },
  methods: {
    compile() {
      var runWandbox = require("wandbox-api");
      let compiler = this.getCompiler();
      if (this.source_code === "") {
        return this.$message.warning("请先输入代码");
      }
      runWandbox.fromString(
        this.source_code,
        { compiler: compiler },
        (error, results) => {
          if (error) {
            throw new Error(error.message);
          }

          if (results.status === "0") {
            this.compileResult = "编译成功";
          } else {
            this.compileResult = results.compiler_message;
          }
        }
      );
    },
    run() {
      var runWandbox = require("wandbox-api");
      let compiler = this.getCompiler();
      if (this.source_code === "") {
        return this.$message.warning("请先输入代码");
      }
      runWandbox.fromString(
        this.source_code,
        { compiler: compiler, stdin: this.my_stdin },
        (error, results) => {
          if (error) {
            throw new Error(error.message);
          }

          if (results.status === "0") {
            this.compileResult = "编译成功";
          } else {
            this.compileResult = results.compiler_message;
            return;
          }

          this.runResult = results.program_message;
        }
      );
    },
    getSourceCode(msg) {
      this.source_code = msg;
    },
    getLang(lang) {
      this.lang = lang;
    },
    getCompiler() {
      for (var i = 0; i < this.compilerArray.length; i++) {
        if (this.compilerArray[i].name === this.lang) {
          return this.compilerArray[i].compiler;
        }
      }

      return "gcc-head";
    }
  }
};
</script>