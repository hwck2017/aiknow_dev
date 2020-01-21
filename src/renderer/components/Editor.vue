<template>
  <div>
    <el-row :gutter="20">
      <el-col :span="14">
        <div>
          <aceEditor @input="getSourceCode" @languageChanged="getProgramLanguage"></aceEditor>
        </div>
      </el-col>
      <el-col :span="10">
        <div style="margin: 10px 0;">
          <el-button @click="run" type="primary" icon="el-icon-s-promotion">点击运行</el-button>
          <el-input placeholder="标准输入(stdin)" v-model="stdin" style="width: 50%"></el-input>
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
const mapCompiler = new Map([
  ["PYTHON", "cpython-2.7-head"],
  ["PYTHON3", "cpython-head"],
  ["JAVA", "openjdk-head"],
  ["CPP", "gcc-head"],
  ["C", "gcc-head-c"]
]);

export default {
  data() {
    return {
      code: "",
      language: "",
      runResult: "",
      stdin: "",
      compilers: mapCompiler
    };
  },
  components: {
    aceEditor
  },
  methods: {
    run() {
      var runWandbox = require("wandbox-api");
      let compiler = this.getCompiler();
      if (this.code === "") {
        return this.$message.warning("请先输入代码");
      }
      runWandbox.fromString(
        this.code,
        { compiler: compiler, stdin: this.stdin },
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
    getSourceCode(data) {
      this.code = data;
    },
    getProgramLanguage(lang) {
      this.language = lang;
    },
    getCompiler() {
      return this.compilers.get(this.language);
    }
  }
};
</script>