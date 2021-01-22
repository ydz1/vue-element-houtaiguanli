<template>
    <div>
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>权限管理</el-breadcrumb-item>
        <el-breadcrumb-item>角色列表</el-breadcrumb-item>
      </el-breadcrumb>
      <el-card>
        <el-row>
          <el-col>
            <el-button type="primary" @click="addRolesDialog">添加角色</el-button>
          </el-col>
        </el-row>
<!--        主体区域-->
        <el-table :data="rolesList" border stripe>
          <el-table-column type="expand">
            <template v-slot="scope">
              <el-row v-for="(item1) in scope.row.children" :key="item1.id" class="v-center">
                <el-col :span="5">
                  <el-tag closable @close="removeTagsById(scope.row,item1.id)">{{item1.authName}}</el-tag>
                  <i class="el-icon-caret-right"></i>
                </el-col>
                <el-col :span="19">
                  <el-row v-for="(item2) in item1.children" :key="item2.id" class="el-clearTop el-clearBottom v-center" >
                    <el-col :span="6">
                      <el-tag type="success" closable @close="removeTagsById(scope.row,item2.id)">{{item2.authName}}</el-tag>
                      <i class="el-icon-caret-right"></i>
                    </el-col>
                    <el-col :span="13">
                      <el-tag v-for="(item3) in item2.children" :key="item3.id" type="warning" closable @close="removeTagsById(scope.row,item3.id)">{{item3.authName}}</el-tag>
                    </el-col>
                  </el-row>
                </el-col>
              </el-row>
<!--              <pre>{{scope.row}}</pre>-->
            </template>
          </el-table-column>
          <el-table-column type="index"></el-table-column>
          <el-table-column label="角色名称" prop="roleName"></el-table-column>
          <el-table-column label="角色秒述" prop="roleDesc"></el-table-column>
          <el-table-column label="操作" width="300">
            <template v-slot="scope">
              <el-button type="primary" icon="el-icon-edit" size="mini" @click="editRoles(scope.row.id)">编辑</el-button>
              <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteRoles(scope.row.id)">删除</el-button>
              <el-button type="warning" icon="el-icon-setting" size="mini" @click="showSetRightsDialog(scope.row)">分配权限</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
<!--      添加角色对话框-->
      <el-dialog title="添加角色" :visible.sync="showAddRolesDialog" width="70%">
        <el-form :model="addRolesForm" ref="addRolesForm" label-width="80px">
          <el-form-item label="角色名称">
            <el-input v-model="addRolesForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述">
            <el-input v-model="addRolesForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="showAddRolesDialog = false">取 消</el-button>
          <el-button type="primary" @click="addRoles">确 定</el-button>
        </span>
      </el-dialog>
<!--      修改角色对话框-->
      <el-dialog title="修改角色" :visible.sync="showEditRolesDialog" width="70%">
        <el-form ref="editRolesForm" :model="editRolesForm" label-width="80px">
          <el-form-item label="角色名称">
            <el-input v-model="editRolesForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述">
            <el-input v-model="editRolesForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="showEditRolesDialog = false">取 消</el-button>
          <el-button type="primary" @click="editRolesDetail">确 定</el-button>
        </span>
      </el-dialog>
<!--      分配权限对话框-->
      <el-dialog
        title="提示"
        :visible.sync="showSetRightsDialogVisible"
        width="70%" @close="clearRightsDialog">
        <el-tree :data="rightsList" :props="treeProps" show-checkbox node-key="id" default-expand-all :default-checked-keys="defKeys" ref="treeRef"></el-tree>
        <span slot="footer" class="dialog-footer">
          <el-button @click="showSetRightsDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="allotRights">确 定</el-button>
        </span>
      </el-dialog>
    </div>

</template>

<script>
export default {
  data () {
    return {
      // 角色数据列表
      rolesList: [],
      // 显示添加角色对话框
      showAddRolesDialog: false,
      // 添加角色对话框的表单
      addRolesForm: {},
      // 显示修改角色对话框
      showEditRolesDialog: false,
      // 修改角色对话框表单数据
      editRolesForm: {},
      // 控制显示修改权限对话框
      showSetRightsDialogVisible: false,
      // 所有的权限数据
      rightsList: [],
      // 树形控件的属性绑定对象
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      // 默认选中的权限
      defKeys: [],
      // 即将被修改权限的角色id
      roleId: ''
    }
  },
  created () {
    this.getRolesList()
  },
  methods: {
    // 获取角色数据列表
    async getRolesList () {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message().error('获取角色数据失败')
      }
      this.rolesList = res.data
      console.log(this.rolesList)
    },
    // 控制添加角色对话框是否显示
    addRolesDialog () {
      this.showAddRolesDialog = true
    },
    // 添加角色
    async addRoles () {
      const { data: res } = await this.$http.post('roles', this.addRolesForm)
      console.log(res)
      if (res.meta.status !== 201) {
        this.$message.error('添加角色失败')
      }
      this.$message.success('添加角色成功')
      this.showAddRolesDialog = false
      this.getRolesList()
    },
    // 修改角色(查询角色信息)
    async editRoles (id) {
      this.showEditRolesDialog = true
      const { data: res } = await this.$http.get('roles/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('查询角色数据失败')
      }
      this.editRolesForm = res.data
      console.log(this.editRolesForm)
    },
    // 修改角色,(改变角色信息)
    async editRolesDetail () {
      const { data: res } = await this.$http.put('roles/' + this.editRolesForm.roleId, { roleName: this.editRolesForm.roleName, roleDesc: this.editRolesForm.roleDesc })
      if (res.meta.status !== 200) {
        return this.$message.error('修改角色失败')
      }
      this.$message.success('修改角色成功')
      this.showEditRolesDialog = false
      this.getRolesList()
    },
    // 删除角色
    async deleteRoles (id) {
      const state = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (state !== 'confirm') {
        return this.$message.info('已取消删除操作')
      }
      const { data: res } = await this.$http.delete('roles/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('删除角色信息失败')
      }
      this.$message.success('删除角色信息成功')
      this.getRolesList()
    },
    // 删除权限标签
    async removeTagsById (role, rightId) {
      const removeMessage = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (removeMessage !== 'confirm') {
        return this.$message.info('已取消权限删除')
      }
      const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除权限失败')
      }
      role.children = res.data
    },
    // 显示分配权限对话框
    async showSetRightsDialog (role) {
      this.roleId = role.id
      // 获取权限列表
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error('权限列表请求失败')
      }
      this.rightsList = res.data
      console.log(this.rightsList)
      // 递归获取三级权限
      this.getLeafKeys(role, this.defKeys)
      this.showSetRightsDialogVisible = true
    },
    // 通过递归的方式，获取角色下所有三级权限的id，并保存到defKeys数组中
    getLeafKeys (node, arr) {
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => this.getLeafKeys(item, arr))
    },
    // 每次关闭权限对话框时重置defKeys
    clearRightsDialog () {
      this.defKeys = []
    },
    // 分配权限
    async allotRights () {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const idStr = keys.join(',')
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: idStr })
      if (res.meta.status !== 200) {
        return this.$message.error('分配权限失败')
      }
      this.$message.success('分配权限成功')
      this.getRolesList()
      this.showSetRightsDialogVisible = false
    }
  }
}
</script>

<style lang="less" scoped>
  .el-row{
    border-bottom: 1px solid #eee;
  }
  .el-row:first-of-type {
    border-top: 1px solid #eee
  }
  .el-clearTop:first-of-type{
    border-top:none
  }
  .el-clearBottom:last-of-type{
    border-bottom:none
  }
</style>
