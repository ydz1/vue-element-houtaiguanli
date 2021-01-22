<template>
    <div>
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>商品管理</el-breadcrumb-item>
        <el-breadcrumb-item>参数列表</el-breadcrumb-item>
      </el-breadcrumb>
      <el-card>
        <el-alert
          title="注意: 只允许为第二级分类设置相关参数"
          type="warning"
          show-icon
          :closable="false">
        </el-alert>
        <el-row class="cat_opt">
          <el-col>
            <span>选择商品分类:</span>
<!--            级联选择框-->
            <el-cascader
              v-model="cartListId"
              :options="cartList"
              :props="{ expandTrigger: 'hover',value:'cat_id',label:'cat_name' }"
              @change="cartSelectChange">
            </el-cascader>
          </el-col>
        </el-row>
<!--        tab页签区域-->
        <el-tabs v-model="activeName" @tab-click="handleTabClick">
<!--          添加动态参数面板-->
          <el-tab-pane label="动态参数" name="many">
            <el-button type="primary" size="mini" :disabled="isBtnDisable" @click="showAddDialog">添加参数</el-button>
            <el-table :data="manyTableData" border stripe>
              <el-table-column type="expand">
                <template v-slot="scope">
                  <el-tag closable v-for="(item, index) in scope.row.attr_vals" :key="index" @close="handleClose(index,scope.row)">{{item}}</el-tag>
                  <el-input
                    class="input-new-tag"
                    v-if="scope.row.inputVisible"
                    v-model="scope.row.inputValue"
                    ref="saveTagInput"
                    size="small"
                    @keyup.enter.native="handleInputConfirm(scope.row)"
                    @blur="handleInputConfirm(scope.row)">
                  </el-input>
                  <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                </template>
              </el-table-column>
              <el-table-column type="index" label="#"></el-table-column>
              <el-table-column label="参数名称" prop="attr_name"></el-table-column>
              <el-table-column label="操作">
                <template v-slot="scope">
                <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                <el-button size="mini" type="danger" icon="el-icon-delete" @click="deleteCate(scope.row.attr_id)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
<!--          添加静态属性面板-->
          <el-tab-pane label="静态属性" name="only">
            <el-button type="primary" size="mini" :disabled="isBtnDisable" @click="showAddDialog">添加属性</el-button>
            <el-table :data="onlyTableData" border stripe>
              <el-table-column type="expand">
                <template v-slot="scope">
                  <el-tag closable v-for="(item, index) in scope.row.attr_vals" :key="index" @close="handleClose(index,scope.row)">{{item}}</el-tag>
                  <el-input
                    class="input-new-tag"
                    v-if="scope.row.inputVisible"
                    v-model="scope.row.inputValue"
                    ref="saveTagInput"
                    size="small"
                    @keyup.enter.native="handleInputConfirm(scope.row)"
                    @blur="handleInputConfirm(scope.row)">
                  </el-input>
                  <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                </template>
              </el-table-column>
              <el-table-column type="index" label="#"></el-table-column>
              <el-table-column label="属性名称" prop="attr_name"></el-table-column>
              <el-table-column label="操作">
<!--                eslint-disable-next-line-->
                <template v-slot="scope">
                  <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                  <el-button size="mini" type="danger" icon="el-icon-delete" @click="deleteCate(scope.row.attr_id)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
        </el-tabs>
<!--        添加按钮弹框-->
        <el-dialog
          :title="'添加' + this.checkCate"
          :visible.sync="addDialogVisible"
          width="50%" @close="addDialogClose">
          <el-form ref="addFormRef" :model="addForm" :rules="addFormRules" label-width="80px">
            <el-form-item :label="this.checkCate" prop="attr_name">
              <el-input v-model="addForm.attr_name"></el-input>
            </el-form-item>
          </el-form>
          <span slot="footer" class="dialog-footer">
            <el-button @click="addDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="addCate">确 定</el-button>
          </span>
        </el-dialog>
<!--        修改按钮弹框-->
        <el-dialog
          :title="'修改' + this.checkCate"
          :visible.sync="editDialogVisible"
          width="50%" @close="editDialogClose">
          <el-form ref="editFormRef" :model="editForm" :rules="editFormRules" label-width="80px">
            <el-form-item :label="this.checkCate" prop="attr_name">
              <el-input v-model="editForm.attr_name"></el-input>
            </el-form-item>
          </el-form>
          <span slot="footer" class="dialog-footer">
            <el-button @click="editDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="editCate">确 定</el-button>
          </span>
        </el-dialog>
      </el-card>
    </div>
</template>

<script>
export default {
  data () {
    return {
      // 获取到的商品分类信息
      cartList: [],
      // 级联选择器选择的分类id数组
      cartListId: [],
      // tab栏选中的页签
      activeName: 'many',
      // 动态参数数据
      manyTableData: [],
      // 静态属性数据
      onlyTableData: [],
      // 添加弹框是否展示
      addDialogVisible: false,
      // 添加弹框的表单信息
      addForm: {},
      // 添加弹框的表单验证规则
      addFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      },
      // 控制修改对话框是否显示
      editDialogVisible: false,
      // 修改的对象
      editForm: {},
      // 修改的对象校验规则
      editFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      },
      // 控制按钮与文本框的切换
      inputVisible: false,
      // 输入框双向绑定数据
      inputValue: ''
    }
  },
  created () {
    this.getCartList()
  },
  methods: {
    // 获取分类数据
    async getCartList () {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品列表失败')
      }
      this.cartList = res.data
    },
    // 级联选择器选择项改变时调用
    cartSelectChange () {
      this.getCateParams()
    },
    // tab栏点击调用
    handleTabClick () {
      this.getCateParams()
    },
    // 获取分类参数列表
    async getCateParams () {
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: this.activeName } })
      if (res.meta.status !== 200) {
        return this.$message.error('获取信息失败')
      }
      console.log(res.data)
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : []
        // 控制文本框显示与隐藏
        item.inputVisible = false
        // 双向绑定文本框输入值
        item.inputValue = ''
      })
      console.log(res.data)
      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
    },
    // 点击按钮展示添加弹框
    showAddDialog () {
      this.addDialogVisible = true
    },
    // 添加弹框关闭时调用
    addDialogClose () {
      this.$refs.addFormRef.resetFields()
    },
    // 添加数据
    addCate () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return
        }
        const { data: res } = await this.$http.post(`categories/${this.cateId}/attributes`, { attr_name: this.addForm.attr_name, attr_sel: this.activeName })
        if (res.meta.status !== 201) {
          return this.$message.error('添加失败')
        }
        this.$message.success('添加成功')
        this.addDialogVisible = false
        this.getCateParams()
      })
    },
    // 点击编辑按钮展示编辑对话框
    async showEditDialog (id) {
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes/${id}`, { attr_sel: this.activeName })
      if (res.meta.status !== 200) {
        return this.$message.error('查询信息失败')
      }
      this.editForm = res.data
      console.log(this.editForm)
      this.editDialogVisible = true
    },
    // 编辑弹框关闭时重置表单
    editDialogClose () {
      this.$refs.editFormRef.resetFields()
    },
    // 点击完成修改操作
    editCate () {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`, { attr_name: this.editForm.attr_name, attr_sel: this.activeName })
        if (res.meta.status !== 200) {
          return this.$message.error('修改数据失败')
        }
        this.$message.success('修该数据成功')
        this.editDialogVisible = false
        this.getCateParams()
      })
    },
    // 点击按钮删除参数
    async deleteCate (id) {
      const state = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (state !== 'confirm') {
        return this.$message.info('删除操作已取消')
      }
      const { data: res } = await this.$http.delete(`categories/${this.cateId}/attributes/${id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除操作失败')
      }
      this.$message.success('删除操作成功')
      this.getCateParams()
    },
    // 输入框点击enter和失去焦点时调用
    async handleInputConfirm (row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return
      }
      // 用户输入真实数据,可进行后续操作
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false
      this.saveAttr(row)
    },
    // 保存编辑和删除操作
    async saveAttr (row) {
      // 发送请求，保存这次操作
      const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, { attr_name: row.attr_name, attr_sel: row.attr_sel, attr_vals: row.attr_vals.join(',') })
      if (res.meta.status !== 200) {
        return this.$message.error('修改参数失败')
      }
      this.$message.success('修改参数成功')
    },
    // 点击按钮获取输入框焦点
    showInput (row) {
      row.inputVisible = true
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 删除参数
    async handleClose (index, row) {
      row.attr_vals.splice(index, 1)
      this.saveAttr(row)
    }
  },
  computed: {
    isBtnDisable () {
      if (this.cartListId.length !== 3) {
        return true
      }
      return false
    },
    // 获取三级分类的id值
    cateId () {
      if (this.cartListId.length !== 3) {
        return null
      }
      return this.cartListId[2]
    },
    // 弹框分类，确定是动态参数还是静态属性
    checkCate () {
      if (this.activeName === 'many') {
        return '动态参数'
      }
      return '静态属性'
    }
  }
}
</script>

<style lang="less" scoped>
.cat_opt{
  margin: 15px 0;
}
.input-new-tag{
  width:120px;
}
</style>
