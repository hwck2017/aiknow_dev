<template>
  <div>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索与添加区域 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入搜索关键字" v-model="queryInfo.query" clearable @clear="getUserList">
            <!-- <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button> -->
          </el-input>
        </el-col>
      </el-row>

      <!-- 用户列表区域 -->
      <el-table :data="userlist" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="状态"></el-table-column>
        <el-table-column label="标题"></el-table-column>
        <el-table-column label="提交"></el-table-column>
        <el-table-column label="通过率"></el-table-column>
        <el-table-column label="难度"></el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
        :current-page="queryInfo.page"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.page_size"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
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
      problemlist: [],
      total: 0
    };
  },
  created() {
    this.getProblemList();
  },
  methods: {
    async getProblemList() {
      const { data: res } = await this.$http.get(
        "http://39.104.86.118:8080/problems/opened",
        {
          params: this.queryInfo
        }
      );
      if (res.status !== 200) {
        return this.$message.error("获取用户列表失败！");
      }

        this.problemlist = res.data;
      //   this.total = res.;
      console.log(res);
    }
  }
};
</script>