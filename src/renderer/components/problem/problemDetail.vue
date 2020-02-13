<template>
  <div>
    <el-container>
      <el-main>
        <el-row :gutter="20">
          <el-col :span="10">
            <el-card>
              <div slot="header">
                <b>
                  {{problem.title}}
                  <el-tag type="success" size="small" v-if="problem.difficult===0">简单</el-tag>
                  <el-tag type="info" size="small" v-if="problem.difficult===1">中等</el-tag>
                  <el-tag type="warning" size="small" v-if="problem.difficult===2">困难</el-tag>
                  <el-tag type="danger" size="small" v-if="problem.difficult===3">专家</el-tag>
                </b>
                <div style="font-size: 11px">
                  贡献者: {{author.nickname}}&nbsp;
                  时间限制: {{problem.time}}s&nbsp;
                  内存限制: {{problem.memory}}MB&nbsp;
                  提交次数: {{problem.submit_times}}&nbsp;
                  通过次数: {{problem.ac_times}}
                </div>
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
          </el-col>
          <el-col :span="14">
            <aceEditor></aceEditor>
          </el-col>
        </el-row>
        <div>
          <judgeResult></judgeResult>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import aceEditor from "../Editor.vue";
import judgeResult from "./judgeResult.vue";

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
      }
    };
  },
  created() {
    this.getProblemContent();
  },
  methods: {
    async getProblemContent() {
      const { data: res } = await this.$http.get(
        "/problem/" + this.$route.params.pid
      );
      if (res.status !== 200) {
        return this.$message.error("获取题目详情失败！");
      }

      this.author = res.data.author;
      this.problem = res.data.problem;
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