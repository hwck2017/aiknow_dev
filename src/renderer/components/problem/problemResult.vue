<template>
    <el-tag :color="util.getProblemStatusColor(result)">
        {{util.convertProblemStatus(result)}}
    </el-tag>
</template>

<script>
import Util from '@/util'
export default {
    props: ['result'],
    data() {
        return {
           util: Util 
        }
    }
}
</script>