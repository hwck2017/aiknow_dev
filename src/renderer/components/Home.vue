<template>
  <div>
    <el-container class="home-container">
      <el-header>
        <div>
          <!-- <img src="../assets/heima.png" alt=""> -->
          <span>test</span>
        </div>

        <el-menu
          :default-active="home"
          mode="horizontal"
          @select="handleSelect"
          background-color="#f11c40"
          text-color="#fff"
          router
        >
          <el-menu-item index="home">
            <i class="el-icon-location"></i>
            <span slot="title">主页</span>
          </el-menu-item>
          <el-menu-item index="problems">
            <i class="el-icon-menu"></i>
            <span slot="title">题目</span>
          </el-menu-item>
        </el-menu>

        <div>
          <!-- <el-avatar class="avatar-style" :size="30" :src="circleUrl"></el-avatar> -->
          <el-dropdown @command="handleCommand">
            <el-avatar class="avatar-style" :size="30" :src="circleUrl"></el-avatar>
            <!-- <span class="el-dropdown-link">
              <i class="el-icon-arrow-down el-icon--right"></i>
            </span>-->
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="userHome">个人中心</el-dropdown-item>
              <el-dropdown-item command="logout">退出</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </el-header>

      <el-container>
        <el-aside width="200px">
          <!-- 侧边栏 -->
          <!-- 展开 or 收起 -->
          <!-- <el-radio-group 
                v-model="isCollapse" 
                style="margin-bottom: 20px;" 
                text-color="#f11c40" 
                fill="#fff" 
                size="medium">
            <el-radio-button :label="false">展开</el-radio-button>
            <el-radio-button :label="true">收起</el-radio-button>
          </el-radio-group>-->

          <!-- <el-menu 
            default-active="home" 
            class="el-menu-style" 
            @open="handleOpen" 
            @close="handleClose" 
            :collapse="isCollapse" 
            active-text-color="#f11c40"
            :collapse-transition="false"
            router>
            <el-menu-item index="home">
                <i class="el-icon-location"></i>
                <span slot="title">主页</span>
            </el-menu-item>
            <el-menu-item index="problems">
                <i class="el-icon-menu"></i>
                <span slot="title">题目</span>
            </el-menu-item>
          </el-menu>-->
        </el-aside>
        <el-container>
          <el-main>
            <router-view></router-view>
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
      circleUrl:
        "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png",
      isCollapse: false
    };
  },
  methods: {
    handleCommand(command) {
      this.$message("click on item " + command);
      if (command === "logout") {
        this.logout();
      } else if (command === "userHome") {
        this.goUserHome();
      }
    },
    logout() {
      window.sessionStorage.clear();
      this.$router.push("/login");
    },
    handleSelect(key, keyPath) {
      console.log(key, keyPath);
    },
    goUserHome() {
      this.$router.push({ path: "/user-home" });
    }
  }
};
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
  font-size: 30px;
  > div {
    display: flex;
    align-items: center;
    span {
      margin-left: 15px;
    }
  }
}

.el-menu-style:not(.el-menu--collapse) {
  /* width: 200px; */
  min-height: 400px;
}

.el-radio-group {
  line-height: 2px;
  font-size: 1em;
}
</style>



