<template>
  <div class="global-submission">
    <div class="each" v-for="(item,index) in getSubmissions" v-bind:key="index">
      <h2>
        <router-link :to="item.path">{{item.title}}</router-link>
      </h2>
      <a class="close" @click="removeNotice(index)">
        <i class="el-icon-close" />
      </a>
      <div>
        <!-- 未获取到判题结果， 则显示加载中
            判题出问题了，则显示错误
        判题成功，则显示判题结果-->
        <div v-if="item.response == null">
          <i v-if="item.status != '错误'" type="load-c" size="18" class="el-icon-loading" />
          <div>{{item.status}}</div>
        </div>
        <div v-else>
          <ProblemResult :result="item.response.result"></ProblemResult>
          <el-tag type="success">{{item.response.memory}} M</el-tag>
          <el-tag type="success">{{item.response.time}} S</el-tag>
          <!-- <el-button type="danger" size="small" v-on:click="showDetail(item.id)">查看详情</el-button> -->
          <el-button type="danger" size="small" @click="getSubmissionResult(item.id)">查看详情</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ProblemResult from "./problemResult.vue";

export default {
  data() {
    return {};
  },
  methods: {
    removeNotice(index) {
      this.$store.commit("deleteSubmission", index);
    },
    getSubmissionResult(id) {
      this.$router.push({ path: `/submission/${id}` });
    },
    // showDetail(id) {
    //   var {ipcRenderer} = require("electron");
    //   ipcRenderer.send("newWin");
    // }
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

<style scoped>
.global-submission {
  position: fixed;
  top: 80px;
  right: 0;
  margin-right: 30px;
  width: 335px;
  z-index: 1000;
}

.each {
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.2);
  padding: 10px 16px;
  background: #fff;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 10px;
  position: relative;
}

/* .h2 {
  padding-right: 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
} */

.close {
  position: absolute;
  top: 14px;
  right: 16px;
  size: 16px;
}
</style>