<template>
  <div class="patterns-page">
    <!-- 顶部概览与模式切换 -->
    <div class="patterns-hero">
      <div class="hero-left">
        <div class="hero-badges">
          <span class="hero-badge">Vue 2.7 + Element UI 2.15</span>
          <span class="hero-badge green">可运行演示 + 完整源码</span>
        </div>
        <h2 class="hero-title">业务组件封装范式</h2>
        <p class="hero-desc">
          沉淀 Vue 2 + Element UI 中后台项目中最值得复用的二次封装架构：高内聚、低耦合、内置防坑机制，点击即可交互体验或一键复制源码落盘。
        </p>
      </div>

      <div class="pattern-switcher">
        <button
          type="button"
          class="pattern-tab"
          :class="{ active: activePattern === 'dialog' }"
          @click="activePattern = 'dialog'"
        >
          <span class="tab-num">01</span>
          <div class="tab-text">
            <span class="tab-title">Dialog 弹窗封装</span>
            <span class="tab-sub">ref 调用 + $options.data() 重置</span>
          </div>
        </button>

        <button
          type="button"
          class="pattern-tab"
          :class="{ active: activePattern === 'table' }"
          @click="activePattern = 'table'"
        >
          <span class="tab-num">02</span>
          <div class="tab-text">
            <span class="tab-title">ProTable 表格 + 分页</span>
            <span class="tab-sub">配置化列 + 内置分页 + 防重请求</span>
          </div>
        </button>
      </div>
    </div>

    <!-- ==================== 范式 01：Dialog 独立封装 ==================== -->
    <section v-show="activePattern === 'dialog'" class="pattern-section">
      <div class="highlights-grid cols-3">
        <div class="highlight-card">
          <div class="hl-icon blue"><i class="el-icon-refresh" /></div>
          <h4>绝对干净的一键重置</h4>
          <p>
            通过 <code>Object.assign(this.$data, this.$options.data.call(this))</code>，无论 <code>data</code> 里有多少表单、Loading 或临时状态，每次打开瞬间归零。
          </p>
        </div>

        <div class="highlight-card">
          <div class="hl-icon green"><i class="el-icon-magic-stick" /></div>
          <h4>完整保留开闭过渡动画</h4>
          <p>
            不依赖父组件 <code>v-if</code> 强行销毁 DOM，关闭弹窗时完整保留 Element UI 自带的淡出缩放动画，且不在关闭动画中途闪烁清空内容。
          </p>
        </div>

        <div class="highlight-card">
          <div class="hl-icon purple"><i class="el-icon-connection" /></div>
          <h4>父组件彻底解耦</h4>
          <p>
            显隐变量 <code>visible</code> 完全收敛在弹窗组件内部，父组件不再充斥 <code>dialogVisible1 / 2 / 3</code>，一行 <code>this.$refs.addDialog.open()</code> 搞定。
          </p>
        </div>
      </div>

      <!-- 实时交互体验卡片 -->
      <div class="panel-card">
        <div class="panel-header">
          <div class="panel-title">
            <span class="live-dot" />
            <span>在线交互演示（验证动画与状态重置）</span>
          </div>
          <span class="panel-sub">src/components/patterns/BestPracticeDialog.vue</span>
        </div>

        <div class="panel-body">
          <div class="demo-tip-banner">
            <i class="el-icon-info" />
            <span>
              <strong>推荐测试路径：</strong>
              先点「编辑示例行」→ 展开「高级选项」→ 点击「模拟上传 / 添加临时标签」→ 清空名称触发红字校验 → 点取消关闭（观察平滑动画）→ 再点「新增数据」，所有状态与红字均会彻底归零！
            </span>
          </div>

          <div class="dialog-demo-bar">
            <el-button
              type="primary"
              size="small"
              icon="el-icon-plus"
              @click="$refs.demoDialog.open()"
            >
              新增数据（空态打开）
            </el-button>
            <el-button
              size="small"
              icon="el-icon-edit"
              @click="$refs.demoDialog.open(sampleRow)"
            >
              编辑示例行（张三 · 28 岁）
            </el-button>
            <span class="sample-row-preview">
              父组件源数据：<code>{{ JSON.stringify(sampleRow) }}</code>
            </span>
          </div>

          <div v-if="dialogHistory.length > 0" class="submit-log-box">
            <div class="submit-log-title">
              <span>最近提交回调记录（@success）</span>
              <el-button type="text" size="mini" @click="dialogHistory = []">清空</el-button>
            </div>
            <div v-for="(item, idx) in dialogHistory" :key="idx" class="submit-log-row">
              <span class="log-time">{{ item.time }}</span>
              <el-tag size="mini" :type="item.mode === 'edit' ? 'warning' : 'success'" effect="plain">
                {{ item.mode === 'edit' ? '编辑提交' : '新增提交' }}
              </el-tag>
              <span class="log-content">{{ item.summary }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 源码展示区 -->
      <div class="panel-card" style="margin-top: 20px;">
        <div class="code-card-header">
          <div class="code-tabs">
            <button
              type="button"
              class="code-tab-btn"
              :class="{ active: dialogCodeTab === 'clean' }"
              @click="dialogCodeTab = 'clean'"
            >
              标准精简模板 (AddDialog.vue)
            </button>
            <button
              type="button"
              class="code-tab-btn"
              :class="{ active: dialogCodeTab === 'parent' }"
              @click="dialogCodeTab = 'parent'"
            >
              父组件调用示例
            </button>
            <button
              type="button"
              class="code-tab-btn"
              :class="{ active: dialogCodeTab === 'full' }"
              @click="dialogCodeTab = 'full'"
            >
              本页完整演示源码 (BestPracticeDialog.vue)
            </button>
          </div>

          <button
            type="button"
            class="copy-btn"
            :class="{ copied: copiedKey === 'dialog' }"
            @click="copyCode(currentDialogCode, 'dialog')"
          >
            <i :class="copiedKey === 'dialog' ? 'el-icon-check' : 'el-icon-document-copy'" />
            <span>{{ copiedKey === 'dialog' ? '已复制' : '复制当前源码' }}</span>
          </button>
        </div>

        <div class="code-viewer">
          <pre><code class="hljs" v-html="highlight(currentDialogCode)"></code></pre>
        </div>
      </div>
    </section>

    <!-- ==================== 范式 02：ProTable 表格 + 分页封装 ==================== -->
    <section v-show="activePattern === 'table'" class="pattern-section">
      <div class="highlights-grid cols-4">
        <div class="highlight-card">
          <div class="hl-icon blue"><i class="el-icon-s-grid" /></div>
          <h4>内置分页 + 防双重请求</h4>
          <p>
            内置 <code>el-pagination</code> 并加锁规避「非第 1 页切换每页条数」触发两次接口请求的 Element 经典坑。
          </p>
        </div>

        <div class="highlight-card">
          <div class="hl-icon green"><i class="el-icon-cpu" /></div>
          <h4>托管请求 + 竞态保护</h4>
          <p>
            传入 <code>:request</code> 函数自动接管 Loading、分页入参、请求序号防乱序覆盖，以及渲染后自动 <code>doLayout()</code>。
          </p>
        </div>

        <div class="highlight-card">
          <div class="hl-icon amber"><i class="el-icon-finished" /></div>
          <h4>配置化列 + 跨页勾选</h4>
          <p>
            支持 <code>columns</code> 数组声明 + 命名插槽自定义渲染，默认启用 <code>row-key</code> 与 <code>reserve-selection</code> 跨页记忆勾选。
          </p>
        </div>

        <div class="highlight-card">
          <div class="hl-icon purple"><i class="el-icon-set-up" /></div>
          <h4>透明透传 + 实用方法</h4>
          <p>
            通过 <code>$attrs / $listeners</code> 保留原生表格全部能力，暴露 <code>reload()</code>、<code>clearSelection()</code> 与密度切换。
          </p>
        </div>
      </div>

      <!-- 实时联合演示：ProTable + BestPracticeDialog -->
      <div class="panel-card">
        <div class="panel-header">
          <div class="panel-title">
            <span class="live-dot" />
            <span>ProTable 联合实战演示（内置分页 + 跨页多选 + 联动 Dialog 增删改）</span>
          </div>
          <div class="request-monitor">
            <span class="monitor-pill">
              累计请求：<strong>{{ requestCount }}</strong> 次
            </span>
            <span v-if="lastRequestLog" class="monitor-params">
              最近入参：<code>{{ lastRequestLog }}</code>
            </span>
          </div>
        </div>

        <div class="panel-body">
          <ProTable
            ref="proTableRef"
            :columns="tableColumns"
            :request="mockFetchUsers"
            :params="queryParams"
            :page-size="5"
            :page-sizes="[5, 10, 20]"
            selection
            show-index
            border
            @selection-change="handleTableSelection"
          >
            <!-- 左侧查询栏插槽 -->
            <template #toolbar-left>
              <el-form inline size="small" class="inline-search-form" @submit.native.prevent>
                <el-form-item style="margin-bottom: 0;">
                  <el-input
                    v-model="queryParams.keyword"
                    placeholder="搜索姓名或邮箱..."
                    prefix-icon="el-icon-search"
                    clearable
                    style="width: 200px;"
                    @keyup.enter.native="handleTableSearch"
                    @clear="handleTableSearch"
                  />
                </el-form-item>
                <el-form-item style="margin-bottom: 0;">
                  <el-select
                    v-model="queryParams.role"
                    placeholder="全部角色"
                    clearable
                    style="width: 130px;"
                    @change="handleTableSearch"
                  >
                    <el-option label="管理员" value="管理员" />
                    <el-option label="研发工程师" value="研发工程师" />
                    <el-option label="产品经理" value="产品经理" />
                    <el-option label="测试工程师" value="测试工程师" />
                  </el-select>
                </el-form-item>
                <el-form-item style="margin-bottom: 0;">
                  <el-button type="primary" icon="el-icon-search" @click="handleTableSearch">查询</el-button>
                  <el-button @click="handleTableReset">重置</el-button>
                </el-form-item>
              </el-form>
            </template>

            <!-- 右侧操作按钮插槽 -->
            <template #toolbar-right>
              <el-button
                v-if="tableSelected.length > 0"
                size="small"
                type="danger"
                plain
                icon="el-icon-delete"
                @click="handleBatchDelete"
              >
                批量删除 ({{ tableSelected.length }})
              </el-button>
              <el-button
                size="small"
                type="primary"
                icon="el-icon-plus"
                @click="$refs.tableDialog.open()"
              >
                新增成员
              </el-button>
            </template>

            <!-- 自定义角色列插槽 -->
            <template #role="{ row }">
              <el-tag
                size="mini"
                effect="plain"
                :type="roleTagType(row.role)"
              >
                {{ row.role }}
              </el-tag>
            </template>

            <!-- 自定义状态列插槽 -->
            <template #status="{ row }">
              <span class="status-cell">
                <span class="status-dot" :class="row.active ? 'on' : 'off'" />
                <span>{{ row.active ? '在职' : '休假' }}</span>
              </span>
            </template>

            <!-- 自定义操作列插槽 -->
            <template #action="{ row }">
              <el-button
                size="mini"
                type="text"
                icon="el-icon-edit"
                @click="$refs.tableDialog.open(row)"
              >
                编辑
              </el-button>
              <el-button
                size="mini"
                type="text"
                icon="el-icon-delete"
                style="color: #ef4444;"
                @click="handleDeleteRow(row)"
              >
                删除
              </el-button>
            </template>
          </ProTable>
        </div>
      </div>

      <!-- ProTable 源码与 API 说明 -->
      <div class="panel-card" style="margin-top: 20px;">
        <div class="code-card-header">
          <div class="code-tabs">
            <button
              type="button"
              class="code-tab-btn"
              :class="{ active: tableCodeTab === 'component' }"
              @click="tableCodeTab = 'component'"
            >
              封装组件源码 (ProTable.vue)
            </button>
            <button
              type="button"
              class="code-tab-btn"
              :class="{ active: tableCodeTab === 'usage' }"
              @click="tableCodeTab = 'usage'"
            >
              父组件使用示例
            </button>
            <button
              type="button"
              class="code-tab-btn"
              :class="{ active: tableCodeTab === 'api' }"
              @click="tableCodeTab = 'api'"
            >
              API Props / Slots / Methods
            </button>
          </div>

          <button
            v-if="tableCodeTab !== 'api'"
            type="button"
            class="copy-btn"
            :class="{ copied: copiedKey === 'table' }"
            @click="copyCode(currentTableCode, 'table')"
          >
            <i :class="copiedKey === 'table' ? 'el-icon-check' : 'el-icon-document-copy'" />
            <span>{{ copiedKey === 'table' ? '已复制' : '复制当前源码' }}</span>
          </button>
        </div>

        <div v-if="tableCodeTab === 'api'" class="api-doc-wrap">
          <h4>Props 配置</h4>
          <table class="api-table">
            <thead>
              <tr>
                <th>属性名</th>
                <th>说明</th>
                <th>类型</th>
                <th>默认值</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in proTablePropsDoc" :key="row.name">
                <td><code>{{ row.name }}</code></td>
                <td>{{ row.desc }}</td>
                <td>{{ row.type }}</td>
                <td><code>{{ row.defaultVal }}</code></td>
              </tr>
            </tbody>
          </table>

          <h4>Slots 插槽 & Methods 方法</h4>
          <table class="api-table">
            <thead>
              <tr>
                <th>名称</th>
                <th>类别</th>
                <th>说明</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in proTableMembersDoc" :key="row.name">
                <td><code>{{ row.name }}</code></td>
                <td>
                  <el-tag size="mini" :type="row.kind === 'Slot' ? 'success' : 'primary'" effect="plain">
                    {{ row.kind }}
                  </el-tag>
                </td>
                <td>{{ row.desc }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else class="code-viewer">
          <pre><code class="hljs" v-html="highlight(currentTableCode)"></code></pre>
        </div>
      </div>
    </section>

    <!-- 两个独立演示用 Dialog（各自通过 ref 调用，父组件零 visible 变量） -->
    <BestPracticeDialog ref="demoDialog" @success="handleDemoDialogSuccess" />
    <BestPracticeDialog ref="tableDialog" @success="handleTableDialogSuccess" />
  </div>
</template>

<script>
import hljs from 'highlight.js/lib/core'
import xml from 'highlight.js/lib/languages/xml'
import javascript from 'highlight.js/lib/languages/javascript'
import css from 'highlight.js/lib/languages/css'
import scss from 'highlight.js/lib/languages/scss'

import BestPracticeDialog from './patterns/BestPracticeDialog.vue'
import ProTable from './patterns/ProTable.vue'
import bestPracticeDialogRaw from './patterns/BestPracticeDialog.vue?raw'
import proTableRaw from './patterns/ProTable.vue?raw'

hljs.registerLanguage('xml', xml)
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('css', css)
hljs.registerLanguage('scss', scss)

const CLEAN_DIALOG_CODE = `<template>
  <!-- visible 完全收敛在子组件内部，不破坏 Element UI 原生过渡动画 -->
  <el-dialog
    :title="formData.id ? '编辑数据' : '新增数据'"
    :visible.sync="visible"
    width="500px"
    @close="handleClose"
  >
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="80px">
      <el-form-item label="名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入名称" />
      </el-form-item>
      <el-form-item label="年龄" prop="age">
        <el-input-number v-model="formData.age" :min="1" :max="120" />
      </el-form-item>
    </el-form>

    <!-- 其他复杂临时状态也会在下次 open 时自动重置 -->
    <div v-if="showAdvanced">
      <el-button :loading="isUploading">上传文件</el-button>
    </div>

    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取 消</el-button>
      <el-button type="primary" @click="submit">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
export default {
  name: 'AddDialog',
  data() {
    return {
      visible: false,
      formData: { id: null, name: '', age: 18 },
      rules: {
        name: [{ required: true, message: '请输入名称', trigger: 'blur' }]
      },
      showAdvanced: false,
      isUploading: false,
      tempList: []
    }
  },
  methods: {
    open(rowData = null) {
      // 【核心魔法】一键将当前组件所有 data 还原到初始干净状态
      Object.assign(this.$data, this.$options.data.call(this))

      if (rowData) {
        // 深拷贝避免直接修改父组件行对象
        this.formData = JSON.parse(JSON.stringify(rowData))
      }

      this.visible = true

      this.$nextTick(() => {
        if (this.$refs.formRef) {
          this.$refs.formRef.clearValidate()
        }
      })
    },
    submit() {
      this.$refs.formRef.validate((valid) => {
        if (!valid) return
        this.visible = false
        this.$emit('success', this.formData)
      })
    },
    handleClose() {
      // 下次 open() 会统一重置，关闭动画期间内容不闪烁
    }
  }
}
<\/script>`

const PARENT_DIALOG_CODE = `<template>
  <div class="parent-page">
    <el-button type="primary" @click="handleAdd">新增数据</el-button>
    <el-button @click="handleEdit(currentRow)">编辑数据</el-button>

    <!-- 仅需通过 ref 绑定，无需维护 visible，无需使用 v-if -->
    <add-dialog ref="addDialog" @success="fetchList" />
  </div>
</template>

<script>
import AddDialog from './AddDialog.vue'

export default {
  components: { AddDialog },
  data() {
    return {
      currentRow: { id: 1, name: '张三', age: 28 }
    }
  },
  methods: {
    handleAdd() {
      this.$refs.addDialog.open()
    },
    handleEdit(row) {
      this.$refs.addDialog.open(row)
    },
    fetchList() {
      // 刷新表格数据
    }
  }
}
<\/script>`

const PARENT_PRO_TABLE_CODE = `<template>
  <div>
    <ProTable
      ref="tableRef"
      :columns="columns"
      :request="fetchUserList"
      :params="queryParams"
      :page-size="10"
      selection
      show-index
      border
    >
      <!-- 工具栏左侧：查询条件 -->
      <template #toolbar-left>
        <el-input
          v-model="queryParams.keyword"
          placeholder="搜索姓名"
          size="small"
          clearable
          style="width: 200px;"
          @keyup.enter.native="$refs.tableRef.reload(true)"
        />
        <el-button size="small" type="primary" @click="$refs.tableRef.reload(true)">
          查询
        </el-button>
      </template>

      <!-- 工具栏右侧：新建按钮 -->
      <template #toolbar-right>
        <el-button size="small" type="primary" @click="$refs.addDialog.open()">
          新增
        </el-button>
      </template>

      <!-- 自定义状态列 -->
      <template #status="{ row }">
        <el-tag :type="row.active ? 'success' : 'info'" size="mini">
          {{ row.active ? '在职' : '休假' }}
        </el-tag>
      </template>

      <!-- 自定义操作列 -->
      <template #action="{ row }">
        <el-button type="text" size="mini" @click="$refs.addDialog.open(row)">编辑</el-button>
      </template>
    </ProTable>

    <!-- 搭配独立封装弹窗，提交成功后直接刷新当前页 -->
    <AddDialog ref="addDialog" @success="$refs.tableRef.reload(false)" />
  </div>
</template>

<script>
import ProTable from '@/components/patterns/ProTable.vue'
import AddDialog from '@/components/patterns/BestPracticeDialog.vue'

export default {
  components: { ProTable, AddDialog },
  data() {
    return {
      queryParams: { keyword: '' },
      columns: [
        { prop: 'name', label: '姓名', width: 120 },
        { prop: 'role', label: '角色', width: 130 },
        { prop: 'email', label: '邮箱', minWidth: 180 },
        { prop: 'status', label: '状态', width: 100, slot: 'status' },
        { label: '操作', width: 140, fixed: 'right', align: 'center', slot: 'action' }
      ]
    }
  },
  methods: {
    // 返回 { list, total } 即可自动驱动表格与内置分页
    async fetchUserList({ pageNum, pageSize, keyword }) {
      const res = await api.getUsers({ pageNum, pageSize, keyword })
      return { list: res.records, total: res.total }
    }
  }
}
<\/script>`

function buildInitialMockUsers() {
  const names = [
    '林知夏', '陈默', '周明远', '苏晚晴', '陆景行', '沈清歌',
    '许嘉禾', '宋星河', '顾南风', '江屿白', '唐思远', '程安然',
    '叶知秋', '谢云舟', '秦沐阳', '韩书瑶', '白洛尘', '魏子轩'
  ]
  const roles = ['管理员', '研发工程师', '产品经理', '测试工程师']
  return names.map((name, idx) => ({
    id: 1001 + idx,
    name,
    age: 22 + ((idx * 3) % 15),
    role: roles[idx % roles.length],
    email: `user${1001 + idx}@element-lab.dev`,
    active: idx % 4 !== 3,
    updatedAt: `2026-11-${String(10 + (idx % 16)).padStart(2, '0')}`
  }))
}

export default {
  name: 'ComponentPatterns',
  components: {
    BestPracticeDialog,
    ProTable
  },
  data() {
    return {
      activePattern: 'dialog',
      dialogCodeTab: 'clean',
      tableCodeTab: 'component',
      copiedKey: '',

      // Dialog 演示区数据
      sampleRow: {
        id: 101,
        name: '张三',
        age: 28,
        role: '管理员'
      },
      dialogHistory: [],

      // ProTable 演示区数据
      mockDb: buildInitialMockUsers(),
      queryParams: {
        keyword: '',
        role: ''
      },
      tableSelected: [],
      requestCount: 0,
      lastRequestLog: '',
      tableColumns: [
        { prop: 'name', label: '成员姓名', width: 118 },
        { prop: 'age', label: '年龄', width: 82, align: 'center', sortable: true },
        { prop: 'role', label: '角色', width: 124, slot: 'role' },
        { prop: 'email', label: '工作邮箱', minWidth: 185 },
        { prop: 'status', label: '状态', width: 92, slot: 'status' },
        { prop: 'updatedAt', label: '最近更新', width: 118, align: 'center' },
        { label: '操作', width: 136, align: 'center', fixed: 'right', slot: 'action' }
      ],
      proTablePropsDoc: [
        { name: 'columns', desc: '列配置数组，支持 prop / label / width / fixed / sortable / slot / headerSlot / hidden', type: 'Array', defaultVal: '必填' },
        { name: 'request', desc: '远程请求函数 ({ pageNum, pageSize, ...params }) => Promise<{ list, total }>', type: 'Function', defaultVal: 'null' },
        { name: 'params', desc: '透传给 request 的查询参数对象', type: 'Object', defaultVal: '{}' },
        { name: 'data / total', desc: '不使用 request 时可手动受控传入列表与总数', type: 'Array / Number', defaultVal: '[] / 0' },
        { name: 'selection / reserveSelection', desc: '是否开启多选列及跨页勾选记忆（默认配合 rowKey 生效）', type: 'Boolean', defaultVal: 'false / true' },
        { name: 'showIndex', desc: '是否显示自动累加页码的连续序号列', type: 'Boolean', defaultVal: 'false' },
        { name: 'showPagination', desc: '是否展示内置分页器（已内置防 pageSize 切换双重请求锁）', type: 'Boolean', defaultVal: 'true' },
        { name: 'pageSize / pageSizes', desc: '每页条数与可选条数列表', type: 'Number / Array', defaultVal: '5 / [5,10,20,50]' }
      ],
      proTableMembersDoc: [
        { name: 'toolbar-left / toolbar-right', kind: 'Slot', desc: '表格顶部左右工具栏区域，常放搜索表单与新增/导出按钮' },
        { name: '[col.slot] / [col.headerSlot]', kind: 'Slot', desc: '按列配置中声明的插槽名自定义单元格或表头内容，作用域透传 { row, column, $index }' },
        { name: 'reload(resetPage = false)', kind: 'Method', desc: '重新加载表格数据，传 true 时自动重置回第 1 页' },
        { name: 'clearSelection()', kind: 'Method', desc: '清空跨页多选记录（重置筛选条件时推荐调用）' },
        { name: 'doLayout() / getTableRef()', kind: 'Method', desc: '手动重排表格布局或获取底层 el-table 实例' }
      ]
    }
  },
  computed: {
    currentDialogCode() {
      if (this.dialogCodeTab === 'clean') return CLEAN_DIALOG_CODE
      if (this.dialogCodeTab === 'parent') return PARENT_DIALOG_CODE
      return bestPracticeDialogRaw
    },
    currentTableCode() {
      if (this.tableCodeTab === 'component') return proTableRaw
      return PARENT_PRO_TABLE_CODE
    }
  },
  methods: {
    switchPattern(pattern) {
      if (pattern === 'dialog' || pattern === 'table') {
        this.activePattern = pattern
      }
    },
    highlight(code) {
      try {
        return hljs.highlightAuto(code, ['xml', 'javascript', 'css', 'scss']).value
      } catch (_) {
        return code.replace(/</g, '&lt;').replace(/>/g, '&gt;')
      }
    },
    async copyCode(code, key) {
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(code)
        }
        this.copiedKey = key
        this.$message.success('源码已复制到剪贴板')
        setTimeout(() => {
          if (this.copiedKey === key) this.copiedKey = ''
        }, 1800)
      } catch (_) {
        this.$message.error('复制失败，请手动复制')
      }
    },

    // Dialog 独立演示回调
    handleDemoDialogSuccess({ mode, data, tempCount }) {
      const now = new Date().toTimeString().slice(0, 8)
      if (mode === 'edit') {
        this.sampleRow = { ...this.sampleRow, ...data }
      }
      this.dialogHistory.unshift({
        time: now,
        mode,
        summary: `姓名：${data.name}，年龄：${data.age}，角色：${data.role}${tempCount ? `（附带 ${tempCount} 个临时项）` : ''}`
      })
      this.$message.success(mode === 'edit' ? '编辑保存成功（源数据已更新）' : '新增提交成功')
    },

    // ProTable 模拟远程分页接口
    mockFetchUsers({ pageNum, pageSize, keyword = '', role = '' }) {
      this.requestCount += 1
      this.lastRequestLog = JSON.stringify({ pageNum, pageSize, keyword: keyword || undefined, role: role || undefined })

      return new Promise((resolve) => {
        setTimeout(() => {
          const kw = keyword.trim().toLowerCase()
          const filtered = this.mockDb.filter((item) => {
            const matchKw = !kw || item.name.toLowerCase().includes(kw) || item.email.toLowerCase().includes(kw)
            const matchRole = !role || item.role === role
            return matchKw && matchRole
          })
          const start = (pageNum - 1) * pageSize
          resolve({
            list: filtered.slice(start, start + pageSize),
            total: filtered.length
          })
        }, 260)
      })
    },
    handleTableSearch() {
      this.$refs.proTableRef && this.$refs.proTableRef.reload(true)
    },
    handleTableReset() {
      this.queryParams = { keyword: '', role: '' }
      if (this.$refs.proTableRef) {
        this.$refs.proTableRef.clearSelection()
        this.$refs.proTableRef.reload(true)
      }
    },
    handleTableSelection(rows) {
      this.tableSelected = rows
    },
    handleTableDialogSuccess({ mode, data }) {
      const today = new Date().toISOString().slice(0, 10)
      if (mode === 'edit') {
        const idx = this.mockDb.findIndex((u) => u.id === data.id)
        if (idx !== -1) {
          this.$set(this.mockDb, idx, { ...this.mockDb[idx], ...data, updatedAt: today })
        }
        this.$message.success('成员信息已更新')
        this.$refs.proTableRef && this.$refs.proTableRef.reload(false)
      } else {
        const nextId = this.mockDb.length ? Math.max(...this.mockDb.map((u) => u.id)) + 1 : 1001
        this.mockDb.unshift({
          ...data,
          id: nextId,
          email: `user${nextId}@element-lab.dev`,
          active: true,
          updatedAt: today
        })
        this.$message.success('新增成员成功')
        this.$refs.proTableRef && this.$refs.proTableRef.reload(true)
      }
    },
    handleDeleteRow(row) {
      this.$confirm(`确认删除成员「${row.name}」吗？`, '删除确认', { type: 'warning' })
        .then(() => {
          this.mockDb = this.mockDb.filter((u) => u.id !== row.id)
          this.$message.success('删除成功')
          this.$refs.proTableRef && this.$refs.proTableRef.reload(false)
        })
        .catch(() => {})
    },
    handleBatchDelete() {
      const ids = new Set(this.tableSelected.map((r) => r.id))
      this.$confirm(`确认批量删除已选中的 ${ids.size} 位成员吗？`, '批量删除', { type: 'warning' })
        .then(() => {
          this.mockDb = this.mockDb.filter((u) => !ids.has(u.id))
          this.$refs.proTableRef.clearSelection()
          this.$refs.proTableRef.reload(true)
          this.$message.success(`已删除 ${ids.size} 条数据`)
        })
        .catch(() => {})
    },
    roleTagType(role) {
      if (role === '管理员') return 'danger'
      if (role === '产品经理') return 'warning'
      if (role === '测试工程师') return 'success'
      return 'primary'
    }
  }
}
</script>

<style scoped lang="scss">
.patterns-page {
  padding-bottom: 24px;
}

.patterns-hero {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  padding: 26px 30px;
  background: linear-gradient(135deg, #ffffff 0%, #f0f7ff 60%, #f5f3ff 100%);
  border: 1px solid #e2e8f4;
  border-radius: 16px;
  margin-bottom: 20px;
  box-shadow: var(--app-shadow-xs);
}

.hero-badges {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
}

.hero-badge {
  font-size: 11.5px;
  font-weight: 600;
  color: #2563eb;
  background: #eff6ff;
  border: 1px solid #dbeafe;
  padding: 2px 10px;
  border-radius: 999px;

  &.green {
    color: #059669;
    background: #ecfdf5;
    border-color: #d1fae5;
  }
}

.hero-title {
  font-size: 22px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 8px;
  letter-spacing: -0.02em;
}

.hero-desc {
  font-size: 13.5px;
  color: #475569;
  line-height: 1.7;
  margin: 0;
  max-width: 600px;
}

.pattern-switcher {
  display: flex;
  gap: 10px;
  flex-shrink: 0;
}

.pattern-tab {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid #dce4f0;
  border-radius: 12px;
  cursor: pointer;
  text-align: left;
  transition: all 0.16s ease;

  &:hover {
    border-color: #93c5fd;
    background: #ffffff;
  }

  &.active {
    background: #2563eb;
    border-color: #2563eb;
    box-shadow: 0 6px 18px rgba(37, 99, 235, 0.24);

    .tab-num {
      background: rgba(255, 255, 255, 0.2);
      color: #ffffff;
    }

    .tab-title {
      color: #ffffff;
    }

    .tab-sub {
      color: rgba(255, 255, 255, 0.82);
    }
  }
}

.tab-num {
  font-family: Menlo, Monaco, Consolas, monospace;
  font-size: 12px;
  font-weight: 700;
  color: #2563eb;
  background: #eff6ff;
  padding: 5px 8px;
  border-radius: 8px;
}

.tab-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.tab-title {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}

.tab-sub {
  font-size: 11.5px;
  color: #64748b;
}

/* 亮点卡片 */
.highlights-grid {
  display: grid;
  gap: 14px;
  margin-bottom: 18px;

  &.cols-3 {
    grid-template-columns: repeat(3, 1fr);
  }

  &.cols-4 {
    grid-template-columns: repeat(4, 1fr);
  }
}

.highlight-card {
  background: #ffffff;
  border: 1px solid var(--app-border);
  border-radius: 12px;
  padding: 18px 20px;
  box-shadow: var(--app-shadow-xs);

  h4 {
    font-size: 14.5px;
    font-weight: 600;
    color: #111827;
    margin: 12px 0 6px;
  }

  p {
    font-size: 13px;
    color: #64748b;
    line-height: 1.7;
    margin: 0;
  }

  code {
    background: #f1f5f9;
    padding: 1px 5px;
    border-radius: 4px;
    font-size: 12px;
    color: #2563eb;
  }
}

.hl-icon {
  width: 34px;
  height: 34px;
  border-radius: 9px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 17px;

  &.blue {
    background: #eff6ff;
    color: #2563eb;
  }
  &.green {
    background: #ecfdf5;
    color: #059669;
  }
  &.amber {
    background: #fffbeb;
    color: #d97706;
  }
  &.purple {
    background: #f5f3ff;
    color: #7c3aed;
  }
}

/* 通用面板卡片 */
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
  flex-wrap: wrap;
  gap: 12px;
  padding: 13px 20px;
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
  font-family: Menlo, Monaco, Consolas, monospace;
}

.live-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #22c55e;
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.2);
}

.panel-body {
  padding: 20px 22px;
}

.demo-tip-banner {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 12px 16px;
  background: #eff8ff;
  border: 1px solid #d5eaff;
  border-radius: 8px;
  font-size: 13px;
  color: #334155;
  line-height: 1.65;
  margin-bottom: 16px;

  i {
    color: #3b82f6;
    font-size: 15px;
    margin-top: 2px;
  }
}

.dialog-demo-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.sample-row-preview {
  font-size: 12.5px;
  color: #64748b;

  code {
    background: #f1f5f9;
    padding: 3px 8px;
    border-radius: 5px;
    color: #1e293b;
    font-family: Menlo, Monaco, Consolas, monospace;
  }
}

.submit-log-box {
  margin-top: 16px;
  padding: 12px 16px;
  background: #f8fafc;
  border: 1px solid #e6eaf2;
  border-radius: 8px;
}

.submit-log-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12.5px;
  font-weight: 600;
  color: #475569;
  margin-bottom: 8px;
}

.submit-log-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 0;
  font-size: 13px;
  color: #334155;
  border-top: 1px dashed #e2e8f0;
}

.log-time {
  font-family: Menlo, Monaco, Consolas, monospace;
  font-size: 12px;
  color: #94a3b8;
}

/* ProTable 演示辅助样式 */
.request-monitor {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  font-size: 12px;
  color: #64748b;
}

.monitor-pill {
  background: #f0fdf4;
  border: 1px solid #dcfce7;
  color: #15803d;
  padding: 2px 9px;
  border-radius: 999px;
}

.monitor-params code {
  background: #f1f5f9;
  padding: 2px 7px;
  border-radius: 5px;
  color: #334155;
  font-family: Menlo, Monaco, Consolas, monospace;
}

.inline-search-form {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.status-cell {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;

  &.on {
    background: #22c55e;
  }

  &.off {
    background: #cbd5e1;
  }
}

/* 源码切换区 */
.code-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  padding: 10px 16px;
  border-bottom: 1px solid var(--app-border-light);
  background: #fcfdff;
}

.code-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.code-tab-btn {
  border: none;
  background: transparent;
  color: #64748b;
  font-size: 13px;
  font-weight: 500;
  padding: 6px 12px;
  border-radius: 7px;
  cursor: pointer;
  transition: all 0.14s ease;

  &:hover {
    color: #1e293b;
    background: #f1f5f9;
  }

  &.active {
    color: #2563eb;
    background: #eff6ff;
    font-weight: 600;
  }
}

.copy-btn {
  border: 1px solid #e2e8f0;
  background: #ffffff;
  color: #475569;
  font-size: 12px;
  padding: 5px 12px;
  border-radius: 7px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  transition: all 0.14s ease;

  &:hover {
    border-color: #93c5fd;
    color: #2563eb;
    background: #eff6ff;
  }

  &.copied {
    color: #15803d;
    border-color: #86efac;
    background: #f0fdf4;
  }
}

.code-viewer {
  max-height: 520px;
  overflow: auto;
  background: #f8fafc;

  pre {
    margin: 0;
  }

  code.hljs {
    display: block;
    padding: 18px 22px;
    background: #f8fafc;
    font-size: 12.5px;
    line-height: 1.72;
    font-family: "JetBrains Mono", Menlo, Monaco, Consolas, monospace;
  }
}

.api-doc-wrap {
  padding: 20px 24px;

  h4 {
    font-size: 15px;
    font-weight: 600;
    color: #1e293b;
    margin: 0 0 12px;

    &:not(:first-child) {
      margin-top: 24px;
    }
  }
}

.api-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  border: 1px solid #e6eaf2;
  border-radius: 10px;
  overflow: hidden;
  font-size: 13px;

  th {
    background: #f8fafc;
    color: #64748b;
    font-weight: 600;
    text-align: left;
    padding: 10px 14px;
    border-bottom: 1px solid #e6eaf2;
  }

  td {
    padding: 10px 14px;
    color: #334155;
    border-bottom: 1px solid #f1f5f9;
  }

  tbody tr:last-child td {
    border-bottom: none;
  }

  code {
    background: #f1f5f9;
    color: #2563eb;
    padding: 1px 6px;
    border-radius: 4px;
    font-size: 12px;
    font-family: Menlo, Monaco, Consolas, monospace;
  }
}

@media (max-width: 1100px) {
  .patterns-hero {
    flex-direction: column;
    align-items: flex-start;
  }

  .highlights-grid.cols-3,
  .highlights-grid.cols-4 {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 720px) {
  .pattern-switcher {
    flex-direction: column;
    width: 100%;
  }

  .highlights-grid.cols-3,
  .highlights-grid.cols-4 {
    grid-template-columns: 1fr;
  }
}
</style>
