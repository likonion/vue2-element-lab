<template>
  <transition name="palette-fade">
    <div v-if="visible" class="palette-backdrop" @click.self="close">
      <div class="palette-dialog" @keydown.stop="handleKeydown">
        <div class="palette-input-wrap">
          <i class="el-icon-search palette-search-icon" />
          <input
            ref="searchInput"
            v-model="query"
            type="text"
            class="palette-input"
            placeholder="搜索组件文档或避坑指南（如 table / resetFields / YYYY / v-deep）..."
          />
          <button v-if="query" class="palette-clear" @click="query = ''" title="清空">
            <i class="el-icon-close" />
          </button>
          <span class="palette-kbd">ESC</span>
        </div>

        <div class="palette-list" ref="listRef">
          <template v-if="results.length > 0">
            <div
              v-for="(item, idx) in results"
              :key="item.key"
              class="palette-item"
              :class="{ active: idx === activeIndex }"
              @mouseenter="activeIndex = idx"
              @click="selectItem(item)"
            >
              <div class="palette-item-left">
                <span
                  class="palette-item-group"
                  :class="{ pitfall: item.kind === 'pitfall', pattern: item.kind === 'pattern' }"
                >
                  {{ item.group }}
                </span>
                <span class="palette-item-title">{{ item.title }}</span>
              </div>
              <div class="palette-item-right">
                <span class="palette-item-path">{{ item.hint }}</span>
                <i v-if="idx === activeIndex" class="el-icon-right palette-enter-icon" />
              </div>
            </div>
          </template>
          <div v-else class="palette-empty">
            <i class="el-icon-document-delete" />
            <p>没有找到与 “{{ query }}” 匹配的文档或坑点</p>
          </div>
        </div>

        <div class="palette-footer">
          <span><kbd>↑</kbd> <kbd>↓</kbd> 选择</span>
          <span><kbd>↵</kbd> 跳转</span>
          <span><kbd>ESC</kbd> 关闭</span>
          <span class="palette-count">共 {{ results.length }} 项（含文档与避坑）</span>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import { getFlatNavItems } from '../nav.config.js'
import { PITFALLS_LIST } from '../../data/pitfalls.js'

export default {
  name: 'CommandPalette',
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    const docEntries = getFlatNavItems().map((item) => ({
      key: `doc-${item.slug}`,
      kind: 'doc',
      slug: item.slug,
      group: item.group,
      title: item.title,
      hint: `/${item.slug}`,
      searchText: `${item.title} ${item.slug} ${item.group}`.toLowerCase()
    }))

    const pitfallEntries = PITFALLS_LIST.map((p) => ({
      key: `pitfall-${p.id}`,
      kind: 'pitfall',
      id: p.id,
      group: '避坑指南',
      title: p.title,
      hint: p.components.map((c) => c.docSlug).join(', '),
      searchText: `${p.title} ${p.summary} ${p.symptom} ${p.cause} ${p.components
        .map((c) => `${c.label} ${c.docSlug}`)
        .join(' ')}`.toLowerCase()
    }))

    const patternEntries = [
      {
        key: 'pattern-dialog',
        kind: 'pattern',
        pattern: 'dialog',
        group: '组件封装',
        title: '独立 Dialog 弹窗封装（ref 调用 + $options.data() 终极重置法）',
        hint: 'BestPracticeDialog',
        searchText: 'dialog 弹窗 封装 ref $options.data 重置 动画 bestpracticedialog adddialog'
      },
      {
        key: 'pattern-table',
        kind: 'pattern',
        pattern: 'table',
        group: '组件封装',
        title: 'ProTable 通用表格封装（内置分页 + 跨页多选 + 防重请求）',
        hint: 'ProTable',
        searchText: 'table 表格 分页 pagination protable 封装 跨页勾选 dolayout'
      }
    ]

    return {
      query: '',
      activeIndex: 0,
      docEntries,
      pitfallEntries,
      patternEntries
    }
  },
  computed: {
    results() {
      const q = this.query.trim().toLowerCase()
      if (!q) return [...this.patternEntries, ...this.docEntries]
      const matchedPatterns = this.patternEntries.filter((item) => item.searchText.includes(q))
      const matchedDocs = this.docEntries.filter((item) => item.searchText.includes(q))
      const matchedPitfalls = this.pitfallEntries.filter((item) => item.searchText.includes(q))
      return [...matchedPatterns, ...matchedDocs, ...matchedPitfalls]
    }
  },
  watch: {
    visible(val) {
      if (val) {
        this.query = ''
        this.activeIndex = 0
        this.$nextTick(() => {
          this.$refs.searchInput && this.$refs.searchInput.focus()
        })
      }
    },
    query() {
      this.activeIndex = 0
    }
  },
  methods: {
    close() {
      this.$emit('update:visible', false)
    },
    selectItem(item) {
      if (item.kind === 'pitfall') {
        this.$emit('select-pitfall', item.id)
      } else if (item.kind === 'pattern') {
        this.$emit('select-pattern', item.pattern)
      } else {
        this.$emit('select', item.slug)
      }
      this.close()
    },
    handleKeydown(e) {
      if (e.key === 'Escape') {
        this.close()
        return
      }
      if (!this.results.length) return

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        this.activeIndex = (this.activeIndex + 1) % this.results.length
        this.scrollActiveIntoView()
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        this.activeIndex = (this.activeIndex - 1 + this.results.length) % this.results.length
        this.scrollActiveIntoView()
      } else if (e.key === 'Enter') {
        e.preventDefault()
        const target = this.results[this.activeIndex]
        if (target) this.selectItem(target)
      }
    },
    scrollActiveIntoView() {
      this.$nextTick(() => {
        const list = this.$refs.listRef
        if (!list) return
        const activeEl = list.querySelector('.palette-item.active')
        if (activeEl) {
          activeEl.scrollIntoView({ block: 'nearest' })
        }
      })
    }
  }
}
</script>

<style scoped lang="scss">
.palette-backdrop {
  position: fixed;
  inset: 0;
  z-index: 2500;
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 11vh;
}

.palette-dialog {
  width: 640px;
  max-width: calc(100vw - 32px);
  background: #ffffff;
  border-radius: 14px;
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.22), 0 0 0 1px rgba(15, 23, 42, 0.06);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.palette-input-wrap {
  display: flex;
  align-items: center;
  padding: 14px 18px;
  border-bottom: 1px solid #eef1f6;
  gap: 10px;
}

.palette-search-icon {
  font-size: 18px;
  color: #409eff;
}

.palette-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 15px;
  color: #1a202c;
  background: transparent;

  &::placeholder {
    color: #94a3b8;
  }
}

.palette-clear {
  border: none;
  background: #f1f5f9;
  color: #64748b;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;

  &:hover {
    background: #e2e8f0;
    color: #1e293b;
  }
}

.palette-kbd {
  font-size: 11px;
  color: #94a3b8;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  padding: 2px 6px;
  border-radius: 5px;
  font-family: Menlo, Monaco, Consolas, monospace;
}

.palette-list {
  max-height: 400px;
  overflow-y: auto;
  padding: 8px;
}

.palette-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.12s;

  &.active {
    background: #ecf5ff;

    .palette-item-title {
      color: #2563eb;
      font-weight: 600;
    }

    .palette-item-group:not(.pitfall) {
      background: #dbeafe;
      color: #1d4ed8;
    }
  }
}

.palette-item-left {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  flex: 1;
}

.palette-item-group {
  font-size: 11px;
  font-weight: 500;
  color: #64748b;
  background: #f1f5f9;
  padding: 2px 7px;
  border-radius: 5px;
  white-space: nowrap;
  flex-shrink: 0;

  &.pitfall {
    color: #b45309;
    background: #fef3c7;
  }

  &.pattern {
    color: #059669;
    background: #d1fae5;
  }
}

.palette-item-title {
  font-size: 13.5px;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.palette-item-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.palette-item-path {
  font-size: 12px;
  color: #94a3b8;
  font-family: Menlo, Monaco, Consolas, monospace;
}

.palette-enter-icon {
  color: #409eff;
  font-size: 14px;
}

.palette-empty {
  padding: 44px 20px;
  text-align: center;
  color: #94a3b8;

  i {
    font-size: 32px;
    margin-bottom: 8px;
  }

  p {
    font-size: 13.5px;
    margin: 0;
  }
}

.palette-footer {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 10px 16px;
  background: #f8fafc;
  border-top: 1px solid #eef1f6;
  font-size: 12px;
  color: #64748b;

  kbd {
    display: inline-block;
    padding: 1px 5px;
    font-size: 11px;
    background: #fff;
    border: 1px solid #dce1ea;
    border-radius: 4px;
    box-shadow: 0 1px 0 #dce1ea;
    font-family: Menlo, Monaco, Consolas, monospace;
    color: #475569;
  }
}

.palette-count {
  margin-left: auto;
  color: #94a3b8;
}

.palette-fade-enter-active,
.palette-fade-leave-active {
  transition: opacity 0.16s ease;
}

.palette-fade-enter,
.palette-fade-leave-to {
  opacity: 0;
}
</style>
