<template>
  <div>
    <el-card>
      <!-- <el-spin fix v-if="my.loading"></el-spin> -->
      <div>
        <p slot="title">已加入的比赛</p>
        <el-table :data="my.data" stripe :show-header="false">
          <el-table-column min-width="70%">
            <template slot-scope="scope">
              <div class="info">
                <router-link
                  :to="{path: '/contest/'+scope.row.cid+'/problems'}"
                  style="font-size: 20px"
                >{{scope.row.name}}</router-link>
                <div class="bottom">
                  <i class="el-icon-timer"></i>
                  <!-- {{getDistanceTime(scope.row.join_time)}} 加入 -->
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column min-width="30%">
            <template slot-scope="scope">
              <el-tag effect="plain" type="success">AC - {{scope.row.ac_times}}</el-tag>
              <el-tag effect="plain" type="warning">WA - {{scope.row.wa_times}}</el-tag>
              <el-tag
                effect="plain"
              >RTE - {{scope.row.rte_times}}</el-tag>
              <el-tag
                effect="plain"
                type="info"
              >TLE - {{scope.row.tle_times}}</el-tag>
              <el-tag effect="plain" type="danger">CE - {{scope.row.ce_times}}</el-tag>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          @current-change="getJoinedContests"
          :current-page="my.page"
          :page-size="my.pageSize"
          :total="my.total"
          layout="total, prev, pager, next, jumper"
        ></el-pagination>
      </div>
    </el-card>
    <el-card class="other">
      <!-- <el-spin fix v-if="other.loading"></el-spin> -->
      <div>
        <p slot="title">比赛列表</p>
        <el-table :data="other.data" stripe :show-header="false">
          <el-table-column min-width="90%">
            <template slot-scope="scope">
              <router-link
                :to="{path: '/contest/'+scope.row.cid}"
                style="font-size: 20px"
              >{{scope.row.name}}</router-link>
              <i v-if="scope.row.password" style="color: #ffcc66;" class="el-icon-lock"></i>
              <i v-if="scope.row.official == 1" style="color: #ed3f14" class="el-icon-trophy"></i>
              <div class="bottom">
                <i class="el-icon-date">{{getTime(scope.row.start_time)}} 开始</i>
                <router-link
                  style="margin-left: 10px"
                  :to="{path: '/profile/'+scope.row.owner}"
                >{{scope.row.nickname}}</router-link>举办
                <ContestType class="type" :type="scope.row.type" :total_time="scope.row.total_time"></ContestType>
              </div>
            </template>
          </el-table-column>
          <el-table-column min-width="10%">
            <template slot-scope="scope">
              <el-tag
                v-if="getContestStatus(scope.row.start_time, scope.row.end_time) == 0"
                type="warning"
              >即将开始</el-tag>
              <el-tag
                v-else-if="getContestStatus(scope.row.start_time, scope.row.end_time) == 1"
                type="success"
              >进行中</el-tag>
              <el-tag v-else type="danger">已结束</el-tag>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          @current-change="getContests"
          :current-page="other.page"
          :page-size="other.pageSize"
          :total="other.total"
          layout="total, prev, pager, next, jumper"
        ></el-pagination>
      </div>
    </el-card>
  </div>
</template>

<script>
import Util from "../util.js";
import ContestType from "./contest/contestType.vue";
export default {
  created() {
    this.getContests(), this.getJoinedContests();
  },
  data() {
    return {
      my: {
        total: 0,
        pageSize: 5,
        page: 1,
        data: [],
        loading: false
      },
      other: {
        total: 0,
        pageSize: 5,
        page: 1,
        data: [],
        loading: false
      }
    };
  },
  methods: {
    getContests() {
      this.other.loading = true;
      this.$http
        .get("/contests/opened", {
          params: {
            page: this.other.page,
            page_size: this.other.pageSize
          }
        })
        .then(res => {
          res = res.data.data;
          this.other.total = res.total;
          this.other.data = res.data;
          this.other.loading = false;
        })
        .catch(res => {
          this.other.loading = false;
        });
    },
    getJoinedContests() {
      this.my.loading = true;
      this.$http
        .get("/user/joined_contests", {
          params: {
            page: this.my.page,
            page_size: this.my.pageSize
          }
        })
        .then(res => {
          this.my.data = res.data.data.data;
          this.my.total = res.data.data.total;
          this.my.loading = false;
        })
        .catch(res => {
          this.my.loading = false;
        });
    },
    getContestStatus(startTime, endTime) {
      let time = new Date().valueOf();
      if (time < startTime) {
        // 即将开始
        return 0;
      } else if (time > endTime) {
        // 已经结束
        return 2;
      } else {
        // 正在进行
        return 1;
      }
    },
    getTime(time) {
      return Util.getFormatTime(time, "yyyy-mm-dd hh:mm:ss");
    },
    // getDistanceTime(time) {
    //   return Util.getDistanceTime(time);
    // },
    getProblemStatusColor(text) {
      return Util.getProblemStatusColor(text);
    }
  },
  components: {
    ContestType
  }
};
</script>


