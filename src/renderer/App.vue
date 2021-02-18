<template>
  <div id="app">
    <router-view></router-view>
    <!-- <headerComponent class="headerBg"></headerComponent> -->

  </div>
</template>

<script>
var { ipcRenderer } = require("electron");

// import headerComponent from './components/header.vue'

export default {
  name: "AiknowEditor",

  // components: {
  //   headerComponent,
  // },

  methods: {
    Watcher() {
      ipcRenderer.on("message", (event, text) => {
        // log.info(text);
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
      ipcRenderer.send("common");
    }
  },
  mounted() {
    this.Watcher();
  }
};
</script>

<style>
  .headerBg {
    width: 100%;
    height: 60px;
  }
</style>