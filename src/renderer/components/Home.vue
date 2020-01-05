<template>
  <el-container class="home-container">
    <el-header>
      <div>
        <!-- <img src="../assets/aiknow.png" alt=""> -->
        <span class="title-style">爱知部落</span>
      </div>

      <el-menu
        :default-active="$route.path"
        mode="horizontal"
        background-color="#000"
        text-color="#fff"
        active-text-color="#f11c40"
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
        <!-- <el-menu-item index="/editor">
          <i class="el-icon-edit"></i>
          <span slot="title">编辑器</span>
        </el-menu-item> -->
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
      </el-menu>

      <div>
        <el-dropdown @command="handleCommand" class="avatar-style">
          <span class="el-dropdown-link">
            {{$store.state.userInfo.nickname}}
            <i class="el-icon-caret-bottom el-icon--right"></i>
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="/user">个人中心</el-dropdown-item>
            <el-dropdown-item command="logout">退出</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <el-avatar :size="30" :src="$getAvatar($store.state.userInfo.uid)"></el-avatar>
      </div>
    </el-header>

    <el-container>
      <el-main>
        <router-view></router-view>
      </el-main>
      <el-footer height="20px">
        <div class="footer">2019-2020 &copy; aiknow</div>
      </el-footer>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      isCollapse: false
    };
  },
  methods: {
    handleCommand(command) {
      if (command === "logout") {
        this.$store.commit("logout");
      } else {
        this.$router.push(command);
      }
    }
  }
};
</script>

<style scoped>
.home-container {
  height: 100%;
}

.el-header {
  /* background-color: #f11c40; */
  background-color: #000;
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

.el-radio-group {
  line-height: 2px;
  font-size: 1em;
}

.title-style {
  color: #f11c40;
  font-size: 20px;
  float: left;
  padding: 3px 20px;
  /* margin-left: 20px;
  margin-right: 30px; */
}

.avatar-style {
  float: right;
  padding: 3px 20px;
}

.el-dropdown-link {
  cursor: pointer;
  color: #fff;
  font-size: 20px;
}
.el-icon-arrow-down {
  font-size: 20px;
}

.footer {
  text-align: center;
  height: 20px;
  line-height: 20px;
  color: #9ea7b4;
}
</style>



