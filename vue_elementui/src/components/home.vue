<template>
    <el-container class="home-container">
<!--      头部区域-->
      <el-header>
        <div>
          <img src="../assets/logo.png" width="50" height="50" alt="">
          <span>电商后台管理系统</span>
        </div>
        <el-button type="danger" @click="loginOut">退出</el-button>
      </el-header>
<!--      页面主体区域-->
      <el-container>
<!--        侧边栏区域-->
        <el-aside :width="isCollapse?'64px':'200px'">
          <div class="toggleButton" @click="toggleCollapse">|||</div>
<!--          侧边栏菜单区-->
          <el-menu
            background-color="#333744"
            text-color="#fff"
            active-text-color="#409EFF" unique-opened :collapse="isCollapse" :collapse-transition="false" router :default-active="activePath">
<!--            一级菜单-->
            <el-submenu :index="item.id+''" v-for="(item) in menuList" :key="item.id">
<!--              模板-->
              <template slot="title">
<!--                图标-->
                <i :class="iconList[item.id]"></i>
<!--                文本-->
                <span>{{item.authName}}</span>
              </template>
<!--              二级菜单-->
              <el-menu-item :index="'/'+subItem.path" v-for="subItem in item.children" :key="subItem.id"  @click="changeActive(('/'+subItem.path))">
                <template slot="title">
                  <i class="el-icon-menu"></i>
                  <span>{{subItem.authName}}</span>
                </template>
              </el-menu-item>
            </el-submenu>
          </el-menu>
        </el-aside>
<!--        右侧内容主题-->
        <el-main>
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>
</template>

<script>
export default {
  data () {
    return {
      menuList: [],
      iconList: { 125: 'el-icon-user-solid', 103: 'el-icon-lock', 101: 'el-icon-s-goods', 102: 'el-icon-document', 145: 'el-icon-s-comment' },
      isCollapse: false,
      // 被激活的路由地址
      activePath: ''
    }
  },
  created () {
    this.getMenuList()
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  methods: {
    // 将激活的路径保存到sessionStorage中,并同步到状态里
    changeActive (activePath) {
      window.sessionStorage.setItem('activePath', activePath)
      this.activePath = activePath
    },
    loginOut () {
      // 退出登陆时清除token
      window.sessionStorage.clear()
      // 跳转到登录界面
      this.$router.push('/login')
    },
    async getMenuList () {
      const { data: res } = await this.$http.get('menus')
      // console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.menuList = res.data
    },
    // 点击实现是否折叠侧边栏
    toggleCollapse () {
      this.isCollapse = !this.isCollapse
    }
  }
}
</script>

<style lang="less" scoped>
  .home-container{
    height: 100%;
  }
  .el-header{
    background-color: #373d41;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-left: 0;
    color:#fff;
    font-size: 20px;
    > div {
      display: flex;
      align-items: center;
      > span {
        margin-left: 15px;
      }
    }
  }
  .el-aside{
    background-color: #333744;
    > .toggleButton{
      background-color: #4A5064;
      font-size: 10px;
      line-height: 24px;
      color:#fff;
      text-align: center;
      letter-spacing: 0.2em;
      cursor:pointer
    }
    > .el-menu{
      border-right: none
    }
  }
  .el-main{
    background-color: #EAEDF1;
  }
</style>
