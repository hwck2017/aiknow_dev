<template>
  <span>
    <el-tag size="mini" effect="dark">{{util.getContestType(type)}}</el-tag>
    <el-tag size="mini" effect="dark" type="success">{{util.getContestTimeType(type, total_time)}}</el-tag>
  </span>
</template>

<script>
import Util from "../../util.js";
export default {
  props: ["type", "total_time"],
  data() {
    return {
      util: Util
    };
  }
};
</script>