<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row :gutter="20">
        <el-col :span="7">
          <el-input placeholder="请输入内容" v-model="getUser.query" clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click='addDialogVisible = true '>添加用户</el-button>
        </el-col>
      </el-row>
      <!--        用户列表区域-->
      <el-table :data="userList" border stripe>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态">
          <template v-slot="toggle">
            <el-switch v-model="toggle.row.mg_state" @change="changeUserState(toggle.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <!--            eslint-disable-next-line-->
          <template v-slot="scope">
            <el-tooltip effect="dark" content="修改" placement="top" :enterable="false">
              <el-button type='primary' icon="el-icon-edit" size="mini" @click="editDialogShow(scope.row.id)"></el-button>
            </el-tooltip>
            <el-tooltip effect="dark" content="删除" placement="top" :enterable="false">
              <el-button type='danger' icon="el-icon-delete" size="mini" @click="deleteUserById(scope.row.id)"></el-button>
            </el-tooltip>
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button type='warning' icon="el-icon-setting" size="mini" @click="setRole(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!--        分页区域-->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="getUser.pagenum"
        :page-sizes="[1, 2, 5, 7]"
        :page-size="getUser.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
      <!--        添加用户信息的对话框-->
      <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close="resetDialogForm">
        <!--          对话框主体区域-->
        <el-form :model="dialogForm" :rules="dialogFormRules" label-width="70px" ref="addDialogForm">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="dialogForm.username"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="dialogForm.password"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="dialogForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机号" prop="mobile">
            <el-input v-model="dialogForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <!--          对话框底部区域-->
        <span slot="footer" class="dialog-footer">
            <el-button @click="addDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="checkValidate">确 定</el-button>
          </span>
      </el-dialog>
      <!--        修改用户信息的对话框-->
      <el-dialog
        title="提示"
        :visible.sync="editDialogVisible"
        width="50%" @close="resetEditForm">
        <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
          <el-form-item label="用户名">
            <el-input v-model="editForm.username" disabled></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="editForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机号" prop="mobile">
            <el-input v-model="editForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="checkEditDialogForm">确 定</el-button>
        </span>
      </el-dialog>
<!--      分配角色对话框-->
      <el-dialog
        title="提示"
        :visible.sync="setRolesDialogVisible"
        width="50%" @close="clearRoleDialog">
        <div>
          <p>当前的用户:{{userInfo.username}}</p>
          <p>当前的角色:{{userInfo.role_name}}</p>
          <p>分配新角色:</p>
            <el-select v-model="selectedRoleId" placeholder="请选择">
              <el-option
                v-for="item in roleList"
                :key="item.id"
                :label="item.roleName"
                :value="item.id">
              </el-option>
            </el-select>
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button @click="setRolesDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  data () {
    const checkEmail = (rule, value, cb) => {
      const emailArr = /^(\w)+(\.\w+)*@(\w)+((\.\w{2,3}){1,3})$/
      if (emailArr.test(value)) {
        // 合法邮箱
        return cb()
      }
      cb(new Error('不合法的邮箱'))
    }
    const checkMobile = (rule, value, cb) => {
      const mobileArr = /^1[3|4|5|8][0-9]\d{4,8}$/
      if (mobileArr.test(value)) {
        // 合法手机号
        return cb()
      }
      cb(new Error('不合法的手机号'))
    }
    return {
      // 获取用户信息的参数
      getUser: {
        query: '',
        // 当前页码
        pagenum: 1,
        // 每页显示条数
        pagesize: 2
      },
      // 控制添加用户的对话框是否显现
      addDialogVisible: false,
      // 控制修改用户信息的对话框是否显现
      editDialogVisible: false,
      // 对话框表单的数据绑定
      dialogForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 修改用户信息对话框的表单信息
      editForm: {},
      // 修改用户信息对话框的验证规则
      editFormRules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入电话号码', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      // 对话框表单的验证的规则
      dialogFormRules: {
        username: [
          { required: true, message: '请输入用户名称', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱名称', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      userList: [],
      total: 0,
      // 控制分配角色对话框是否显示
      setRolesDialogVisible: false,
      // 需要配分配角色的用户信息
      userInfo: {},
      // 获取的角色列表
      roleList: [],
      selectedRoleId: ''
    }
  },
  created () {
    this.getUserList()
  },
  methods: {
    async getUserList () {
      const { data: res } = await this.$http.get('users', { params: this.getUser })
      console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户列表失败')
      }
      this.userList = res.data.users
      this.total = res.data.total
    },
    handleSizeChange (size) {
      this.getUser.pagesize = size
      this.getUserList()
    },
    handleCurrentChange (current) {
      this.getUser.pagenum = current
      this.getUserList()
    },
    // 改变状态并同步到数据库中
    async changeUserState (changeState) {
      const { data: res } = await this.$http.put(`users/${changeState.id}/state/${changeState.mg_state}`)
      // console.log(res)
      if (res.meta.status !== 200) {
        changeState.mg_state = !changeState.mg_state
        return this.$message.error('数据修改失败')
      }
      this.$message.success('数据修改成功')
    },
    // 关闭对话框时重置对话框表单
    resetDialogForm () {
      this.$refs.addDialogForm.resetFields()
    },
    // 确定添加表单时的表单总体校验
    checkValidate () {
      this.$refs.addDialogForm.validate(async valid => {
        console.log(valid)
        if (!valid) {
          return
        }
        // 可以调用后台api实现用户的添加操作
        const { data: res } = await this.$http.post('users', this.dialogForm)
        if (res.meta.status !== 201) {
          return this.$message.error('添加用户失败')
        }
        this.$message.success('添加用户成功')
        // 关闭添加用户对话框
        this.addDialogVisible = false
        // 重新渲染数据
        this.getUserList()
      })
    },
    // 显示修改对话框
    async editDialogShow (userInfo) {
      const { data: res } = await this.$http.get('users/' + userInfo)
      if (res.meta.status !== 200) {
        return this.$message.error('查询用户信息失效')
      }
      this.$message.success('查询用户信息成功')
      this.editForm = res.data
      this.editDialogVisible = true
    },
    // 重置修改用户信息对话框
    resetEditForm () {
      this.$refs.editFormRef.resetFields()
    },
    // 校验修改用户信息表单
    checkEditDialogForm () {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) {
          return
        }
        // 校验成功，可发起异步请求修该数据
        const { data: res } = await this.$http.put('users/' + this.editForm.id, { email: this.editForm.email, mobile: this.editForm.mobile })
        if (res.meta.status !== 200) {
          return this.$message.error('数据修改失败')
        }
        // 关闭对话框
        this.editDialogVisible = false
        // 重新渲染列表
        this.getUserList()
        // 提示修改成功
        this.$message.success('数据修改成功')
      })
    },
    // 根据id删除用户信息
    async deleteUserById (id) {
      const deleteUser = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (deleteUser !== 'confirm') {
        return this.$message.error('已取消删除')
      }
      console.log('hah')
      // 可以进行异步操作删除用户数据
      const { data: res } = await this.$http.delete('users/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('删除失败')
      }
      this.$message.success(res.meta.msg)
      this.getUserList()
    },
    // 控制分配角色对话框是否显现
    async setRole (userInfo) {
      this.userInfo = userInfo
      // 获取所有角色拉列表
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败')
      }
      this.roleList = res.data
      // console.log(this.roleList)
      this.setRolesDialogVisible = true
    },
    async saveRoleInfo () {
      if (!this.selectedRoleId) {
        return this.$message.error('请选择要分配的角色')
      }
      const { data: res } = await this.$http.put(`users/${this.userInfo.id}/role`, { rid: this.selectedRoleId })
      if (res.meta.status !== 200) {
        return this.$message.error('分配角色失败')
      }
      this.$message.success('分配角色成功')
      this.getUserList()
      this.setRolesDialogVisible = false
    },
    // 关闭分配用户对话框时重置userinfo和selectedRoleId
    clearRoleDialog () {
      this.selectedRoleId = ''
      this.userInfo = {}
    }
  }
}
</script>

<style lang="less" scoped>

</style>
