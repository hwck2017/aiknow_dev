import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import router from '../router'
import { stat } from 'fs'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    userInfo: JSON.parse(sessionStorage.getItem("loginUserInfo")) || {
      isLogin: false,
    },
    submissions: [
      // {
      //     title: 'A+B problem',                
      //     path: 'afea',                
      //     id: 'xxxxxxxx',
      //     status: null,
      //     response: {
      //         status: 'TLE',
      //         memory: '123',
      //         time: '3s'
      //     }
      // }
    ],
  },
  mutations: {
    login(state, payload) {
      state.userInfo = payload
      state.userInfo.isLogin = true
      // console.log(state.userInfo)
      sessionStorage.setItem('loginUserInfo', JSON.stringify(state.userInfo))
    },
    setHeadImg(state, url) {
      state.userInfo.headimgurl = url
    },
    logout(state) {
      state.userInfo = {}
      state.userInfo.isLogin = false
      router.push('/login')
      window.sessionStorage.clear();
    },
    addSubmission(state, data) {
      let title = data.title
      let path = data.url
      let id = data.id
      let nid = data.nodeid
      state.submissions.push({
        path: path,
        title: title,
        id: id,
        nodeid: nid,
        status: '判题中',
        response: null
      })
      this.commit('getSubmission', id)
    },
    getSubmission(state, id) {
      let clock = setInterval(() => {
        axios.get('/code/' + id).then(res => {
          let data = res.data.data
          // let index = 0
          // console.log(data)
          let obj;
          for (let i = 0; i < state.submissions.length; i++) {
            if (state.submissions[i].id == id) {
              // index = i
              obj = state.submissions[i]
              obj.status = data.status
              obj.response = data.response
            }
          }
          // let newArray = []
          // for (let i = 0; i < state.submissions.length; i++) {
          //   let obj = state.submissions[i]
          //   if (index == i) {
          //     obj.status = data.status
          //     obj.response = data.response
          //   }
          //   newArray.push(obj)
          // }
          // state.submissions = newArray

          // 判卷完成
          if (data.status == '完成' || data.status == '错误') {
            // Cookie.remove()
            clearInterval(clock)
          }

          if (data.status === '完成' && data.response.result === 'AC' && obj.nodeid !== null) {
            axios.post('https://aiknow.cn/study/studyProcess/updateProcess', {
              "nodeid": obj.nodeid
            })
          }
        }).catch((res) => {
          let index = 0
          for (let i = 0; i < state.submissions.length; i++) {
            if (state.submissions[i].id == id) {
              index = i
            }
          }
          state.submissions.splice(index, 1)
          clearInterval(clock)
        })
      }, 1000)
    },
    deleteSubmission(state, index) {
      state.submissions.splice(index, 1)
    }
  },
  actions: {
    getUserInfo() {
      axios.get('/user').then(res => {
        console.log("getUserInfo: ", res)
        this.commit('login', res.data.data)
      })
    }
  }
})
