<template>
  <div>
    <el-container>
      <el-main>
        <el-card>
          <div slot="header">
            <b>{{problem.title}}</b>
          </div>
          <div>
            <h2>题目描述</h2>
            <div id="description" v-if="problem.description">
              <div
                v-for="(item, idx) in problem.description.ops"
                v-bind:key="'desc'+idx"
                v-html="item.insert"
              ></div>
            </div>
            <h2>输入格式</h2>
            <div id="input_format" v-if="problem.input_format">
              <div
                v-for="(item, idx) in problem.input_format.ops"
                v-bind:key="'input'+idx"
                v-html="item.insert"
              >{{item.insert}}</div>
            </div>

            <h2>输出格式</h2>
            <div id="output_format" v-if="problem.output_format"></div>
            <h2>样例</h2>
            <div v-for="(item, idx) in problem.samples" v-bind:key="'sample'+idx">
              <h5>输入</h5>
              <pre>{{item.input}}</pre>
              <h5>输出</h5>
              <pre>{{item.output}}</pre>
            </div>
          </div>
        </el-card>

        <!-- 编程语言选择 -->
        <div style="margin: 20px 0;">
          <el-select v-model="commitInfo.lang">
            <el-option
              v-for="(item, idx) in problem.lang"
              v-bind:key="'lang'+idx"
              :label="item"
              :value="item"
            ></el-option>
          </el-select>
        </div>
        <!-- 代码输入框 -->
        <codemirror v-model="commitInfo.source_code" :options="cmOptions"></codemirror>
        <div style="margin: 20px 0;">
          <el-button @click="compile">本地编译</el-button>
          <el-button @click="submitCode">提交</el-button>
        </div>本地编译结果
        <el-input type="textarea" :autosize="{ minRows: 1, maxRows: 10}" v-model="compileResult"></el-input>
      </el-main>
      <el-aside width="250px" style="margin-top: 20px">
        <el-card>
          <div slot="header">
            <b>题目信息</b>
          </div>
          <div>题目贡献者: {{author.nickname}}</div>
          <div>时间限制: {{problem.time}}</div>
          <div>内存限制: {{problem.memory}}</div>
          <div>提交次数: {{problem.submit_times}}</div>
          <div>通过次数: {{problem.ac_times}}</div>
          <div>
            难度:
            <el-tag type="success" size="small" v-if="problem.difficult===0">简单</el-tag>
            <el-tag type="info" size="small" v-if="problem.difficult===1">中等</el-tag>
            <el-tag type="warning" size="small" v-if="problem.difficult===2">困难</el-tag>
            <el-tag type="danger" size="small" v-if="problem.difficult===3">专家</el-tag>
          </div>
        </el-card>
      </el-aside>
    </el-container>
  </div>
</template>

<script>
import Quill from "quill";
import "quill/themes/snow.js";

import { codemirror } from "vue-codemirror";
import "codemirror/lib/codemirror.css";
import "codemirror/addon/edit/matchbrackets.js";
import "codemirror/lib/codemirror.js";
import "codemirror/addon/hint/show-hint.css";
import "codemirror/addon/hint/show-hint.js";
import "codemirror/mode/clike/clike.js";

export default {
  data() {
    return {
      cmOptions: {
        // codemirror options
        lineNumbers: true,
        matchBrackets: true,
        lineWrapping: true,
        showCursorWhenSelecting: true,
        indentWithTabs: true,
        indentUnit: 4,
        mode: "text/x-c++src",
        extraKeys: {
          "Ctrl-Space": "autocomplete"
        }
      },
      //出题人信息
      author: {},
      // 题目详情
      problem: {
        description: null,
        input_format: null,
        output_format: null
      },
      // 本地编译结果
      compileResult: "",
      // 代码提交
      commitInfo: {
        group_id: 0,
        problem_id: 0,
        language: "",
        lang: "CPP",
        source_code: "",
        contest_id: 0
      },
      quill: {
        description: null,
        inputFormat: null,
        outputFormat: null
      },
      // 提交代码到题库后返回的ID
      commitID: "",
      results: {},
      // 查询判题结果定时器
      resultTimer: {},
      // 查询判题结果超时定时器
      resultTimeout: {},
      count: 0,
      isSubmit: false
    };
  },
  created() {
    this.getProblemContent();
  },
  methods: {
    async getProblemContent() {
      this.commitInfo.problem_id = this.$route.params.pid;
      const { data: res } = await this.$http.get(
        "/problem/" + this.commitInfo.problem_id
      );
      if (res.status !== 200) {
        return this.$message.error("获取题目详情失败！");
      }
      console.log(res);
      this.author = res.data.author;
      this.problem = res.data.problem;
    },
    // 本地编译
    compile() {
      var runWandbox = require("wandbox-api");
      runWandbox.fromString(this.commitInfo.source_code, (error, results) => {
        if (error) {
          throw new Error(error.message);
        }

        // console.log(results);

        if (results.status === "0") {
          this.compileResult = "编译成功";
        } else {
          this.compileResult = results.compiler_message;
        }
      });
    },
    //提交代码到题库
    //提交代码到题库
    submitCode() {
      if (this.commitInfo.lang == null) {
        this.$message.warning("选择编程语言");
        return;
      }
      if (this.commitInfo.source_code.length == 0) {
        this.$message.warning("请输入代码");
        return;
      }
      let path = this.$route.fullPath;
      let title = this.problem.title;
      // if (isTestMode) {
      //   // test mode
      //   if (this.testCases.data.length == 0) {
      //     this.$Message.warning("请输入测试数据");
      //     return;
      //   }
      //   this.isSubmit = true;
      //   this.$http
      //     .post("/code", {
      //       lang: this.lang,
      //       source_code: code,
      //       test_cases: this.testCases.data
      //     })
      //     .then(res => {
      //       this.$store.commit("addSubmission", {
      //         title: title,
      //         url: path,
      //         id: res.data
      //       });
      //       this.isSubmit = false;
      //       this.testCases.isOpen = false;
      //     })
      //     .catch(res => {
      //       this.isSubmit = false;
      //     });
      // } else {
      if (!this.$store.state.userInfo.isLogin) {
        this.$message.warning("请先登入");
        return;
      }
      this.isSubmit = true;
      this.$http
        .post("/code/user", this.commitInfo)
        .then(res => {
          this.$store.commit("addSubmission", {
            title: title,
            url: path,
            id: res.data.data
          });
          this.isSubmit = false;
        })
        .catch(res => {
          this.isSubmit = false;
        });
      // }
    },
    async getResult() {
      const { data: res } = await this.$http.get("/code/" + this.commitID);
      if (res === undefined) {
        this.count++;
        if (this.count === 5) {
          this.stopTimer();
          this.$message.error("获取判题结果超时！");
        }
        return;
      }
      //获取到判题结果
      console.log(res);
      this.count++;

      if (res.status !== 200) {
        this.stopTimer();
        return this.$message.error("获取判题结果失败！");
      }

      this.results = res.data;
      const h = this.$createElement;

      let tagMsg, tagType;
      if (this.results.response.result === "CE") {
        tagMsg = "编译错误";
        tagType = "danger";
      } else if (this.results.response.result === "WA") {
        tagMsg = "答案错误";
        tagType = "warning";
      } else {
        tagMsg = "通过";
        tagType = "success";
      }
      // TODO: status怎么处理？
      this.stopTimer();
      this.$notify({
        title: this.problem.title,
        dangerouslyUseHTMLString: true,
        message: h("el-row", { props: { gutter: 10 } }, [
          h("el-col", { props: { span: 8 } }, [
            h("el-tag", { props: { type: tagType } }, tagMsg)
          ]),
          h("el-col", { props: { span: 6 } }, [
            h(
              "el-tag",
              { props: { type: "success" } },
              "内存" + this.results.response.memory + "MB"
            )
          ]),
          h("el-col", { props: { span: 6 } }, [
            h(
              "el-tag",
              { props: { type: "success" } },
              "用时: " + this.results.response.time + "s"
            )
          ]),
          h("el-col", { props: { span: 24 } }, [
            h(
              "el-button",
              {
                props: { size: "small" },
                on: {
                  click: this.clickBtn
                }
              },
              "查看详情"
            )
          ])
        ]),

        duration: 0,
        position: "top-right"
      });
    },
    stopTimer() {
      clearInterval(this.resultTimer);
    },
    async clickBtn() {
      this.$router.push({ path: `/submission/${this.commitID}` });
    },
    mountQuill() {
      let config = {
        theme: "snow",
        modules: {
          toolbar: false,
          formula: true
        }
      };
      this.quill.description = new Quill(
        document.getElementById("description"),
        config
      );
      this.quill.description.enable(false);
      this.quill.description.setContents(this.problem.description);

      this.quill.inputFormat = new Quill(
        document.getElementById("input_format"),
        config
      );
      this.quill.inputFormat.enable(false);
      this.quill.inputFormat.setContents(this.problem.input_format);

      this.quill.outputFormat = new Quill(
        document.getElementById("output_format"),
        config
      );
      this.quill.outputFormat.enable(false);
      this.quill.outputFormat.setContents(this.problem.output_format);
    }
  },
  mounted() {
    this.mountQuill();
  },
  components: {
    codemirror
  }
};
</script>

<style scoped>
</style>