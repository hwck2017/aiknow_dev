<template>
  <div>
    <el-row :gutter="20">
      <el-col :span="14">
        <div>
          <aceEditor @input="getSourceCode" @switchLanguage="getLang"></aceEditor>
        </div>
      </el-col>
      <el-col :span="10">
        <div style="margin: 10px 0;">
          <el-button @click="run" type="primary" icon="el-icon-s-promotion">点击运行</el-button>
          <el-input placeholder="标准输入(stdin)" v-model="my_stdin" style="width: 50%"></el-input>
        </div>
        <el-input
          type="textarea"
          :autosize="{ minRows: 32, maxRows: 100}"
          placeholder="编译失败显示编译失败原因,编译成功显示程序运行结果"
          v-model="runResult"
        ></el-input>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import aceEditor from "./Edit.vue";

// curl https://wandbox.org/api/list.json 获取编译器选项
const compilerArray = [
  {
    name: "PYTHON",
    compiler: "cpython-2.7-head"
  },
  {
    name: "PYTHON3",
    compiler: "cpython-head"
  },
  {
    name: "JAVA",
    compiler: "openjdk-head"
  },
  {
    name: "CPP",
    compiler: "gcc-head"
  },
  {
    name: "C",
    compiler: "gcc-head-c"
  }
];

export default {
  data() {
    return {
      source_code: "",
      lang: "",
      // compileResult: "",
      runResult: "",
      my_stdin: "",
      compilerArray: compilerArray
    };
  },
  components: {
    aceEditor
  },
  methods: {
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

          if (results.status !== "0") {
            this.runResult = results.compiler_message;
          } else {
            this.runResult = results.program_message;
          }
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