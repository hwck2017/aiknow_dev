<template>
    <div>
        <h2>Hello Electron-vue</h2>
        <br>
        {{msg}}
        <br>
        <a href="http://oj.aiknow.cn" @click.prevent="openOJ($event)">打开题库</a>
    </div>
</template>

<script>
export default {
    data() {
        return {
            msg: 'Home component'
        }
    }, methods: {
        openOJ(event) {
            console.log(event.srcElement.href);
            this.$electron.shell.openExternal(event.srcElement.href);
        }
    }
}
</script>