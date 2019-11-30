<template>
  <div>
    <div class="avatar">
      <img :src="$getAvatar($store.state.userInfo.uid)" />
      <!-- action 表示图片要上传到的后台API地址 -->
      <el-upload
        :action="uploadURL"
        :on-preview="handlePreview"
        :on-remove="handleRemove"
        list-type="picture"
        :headers="headerObj"
        :on-success="handleSuccess"
      >
        <el-button size="small" type="primary">点击上传</el-button>
      </el-upload>
    </div>

    <el-form ref="userInfoRef" :rules="userInfoRules" :model="userInfo" label-width="100px">
      <el-form-item label="昵称" prop="nickname">
        <el-input v-model="userInfo.nickname"></el-input>
      </el-form-item>
      <el-form-item label="个人签名" prop="motto">
        <el-input
          type="textarea"
          :maxlength="100"
          :autosize="{minRows: 2,maxRows: 5}"
          v-model="userInfo.motto"
        ></el-input>
      </el-form-item>
      <el-form-item label="性别" prop="gender">
        <el-select v-model="userInfo.gender" placeholder="请选择">
          <el-option v-for="(item, idx) in genderOpt" :key="idx" :value="item"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="saveEdit" :loading="loading">保存</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      userInfo: {
        nickname: "",
        motto: "",
        gender: ""
      },
      genderOpt: ["保密", "男", "女"],
      loading: false,
      uploadURL: "http://passport.aiknow.cn/passport/profile/avatar",
      previewPath: "",
      previewVisible: false,
      headerObj: {
        Authorization: window.sessionStorage.getItem("token")
      },
      userInfoRules: {
        nickname: [
          { required: true, message: "请输入昵称", trigger: "blur" },
          { min: 3, max: 10, message: "长度在 3 到 10 个字符", trigger: "blur" }
        ],
        motto: [{ max: 50, message: "最大不要超出50个字", trigger: "blur" }]
      }
    };
  },
  created() {
    this.init();
  },
  methods: {
    init() {
      let temp = this.$store.state.userInfo;
      this.userInfo.headimgurl = temp.headimgurl;
      this.userInfo.nickname = temp.nickname;
      this.userInfo.sex = temp.sex;
    },
    saveEdit() {
      this.$refs["edit"].validate(valid => {
        if (valid) {
          this.$message.success("修改成功");
          //   this.loading = true;
          //   this.$http
          //     .post("/user/profile/edit", {
          //       nickname: this.user.nickname,
          //       motto: this.user.motto,
          //       sex: this.user.sex
          //     })
          //     .then(res => {
          //       this.$message.success(res.message);
          //       this.$store.dispatch("getUserInfo");
          //       this.loading = false;
          //     })
          //     .catch(res => {
          //       this.loading = false;
          //     });
        } else {
          this.$message.error("请按照规则填写");
        }
      });
    },
    // 处理图片预览效果
    handlePreview(file) {
      console.log(file);
      this.previewPath = file.response.data.url;
      this.previewVisible = true;
    },
    // 处理移除图片的操作
    handleRemove(file) {
      // console.log(file)
      // 1. 获取将要删除的图片的临时路径
      const filePath = file.response.data.tmp_path;
      // 2. 从 pics 数组中，找到这个图片对应的索引值
      const i = this.addForm.pics.findIndex(x => x.pic === filePath);
      // 3. 调用数组的 splice 方法，把图片信息对象，从 pics 数组中移除
      this.addForm.pics.splice(i, 1);
      console.log(this.addForm);
    },
    // 监听图片上传成功的事件
    handleSuccess(response) {
      console.log(response);
      // 1. 拼接得到一个图片信息对象
      const picInfo = { pic: response.data.tmp_path };
      // 2. 将图片信息对象，push 到pics数组中
      this.addForm.pics.push(picInfo);
      console.log(this.addForm);
    }
  }
};
</script>