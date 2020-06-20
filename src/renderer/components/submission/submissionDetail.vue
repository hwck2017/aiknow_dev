<template>
  <div>
    <el-alert show-icon type="error">本页的详细结果不会永久保存</el-alert>
    <h1>判卷ID：{{data.id}}</h1>
    <h2>判卷状态：{{data.status}}</h2>

    <div v-if="data.response">
      <el-card>
        <div slot="header">
          <ProblemResult :result="data.response.result"></ProblemResult>
          <el-tag type="success">使用内存: {{data.response.memory}} M</el-tag>
          <el-tag type="success">使用时间: {{data.response.time}} s</el-tag>
        </div>
        <el-row v-for="(item, index) in data.response.test_cases" :key="index">
          <el-col :span="6">
            测试点-{{index+1}}&nbsp;&nbsp;
            {{item.result}}
          </el-col>
          <el-col :span="18">{{item.error_message}}</el-col>
        </el-row>
      </el-card>
    </div>
    <el-button @click="back">返回题目详情</el-button>
  </div>
</template>

<script>
import ProblemResult from "../problem/problemResult.vue";
export default {
  created() {
    this.getStatus();
  },
  data() {
    return {
      data: null
    };
  },
  methods: {
    getStatus() {
      console.log(this.$route.params.id);
      this.$http.get("/code/" + this.$route.params.id).then(res => {
        // console.log(res.data);
        this.data = res.data.data;
      });
    },
    back() {
      this.$router.go(-1);
    }
  },
  components: {
    ProblemResult
  }
};
</script>