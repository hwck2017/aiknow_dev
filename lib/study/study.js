import axios from 'axios'

var myStorage = require("../storage")

const studyDomain = "http://study.aiknow.cn/study"
const courseNodeUri = "/api/studyCourseNode/"
const smsLoginUri = "/account/sms/login"
const passwdLoginUri = "/account/login"


// axios.post('/user', {
//     firstName: 'Fred',
//     lastName: 'Flintstone'
//   })
//   .then(function (response) {
//     console.log(response);
//   })
//   .catch(function (error) {
//     console.log(error);
//   });


//根据题目ID获取课程节点ID
async function getNodeID(problemID) {
    if (problemID === undefined) {
        console.log("invalid problem ID");
        return undefined;
    }

    const { data: res } = await axios.get(
        studyDomain + courseNodeUri + problemID
    );

    if (res.errno !== 200) {
        console.log("failed to get node id by " + problemID)
        return undefined;
    }
    // console.log(res);
    let nodeID = res.data;
    return nodeID;
}

async function login(loginMode, loginInfo) {
    let data;
    let url;
    if (loginMode === "phone") {
        url = studyDomain + smsLoginUri
        data = {
            phone: loginInfo.phoneNumber,
            code: loginInfo.verifyCode
        };
    } else {
        url = studyDomain + passwdLoginUri
        data = {
            username: loginInfo.username,
            password: loginInfo.password
        };
    }

    console.log(data, url)
    const { data: res } = await axios.post(url, data)
    // console.log(res)
    if (res.errno !== 200) {
        return res
    }
    // 将登录成功之后的 token，保存到客户端的 sessionStorage 中
    myStorage.storeToSS("token", res.data.token)
    // 将用户登陆信息保存到 localStorage
    if (loginInfo.remember)
        myStorage.storeToLS("userInfo", loginInfo)
    return true
}

export {
    getNodeID,
    login
}