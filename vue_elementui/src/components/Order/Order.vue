<template>
    <div>
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>订单管理</el-breadcrumb-item>
        <el-breadcrumb-item>订单列表</el-breadcrumb-item>
      </el-breadcrumb>
      <el-card>
        <el-row>
          <el-col :span="8">
            <el-input placeholder="请输入内容">
              <el-button slot="append" icon="el-icon-search"></el-button>
            </el-input>
          </el-col>
        </el-row>
        <el-table :data="orderList" border stripe>
          <el-table-column type="index" label="#"></el-table-column>
          <el-table-column prop="order_number" label="订单编号"></el-table-column>
          <el-table-column prop="order_price" label="订单价格"></el-table-column>
          <el-table-column prop="order_pay" label="是否付款">
            <template v-slot="scope">
              <el-tag type="success" v-if="scope.row.order_pay === '1'">已付款</el-tag>
              <el-tag type="danger" v-else>未付款</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="is_send" label="是否发货"></el-table-column>
          <el-table-column prop="create_time" label="下单时间">
            <template v-slot="scope">
              {{scope.row.create_time | dateFormat}}
            </template>
          </el-table-column>
          <el-table-column label="操作">
<!--            eslint-disable-next-line-->
            <template v-slot="scope">
              <el-button type="primary" icon="el-icon-edit" size="mini" @click="showAddress"></el-button>
              <el-button type="success" icon="el-icon-location" size="mini" @click="showProgress"></el-button>
            </template>
          </el-table-column>
        </el-table>
<!--        分页区域-->
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryInfo.pagenum"
          :page-sizes="[5, 10, 15, 20]"
          :page-size="queryInfo.pagesize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
        </el-pagination>
<!--        修改地址对话框-->
        <el-dialog
          title="修改地址"
          :visible.sync="addressVisible"
          width="50%" @close="closeAddress">
          <el-form :model="addressForm" :rules="addressFormRules" ref="addressFormRef" label-width="100px">
            <el-form-item label="省市区/县" prop="address1">
              <el-cascader
                v-model="addressForm.address1"
                :options="cityOptions"
                :props="{ expandTrigger: 'hover' }"
                ></el-cascader>
            </el-form-item>
            <el-form-item label="详细地址" prop="address2">
              <el-input v-model="addressForm.address2"></el-input>
            </el-form-item>
          </el-form>
          <span slot="footer" class="dialog-footer">
            <el-button @click="addressVisible = false">取 消</el-button>
            <el-button type="primary" @click="addressVisible = false">确 定</el-button>
          </span>
        </el-dialog>
        <el-dialog
          title="提示"
          :visible.sync="progressVisible"
          width="50%"
          >
          <el-timeline>
            <el-timeline-item
              v-for="(activity, index) in progressInfo"
              :key="index"
              :timestamp="activity.time">
              {{activity.context}}
            </el-timeline-item>
          </el-timeline>
        </el-dialog>
      </el-card>
    </div>
</template>

<script>
import cityOptions from '../../assets/js/city_data2017_element'
export default {
  created () {
    this.getGoodsList()
  },
  data () {
    return {
      // 订单数据
      orderList: [],
      // 订单数据查询参数
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      // 订单数据总条数
      total: 0,
      // 控制修改地址对话框的显示
      addressVisible: false,
      addressForm: {
        address1: [],
        address2: ''
      },
      addressFormRules: {
        address1: [
          { required: true, message: '请输入省市区/县名称', trigger: 'blur' }
        ],
        address2: [
          { required: true, message: '请输入详细地址', trigger: 'blur' }
        ]
      },
      // 全国省市区数据
      cityOptions,
      // 显示物流信息
      progressVisible: false,
      progressInfo: []
    }
  },
  methods: {
    // 获取订单数据
    async getGoodsList () {
      const { data: res } = await this.$http.get('orders', { params: this.queryInfo })
      if (res.meta.status !== 200) {
        return this.$message.error('获取订单数据失败')
      }
      console.log(res.data)
      this.orderList = res.data.goods
      this.total = res.data.total
    },
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getGoodsList()
    },
    handleCurrentChange (currentPage) {
      this.queryInfo.pagenum = currentPage
    },
    // 显示修改的地址对话框
    showAddress () {
      this.addressVisible = true
    },
    // 关闭修改地址对话框回调
    closeAddress () {
      this.$refs.addressFormRef.resetFields()
    },
    async showProgress () {
      const { data: res } = await this.$http.get('http://localhost:8080/wuliu')
      if (res.meta.status !== 200) {
        return this.$message.error('获取物流信息失败')
      }
      this.progressInfo = res.data
      console.log(this.progressInfo)
      this.progressVisible = true
    }
  }
}
</script>

<style lang="less" scoped>
.el-pagination {
  margin-top: 15px;
}
</style>
