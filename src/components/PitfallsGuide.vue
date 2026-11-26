<template>
  <div class="pitfalls-page">
    <!-- 顶部概览横幅 -->
    <div class="pitfalls-hero">
      <div class="hero-main">
        <div class="hero-badges">
          <span class="version-badge">Vue 2.7.16</span>
          <span class="version-badge">Element UI 2.15.14</span>
          <span class="version-badge">Vite 5</span>
        </div>
        <h2 class="hero-title">Vue 2.7 + Element UI 避坑指南</h2>
        <p class="hero-desc">
          汇总 GitHub Issues 与社区实战中针对当前项目技术栈（Vue 2.7 LTS + Element UI 2.15.14 + Vite 5）最高频的踩坑点、底层原因及可直接复制的推荐解法。
        </p>
      </div>

      <div class="hero-stats">
        <div class="stat-box">
          <div class="stat-num">{{ allPitfalls.length }}</div>
          <div class="stat-label">精选坑点</div>
        </div>
        <div class="stat-box">
          <div class="stat-num danger">{{ highCount }}</div>
          <div class="stat-label">高频必踩</div>
        </div>
        <div class="stat-box">
          <div class="stat-num warning">{{ compatCount }}</div>
          <div class="stat-label">版本专属</div>
        </div>
      </div>
    </div>

    <!-- 筛选与搜索工具条 -->
    <div class="filter-bar">
      <div class="category-pills">
        <button
          v-for="cat in categories"
          :key="cat.id"
          type="button"
          class="cat-pill"
          :class="{ active: activeCategory === cat.id }"
          @click="activeCategory = cat.id"
        >
          <i :class="cat.icon" />
          <span>{{ cat.label }}</span>
          <span class="cat-count">{{ getCategoryCount(cat.id) }}</span>
        </button>
      </div>

      <div class="filter-controls">
        <el-select
          v-model="severityFilter"
          size="small"
          placeholder="全部级别"
          style="width: 122px;"
        >
          <el-option label="全部级别" value="all" />
          <el-option label="高频必踩" value="high" />
          <el-option label="版本专属" value="compat" />
          <el-option label="隐蔽易错" value="tricky" />
        </el-select>

        <el-input
          v-model="searchQuery"
          size="small"
          clearable
          prefix-icon="el-icon-search"
          placeholder="搜索关键词（如 resetFields、YYYY、fixed、v-deep）..."
          class="search-input"
        />

        <el-button size="small" plain @click="toggleExpandAll">
          {{ allExpanded ? '全部收起' : '全部展开' }}
        </el-button>
      </div>
    </div>

    <!-- 坑点列表 -->
    <div v-if="filteredList.length > 0" class="pitfall-list">
      <article
        v-for="(item, idx) in filteredList"
        :key="item.id"
        :id="`pitfall-${item.id}`"
        class="pitfall-card"
        :class="{ expanded: isExpanded(item.id), highlighted: highlightedId === item.id }"
      >
        <!-- 卡片头部（可点击展开/收起） -->
        <div class="card-header" @click="toggleCard(item.id)">
          <div class="card-header-left">
            <span class="card-index">{{ String(idx + 1).padStart(2, '0') }}</span>
            <div class="card-title-block">
              <div class="card-title-row">
                <el-tag
                  size="mini"
                  :type="severityMeta[item.severity].color"
                  effect="plain"
                  class="severity-tag"
                >
                  {{ severityMeta[item.severity].label }}
                </el-tag>
                <h3 class="card-title">{{ item.title }}</h3>
              </div>
              <p class="card-summary">{{ item.summary }}</p>
            </div>
          </div>

          <div class="card-header-right">
            <div class="component-tags" @click.stop>
              <button
                v-for="comp in item.components"
                :key="comp.docSlug"
                type="button"
                class="doc-jump-tag"
                :title="`查看本地 ${comp.label} 官方文档`"
                @click="$emit('open-doc', comp.docSlug)"
              >
                <i class="el-icon-reading" />
                <span>{{ comp.label }}</span>
              </button>
            </div>
            <span class="expand-arrow">
              <i :class="isExpanded(item.id) ? 'el-icon-arrow-up' : 'el-icon-arrow-down'" />
            </span>
          </div>
        </div>

        <!-- 展开详情区 -->
        <div v-if="isExpanded(item.id)" class="card-detail">
          <div class="detail-meta">
            <span><i class="el-icon-collection-tag" /> 来源参考：{{ item.source }}</span>
          </div>

          <div class="analysis-grid">
            <div class="analysis-box symptom">
              <div class="analysis-label">
                <i class="el-icon-warning-outline" /> 问题现象
              </div>
              <p v-html="formatInlineCode(item.symptom)"></p>
            </div>
            <div class="analysis-box cause">
              <div class="analysis-label">
                <i class="el-icon-search" /> 底层原因
              </div>
              <p v-html="formatInlineCode(item.cause)"></p>
            </div>
          </div>

          <!-- 错误写法 vs 推荐方案对比 -->
          <div class="code-compare">
            <div class="code-pane bad">
              <div class="code-pane-head">
                <span class="pane-badge bad"><i class="el-icon-close" /> 容易踩坑的写法</span>
              </div>
              <pre><code class="hljs" v-html="highlight(item.badCode)"></code></pre>
            </div>

            <div class="code-pane good">
              <div class="code-pane-head">
                <span class="pane-badge good"><i class="el-icon-check" /> 推荐解决方案</span>
                <button
                  type="button"
                  class="copy-code-btn"
                  :class="{ copied: copiedId === item.id }"
                  @click="copySolution(item)"
                >
                  <i :class="copiedId === item.id ? 'el-icon-check' : 'el-icon-document-copy'" />
                  <span>{{ copiedId === item.id ? '已复制' : '复制方案' }}</span>
                </button>
              </div>
              <pre><code class="hljs" v-html="highlight(item.goodCode)"></code></pre>
            </div>
          </div>

          <div v-if="item.tips" class="pitfall-tip">
            <i class="el-icon-sunny" />
            <span><strong>实战建议：</strong>{{ item.tips }}</span>
          </div>
        </div>
      </article>
    </div>

    <div v-else class="empty-wrap">
      <el-empty description="没有找到匹配的踩坑记录，请尝试更换关键词">
        <el-button size="small" type="primary" plain @click="resetFilters">重置筛选条件</el-button>
      </el-empty>
    </div>
  </div>
</template>

<script>
import hljs from 'highlight.js/lib/core'
import xml from 'highlight.js/lib/languages/xml'
import javascript from 'highlight.js/lib/languages/javascript'
import css from 'highlight.js/lib/languages/css'
import scss from 'highlight.js/lib/languages/scss'
import { PITFALL_CATEGORIES, SEVERITY_META, PITFALLS_LIST } from '../data/pitfalls.js'

hljs.registerLanguage('xml', xml)
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('css', css)
hljs.registerLanguage('scss', scss)

export default {
  name: 'PitfallsGuide',
  data() {
    return {
      categories: PITFALL_CATEGORIES,
      severityMeta: SEVERITY_META,
      allPitfalls: PITFALLS_LIST,
      activeCategory: 'all',
      severityFilter: 'all',
      searchQuery: '',
      expandedIds: [PITFALLS_LIST[0].id, PITFALLS_LIST[5].id],
      copiedId: '',
      highlightedId: ''
    }
  },
  computed: {
    highCount() {
      return this.allPitfalls.filter((p) => p.severity === 'high').length
    },
    compatCount() {
      return this.allPitfalls.filter((p) => p.severity === 'compat').length
    },
    filteredList() {
      const q = this.searchQuery.trim().toLowerCase()
      return this.allPitfalls.filter((item) => {
        if (this.activeCategory !== 'all' && item.category !== this.activeCategory) {
          return false
        }
        if (this.severityFilter !== 'all' && item.severity !== this.severityFilter) {
          return false
        }
        if (!q) return true
        const haystack = [
          item.title,
          item.summary,
          item.symptom,
          item.cause,
          item.badCode,
          item.goodCode,
          item.tips,
          ...item.components.map((c) => `${c.label} ${c.docSlug}`)
        ]
          .join(' ')
          .toLowerCase()
        return haystack.includes(q)
      })
    },
    allExpanded() {
      return (
        this.filteredList.length > 0 &&
        this.filteredList.every((item) => this.expandedIds.includes(item.id))
      )
    }
  },
  methods: {
    getCategoryCount(catId) {
      if (catId === 'all') return this.allPitfalls.length
      return this.allPitfalls.filter((item) => item.category === catId).length
    },
    isExpanded(id) {
      return this.expandedIds.includes(id)
    },
    toggleCard(id) {
      const idx = this.expandedIds.indexOf(id)
      if (idx > -1) {
        this.expandedIds.splice(idx, 1)
      } else {
        this.expandedIds.push(id)
      }
    },
    toggleExpandAll() {
      if (this.allExpanded) {
        this.expandedIds = []
      } else {
        this.expandedIds = this.filteredList.map((item) => item.id)
      }
    },
    resetFilters() {
      this.activeCategory = 'all'
      this.severityFilter = 'all'
      this.searchQuery = ''
    },
    focusPitfall(id) {
      this.activeCategory = 'all'
      this.severityFilter = 'all'
      this.searchQuery = ''
      if (!this.expandedIds.includes(id)) {
        this.expandedIds.push(id)
      }
      this.highlightedId = id
      this.$nextTick(() => {
        const el = document.getElementById(`pitfall-${id}`)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
        setTimeout(() => {
          if (this.highlightedId === id) this.highlightedId = ''
        }, 2200)
      })
    },
    highlight(code) {
      try {
        return hljs.highlightAuto(code, ['xml', 'javascript', 'css', 'scss']).value
      } catch (_) {
        return code.replace(/</g, '&lt;').replace(/>/g, '&gt;')
      }
    },
    formatInlineCode(text) {
      return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    },
    async copySolution(item) {
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(item.goodCode)
        }
        this.copiedId = item.id
        this.$message.success('推荐代码已复制到剪贴板')
        setTimeout(() => {
          if (this.copiedId === item.id) this.copiedId = ''
        }, 1800)
      } catch (_) {
        this.$message.error('复制失败，请手动选中复制')
      }
    }
  }
}
</script>

<style scoped lang="scss">
.pitfalls-page {
  padding-bottom: 24px;
}

.pitfalls-hero {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  padding: 26px 30px;
  background: linear-gradient(135deg, #ffffff 0%, #fffaf2 55%, #f0f7ff 100%);
  border: 1px solid #e6eaf2;
  border-radius: 16px;
  margin-bottom: 20px;
  box-shadow: var(--app-shadow-xs);
}

.hero-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 10px;
}

.version-badge {
  font-size: 11.5px;
  font-weight: 600;
  color: #2563eb;
  background: #eff6ff;
  border: 1px solid #dbeafe;
  padding: 2px 9px;
  border-radius: 999px;
  font-family: Menlo, Monaco, Consolas, monospace;
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
  max-width: 720px;
}

.hero-stats {
  display: flex;
  gap: 12px;
  flex-shrink: 0;
}

.stat-box {
  min-width: 82px;
  text-align: center;
  padding: 12px 14px;
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid #e6eaf2;
  border-radius: 12px;
}

.stat-num {
  font-size: 22px;
  font-weight: 700;
  color: #1e293b;
  line-height: 1.2;

  &.danger {
    color: #ef4444;
  }

  &.warning {
    color: #d97706;
  }
}

.stat-label {
  font-size: 11.5px;
  color: #64748b;
  margin-top: 4px;
}

/* 筛选条 */
.filter-bar {
  background: #ffffff;
  border: 1px solid var(--app-border);
  border-radius: 12px;
  padding: 14px 16px;
  margin-bottom: 18px;
  box-shadow: var(--app-shadow-xs);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.category-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.cat-pill {
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  color: #475569;
  font-size: 13px;
  font-weight: 500;
  padding: 6px 12px;
  border-radius: 8px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.15s ease;

  &:hover {
    border-color: #93c5fd;
    color: #2563eb;
    background: #f0f7ff;
  }

  &.active {
    background: #2563eb;
    border-color: #2563eb;
    color: #ffffff;

    .cat-count {
      background: rgba(255, 255, 255, 0.22);
      color: #ffffff;
    }
  }
}

.cat-count {
  font-size: 11px;
  background: #e2e8f0;
  color: #475569;
  padding: 0 6px;
  border-radius: 999px;
  line-height: 18px;
}

.filter-controls {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.search-input {
  flex: 1;
  min-width: 240px;
}

/* 坑点卡片 */
.pitfall-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.pitfall-card {
  background: #ffffff;
  border: 1px solid var(--app-border);
  border-radius: 12px;
  box-shadow: var(--app-shadow-xs);
  overflow: hidden;
  transition: border-color 0.18s ease, box-shadow 0.18s ease;

  &:hover {
    border-color: #cbd8ec;
  }

  &.expanded {
    border-color: #bfdbfe;
    box-shadow: var(--app-shadow-sm);
  }

  &.highlighted {
    border-color: #409eff;
    box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.2);
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  cursor: pointer;
  user-select: none;
  background: #ffffff;
  transition: background-color 0.14s ease;

  &:hover {
    background: #fafcff;
  }
}

.card-header-left {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  min-width: 0;
  flex: 1;
}

.card-index {
  font-family: Menlo, Monaco, Consolas, monospace;
  font-size: 12.5px;
  font-weight: 700;
  color: #64748b;
  background: #f1f5f9;
  border-radius: 7px;
  padding: 4px 8px;
  flex-shrink: 0;
  margin-top: 1px;
}

.card-title-block {
  min-width: 0;
  flex: 1;
}

.card-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.severity-tag {
  flex-shrink: 0;
}

.card-title {
  font-size: 15.5px;
  font-weight: 600;
  color: #111827;
  margin: 0;
  line-height: 1.45;
}

.card-summary {
  font-size: 13px;
  color: #64748b;
  margin: 5px 0 0;
  line-height: 1.6;
}

.card-header-right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.component-tags {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.doc-jump-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #2563eb;
  background: #eff6ff;
  border: 1px solid #dbeafe;
  padding: 3px 9px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.14s ease;

  &:hover {
    background: #2563eb;
    border-color: #2563eb;
    color: #ffffff;
  }
}

.expand-arrow {
  width: 28px;
  height: 28px;
  border-radius: 7px;
  background: #f8fafc;
  color: #64748b;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
}

/* 展开内容区 */
.card-detail {
  padding: 0 20px 20px;
  border-top: 1px solid #eff2f7;
  background: #fcfdff;
}

.detail-meta {
  padding: 12px 0;
  font-size: 12px;
  color: #94a3b8;
}

.analysis-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin-bottom: 16px;
}

.analysis-box {
  padding: 14px 16px;
  border-radius: 10px;
  border: 1px solid #e6eaf2;
  background: #ffffff;

  &.symptom {
    border-left: 3px solid #f59e0b;
  }

  &.cause {
    border-left: 3px solid #3b82f6;
  }

  p {
    font-size: 13.5px;
    color: #334155;
    line-height: 1.75;
    margin: 6px 0 0;
  }

  ::v-deep code {
    background: #f1f5f9;
    border: 1px solid #e2e8f0;
    padding: 1px 5px;
    border-radius: 4px;
    font-size: 12px;
    color: #1e293b;
    font-family: "JetBrains Mono", Menlo, Monaco, Consolas, monospace;
  }
}

.analysis-label {
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 6px;
}

/* 代码对比 */
.code-compare {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin-bottom: 14px;
}

.code-pane {
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  display: flex;
  flex-direction: column;

  &.bad {
    border-color: #fecaca;
  }

  &.good {
    border-color: #bbf7d0;
  }

  pre {
    margin: 0;
    flex: 1;
    overflow-x: auto;
    background: #f8fafc;
  }

  code.hljs {
    display: block;
    padding: 14px 16px;
    font-size: 12.5px;
    line-height: 1.7;
    background: #f8fafc;
    font-family: "JetBrains Mono", Menlo, Monaco, Consolas, monospace;
  }
}

.code-pane-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid #edf0f7;
  background: #ffffff;
}

.pane-badge {
  font-size: 12px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 5px;

  &.bad {
    color: #dc2626;
  }

  &.good {
    color: #15803d;
  }
}

.copy-code-btn {
  border: 1px solid #e2e8f0;
  background: #ffffff;
  color: #475569;
  font-size: 11.5px;
  padding: 3px 9px;
  border-radius: 6px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
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

.pitfall-tip {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 14px;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 8px;
  font-size: 13px;
  color: #0369a1;
  line-height: 1.65;

  i {
    font-size: 15px;
    margin-top: 2px;
    flex-shrink: 0;
  }
}

.empty-wrap {
  background: #ffffff;
  border: 1px solid var(--app-border);
  border-radius: 12px;
  padding: 36px 20px;
}

@media (max-width: 1024px) {
  .pitfalls-hero {
    flex-direction: column;
    align-items: flex-start;
  }

  .analysis-grid,
  .code-compare {
    grid-template-columns: 1fr;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .card-header-right {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
