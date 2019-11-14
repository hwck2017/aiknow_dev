<template>
  <div id="app" class="app-style">
    <router-view></router-view>
    <!-- <home></home> -->
  </div>
</template>

<script>
  // import Home from '../components/Home.vue'
  export default {
    name: 'aiknow-dev'
    // components: {
    //   "home": Home
    // }
  }
</script>

<style>
  /* CSS */
  .app-style {
    height: 100%;
  }
</style>