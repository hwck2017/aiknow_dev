<template>
  <div>
    <el-container>
      <el-main>
        <el-card>
          <div slot="header">
            <b>{{problem.title}}</b>
          </div>
          <div>
            <h3>题目描述</h3>
            <div
              v-for="(item, idx) in problem.description.ops"
              v-bind:key="'desc'+idx"
            >{{item.insert}}</div>
            <br />
            <h3>输入格式</h3>
            <div
              v-for="(item, idx) in problem.input_format.ops"
              v-bind:key="'input'+idx"
            >{{item.insert}}</div>
            <br />
            <h3>输出格式</h3>
            <div
              v-for="(item, idx) in problem.output_format.ops"
              v-bind:key="'output'+idx"
            >{{item.insert}}</div>
            <br />
            <h3>样例</h3>
            <div v-for="(item, idx) in problem.samples" v-bind:key="'sample'+idx">
              <div>输入: {{item.input}}</div>
              <div>输出: {{item.output}}</div>
            </div>
            <br />
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
          <el-button @click="commitCode">提交</el-button>
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
      problem: {},
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
      // 提交代码到题库后返回的ID
      commitID: "",
      results: {},
      // 查询判题结果定时器
      resultTimer: {},
      // 查询判题结果超时定时器
      resultTimeout: {},
      count: 0
    };
  },
  created() {
    this.getProblemContent();
  },
  methods: {
    async getProblemContent() {
      this.commitInfo.problem_id = this.$route.params.problemID;
      const { data: res } = await this.$http.get(
        "/problem/" + this.commitInfo.problem_id
      );
      if (res.status !== 200) {
        return this.$message.error("获取题目详情失败！");
      }
      //   console.log(res);
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
    async commitCode() {
      const { data: res } = await this.$http.post(
        "/code/user",
        this.commitInfo
      );
      //   console.log(this.commitInfo);
      if (res.status !== 200) {
        return this.$message.error("提交代码失败！");
      }
      console.log(res);
      this.commitID = res.data;
      // 1s查询一次判题结果
      this.resultTimer = window.setInterval(this.getResult(), 1000);
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
              this.results.response.memory + "MB"
            )
          ]),
          h("el-col", { props: { span: 6 } }, [
            h(
              "el-tag",
              { props: { type: "success" } },
              this.results.response.time + "s"
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
    clickBtn() {
      console.log("查看详情");
      //   this.$http.get("/submission/" + this.commitID)
    }
  },
  components: {
    codemirror
  }
};
</script>

<style scoped>
</style>