<template>
    <div>
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>商品管理</el-breadcrumb-item>
        <el-breadcrumb-item>添加商品</el-breadcrumb-item>
      </el-breadcrumb>
      <el-card>
        <el-alert
          title="添加商品信息"
          type="info"
          show-icon>
        </el-alert>
        <el-steps :space="200" :active="+activeStep" finish-status="success" align-center>
          <el-step title="基本信息"></el-step>
          <el-step title="商品参数"></el-step>
          <el-step title="商品属性"></el-step>
          <el-step title="商品图片"></el-step>
          <el-step title="商品内容"></el-step>
          <el-step title="完成"></el-step>
        </el-steps>
        <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" label-position="top">
          <el-tabs v-model="activeStep" :tab-position="'left'" :before-leave="beforeTabLeave" @tab-click="tabClick">
            <el-tab-pane label="基本信息" name="0">
              <el-form-item label="商品名称" prop="goods_name">
                <el-input v-model="addForm.goods_name"></el-input>
              </el-form-item>
              <el-form-item label="商品价格" prop="goods_price">
                <el-input v-model="addForm.goods_price" type="number"></el-input>
              </el-form-item>
              <el-form-item label="商品重量" prop="goods_weight">
                <el-input v-model="addForm.goods_weight" type="number"></el-input>
              </el-form-item>
              <el-form-item label="商品数量" prop="goods_number">
                <el-input v-model="addForm.goods_number" type="number"></el-input>
              </el-form-item>
              <el-form-item label="商品分类" prop="goods_cat">
                <el-cascader
                  v-model="addForm.goods_cat"
                  :options="cateList"
                  :props="{ expandTrigger: 'hover', label: 'cat_name',value: 'cat_id',children: 'children' }"
                  @change="handleChange">
                </el-cascader>
              </el-form-item>
            </el-tab-pane>
            <el-tab-pane label="商品参数" name="1">
              <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
                <el-checkbox-group v-model="item.attr_vals">
                  <el-checkbox :label="val" v-for="(val, index) in item.attr_vals" :key="index" border></el-checkbox>
                </el-checkbox-group>
              </el-form-item>
            </el-tab-pane>
            <el-tab-pane label="商品属性" name="2">
              <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
                <el-input v-model="item.attr_vals"></el-input>
              </el-form-item>
            </el-tab-pane>
            <el-tab-pane label="商品图片" name="3">
              <el-upload
                action="http://127.0.0.1:8888/api/private/v1/upload"
                :on-preview="handlePreview"
                :on-remove="handleRemove"
                list-type="picture"
                :headers="headerObj"
                :on-success="uploadSuccess"
                >
                <el-button size="small" type="primary">点击上传</el-button>
              </el-upload>
            </el-tab-pane>
            <el-tab-pane label="商品内容" name="4">
              <quill-editor v-model="addForm.goods_introduce"></quill-editor>
              <el-button type="primary" @click="addGoods">添加商品</el-button>
            </el-tab-pane>
          </el-tabs>
        </el-form>
<!--        图片预览对话框-->
        <el-dialog
          title="图片预览"
          :visible.sync="picPreviewVisible"
          width="50%">
          <img :src="previewUrl" class="imgclass">
        </el-dialog>
      </el-card>
    </div>
</template>

<script>
import _ from 'lodash'
export default {
  created () {
    this.getCateList()
  },
  data () {
    return {
      activeStep: '0',
      // 表单数据
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        // 选中的商品分类id
        goods_cat: [],
        pics: [],
        goods_introduce: '',
        // 商品的参数（数组），包含 动态参数 和 静态属性
        attrs: []
      },
      addFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ]
      },
      // 分类列表数据
      cateList: [],
      // 动态参数数据
      manyTableData: [],
      // 静态属性列表数据
      onlyTableData: [],
      // 为upload组件设置请求头
      headerObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // 预览图片路径
      previewUrl: '',
      // 是否显示图片预览
      picPreviewVisible: false
    }
  },
  methods: {
    async getCateList () {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取分类列表失败')
      }
      this.cateList = res.data
      console.log(this.cateList)
    },
    // 选择器选择对象改变时调用
    handleChange () {
      console.log(this.addForm.goods_cat)
    },
    // tab栏切换时调用
    beforeTabLeave (activeName, oldActiveName) {
      // console.log('旧的tab栏为' + oldActiveName, '新的tab栏为' + activeName)
      if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.error('请先选择商品分类')
        return false
      }
    },
    // 点击tab栏调用
    async tabClick () {
      if (this.activeStep === '1') {
        // 点击了动态参数面板
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: 'many' } })
        if (res.meta.status !== 200) {
          return this.$message.error('获取动态参数失败')
        }
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(',')
        })
        this.manyTableData = res.data
        console.log(this.manyTableData)
      } else if (this.activeStep === '2') {
        // 点击了静态属性面板
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: 'only' } })
        if (res.meta.status !== 200) {
          return this.$message.error('获取静态属性失败')
        }
        this.onlyTableData = res.data
        console.log(this.onlyTableData)
      }
    },
    // 图片预览回调函数
    handlePreview (file) {
      console.log(file)
      // 1. 获取预览图片路径并同步到data中
      this.previewUrl = file.response.data.url
      // 2. 关闭预览对话框
      this.picPreviewVisible = true
    },
    // 图片移除回调函数
    handleRemove (file) {
      console.log(file)
      // 1.获取图片存储的零食路径
      const picPath = file.response.data.tmp_path
      // 2.查询图片的索引
      const picIndex = this.addForm.pics.findIndex(value => {
        return value.pic === picPath
      })
      // 3.根据索引删除
      this.addForm.pics.splice(picIndex, 1)
      console.log(this.addForm)
    },
    // 图片上传成功时的回调
    uploadSuccess (response) {
      // 将图片临时路径凭借成对象
      const picInfo = {
        pic: response.data.tmp_path
      }
      // push 入addForm的pics数组中
      this.addForm.pics.push(picInfo)
      console.log(this.addForm)
    },
    // 添加商品
    addGoods () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('请填写必要表单项')
        }
        // 执行添加逻辑
        // 深拷贝
        const form = _.cloneDeep(this.addForm)
        form.goods_cat = form.goods_cat.join(',')
        // 处理动态参数
        this.manyTableData.forEach(item => {
          const newInfo = { attr_id: item.attr_id, attr_value: item.attr_vals.join(',') }
          this.addForm.attrs.push(newInfo)
        })
        // 处理静态属性
        this.onlyTableData.forEach(item => {
          const newInfo = { attr_id: item.attr_id, attr_value: item.attr_vals }
          this.addForm.attrs.push(newInfo)
        })
        form.attrs = this.addForm.attrs
        // 发起ajax请求添加商品
        const { data: res } = await this.$http.post('goods', form)
        if (res.meta.status !== 201) {
          return this.$message.error('添加商品失败')
        }
        this.$message.success('添加商品成功')
        this.$router.push('/goods')
        console.log(form)
      })
    }
  },
  computed: {
    // 获取三级分类id
    cateId () {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      }
      return null
    }
  }
}
</script>

<style lang="less" scoped>
  .el-tabs{
    margin-top: 15px;
  }
  .el-steps{
    margin-top: 10px;
  }
  .el-step__title {
    font-size: 12px
  }
  .el-checkbox {
    margin: 0 10px 0 0 !important;
  }
  .imgclass {
    width:100%
  }
</style>
