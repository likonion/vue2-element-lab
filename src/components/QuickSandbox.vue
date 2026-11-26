<template>
  <div class="sandbox-page">
    <!-- 页面标题区 -->
    <div class="page-head">
      <div>
        <h2 class="page-title">快速实验沙箱</h2>
        <p class="page-desc">
          编辑 <code>src/components/QuickSandbox.vue</code> 即可快速验证组件交互，右侧实时同步响应式状态与事件流。
        </p>
      </div>
      <div class="page-head-actions">
        <el-button size="small" icon="el-icon-refresh-left" @click="resetTestData">重置状态</el-button>
        <el-button size="small" type="primary" icon="el-icon-plus" @click="addItem">追加列表项</el-button>
      </div>
    </div>

    <el-row :gutter="20">
      <!-- 左侧：测试操作区 -->
      <el-col :span="14" :xs="24">
        <div class="panel-card">
          <div class="panel-header">
            <div class="panel-title">
              <span class="title-icon blue"><i class="el-icon-s-operation" /></span>
              <span>交互控制台</span>
            </div>
            <span class="panel-sub">实时双向绑定</span>
          </div>

          <div class="panel-body">
            <el-form label-width="92px" size="small">
              <el-form-item label="测试文本">
                <el-input
                  v-model="formData.keyword"
                  placeholder="请输入测试关键词"
                  clearable
                  @input="logEvent('input', formData.keyword)"
                />
              </el-form-item>

              <el-row :gutter="16">
                <el-col :span="12">
                  <el-form-item label="下拉选择">
                    <el-select
                      v-model="formData.category"
                      placeholder="请选择类别"
                      style="width: 100%;"
                      @change="logEvent('select', formData.category)"
                    >
                      <el-option label="选项 A - 核心模块" value="A" />
                      <el-option label="选项 B - 辅助工具" value="B" />
                      <el-option label="选项 C - 实验特性" value="C" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="日期选择">
                    <el-date-picker
                      v-model="formData.date"
                      type="date"
                      placeholder="选择日期"
                      value-format="yyyy-MM-dd"
                      style="width: 100%;"
                      @change="logEvent('date', formData.date)"
                    />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-form-item label="状态开关">
                <el-switch
                  v-model="formData.enabled"
                  active-text="已启用"
                  inactive-text="已禁用"
                  @change="logEvent('switch', formData.enabled)"
                />
              </el-form-item>

              <el-form-item label="数值调节">
                <el-slider
                  v-model="formData.count"
                  :max="100"
                  show-input
                  @change="logEvent('slider', formData.count)"
                />
              </el-form-item>

              <el-form-item label="反馈触发" style="margin-bottom: 0;">
                <div class="action-btn-group">
                  <el-button size="small" type="primary" plain icon="el-icon-chat-dot-round" @click="triggerMessage">
                    Message 消息
                  </el-button>
                  <el-button size="small" type="success" plain icon="el-icon-copy-document" @click="dialogVisible = true">
                    Dialog 弹窗
                  </el-button>
                  <el-button size="small" type="warning" plain icon="el-icon-warning-outline" @click="triggerConfirm">
                    MessageBox 确认
                  </el-button>
                </div>
              </el-form-item>
            </el-form>
          </div>
        </div>

        <!-- 动态列表测试 -->
        <div class="panel-card" style="margin-top: 20px;">
          <div class="panel-header">
            <div class="panel-title">
              <span class="title-icon green"><i class="el-icon-tickets" /></span>
              <span>动态数据列表</span>
              <span class="count-pill">{{ tableList.length }}</span>
            </div>
            <el-button size="mini" type="primary" plain icon="el-icon-plus" @click="addItem">追加一行</el-button>
          </div>

          <div class="panel-body no-top-pad">
            <el-table :data="tableList" size="small" style="width: 100%;">
              <el-table-column prop="id" label="ID" width="68" align="center" />
              <el-table-column prop="name" label="测试项" />
              <el-table-column prop="status" label="状态" width="104">
                <template slot-scope="scope">
                  <el-tag
                    :type="scope.row.status === '已就绪' ? 'success' : 'info'"
                    size="mini"
                    effect="plain"
                  >
                    {{ scope.row.status }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="90" align="center">
                <template slot-scope="scope">
                  <el-button
                    size="mini"
                    type="text"
                    style="color: #ef4444;"
                    @click="removeItem(scope.$index)"
                  >
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </el-col>

      <!-- 右侧：状态监控与事件日志 -->
      <el-col :span="10" :xs="24">
        <div class="panel-card">
          <div class="panel-header">
            <div class="panel-title">
              <span class="live-dot" />
              <span>实时响应式状态</span>
            </div>
            <el-button size="mini" type="text" icon="el-icon-document-copy" @click="copyJson">
              复制 JSON
            </el-button>
          </div>
          <div class="code-panel">
            <pre class="code-box">{{ formattedJson }}</pre>
          </div>
        </div>

        <div class="panel-card" style="margin-top: 20px;">
          <div class="panel-header">
            <div class="panel-title">
              <span class="title-icon purple"><i class="el-icon-time" /></span>
              <span>事件触发日志</span>
              <span v-if="logs.length" class="count-pill">{{ logs.length }}</span>
            </div>
            <el-button size="mini" type="text" :disabled="logs.length === 0" @click="logs = []">
              清空
            </el-button>
          </div>
          <div class="panel-body">
            <div class="log-stream">
              <div v-if="logs.length === 0" class="log-empty">
                <i class="el-icon-bell" />
                <span>暂无事件日志，在左侧交互后会实时记录</span>
              </div>
              <div v-for="(log, idx) in logs" :key="idx" class="log-item">
                <span class="log-time">{{ log.time }}</span>
                <span class="log-badge">{{ log.type }}</span>
                <span class="log-msg" :title="log.content">{{ log.content }}</span>
              </div>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 弹窗组件 -->
    <el-dialog title="实验弹窗预览" :visible.sync="dialogVisible" width="440px">
      <p style="line-height: 1.75; color: #475569;">
        这是一个 Element UI Dialog 弹窗实例，当前表单关键词为：
        <strong style="color: #111827;">{{ formData.keyword || '（空）' }}</strong>
      </p>
      <span slot="footer" class="dialog-footer">
        <el-button size="small" @click="dialogVisible = false">取消</el-button>
        <el-button size="small" type="primary" @click="confirmDialog">确定</el-button>
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
  computed: {
    formattedJson() {
      return JSON.stringify(this.formData, null, 2)
    }
  },
  methods: {
    logEvent(type, payload) {
      const now = new Date().toTimeString().slice(0, 8)
      const content = typeof payload === 'object' ? JSON.stringify(payload) : String(payload)
      this.logs.unshift({ time: now, type, content })
      if (this.logs.length > 25) {
        this.logs.pop()
      }
    },
    async copyJson() {
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(this.formattedJson)
        }
        this.$message.success('已复制当前 formData JSON')
      } catch (_) {
        this.$message.error('复制失败')
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
      this.logEvent('reset', '已重置所有表单状态')
      this.$message.info('数据已重置')
    },
    triggerMessage() {
      this.$message({
        message: 'Element UI Message 消息调用成功',
        type: 'success'
      })
      this.logEvent('message', '触发成功消息提示')
    },
    triggerConfirm() {
      this.$confirm('此操作将模拟执行确认操作，是否继续？', '确认操作', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.$message.success('已确认操作')
          this.logEvent('confirm', '用户点击确定')
        })
        .catch(() => {
          this.$message.info('已取消操作')
          this.logEvent('confirm', '用户点击取消')
        })
    },
    confirmDialog() {
      this.dialogVisible = false
      this.$message.success('弹窗已确认')
      this.logEvent('dialog', '弹窗确定关闭')
    },
    addItem() {
      const nextId =
        this.tableList.length > 0 ? Math.max(...this.tableList.map((i) => i.id)) + 1 : 1
      this.tableList.push({
        id: nextId,
        name: `新测试项 #${nextId}`,
        status: '已就绪'
      })
      this.logEvent('table', `追加数据项 #${nextId}`)
    },
    removeItem(index) {
      const removed = this.tableList.splice(index, 1)
      this.logEvent('table', `删除数据项: ${removed[0] ? removed[0].name : ''}`)
      this.$message.warning('已删除该行')
    }
  }
}
</script>

<style scoped lang="scss">
.sandbox-page {
  padding-bottom: 12px;
}

.page-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
  margin-bottom: 20px;
}

.page-title {
  font-size: 22px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 6px;
  letter-spacing: -0.02em;
}

.page-desc {
  font-size: 13.5px;
  color: #64748b;
  margin: 0;

  code {
    background: #eef2f7;
    color: #334155;
    padding: 2px 6px;
    border-radius: 5px;
    font-size: 12px;
  }
}

.page-head-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.panel-card {
  background: #ffffff;
  border: 1px solid var(--app-border);
  border-radius: 12px;
  box-shadow: var(--app-shadow-xs);
  overflow: hidden;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 13px 18px;
  border-bottom: 1px solid var(--app-border-light);
  background: #fcfdff;
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 9px;
  font-size: 14.5px;
  font-weight: 600;
  color: #1e293b;
}

.panel-sub {
  font-size: 12px;
  color: #94a3b8;
}

.title-icon {
  width: 26px;
  height: 26px;
  border-radius: 7px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;

  &.blue {
    background: #eff6ff;
    color: #2563eb;
  }

  &.green {
    background: #ecfdf5;
    color: #059669;
  }

  &.purple {
    background: #f5f3ff;
    color: #7c3aed;
  }
}

.count-pill {
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
  background: #f1f5f9;
  padding: 1px 7px;
  border-radius: 999px;
}

.live-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #22c55e;
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.2);
}

.panel-body {
  padding: 18px 20px;

  &.no-top-pad {
    padding: 8px 16px 14px;
  }
}

.action-btn-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.code-panel {
  padding: 14px 16px;
  background: #ffffff;

  .code-box {
    max-height: 250px;
    margin: 0;
  }
}

.log-stream {
  max-height: 268px;
  overflow-y: auto;
}

.log-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 36px 12px;
  color: #94a3b8;
  font-size: 13px;

  i {
    font-size: 24px;
    color: #cbd5e1;
  }
}

.log-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 4px;
  border-bottom: 1px dashed #eef1f6;
  font-size: 12.5px;

  &:last-child {
    border-bottom: none;
  }
}

.log-time {
  color: #94a3b8;
  font-family: Menlo, Monaco, Consolas, monospace;
  font-size: 11.5px;
  flex-shrink: 0;
}

.log-badge {
  color: #2563eb;
  background: #eff6ff;
  border-radius: 5px;
  padding: 1px 7px;
  font-size: 11.5px;
  font-weight: 500;
  flex-shrink: 0;
}

.log-msg {
  color: #334155;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
