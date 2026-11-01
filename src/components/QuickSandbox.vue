<template>
  <div class="sandbox-container">
    <el-alert
      title="💡 提示：可以在此组件中直接编写或替换您需要测试的代码逻辑，配合右侧的数据状态预览进行调试。"
      type="info"
      show-icon
      :closable="false"
      style="margin-bottom: 16px;"
    />

    <el-row :gutter="20">
      <!-- 左侧：测试操作区 -->
      <el-col :span="14">
        <el-card class="box-card" shadow="hover">
          <div slot="header" class="clearfix">
            <span style="font-weight: bold; font-size: 15px;">🧪 测试控制台 (Test Area)</span>
            <el-button style="float: right; padding: 3px 0" type="text" @click="resetTestData">重置数据</el-button>
          </div>

          <el-form label-width="100px" size="small">
            <el-form-item label="测试文本">
              <el-input v-model="formData.keyword" placeholder="请输入测试关键词" clearable @input="logEvent('input', formData.keyword)" />
            </el-form-item>

            <el-form-item label="下拉选择">
              <el-select v-model="formData.category" placeholder="请选择类别" style="width: 100%;" @change="logEvent('select change', formData.category)">
                <el-option label="选项 A - 核心模块" value="A" />
                <el-option label="选项 B - 辅助工具" value="B" />
                <el-option label="选项 C - 实验特性" value="C" />
              </el-select>
            </el-form-item>

            <el-form-item label="日期选择">
              <el-date-picker
                v-model="formData.date"
                type="date"
                placeholder="选择日期"
                value-format="yyyy-MM-dd"
                style="width: 100%;"
                @change="logEvent('date change', formData.date)"
              />
            </el-form-item>

            <el-form-item label="状态开关">
              <el-switch
                v-model="formData.enabled"
                active-text="启用"
                inactive-text="禁用"
                @change="logEvent('switch change', formData.enabled)"
              />
            </el-form-item>

            <el-form-item label="数值调节">
              <el-slider v-model="formData.count" :max="100" show-input @change="logEvent('slider change', formData.count)" />
            </el-form-item>

            <el-form-item label="触发交互">
              <el-button type="primary" @click="triggerMessage">弹出消息 (Message)</el-button>
              <el-button type="success" @click="dialogVisible = true">打开弹窗 (Dialog)</el-button>
              <el-button type="warning" @click="triggerConfirm">确认框 (MessageBox)</el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <!-- 迷你表格测试 -->
        <el-card class="box-card" shadow="hover" style="margin-top: 16px;">
          <div slot="header" class="clearfix">
            <span style="font-weight: bold;">📊 动态列表测试</span>
            <el-button style="float: right;" size="mini" type="primary" icon="el-icon-plus" @click="addItem">追加一行</el-button>
          </div>
          <el-table :data="tableList" border stripe size="mini" style="width: 100%;">
            <el-table-column prop="id" label="ID" width="70" />
            <el-table-column prop="name" label="测试项" />
            <el-table-column prop="status" label="状态" width="100">
              <template slot-scope="scope">
                <el-tag :type="scope.row.status === '已就绪' ? 'success' : 'info'" size="mini">
                  {{ scope.row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120">
              <template slot-scope="scope">
                <el-button size="mini" type="text" style="color: #F56C6C;" @click="removeItem(scope.$index)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <!-- 右侧：响应式数据监控与事件日志 -->
      <el-col :span="10">
        <el-card class="box-card" shadow="hover">
          <div slot="header" class="clearfix">
            <span style="font-weight: bold;">🔍 实时响应式数据 (formData)</span>
            <el-tag size="mini" type="success" style="float: right;">Reactive</el-tag>
          </div>
          <pre class="code-box">{{ JSON.stringify(formData, null, 2) }}</pre>
        </el-card>

        <el-card class="box-card" shadow="hover" style="margin-top: 16px;">
          <div slot="header" class="clearfix">
            <span style="font-weight: bold;">📝 事件触发日志</span>
            <el-button style="float: right; padding: 3px 0" type="text" @click="logs = []">清空</el-button>
          </div>
          <div class="log-stream">
            <div v-if="logs.length === 0" style="color: #909399; text-align: center; padding: 20px 0;">
              暂无事件日志，在左侧进行操作即可记录
            </div>
            <div v-for="(log, idx) in logs" :key="idx" class="log-item">
              <span class="log-time">{{ log.time }}</span>
              <el-tag size="mini" type="info" style="margin: 0 6px;">{{ log.type }}</el-tag>
              <span class="log-msg">{{ log.content }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 弹窗组件 -->
    <el-dialog title="测试弹窗" :visible.sync="dialogVisible" width="40%">
      <p>这是一个 Element UI Dialog 弹窗实例，当前表单关键词为：<strong>{{ formData.keyword || '(空)' }}</strong></p>
      <span slot="footer" class="dialog-footer">
        <el-button size="small" @click="dialogVisible = false">取 消</el-button>
        <el-button size="small" type="primary" @click="confirmDialog">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'QuickSandbox',
  data() {
    return {
      dialogVisible: false,
      formData: {
        keyword: 'Hello Element UI',
        category: 'A',
        date: new Date().toISOString().slice(0, 10),
        enabled: true,
        count: 25
      },
      tableList: [
        { id: 1, name: '数据流联调任务', status: '已就绪' },
        { id: 2, name: '样式微调测试', status: '已就绪' },
        { id: 3, name: '异步接口模拟', status: '待测试' }
      ],
      logs: []
    }
  },
  methods: {
    logEvent(type, payload) {
      const now = new Date().toTimeString().slice(0, 8)
      const content = typeof payload === 'object' ? JSON.stringify(payload) : String(payload)
      this.logs.unshift({ time: now, type, content })
      if (this.logs.length > 20) {
        this.logs.pop()
      }
    },
    resetTestData() {
      this.formData = {
        keyword: '',
        category: '',
        date: '',
        enabled: false,
        count: 0
      }
      this.logEvent('action', '重置表单数据')
      this.$message.info('数据已重置')
    },
    triggerMessage() {
      this.$message({
        message: '恭喜！Element UI Message 消息调用成功！',
        type: 'success'
      })
      this.logEvent('message', '触发 Element Message')
    },
    triggerConfirm() {
      this.$confirm('此操作将模拟执行确认操作, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$message.success('已确认操作')
        this.logEvent('confirm', '点击确定')
      }).catch(() => {
        this.$message.info('已取消操作')
        this.logEvent('confirm', '点击取消')
      })
    },
    confirmDialog() {
      this.dialogVisible = false
      this.$message.success('弹窗已确认')
      this.logEvent('dialog', '弹窗确定关闭')
    },
    addItem() {
      const nextId = this.tableList.length > 0 ? Math.max(...this.tableList.map(i => i.id)) + 1 : 1
      this.tableList.push({
        id: nextId,
        name: `新测试项 #${nextId}`,
        status: '已就绪'
      })
      this.logEvent('table', `追加数据项 #${nextId}`)
    },
    removeItem(index) {
      const removed = this.tableList.splice(index, 1)
      this.logEvent('table', `删除数据项: ${removed[0]?.name}`)
      this.$message.warning('已删除该行')
    }
  }
}
</script>

<style scoped>
.sandbox-container {
  padding-bottom: 20px;
}

.code-box {
  background-color: #282c34;
  color: #abb2bf;
  padding: 12px;
  border-radius: 6px;
  font-size: 13px;
  max-height: 250px;
  overflow-y: auto;
}

.log-stream {
  max-height: 260px;
  overflow-y: auto;
  font-size: 12px;
}

.log-item {
  padding: 6px 0;
  border-bottom: 1px dashed #ebeef5;
  display: flex;
  align-items: center;
}

.log-time {
  color: #909399;
  font-family: monospace;
}

.log-msg {
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
