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
              <div v-for="(item, idx) in problem.description.ops" v-bind:key="'desc'+idx">
                <div v-if="item.insert.image">
                  <img v-bind:src="item.insert.image" />
                </div>
                <div v-else>{{item.insert}}</div>
              </div>
            </div>
            <h2>输入格式</h2>
            <div id="input_format" v-if="problem.input_format">
              <div v-for="(item, idx) in problem.input_format.ops" v-bind:key="'input'+idx">
                <div v-if="item.insert.image">
                  <img v-bind:src="item.insert.image" />
                </div>
                <div v-else>{{item.insert}}</div>
              </div>
            </div>

            <h2>输出格式</h2>
            <div id="output_format" v-if="problem.output_format">
              <div v-for="(item, idx) in problem.output_format.ops" v-bind:key="'output'+idx">
                <div v-if="item.insert.image">
                  <img v-bind:src="item.insert.image" />
                </div>
                <div v-else>{{item.insert}}</div>
              </div>
            </div>
            <h2>样例</h2>
            <div v-for="(item, idx) in problem.samples" v-bind:key="'sample'+idx">
              <h5>输入</h5>
              <pre>{{item.input}}</pre>
              <h5>输出</h5>
              <pre>{{item.output}}</pre>
            </div>
          </div>
        </el-card>

        <aceEditor @input="getSourceCode" @switchLanguage="getNewLang"></aceEditor>
        <div style="margin: 20px 0;">
          <el-button @click="compile">本地编译</el-button>
          <el-button @click="submitCode">提交</el-button>
        </div>本地编译结果
        <el-input type="textarea" :autosize="{ minRows: 1, maxRows: 10}" v-model="compileResult"></el-input>
        <div>
          <judgeResult></judgeResult>
        </div>
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
import aceEditor from "./Edit.vue";
import judgeResult from "./problem/judgeResult.vue";

export default {
  data() {
    return {
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
      compilePass: false,
      // 代码提交
      commitInfo: {
        group_id: 0,
        problem_id: 0,
        language: "",
        lang: "CPP",
        source_code: "",
        contest_id: 0
      },
      results: {},
      isSubmit: false,
      nodeID: ""
    };
  },
  created() {
    this.getProblemContent();
    this.getNodeID();
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
      // console.log(res);
      this.author = res.data.author;
      this.problem = res.data.problem;
    },
    async getNodeID() {
      const { data: res } = await this.$http.get(
        "http://study.aiknow.cn/study/api/studyCourseNode/" +
          this.commitInfo.problem_id
      );

      if (res.errno !== 200) {
        return this.$message.warning("获取课程节点信息失败");
      }
      // console.log(res);
      this.nodeID = res.data;
    },
    // 本地编译
    compile() {
      var runWandbox = require("wandbox-api");
      // TODO:: 编程语言变化
      runWandbox.fromString(this.commitInfo.source_code, (error, results) => {
        if (error) {
          throw new Error(error.message);
        }

        // console.log(results);

        if (results.status === "0") {
          this.compileResult = "编译成功";
          this.compilePass = true;
        } else {
          this.compileResult = results.compiler_message;
        }
      });
    },

    //提交代码到题库
    submitCode() {
      if (this.compilePass !== true) {
        return this.$message.warning("请先做本地编译，通过之后再提交");
      }
      if (this.commitInfo.lang == null) {
        return this.$message.warning("选择编程语言");
      }
      if (this.commitInfo.source_code.length == 0) {
        return this.$message.warning("请输入代码");
      }
      let path = this.$route.fullPath;
      let title = this.problem.title;
      let nodeid = this.nodeID;
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
            id: res.data.data,
            nodeid: nodeid
          });
          this.isSubmit = false;
        })
        .catch(res => {
          this.isSubmit = false;
        });
      // }
    },
    getSourceCode(msg) {
      this.commitInfo.source_code = msg;
    },
    getNewLang(lang) {
      this.commitInfo.lang = lang;
    }
  },
  components: {
    aceEditor,
    judgeResult
  }
};
</script>

<style scoped>
</style>