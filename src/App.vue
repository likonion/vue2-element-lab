<template>
  <div id="app" :class="{ 'is-docs-app': activeTab === 'docs' }">
    <!-- 顶部通栏导航 -->
    <header class="app-navbar">
      <div class="navbar-left" @click="goHome">
        <div class="brand-mark" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
            <path d="M12 2.5L20.5 7.4V16.6L12 21.5L3.5 16.6V7.4L12 2.5Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round" />
            <path d="M8.5 10H15.5M8.5 14H13.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </svg>
        </div>
        <div class="brand-info">
          <span class="brand-title">Element UI Lab</span>
          <span class="brand-version">v2.15.14</span>
        </div>
      </div>

      <!-- 主导航切换 -->
      <nav class="navbar-nav" aria-label="主导航">
        <button
          v-for="tab in navTabs"
          :key="tab.name"
          type="button"
          class="nav-pill"
          :class="{ active: activeTab === tab.name }"
          @click="activeTab = tab.name"
        >
          <i :class="tab.icon" />
          <span>{{ tab.label }}</span>
        </button>
      </nav>

      <!-- 右侧全局快捷搜索 + 技术栈标签 -->
      <div class="navbar-right">
        <button type="button" class="search-trigger" @click="paletteVisible = true">
          <i class="el-icon-search" />
          <span class="search-placeholder">快速跳转组件...</span>
          <kbd class="search-kbd">{{ isMac ? '⌘K' : 'Ctrl K' }}</kbd>
        </button>

        <div class="stack-badges">
          <span class="stack-badge vue">Vue 2.7</span>
          <span class="stack-badge vite">Vite 5</span>
        </div>
      </div>
    </header>

    <!-- 主体视图区 -->
    <main class="app-body" :class="{ 'is-docs-mode': activeTab === 'docs' }">
      <ElementDocsView
        v-show="activeTab === 'docs'"
        ref="docsView"
      />

      <div v-if="activeTab === 'pitfalls'" class="workspace-container">
        <PitfallsGuide
          ref="pitfallsView"
          @open-doc="handleOpenDoc"
        />
      </div>

      <div v-if="activeTab === 'patterns'" class="workspace-container">
        <ComponentPatterns ref="patternsView" />
      </div>

      <div v-if="activeTab === 'sandbox'" class="workspace-container">
        <QuickSandbox />
      </div>

      <div v-if="activeTab === 'guide'" class="workspace-container">
        <div class="guide-hero">
          <div class="guide-hero-badge">Vue 2.7 + Element UI 2.15.14 + Vite 5</div>
          <h2>本地离线官方文档 & 极速组件实验工坊</h2>
          <p>
            专为 Vue 2 + Element UI 日常开发打造：完整内置官方 67 个组件文档与 300 个交互示例，
            搭配毫秒级热更新的实验沙箱，查文档、复现问题、验证交互一站完成。
          </p>
        </div>

        <div class="guide-grid">
          <div class="guide-card">
            <div class="guide-card-icon blue"><i class="el-icon-reading" /></div>
            <h3>完整官方组件文档</h3>
            <p>1:1 收录 Element UI v2.15.14「组件」栏目下的全部 67 个页面，包含实时交互演示、源码展开与一键复制、API 参数表及右侧本页目录定位。</p>
          </div>

          <div class="guide-card">
            <div class="guide-card-icon green"><i class="el-icon-search" /></div>
            <h3>全局 ⌘K 极速检索</h3>
            <p>在任意页面按下 <code>{{ isMac ? '⌘ + K' : 'Ctrl + K' }}</code> 即可唤起快捷面板，支持中英文名称与路由模糊匹配，键盘上下键直达目标组件。</p>
          </div>

          <div class="guide-card">
            <div class="guide-card-icon purple"><i class="el-icon-cpu" /></div>
            <h3>响应式实验沙箱</h3>
            <p>修改 <code>src/components/QuickSandbox.vue</code> 即可实时调试组件行为，右侧同步展示响应式 JSON 状态与事件触发时间线。</p>
          </div>
        </div>

        <div class="guide-commands">
          <div class="commands-header">
            <span>常用开发命令</span>
            <span class="commands-sub">Vite 5 · 极速冷启动 & HMR</span>
          </div>
          <div class="command-list">
            <div v-for="item in commands" :key="item.cmd" class="command-row">
              <div>
                <code>{{ item.cmd }}</code>
                <span class="command-desc">{{ item.desc }}</span>
              </div>
              <el-button size="mini" type="text" icon="el-icon-document-copy" @click="copyCommand(item.cmd)">
                复制
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 全局 ⌘K 快捷搜索面板 -->
    <CommandPalette
      :visible.sync="paletteVisible"
      @select="handlePaletteSelect"
      @select-pitfall="handlePalettePitfall"
      @select-pattern="handlePalettePattern"
    />
  </div>
</template>

<script>
import ElementDocsView from './element-docs/components/ElementDocsView.vue'
import CommandPalette from './element-docs/components/CommandPalette.vue'
import PitfallsGuide from './components/PitfallsGuide.vue'
import ComponentPatterns from './components/ComponentPatterns.vue'
import QuickSandbox from './components/QuickSandbox.vue'

export default {
  name: 'App',
  components: {
    ElementDocsView,
    CommandPalette,
    PitfallsGuide,
    ComponentPatterns,
    QuickSandbox
  },
  data() {
    return {
      activeTab: 'docs',
      paletteVisible: false,
      isMac: typeof navigator !== 'undefined' && /Mac|iPhone|iPad/i.test(navigator.platform),
      navTabs: [
        { name: 'docs', label: '官方文档', icon: 'el-icon-reading' },
        { name: 'patterns', label: '组件封装', icon: 'el-icon-box' },
        { name: 'pitfalls', label: '避坑指南', icon: 'el-icon-warning-outline' },
        { name: 'sandbox', label: '实验沙箱', icon: 'el-icon-cpu' },
        { name: 'guide', label: '使用说明', icon: 'el-icon-document' }
      ],
      commands: [
        { cmd: 'npm run dev', desc: '启动本地开发服务 (http://localhost:3000)' },
        { cmd: 'npm run build', desc: '生产环境打包构建' },
        { cmd: 'npm run preview', desc: '本地预览生产构建产物' }
      ]
    }
  },
  mounted() {
    window.addEventListener('hashchange', this.syncTabWithHash)
    window.addEventListener('keydown', this.handleGlobalKeydown)
  },
  beforeDestroy() {
    window.removeEventListener('hashchange', this.syncTabWithHash)
    window.removeEventListener('keydown', this.handleGlobalKeydown)
  },
  methods: {
    goHome() {
      this.activeTab = 'docs'
      this.$refs.docsView && this.$refs.docsView.selectPage('installation')
    },
    syncTabWithHash() {
      if (/#\/(?:zh-CN\/)?component\//.test(window.location.hash)) {
        this.activeTab = 'docs'
      }
    },
    handleGlobalKeydown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        this.paletteVisible = !this.paletteVisible
      }
    },
    handlePaletteSelect(slug) {
      this.handleOpenDoc(slug)
    },
    handleOpenDoc(slug) {
      this.activeTab = 'docs'
      this.$nextTick(() => {
        this.$refs.docsView && this.$refs.docsView.selectPage(slug)
      })
    },
    handlePalettePitfall(pitfallId) {
      this.activeTab = 'pitfalls'
      this.$nextTick(() => {
        this.$refs.pitfallsView && this.$refs.pitfallsView.focusPitfall(pitfallId)
      })
    },
    handlePalettePattern(pattern) {
      this.activeTab = 'patterns'
      this.$nextTick(() => {
        this.$refs.patternsView && this.$refs.patternsView.switchPattern(pattern)
      })
    },
    async copyCommand(cmd) {
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(cmd)
        }
        this.$message.success(`已复制命令：${cmd}`)
      } catch (_) {
        this.$message.info(cmd)
      }
    }
  }
}
</script>

<style scoped lang="scss">
.app-navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  flex-shrink: 0;
  height: var(--app-header-height);
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--app-border);
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  user-select: none;
  flex-shrink: 0;
}

.brand-mark {
  width: 32px;
  height: 32px;
  border-radius: 9px;
  background: linear-gradient(135deg, #409eff 0%, #2563eb 100%);
  color: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 10px rgba(64, 158, 255, 0.28);
}

.brand-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.brand-title {
  font-size: 15.5px;
  font-weight: 700;
  color: #111827;
  letter-spacing: -0.02em;
}

.brand-version {
  font-size: 11px;
  font-weight: 600;
  color: #2563eb;
  background: #eff6ff;
  border: 1px solid #dbeafe;
  padding: 1px 7px;
  border-radius: 999px;
  font-family: Menlo, Monaco, Consolas, monospace;
}

.navbar-nav {
  display: flex;
  align-items: center;
  gap: 4px;
  background: #f3f5f9;
  padding: 4px;
  border-radius: 10px;
}

.nav-pill {
  border: none;
  background: transparent;
  color: #64748b;
  font-size: 13.5px;
  font-weight: 500;
  padding: 6px 14px;
  border-radius: 7px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.16s ease;
  white-space: nowrap;

  i {
    font-size: 14px;
  }

  &:hover {
    color: #1e293b;
  }

  &.active {
    background: #ffffff;
    color: #2563eb;
    font-weight: 600;
    box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08);
  }
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.search-trigger {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 34px;
  padding: 0 10px 0 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  color: #64748b;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    border-color: #93c5fd;
    background: #ffffff;
    color: #1e293b;
    box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.1);
  }
}

.search-placeholder {
  color: #94a3b8;
  margin-right: 12px;
}

.search-kbd {
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
  background: #ffffff;
  border: 1px solid #dce1ea;
  border-radius: 5px;
  padding: 1px 6px;
  font-family: Menlo, Monaco, Consolas, monospace;
}

.stack-badges {
  display: flex;
  align-items: center;
  gap: 6px;
}

.stack-badge {
  font-size: 11.5px;
  font-weight: 500;
  padding: 3px 8px;
  border-radius: 6px;

  &.vue {
    color: #15803d;
    background: #f0fdf4;
    border: 1px solid #dcfce7;
  }

  &.vite {
    color: #b45309;
    background: #fffbeb;
    border: 1px solid #fef3c7;
  }
}

#app.is-docs-app {
  height: 100vh;
  max-height: 100vh;
  overflow: hidden;
}

.app-body {
  flex: 1;
  min-height: calc(100vh - var(--app-header-height));

  &.is-docs-mode {
    flex: none;
    height: calc(100vh - var(--app-header-height));
    max-height: calc(100vh - var(--app-header-height));
    min-height: 0;
    overflow: hidden;
  }
}

.workspace-container {
  max-width: 1360px;
  margin: 0 auto;
  padding: 24px 28px 40px;
}

/* 使用说明页 */
.guide-hero {
  background: linear-gradient(135deg, #ffffff 0%, #f0f7ff 100%);
  border: 1px solid #dbeafe;
  border-radius: 16px;
  padding: 32px 36px;
  margin-bottom: 24px;

  h2 {
    font-size: 24px;
    font-weight: 700;
    color: #111827;
    margin: 12px 0 10px;
    letter-spacing: -0.02em;
  }

  p {
    font-size: 14.5px;
    color: #475569;
    max-width: 720px;
    line-height: 1.75;
    margin: 0;
  }
}

.guide-hero-badge {
  display: inline-block;
  font-size: 12px;
  font-weight: 600;
  color: #2563eb;
  background: #dbeafe;
  padding: 3px 10px;
  border-radius: 999px;
}

.guide-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
  margin-bottom: 24px;
}

.guide-card {
  background: #ffffff;
  border: 1px solid var(--app-border);
  border-radius: 14px;
  padding: 22px 24px;
  box-shadow: var(--app-shadow-xs);
  transition: transform 0.18s ease, box-shadow 0.18s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--app-shadow-sm);
  }

  h3 {
    font-size: 16px;
    font-weight: 600;
    color: #111827;
    margin: 14px 0 8px;
  }

  p {
    font-size: 13.5px;
    color: #64748b;
    line-height: 1.7;
    margin: 0;
  }

  code {
    background: #f1f5f9;
    padding: 1px 5px;
    border-radius: 4px;
    font-size: 12px;
    color: #334155;
  }
}

.guide-card-icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;

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

.guide-commands {
  background: #ffffff;
  border: 1px solid var(--app-border);
  border-radius: 14px;
  overflow: hidden;
  box-shadow: var(--app-shadow-xs);
}

.commands-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 22px;
  background: #f8fafc;
  border-bottom: 1px solid var(--app-border);
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}

.commands-sub {
  font-size: 12px;
  font-weight: 400;
  color: #94a3b8;
}

.command-list {
  padding: 6px 22px;
}

.command-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f1f5f9;

  &:last-child {
    border-bottom: none;
  }

  code {
    font-family: "JetBrains Mono", Menlo, Monaco, Consolas, monospace;
    font-size: 13px;
    color: #0f172a;
    background: #f1f5f9;
    padding: 4px 10px;
    border-radius: 6px;
    margin-right: 12px;
  }
}

.command-desc {
  font-size: 13px;
  color: #64748b;
}

@media (max-width: 1024px) {
  .stack-badges,
  .search-placeholder {
    display: none;
  }

  .guide-grid {
    grid-template-columns: 1fr;
  }
}
</style>
