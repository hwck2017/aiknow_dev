<template>
  <div>
    <el-container>
      <el-header height="100px">
        <el-card class="user-info" v-if="profile!=null">
          <div class="avatar">
            <!-- <img :src="$getAvatar(this.profile.uid)" /> -->
            {{profile.nickname}}
          </div>
          <div class="user-detail">
            <el-row>
              <el-col :span="12">
                <i class="el-icon-circle-check" style="color: green;" />
                通过率: {{util.getACRate(profile.ac_times, profile.submit_times)}}
              </el-col>
              <el-col :span="12">
                <i class="el-icon-timer" style="color: #2d8cf0;" />
                比赛次数: {{profile.contest_times}}次
              </el-col>
            </el-row>
          </div>
        </el-card>
      </el-header>
      <el-main>
        <el-row :gutter="20">
          <el-col :span="9">
            <el-card style="margin-top: 10px">
              <div slot="header">
                提交次数
                <el-badge v-if="profile!=null" :value="profile.submit_times"></el-badge>
              </div>
              <div class="charts">
                <!-- <canvas ref="timesChart" width="250" height="250"></canvas> -->
              </div>
            </el-card>
          </el-col>
          <el-col :span="15">
            <el-card>
              <div slot="header">
                <span>最近做题</span>
              </div>
              <el-table
                :data="userProblems.data"
                stripe
                :show-header="false"
                @row-click="getDetails"
              >
                <el-table-column label="标题" prop="title"></el-table-column>
                <el-table-column label="状态" prop="status">
                  <template slot-scope="scope">
                    <problemResult :result="scope.row.status"></problemResult>
                  </template>
                </el-table-column>
              </el-table>
            </el-card>
          </el-col>
        </el-row>
        <el-card>
          <p slot="header" style="height: 10px;">提交统计</p>
          <p>
            <span style="float: right">
              <el-button size="small" type="info" @click="getUserLog('week')">近1星期</el-button>
              <el-button size="small" type="info" @click="getUserLog('month')">近1月</el-button>
            </span>
          </p>
          <!-- <canvas ref="logChart" width="700" height="280"></canvas> -->
        </el-card>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import Chart from "chart.js";
import Util from "@/util";
import problemResult from "../problem/problemResult.vue";
export default {
  mounted() {
    this.mountLogChart();
    this.mountTimesChart();
    this.initial();
  },
  data() {
    return {
      util: Util,
      profile: null,
      userProblems: {
        data: [],
        total: 0
      },
      timesChart: null,
      logData: {
        label: [],
        AC: [],
        CE: [],
        RTE: [],
        WA: [],
        TLE: []
      },
      logChart: null
    };
  },
  methods: {
    initial() {
      this.getUserProblem();
      this.getUserProfile();
      this.getUserLog("week");
    },
    getUserProfile() {
      this.$http.get("/profile/" + this.getUid).then(res => {
        this.profile = res.data.data;
        this.updateTimesChart();
      });
    },
    getUserProblem() {
      this.$http
        .get("/user_log/problem_history", {
          params: {
            uid: this.getUid,
            page: 1,
            page_size: 10
          }
        })
        .then(res => {
          this.userProblems.data = res.data.data.data;
          this.userProblems.total = res.data.data.total;
        });
    },
    getUserLog(type) {
      this.logData.label = [];
      this.logData.AC = [];
      this.logData.CE = [];
      this.logData.RTE = [];
      this.logData.WA = [];
      this.logData.TLE = [];
      if (type == "week") {
        this.logData.title = "最近一星期";
      } else {
        this.logData.title = "最近一月";
      }
      this.$http
        .get("/user_log/coding_frequency", {
          params: {
            uid: this.getUid,
            time: type
          }
        })
        .then(res => {
          let data = res.data.data;
          for (let i = 0; i < data.length; i++) {
            let log = data[i];
            this.logData.label.push(log.date);
            this.logData.AC.push(log.ac_times ? log.ac_times : 0);
            this.logData.CE.push(log.ce_times ? log.ce_times : 0);
            this.logData.RTE.push(log.rte_times ? log.rte_times : 0);
            this.logData.WA.push(log.wa_times ? log.wa_times : 0);
            this.logData.TLE.push(log.tle_times ? log.tle_times : 0);
          }
          this.updateLogChart();
        });
    },
    mountTimesChart() {
      this.timesChart = new Chart(this.$refs.timesChart, {
        type: "doughnut",
        data: {
          labels: [
            Util.convertProblemStatus("AC"),
            Util.convertProblemStatus("CE"),
            Util.convertProblemStatus("RTE"),
            Util.convertProblemStatus("TLE"),
            Util.convertProblemStatus("WA")
          ],
          datasets: []
        },
        options: {
          responsive: true,
          legend: {
            display: true,
            labels: {
              usePointStyle: true
            }
          },
          title: {
            display: true
          },
          animation: {
            animateScale: true,
            animateRotate: true
          }
        }
      });
    },
    updateTimesChart() {
      this.timesChart.data.datasets = [
        {
          data: [
            this.profile.ac_times,
            this.profile.ce_times,
            this.profile.rte_times,
            this.profile.tle_times,
            this.profile.wa_times
          ],
          backgroundColor: [
            Util.getProblemStatusColor("AC"),
            Util.getProblemStatusColor("CE"),
            Util.getProblemStatusColor("RTE"),
            Util.getProblemStatusColor("TLE"),
            Util.getProblemStatusColor("WA")
          ]
        }
      ];
      this.timesChart.update();
    },
    mountLogChart() {
      this.logChart = new Chart(this.$refs.logChart, {
        type: "line",
        options: {
          responsive: true,
          tooltips: {
            mode: "index",
            intersect: false
          },
          hover: {
            mode: "nearest",
            intersect: true
          },
          scales: {
            yAxes: [
              {
                display: true,
                ticks: {
                  beginAtZero: true,
                  suggestedMax: 10
                },
                scaleLabel: {
                  display: true,
                  labelString: "次数"
                }
              }
            ]
          }
        }
      });
    },
    updateLogChart() {
      (this.logChart.options.title = {
        display: true,
        text: this.logData.title,
        fontSize: 16
      }),
        (this.logChart.data.labels = this.logData.label);
      this.logChart.data.datasets = [
        {
          label: Util.convertProblemStatus("AC"),
          backgroundColor: Util.getProblemStatusColor("AC"),
          borderColor: Util.getProblemStatusColor("AC"),
          data: this.logData.AC,
          fill: false
        },
        {
          label: Util.convertProblemStatus("WA"),
          backgroundColor: Util.getProblemStatusColor("WA"),
          borderColor: Util.getProblemStatusColor("WA"),
          data: this.logData.WA,
          fill: false
        },
        {
          label: Util.convertProblemStatus("RTE"),
          backgroundColor: Util.getProblemStatusColor("RTE"),
          borderColor: Util.getProblemStatusColor("RTE"),
          data: this.logData.RTE,
          fill: false
        },
        {
          label: Util.convertProblemStatus("TLE"),
          backgroundColor: Util.getProblemStatusColor("TLE"),
          borderColor: Util.getProblemStatusColor("TLE"),
          data: this.logData.TLE,
          fill: false
        },
        {
          label: Util.convertProblemStatus("CE"),
          backgroundColor: Util.getProblemStatusColor("CE"),
          borderColor: Util.getProblemStatusColor("CE"),
          data: this.logData.CE,
          fill: false
        }
      ];
      this.logChart.update();
    },
    getDetails(row) {
      this.$router.push({ path: `/problem/${row.pid}` });
    }
  },
  computed: {
    getUid() {
      return this.$route.params.uid;
    }
  },
  watch: {
    getUid: function() {
      this.initial();
    }
  },
  components: {
    problemResult
  }
};
</script>

<style scoped>
/* .el-card__header {
  padding: 10px, 20px;
} */

.user_info {
  width: 100%;
  font-size: 24px;
  text-align: center;
  padding-top: 80px;
  position: relative;
  overflow: visible;
  margin-bottom: 20px;
}

.user-detail {
  position: absolute;
  width: 300px;
  right: 20px;
  /* bottom: 16px; */
  font-size: 15px;
  text-align: left;
}

.avatar {
  /* position: absolute;
  border: black 2px solid;
  width: 130px;
  height: 130px;
  border-radius: 50%;
  left: 50%;
  margin-left: -65px;
  top: -50px;
  transition: transform 0.9s; */
  text-align: center;
  font-size: 30px;
}
</style>