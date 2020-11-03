<template>
  <div class="register_box">
    <!-- 注册 -->
    <!-- <el-dialog title="用户注册" @close="addDialogClosed"> -->
    <el-form
      :model="addForm"
      :rules="addFormRules"
      ref="addFormRef"
      class="register_form"
      label-width="80px"
    >
      <el-form-item>
        <el-select
          v-model="province"
          filterable
          placeholder="请选择省份"
          @change="changeProvince($event)"
          style="width: 100%"
        >
          <el-option v-for="p in provinces" :key="p" :label="p" :value="p"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-select
          v-model="addForm.alliances"
          filterable
          placeholder="请选择机构"
          style="width: 100%"
        >
          <el-option v-for="item in alliances" :key="item.id" :label="item.name" :value="item.id"></el-option>
        </el-select>
      </el-form-item>
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
      <el-form-item>
        <el-button type="primary" @click="regist()">注册</el-button>
        <el-button type="info">取消</el-button>
      </el-form-item>
    </el-form>
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

    var map = new Map();
    return {
      addForm: {
        username: "",
        password: "",
        passwordAgain: "",
        phone: "",
        nickname: "",
        alliances: ""
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
          // { validator: checkMobile, trigger: "blur" }
        ]
      },
      // province->alliances
      alliancesMap: map,
      // alliances in a province
      alliances: [],
      province: "",
      provinces: []
    };
  },
  methods: {
    // 监听添加用户对话框的关闭事件
    addDialogClosed() {
      this.$refs.addFormRef.resetFields();
    },
    regist() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return;
        const { data: res } = await this.$http.post(
          "https://aiknow.cn/study/account/register",
          this.addForm
        );

        if (res.errno !== 200) {
          this.$message.error(res.errmsg);
        }

        this.$message.success("注册成功！");
        this.$router.push("/login");
      });
    },
    async getOrigination() {
      const { data: res } = await this.$http.get(
        "https://aiknow.cn/study/studycmsAlliancess/api/allAlliancesList"
      );

      if (res.errno !== 200) {
        this.$message.error(res.errmsg);
      }

      let list = res.data;
      for (var i = 0; i < list.length; i++) {
        this.provinces.push(list[i].province);
        let l = list[i].alliancesList;
        let arr = [];
        for (var j = 0; j < l.length; j++) {
          let info = {
            id: l[j].id,
            name: l[j].alliancename
          };
          arr.push(info);
        }
        this.alliancesMap.set(list[i].province, arr);
      }
    },
    changeProvince(e) {
      this.alliances = this.alliancesMap.get(e);
    }
  },
  created() {
    this.getOrigination();
  }
};
</script>

<style scoped>
.register_box {
  width: 450px;
  height: 420px;
  background-color: #fff;
  border-radius: 5px;
  border: 1px solid #eee;
  position: absolute;
  left: 50%;
  top: 55%;
  transform: translate(-50%, -50%);
  /* margin-bottom: 20px; */
}

.register_form {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box;
}

.el-form-item {
  margin-bottom: 10px;
}
</style>