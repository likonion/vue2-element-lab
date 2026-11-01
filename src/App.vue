<template>
  <div id="app">
    <!-- 顶部导航栏 -->
    <header class="app-header">
      <div class="header-left">
        <span class="logo-icon">⚡</span>
        <div>
          <h1 class="logo-title">Vue 2 + Element UI Lab</h1>
          <p class="logo-subtitle">极速启动 · 实验沙箱 · 常用组件速查</p>
        </div>
      </div>
      <div class="header-right">
        <el-tag effect="dark" type="success" size="small">Vue v2.7.16</el-tag>
        <el-tag effect="dark" type="primary" size="small">Element UI v2.15.14</el-tag>
        <el-tag effect="dark" type="warning" size="small">Vite 5</el-tag>
      </div>
    </header>

    <!-- 主体内容 -->
    <main class="app-main">
      <el-tabs v-model="activeTab" type="card" class="main-tabs">
        <el-tab-pane name="sandbox">
          <span slot="label"><i class="el-icon-cpu" /> 🧪 快速实验沙箱</span>
          <QuickSandbox />
        </el-tab-pane>

        <el-tab-pane name="showcase">
          <span slot="label"><i class="el-icon-collection" /> 📚 常用组件速查</span>
          <ElementShowcase />
        </el-tab-pane>

        <el-tab-pane name="guide">
          <span slot="label"><i class="el-icon-document" /> 📖 底板工程说明</span>
          <el-card shadow="never">
            <div slot="header" style="font-weight: bold; font-size: 16px;">
              💡 关于此底板工程的使用说明
            </div>
            <div class="guide-content">
              <h3>1. 为什么选用 Vite + Vue 2.7？</h3>
              <p>传统 Vue 2 项目多基于 Webpack 4 / vue-cli，启动冷启动慢且对较新版本的 Node 环境有 OpenSSL 兼容性限制。本底板采用官方推荐的 <strong>Vue 2.7 (最终 LTS) + Vite 5 + @vitejs/plugin-vue2</strong>，享受秒级热更新，同时完美兼容 Element UI 的所有组件和指令。</p>

              <h3 style="margin-top: 20px;">2. 日常如何测试您的代码？</h3>
              <ul>
                <li>可以直接修改 <code>src/components/QuickSandbox.vue</code>，该组件内置了响应式状态和事件流输出，测试数据一目了然。</li>
                <li>或者在 <code>src/components/</code> 目录下新建您自己的 <code>.vue</code> 文件，在 <code>App.vue</code> 中引入测试。</li>
              </ul>

              <h3 style="margin-top: 20px;">3. 常用命令</h3>
              <pre class="code-box"># 启动本地开发服务 (支持极速 HMR)
npm run dev

# 生产环境打包构建
npm run build

# 预览构建产物
npm run preview</pre>
            </div>
          </el-card>
        </el-tab-pane>
      </el-tabs>
    </main>

    <!-- 底部信息 -->
    <footer class="app-footer">
      <span>Vue 2 + Element UI Playground · 本地开发测试专用</span>
    </footer>
  </div>
</template>

<script>
import QuickSandbox from './components/QuickSandbox.vue'
import ElementShowcase from './components/ElementShowcase.vue'

export default {
  name: 'App',
  components: {
    QuickSandbox,
    ElementShowcase
  },
  data() {
    return {
      activeTab: 'sandbox'
    }
  }
}
</script>

<style scoped>
.app-header {
  background: #ffffff;
  border-bottom: 1px solid #e4e7ed;
  padding: 12px 28px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  font-size: 28px;
}

.logo-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.logo-subtitle {
  font-size: 12px;
  color: #909399;
  margin: 0;
}

.header-right {
  display: flex;
  gap: 8px;
}

.app-main {
  flex: 1;
  padding: 20px 28px;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
}

.main-tabs >>> .el-tabs__header {
  margin-bottom: 16px;
}

.guide-content h3 {
  font-size: 15px;
  color: #303133;
  margin-bottom: 8px;
}

.guide-content p, .guide-content li {
  font-size: 14px;
  color: #606266;
  line-height: 1.8;
}

.guide-content ul {
  padding-left: 20px;
}

.app-footer {
  text-align: center;
  padding: 14px;
  font-size: 12px;
  color: #909399;
  border-top: 1px solid #e4e7ed;
  background-color: #fff;
}
</style>
