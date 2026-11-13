<template>
  <el-dialog
    :title="type === 'add' ? '新建用户' : '编辑用户'"
    :visible.sync="visible"
    width="500px"
    @closed="resetForm"
  >
    <el-form ref="userForm" :model="form" :rules="rules" label-width="80px">
      <el-form-item label="日期" prop="date">
        <el-date-picker
          v-model="form.date"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="选择日期"
          style="width: 100%;"
        />
      </el-form-item>
      <el-form-item label="姓名" prop="name">
        <el-input v-model="form.name" placeholder="请输入姓名" />
      </el-form-item>
      <el-form-item label="角色" prop="role">
        <el-input v-model="form.role" placeholder="请输入角色" />
      </el-form-item>
      <el-form-item label="地址" prop="address">
        <el-input v-model="form.address" placeholder="请输入地址" />
      </el-form-item>
    </el-form>
    <span slot="footer">
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="submit">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
export default {
  name: 'UserDialog',
  data() {
    return {
      visible: false,
      type: 'add',
      form: {
        id: null,
        date: '',
        name: '',
        role: '普通用户',
        address: ''
      },
      rules: {
        name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
        role: [{ required: true, message: '请输入角色', trigger: 'blur' }]
      }
    }
  },
  methods: {
    show({ data = {}, type = 'add' } = {}) {
      Object.assign(this.$data, this.$options.data.call(this))
      this.type = type
      this.form = Object.assign({}, this.form, data)
      this.visible = true
      this.$nextTick(() => {
        this.$refs.userForm.clearValidate()
      })
    },
    resetForm() {
      Object.assign(this.$data, this.$options.data.call(this))
    },
    submit() {
      this.$refs.userForm.validate(valid => {
        if (!valid) return
        this.$emit('submit', {
          type: this.type,
          data: Object.assign({}, this.form)
        })
        this.visible = false
      })
    }
  }
}
</script>
