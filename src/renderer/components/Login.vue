<template>
  <div>
    <br />
    <el-button round @click="loginVisible = true">登录</el-button>
    <el-button round @click="registVisible = true">注册</el-button>

    <!-- 登录 -->
    <div class="login_box">
      <el-radio-group v-model="loginMode" size="small">
        <el-radio-button label="passwd">账号密码登录</el-radio-button>
        <el-radio-button label="telephone">手机号登录</el-radio-button>
      </el-radio-group>
      <div style="margin: 20px;"></div>

      <el-form
        class="login_form"
        :rules="loginFormRules"
        ref="loginFormRef"
        label-width="0px"
        :model="loginInfo"
      >
        <el-form-item v-if="loginMode==='passwd'" prop="username">
          <el-input v-model="loginInfo.username" prefix-icon="el-icon-user" placeholder="请输入登录账号"></el-input>
        </el-form-item>
        <el-form-item v-if="loginMode==='passwd'" prop="password">
          <el-input v-model="loginInfo.password" prefix-icon="el-icon-lock" placeholder="请输入登录密码" :show-password="true"></el-input>
        </el-form-item>
        <el-form-item v-if="loginMode==='telephone'" prop="telephone">
          <el-input
            v-model="loginInfo.phoneNumber"
            prefix-icon="el-icon-mobile-phone"
            placeholder="请输入手机号码"
          ></el-input>
        </el-form-item>
        <el-form-item v-if="loginMode==='telephone'" prop="verify">
          <el-input v-model="loginInfo.verifyCode" prefix-icon="el-icon-key" placeholder="请输入验证码"></el-input>
        </el-form-item>
        <el-form-item class="btns">
          <el-button type="primary" @click="login('loginFormRef')">登录</el-button>
          <el-button type="info" @click="resetLoginForm('loginFormRef')">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 注册 -->
    <!-- <el-dialog
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
    </el-dialog> -->
  </div>
</template>

<script>
export default {
  data() {
    return {
      loginMode: "passwd",
      loginInfo: {
        username: "chenkai",
        password: "ck316900922",
        phoneNumber: "",
        verifyCode: ""
      },
      // 这是表单的验证规则对象
      loginFormRules: {
        // 验证用户名是否合法
        username: [
          { required: true, message: "请输入登录账号", trigger: "blur" },
          { min: 3, max: 10, message: "长度在 3 到 10 个字符", trigger: "blur" }
        ],
        // 验证密码是否合法
        password: [
          { required: true, message: "请输入登录密码", trigger: "blur" },
          { min: 6, max: 15, message: "长度在 6 到 15 个字符", trigger: "blur" }
        ],
        telephone: [
          { required: true, message: "请输入手机号码", trigger: "blur" },
          { min: 11, max: 11, message: "请输入有效手机号码", trigger: "blur" }
        ],
        verify: [{ required: true, message: "请输入验证码", trigger: "blur" }]
      }
    };
  },
  methods: {
    // 点击重置按钮，重置登录表单
    resetLoginForm(refName) {
      console.log(this.loginInfo.username);
      this.$refs[refName].resetFields();
      console.log(this.loginInfo.username);
    },
    login(refName) {
      this.$refs[refName].validate(async valid => {
        if (!valid) return;
        const { data: res } = await this.$http.post("http://47.92.228.153/study/account/login", {
            username: this.loginInfo.username,
            password: this.loginInfo.password
        });
        console.log(res);
        if (res.errno !== 200) return this.$message.error("登录失败！");
        this.$message.success("登录成功");
        // 1. 将登录成功之后的 token，保存到客户端的 sessionStorage 中
        //   1.1 项目中出了登录之外的其他API接口，必须在登录之后才能访问
        //   1.2 token 只应在当前网站打开期间生效，所以将 token 保存在 sessionStorage 中
        window.sessionStorage.setItem("token", res.data.token);
        // 2. 通过编程式导航跳转到后台主页，路由地址是 /home
        this.$router.push("/home");
      });
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
    }
  }
};
</script>

<style scoped>
.btns {
  display: flex;
  justify-content: flex-end;
}

.login_box {
  width: 450px;
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

.login_form {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box;
}
</style>