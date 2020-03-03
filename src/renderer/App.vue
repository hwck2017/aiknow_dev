<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: "aiknow-dev",

  // created(){
  //   const _this = this
  //   _this.$electron.ipcRenderer.send("checkForUpdate");
  //   _this.$electron.ipcRenderer.on("message", (event, text) => {
  //           // console.log(arguments);
  //           _this.tips = text;
  //           alert(text)
  //       });
  //       _this.$electron.ipcRenderer.on("downloadProgress", (event, progressObj)=> {
  //           // console.log(progressObj);
  //           _this.downloadPercent = progressObj.percent || 0;
  //       });
  //       _this.$electron.ipcRenderer.on("isUpdateNow", () => {
  //           _this.$electron.ipcRenderer.send("isUpdateNow");
  //       });
  // },
  // beforeDestroy(){
  //   // this.$electron.ipcRenderer.removeAll(["message", "downloadProgress", "isUpdateNow"]);
  // }
};
</script>