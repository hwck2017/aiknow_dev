<template>
  <div>
    <el-container>
      <!-- 卡片视图区域 -->
      <el-main>
        <el-card>
          <!-- 搜索与添加区域 -->
          <el-row :gutter="100">
            <el-col :span="16">
              <el-input
                placeholder="输入关键字搜索"
                v-model="queryInfo.query"
                clearable
                @clear="getProblemList"
              >
                <el-button slot="append" icon="el-icon-search" @click="getProblemList"></el-button>
              </el-input>
            </el-col>
            <el-col :span="8">
              <el-dropdown @command="handleCommand">
                <span class="el-dropdown-link">
                  难度
                  <i class="el-icon-caret-bottom el-icon--right"></i>
                </span>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item command="-1">不限</el-dropdown-item>
                  <el-dropdown-item command="0">简单</el-dropdown-item>
                  <el-dropdown-item command="1">中等</el-dropdown-item>
                  <el-dropdown-item command="2">困难</el-dropdown-item>
                  <el-dropdown-item command="3">专家</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </el-col>
          </el-row>

          <!-- 题目列表区域 -->
          <el-table :data="problemlist" stripe @row-click="getDetails">
            <el-table-column type="index"></el-table-column>
            <el-table-column label="标题" prop="title"></el-table-column>
            <el-table-column label="难度" prop="difficult">
              <template slot-scope="scope">
                <el-tag type="success" v-if="scope.row.difficult===0">简单</el-tag>
                <el-tag type="info" v-if="scope.row.difficult===1">中等</el-tag>
                <el-tag type="warning" v-if="scope.row.difficult===2">困难</el-tag>
                <el-tag type="danger" v-if="scope.row.difficult===3">专家</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="提交" prop="submit_times"></el-table-column>
            <el-table-column label="通过率" prop="ac_percent">
              <template
                slot-scope="scope"
              >{{scope.row.submit_times?(((scope.row.ac_times / scope.row.submit_times)*100).toFixed(2)+'%'):'0.00%'}}</template>
            </el-table-column>
            <el-table-column label="状态" prop="status">
              <template slot-scope="scope">
                <el-tag effect="plain" type="success" v-if="scope.row.status === 'AC'">通过</el-tag>
                <el-tag effect="plain" type="warning" v-if="scope.row.status === 'WA'">答案错误</el-tag>
                <el-tag effect="plain" v-if="scope.row.status === 'RTE'">运行错误</el-tag>
                <el-tag effect="plain" type="info" v-if="scope.row.status === 'RTE'">运行超时</el-tag>
                <el-tag effect="plain" type="danger" v-if="scope.row.status === 'CE'">编译错误</el-tag>
              </template>
            </el-table-column>
          </el-table>

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
        <el-button
          icon="el-icon-search"
          style="width: 100%; margin-top: 20px; margin-bottom: 20px;"
          @click="randomDoProblem()"
        >随机做题</el-button>

        <el-card>
          <i class="el-icon-collection-tag" style="margin-bottom: 10px">标签云</i>
          <!-- <el-tabs v-model="queryInfo.tag" @tab-click="getProblemList"></el-tabs> -->
          <div class="tag-group">
            <el-tag effect="plain" @click="getProblemsByTag('')">不限</el-tag>
            <el-tag
              v-for="item in tags"
              :key="item.tid"
              effect="plain"
              @click="getProblemsByTag(item.name)"
            >{{item.name}} {{item.used}}</el-tag>
          </div>
        </el-card>
      </el-aside>
    </el-container>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 获取用户列表的参数对象
      queryInfo: {
        query: "",
        // 当前的页数
        page: 1,
        // 当前每页显示多少条数据
        page_size: 10,
        difficult: -1,
        tag: "",
        uid: ""
      },
      problemInfo: {
        pid: 0,
        title: "",
        submit_times: 0,
        ac_times: 0,
        ac_percent: 0,
        difficult: -1
      },
      problemlist: [],
      tags: [],
      total: 0
    };
  },
  created() {
    this.getProblemList();
    this.getTags();
  },
  methods: {
    async getProblemList() {
      if (this.$store.state.userInfo.isLogin) {
        this.queryInfo.uid = this.$store.state.userInfo.uid;
      }
      const { data: res } = await this.$http.get("/problems/opened", {
        params: this.queryInfo
      });
      if (res.status !== 200) {
        return this.$message.error("获取题目列表失败！");
      }
      // console.log(res);
      this.problemlist = res.data.data;
      this.total = res.data.total;
    },
    async getTags() {
      const { data: res } = await this.$http.get("/tags");
      if (res.status !== 200) {
        return this.$message.error("获取标签失败！");
      }

      this.tags = res.data;
      // console.log(this.tags);
    },
    randomDoProblem() {
      this.$http.get("/problem/random").then(res => {
        // console.log(res);
        this.$message.success("祝你好运");
        this.$router.push({ path: `/problem/${res.data.data}` });
      });
    },
    // 监听 pagesize 改变的事件
    handleSizeChange(newSize) {
      // console.log(newSize)
      this.queryInfo.page_size = newSize;
      this.getProblemList();
    },
    // 监听 页码值 改变的事件
    handleCurrentChange(newPage) {
      // console.log(newPage);
      this.queryInfo.page = newPage;
      this.getProblemList();
    },
    handleCommand(command) {
      this.queryInfo.difficult = command;
      this.getProblemList();
    },
    getDetails(row) {
      // console.log(row); //此时就能拿到整行的信息

      this.$router.push({ path: `/problem/${row.pid}` });
    },
    getProblemsByTag(tag) {
      this.queryInfo.tag = tag;
      this.getProblemList();
    }
  }
};
</script>

<style scoped>
.el-dropdown-link {
  /* cursor: pointer; */
  color: #f11c40;
  font-size: 15px;
  float: right;
  padding: 3px 0;
}
.el-icon-arrow-down {
  font-size: 15px;
}

.el-dropdown {
  margin-right: 10px;
}

.el-aside {
  margin-top: 60px;
}
</style>