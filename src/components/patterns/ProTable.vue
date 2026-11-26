<template>
  <div class="pro-table">
    <!-- 顶部工具栏 -->
    <div v-if="showToolbar" class="pro-table-toolbar">
      <div class="toolbar-left">
        <slot name="toolbar-left" />
        <span v-if="selection && selectedRows.length > 0" class="selection-banner">
          已选 <strong>{{ selectedRows.length }}</strong> 项
          <el-button type="text" size="mini" @click="clearSelection">清空</el-button>
        </span>
      </div>

      <div class="toolbar-right">
        <slot name="toolbar-right" />
        <el-tooltip content="刷新表格" placement="top">
          <el-button
            size="mini"
            circle
            icon="el-icon-refresh"
            :loading="innerLoading"
            @click="reload(false)"
          />
        </el-tooltip>

        <el-dropdown trigger="click" @command="handleDensityChange">
          <el-tooltip content="表格密度" placement="top">
            <el-button size="mini" circle icon="el-icon-s-operation" />
          </el-tooltip>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="medium" :class="{ 'is-active-density': tableSize === 'medium' }">宽松 (medium)</el-dropdown-item>
            <el-dropdown-item command="small" :class="{ 'is-active-density': tableSize === 'small' }">默认 (small)</el-dropdown-item>
            <el-dropdown-item command="mini" :class="{ 'is-active-density': tableSize === 'mini' }">紧凑 (mini)</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </div>

    <!-- Element Table 核心区域 -->
    <el-table
      ref="elTable"
      v-loading="mergedLoading"
      :data="mergedData"
      :row-key="rowKey"
      :size="tableSize"
      :border="border"
      :stripe="stripe"
      v-bind="$attrs"
      v-on="tableListeners"
      @selection-change="handleSelectionChange"
    >
      <!-- 可选：跨页多选列 -->
      <el-table-column
        v-if="selection"
        type="selection"
        width="50"
        align="center"
        :reserve-selection="reserveSelection"
      />

      <!-- 可选：连续序号列（自动结合当前页码计算） -->
      <el-table-column
        v-if="showIndex"
        type="index"
        label="#"
        width="56"
        align="center"
        :index="computeIndex"
      />

      <!-- 配置化业务列（支持 slot 自定义渲染） -->
      <el-table-column
        v-for="col in visibleColumns"
        :key="col.key || col.prop || col.slot || col.label"
        :prop="col.prop"
        :label="col.label"
        :width="col.width"
        :min-width="col.minWidth"
        :fixed="col.fixed"
        :align="col.align || 'left'"
        :sortable="col.sortable"
        :formatter="col.formatter"
        :show-overflow-tooltip="col.showOverflowTooltip !== false"
      >
        <template v-if="col.headerSlot" slot="header" slot-scope="scope">
          <slot :name="col.headerSlot" v-bind="scope" />
        </template>

        <template slot-scope="scope">
          <slot v-if="col.slot" :name="col.slot" v-bind="scope" />
          <span v-else-if="col.formatter">
            {{ col.formatter(scope.row, scope.column, scope.row[col.prop], scope.$index) }}
          </span>
          <span v-else>
            {{ formatEmpty(scope.row[col.prop]) }}
          </span>
        </template>
      </el-table-column>

      <template slot="empty">
        <slot name="empty">
          <el-empty description="暂无数据" :image-size="64" />
        </slot>
      </template>
    </el-table>

    <!-- 内置分页器（已处理非首页切 pageSize 双重触发问题） -->
    <div v-if="showPagination" class="pro-table-pagination">
      <el-pagination
        background
        :current-page="innerPageNum"
        :page-size="innerPageSize"
        :page-sizes="pageSizes"
        :total="mergedTotal"
        :layout="paginationLayout"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProTable',
  inheritAttrs: false,
  props: {
    // 列配置数组
    columns: {
      type: Array,
      required: true
    },
    // 远程异步请求函数：({ pageNum, pageSize, ...params }) => Promise<{ list, total }>
    request: {
      type: Function,
      default: null
    },
    // 附加查询参数（配合 request 使用）
    params: {
      type: Object,
      default: () => ({})
    },
    // 手动传入数据模式（不使用 request 时生效）
    data: {
      type: Array,
      default: () => []
    },
    total: {
      type: Number,
      default: 0
    },
    loading: {
      type: Boolean,
      default: false
    },
    // 自动首次加载
    immediate: {
      type: Boolean,
      default: true
    },
    // 表格基础样式
    rowKey: {
      type: [String, Function],
      default: 'id'
    },
    border: {
      type: Boolean,
      default: false
    },
    stripe: {
      type: Boolean,
      default: true
    },
    size: {
      type: String,
      default: 'small'
    },
    // 内置功能开关
    selection: {
      type: Boolean,
      default: false
    },
    reserveSelection: {
      type: Boolean,
      default: true
    },
    showIndex: {
      type: Boolean,
      default: false
    },
    showToolbar: {
      type: Boolean,
      default: true
    },
    showPagination: {
      type: Boolean,
      default: true
    },
    // 分页配置
    pageNum: {
      type: Number,
      default: 1
    },
    pageSize: {
      type: Number,
      default: 5
    },
    pageSizes: {
      type: Array,
      default: () => [5, 10, 20, 50]
    },
    paginationLayout: {
      type: String,
      default: 'total, sizes, prev, pager, next, jumper'
    }
  },
  data() {
    return {
      innerLoading: false,
      innerData: [],
      innerTotal: 0,
      innerPageNum: this.pageNum,
      innerPageSize: this.pageSize,
      tableSize: this.size,
      selectedRows: [],
      // 防止非第 1 页切换 pageSize 时触发两次请求
      isChangingSize: false,
      requestSeq: 0
    }
  },
  computed: {
    visibleColumns() {
      return this.columns.filter((col) => col.hidden !== true)
    },
    isRequestMode() {
      return typeof this.request === 'function'
    },
    mergedLoading() {
      return this.isRequestMode ? this.innerLoading : this.loading
    },
    mergedData() {
      return this.isRequestMode ? this.innerData : this.data
    },
    mergedTotal() {
      return this.isRequestMode ? this.innerTotal : this.total
    },
    // 过滤掉由本组件托管的事件，其余全部透传给 el-table
    tableListeners() {
      const listeners = { ...this.$listeners }
      delete listeners['selection-change']
      return listeners
    }
  },
  watch: {
    pageNum(val) {
      this.innerPageNum = val
    },
    pageSize(val) {
      this.innerPageSize = val
    },
    size(val) {
      this.tableSize = val
    }
  },
  mounted() {
    if (this.isRequestMode && this.immediate) {
      this.fetchData()
    }
  },
  methods: {
    formatEmpty(val) {
      return val === null || val === undefined || val === '' ? '—' : val
    },
    computeIndex(index) {
      return (this.innerPageNum - 1) * this.innerPageSize + index + 1
    },
    handleDensityChange(size) {
      this.tableSize = size
      this.doLayout()
    },
    handleSelectionChange(rows) {
      this.selectedRows = rows
      this.$emit('selection-change', rows)
    },

    // 核心：切换每页条数时加锁，避免 Element Pagination 自动修正页码引发重复请求
    handleSizeChange(size) {
      this.isChangingSize = true
      this.innerPageSize = size
      this.innerPageNum = 1
      this.$emit('update:pageSize', size)
      this.$emit('update:pageNum', 1)
      this.$emit('page-change', { pageNum: 1, pageSize: size })

      if (this.isRequestMode) {
        this.fetchData()
      }

      this.$nextTick(() => {
        this.isChangingSize = false
      })
    },

    handleCurrentChange(page) {
      if (this.isChangingSize) return
      this.innerPageNum = page
      this.$emit('update:pageNum', page)
      this.$emit('page-change', { pageNum: page, pageSize: this.innerPageSize })

      if (this.isRequestMode) {
        this.fetchData()
      }
    },

    async fetchData() {
      if (!this.isRequestMode) return
      const seq = ++this.requestSeq
      this.innerLoading = true
      try {
        const res = await this.request({
          pageNum: this.innerPageNum,
          pageSize: this.innerPageSize,
          ...this.params
        })
        // 丢弃过期慢请求，避免旧数据覆盖新结果
        if (seq !== this.requestSeq) return

        this.innerData = (res && res.list) || []
        this.innerTotal = (res && typeof res.total === 'number') ? res.total : 0

        // 数据更新后自动重排，避免 fixed 固定列错位
        this.doLayout()
      } catch (err) {
        this.$emit('request-error', err)
      } finally {
        if (seq === this.requestSeq) {
          this.innerLoading = false
        }
      }
    },

    /**
     * 对外暴露：重新加载数据
     * @param {Boolean} resetPage 是否重置回到第 1 页（常用于点击查询按钮）
     */
    reload(resetPage = false) {
      if (resetPage) {
        this.innerPageNum = 1
        this.$emit('update:pageNum', 1)
      }
      if (this.isRequestMode) {
        return this.fetchData()
      }
      this.$emit('page-change', {
        pageNum: this.innerPageNum,
        pageSize: this.innerPageSize
      })
    },

    /** 对外暴露：清空跨页勾选 */
    clearSelection() {
      this.$refs.elTable && this.$refs.elTable.clearSelection()
      this.selectedRows = []
    },

    /** 对外暴露：手动触发 el-table 重排 */
    doLayout() {
      this.$nextTick(() => {
        this.$refs.elTable && this.$refs.elTable.doLayout()
      })
    },

    /** 获取底层 el-table 实例，方便调用任意原生方法 */
    getTableRef() {
      return this.$refs.elTable
    }
  }
}
</script>

<style scoped lang="scss">
.pro-table {
  width: 100%;
}

.pro-table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 14px;
}

.toolbar-left {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.selection-banner {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12.5px;
  color: #1d4ed8;
  background: #eff6ff;
  border: 1px solid #dbeafe;
  padding: 2px 10px;
  border-radius: 6px;

  strong {
    font-weight: 700;
  }
}

.pro-table-pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

::v-deep .el-dropdown-menu__item.is-active-density {
  color: #409eff;
  font-weight: 600;
}
</style>
