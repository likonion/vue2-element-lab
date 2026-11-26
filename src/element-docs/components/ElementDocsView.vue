<template>
  <div class="element-docs-shell">
    <!-- 左侧组件目录栏 -->
    <aside class="docs-sidebar">
      <div class="sidebar-search">
        <el-input
          v-model="searchQuery"
          placeholder="筛选目录（如 button / 表格）"
          prefix-icon="el-icon-search"
          size="small"
          clearable
        />
        <div class="sidebar-stats">
          <span>官方目录 · {{ flatItems.length }} 页</span>
          <span v-if="searchQuery.trim()" class="match-count">匹配 {{ filteredCount }}</span>
        </div>
      </div>

      <div ref="sidebarScroll" class="sidebar-nav-scroll">
        <template v-if="filteredSections.length > 0">
          <div v-for="section in filteredSections" :key="section.name" class="nav-section">
            <!-- 顶层直接链接 (更新日志) -->
            <div
              v-if="section.path"
              class="nav-item nav-top-item"
              :class="{ active: currentSlug === section.path.slice(1) }"
              :data-slug="section.path.slice(1)"
              @click="selectPage(section.path.slice(1))"
            >
              <i class="el-icon-time nav-item-icon" />
              <span>{{ section.name }}</span>
            </div>

            <!-- 带 children 的分类 (开发指南) -->
            <template v-else-if="section.children">
              <div class="nav-section-header">
                <span>{{ section.name }}</span>
                <span class="nav-count">{{ section.children.length }}</span>
              </div>
              <ul class="nav-list">
                <li
                  v-for="item in section.children"
                  :key="item.path"
                  class="nav-item"
                  :class="{ active: currentSlug === item.path.slice(1) }"
                  :data-slug="item.path.slice(1)"
                  @click="selectPage(item.path.slice(1))"
                >
                  {{ item.name }}
                </li>
              </ul>
            </template>

            <!-- 带 groups 的分类 (组件) -->
            <template v-else-if="section.groups">
              <div class="nav-section-header">
                <span>{{ section.name }}</span>
              </div>
              <div v-for="group in section.groups" :key="group.groupName" class="nav-group">
                <div class="nav-group-title">
                  <span>{{ group.groupName }}</span>
                  <span class="nav-group-count">{{ group.list.length }}</span>
                </div>
                <ul class="nav-list">
                  <li
                    v-for="item in group.list"
                    :key="item.path"
                    class="nav-item"
                    :class="{ active: currentSlug === item.path.slice(1) }"
                    :data-slug="item.path.slice(1)"
                    @click="selectPage(item.path.slice(1))"
                  >
                    {{ item.title }}
                  </li>
                </ul>
              </div>
            </template>
          </div>
        </template>
        <div v-else class="nav-empty">
          <el-empty description="未找到匹配的组件" :image-size="60" />
        </div>
      </div>
    </aside>

    <!-- 中间正文滚动区（保留 .page-component__scroll .el-scrollbar__wrap 以兼容官方 Backtop 示例） -->
    <div class="docs-main page-component page-component__scroll">
      <div
        ref="contentScroll"
        class="docs-scroll-wrap el-scrollbar__wrap"
        @scroll="handleContentScroll"
        @click="handleContentClick"
      >
        <div class="docs-content-grid">
          <div class="docs-article-column">
            <!-- 页面顶部元信息条 -->
            <div class="docs-meta-bar">
              <div class="meta-left">
                <span class="meta-group">{{ currentMeta.group }}</span>
                <i class="el-icon-arrow-right meta-sep" />
                <span class="meta-title">{{ currentMeta.title }}</span>
              </div>
              <div class="meta-actions">
                <button type="button" class="meta-action-btn" @click="copyRouteHash" title="复制页面路径">
                  <i class="el-icon-document-copy" />
                  <span>/{{ currentSlug }}</span>
                </button>
                <a
                  :href="`https://element.eleme.cn/#/zh-CN/component/${currentSlug}`"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="meta-action-btn primary"
                >
                  <i class="el-icon-top-right" />
                  <span>官方原页</span>
                </a>
              </div>
            </div>

            <div v-if="loading" class="docs-loading">
              <el-skeleton :rows="8" animated />
            </div>

            <div v-else-if="loadError" class="docs-error">
              <el-alert :title="loadError" type="error" show-icon :closable="false" />
            </div>

            <div v-else ref="docBody" class="docs-body">
              <component :is="currentComponent" :key="currentSlug" />

              <!-- 上一篇 / 下一篇卡片导航 -->
              <div class="docs-footer-nav">
                <div
                  v-if="prevItem"
                  class="footer-nav-card prev"
                  @click="selectPage(prevItem.slug)"
                >
                  <span class="footer-nav-label"><i class="el-icon-arrow-left" /> 上一篇</span>
                  <span class="footer-nav-title">{{ prevItem.title }}</span>
                </div>
                <div v-else></div>

                <div
                  v-if="nextItem"
                  class="footer-nav-card next"
                  @click="selectPage(nextItem.slug)"
                >
                  <span class="footer-nav-label">下一篇 <i class="el-icon-arrow-right" /></span>
                  <span class="footer-nav-title">{{ nextItem.title }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 右侧本页目录 (TOC) -->
          <aside v-if="tocItems.length > 0 && !loading" class="docs-toc">
            <div class="toc-sticky">
              <div class="toc-header">本页目录</div>
              <ul class="toc-list">
                <li
                  v-for="(heading, idx) in tocItems"
                  :key="heading.id"
                  class="toc-item"
                  :class="{ active: activeTocId === heading.id }"
                  @click="scrollToHeading(heading.id)"
                >
                  {{ heading.text }}
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </div>

      <!-- 悬浮回到顶部 -->
      <transition name="el-fade-in">
        <button
          v-show="showBackTop"
          type="button"
          class="floating-backtop"
          title="回到顶部"
          @click="scrollToTop(true)"
        >
          <i class="el-icon-top" />
        </button>
      </transition>
    </div>
  </div>
</template>

<script>
import { navConfig, getFlatNavItems } from '../nav.config.js'

const docModules = import.meta.glob('../docs/zh-CN/*.md')

function getSlugFromHash() {
  const hash = window.location.hash || ''
  const match = hash.match(/#\/(?:zh-CN\/)?component\/([a-zA-Z0-9-]+)/)
  return match ? match[1] : ''
}

export default {
  name: 'ElementDocsView',
  data() {
    const flatItems = getFlatNavItems()
    const validSlugs = new Set(flatItems.map((item) => item.slug))
    const hashSlug = getSlugFromHash()
    const initialSlug = validSlugs.has(hashSlug) ? hashSlug : 'installation'

    return {
      navConfig,
      flatItems,
      validSlugs,
      searchQuery: '',
      currentSlug: initialSlug,
      currentComponent: null,
      loading: false,
      loadError: '',
      tocItems: [],
      activeTocId: '',
      showBackTop: false
    }
  },
  computed: {
    filteredSections() {
      const q = this.searchQuery.trim().toLowerCase()
      if (!q) return this.navConfig

      const result = []
      this.navConfig.forEach((section) => {
        if (section.path) {
          if (
            section.name.toLowerCase().includes(q) ||
            section.path.toLowerCase().includes(q)
          ) {
            result.push(section)
          }
        } else if (section.children) {
          const matched = section.children.filter(
            (item) =>
              item.name.toLowerCase().includes(q) || item.path.toLowerCase().includes(q)
          )
          if (matched.length) {
            result.push({ ...section, children: matched })
          }
        } else if (section.groups) {
          const matchedGroups = []
          section.groups.forEach((group) => {
            const matchedList = group.list.filter(
              (item) =>
                item.title.toLowerCase().includes(q) ||
                item.path.toLowerCase().includes(q) ||
                group.groupName.toLowerCase().includes(q)
            )
            if (matchedList.length) {
              matchedGroups.push({ ...group, list: matchedList })
            }
          })
          if (matchedGroups.length) {
            result.push({ ...section, groups: matchedGroups })
          }
        }
      })
      return result
    },
    filteredCount() {
      let count = 0
      this.filteredSections.forEach((section) => {
        if (section.path) count += 1
        else if (section.children) count += section.children.length
        else if (section.groups) {
          section.groups.forEach((g) => {
            count += g.list.length
          })
        }
      })
      return count
    },
    currentIndex() {
      return this.flatItems.findIndex((item) => item.slug === this.currentSlug)
    },
    currentMeta() {
      return (
        this.flatItems[this.currentIndex] || {
          slug: this.currentSlug,
          title: this.currentSlug,
          group: '组件'
        }
      )
    },
    prevItem() {
      return this.currentIndex > 0 ? this.flatItems[this.currentIndex - 1] : null
    },
    nextItem() {
      return this.currentIndex >= 0 && this.currentIndex < this.flatItems.length - 1
        ? this.flatItems[this.currentIndex + 1]
        : null
    }
  },
  created() {
    this.loadDoc(this.currentSlug)
  },
  mounted() {
    window.addEventListener('hashchange', this.handleHashChange)
  },
  beforeDestroy() {
    window.removeEventListener('hashchange', this.handleHashChange)
  },
  methods: {
    handleHashChange() {
      const slug = getSlugFromHash()
      if (slug && this.validSlugs.has(slug) && slug !== this.currentSlug) {
        this.currentSlug = slug
        this.loadDoc(slug)
        this.scrollSidebarToActive()
      }
    },
    selectPage(slug) {
      if (!this.validSlugs.has(slug)) return
      const targetHash = `#/zh-CN/component/${slug}`
      if (window.location.hash !== targetHash) {
        window.location.hash = targetHash
      }
      if (this.currentSlug !== slug) {
        this.currentSlug = slug
        this.loadDoc(slug)
        this.scrollSidebarToActive()
      } else {
        this.scrollToTop(true)
      }
    },
    async loadDoc(slug) {
      this.loadError = ''
      this.tocItems = []
      this.activeTocId = ''

      if (slug === 'changelog') {
        this.loading = true
        try {
          const mod = await import('./ChangelogPage.vue')
          this.currentComponent = mod.default || mod
          this.scrollToTop(false)
        } catch (err) {
          this.loadError = `加载更新日志失败：${err.message || err}`
        } finally {
          this.loading = false
        }
        return
      }

      const key = `../docs/zh-CN/${slug}.md`
      const loader = docModules[key]
      if (!loader) {
        this.loadError = `未找到文档模块：${slug}`
        this.currentComponent = null
        return
      }

      this.loading = true
      try {
        const mod = await loader()
        this.currentComponent = mod.default || mod
        this.scrollToTop(false)
        this.$nextTick(() => {
          this.extractToc()
        })
      } catch (err) {
        console.error('[ElementDocsView] Failed to load doc:', slug, err)
        this.loadError = `加载文档 ${slug} 失败：${err.message || err}`
        this.currentComponent = null
      } finally {
        this.loading = false
      }
    },
    extractToc() {
      const body = this.$refs.docBody
      if (!body) {
        this.tocItems = []
        return
      }
      const headings = Array.from(body.querySelectorAll('.element-doc > h3'))
      this.tocItems = headings.map((el, idx) => {
        const id = `doc-heading-${idx}`
        el.setAttribute('id', id)
        return {
          id,
          text: el.textContent.trim()
        }
      })
      this.activeTocId = this.tocItems.length ? this.tocItems[0].id : ''
    },
    scrollToHeading(id) {
      const container = this.$refs.contentScroll
      const target = this.$refs.docBody && this.$refs.docBody.querySelector(`#${id}`)
      if (!container || !target) return
      const containerTop = container.getBoundingClientRect().top
      const targetTop = target.getBoundingClientRect().top
      const top = container.scrollTop + (targetTop - containerTop) - 20
      container.scrollTo({ top, behavior: 'smooth' })
      this.activeTocId = id
    },
    handleContentScroll() {
      const container = this.$refs.contentScroll
      if (!container) return
      this.showBackTop = container.scrollTop > 320

      if (!this.tocItems.length || !this.$refs.docBody) return
      const containerTop = container.getBoundingClientRect().top
      let active = this.tocItems[0].id
      for (const item of this.tocItems) {
        const el = this.$refs.docBody.querySelector(`#${item.id}`)
        if (!el) continue
        if (el.getBoundingClientRect().top - containerTop <= 110) {
          active = item.id
        } else {
          break
        }
      }
      this.activeTocId = active
    },
    scrollSidebarToActive() {
      this.$nextTick(() => {
        const sidebar = this.$refs.sidebarScroll
        if (!sidebar) return
        const activeEl = sidebar.querySelector(`[data-slug="${this.currentSlug}"]`)
        if (activeEl) {
          activeEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
        }
      })
    },
    scrollToTop(smooth = false) {
      this.$nextTick(() => {
        if (this.$refs.contentScroll) {
          this.$refs.contentScroll.scrollTo({
            top: 0,
            behavior: smooth ? 'smooth' : 'auto'
          })
        }
      })
    },
    async copyRouteHash() {
      const path = `#/zh-CN/component/${this.currentSlug}`
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(path)
        }
        this.$message.success(`已复制路由：${path}`)
      } catch (_) {
        this.$message.info(path)
      }
    },
    async handleContentClick(event) {
      const iconLi = event.target.closest && event.target.closest('ul.icon-list li')
      if (iconLi) {
        const nameEl = iconLi.querySelector('.icon-name')
        const iconName = nameEl ? nameEl.textContent.trim() : ''
        if (iconName) {
          try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
              await navigator.clipboard.writeText(iconName)
            }
            this.$message.success(`已复制图标类名：${iconName}`)
          } catch (_) {
            this.$message.info(`图标类名：${iconName}`)
          }
        }
      }
    }
  }
}
</script>

<style scoped lang="scss">
.element-docs-shell {
  display: flex;
  height: 100%;
  min-height: 0;
  background: #ffffff;
  overflow: hidden;
}

/* 左侧目录 */
.docs-sidebar {
  width: 264px;
  height: 100%;
  min-height: 0;
  flex-shrink: 0;
  border-right: 1px solid var(--app-border);
  display: flex;
  flex-direction: column;
  background: #fbfcfe;
  overflow: hidden;
}

.sidebar-search {
  padding: 14px 16px 12px;
  border-bottom: 1px solid var(--app-border-light);
  background: #ffffff;

  ::v-deep .el-input__inner {
    border-radius: 8px;
    background: #f8fafc;
    border-color: #e2e8f0;
    font-size: 13px;

    &:focus {
      background: #ffffff;
      border-color: #409eff;
    }
  }
}

.sidebar-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  font-size: 11.5px;
  color: #94a3b8;
}

.match-count {
  color: #2563eb;
  font-weight: 600;
}

.sidebar-nav-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  overscroll-behavior: contain;
  padding: 12px 12px 40px;
}

.nav-section {
  margin-bottom: 14px;
}

.nav-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  font-weight: 700;
  color: #1e293b;
  padding: 10px 10px 6px;
}

.nav-count {
  font-size: 11px;
  font-weight: 500;
  color: #94a3b8;
}

.nav-group {
  margin-bottom: 10px;
}

.nav-group-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #94a3b8;
  padding: 8px 10px 4px;
}

.nav-group-count {
  font-size: 10.5px;
  color: #cbd5e1;
  font-weight: 500;
}

.nav-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-item {
  position: relative;
  font-size: 13.5px;
  color: #475569;
  padding: 7px 12px;
  margin: 1px 0;
  border-radius: 7px;
  cursor: pointer;
  line-height: 1.45;
  transition: all 0.14s ease;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  &:hover {
    color: #2563eb;
    background: #f1f7ff;
  }

  &.active {
    color: #2563eb;
    background: #eff6ff;
    font-weight: 600;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 7px;
      bottom: 7px;
      width: 3px;
      border-radius: 0 3px 3px 0;
      background: #409eff;
    }
  }
}

.nav-top-item {
  display: flex;
  align-items: center;
  gap: 7px;
  font-weight: 600;
  color: #1e293b;
}

.nav-item-icon {
  font-size: 14px;
  color: #64748b;
}

.nav-empty {
  padding-top: 32px;
}

/* 主正文区 */
.docs-main {
  position: relative;
  flex: 1;
  min-width: 0;
  min-height: 0;
  height: 100%;
  overflow: hidden;
  background: #ffffff;
}

.docs-scroll-wrap {
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  overscroll-behavior: contain;
}

.docs-content-grid {
  display: flex;
  justify-content: center;
  gap: 44px;
  max-width: 1240px;
  margin: 0 auto;
  padding: 24px 40px 64px;
}

.docs-article-column {
  flex: 1;
  min-width: 0;
  max-width: 880px;
}

.docs-meta-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
  padding-bottom: 16px;
  margin-bottom: 24px;
  border-bottom: 1px solid var(--app-border-light);
}

.meta-left {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.meta-group {
  color: #2563eb;
  background: #eff6ff;
  padding: 2px 8px;
  border-radius: 5px;
  font-weight: 600;
  font-size: 12px;
}

.meta-sep {
  color: #cbd5e1;
  font-size: 12px;
}

.meta-title {
  color: #64748b;
  font-weight: 500;
}

.meta-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.meta-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  color: #64748b;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  cursor: pointer;
  text-decoration: none;
  font-family: Menlo, Monaco, Consolas, monospace;
  transition: all 0.14s ease;

  &:hover {
    color: #1e293b;
    border-color: #cbd5e1;
    background: #f1f5f9;
  }

  &.primary {
    font-family: inherit;
    color: #2563eb;
    background: #eff6ff;
    border-color: #dbeafe;

    &:hover {
      background: #dbeafe;
    }
  }
}

.docs-loading {
  padding: 12px 0;
}

.docs-error {
  padding: 16px 0;
}

.docs-body {
  animation: docFadeIn 0.18s ease-out;
}

@keyframes docFadeIn {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 上下篇卡片 */
.docs-footer-nav {
  margin-top: 56px;
  padding-top: 24px;
  border-top: 1px solid var(--app-border);
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.footer-nav-card {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 14px 18px;
  border: 1px solid var(--app-border);
  border-radius: 10px;
  cursor: pointer;
  background: #ffffff;
  transition: all 0.16s ease;

  &:hover {
    border-color: #93c5fd;
    background: #f8fbff;
    box-shadow: var(--app-shadow-xs);

    .footer-nav-title {
      color: #2563eb;
    }
  }

  &.next {
    text-align: right;
  }
}

.footer-nav-label {
  font-size: 12px;
  color: #94a3b8;
}

.footer-nav-title {
  font-size: 14.5px;
  font-weight: 600;
  color: #1e293b;
  transition: color 0.15s;
}

/* 右侧本页目录 TOC */
.docs-toc {
  width: 204px;
  flex-shrink: 0;
}

.toc-sticky {
  position: sticky;
  top: 24px;
  max-height: calc(100vh - 110px);
  overflow-y: auto;
  padding-left: 16px;
  border-left: 1px solid var(--app-border-light);
}

.toc-header {
  font-size: 12px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 10px;
  letter-spacing: 0.02em;
}

.toc-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.toc-item {
  position: relative;
  font-size: 12.5px;
  color: #64748b;
  padding: 5px 0 5px 8px;
  cursor: pointer;
  line-height: 1.5;
  transition: color 0.14s;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  &:hover {
    color: #2563eb;
  }

  &.active {
    color: #2563eb;
    font-weight: 600;

    &::before {
      content: '';
      position: absolute;
      left: -17px;
      top: 6px;
      bottom: 6px;
      width: 2px;
      background: #409eff;
      border-radius: 2px;
    }
  }
}

/* 悬浮回到顶部 */
.floating-backtop {
  position: absolute;
  right: 28px;
  bottom: 28px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid var(--app-border);
  background: #ffffff;
  color: #409eff;
  font-size: 18px;
  box-shadow: var(--app-shadow-md);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.16s ease;
  z-index: 20;

  &:hover {
    background: #409eff;
    color: #ffffff;
    border-color: #409eff;
    transform: translateY(-2px);
  }
}

@media (max-width: 1260px) {
  .docs-toc {
    display: none;
  }
}

@media (max-width: 900px) {
  .docs-sidebar {
    width: 220px;
  }

  .docs-content-grid {
    padding: 20px 24px 48px;
  }
}
</style>
