<template>
    <div>
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>商品管理</el-breadcrumb-item>
        <el-breadcrumb-item>商品分类</el-breadcrumb-item>
      </el-breadcrumb>
      <el-card>
        <el-row>
          <el-col>
            <el-button type="primary" @click="showAddDialog">添加分类</el-button>
          </el-col>
        </el-row>
<!--        表格区域-->
        <tree-table class="treeTable" :data="cateList" :columns="columns" :selection-type="false" :expand-type="false" show-index index-text="#" border>
<!--          是否有效-->
          <template v-slot:isok="scope">
            <i class="el-icon-success" v-if="scope.row.cat_deleted === false" style="color:lightGreen"></i>
            <i class="el-icon-error" v-else style="color:red"></i>
          </template>
<!--          排序-->
          <template v-slot:order="scope">
            <el-tag v-if="scope.row.cat_level===0">一级</el-tag>
            <el-tag type="success" size="mini" v-else-if="scope.row.cat_level===1">二级</el-tag>
            <el-tag type="warning" size="mini" v-else>三级</el-tag>
          </template>
<!--          eslint-disable-next-line-->
          <template v-slot:option="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.cat_id)">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="showDeleteCateBox(scope.row.cat_id)">删除</el-button>
          </template>
        </tree-table>
<!--        分页区域-->
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryInfo.pagenum"
          :page-sizes="[3, 5, 10, 15]"
          :page-size="queryInfo.pagesize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
        </el-pagination>
<!--        添加分类的对话框-->
        <el-dialog
          title="提示"
          :visible.sync="addCateDialogVisible"
          width="50%" @close="addCateDialogClose">
          <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px">
            <el-form-item label="分类名称:" prop="cat_name">
              <el-input v-model="addCateForm.cat_name"></el-input>
            </el-form-item>
            <el-form-item label="父级分类:">
              <el-cascader
                v-model="parentCateId"
                :options="parentCateList"
                :props="{ expandTrigger: 'hover', value:'cat_id', label:'cat_name',children:'children',checkStrictly:true }"
                @change="parentCateChange" style="width:100%" clearable>
              </el-cascader>
            </el-form-item>
          </el-form>
          <span slot="footer" class="dialog-footer">
            <el-button @click="addCateDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="addCate">确 定</el-button>
          </span>
        </el-dialog>
<!--        修改分类的对话框-->
        <el-dialog
          title="修改分类"
          :visible.sync="editCateDialogVisible"
          width="50%">
          <el-form :model="editDialogForm" :rules="editDialogFormRules" label-width="100px" ref="editDialogFormRef">
            <el-form-item label="分类名称" prop="cat_name">
              <el-input v-model="editDialogForm.cat_name"></el-input>
            </el-form-item>
          </el-form>
          <span slot="footer" class="dialog-footer">
            <el-button @click="editCateDialogVisible = false">取 消</el-button>
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
      // 获取的商品列表数据
      cateList: [],
      // 查询参数
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 查询到的商品分类总条数
      total: 0,
      // 为table指定树的列
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          type: 'template',
          template: 'isok'
        },
        {
          label: '排序',
          type: 'template',
          template: 'order'
        },
        {
          label: '操作',
          type: 'template',
          template: 'option'
        }
      ],
      // 添加分类对话框是否显示
      addCateDialogVisible: false,
      // 添加分类对话框表单数据
      addCateForm: {
        // 分类名称
        cat_name: '',
        // 父级分类id
        cat_pid: 0,
        // 分类层级
        cat_level: 0
      },
      // 添加分类对话框表单验证规则
      addCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      // 添加分类对话框的父级分类
      parentCateList: [],
      // 存放选择的的父级分类id
      parentCateId: [],
      // 修改分类对话框是否显示
      editCateDialogVisible: false,
      // 修改分类对话框表单数据
      editDialogForm: {},
      // 修改分类对话框表单验证规则
      editDialogFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    async getCateList () {
      const { data: res } = await this.$http.get('categories', { params: this.queryInfo })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品信息失败')
      }
      console.log(res)
      this.cateList = res.data.result
      this.total = res.data.total
    },
    // 监视pagesize改变
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    // 监听pagenum改变
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getCateList()
    },
    // 控制添加分类对话框显示
    showAddDialog () {
      // 先获取父级分类，在打开对话框
      this.getParentCateList()
      this.addCateDialogVisible = true
    },
    // 获取父级分类数据列表
    async getParentCateList () {
      const { data: res } = await this.$http.get('categories', { params: { type: 2 } })
      if (res.meta.status !== 200) {
        return this.$message.error('获取父级分类数据失败')
      }
      this.parentCateList = res.data
      console.log(res.data)
    },
    // 父级分类改变时调用
    parentCateChange () {
      // 如果parentCateId的length=0，则表示未选中父级分类，>0则表示选中了父级分类
      if (this.parentCateId.length > 0) {
        // 父级分类的id
        this.addCateForm.cat_pid = this.parentCateId[this.parentCateId.length - 1]
        // 为当前分类的等级赋值
        this.addCateForm.cat_level = this.parentCateId.length
      } else {
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
    },
    // 添加新的分类
    addCate () {
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('categories', this.addCateForm)
        if (res.meta.status !== 201) {
          return this.$message.error('添加分类失败')
        }
        this.$message.success('添加分类成功')
        this.getCateList()
        this.addCateDialogVisible = false
      })
    },
    // 监听添加分类对话框关闭，重置表单的级联列表
    addCateDialogClose () {
      this.$refs.addCateFormRef.resetFields()
      this.parentCateId = []
      this.addCateForm.cat_pid = 0
      this.addCateForm.cat_level = 0
    },
    // 控制编辑分类对话框显现
    async showEditDialog (id) {
      // 先根据id获取分类信息，再打开编辑分类对话框
      const { data: res } = await this.$http.get('categories/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('获取信息失败')
      }
      this.editDialogForm = res.data
      this.editCateDialogVisible = true
    },
    // 编辑修改分类
    editCate () {
      this.$refs.editDialogFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put('categories/' + this.editDialogForm.cat_id, { cat_name: this.editDialogForm.cat_name })
        if (res.meta.status !== 200) {
          return this.$message.error('修改分类失败')
        }
        this.$message.success('修改分类成功')
        this.editCateDialogVisible = false
        this.getCateList()
      })
    },
    // 显示删除分类消息框
    async showDeleteCateBox (id) {
      const state = await this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (state !== 'confirm') {
        return this.$message.info('取消删除')
      }
      const { data: res } = await this.$http.delete('categories/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('删除失败')
      }
      this.$message.success('删除成功')
      this.getCateList()
    }
  }
}
</script>

<style lang="less" scoped>
  .treeTable {
    margin-bottom: 15px;
  }
</style>
