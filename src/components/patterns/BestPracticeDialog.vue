<template>
  <el-dialog
    :title="mode === 'edit' ? '编辑数据' : '新增数据'"
    :visible.sync="visible"
    width="520px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="92px"
      size="small"
    >
      <el-form-item label="姓名 / 名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入名称" clearable />
      </el-form-item>

      <el-form-item label="年龄" prop="age">
        <el-input-number v-model="formData.age" :min="1" :max="120" style="width: 100%;" />
      </el-form-item>

      <el-form-item label="角色" prop="role">
        <el-select v-model="formData.role" placeholder="请选择角色" style="width: 100%;">
          <el-option label="管理员" value="管理员" />
          <el-option label="研发工程师" value="研发工程师" />
          <el-option label="产品经理" value="产品经理" />
          <el-option label="测试工程师" value="测试工程师" />
        </el-select>
      </el-form-item>

      <el-form-item label="高级选项">
        <el-switch
          v-model="showAdvanced"
          active-text="展开临时业务区"
          inactive-text="收起"
        />
      </el-form-item>

      <!-- 模拟复杂临时状态，验证下次 open 时自动一键清空 -->
      <div v-if="showAdvanced" class="advanced-box">
        <div class="advanced-row">
          <el-button
            size="mini"
            type="primary"
            plain
            :loading="isUploading"
            icon="el-icon-upload2"
            @click="mockUpload"
          >
            {{ isUploading ? '模拟上传中...' : '模拟上传附件' }}
          </el-button>
          <el-button size="mini" plain icon="el-icon-plus" @click="addTempTag">
            添加临时标签
          </el-button>
        </div>

        <div v-if="tempList.length > 0" class="temp-tags">
          <el-tag
            v-for="(tag, idx) in tempList"
            :key="idx"
            size="mini"
            closable
            @close="tempList.splice(idx, 1)"
          >
            {{ tag }}
          </el-tag>
        </div>
        <p v-else class="advanced-hint">
          可随意切换开关、触发 Loading 或添加临时标签，关闭后再次打开弹窗，所有状态均会瞬间还原。
        </p>
      </div>
    </el-form>

    <span slot="footer" class="dialog-footer">
      <el-button size="small" @click="visible = false">取 消</el-button>
      <el-button size="small" type="primary" :loading="submitting" @click="submit">
        确 定
      </el-button>
    </span>
  </el-dialog>
</template>

<script>
export default {
  name: 'BestPracticeDialog',
  data() {
    return {
      visible: false,
      mode: 'add',
      submitting: false,
      formData: {
        id: null,
        name: '',
        age: 24,
        role: '研发工程师'
      },
      rules: {
        name: [
          { required: true, message: '请输入名称', trigger: 'blur' },
          { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
        ],
        role: [{ required: true, message: '请选择角色', trigger: 'change' }]
      },
      showAdvanced: false,
      isUploading: false,
      tempList: []
    }
  },
  methods: {
    /**
     * 暴露给父组件通过 ref 调用的统一入口
     * @param {Object|null} rowData 传入行数据时为编辑态，不传为新增态
     */
    open(rowData = null) {
      // 核心魔法：一键将组件内所有 data 状态还原为初始值
      Object.assign(this.$data, this.$options.data.call(this))

      if (rowData) {
        this.mode = 'edit'
        // 深拷贝避免直接修改父组件行对象
        this.formData = {
          ...this.formData,
          ...JSON.parse(JSON.stringify(rowData))
        }
      }

      this.visible = true

      // 等待 DOM 就绪后清除上一次可能残留的校验提示
      this.$nextTick(() => {
        if (this.$refs.formRef) {
          this.$refs.formRef.clearValidate()
        }
      })
    },

    mockUpload() {
      this.isUploading = true
      setTimeout(() => {
        // 若弹窗已关闭并被重置，避免旧异步回写污染
        if (!this.visible) return
        this.isUploading = false
        this.tempList.push(`附件_${this.tempList.length + 1}.pdf`)
      }, 900)
    },

    addTempTag() {
      this.tempList.push(`临时项 #${this.tempList.length + 1}`)
    },

    submit() {
      this.$refs.formRef.validate((valid) => {
        if (!valid) return
        this.submitting = true
        setTimeout(() => {
          this.submitting = false
          this.visible = false
          this.$emit('success', {
            mode: this.mode,
            data: JSON.parse(JSON.stringify(this.formData)),
            tempCount: this.tempList.length
          })
        }, 260)
      })
    },

    handleClose() {
      // 关闭时无需手动逐个清空变量，留待下次 open() 统一重置，
      // 这样可避免关闭动画播放期间界面内容突然闪烁清空。
    }
  }
}
</script>

<style scoped lang="scss">
.advanced-box {
  margin-left: 92px;
  padding: 12px 14px;
  background: #f8fafc;
  border: 1px dashed #cbd5e1;
  border-radius: 8px;
}

.advanced-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.temp-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.advanced-hint {
  font-size: 12px;
  color: #64748b;
  margin: 0;
  line-height: 1.6;
}
</style>
