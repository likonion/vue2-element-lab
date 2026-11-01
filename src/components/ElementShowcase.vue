<template>
  <div class="showcase-container">
    <el-tabs type="border-card">
      <!-- Tab 1: 表单与校验示例 -->
      <el-tab-pane label="📋 表单校验 (Form & Rules)">
        <el-row :gutter="20">
          <el-col :span="14">
            <el-form ref="ruleForm" :model="ruleForm" :rules="rules" label-width="110px" size="small">
              <el-form-item label="活动名称" prop="name">
                <el-input v-model="ruleForm.name" placeholder="请输入活动名称（必填）" />
              </el-form-item>

              <el-form-item label="活动区域" prop="region">
                <el-select v-model="ruleForm.region" placeholder="请选择活动区域" style="width: 100%;">
                  <el-option label="区域一 (北京)" value="beijing" />
                  <el-option label="区域二 (上海)" value="shanghai" />
                  <el-option label="区域三 (深圳)" value="shenzhen" />
                </el-select>
              </el-form-item>

              <el-form-item label="活动时间" required>
                <el-col :span="11">
                  <el-form-item prop="date1">
                    <el-date-picker v-model="ruleForm.date1" type="date" placeholder="选择日期" style="width: 100%;" />
                  </el-form-item>
                </el-col>
                <el-col class="line" :span="2" style="text-align: center;">-</el-col>
                <el-col :span="11">
                  <el-form-item prop="date2">
                    <el-time-picker v-model="ruleForm.date2" placeholder="选择时间" style="width: 100%;" />
                  </el-form-item>
                </el-col>
              </el-form-item>

              <el-form-item label="即时配送" prop="delivery">
                <el-switch v-model="ruleForm.delivery" />
              </el-form-item>

              <el-form-item label="活动性质" prop="type">
                <el-checkbox-group v-model="ruleForm.type">
                  <el-checkbox label="美食/餐厅线上活动" name="type" />
                  <el-checkbox label="地推活动" name="type" />
                  <el-checkbox label="线下主题活动" name="type" />
                </el-checkbox-group>
              </el-form-item>

              <el-form-item label="特殊资源" prop="resource">
                <el-radio-group v-model="ruleForm.resource">
                  <el-radio label="线上品牌商赞助" />
                  <el-radio label="免费场地支持" />
                </el-radio-group>
              </el-form-item>

              <el-form-item label="活动形式" prop="desc">
                <el-input v-model="ruleForm.desc" type="textarea" :rows="3" placeholder="活动详细说明..." />
              </el-form-item>

              <el-form-item>
                <el-button type="primary" @click="submitForm('ruleForm')">立即提交 (校验)</el-button>
                <el-button @click="resetForm('ruleForm')">重置</el-button>
              </el-form-item>
            </el-form>
          </el-col>

          <el-col :span="10">
            <el-alert
              title="代码设计模式参考"
              type="success"
              :closable="false"
              description="该表单演示了 Element UI 最经典的 async-validator 规则配置（必填、正则、长度校验及联动清空），是开发后台管理系统最常用的底板模板。"
              style="margin-bottom: 16px;"
            />
            <pre class="code-box">{{ JSON.stringify(ruleForm, null, 2) }}</pre>
          </el-col>
        </el-row>
      </el-tab-pane>

      <!-- Tab 2: 表格与分页 -->
      <el-tab-pane label="📊 综合表格 (Table & Pagination)">
        <div style="margin-bottom: 12px; display: flex; justify-content: space-between;">
          <div>
            <el-input v-model="searchKey" placeholder="搜索姓名..." size="small" style="width: 200px; margin-right: 8px;" clearable />
            <el-button size="small" type="primary" icon="el-icon-search">查询</el-button>
          </div>
          <div>
            <el-button size="small" type="success" icon="el-icon-download">导出</el-button>
            <el-button size="small" type="primary" icon="el-icon-plus">新建</el-button>
          </div>
        </div>

        <el-table :data="filteredUsers" border stripe size="small" style="width: 100%;">
          <el-table-column prop="id" label="ID" width="60" align="center" />
          <el-table-column prop="date" label="日期" width="120" sortable />
          <el-table-column prop="name" label="姓名" width="100" />
          <el-table-column prop="role" label="角色" width="110">
            <template slot-scope="scope">
              <el-tag :type="scope.row.role === '管理员' ? 'danger' : 'primary'" size="mini">
                {{ scope.row.role }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="address" label="地址" show-overflow-tooltip />
          <el-table-column label="操作" width="160" align="center">
            <template slot-scope="scope">
              <el-button size="mini" type="text" icon="el-icon-edit" @click="handleEdit(scope.row)">编辑</el-button>
              <el-button size="mini" type="text" icon="el-icon-delete" style="color: #F56C6C;" @click="handleDelete(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <div style="margin-top: 16px; text-align: right;">
          <el-pagination
            :current-page="1"
            :page-sizes="[10, 20, 50]"
            :page-size="10"
            layout="total, sizes, prev, pager, next, jumper"
            :total="filteredUsers.length"
          />
        </div>
      </el-tab-pane>

      <!-- Tab 3: 反馈与通知 -->
      <el-tab-pane label="🔔 反馈与交互 (Feedback)">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-card shadow="never" header="Message 消息提示">
              <el-button :plain="true" @click="openMsg('success')">成功消息</el-button>
              <el-button :plain="true" @click="openMsg('warning')">警告消息</el-button>
              <el-button :plain="true" @click="openMsg('info')">普通消息</el-button>
              <el-button :plain="true" @click="openMsg('error')">错误消息</el-button>
            </el-card>

            <el-card shadow="never" header="Notification 通知" style="margin-top: 16px;">
              <el-button type="primary" @click="openNotify">弹出右上角通知</el-button>
            </el-card>
          </el-col>

          <el-col :span="12">
            <el-card shadow="never" header="Drawer 侧边抽屉">
              <el-button type="primary" @click="drawerVisible = true">打开侧边抽屉</el-button>
            </el-card>
          </el-col>
        </el-row>
      </el-tab-pane>
    </el-tabs>

    <el-drawer title="抽屉演示面板" :visible.sync="drawerVisible" direction="rtl" size="30%">
      <div style="padding: 20px;">
        <p>这是 Element UI 的 Drawer 抽屉组件。</p>
        <p style="margin-top: 12px; color: #666;">常用于详情查看、复杂参数配置或辅助侧边栏。</p>
      </div>
    </el-drawer>
  </div>
</template>

<script>
export default {
  name: 'ElementShowcase',
  data() {
    return {
      searchKey: '',
      drawerVisible: false,
      ruleForm: {
        name: 'Vue2 & Element 基础模板',
        region: 'beijing',
        date1: '',
        date2: '',
        delivery: false,
        type: ['美食/餐厅线上活动'],
        resource: '线上品牌商赞助',
        desc: ''
      },
      rules: {
        name: [
          { required: true, message: '请输入活动名称', trigger: 'blur' },
          { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
        ],
        region: [
          { required: true, message: '请选择活动区域', trigger: 'change' }
        ],
        date1: [
          { type: 'date', required: true, message: '请选择日期', trigger: 'change' }
        ]
      },
      userList: [
        { id: 101, date: '2026-10-01', name: '王小虎', role: '管理员', address: '上海市普陀区金沙江路 1518 弄' },
        { id: 102, date: '2026-10-02', name: '李阿宝', role: '普通用户', address: '北京市朝阳区望京 SOHO T3' },
        { id: 103, date: '2026-10-03', name: '张三丰', role: '审核员', address: '深圳市南山区科技园高新南一道' },
        { id: 104, date: '2026-10-04', name: '陈独秀', role: '普通用户', address: '杭州市西湖区文三路 252 号' }
      ]
    }
  },
  computed: {
    filteredUsers() {
      if (!this.searchKey) return this.userList
      return this.userList.filter(item => item.name.includes(this.searchKey))
    }
  },
  methods: {
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.$notify({
            title: '校验通过',
            message: '表单校验通过，准备发送请求！',
            type: 'success'
          })
        } else {
          this.$message.error('表单校验不通过，请检查红字提示！')
          return false
        }
      })
    },
    resetForm(formName) {
      this.$refs[formName].resetFields()
    },
    openMsg(type) {
      this.$message({
        message: `这是一条 ${type} 类型的提示消息`,
        type
      })
    },
    openNotify() {
      this.$notify({
        title: '系统通知',
        message: 'Element UI 的 Notification 可以在屏幕角落呈现全局通知。',
        duration: 3000
      })
    },
    handleEdit(row) {
      this.$message.info(`正在编辑: ${row.name}`)
    },
    handleDelete(row) {
      this.$confirm(`确认删除用户 [${row.name}] 吗？`, '警告', {
        type: 'warning'
      }).then(() => {
        this.userList = this.userList.filter(u => u.id !== row.id)
        this.$message.success('删除成功')
      }).catch(() => {})
    }
  }
}
</script>

<style scoped>
.showcase-container {
  padding-bottom: 20px;
}
.code-box {
  background-color: #282c34;
  color: #abb2bf;
  padding: 12px;
  border-radius: 6px;
  font-size: 13px;
  max-height: 280px;
  overflow-y: auto;
}
</style>
