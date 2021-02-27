<template>
  <div>
    <el-container>
      <el-aside width="200px">
        <el-row>
          <el-col :span="8">
            <h4>个人信息</h4>
            <el-menu :default-active="getActiveName" active-text-color="#f11c40" @select="goTo">
              <!-- :active-name="getActiveName" width="auto" @on-select="goTo" -->
              <!-- <el-menu-item index="edit">
                <i class="el-icon-edit"></i>
                <span slot="title">信息编辑</span>
              </el-menu-item>
              <el-menu-item index="security">
                <i class="el-icon-lock"></i>
                <span slot="title">账号安全</span>
              </el-menu-item> -->
              <el-menu-item index="my_zone">
                <i class="el-icon-user"></i>
                <span slot="title">我的主页</span>
              </el-menu-item>
              <!-- <h4>相关管理</h4>
              <el-menu-item index="problem" disabled>
                <i class="el-icon-menu"></i>
                <span slot="title">题目管理</span>
              </el-menu-item>
              <el-menu-item index="contest" disabled>
                <i class="el-icon-trophy"></i>
                <span slot="title">比赛管理</span>
              </el-menu-item>
              <el-menu-item index="group" disabled>
                <i class="el-icon-s-custom"></i>
                <span slot="title">小组管理</span>
              </el-menu-item> -->
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
  created() {
    let path = this.$route.path;
    if (path == "/user") this.name = "edit";
    else this.name = path.replace("/user/", "");
  },
  data() {
    return {
      name: "edit"
    };
  },
  methods: {
    goTo(name) {
      if (name == "edit") this.$router.push("/user");
      else if (name == "my_zone") this.$router.push("/profile/" + this.getUid);
      else this.$router.push("/user/" + name);
    }
  },
  computed: {
    getUid() {
      return this.$store.state.userInfo.uid;
    },
    getActiveName() {
      let path = this.$route.path;
      if (path === "/user") {
        return "edit";
      } else {
        return path.replace("/user/", "");
      }
    }
  }
};
</script>

<style  scoped>
.el-col-8 {
  width: 100%;
}

</style>