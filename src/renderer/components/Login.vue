<template>
  <div>
    <br />
    <el-button round @click="loginVisible = true">登录</el-button>
    <el-button round @click="registVisible = true">注册</el-button>

    <el-radio-group v-model="loginIndex" size="small">
      <el-radio-button label="1">账号密码登录</el-radio-button>
      <el-radio-button label="2">手机号登录</el-radio-button>
    </el-radio-group>
    <div style="margin: 20px;"></div>
    <el-form :label-position="right" label-width="80px" :model="loginInfo">
      <el-form-item label="loginMode[loginIndex] === 'user-passwd'?'账号':'手机号'">
        <el-input v-model="loginInfo.username"></el-input>
      </el-form-item>
      <el-form-item label="loginMode[loginIndex] === 'user-passwd'?'密码':'验证码'">
        <el-input v-model="loginInfo.password"></el-input>
      </el-form-item>
    </el-form>

    <el-button type="primary" @click="login()">登录</el-button>

    <!-- 登录 -->
    <!-- <el-dialog
      title="登录"
      :visible.sync="loginVisible"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
      :center="true"
    >
      <el-form :model="user">
        <el-form-item label="用户名">
          <el-input v-model="user.name" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="user.password" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="login()">确认</el-button>
      </div>
    </el-dialog>-->
    <!-- 注册 -->
    <el-dialog
      title="注册"
      :visible.sync="registVisible"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
      :center="true"
    >
      <el-form :model="user">
        <el-form-item label="用户名">
          <el-input v-model="user.name" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="user.password" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="密码确认">
          <el-input v-model="user.passwordAgain" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="电话号码">
          <el-input v-model="user.telephone" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="昵称">
          <el-input v-model="user.nickname" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="regist()">确认</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
const axios = require("axios");

export default {
  data() {
    return {
      loginIndex: "1",
      loginMode: [{ "1": "user-passwd" }, { "2": "phone" }],
      loginInfo: {
        username: "",
        password: "",
        telephone: ""
      },
      loginVisible: true,
      registVisible: false,
      user: {},
      circleUrl:
        "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png"
    };
  },
  methods: {
    getData() {
      // Make a request for a user with a given ID
      // Url做成可配置
      axios
        .get("http://oj.aiknow.cn/problems")
        .then(response => {
          // handle success
          console.log(response.data);
          //this.rsp = response
        })
        .catch(function(error) {
          // handle error
          console.log(error);
        });
    },
    login() {
      if (this.user.name && this.user.password) {
        xios
          .post("/login", {
            userName: this.user.name,
            password: this.user.password
          })
          .then(function(response) {
            console.log(response);
            this.loginVisible = false;
          })
          .catch(function(error) {
            console.log(error);
          });
      } else {
        this.$message({
          message: "用户名密码不能为空",
          type: "warning"
        });
      }
    },
    regist() {
      axios
        .post("/user", {
          userName: this.user.name,
          password: this.user.password
        })
        .then(function(response) {
          console.log(response);
          this.registVisible = false;
        })
        .catch(function(error) {
          console.log(error);
        });
    },
    goUserHome() {
      this.$router.push({ path: "/user-home" });
    }
  }
};
</script>

<style scoped>
</style>