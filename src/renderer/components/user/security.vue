<template>
  <div>
    <h2>邮箱管理</h2>
    <el-form ref="email" :model="email.form" :rules="email.rules">
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="email.form.email" type="email"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="doChangeEmail">更换邮箱</el-button>
        <el-button type="info" v-if="! getValid" @click="doVerify">邮箱验证</el-button>
        <el-button type="success" v-else icon="checkmark">已验证</el-button>
      </el-form-item>
    </el-form>

    <h2>密码管理</h2>
    <el-form ref="password" :model="password.form" :rules="password.rules">
      <el-form-item label="原密码" prop="originPassword">
        <el-input v-model="password.form.originPassword" type="password"></el-input>
      </el-form-item>
      <el-form-item label="新密码" prop="newPassword">
        <el-input v-model="password.form.newPassword" type="password"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitPassword">提交</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      password: {
        form: {
          originPassword: "",
          newPassword: ""
        },
        rules: {
          originPassword: [
            { required: true, message: "原密码不得为空", trigger: "blur" }
          ],
          newPassword: [
            { required: true, message: "新密码不得为空", trigger: "blur" }
          ]
        }
      },
      email: {
        form: {
          email: ""
        },
        rules: {
          email: [
            { required: true, message: "邮箱不得为空" },
            { type: "email", message: "邮箱格式错误" }
          ]
        }
      },
      getValid: false
    };
  },
  methods: {
    submitPassword() {
      this.$refs["password"].validate(valid => {
        if (valid) {
          this.$http
            .post("https://aiknow.cn/study/account/change/password", {
              username: this.$store.state.userInfo.username,
              password: this.password.form.newPassword,
              code: "888888"
            })
            .then(res => {
              if (res.data.errno !== 200) {
                return this.$message.error(res.data.errmsg);
              }
              // this.$message.success(res.data);
              // console.log(res);
              // this.$store.commit("logout");
            });
        } else {
          this.$message.error("请按要求填写");
        }
      });
    },
    doChangeEmail() {
      console.log("修改邮箱");
    },
    doVerify() {
      console.log("验证邮箱");
    }
  }
};
</script>