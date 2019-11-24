<template>
  <div>
    <el-button-group round>
      <el-button>登录</el-button>
      <el-button @click="addDialogVisible=true">注册</el-button>
    </el-button-group>

    <!-- 登录 -->
    <div class="login_box">
      <el-radio-group v-model="loginMode" size="small" fill="#f11c40">
        <el-radio-button label="passwd">账号密码登录</el-radio-button>
        <el-radio-button label="telephone">手机号登录</el-radio-button>
      </el-radio-group>

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
          <el-input
            v-model="loginInfo.password"
            prefix-icon="el-icon-lock"
            placeholder="请输入登录密码"
            :show-password="true"
          ></el-input>
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
          <!-- <el-button>获取验证码</el-button> -->
        </el-form-item>
        <el-form-item class="btns">
          <el-button @click="login()">登录</el-button>
          <el-button type="info" @click="resetLoginForm()">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div>
      <!-- 注册 -->
      <el-dialog title="用户注册" :visible.sync="addDialogVisible" @close="addDialogClosed">
        <el-form :model="addForm" :rules="addFormRules" ref="addFormRef">
          <el-form-item prop="username" label="用户名">
            <el-input v-model="addForm.username"></el-input>
          </el-form-item>
          <el-form-item prop="password" label="密码">
            <el-input :show-password="true" v-model="addForm.password"></el-input>
          </el-form-item>
          <el-form-item prop="passwordAgain" label="密码确认">
            <el-input :show-password="true" v-model="addForm.passwordAgain"></el-input>
          </el-form-item>
          <el-form-item prop="phone" label="电话号码">
            <el-input v-model="addForm.phone"></el-input>
          </el-form-item>
          <el-form-item prop="nickname" label="昵称">
            <el-input v-model="addForm.nickname"></el-input>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="primary" @click="regist()">注册</el-button>
          <el-button type="info" @click="addDialogVisible = false">取消</el-button>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    // 验证邮箱的规则
    var checkEmail = (rule, value, cb) => {
      // 验证邮箱的正则表达式
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/;

      if (regEmail.test(value)) {
        // 合法的邮箱
        return cb();
      }

      cb(new Error("请输入合法的邮箱"));
    };

    // 验证手机号的规则
    var checkMobile = (rule, value, cb) => {
      // 验证手机号的正则表达式
      const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/;

      if (regMobile.test(value)) {
        return cb();
      }

      cb(new Error("请输入合法的手机号"));
    };

    var checkPassword = (rule, value, cb) => {
      if (value === "") {
        cb(new Error("请再次输入密码"));
      } else if (value !== this.addForm.password) {
        cb(new Error("两次输入密码不一致!"));
      } else {
        cb();
      }
    };

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
      },

      addDialogVisible: false,
      addForm: {
        username: "",
        password: "",
        passwordAgain: "",
        phone: "",
        nickname: "",
        alliances: "3"
      },
      addFormRules: {
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          {
            min: 3,
            max: 10,
            message: "用户名的长度在3~10个字符之间",
            trigger: "blur"
          }
        ],
        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          {
            min: 6,
            max: 15,
            message: "密码的长度在6~15个字符之间",
            trigger: "blur"
          }
        ],
        passwordAgain: [
          { required: true, message: "请再次输入密码", trigger: "blur" },
          {
            validator: checkPassword,
            trigger: "blur"
          }
        ],
        nickname: [{ required: true, message: "请输入昵称", trigger: "blur" }],
        phone: [
          { required: true, message: "请输入手机号", trigger: "blur" },
          { validator: checkMobile, trigger: "blur" }
        ]
      }
    };
  },
  methods: {
    // 点击重置按钮，重置登录表单
    resetLoginForm() {
      // console.log(this.loginInfo.username);
      this.$refs.loginFormRef.resetFields();
      // console.log(this.loginInfo.username);
    },
    login() {
      this.$refs.loginFormRef.validate(async valid => {
        if (!valid) return;
        const { data: res } = await this.$http.post(
          "http://47.92.228.153/study/account/login",
          {
            username: this.loginInfo.username,
            password: this.loginInfo.password
          }
        );
        console.log(res);
        if (res.errno !== 200) return this.$message.error(res.errmsg);
        this.$message.success("登录成功");
        // 1. 将登录成功之后的 token，保存到客户端的 sessionStorage 中
        //   1.1 项目中出了登录之外的其他API接口，必须在登录之后才能访问
        //   1.2 token 只应在当前网站打开期间生效，所以将 token 保存在 sessionStorage 中
        window.sessionStorage.setItem("token", res.data.token);
        window.sessionStorage.setItem("user", JSON.stringify(res.data));
        // 2. 通过编程式导航跳转到后台主页，路由地址是 /home
        this.$router.push("/home");
      });
    },
    // 监听添加用户对话框的关闭事件
    addDialogClosed() {
      this.$refs.addFormRef.resetFields();
    },
    // 点击按钮，添加新用户
    regist() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return;
        // 可以发起添加用户的网络请求
        const { data: res } = await this.$http.post(
          "http://47.92.228.153/study/account/register",
          this.addForm
        );

        if (res.errno !== 200) {
          this.$message.error("注册失败！");
        }

        this.$message.success("注册成功！");
        // 隐藏添加用户的对话框
        this.addDialogVisible = false;
        this.loginInfo.username = this.addForm.username;
        this.loginInfo.password = this.addForm.password;
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

.el-button-group {
  float: right;
  padding: 10px 20px;
}

.el-radio-group {
  margin: 20px 0px;
  position: absolute;
  left: 50%;
  transform: translate(-50%);
}
</style>