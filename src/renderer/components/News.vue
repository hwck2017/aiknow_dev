<template>
    <div>
        <h2>{{msg}}</h2>
        <br>
        <button @click="sendData()">给主进程发信息</button>
    </div>
</template>

<script>
export default {
    data() {
        return {
            msg: 'News component'
        }
    }, methods: {
        sendData() {
            this.$electron.ipcRenderer.send('commun', 'hello main');
        }
    }
}
</script>