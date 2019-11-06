import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

import Home from '../components/Home.vue'
import News from '../components/News.vue'

export default new Router({
  routes: [
    // {
    //   path: '/',
    //   name: 'landing-page',
    //   component: require('@/components/LandingPage').default
    // },
    {
      path: '/',
      component: Home
    },
    {
      path: '/news',
      component: News
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
