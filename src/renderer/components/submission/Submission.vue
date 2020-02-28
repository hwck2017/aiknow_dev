<template>
  <div id="global-submission">
    <div class="each" v-for="(item,index) in getSubmissions" v-bind:key="index">
      <h2>
        <router-link :to="item.path">{{item.title}}</router-link>
      </h2>
      <a class="close" @click="removeNotice(index)">
        <el-icon type="el-icon-circle-close" />
      </a>
      <div class="content">
        <div v-if="item.response == null">
          <el-icon v-if="item.status != '错误'" type="load-c" size="18" class="el-icon-loading"></el-icon>
          <div>{{item.status}}</div>
        </div>
        <div class="response" v-else>
          <ProblemResult :result="item.response.result"></ProblemResult>
          <el-tag type="success">{{item.response.memory}} M</el-tag>
          <el-tag type="success">{{item.response.time}} S</el-tag>
          <el-button type="primary" size="small" @click="getSubmissionResult(item.id)">查看详情</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ProblemResult from "../problem/problemResult.vue";
export default {
  methods: {
    removeNotice(index) {
      this.$store.commit("deleteSubmission", index);
    },
    getSubmissionResult(id) {
      // console.log(id)
      this.$router.push({ path: `/submission/${id}` });
    }
  },
  computed: {
    getSubmissions() {
      return this.$store.state.submissions;
    }
  },
  components: {
    ProblemResult
  }
};
</script>