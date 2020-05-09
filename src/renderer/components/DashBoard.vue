<template>
  <div>
    <el-row :gutter="20">
      <el-col :span="16">
        <div>
          <el-card>
            <!-- 分页区域 -->
            <div class="header">
              <i class="el-icon-message"></i>
              <span slot="title">消息</span>
            </div>
            <div v-if="message.data.length==0">暂无消息</div>
            <template v-for="(item,idx) in message.data">
              <div v-if="item.type == 0" v-bind:key="idx">
                <el-row>
                  <!-- <el-col :span="3" class="img">
                    <Icon type="ios-email" color="#4b3a76"></Icon>
                  </el-col>
                  <el-col :span="21">
                    <div class="time">{{getTime(item.create_time)}}</div>
                    <div class="detail">
                      <span v-html="item.content"></span>
                    </div>
                  </el-col>-->
                </el-row>
              </div>

              <div v-if="item.type == 1" v-bind:key="idx">
                <el-row>
                  <!-- <el-col span="3" class="img">
                    <Icon type="trophy" color="#fea116"></Icon>
                  </el-col>
                  <el-col span="21" class="content">
                    <div class="time">{{getTime(item.create_time)}}</div>
                    <div class="detail">
                      一起来看看
                      <router-link
                        :to="{path: '/contest/'+item.json_content.cid}"
                      >{{item.json_content.name}}</router-link>的
                      <router-link
                        :to="{path: '/contest/'+item.json_content.cid+'/leaderboard'}"
                      >排行榜</router-link>
                    </div>
                    <div class="description">
                      前三名：
                      <template v-if="item.json_content.rank[0]">
                        <Icon type="ribbon-a" color="#c37e00"></Icon>
                        <router-link
                          :to="{path: '/profile/'+item.json_content.rank[0].uid}"
                        >{{item.json_content.rank[0].nickname}}</router-link>
                      </template>
                      <template v-if="item.json_content.rank[1]">
                        <Icon type="ribbon-a" color="#a1a3a6"></Icon>
                        <router-link
                          :to="{path: '/profile/'+item.json_content.rank[1].uid}"
                        >{{item.json_content.rank[1].nickname}}</router-link>
                      </template>
                      <template v-if="item.json_content.rank[2]">
                        <Icon type="ribbon-a" color="#78331e"></Icon>
                        <router-link
                          :to="{path: '/profile/'+item.json_content.rank[2].uid}"
                        >{{item.json_content.rank[2].nickname}}</router-link>
                      </template>
                    </div>
                  </el-col>-->
                </el-row>
              </div>
            </template>

            <el-pagination
              @current-change="handleCurrentChange"
              :current-page="queryInfo.page"
              :page-size="queryInfo.page_size"
              :total="total"
              layout="total, prev, pager, next, jumper"
            ></el-pagination>
          </el-card>
        </div>
      </el-col>
      <el-col :span="8">
        <div>
          <el-row :gutter="10">
            <el-col :span="4">
              <el-avatar shape="square" size="large" :src="$getAvatar($store.state.userInfo.uid)" />
            </el-col>
            <el-col :span="20">
              <router-link
                :to="{path: '/profile/'+$store.state.userInfo.uid}"
              >{{$store.state.userInfo.nickname}}</router-link>
              <div>
                <span>提交: {{$store.state.userInfo.submit_times}}</span>
                <span>通过: {{$store.state.userInfo.ac_times}}</span>
                <span>通过率: {{util.getACRate($store.state.userInfo.ac_times,$store.state.userInfo.submit_times)}}</span>
              </div>
            </el-col>
          </el-row>
          <el-button
            style="width: 100%; margin-top: 20px; margin-bottom: 10px;"
            @click="openEditor"
          >打开编辑器</el-button>
          <!-- <el-button
            style="width: 100%; margin-bottom: 10px;"
            @click="randomDoProblem()"
          >随机做题</el-button> -->
          <div>
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
        </div>
      </el-col>
    </el-row>
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
    // 监听 页码值 改变的事件
    handleCurrentChange(newPage) {
      this.queryInfo.page = newPage;
      this.getProblemList();
    },
    async getMessage() {
      const { data: res } = await this.$http.get("/messages/user", {
        params: this.queryInfo
      });

      // console.log(res);
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
        // console.log(res);
        this.$message.success("祝你好运");
        this.$router.push({ path: `/problem/${res.data.data}` });
      });
    },
    openEditor() {
      this.$router.push("./editor");
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
  background: #aaaaaa;
  padding: 10px 0;
  color: #fff;
}

.detail {
  margin-right: 8px;
  font-size: 13px;
}
</style>