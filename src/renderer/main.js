import Vue from 'vue'
import axios from 'axios'

import App from './App'
import router from './router'
import store from './store'

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import './assets/css/global.css'

import VueQuillEditor from 'vue-quill-editor'

//一定要引入这三个css，不然文本编辑器会出现不规则黑白几何图形
//这三个css可以在main.js中引入，也可以在具体使用的.vue文件中引入
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

Vue.use(VueQuillEditor)

// 如果存在token密钥，进行用户自动登入，并且获取信息
if (window.sessionStorage.getItem('token')) {
  store.dispatch('getUserInfo')
}

Vue.prototype.$getAvatar = function (aid) {
  // if(aid == 0) {
  return '/static/default_avatar.jpg'
  //   } else if (process.env.NODE_ENV == 'development') {
  //       return '/api/avatar?aid='+aid
  //   } else {
  //       return '/avatar?aid='+aid
  //   }
}

// 配置请求的跟路径
axios.defaults.baseURL = 'http://oj.aiknow.cn/aiqb'
axios.interceptors.request.use(config => {
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})

//可通过此方式设置elementUI全局参数
//Vue.use(Element, { size: 'small', zIndex: 3000 });
Vue.use(ElementUI)

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')
