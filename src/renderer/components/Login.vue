<template>
  <div>
    <!-- 登录 -->
    <div class="login_box">
      <el-radio-group v-model="loginMode" size="medium">
        <el-radio-button label="passwd">账号密码登录</el-radio-button>
        <el-radio-button label="phone">手机号登录</el-radio-button>
      </el-radio-group>

      <!-- :rules="loginFormRules" -->
      <el-form class="login_form" ref="loginFormRef" label-width="0px" :model="loginInfo">
        <el-form-item v-if="loginMode==='passwd'" prop="username">
          <el-input v-model="loginInfo.username" prefix-icon="el-icon-user" placeholder="请输入登录账号"></el-input>
        </el-form-item>
        <el-form-item v-if="loginMode==='passwd'" prop="password">
          <el-input
            v-model="loginInfo.password"
            prefix-icon="el-icon-lock"
            placeholder="请输入登录密码"
            :show-password="true"
          ></el-input>
        </el-form-item>
        <el-form-item v-if="loginMode==='phone'" prop="telephone">
          <el-input
            v-model="loginInfo.phoneNumber"
            prefix-icon="el-icon-mobile-phone"
            placeholder="请输入手机号码"
          ></el-input>
        </el-form-item>
        <el-form-item v-if="loginMode==='phone'" prop="verify">
          <el-input v-model="loginInfo.verifyCode" prefix-icon="el-icon-key" placeholder="请输入验证码">
            <template slot="append">
              <el-button type="primary" plain @click="getVerifyCode">{{content}}</el-button>
            </template>
          </el-input>
        </el-form-item>
        <!-- 记住密码 -->
        <div class="item">
          <label>记住密码</label>
          <input type="checkbox" v-model="loginInfo.remember" />
        </div>
        <el-form-item class="btns">
          <el-button @click="login">登录</el-button>
          <el-button type="info" @click="resetLoginForm()">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
var myStudy = require("../../../lib/study/study");
var myStorage = require("../../../lib/storage");

export default {
  data() {
    return {
      loginMode: "passwd",
      verifyCode: "",
      loginInfo: {
        username: "",
        password: "",
        phoneNumber: "",
        verifyCode: "",
        remember: true
      },
      content: "发送验证码",
      totalTime: 60,
      canClick: true
    };
  },
  methods: {
    // 点击重置按钮，重置登录表单
    resetLoginForm() {
      this.$refs.loginFormRef.resetFields();
    },
    async login() {
      let data;
      let url;
      if (this.loginMode === "phone") {
        url = "http://study.aiknow.cn/study/account/sms/login";
        data = {
          phone: this.loginInfo.phoneNumber,
          code: this.loginInfo.verifyCode
        };
      } else {
        url = "http://study.aiknow.cn/study/account/login";
        data = {
          username: this.loginInfo.username,
          password: this.loginInfo.password
        };
      }

      const { data: res } = await this.$http.post(url, data);
      console.log(res);
      if (res.errno !== 200) return this.$message.error(res.errmsg);
      // 将登录成功之后的 token，保存到客户端的 sessionStorage 中
      console.log(res.data.token);
      myStorage.storeToSS("token", res.data.token);
      if (this.loginInfo.remember) {
        myStorage.storeToLS("userInfo", this.loginInfo);
      } else {
        myStorage.storeToLS("userInfo", {
          username: "",
          password: "",
          phoneNumber: "",
          verifyCode: "",
          remember: false
        });
      }
      this.$store.dispatch("getUserInfo");
      // 判断是否有redirect，无跳转到home
      let redirect = this.$route.query.redirect;
      if (redirect) {
        this.$router.push(redirect);
      } else {
        this.$router.push("/home");
      }
    },
    async getVerifyCode() {
      if (this.loginInfo.phoneNumber === "") {
        return this.$message.warning("请输入手机号码");
      }

      if (!this.canClick) return;
      this.canClick = false;
      const { data: res } = await this.$http.post(
        "http://study.aiknow.cn/study/sms",
        {
          phone: this.loginInfo.phoneNumber
        }
      );

      this.countDown();
      if (res.errno === 200) return this.$message.success("已发送");
    },
    countDown() {
      this.content = this.totalTime + "s后重新发送"; //这里解决60秒不见了的问题
      let clock = window.setInterval(() => {
        this.totalTime--;
        this.content = this.totalTime + "s后重新发送";
        if (this.totalTime < 0) {
          //当倒计时小于0时清除定时器
          window.clearInterval(clock);
          this.content = "重新发送验证码";
          this.totalTime = 60;
          this.canClick = true;
        }
      }, 1000);
    },
    justNotice() {
      this.$message({
        message: "请登录",
        type: "success",
        duration: 1000
      });
    },
    getLocalUserInfo() {
      if (myStorage.getFromLS("userInfo")) {
        this.loginInfo = myStorage.getFromLS("userInfo");
      }
    }
  },
  created() {
    this.justNotice();
    this.getLocalUserInfo();
  }
};
</script>

<style scoped>
.btns {
  display: flex;
  justify-content: flex-end;
}

.login_box {
  width: 480px;
  height: 300px;
  background-color: #fff;
  border-radius: 3px;
  border: 1px solid #eee;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  margin-bottom: 20px;
}

/* .editor {
  position: absolute;
  bottom: 30px;
  right: 20px;
} */

.login_form {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box;
}

.el-radio-group {
  margin: 20px 0px;
  position: absolute;
  left: 50%;
  transform: translate(-50%);
}

.item {
  display: flex;
  align-items: center;
  line-height: 30px;
}
.item label {
  width: 100px;
}
</style>