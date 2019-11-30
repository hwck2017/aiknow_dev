<template>
  <div>
    <el-container>
      <!-- 卡片视图区域 -->
      <el-main>
        <el-card>
          <!-- 分页区域 -->

          <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="queryInfo.page"
            :page-sizes="[5, 10, 20, 50]"
            :page-size="queryInfo.page_size"
            :total="total"
            layout="total, sizes, prev, pager, next, jumper"
          ></el-pagination>
        </el-card>
      </el-main>
      <el-aside width="25%">
        <el-avatar shape="square" size="large" :src="$getAvatar($store.state.userInfo.uid)" />
        <div class="detail">
          <h3>
            <router-link
              :to="{path: '/profile/'+$store.state.userInfo.uid}"
            >{{$store.state.userInfo.nickname}}</router-link>
          </h3>
          <p>
            <span>提交 {{$store.state.userInfo.submit_times}}</span>
            <span>通过 {{$store.state.userInfo.ac_times}}</span>
            <span>AC {{util.getACRate($store.state.userInfo.ac_times,$store.state.userInfo.submit_times)}}</span>
          </p>
        </div>
        <el-button
          style="width: 100%; margin-top: 10px; margin-bottom: 10px;"
          @click="randomDoProblem()"
        >随机做题</el-button>
        <div class="announcement">
          <div class="header">
            <i class="el-icon-document"></i>
            <span slot="title">公告</span>
          </div>
          <ul>
            <div v-if="announcement.list.length == 0">暂无公告</div>
            <li
              v-for="(item, index) in announcement.list"
              v-bind:key="index"
              @click="showAnnouncement(index)"
            >
              <span>{{index+1}}.</span>
              {{item.title}}
            </li>
          </ul>
        </div>
      </el-aside>
    </el-container>
  </div>
</template>

<script>
import Util from "@/util";

export default {
  data() {
    return {
      announcement: {
        list: [],
        title: "",
        content: "",
        time: 0,
        switch: false
      },
      message: {
        data: [],
        total: 0
      },
      // 获取用户列表的参数对象
      queryInfo: {
        // 当前的页数
        page: 1,
        // 当前每页显示多少条数据
        page_size: 10
      },
      total: 0,
      util: Util
    };
  },
  methods: {
    // 监听 pagesize 改变的事件
    handleSizeChange(newSize) {
      this.queryInfo.page_size = newSize;
      this.getProblemList();
    },
    // 监听 页码值 改变的事件
    handleCurrentChange(newPage) {
      this.queryInfo.page = newPage;
      this.getProblemList();
    },
    async getMessage() {
      const { data: res } = await this.$http.get("/messages/user", {
        params: this.queryInfo
      });

      console.log(res);
      if (res.status !== 200) {
        return this.$message.error("获取题目列表失败！");
      }

      this.message.data = res.data.data;
      this.message.total = res.data.total;
    },
    async getAnnouncement() {
      const { data: res } = await this.$http.get("/announcements");
      this.announcement.list = res.data;
    },
    showAnnouncement(index) {
      this.announcement.switch = true;
      this.announcement.title = this.announcement.list[index].title;
      this.announcement.content = this.announcement.list[index].content;
      this.announcement.time = this.announcement.list[index].create_time;
    },
    randomDoProblem() {
      this.$http.get("/problem/random").then(res => {
        console.log(res);
        this.$message.success("祝你好运");
        this.$router.push({ path: `/problem/${res.data.data}` });
      });
    }
  },
  created() {
    this.getMessage();
    this.getAnnouncement();
  }
};
</script>

<style  scoped>
.random {
  margin-bottom: 15px;
  margin-top: 15px;
}

.announcement {
  margin-bottom: 15px;
  border: 1px solid #dddee1;
}

.header {
  text-align: center;
  font-size: 15px;
  font-weight: bold;
  background: #ff9900;
  padding: 10px 0;
  color: #fff;
}

.detail {
  margin-right: 8px;
  font-size: 13px;
}
</style>