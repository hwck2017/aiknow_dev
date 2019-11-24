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
                  <i class="el-icon-arrow-down el-icon--right"></i>
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
              <template slot-scope="scope">
                {{Math.round(scope.row.ac_times/scope.row.submit_times*10000)/100}}%</template>
            </el-table-column>
            <el-table-column label="状态"></el-table-column>
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
      <el-aside width="100px">
        <!-- <el-tabs v-model="activeName" @tab-click="handleClick">
          <el-tab-pane label="标签" name="tag"></el-tab-pane>
          <el-tab-pane label="难度" name="difficult">
            <el-row>
              <el-button type="success">简单</el-button>
              <el-button type="info">中等</el-button>
              <el-button type="warning">困难</el-button>
              <el-button type="danger">专家</el-button>
            </el-row>
          </el-tab-pane>
        </el-tabs>-->
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
      total: 0
    };
  },
  created() {
    this.getProblemList();
  },
  methods: {
    async getProblemList() {
      const { data: res } = await this.$http.get("/problems/opened", {
        params: this.queryInfo
      });
      if (res.status !== 200) {
        return this.$message.error("获取题目列表失败！");
      }

      this.problemlist = res.data.data;
      this.total = res.data.total;
      console.log(this.problemlist);
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
    async getDetails(row) {
      // console.log(row); //此时就能拿到整行的信息

      this.$router.push({
        name: "problem",
        params: {
          problemID: row.pid
        }
      });
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
</style>