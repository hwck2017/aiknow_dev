<template>
  <el-container class="home-container">
    <el-header>
      <el-row :gutter="5" type="flex" justify="space-between">
        <el-col :span="4">
          <div style="display:flex; padding: 10px 0px;">
            <img
              src="../../../static/logo.png"
              style="width:130px; height:40px; vertical-align:middle;"
            />
          </div>
        </el-col>
        <el-col :span="14">
          <div>
            <el-menu
              :default-active="$route.path"
              mode="horizontal"
              background-color="#000"
              text-color="#fff"
              active-text-color="#409EFF"
              router
            >
              <el-menu-item index="/dashboard">
                <i class="el-icon-s-home"></i>
                <span slot="title">主页</span>
              </el-menu-item>
              <el-menu-item index="/problems">
                <i class="el-icon-menu"></i>
                <span slot="title">题目</span>
              </el-menu-item>
              <el-menu-item index="/editor">
                <i class="el-icon-edit"></i>
                <span slot="title">编辑器</span>
              </el-menu-item>
              <!-- <el-menu-item index="/contest" disabled>
                <i class="el-icon-s-flag"></i>
                <span slot="title">比赛</span>
              </el-menu-item>
              <el-menu-item index="/groups" disabled>
                <i class="el-icon-user"></i>
                <span slot="title">小组</span>
              </el-menu-item>
              <el-menu-item index="/ranklist" disabled>
                <i class="el-icon-trophy"></i>
                <span slot="title">排行榜</span>
              </el-menu-item>-->
            </el-menu>
          </div>
        </el-col>
        <el-col :span="6">
          <div v-if="$store.state.userInfo.isLogin" style="padding: 15px 20px;">
            <!-- <el-avatar
              :size="30"
              :src="$getAvatar($store.state.userInfo.uid)"
              style="vertical-align:middle;"
            ></el-avatar>-->
            <el-avatar :size="35" :src="circleUrl" style="vertical-align:middle;"></el-avatar>
            <span>
              <el-dropdown @command="handleCommand">
                <span class="el-dropdown-link">
                  {{$store.state.userInfo.nickname}}
                  <i class="el-icon-arrow-down el-icon--right"></i>
                </span>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item command="/user">个人中心</el-dropdown-item>
                  <el-dropdown-item command="logout">退出</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </span>
          </div>
          <div v-else style="padding: 10px 0px;">
            <el-button-group round>
              <el-button plain @click="login">登录</el-button>
              <el-button plain @click="regist">注册</el-button>
            </el-button-group>
          </div>
        </el-col>
      </el-row>
    </el-header>
    <el-container>
      <el-main>
        <router-view></router-view>
      </el-main>
      <el-footer height="30px">
        <div class="footer">2019-2020 &copy; aiknow</div>
      </el-footer>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      circleUrl:
        "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png"
    };
  },
  methods: {
    handleCommand(command) {
      if (command === "logout") {
        this.$store.commit("logout");
      } else {
        this.$router.push(command);
      }
    },
    login() {
      this.$router.push("/login");
    },
    regist() {
      this.$router.push("/register");
    }
  }
};
</script>

<style scoped>
.home-container {
  height: 100%;
}

.el-radio-group {
  line-height: 2px;
  font-size: 1em;
}

.el-header {
  /* background-color: #f11c40; */
  background-color: #000;
  height: 70px;
}

.el-button {
  background: #000 !important;
  color: #fff;
}

.title-style {
  color: #409eff;
  font-size: 20px;
  float: left;
  padding: 12px 0px 15px 0px;
  text-align: center;
}

.el-dropdown-link {
  cursor: pointer;
  color: #fff;
  font-size: 24px;
}
.el-icon-arrow-down {
  font-size: 16px;
}

.el-menu-item {
  font-size: 18px !important;
}

.footer {
  text-align: center;
  height: 20px;
  line-height: 20px;
  color: #f11c40;
}

/* .father .child {
  display: none;
}

.father:hover .child {
  display: block;
} */
</style>



