<template>
  <div id="app">
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
    <router-view></router-view>
  </div>
</template>

<script>
import ProblemResult from "./components/problem/problemResult.vue";
export default {
  name: "aiknow-dev",
  methods: {
    removeNotice(index) {
      this.$store.commit("deleteSubmission", index);
    },
    getSubmissionResult(id) {
      console.log(id);

      this.$router.push({
        name: "submission",
        params: {
          id: id
        }
      });
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

<style lang="stylus">
// #app
// 	min-width 100%
// 	min-height 100%
// 	position relative
// 	padding-bottom 50px
// 	#global-submission
// 		position fixed
// 		top 24px
// 		right 0
// 		margin-right 24px
// 		width 335px
// 		z-index 1000
// 		.each
// 			box-shadow 0 1px 6px rgba(0,0,0,.2)
// 			padding 10px 16px
// 			background #fff
// 			border-radius 4px
// 			overflow hidden
// 			margin-bottom 10px
// 			position relative
// 			&:after
// 				background #2d8cf0
// 				content: ''
// 				display block
// 				width 4px
// 				position absolute
// 				top 0
// 				left 0
// 				bottom 0
// 			h2
// 				padding-right 10px
// 				overflow hidden
// 				text-overflow ellipsis
// 				white-space nowrap
// 				font-size 14px
// 				a
// 					color #495060
// 			.close
// 				position absolute
// 				top 14px
// 				right 16px
// 			.content
// 				text-align center
// 				.icon-loading
// 					animation: ani-icon-loading 1s linear infinite;
// 				@keyframes ani-icon-loading
// 					from
// 						transform: rotate(0deg)
// 					50%
// 						transform: rotate(180deg)
// 					to
// 						transform: rotate(360deg)
// 	#container
// 		max-width 1000px
// 		margin 0 auto
</style>