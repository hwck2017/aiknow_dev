<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: "aiknow-dev",
  methods: {
    Watcher() {
      ipcRenderer.on("message", (event, text) => {
        log.info(text);
        // this.tips = text;
      });
      //注意：“downloadProgress”事件可能存在无法触发的问题，只需要限制一下下载网速就好了
      // ipcRenderer.on("downloadProgress", (event, progressObj)=> {
      //     log.info(progressObj);
      //     this.downloadPercent = progressObj.percent || 0;
      // });
      // ipcRenderer.on("isUpdateNow", () => {
      //     log.info("isUpdateNow");
      //     ipcRenderer.send("isUpdateNow");
      // });
      ipcRenderer.send("checkForUpdate");
    }
  },
  mounted() {
    this.Watcher()
  }
};
</script>