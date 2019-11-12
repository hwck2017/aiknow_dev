<template>
  <div>
    <el-container class="home-container">
      <el-header>
        <div>
          <!-- <img src="../assets/heima.png" alt=""> -->
          <span>爱知部落</span>
        </div>
        <el-avatar class="avatar-style" :size="30" :src="circleUrl"></el-avatar>
        <el-dropdown trigger="click" >
          <span class="el-dropdown-link">
            <i class="el-icon-arrow-down el-icon--right"></i>
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item>个人中心</el-dropdown-item>
            <el-dropdown-item @click="layout()">退出</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </el-header>

      <el-container>
        <!-- 侧边栏 -->
        <el-radio-group v-model="isCollapse" style="margin-bottom: 20px;">
          <el-radio-button :label="false">展开</el-radio-button>
          <el-radio-button :label="true">收起</el-radio-button>
        </el-radio-group>
        <el-menu default-active="1-4-1" class="el-menu-vertical-demo" @open="handleOpen" @close="handleClose" :collapse="isCollapse" background-color='#f11c40'>
          <el-menu-item index="1">
            <template slot="title">
              <i class="el-icon-location"></i>
              <span slot="title">主页</span>
            </template>
          </el-menu-item>
          <el-menu-item index="2">
            <i class="el-icon-menu"></i>
            <span slot="title">题目</span>
          </el-menu-item>
        </el-menu>
        <el-container>
          <!-- 右侧内容主体 -->
          <el-main>
            <!-- 路由占位符 -->
            <!-- <router-view></router-view> -->
            Main
          </el-main>
          <el-footer>Footer</el-footer>
        </el-container>
      </el-container>
    </el-container>
  </div>
</template>

<script>
export default {
  data() {
      return {
        circleUrl: "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png",
        isCollapse: true
      }
  },
  methods: {
    layout() {
      console.log("layout");
    }
  }
}
</script>

<style scoped>
  .home-container {
    height: 100%;
  }

  .el-header {
    background-color: #f11c40;
    display: flex;
    justify-content: space-between;
    padding-left: 0;
    align-items: center;
    color: #fff;
    font-size: 20px;
    > div {
      display: flex;
      align-items: center;
      span {
        margin-left: 15px;
      }
    }
  }

  .el-menu-vertical-demo:not(.el-menu--collapse) {
    width: 200px;
    min-height: 400px;
  }

</style>



