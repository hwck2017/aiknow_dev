<template>
  <el-container class="home-container">
    <el-header style="height: 3.646vw">
      <img class="headerBgImg" src="https://aiknow.cn/res/python.png" alt="">

      <el-row :gutter="5" type="flex" justify="space-between">
        <el-col :span="5">
          <div class="loginInfoBg" v-if="$store.state.userInfo.isLogin">
            <el-avatar
              :src="circleUrl"
              style="vertical-align: middle; width: 2.5vw; height: 2.5vw"
            ></el-avatar>
            <span>
              <el-dropdown @command="handleCommand">
                <span class="el-dropdown-link">
                  {{ $store.state.userInfo.nickname }}
                  <i class="el-icon-arrow-down el-icon--right" style="fontSize: 1.354vw;"></i>
                </span>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item command="profile"
                    >个人中心</el-dropdown-item
                  >
                  <el-dropdown-item command="logout">退出</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </span>
          </div>
          <div v-else style="">
            <el-button class="loginBtn" @click="login">登录</el-button>
          </div>
        </el-col>
        <el-col :span="16">
          <div>
            <!-- <el-menu
              :default-active="$route.path"
              mode="horizontal"
              text-color="#fff"
              active-text-color="#1E4796"
              router
            >
              <el-menu-item index="/dashboard">
                <i class="el-icon-s-home"></i>
                <span slot="title">主页</span>
              </el-menu-item>
              <el-menu-item index="/editor">
                <i class="el-icon-edit"></i>
                <span slot="title">编辑器</span>
              </el-menu-item>
              <el-menu-item index="/problems">
                <i class="el-icon-menu"></i>
                <span slot="title">题目</span>
              </el-menu-item>
              <el-menu-item index="/contest" disabled>
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
              </el-menu-item>
            </el-menu> -->

            <div class="elMenuBg">
              <div :class="headerItemSelectedIndex == 0 ? 'elMenuItemSelected' : 'elMenuItem'" @click="jump(0, '/dashboard')">
                <span class="itemTitle">主页</span>
              </div>
              <div :class="headerItemSelectedIndex == 1 ? 'elMenuItemSelected' : 'elMenuItem'" @click="jump(1, '/editor')">
                <span class="itemTitle">编辑器</span>
              </div>
              <div :class="headerItemSelectedIndex == 2 ? 'elMenuItemSelected' : 'elMenuItem'" @click="jump(2, '/problems')">
                <span class="itemTitle">题目</span>
              </div>
            </div>

          </div>
        </el-col>
        <el-col :span="6">

        </el-col>
      </el-row>

    </el-header>
    <el-container>
      <el-main>
        <router-view></router-view>
      </el-main>
      <el-footer height="40px">
        <div class="footer">
          2019-2021 &copy; 爱知部落<br />version {{ version }}
        </div>
      </el-footer>
    </el-container>
  </el-container>
</template>

<script>
var pkg = require("../../../package.json");
var myStorage = require("../../../lib/storage");

export default {
  data() {
    return {
      version: "",
      circleUrl:
        "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png",
      headImgUrl: "",
      headerItemSelectedIndex: 0,
    };
  },
  methods: {
    handleCommand(command) {
      if (command === "logout") {
        this.$store.commit("logout");
      } else {
        // this.$router.push(command);
        this.$router.push("/profile/" + this.$store.state.userInfo.uid);
      }
    },
    login() {
      this.$router.push("/login");
    },
    // regist() {
    //   this.$router.push("/register");
    // },
    getVersion() {
      this.version = pkg.version;
      // console.log("process: ", pkg);
    },
    getHeadImgUrl() {
      // noexist is null
      this.headImgUrl = myStorage.getFromLS("headimgurl");
      console.log("headimgurl: ", this.headImgUrl);
    },

    jump(index, path) {
      this.headerItemSelectedIndex = index;
      this.$router.push({ path: path });      
    }
  },
  created() {
    this.getVersion();
    // console.log($store.state.userInfo.isLogin)
  },
  mounted() {
    this.getHeadImgUrl();
  },
};
</script>

<style scoped>

@font-face {
  font-family: tonjayBold;
  src: url('../../../lib/font/SweiGospelSansCJKsc-Black.ttf') format('woff');
}

.home-container {
  height: 100%;
}

.loginInfoBg {
  margin-top: 0.78125vw;
}

.el-radio-group {
  line-height: 2px;
  font-size: 1em;
}

.el-header {
  /* background-color: #f11c40; */
  /* background-color: rgb(253, 155, 64); */
  height: auto;
  /* background: url('https://aiknow.cn/res/python.png') no-repeat 100% 100%; */
  position: relative;;
  z-index: 9;
  /* min-width: 1200px; */
 
}

.headerBgImg {
  position: absolute;
  width: 100%;
  height: 7.448vw;
  object-fit: initial;
  top: 0;
  left: 0;
}

/* .el-button {
  background: rgb(253, 155, 64) !important;
  color: #fff;
} */

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
  font-size: 1.354vw;
  font-weight: bold;
  margin-left: 0.5208vw;
}
.el-icon-arrow-down {
  font-size: 16px;
}

.el-menu-item {
}

.elMenuBg {
  display: flex;
  float: right;
}

.elMenuItem {
  padding: 0 1.5625vw;
  height: 2.5vw;
  line-height: 2.5vw;
  background-color: none;
  margin-top: 0.78125vw;
  color: #fff;
  font-size: 1.354vw;
  font-family: tonjayBold;

}

.elMenuItemSelected {
  padding: 0 1.5625vw;
  height: 2.5vw;
  line-height: 2.5vw;
  background-color: #fff;
  margin-top: 0.78125vw;
  color: #275ca7;
  border-radius: 6px;
  font-size: 1.354vw;
  font-family: tonjayBold;
}


.loginBtn {
  height: 2.5vw;;
  background: none;
  border: none;
  color: #fff;
  font-size: 1.354vw;
  font-weight: bold;
  margin-top: 0.78125vw;;
}

.loginBtn:focus .loginBtn:hover {
  background: #fff;
  background-color: #fff;
  color: #275ca7;
}


.footer {
  text-align: center;
  height: 20px;
  line-height: 20px;
  color: rgb(253, 155, 64);
}

.el-main {
  padding: 0;
  padding-top: 2px;
}

/* .father .child {
  display: none;
}

.father:hover .child {
  display: block;
} */
</style>




