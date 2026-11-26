export const PITFALL_CATEGORIES = [
  { id: 'all', label: '全部问题', icon: 'el-icon-menu' },
  { id: 'compat', label: 'Vue 2.7 & Vite 兼容', icon: 'el-icon-cpu' },
  { id: 'form', label: 'Form 表单', icon: 'el-icon-edit-outline' },
  { id: 'table', label: 'Table 表格', icon: 'el-icon-s-grid' },
  { id: 'picker', label: 'Select / 日期选择', icon: 'el-icon-date' },
  { id: 'overlay', label: 'Dialog / Tree / 分页', icon: 'el-icon-collection-tag' }
]

export const SEVERITY_META = {
  high: { label: '高频必踩', color: 'danger' },
  compat: { label: '版本专属', color: 'warning' },
  tricky: { label: '隐蔽易错', color: 'primary' }
}

export const PITFALLS_LIST = [
  {
    id: 'vue27-reactive-defineproperty',
    category: 'compat',
    severity: 'compat',
    title: 'Vue 2.7 使用 reactive() 绑定表单/表格时，动态新增属性不触发视图更新',
    components: [
      { label: 'Form 表单', docSlug: 'form' },
      { label: 'Table 表格', docSlug: 'table' }
    ],
    source: 'Vue 2.7 官方迁移指南 & 社区高频反馈',
    summary: 'Vue 2.7 虽内置了 Composition API，但底层响应式依然是 Object.defineProperty 而非 Vue 3 的 Proxy。',
    symptom:
      '在 `<script setup>` 中用 `reactive({})` 定义表单或表格行数据，后续通过 `state.form.extra = "abc"` 动态追加新字段或按索引直接修改数组元素时，`el-input` / `el-table` 界面无响应，甚至 `el-form` 校验拿不到新字段值。',
    cause:
      'Vue 2.7 仅向后移植了 Composition API 语法糖，核心响应式实现仍沿用 Vue 2 的 `Object.defineProperty` 劫持机制，无法侦测对象属性的新增/删除及数组下标直接赋值。',
    badCode: `<script setup>
import { reactive } from 'vue'

const form = reactive({ name: '' })

// ❌ Vue 2.7 中动态新增未声明属性不会触发 el-form / el-input 响应式更新
function fillAsyncData(res) {
  form.remark = res.remark
}
</script>`,
    goodCode: `<script setup>
import { reactive, set } from 'vue'

// ✅ 方案 1：预先声明完整字段结构（最推荐）
const form = reactive({
  name: '',
  remark: ''
})

// ✅ 方案 2：必须动态追加字段时，使用 Vue 2.7 导出的 set()
function fillAsyncData(res) {
  set(form, 'remark', res.remark)
}
</script>`,
    tips: '表单整体替换时，使用 ref({}) 配合 form.value = { ...res } 比 reactive 更不易踩坑。'
  },
  {
    id: 'vue27-script-setup-message',
    category: 'compat',
    severity: 'compat',
    title: '<script setup> 中无法调用 this.$message / this.$confirm / this.$refs',
    components: [
      { label: 'Message 消息提示', docSlug: 'message' },
      { label: 'MessageBox 弹框', docSlug: 'message-box' }
    ],
    source: 'Vue 2.7 + Element UI 2.15 社区实战',
    summary: '在 Vue 2.7 的 <script setup> 中不存在 this，直接沿用 Options API 的原型方法会直接报 undefined。',
    symptom:
      '在 `<script setup>` 中写 `this.$message.success(...)`、`this.$confirm(...)` 或 `this.$refs.formRef.validate(...)` 时，运行时报错 `Cannot read properties of undefined`。',
    cause:
      'Element UI 2.15.x 是为 Vue 2 Options API 设计的，默认将 `$message`、`$confirm`、`$notify`、`$loading` 挂载在 `Vue.prototype` 上；而 `<script setup>` 顶层作用域没有组件实例 `this`。',
    badCode: `<script setup>
// ❌ <script setup> 中 this 为 undefined
const onSubmit = () => {
  this.$refs.ruleForm.validate((valid) => {
    if (valid) this.$message.success('提交成功')
  })
}
</script>`,
    goodCode: `<script setup>
import { ref } from 'vue'
import { Message, MessageBox } from 'element-ui'

// ✅ 与模板 ref="ruleForm" 同名的 ref 变量
const ruleForm = ref(null)

const onSubmit = () => {
  ruleForm.value.validate(async (valid) => {
    if (!valid) return
    await MessageBox.confirm('确认提交当前表单？', '提示', { type: 'warning' })
    Message.success('提交成功')
  })
}
</script>`,
    tips: '尽量直接从 element-ui 导入服务函数，避免四处使用内部 API getCurrentInstance().proxy。'
  },
  {
    id: 'vue27-v-deep-selector',
    category: 'compat',
    severity: 'compat',
    title: 'Scoped 样式穿透写法差异：Vue 2.7 + Vite/Sass 必须用 ::v-deep 而非 :deep()',
    components: [
      { label: '自定义主题', docSlug: 'custom-theme' }
    ],
    source: 'Vue 2.7 + @vitejs/plugin-vue2 GitHub Issue',
    summary: '照搬 Vue 3 / Element Plus 的 :deep(.el-xxx) 在 Vue 2.7 中不生效，而 >>> 在 SCSS 中会直接编译报错。',
    symptom:
      '在 `<style scoped lang="scss">` 中覆写 `.el-dialog__body` 或 `.el-input__inner` 样式时，使用 `:deep(...)` 样式完全不生效，使用 `>>>` 则直接触发 Sass 语法报错。',
    cause:
      'Vue 2.7 的 SFC 编译器保持 Vue 2 的 scoped 穿透语法（支持 `::v-deep`、`/deep/`），不支持 Vue 3 专属的 `:deep()` 函数伪类；同时 Dart Sass 无法解析纯 CSS 组合器 `>>>`。',
    badCode: `<style scoped lang="scss">
/* ❌ Vue 2.7 不支持 Vue 3 的 :deep() 语法 */
:deep(.el-dialog__body) {
  padding: 16px 24px;
}

/* ❌ SCSS 中 >>> 会导致 Sass 解析报错 */
.my-box >>> .el-input__inner {
  border-radius: 8px;
}
</style>`,
    goodCode: `<style scoped lang="scss">
/* ✅ Vue 2.7 + SCSS 标准写法 */
::v-deep .el-dialog__body {
  padding: 16px 24px;
}

.my-box ::v-deep .el-input__inner {
  border-radius: 8px;
}
</style>`,
    tips: '注意挂载到 body 的浮层组件（Tooltip / Popover / Select 下拉 / Dialog append-to-body）无法通过 scoped 穿透修改，应搭配 custom-class / popper-class 在全局样式中设置。'
  },
  {
    id: 'vite5-dart-sass-deprecation',
    category: 'compat',
    severity: 'compat',
    title: 'Vite 5 + 新版 Dart Sass 编译 Element UI 样式刷屏弃用警告',
    components: [
      { label: '安装', docSlug: 'installation' },
      { label: '自定义主题', docSlug: 'custom-theme' }
    ],
    source: 'Vite 5 + Sass 1.77+ 社区常见问题',
    summary: 'Element UI 2.15.14 的 SCSS 源码使用了旧版 @import 与全局颜色函数，新版 Dart Sass 会输出大量警告。',
    symptom:
      '在引入 Element UI 的 SCSS 主题变量或 demo-styles 时，终端刷屏 `Deprecation Warning: Sass @import rules are deprecated`、`legacy-js-api`、`mix() / lighten()` 等大量警告信息。',
    cause:
      'Element UI 2.15.14 已停止大版本语法迁移，其 SCSS 仍采用 Sass 1.x 早期写法；而 Vite 5 默认搭配最新 Dart Sass 时会启用严格的弃用提示。',
    badCode: `// vite.config.js 未配置 silenceDeprecations
export default defineConfig({
  plugins: [vue()]
})`,
    goodCode: `// vite.config.js
export default defineConfig({
  plugins: [vue()],
  css: {
    preprocessorOptions: {
      scss: {
        // ✅ 屏蔽旧版 Element UI SCSS 触发的弃用警告（本工程已配置）
        silenceDeprecations: [
          'legacy-js-api',
          'import',
          'global-builtin',
          'color-functions'
        ]
      }
    }
  }
})`,
    tips: '如果项目需要修改 Element 主题变量，建议参考官方文档使用 SCSS 变量覆盖并配合该配置保持构建输出整洁。'
  },
  {
    id: 'vue27-template-compiler-and-vloading',
    category: 'compat',
    severity: 'compat',
    title: '残留 vue-template-compiler 导致组件空白，以及 2.15.14 中 v-loading 遮罩穿透',
    components: [
      { label: 'Loading 加载', docSlug: 'loading' },
      { label: 'Select 选择器', docSlug: 'select' }
    ],
    source: 'ElemeFE/element GitHub Issues (2.15.14 + Vue 2.7)',
    summary: 'Vue 2.7 必须卸载旧版 vue-template-compiler；2.15.14 对表单控件直接挂 v-loading 可能仍响应点击。',
    symptom:
      '1) 升级到 Vue 2.7 后若 `package.json` 仍残留旧版 `vue-template-compiler`，可能出现 `el-table` 渲染空白且无报错或编译版本冲突；2) 在 2.15.14 中直接给 `el-select` / `el-cascader` 添加 `v-loading` 时，部分场景下遮罩仍可能被点击穿透。',
    cause:
      'Vue 2.7 已内置 `vue/compiler-sfc`，外部 `vue-template-compiler` 会与 `@vitejs/plugin-vue2` 产生编译器不一致；`v-loading` 直接绑定在内部带相对定位或自定义事件拦截的输入控件上时容易层叠失效。',
    badCode: `<!-- ❌ 直接把 v-loading 挂在 el-select 自身 -->
<el-select v-model="val" v-loading="loading">
  <el-option v-for="item in list" :key="item.id" :label="item.name" :value="item.id" />
</el-select>`,
    goodCode: `<!-- ✅ 包裹外层容器 + 配合原生 :loading / :disabled 属性 -->
<div v-loading="loading" style="display: inline-block;">
  <el-select v-model="val" :loading="loading" :disabled="loading">
    <el-option v-for="item in list" :key="item.id" :label="item.name" :value="item.id" />
  </el-select>
</div>`,
    tips: '检查 package.json，确保 Vue 2.7 项目中没有残留 vue-template-compiler 依赖。'
  },
  {
    id: 'form-resetfields-initial-value',
    category: 'form',
    severity: 'high',
    title: 'el-form.resetFields() 经典大坑：先点“编辑”再点“新增”，表单无法清空！',
    components: [
      { label: 'Form 表单', docSlug: 'form' },
      { label: 'Dialog 对话框', docSlug: 'dialog' }
    ],
    source: 'ElemeFE/element GitHub 最高赞经典 Issue',
    summary: 'resetFields() 并非把字段置空，而是重置为组件首次挂载（mounted）时记录的 initialValue。',
    symptom:
      '新增和编辑共用同一个弹窗表单：如果页面刷新后**第一次**就点击“编辑”，把某行数据赋给 `form` 后打开弹窗，之后关闭弹窗再点击“新增”并调用 `resetFields()`，会发现表单里依然保留着刚才那条编辑记录的值，永远清不空！另外，没有写 `prop` 的表单项也完全不会被重置。',
    cause:
      '查看 Element UI 2.15 `form-item.vue` 源码：`initialValue` 是在 `el-form-item` 的 `mounted` 钩子中深拷贝记录的。若你在弹窗首次渲染前就给 `this.form` 赋了编辑值，那么 `initialValue` 就被永久锁死为编辑值。',
    badCode: `// ❌ 首次先点“编辑”时，弹窗内 el-form 尚未挂载，同步赋值会污染 initialValue
openEdit(row) {
  this.visible = true
  this.form = { ...row } // 挂载时记录的 initialValue 变成了 row！
}

openAdd() {
  this.visible = true
  this.$nextTick(() => {
    this.$refs.formRef.resetFields() // 重置后竟然又变回了上次编辑的 row！
  })
}`,
    goodCode: `// ✅ 方案 1：先显示弹窗，再在 $nextTick 中赋值，确保挂载时 initialValue 为空
openEdit(row) {
  this.visible = true
  this.$nextTick(() => {
    this.form = { ...row }
  })
}

// ✅ 方案 2：手动还原初始数据 + clearValidate（最稳妥，见本工程 BestPracticeDialog.vue）
resetForm() {
  this.form = this.$options.data().form
  this.$nextTick(() => {
    this.$refs.formRef && this.$refs.formRef.clearValidate()
  })
}`,
    tips: '切记：每个需要被 resetFields() 重置的 el-form-item 都必须配置对应的 prop 属性。'
  },
  {
    id: 'form-single-input-enter-refresh',
    category: 'form',
    severity: 'high',
    title: 'el-form 中只有一个输入框时，按回车键意外触发整页刷新',
    components: [
      { label: 'Form 表单', docSlug: 'form' },
      { label: 'Input 输入框', docSlug: 'input' }
    ],
    source: 'ElemeFE/element GitHub FAQ & W3C HTML 规范',
    summary: '单输入框搜索栏按 Enter 后 URL 多出问号并整页重载，路由状态全部丢失。',
    symptom:
      '在顶部搜索栏的 `<el-form>` 中如果只放了一个 `<el-input>`，用户在输入框里输入关键词后习惯性按回车，页面直接刷新跳转。',
    cause:
      'W3C 标准规定：当 HTML `<form>` 表单内仅有一个单行文本框时，在该输入框内按下 Enter 键会自动触发表单的原生 `submit` 事件，导致浏览器重新加载页面。',
    badCode: `<!-- ❌ 未阻止原生 submit，按回车会导致页面刷新 -->
<el-form :model="query" inline>
  <el-form-item label="关键词">
    <el-input v-model="query.keyword" @keyup.enter.native="handleSearch" />
  </el-form-item>
</el-form>`,
    goodCode: `<!-- ✅ 在 el-form 上添加 @submit.native.prevent -->
<el-form :model="query" inline @submit.native.prevent>
  <el-form-item label="关键词">
    <el-input
      v-model="query.keyword"
      placeholder="输入后按回车查询"
      @keyup.enter.native="handleSearch"
    />
  </el-form-item>
</el-form>`,
    tips: '建议在所有搜索类 el-form 上默认加上 @submit.native.prevent 养成习惯。'
  },
  {
    id: 'form-nested-and-array-validation',
    category: 'form',
    severity: 'tricky',
    title: '嵌套对象或 v-for 动态数组表单校验不生效 / 报错',
    components: [
      { label: 'Form 表单', docSlug: 'form' }
    ],
    source: 'Element UI 2.15 社区高频问题',
    summary: '绑定 form.user.name 或动态行 items[i].title 时，规则配置位置或路径写法错误导致校验失效。',
    symptom:
      '对深层字段写 `prop="user.name"` 时报错 `Cannot read property of undefined`，或动态增删行表单项点击校验直接跳过不提示红字。',
    cause:
      'Element UI 内部通过 `getPropByPath` 按点号 `.` 逐级解析 `model` 对象；若中间层级未在 `data()` 中初始化，或者动态行未把 `rules` 直接绑定在对应 `el-form-item` 上，就会解析失败。',
    badCode: `<!-- ❌ form.user 未初始化，或动态项未按路径绑定 prop -->
<el-form :model="form">
  <div v-for="(item, index) in form.items" :key="index">
    <el-form-item prop="title">
      <el-input v-model="item.title" />
    </el-form-item>
  </div>
</el-form>`,
    goodCode: `<!-- ✅ 嵌套对象预先初始化；动态数组拼接完整路径并把 rules 写在 form-item 上 -->
<el-form :model="form" ref="formRef">
  <el-form-item label="联系人" prop="user.name" :rules="[{ required: true, message: '必填', trigger: 'blur' }]">
    <el-input v-model="form.user.name" />
  </el-form-item>

  <div v-for="(item, index) in form.items" :key="item.uid">
    <el-form-item
      :label="'明细 ' + (index + 1)"
      :prop="'items.' + index + '.title'"
      :rules="[{ required: true, message: '请输入明细名称', trigger: 'blur' }]"
    >
      <el-input v-model="item.title" />
    </el-form-item>
  </div>
</el-form>`,
    tips: '动态增删行时，v-for 的 :key 务必使用唯一 ID（如 uid），避免删除中间行导致校验红字错位到下一行。'
  },
  {
    id: 'form-custom-validator-callback',
    category: 'form',
    severity: 'tricky',
    title: '自定义 validator 漏写 callback() 导致 form.validate() 永远不执行回调',
    components: [
      { label: 'Form 表单', docSlug: 'form' }
    ],
    source: 'async-validator / Element UI 常见问题',
    summary: '点击提交按钮毫无反应、也不报错，通常是某个自定义校验规则的分支忘记调用 callback()。',
    symptom:
      '在 `rules` 中写了自定义 `validator(rule, value, callback)` 后，调用 `this.$refs.form.validate((valid) => { ... })` 时回调函数完全不触发，界面无任何报错。',
    cause:
      'Element UI 2.15 内置的 `async-validator` 会等待所有字段的 `validator` 执行 `callback()` 才会汇总最终结果；只要有一条路径 `return` 时未调用 `callback()`，Promise/回调就会永久挂起。',
    badCode: `const checkPhone = (rule, value, callback) => {
  if (!value) {
    return callback(new Error('请输入手机号'))
  }
  if (!/^1\\d{10}$/.test(value)) {
    return callback(new Error('手机号格式不正确'))
  }
  // ❌ 校验通过分支漏写了 callback()，validate 将永久卡住！
}`,
    goodCode: `const checkPhone = (rule, value, callback) => {
  if (!value) {
    return callback(new Error('请输入手机号'))
  }
  if (!/^1\\d{10}$/.test(value)) {
    return callback(new Error('手机号格式不正确'))
  }
  // ✅ 所有分支都必须明确调用 callback()
  callback()
}`,
    tips: '调试 validate 无响应时，优先全局搜索当前页面所有的 validator，逐一检查每条 return 路径是否都调用了 callback()。'
  },
  {
    id: 'table-fixed-dolayout-misalign',
    category: 'table',
    severity: 'high',
    title: 'el-table 固定列（fixed）错位、合计行对不齐或隐藏 Tab 内表格塌陷',
    components: [
      { label: 'Table 表格', docSlug: 'table' },
      { label: 'Tabs 标签页', docSlug: 'tabs' }
    ],
    source: 'ElemeFE/element GitHub 高频 Issue',
    summary: '固定列滚动到底部错行、表尾合计行遮挡横向滚动条，或切到第二个 Tab 时表格列宽挤成一团。',
    symptom:
      '1) 表格有 `fixed="right"` 固定列时，数据异步加载、行高动态撑开或开启 `show-summary` 后，固定列与主表行高错位；2) 放在未激活 `el-tab-pane` 中的 `el-table`，切过去后表头和内容宽度异常。',
    cause:
      'Element UI 2.15 的 `el-table` 使用多套 DOM 同步模拟固定列与表尾，高度和列宽只在初始化及特定钩子计算；当组件处于 `display: none`（如未激活 Tab）或异步内容撑高行高时，内部测量值失效。',
    badCode: `// ❌ 数据加载或 Tab 切换后未触发重新布局
async fetchList() {
  this.tableData = await api.getList()
}`,
    goodCode: `// ✅ 1. 数据变化、列显隐、Tab 激活后调用 doLayout()
async fetchList() {
  this.tableData = await api.getList()
  this.$nextTick(() => {
    this.$refs.tableRef && this.$refs.tableRef.doLayout()
  })
}

// ✅ 2. 在 el-tabs 中配合 lazy 延迟渲染，或在 tab-click 时调用 doLayout()
// <el-tab-pane label="明细表" name="detail" lazy>
//   <el-table ref="detailTable" :data="list" />
// </el-tab-pane>`,
    tips: '若侧边菜单折叠/展开导致表格右侧留白，也可以在监听侧栏宽度变化结束后调用一次 doLayout()。'
  },
  {
    id: 'table-column-vif-disorder',
    category: 'table',
    severity: 'high',
    title: 'el-table-column 使用 v-if 动态切换显隐导致列顺序错乱或内容闪烁',
    components: [
      { label: 'Table 表格', docSlug: 'table' }
    ],
    source: 'ElemeFE/element GitHub 高频 Issue',
    summary: '动态配置展示列时，未加唯一 key 会让 Vue 复用列组件，造成表头与数据列错位。',
    symptom:
      '通过复选框控制某些 `<el-table-column v-if="showCol">` 显示/隐藏时，刚切换完列的位置跑到最后，或者原 A 列突然渲染成 B 列的内容。',
    cause:
      'Vue 2 虚拟 DOM 默认按同类型组件就地复用，多个 `<el-table-column>` 若未声明唯一 `key`，切换 `v-if` 时组件实例被复用，但 Element UI 内部 `insertColumn` 索引计算错乱。',
    badCode: `<!-- ❌ 缺少 key，动态切换 v-if 必然导致列顺序错乱 -->
<el-table :data="list">
  <el-table-column v-if="showPhone" prop="phone" label="手机号" />
  <el-table-column v-if="showEmail" prop="email" label="邮箱" />
</el-table>`,
    goodCode: `<!-- ✅ 每个动态列必须绑定稳定的唯一 key，并在切换后 doLayout -->
<el-table ref="tableRef" :data="list">
  <el-table-column v-if="showPhone" key="phone" prop="phone" label="手机号" />
  <el-table-column v-if="showEmail" key="email" prop="email" label="邮箱" />
</el-table>`,
    tips: '同样不要用 Math.random() 作为 key，否则每次重渲染都会销毁重建整列导致严重卡顿。'
  },
  {
    id: 'table-reserve-selection',
    category: 'table',
    severity: 'high',
    title: 'el-table 分页多选（type="selection"）翻页后勾选状态丢失',
    components: [
      { label: 'Table 表格', docSlug: 'table' },
      { label: 'Pagination 分页', docSlug: 'pagination' }
    ],
    source: 'Element UI 2.15 后台开发高频问题',
    summary: '在第 1 页勾选 3 条数据，切到第 2 页再切回第 1 页，原先勾选的数据全部消失。',
    symptom:
      '后端分页场景下每次切换页码都会替换 `:data` 数组，表格默认清空勾选状态，无法完成跨页批量导出或批量删除。',
    cause:
      '默认情况下 `el-table` 按对象引用追踪选中项；翻页拿到新数组后对象引用全部变化，未开启 `reserve-selection` 与 `row-key` 便无法识别跨页记录。',
    badCode: `<!-- ❌ 未设置 row-key 和 reserve-selection -->
<el-table :data="tableData" @selection-change="onSelectionChange">
  <el-table-column type="selection" width="55" />
</el-table>`,
    goodCode: `<!-- ✅ 必须同时在 table 设置 row-key 并在 selection 列开启 reserve-selection -->
<el-table
  ref="tableRef"
  :data="tableData"
  row-key="id"
  @selection-change="onSelectionChange"
>
  <el-table-column type="selection" width="55" :reserve-selection="true" />
</el-table>

<!-- 重置查询条件时别忘了手动清空跨页记忆：this.$refs.tableRef.clearSelection() -->`,
    tips: '注意：重新点击“查询/重置”切换筛选条件时，需要显式调用 clearSelection() 避免把旧条件下勾选的数据带入批量操作。'
  },
  {
    id: 'table-215-cell-class-and-tooltip',
    category: 'table',
    severity: 'tricky',
    title: '2.15.x 新增 .el-table__cell 导致旧样式失效 & show-overflow-tooltip 撑满全屏',
    components: [
      { label: 'Table 表格', docSlug: 'table' },
      { label: 'Tooltip 文字提示', docSlug: 'tooltip' }
    ],
    source: 'ElemeFE/element 2.15.6~2.15.14 变更 Issue',
    summary: '2.15 后期版本统一加入了 .el-table__cell 类；此外开启 show-overflow-tooltip 后长文案会撑爆屏幕宽度。',
    symptom:
      '1) 升级到 2.15.14 后，原本覆盖 `.el-table td` 的 padding/对齐样式被 `.el-table .el-table__cell` 更高优先级覆写；2) 字段内容有几百字时，开启 `show-overflow-tooltip` 鼠标悬浮弹出的黑框会横跨整个屏幕。',
    cause:
      'Element UI 2.15.6+ 为统一表头/表体单元格样式增加了 `.el-table__cell`；`show-overflow-tooltip` 内部复用的 `el-tooltip` 默认没有设置 `max-width`。',
    badCode: `/* ❌ 2.15.14 中优先级低于 .el-table .el-table__cell */
::v-deep .el-table td {
  padding: 6px 0;
}`,
    goodCode: `/* ✅ 1. 针对 2.15.14 单元格使用 .el-table__cell */
::v-deep .el-table .el-table__cell {
  padding: 8px 0;
}

/* ✅ 2. 在全局样式（非 scoped）限制 Tooltip 最大宽度并允许换行 */
.el-tooltip__popper {
  max-width: 480px;
  line-height: 1.6;
  word-break: break-word;
}`,
    tips: '如果表格内需要更复杂的气泡内容（如复制按钮、多行排版），建议改用自定义插槽 + el-popover。'
  },
  {
    id: 'datepicker-yyyy-case-trap',
    category: 'picker',
    severity: 'high',
    title: 'el-date-picker 的 value-format 大小写陷阱：写 YYYY-MM-DD 会出错！',
    components: [
      { label: 'DatePicker 日期选择器', docSlug: 'date-picker' },
      { label: 'DateTimePicker 日期时间选择器', docSlug: 'datetime-picker' }
    ],
    source: 'Element UI 2.15 官方文档 & 社区高频踩坑',
    summary: 'Element UI 2.x 必须使用小写 yyyy 和 dd，这与 Day.js / Element Plus 的 YYYY-MM-DD 恰好相反！',
    symptom:
      '配置 `value-format="YYYY-MM-DD"` 后，选择日期结果变成字面量 `"YYYY-11-DD"`，或者在跨年周（12月底/1月初）出现年份错误，甚至后端直接报错解析失败。',
    cause:
      'Element UI 2.15 内部日期格式化工具遵循 `yyyy`（年）、`MM`（月）、`dd`（日）、`HH`（24小时）、`mm`（分）、`ss`（秒）规则，不识别大写的 `YYYY` / `DD`。',
    badCode: `<!-- ❌ 错误：直接照搬 Day.js / Moment / Element Plus 的大写格式 -->
<el-date-picker
  v-model="date"
  type="date"
  value-format="YYYY-MM-DD"
/>`,
    goodCode: `<!-- ✅ 正确：Element UI 2.15 严格使用小写 yyyy 与 dd -->
<el-date-picker
  v-model="date"
  type="date"
  format="yyyy-MM-dd"
  value-format="yyyy-MM-dd"
  placeholder="选择日期"
/>

<!-- 日期时间完整格式 -->
<el-date-picker
  v-model="datetime"
  type="datetime"
  value-format="yyyy-MM-dd HH:mm:ss"
/>`,
    tips: '特别注意月份是大写 MM，分钟是小写 mm，24小时制是大写 HH。'
  },
  {
    id: 'datepicker-daterange-clear-null',
    category: 'picker',
    severity: 'high',
    title: 'daterange 日期范围点击清空后变为 null，解构或取下标 [0] 直接崩溃',
    components: [
      { label: 'DatePicker 日期选择器', docSlug: 'date-picker' }
    ],
    source: 'ElemeFE/element GitHub 高频 Issue',
    summary: '点击清除图标后，v-model 绑定的值会从 Array 变成 null，直接读取 dateRange[0] 会抛 TypeError。',
    symptom:
      '页面初始 `dateRange: []` 一切正常，但用户选中一段日期后再点右侧“×”清空，紧接着触发查询或 `computed` 中写 `this.dateRange[0]`，控制台直接抛出 `Cannot read properties of null (reading "0")`。',
    cause:
      'Element UI 2.15 的 `DatePicker` 清空逻辑统一将绑定的 `value` 置为 `null`，而非根据 `range` 模式还原为空数组 `[]`。',
    badCode: `// ❌ 清空后 this.dateRange 为 null，解构直接报错崩溃
search() {
  const [startTime, endTime] = this.dateRange
  api.list({ startTime, endTime })
}`,
    goodCode: `<!-- ✅ 方式 1：取值时兜底空数组 -->
const [startTime = '', endTime = ''] = this.dateRange || []

<!-- ✅ 方式 2：在 @change 中将 null 规范化为 [] -->
<el-date-picker
  v-model="dateRange"
  type="daterange"
  value-format="yyyy-MM-dd"
  @change="(val) => { if (!val) dateRange = [] }"
/>`,
    tips: '若业务希望选择完整范围时自动附带 00:00:00 和 23:59:59，可使用 :default-time="[\'00:00:00\', \'23:59:59\']"。'
  },
  {
    id: 'select-type-mismatch-and-value-key',
    category: 'picker',
    severity: 'high',
    title: 'el-select 回显直接显示 ID 数字，或绑定对象显示 [object Object]',
    components: [
      { label: 'Select 选择器', docSlug: 'select' }
    ],
    source: 'Element UI 2.15 社区最高频基础坑',
    summary: 'Number 与 String 严格全等不匹配导致回显异常；绑定整个对象时必须指定 value-key。',
    symptom:
      '1) 编辑页接口返回 `status: "1"`（字符串），下拉选项 `:value="1"`（数字），输入框里直接显示 `"1"` 而不是 `"已启用"`；2) 把对象作为 `:value="item"` 绑定时，无法正确高亮回显或显示 `[object Object]`。',
    cause:
      '`el-select` 内部使用严格相等（`===`）比对 `v-model` 与 `el-option` 的 `value`；当 `value` 为引用类型对象时，必须通过 `value-key` 指定唯一属性名进行比对。',
    badCode: `<!-- ❌ 1. 常见类型不匹配：v-model="1" (number) vs value="1" (string) -->
<el-select v-model="form.status">
  <el-option label="已启用" value="1" />
</el-select>

<!-- ❌ 2. 绑定对象但未指定 value-key -->
<el-select v-model="selectedUser">
  <el-option v-for="u in users" :key="u.id" :label="u.name" :value="u" />
</el-select>`,
    goodCode: `<!-- ✅ 1. 加上冒号确保类型为数字，或统一转成字符串 -->
<el-select v-model="form.status">
  <el-option label="已启用" :value="1" />
</el-select>

<!-- ✅ 2. 绑定对象必须同时设置 value-key -->
<el-select v-model="selectedUser" value-key="id">
  <el-option v-for="u in users" :key="u.id" :label="u.name" :value="u" />
</el-select>`,
    tips: '如果下拉选项依赖异步接口返回，编辑态可能短暂闪现原始 ID，可在选项加载完成后再展示或配合 loading 态。'
  },
  {
    id: 'select-popper-scroll-drift',
    category: 'picker',
    severity: 'tricky',
    title: '自定义滚动容器内，el-select / el-date-picker 下拉框随滚动“飘走”错位',
    components: [
      { label: 'Select 选择器', docSlug: 'select' },
      { label: 'Cascader 级联选择器', docSlug: 'cascader' }
    ],
    source: 'ElemeFE/element Popper 定位经典 Issue',
    summary: '下拉菜单默认插入到 body 下，当局部 div 容器滚动时，浮层不会跟随输入框一起移动。',
    symptom:
      '在弹窗、抽屉或带独立滚动条的布局面板里展开 `el-select` 下拉菜单后滚动鼠标滚轮，输入框滚走了，下拉面板却悬浮停留在原来的屏幕坐标上。',
    cause:
      'Element UI 2.15 默认 `popper-append-to-body="true"`，Popper.js 将浮层绝对定位在 `document.body` 上，部分嵌套滚动容器的滚动事件无法触发浮层重算。',
    badCode: `<!-- ❌ 在局部滚动容器内保持默认 append-to-body 容易定位脱离 -->
<el-select v-model="val">
  <el-option label="选项一" value="1" />
</el-select>`,
    goodCode: `<!-- ✅ 关闭插入 body，使下拉框相对组件父容器定位跟随滚动 -->
<el-select v-model="val" :popper-append-to-body="false">
  <el-option label="选项一" value="1" />
</el-select>

<!-- 注：el-date-picker / el-cascader 对应属性名为 :append-to-body="false" -->`,
    tips: '开启 :popper-append-to-body="false" 前请确认外层父容器没有 overflow: hidden，否则下拉框边缘会被裁切。'
  },
  {
    id: 'dialog-refs-and-destroy-on-close',
    category: 'overlay',
    severity: 'high',
    title: 'el-dialog 首次打开 $refs 为 undefined、destroy-on-close 坑及嵌套遮罩变黑',
    components: [
      { label: 'Dialog 对话框', docSlug: 'dialog' },
      { label: 'Drawer 抽屉', docSlug: 'drawer' }
    ],
    source: 'ElemeFE/element GitHub Issues (#18015 等)',
    summary: '弹窗内容懒挂载，同步取 $refs 必报错；复杂子组件用 v-if 控制销毁比 destroy-on-close 更可靠。',
    symptom:
      '1) `this.visible = true` 下一行直接调用 `this.$refs.innerForm` 报 `undefined`；2) 2.15.x 开启 `destroy-on-close` 搭配复杂子组件（如 `el-tabs`）偶尔出现关闭卡顿或内部状态未彻底重置；3) 弹窗套弹窗导致遮罩叠加发黑或层级错乱。',
    cause:
      '`el-dialog` 在首次打开前不会渲染默认插槽内容；`destroy-on-close` 在 2.15.x 内部通过修改 key 强制重渲染实现，某些嵌套组件生命周期清理不够干净。',
    badCode: `<!-- ❌ 同步访问 $refs 报错；嵌套弹窗未 append-to-body -->
<el-dialog :visible.sync="visible">
  <el-form ref="innerForm" />
  <el-dialog :visible.sync="innerVisible" />
</el-dialog>`,
    goodCode: `<!-- ✅ 1. 用 @opened 或 $nextTick 访问 $refs -->
<!-- ✅ 2. 用 v-if="visible" 彻底销毁重建复杂子组件状态 -->
<!-- ✅ 3. 嵌套弹窗务必加 append-to-body -->
<el-dialog :visible.sync="visible" @opened="onDialogOpened">
  <ComplexForm v-if="visible" ref="innerForm" />

  <el-dialog :visible.sync="innerVisible" append-to-body width="420px">
    嵌套子弹窗内容
  </el-dialog>
</el-dialog>`,
    tips: '如果希望保留弹窗关闭退场动画同时清空内容，可在 @closed 回调中重置数据，或把 v-if 绑定到延迟关闭标记上。'
  },
  {
    id: 'tree-setcheckedkeys-parent-trap',
    category: 'overlay',
    severity: 'high',
    title: 'el-tree 权限树回显：setCheckedKeys 传入父节点 ID 导致子节点被全选！',
    components: [
      { label: 'Tree 树形控件', docSlug: 'tree' }
    ],
    source: 'ElemeFE/element GitHub 高频 Issue',
    summary: '后端保存了半选父节点 ID，回显时直接传给 setCheckedKeys 会把该父节点下所有未勾选的子节点全部勾上。',
    symptom:
      '角色权限编辑场景中，某个菜单原本只勾选了 3 个子权限中的 1 个（父节点呈半选状态），提交时连同半选父节点一并存入后端；再次打开编辑调用 `setCheckedKeys(savedIds)` 时，发现 3 个子权限竟然被全部勾选了！',
    cause:
      '`el-tree` 默认 `check-strictly="false"`（父子联动）。只要 `setCheckedKeys` 数组里包含父节点 key，组件就会触发向下级联全选。',
    badCode: `// ❌ 直接把含半选父节点的数组交给 setCheckedKeys，导致子节点被全选
this.$refs.tree.setCheckedKeys(savedAllIds)`,
    goodCode: `// ✅ 方案 1（最推荐）：遍历判断仅对叶子节点调用 setChecked(id, true, false)
this.$nextTick(() => {
  savedAllIds.forEach((id) => {
    const node = this.$refs.tree.getNode(id)
    if (node && node.isLeaf) {
      this.$refs.tree.setChecked(node, true, false)
    }
  })
})

// ✅ 方案 2：回显瞬间开启 checkStrictly，勾选后再关闭恢复联动
this.checkStrictly = true
this.$nextTick(() => {
  this.$refs.tree.setCheckedKeys(savedAllIds)
  this.checkStrictly = false
})`,
    tips: '使用 setCheckedKeys / getCheckedKeys / getHalfCheckedKeys 前，务必在 el-tree 上声明唯一的 node-key="id"。'
  },
  {
    id: 'pagination-double-request',
    category: 'overlay',
    severity: 'tricky',
    title: 'el-pagination 在非第 1 页切换每页条数（page-size）触发两次接口请求',
    components: [
      { label: 'Pagination 分页', docSlug: 'pagination' }
    ],
    source: 'ElemeFE/element GitHub 经典 Issue',
    summary: '在第 3 页把每页条数调大导致总页数缩减时，@size-change 和 @current-change 会连续触发两次请求。',
    symptom:
      '列表共 35 条数据、每页 10 条，当前停在第 4 页；此时把下拉每页条数改为 50 条，控制台 Network 面板会发现列表查询接口被瞬间发送了 2 次（一次 page=4，一次 page=1），且先发后返还可能导致数据错乱。',
    cause:
      '当新的总页数小于当前 `current-page` 时，Element UI 2.15 内部会自动修正页码并触发 `current-change`，因此两个事件回调都会执行。',
    badCode: `// ❌ 两个回调各自直接发请求，非第一页调大 pageSize 必发两次请求
handleSizeChange(val) {
  this.pageSize = val
  this.fetchList()
},
handleCurrentChange(val) {
  this.currentPage = val
  this.fetchList()
}`,
    goodCode: `// ✅ 在切换 pageSize 时判断页码溢出或加锁避免重复请求
handleSizeChange(val) {
  this.pageSize = val
  this.isChangingSize = true
  this.currentPage = 1
  this.fetchList()
  this.$nextTick(() => {
    this.isChangingSize = false
  })
},
handleCurrentChange(val) {
  if (this.isChangingSize) return
  this.currentPage = val
  this.fetchList()
}`,
    tips: '更进一步可以给 fetchList 配合 AbortController 或请求序号，彻底杜绝慢响应覆盖新结果。'
  }
]
