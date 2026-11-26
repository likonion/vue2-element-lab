<div align="center">

# ⚡ Vue 2 + Element UI Lab

**开箱即用的 Vue 2.7 + Element UI 2.15 官方文档查阅、业务组件封装范式、避坑知识库与极速实验工坊**

[![Vue](https://img.shields.io/badge/Vue-2.7.16-42b883?style=flat-square&logo=vuedotjs&logoColor=white)](https://v2.vuejs.org/)
[![Element UI](https://img.shields.io/badge/Element_UI-2.15.14-409eff?style=flat-square&logo=element&logoColor=white)](https://element.eleme.cn/#/zh-CN)
[![Vite](https://img.shields.io/badge/Vite-5.4-646cff?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![GitHub Pages](https://img.shields.io/badge/Deploy-GitHub_Pages-222222?style=flat-square&logo=github)](https://likonion.github.io/vue2-element-lab/)

[🌐 在线体验](https://likonion.github.io/vue2-element-lab/) · [✨ 核心模块](#-核心模块一览) · [🚀 快速上手](#-快速上手) · [📁 目录结构](#-目录结构)

</div>

---

## 🎯 项目简介

`vue2-element-lab` 基于 **Vue 2.7 LTS + Element UI 2.15.14 + Vite 5** 构建，面向 Vue 2 中后台日常开发场景：

- 告别官网卡顿与频繁切屏，**1:1 完整内置 Element UI 官方全部 67 个组件文档与 300 个实时交互 Demo**；
- 沉淀可直接落地复用的 **Dialog 独立封装** 与 **ProTable 分页表格封装** 范式；
- 汇总 GitHub Issues 与社区针对 **Vue 2.7 + Element UI 2.15.14 + Vite 5** 的 **20 个高频踩坑点与推荐解法**；
- 内置毫秒级热更新的 **实验沙箱** 与全局 **`⌘K` / `Ctrl+K`** 跨模块极速检索。

---

## ✨ 核心模块一览

| 模块 | 核心能力 | 亮点特性 |
| :--- | :--- | :--- |
| **📖 官方文档** | 完整收录 Element UI v2.15.14「组件」栏目全部 **67 个页面**（更新日志、5 篇开发指南、61 个组件文档） | 300 个实时可交互 Demo、源码展开与一键复制、左右独立滚动、右侧本页目录 TOC 联动、Icon 点击一键复制类名、完整 API 参数表 |
| **📦 组件封装** | 提供中后台最高频的两套业务二次封装范式：**独立 Dialog** 与 **ProTable 表格 + 分页** | 在线实时联动体验 + `?raw` 同步完整源码一键复制 + API 速查表 |
| **⚠️ 避坑指南** | 聚焦当前技术栈（Vue 2.7.16 / Element UI 2.15.14 / Vite 5）的 **20 篇实战坑点** | 按分类 / 级别 / 关键词筛选、错误写法 vs 推荐方案代码对比、关联组件直达本地官方文档 |
| **🧪 实验沙箱** | 轻量响应式组件试验台（`QuickSandbox.vue`） | 右侧实时同步 `formData` JSON（支持一键复制）与交互事件触发时间线 |
| **🔍 全局 `⌘K`** | 任意页面按 `⌘K`（Windows 为 `Ctrl+K`）唤起快捷命令面板 | 同时模糊检索 **67 篇文档 + 20 篇避坑 + 2 套封装范式**，全键盘上下回车直达 |

---

## 🧩 亮点功能拆解

### 1. 官方文档编译引擎（Vite Markdown Demo 插件）
项目内置自定义 Vite 插件 [`build/vite-plugin-element-md.js`](./build/vite-plugin-element-md.js)，在开发与构建阶段直接将官方 `:::demo` / `:::tip` / `:::warning` Markdown 编译为可交互 Vue 2.7 SFC 组件，支持按页面自动代码分包与 `highlight.js` 语法高亮。

### 2. 业务组件封装范式
- **独立 Dialog 封装（`BestPracticeDialog.vue`）**：采用「父组件 `ref` 调用 + `Object.assign(this.$data, this.$options.data.call(this))` 终极重置法」，彻底解耦父组件 `visible` 状态，一键重置表单/Loading/临时状态，同时完整保留 Element UI 关闭过渡动画。
- **通用分页表格封装（`ProTable.vue`）**：内置 `el-pagination` 分页联动与**非首页切换 `pageSize` 防双重请求锁**、竞态请求序号保护、自动 `doLayout()` 防固定列错位、`columns` 配置化 + 命名插槽透传、跨页多选记忆（`row-key` + `reserve-selection`）与密度切换。

### 3. 版本专属避坑指南
严格围绕 **Vue 2.7.16 + Element UI 2.15.14 + Vite 5** 整理 5 大类共 20 篇踩坑实录：
- **Vue 2.7 & Vite 兼容**：`reactive()` 底层 `Object.defineProperty` 限制、`<script setup>` 调用 `Message/MessageBox`、`::v-deep` 穿透语法、Dart Sass 弃用警告屏蔽、`v-loading` 遮罩穿透；
- **高频组件深坑**：`el-form.resetFields()` 初始值锁定、单输入框回车刷新、`el-table` 固定列错位与 `v-if` 列错乱、`el-date-picker` `yyyy-MM-dd` 大小写陷阱与 `daterange` 清空变 `null`、`el-tree` 权限回显全选问题、`el-pagination` 双重请求等。

---

## 🚀 快速上手

### 环境要求
- Node.js `>= 18`（推荐 Node 20 LTS）

### 本地开发

```bash
# 1. 克隆仓库
git clone git@github.com:likonion/vue2-element-lab.git
cd vue2-element-lab

# 2. 安装依赖
npm install

# 3. 启动开发服务（默认端口 3000，支持极速 HMR）
npm run dev
```

### 生产构建与本地预览

```bash
# 生产环境打包（输出至 dist/，已适配相对路径 ./）
npm run build

# 本地预览构建产物
npm run preview
```

---

## 🌐 GitHub Pages 自动部署

本仓库已配置 [`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml)：

1. 推送代码到 `main` 分支后自动触发 GitHub Actions 执行 `npm ci` 与 `npm run build`；
2. 自动发布 `dist/` 产物至 GitHub Pages；
3. 在线访问地址：**https://likonion.github.io/vue2-element-lab/**

> **提示**：如 Fork 本项目自建部署，在仓库 **Settings → Pages → Build and deployment → Source** 选择 **`GitHub Actions`** 即可自动生效。

---

## 📁 目录结构

```text
vue2-element-lab/
├── .github/workflows/
│   └── deploy.yml                       # GitHub Pages 自动构建部署流水线
├── build/
│   └── vite-plugin-element-md.js        # 官方 Markdown Demo 转 Vue 2 SFC 的 Vite 插件
├── index.html                           # HTML 入口
├── vite.config.js                       # Vite 配置（Vue 2.7、MD 插件、SCSS 降噪、相对 base）
├── package.json                         # 依赖与脚本配置
└── src/
    ├── main.js                          # 入口（注册 Element UI、过渡动画、DemoBlock 与图标集）
    ├── App.vue                          # 顶部毛玻璃导航、模块切换与使用说明页
    ├── style.css                        # 全局设计 Token 与滚动条样式
    ├── data/
    │   └── pitfalls.js                  # 20 篇 Vue 2.7 + Element UI 2.15 避坑数据
    ├── components/
    │   ├── ComponentPatterns.vue        # 📦 组件封装范式展示页（联动演示 + 源码复制）
    │   ├── PitfallsGuide.vue            # ⚠️ 避坑指南检索与错对代码对比页
    │   ├── QuickSandbox.vue             # 🧪 快速实验沙箱（响应式状态 + 事件日志）
    │   └── patterns/
    │       ├── BestPracticeDialog.vue   # 独立 Dialog 封装组件（ref + $options.data 重置）
    │       └── ProTable.vue             # 通用 ProTable 封装组件（内置分页 + 跨页多选）
    └── element-docs/
        ├── nav.config.js                # 官方 67 页中文导航目录配置
        ├── icon.json                    # Element UI 官方完整图标集
        ├── components/
        │   ├── ElementDocsView.vue      # 三栏文档阅读器（独立滚动 + 右侧 TOC + 上下篇）
        │   ├── CommandPalette.vue       # 全局 ⌘K 联合快捷检索面板
        │   ├── DemoBlock.vue            # 实时交互 Demo 容器（源码展开 + 一键复制）
        │   └── ChangelogPage.vue        # 官方更新日志时间线页面
        ├── demo-styles/                 # 官方 50 份组件示例 SCSS 样式
        ├── styles/element-doc.scss      # 文档排版与 API 表格视觉样式
        └── docs/                        # 官方 66 篇中文组件文档 + CHANGELOG.zh-CN.md
```

---

## ⌨️ 效率技巧

- **全局极速搜索**：任意页面按下 `⌘ + K`（Windows/Linux 按 `Ctrl + K`），输入组件名、中文关键词或问题关键词（如 `table`、`resetFields`、`YYYY`、`ProTable`）即可直达目标页面。
- **一键复制图标类名**：在「官方文档 → Icon 图标」页点击任意图标卡片，自动复制 `el-icon-xxx` 类名。
- **快速验证想法**：直接编辑 `src/components/QuickSandbox.vue`，配合 Vite 毫秒级热更新与右侧实时 JSON 看板调试。
