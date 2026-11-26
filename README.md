# Vue 2 + Element UI Lab (vue2-element-lab)

这是一个开箱即用的 **Vue 2 + Element UI** 实验底板工程，专门为日常快速验证想法、测试 UI 组件、复现 Bug、调试数据流而设计。

## ✨ 技术栈特性

- ⚡ **构建引擎**: [Vite 5](https://vitejs.dev/) + [@vitejs/plugin-vue2](https://github.com/vitejs/vite-plugin-vue2)（毫秒级冷启动，极速热更新，告别 Webpack 漫长编译）
- 💚 **前端框架**: [Vue 2.7.16](https://v2.vuejs.org/)（Vue 2 最终 LTS 版本，内置 Composition API 支持，且 100% 兼容 Options API）
- 🎨 **UI 组件库**: [Element UI 2.15.14](https://element.eleme.io/#/zh-CN)（经典后台管理组件库，已全局引入样式与组件）
- 📖 **完整官方文档**: 内置 Element UI v2.15.14 官方「组件」栏目下的全部 67 个页面（更新日志、5 篇开发指南及 61 个组件交互演示、源码展开/复制与 API 参数表）
- 🧪 **测试沙箱**: 内置 `QuickSandbox`（响应式数据看板、事件日志流）、`ComponentPatterns`（Dialog / ProTable 组件封装范式）与 `PitfallsGuide`（Vue 2.7 + Element UI 2.15 避坑指南）

---

## 🌐 在线访问 (GitHub Pages)

- **在线预览地址**：[https://likonion.github.io/vue2-element-lab/](https://likonion.github.io/vue2-element-lab/)
- 每次推送到 `main` 分支后，会通过 `.github/workflows/deploy.yml` 自动构建并部署至 GitHub Pages。

---

## 🚀 快速上手

### 1. 安装依赖

```bash
npm install
# 或者使用 pnpm / yarn
pnpm install
```

### 2. 启动本地开发服务

```bash
npm run dev
```

启动后会自动打开浏览器访问 `http://localhost:3000`。

### 3. 构建与预览

```bash
# 生产打包
npm run build

# 预览构建产物
npm run preview
```

---

## 📁 目录结构

```text
├── index.html                  # HTML 入口
├── package.json                # 项目依赖与脚本配置
├── vite.config.js              # Vite 配置文件（配置 @vitejs/plugin-vue2 与路径别名）
├── README.md                   # 项目使用文档
└── src/
    ├── main.js                 # 项目入口（引入 Vue、Element UI 及其样式）
    ├── App.vue                 # 页面主骨架与 Tab 导航
    ├── style.css               # 全局基础样式
    └── components/
        ├── QuickSandbox.vue        # 🧪 快速测试沙箱（可随手在此修改、测试组件与数据）
        ├── ComponentPatterns.vue   # 📦 业务组件封装范式（Dialog 独立封装、ProTable 分页表格）
        └── PitfallsGuide.vue       # ⚠️ Vue 2.7 + Element UI 2.15 避坑指南
```

---

## 💡 日常测试技巧

- **随手测试组件**：直接打开 `src/components/QuickSandbox.vue`，在 template 中粘贴你想要测试的 Element UI 组件代码。
- **观察响应式数据**：右侧卡片会实时打印 `formData`，无需频繁 `console.log`。
- **自定义独立测试页**：在 `src/components/` 下新建组件，直接在 `App.vue` 中引入即可。
# vue2-element-lab
# vue2-element-lab
