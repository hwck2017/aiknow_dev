<template>
  <div>
    <el-container>
      <el-aside width="200px">
        <el-row>
          <el-col :span="8">
            <h4>个人信息</h4>
            <el-menu :default-active="$route.path" active-text-color="#f11c40" router>
              <el-menu-item index="/user">
                <i class="el-icon-edit"></i>
                <span slot="title">信息编辑</span>
              </el-menu-item>
              <el-menu-item index="/user/security">
                <i class="el-icon-lock"></i>
                <span slot="title">账号安全</span>
              </el-menu-item>
              <el-menu-item index="/profile/" disabled>
                <i class="el-icon-user"></i>
                <span slot="title">我的主页</span>
              </el-menu-item>
              <h4>相关管理</h4>
              <el-menu-item index="/user/problem" disabled>
                <i class="el-icon-menu"></i>
                <span slot="title">题目管理</span>
              </el-menu-item>
              <el-menu-item index="/user/contest" disabled>
                <i class="el-icon-trophy"></i>
                <span slot="title">比赛管理</span>
              </el-menu-item>
              <el-menu-item index="/user/group" disabled>
                <i class="el-icon-s-custom"></i>
                <span slot="title">小组管理</span>
              </el-menu-item>
            </el-menu>
          </el-col>
        </el-row>
      </el-aside>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </div>
</template>

<script>
export default {
  data() {
    return {};
  }
};
</script>

<style  scoped>
.el-col-8 {
  width: 100%;
}
</style>