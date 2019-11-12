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
        <div>
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
        </div>
        <br>
        <!-- 侧边栏 -->
        <div>
        <el-radio-group v-model="isCollapse" style="margin-bottom: 20px;" text-color="#f11c40" fill="#fff" border size="small">
          <el-radio-button :label="false">展开</el-radio-button>
          <el-radio-button :label="true">收起</el-radio-button>
        </el-radio-group>
        </div>
        <el-menu 
          default-active="1-4-1" 
          class="el-menu-style" 
          @open="handleOpen" 
          @close="handleClose" 
          :collapse="isCollapse" 
          active-text-color="#f11c40">
          <el-menu-item index="dashboard">
            <template slot="title">
              <i class="el-icon-location"></i>
              <span slot="title">主页</span>
            </template>
          </el-menu-item>
          <el-menu-item index="problems">
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
    },
    handleOpen(key, keyPath) {
      console.log(key, keyPath);
    },
    handleClose(key, keyPath) {
      console.log(key, keyPath);
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

  .el-menu-styleo:not(.el-menu--collapse) {
    width: 80px;
    min-height: 400px;
  }

</style>



